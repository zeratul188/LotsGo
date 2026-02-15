import { hashToken } from "@/lib/auth";
import { firestore } from "@/utiils/firebase";
import { collection, getDocs, limit, query, where } from "firebase/firestore";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
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
        const sessionDoc = tokenSnapshot.docs[0];
        const session = sessionDoc.data();
        const expiresAt: Date = typeof session.expiresAt?.toDate === "function"
            ? session.expiresAt.toDate()
            : new Date(session.expiresAt);
        if (expiresAt < new Date()) throw new Error("EXPIRED_TOKEN");

    } catch(e: any) {
        if (e.message === "TOKEN_IS_UNDEFINED") {
            return NextResponse.json({ type: 'null', error: '저장된 토큰이 없습니다.' }, { status: 400 });
        }
        if (e.message === "TOKEN_IS_EMPTY") {
            return NextResponse.json({ type: 'logout', error: '토큰을 찾을 수 없습니다.' }, { status: 400 });
        }
        if (e.message === "EXPIRED_TOKEN") {
            return NextResponse.json({ type: 'logout', error: '토큰이 만료되었습니다.' }, { status: 400 });
        }
        if (e.message === "MEMBER_IS_EMPTY") {
            return NextResponse.json({ type: 'null', error: '회원을 찾을 수 없습니다.' }, { status: 400 });
        }
        return NextResponse.json({ type: 'null', error: '데이터 처리 중 문제가 발생하였습니다.' }, { status: 500 });
    }
}