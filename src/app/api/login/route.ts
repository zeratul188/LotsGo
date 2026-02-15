import { NextRequest, NextResponse } from "next/server";
import { firestore } from "@/utiils/firebase";
import { isMatchValue } from "@/utiils/bcrypt";
import type { Character } from "@/app/store/loginSlice";
import { addDoc, collection, getDocs, limit, query, Timestamp, where } from "firebase/firestore";
import { generateRefreshToken, hashToken, signAccessToken } from "@/lib/auth";
import { getClientIp } from "./loginFeat";

export type User = {
    id: string,
    password: string,
    email: string,
    expeditions: Array<Character>,
    nickname: string,
    apiKey: string | null
}

export async function POST(req: NextRequest) {
    const { id, password } = await req.json();

    try {
        const memberQuery = query(collection(firestore, 'members'), where('id', '==', id), limit(1));
        const memberSnapshot = await getDocs(memberQuery);

        if (memberSnapshot.empty) throw new Error("NOT_FOUND_ID");

        const targetDoc = memberSnapshot.docs[0];
        const userData: User = !memberSnapshot.empty ? {
            id: targetDoc.data().id,
            password: targetDoc.data().password,
            email: targetDoc.data().email,
            expeditions: targetDoc.data().expeditions,
            nickname: targetDoc.data().character,
            apiKey: targetDoc.data().apiKey ? targetDoc.data().apiKey : null
        } : {
            id: "",
            password: "",
            email: '',
            expeditions: [],
            nickname: "",
            apiKey: null
        }

        if (!(await isMatchValue(password, userData.password))) {
            throw new Error("NOT_MATCH_PASSWORD");
        }

        const expedition: Array<Character> = !memberSnapshot.empty ? userData.expeditions : [];

        const refreshToken = generateRefreshToken();
        const refreshHash = hashToken(refreshToken);
        const now = new Date();

        const nowTimestamp = Timestamp.now();
        const deleteAfter = Timestamp.fromMillis(nowTimestamp.toMillis() + 45 * 24 * 60 * 60 * 1000);

        const ipAddress = getClientIp(req);

        const session = await addDoc(collection(firestore, 'sessions'), {
            userId: userData.id,
            refreshTokenHash: refreshHash,
            createdAt: now,
            lastUsedAt: now,
            expiresAt: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
            revoked: false,
            ipAddress,
            deleteAfter
        });

        const isAdministrator: boolean = targetDoc.data().isAdministrator ?? false;
        const accessToken = signAccessToken({ id: userData.id, sessionId: session.id, isAdministrator: isAdministrator });
        const res = NextResponse.json({ accessToken, userData, expedition });

        res.cookies.set({
            name: "refreshToken",
            value: refreshToken,
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 60 * 24 * 30
        })

        return res;
    } catch(e: any) {
        if (e.message === "NOT_FOUND_ID") {
            return NextResponse.json({ type: 'id', error: '해당 ID를 가진 회원 정보가 존재하지 않습니다.' }, { status: 400 });
        }
        if (e.message === "NOT_MATCH_PASSWORD") {
            return NextResponse.json({ type: 'password', error: '비밀번호가 일치하지 않습니다.' }, { status: 400 });
        }
        return NextResponse.json({ type: 'null', error: '데이터 처리 중 문제가 발생하였습니다.' }, { status: 500 });
    }
}