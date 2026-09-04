import { getLotsGoCookieDomain, hashToken } from "@/lib/auth";
import { firestore } from "@/utiils/firebase";
import { collection, getDocs, limit, query, Timestamp, updateDoc, where } from "firebase/firestore";
import { NextRequest, NextResponse } from "next/server";

function clearRefreshCookies(res: NextResponse, hostname: string) {
    const cookieOptions = {
        name: "refreshToken",
        value: "",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax" as const,
        path: "/",
        maxAge: 0
    };
    res.cookies.set(cookieOptions);
    const cookieDomain = getLotsGoCookieDomain(hostname);
    if (cookieDomain) {
        res.cookies.set({ ...cookieOptions, domain: cookieDomain });
    }
    return res;
}

export async function POST(req: NextRequest) {
    try {
        const refreshToken = req.cookies.get('refreshToken')?.value;
        if (refreshToken) {
            const refreshHash = hashToken(refreshToken);
            const sessionQuery = query(collection(firestore, 'sessions'), where('refreshTokenHash', '==', refreshHash), limit(1));
            const sessionSnapshot = await getDocs(sessionQuery);
            if (!sessionSnapshot.empty) {
                const sessionRef = sessionSnapshot.docs[0].ref;
                const now = Timestamp.now();
                await updateDoc(sessionRef, { revoked: true, revokedAt: now });
            }
        }

        return clearRefreshCookies(NextResponse.json({ message: 'logout'}), req.nextUrl.hostname);
    } catch(e: any) {
        return clearRefreshCookies(
            NextResponse.json({ error: '데이터 처리 중 문제가 발생하였습니다.' }, { status: 500 }),
            req.nextUrl.hostname
        );
    }
}
