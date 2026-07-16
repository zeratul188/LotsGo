import { CheckCharacter, ChecklistItem } from "@/app/store/checklistSlice";
import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";

const JWT_SECRET = process.env.LOSTARK_JWT_SECRET!;

type AccessTokenPayload = {
    id: string,
    sessionId: string
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const authHeader = req.headers.get('authorization');
        if (!authHeader?.startsWith('Bearer ')) throw new Error('UNAUTHORIZED');

        let decoded: AccessTokenPayload;
        try {
            decoded = jwt.verify(authHeader.slice(7), JWT_SECRET) as AccessTokenPayload;
        } catch {
            throw new Error('UNAUTHORIZED');
        }

        const { adminDB } = await import("@/utiils/firebaseAdmin");
        const sessionSnapshot = await adminDB.collection('sessions').doc(decoded.sessionId).get();
        const session = sessionSnapshot.data();
        if (!sessionSnapshot.exists || session?.revoked || session?.userId !== decoded.id || body.id !== decoded.id) {
            throw new Error('UNAUTHORIZED');
        }

        const nickname = typeof body.nickname === 'string' ? body.nickname : '';
        const bossId = typeof body.bossId === 'string' ? body.bossId : '';
        const completionType = body.completionType === 'all' ? 'all' : 'stage';
        const stage = Number(body.stage);
        if (!nickname || !bossId || (completionType === 'stage' && (!Number.isInteger(stage) || stage < 1))) {
            return NextResponse.json({ error: '올바르지 않은 자동 체크 요청입니다.' }, { status: 400 });
        }

        const [bossSnapshot, memberSnapshot] = await Promise.all([
            adminDB.collection('boss').doc(bossId).get(),
            adminDB.collection('members').where('id', '==', decoded.id).limit(1).get()
        ]);
        if (!bossSnapshot.exists) {
            return NextResponse.json({ error: '레이드 정보를 찾을 수 없습니다.' }, { status: 404 });
        }
        if (memberSnapshot.empty) {
            return NextResponse.json({ error: '사용자 정보를 찾을 수 없습니다.' }, { status: 404 });
        }

        const bossName = typeof bossSnapshot.data()?.name === 'string' ? bossSnapshot.data()!.name : '';
        const memberRef = memberSnapshot.docs[0].ref;
        let changed = false;
        let checklistItem: any = null;

        await adminDB.runTransaction(async (transaction) => {
            const memberDocument = await transaction.get(memberRef);
            const rawStoredChecklist = memberDocument.data()?.checklist;
            const storedChecklist = Array.isArray(rawStoredChecklist)
                ? rawStoredChecklist.map((character: CheckCharacter) => ({
                    ...character,
                    checklist: Array.isArray(character.checklist)
                        ? character.checklist.map((entry) => ({
                            ...entry,
                            items: Array.isArray(entry.items)
                                ? entry.items.map((item) => ({ ...item }))
                                : []
                        }))
                        : []
                }))
                : [];
            const characterIndex = storedChecklist.findIndex((item: CheckCharacter) => item.nickname === nickname);
            if (characterIndex === -1) throw new Error('CHARACTER_NOT_FOUND');

            const checklistIndex = storedChecklist[characterIndex].checklist.findIndex((item) => item.name === bossName);
            if (checklistIndex === -1) throw new Error('RAID_NOT_FOUND');

            checklistItem = storedChecklist[characterIndex].checklist[checklistIndex];
            if (completionType === 'stage'
                && !checklistItem.items.some((item: ChecklistItem) => item.stage === stage && !item.isDisable)) {
                throw new Error('STAGE_NOT_FOUND');
            }

            checklistItem.items = checklistItem.items.map((item: ChecklistItem) => {
                const shouldCheck = !item.isDisable && (completionType === 'all' || item.stage === stage);
                if (!shouldCheck || item.isCheck) return item;
                changed = true;
                return { ...item, isCheck: true };
            });
            if (changed) transaction.update(memberRef, { checklist: storedChecklist });
        });

        return NextResponse.json({
            message: changed ? 'Automatic checklist saved.' : 'Checklist already completed.',
            changed,
            nickname,
            contentName: bossName,
            checklistItem
        }, { status: 200 });
    } catch (error) {
        const message = error instanceof Error ? error.message : '';
        if (message === 'UNAUTHORIZED') {
            return NextResponse.json({ error: '로그인 정보가 유효하지 않습니다.' }, { status: 401 });
        }
        if (message === 'CHARACTER_NOT_FOUND') {
            return NextResponse.json({ error: '캐릭터를 찾을 수 없습니다.' }, { status: 404 });
        }
        if (message === 'RAID_NOT_FOUND') {
            return NextResponse.json({ error: '캐릭터의 레이드 체크리스트를 찾을 수 없습니다.' }, { status: 404 });
        }
        if (message === 'STAGE_NOT_FOUND') {
            return NextResponse.json({ error: '체크할 관문을 찾을 수 없습니다.' }, { status: 404 });
        }
        console.error(error);
        return NextResponse.json({ error: `레이드 자동 체크 저장 실패: ${message || 'Unknown database error.'}` }, { status: 500 });
    }
}
