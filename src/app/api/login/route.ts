import { NextRequest, NextResponse } from "next/server";
import { firestore } from "@/utiils/firebase";
import type { Character } from "@/app/store/loginSlice";
import { addDoc, collection, doc, getDocs, limit, query, Timestamp, updateDoc, where } from "firebase/firestore";
import { generateRefreshToken, hashToken, signAccessToken } from "@/lib/auth";
import { getClientIp } from "./loginFeat";
import { adminAuth } from "@/utiils/firebaseAdmin";
import { decrypt } from "@/utiils/crypto";

const secretKey = process.env.NEXT_PUBLIC_SECRET_KEY ? process.env.NEXT_PUBLIC_SECRET_KEY : "null";

export type User = {
    id: string,
    email: string,
    expeditions: Array<Character>,
    nickname: string,
    apiKey: string | null,
    isSupporter: boolean
}

export async function POST(req: NextRequest) {
    const { id, idToken } = await req.json();

    try {
        const memberQuery = query(collection(firestore, "members"), where("id", "==", id), limit(1));
        const memberSnapshot = await getDocs(memberQuery);

        if (memberSnapshot.empty) throw new Error("NOT_FOUND_ID");

        const targetDoc = memberSnapshot.docs[0];
        const userData: User = {
            id: targetDoc.data().id,
            email: targetDoc.data().email,
            expeditions: targetDoc.data().expeditions,
            nickname: targetDoc.data().character,
            apiKey: targetDoc.data().apiKey ? targetDoc.data().apiKey : null,
            isSupporter: targetDoc.data().isSupporter === true
        };

        if (typeof idToken !== "string" || !idToken) {
            throw new Error("INVALID_FIREBASE_ID_TOKEN");
        }

        const decodedToken = await adminAuth.verifyIdToken(idToken);
        const memberEmail = decrypt(userData.email, secretKey);
        const storedUid = targetDoc.data().uid;
        if ((storedUid && decodedToken.uid !== storedUid) || decodedToken.email !== memberEmail) {
            throw new Error("INVALID_FIREBASE_ID_TOKEN");
        }
        if (!storedUid) {
            await updateDoc(doc(firestore, "members", targetDoc.id), { uid: decodedToken.uid });
        }

        const refreshToken = generateRefreshToken();
        const refreshHash = hashToken(refreshToken);
        const now = new Date();
        const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        const nowTimestamp = Timestamp.now();
        const deleteAfter = Timestamp.fromMillis(nowTimestamp.toMillis() + 45 * 24 * 60 * 60 * 1000);
        const ipAddress = getClientIp(req);

        const session = await addDoc(collection(firestore, "sessions"), {
            userId: userData.id,
            refreshTokenHash: refreshHash,
            createdAt: now,
            lastUsedAt: now,
            expiresAt,
            revoked: false,
            ipAddress,
            deleteAfter
        });

        const isAdministrator: boolean = targetDoc.data().isAdministrator ?? false;
        const accessToken = signAccessToken({ id: userData.id, sessionId: session.id, isAdministrator });
        const res = NextResponse.json({
            accessToken,
            userData,
            expedition: userData.expeditions,
            sessionExpiresAt: expiresAt.toISOString()
        });

        res.cookies.set({
            name: "refreshToken",
            value: refreshToken,
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 60 * 24 * 30
        });

        return res;
    } catch (error: any) {
        if (error.message === "NOT_FOUND_ID") {
            return NextResponse.json({ type: "id", error: "해당 ID를 가진 회원 정보가 존재하지 않습니다." }, { status: 400 });
        }
        if (error.message === "INVALID_FIREBASE_ID_TOKEN") {
            return NextResponse.json({ type: "password", error: "Firebase 인증 정보가 유효하지 않습니다." }, { status: 401 });
        }
        return NextResponse.json({ type: "null", error: "데이터 처리 중 문제가 발생했습니다." }, { status: 500 });
    }
}
