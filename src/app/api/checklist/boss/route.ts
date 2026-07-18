import jwt from "jsonwebtoken";
import { revalidateTag, unstable_cache } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

const JWT_SECRET = process.env.LOSTARK_JWT_SECRET!;

type AdministratorTokenPayload = {
    id: string,
    sessionId: string,
    isAdministrator?: boolean
}

export type Difficulty = {
    difficulty: string,
    stage: number,
    bonus: number,
    level: number,
    isBiweekly: boolean,
    gold: number,
    boundGold: number,
    isOnce: boolean
}

export type Boss = {
    id: string,
    name: string,
    simple: string,
    screenNames?: string[],
    max: number,
    difficulty: Difficulty[]
}

type BossPayload = Omit<Boss, 'id' | 'screenNames'> & {
    screenNames: string[]
}

const getCachedBosses = unstable_cache(async (): Promise<Boss[]> => {
    const { adminDB } = await import("@/utiils/firebaseAdmin");
    const snapshot = await adminDB.collection('boss').get();
    return snapshot.docs.map((document) => ({
        id: document.id,
        name: document.data().name,
        simple: document.data().simple ?? '',
        screenNames: Array.isArray(document.data().screenNames) ? document.data().screenNames : [],
        max: document.data().max ?? 0,
        difficulty: Array.isArray(document.data().difficulty)
            ? document.data().difficulty.map(normalizeDifficulty)
            : []
    }));
}, ['checklist-bosses'], { revalidate: 300, tags: ['checklist-bosses'] });

export async function GET(_req: NextRequest) {
    try {
        const bosses = await getCachedBosses();
        return NextResponse.json(bosses);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: '보스 데이터를 불러오지 못했습니다.' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const authHeader = req.headers.get('authorization');
        if (!authHeader?.startsWith('Bearer ')) throw new Error('UNAUTHORIZED');

        let decoded: AdministratorTokenPayload;
        try {
            decoded = jwt.verify(authHeader.slice(7), JWT_SECRET) as AdministratorTokenPayload;
        } catch {
            throw new Error('UNAUTHORIZED');
        }
        if (!decoded.isAdministrator) throw new Error('FORBIDDEN');

        const body = await req.json();
        const { adminDB } = await import("@/utiils/firebaseAdmin");
        const sessionSnapshot = await adminDB.collection('sessions').doc(decoded.sessionId).get();
        const session = sessionSnapshot.data();
        if (!sessionSnapshot.exists || session?.revoked || session?.userId !== decoded.id) {
            throw new Error('UNAUTHORIZED');
        }

        switch (body.type) {
            case 'add': {
                const boss = parseBossRequest(body);
                await validateScreenNameDuplicates(adminDB, boss.screenNames);
                const addRef = await adminDB.collection('boss').add(boss);
                revalidateTag('checklist-bosses');
                return NextResponse.json({ message: '콘텐츠를 추가했습니다.', id: addRef.id }, { status: 200 });
            }
            case 'edit': {
                if (typeof body.id !== 'string' || !body.id) {
                    return NextResponse.json({ error: '문서 ID가 존재하지 않습니다.' }, { status: 400 });
                }
                const boss = parseBossRequest(body);
                const docRef = adminDB.collection('boss').doc(body.id);
                const snapshot = await docRef.get();
                if (!snapshot.exists) {
                    return NextResponse.json({ error: '수정할 콘텐츠를 찾을 수 없습니다.' }, { status: 404 });
                }
                await validateScreenNameDuplicates(adminDB, boss.screenNames, body.id);
                await docRef.update(boss);
                revalidateTag('checklist-bosses');
                return NextResponse.json({ message: '콘텐츠를 수정했습니다.' }, { status: 200 });
            }
            case 'remove': {
                if (typeof body.id !== 'string' || !body.id) {
                    return NextResponse.json({ error: '문서 ID가 존재하지 않습니다.' }, { status: 400 });
                }
                const docRef = adminDB.collection('boss').doc(body.id);
                const snapshot = await docRef.get();
                if (!snapshot.exists) {
                    return NextResponse.json({ error: '삭제할 콘텐츠를 찾을 수 없습니다.' }, { status: 404 });
                }
                await docRef.delete();
                revalidateTag('checklist-bosses');
                return NextResponse.json({ message: '콘텐츠를 삭제했습니다.' }, { status: 200 });
            }
            default:
                return NextResponse.json({ error: '올바르지 않은 처리 방식입니다.' }, { status: 400 });
        }
    } catch (error) {
        const message = error instanceof Error ? error.message : '';
        if (message === 'UNAUTHORIZED') {
            return NextResponse.json({ error: '로그인 정보가 유효하지 않습니다.' }, { status: 401 });
        }
        if (message === 'FORBIDDEN') {
            return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 });
        }
        if (message === 'INVALID_BOSS') {
            return NextResponse.json({ error: '콘텐츠 입력값을 다시 확인해주세요.' }, { status: 400 });
        }
        if (message === 'DUPLICATED_SCREEN_NAME') {
            return NextResponse.json({ error: '다른 콘텐츠에서 이미 사용 중인 화면 표시 이름이 있습니다.' }, { status: 409 });
        }
        console.error(error);
        return NextResponse.json({ error: '데이터를 처리하는데 오류가 발생했습니다.' }, { status: 500 });
    }
}

function parseBossRequest(body: any): BossPayload {
    const name = typeof body.inputName === 'string' ? body.inputName.trim() : '';
    const simple = typeof body.inputSimple === 'string' ? body.inputSimple.trim() : '';
    const max = Number(body.inputMax);
    const screenNames = Array.isArray(body.screenNames)
        ? Array.from(new Set(body.screenNames
            .map((value: unknown) => typeof value === 'string' ? value.trim() : '')
            .filter(Boolean))) as string[]
        : [];
    const difficulty: Difficulty[] = Array.isArray(body.inputs) ? body.inputs.map(normalizeDifficulty) : [];
    const hasInvalidDifficulty = difficulty.length === 0 || difficulty.some((item) => !item.difficulty
        || !Number.isInteger(item.stage) || item.stage < 0
        || !Number.isFinite(item.bonus) || item.bonus < 0
        || !Number.isFinite(item.level) || item.level < 0
        || !Number.isFinite(item.gold) || item.gold < 0
        || !Number.isFinite(item.boundGold) || item.boundGold < 0);
    if (!name || !Number.isInteger(max) || max < 0 || hasInvalidDifficulty) throw new Error('INVALID_BOSS');
    return { name, simple, screenNames, max, difficulty };
}

function normalizeDifficulty(item: any): Difficulty {
    return {
        difficulty: typeof item?.difficulty === 'string' ? item.difficulty.trim() : '',
        stage: Number(item?.stage ?? 0),
        bonus: Number(item?.bonus ?? 0),
        level: Number(item?.level ?? 0),
        isBiweekly: item?.isBiweekly === true,
        gold: Number(item?.gold ?? 0),
        boundGold: Number(item?.boundGold ?? 0),
        isOnce: item?.isOnce === true
    };
}

async function validateScreenNameDuplicates(adminDB: FirebaseFirestore.Firestore, screenNames: string[], excludedId?: string) {
    if (screenNames.length === 0) return;
    const normalizedNames = new Set(screenNames.map(normalizeScreenName));
    const snapshot = await adminDB.collection('boss').get();
    const hasDuplicate = snapshot.docs.some((document) => document.id !== excludedId
        && (Array.isArray(document.data().screenNames) ? document.data().screenNames : [])
            .some((name: unknown) => typeof name === 'string' && normalizedNames.has(normalizeScreenName(name))));
    if (hasDuplicate) throw new Error('DUPLICATED_SCREEN_NAME');
}

function normalizeScreenName(value: string): string {
    return value.normalize('NFKC').replace(/[^0-9A-Za-z가-힣]/g, '').toLowerCase();
}
