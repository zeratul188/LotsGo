import { hashToken, signAccessToken } from "@/lib/auth";
import { firestore } from "@/utiils/firebase";
import { collection, getDocs, limit, query, updateDoc, where } from "firebase/firestore";
import { NextRequest, NextResponse } from "next/server";
import { User } from "../../login/route";

function clearRefreshCookie(res: NextResponse) {
    res.cookies.set({
        name: "refreshToken",
        value: "",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 0
    });
    return res;
}

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
        if (Number.isNaN(expiresAt.getTime()) || expiresAt <= new Date()) throw new Error("EXPIRED_TOKEN");

        const memberQuery = query(collection(firestore, 'members'), where('id', '==', session.userId), limit(1));
        const memberSnapshot = await getDocs(memberQuery);
        if (memberSnapshot.empty) throw new Error("MEMBER_IS_EMPTY");

        const targetDoc = memberSnapshot.docs[0];
        const userData: User = {
            id: targetDoc.data().id,
            password: targetDoc.data().password,
            email: targetDoc.data().email,
            expeditions: targetDoc.data().expeditions,
            nickname: targetDoc.data().character,
            apiKey: targetDoc.data().apiKey ? targetDoc.data().apiKey : null
        };
        const isAdministrator: boolean = targetDoc.data().isAdministrator ?? false;

        const accessToken = signAccessToken({ id: session.userId, sessionId: sessionDoc.id, isAdministrator });
        await updateDoc(sessionDoc.ref, { lastUsedAt: new Date() });
        return NextResponse.json({ accessToken, userData, sessionExpiresAt: expiresAt.toISOString() });
    } catch(e: any) {
        if (e.message === "TOKEN_IS_UNDEFINED") {
            return NextResponse.json({ type: 'null', code: 'MISSING_REFRESH_TOKEN', error: '저장된 토큰이 없습니다.' }, { status: 401 });
        }
        if (e.message === "TOKEN_IS_EMPTY") {
            return clearRefreshCookie(NextResponse.json({ type: 'logout', code: 'INVALID_REFRESH_TOKEN', error: '토큰을 찾을 수 없습니다.' }, { status: 401 }));
        }
        if (e.message === "EXPIRED_TOKEN") {
            return clearRefreshCookie(NextResponse.json({ type: 'logout', code: 'EXPIRED_REFRESH_TOKEN', error: '로그인 시간이 만료되었습니다. 다시 로그인해주세요.' }, { status: 401 }));
        }
        if (e.message === "MEMBER_IS_EMPTY") {
            return clearRefreshCookie(NextResponse.json({ type: 'null', code: 'MEMBER_NOT_FOUND', error: '회원을 찾을 수 없습니다.' }, { status: 404 }));
        }
        return NextResponse.json({ type: 'null', code: 'REFRESH_FAILED', error: '데이터 처리 중 문제가 발생했습니다.' }, { status: 500 });
    }
}
