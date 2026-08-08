import { adminDB } from '@/utiils/firebaseAdmin';
import { decrypt } from '@/utiils/crypto';
import { loadHoningMaterialPriceData } from '@/app/addons/honing/lib/honingMaterialApi';
import { loadHoningMaterialPrices } from '@/app/addons/honing/lib/honingMaterialServer';
import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';

const JWT_SECRET = process.env.LOSTARK_JWT_SECRET!;
const SECRET_KEY = process.env.NEXT_PUBLIC_SECRET_KEY ?? 'null';

export async function GET() {
    try {
        return NextResponse.json({ data: await loadHoningMaterialPrices() });
    } catch (error) {
        console.error('Failed to load shared honing material prices', error);
        return NextResponse.json({ data: null }, { status: 502 });
    }
}

async function getAuthenticatedUserId(req: NextRequest): Promise<string> {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) throw new Error('UNAUTHORIZED');

    let payload: { id?: string; sessionId?: string };
    try {
        payload = jwt.verify(authHeader.slice(7), JWT_SECRET) as { id?: string; sessionId?: string };
    } catch {
        throw new Error('UNAUTHORIZED');
    }

    if (!payload.id || !payload.sessionId) throw new Error('UNAUTHORIZED');
    const session = await adminDB.collection('sessions').doc(payload.sessionId).get();
    const sessionData = session.data();
    const expiresAt = typeof sessionData?.expiresAt?.toDate === 'function'
        ? sessionData.expiresAt.toDate()
        : new Date(sessionData?.expiresAt);
    if (!session.exists || sessionData?.revoked || sessionData?.userId !== payload.id || expiresAt <= new Date()) {
        throw new Error('UNAUTHORIZED');
    }
    return payload.id;
}

export async function POST(req: NextRequest) {
    try {
        const userId = await getAuthenticatedUserId(req);
        const memberSnapshot = await adminDB.collection('members').where('id', '==', userId).limit(1).get();
        if (memberSnapshot.empty) throw new Error('MEMBER_NOT_FOUND');

        const encryptedApiKey = memberSnapshot.docs[0].data().apiKey;
        if (typeof encryptedApiKey !== 'string' || !encryptedApiKey) throw new Error('API_KEY_REQUIRED');
        const apiKey = decrypt(encryptedApiKey, SECRET_KEY);
        if (!apiKey) throw new Error('API_KEY_REQUIRED');

        return NextResponse.json({ data: await loadHoningMaterialPriceData(apiKey) });
    } catch (error) {
        const message = error instanceof Error ? error.message : '';
        if (message === 'UNAUTHORIZED') return NextResponse.json({ code: 'UNAUTHORIZED', error: '로그인이 필요합니다.' }, { status: 401 });
        if (message === 'API_KEY_REQUIRED') return NextResponse.json({ code: 'API_KEY_REQUIRED', error: '로스트아크 API 키 등록이 필요합니다.' }, { status: 403 });
        if (message === 'MEMBER_NOT_FOUND') return NextResponse.json({ code: 'MEMBER_NOT_FOUND', error: '사용자 정보를 찾을 수 없습니다.' }, { status: 404 });
        if (axiosErrorStatus(error) === 401) return NextResponse.json({ code: 'INVALID_API_KEY', error: '등록된 API 키가 유효하지 않습니다.' }, { status: 502 });
        console.error('Failed to refresh honing material prices', error);
        return NextResponse.json({ code: 'HONING_PRICE_REFRESH_FAILED', error: '재련 재료 시세를 갱신하지 못했습니다.' }, { status: 502 });
    }
}

function axiosErrorStatus(error: unknown): number | null {
    if (!error || typeof error !== 'object') return null;
    const response = (error as { response?: { status?: unknown } }).response;
    return typeof response?.status === 'number' ? response.status : null;
}
