import { hashToken } from "@/lib/auth";
import { firestore } from "@/utiils/firebase";
import { collection, doc, getDoc, getDocs, limit, query, Timestamp, updateDoc, where } from "firebase/firestore";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {{
    try {
        const authHeader = req.headers.get("authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) throw new Error("AUTH_NOT_TYPES");
        const sessionId = authHeader.split(' ')[1];

        const refreshToken = req.cookies.get('refreshToken')?.value;
        if (!refreshToken) throw new Error('TOKEN_IS_UNDEFINED');
        const refreshHash = hashToken(refreshToken);

        const tokenQuery = query(
            collection(firestore, 'sessions'),
            where('refreshTokenHash', '==', refreshHash),
            where('revoked', '==', false),
            limit(1)
        );
        const tokenSnapshot = await getDocs(tokenQuery);
        if (tokenSnapshot.empty) throw new Error("TOKEN_IS_EMPTY");

        const sessionRef = doc(firestore, 'sessions', sessionId);
        const sessionSnapshot = await getDoc(sessionRef);
        if (!sessionSnapshot.exists()) throw new Error("SESSION_NOT_FOUND");

        const sessionData = sessionSnapshot.data();
        return NextResponse.json({ ip: sessionData.ipAddress ?? '-' });
    } catch(e: any) {
        if (e.message === "SESSION_NOT_FOUND") {
            return NextResponse.json({ error: 'API 요청이 잘못되었습니다.' }, { status: 400 });
        }
        if (e.message === "TOKEN_IS_EMPTY") {
            return NextResponse.json({ error: '로그인 정보를 찾을 수 없습니다.' }, { status: 400 });
        }
        return NextResponse.json({ error: '데이터 처리 중 문제가 발생하였습니다.' }, { status: 500 });
    }
}}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const sessionId = body.sessionId;
        console.log(sessionId);

        const refreshToken = req.cookies.get('refreshToken')?.value;
        if (!refreshToken) throw new Error('TOKEN_IS_UNDEFINED');
        const refreshHash = hashToken(refreshToken);

        const tokenQuery = query(
            collection(firestore, 'sessions'),
            where('refreshTokenHash', '==', refreshHash),
            where('revoked', '==', false),
            limit(1)
        );
        const tokenSnapshot = await getDocs(tokenQuery);
        if (tokenSnapshot.empty) throw new Error("TOKEN_IS_EMPTY");

        const now = Timestamp.now();
        const sessionDoc = doc(firestore, 'sessions', sessionId);
        await updateDoc(sessionDoc, { revoked: true, revokedAt: now });
        return NextResponse.json({ revoked: true, revokedAtSeconds: now.seconds }, { status: 200 });
    } catch(e: any) {
        if (e.message === "TOKEN_IS_EMPTY") {
            return NextResponse.json({ error: '로그인 정보를 찾을 수 없습니다.' }, { status: 400 });
        }
        return NextResponse.json({ error: '데이터 처리 중 문제가 발생하였습니다.' }, { status: 500 });
    }
}