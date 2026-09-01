import { FieldValue } from "firebase-admin/firestore";
import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDB } from "@/utiils/firebaseAdmin";
import { getAuthenticatedMemberSession } from "@/lib/serverSession";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json().catch(() => ({})) as { idToken?: unknown };
        if (typeof body.idToken !== "string" || !body.idToken) {
            return NextResponse.json({ error: "본인 인증이 필요합니다." }, { status: 401 });
        }
        const decodedToken = await adminAuth.verifyIdToken(body.idToken);
        const authTime = typeof decodedToken.auth_time === "number" ? decodedToken.auth_time : 0;
        if (!authTime || Date.now() / 1000 - authTime > 10 * 60) {
            return NextResponse.json({ error: "본인 인증 시간이 만료되었습니다." }, { status: 401 });
        }

        const session = await getAuthenticatedMemberSession(req);
        if (!session) {
            return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
        }
        if (session.memberData.uid !== decodedToken.uid) {
            return NextResponse.json({ error: "회원 인증 정보가 일치하지 않습니다." }, { status: 403 });
        }

        const memberRef = session.memberRef;
        const memberData = session.memberData;
        const discordUserId = typeof memberData.discord?.userId === "string"
            ? memberData.discord.userId
            : "";

        await adminDB.runTransaction(async transaction => {
            const [memberSnapshot, raidSnapshot, sessionSnapshot, linkedConnectionSnapshot, guildAuthorizationSnapshot] = await Promise.all([
                transaction.get(memberRef),
                transaction.get(adminDB.collection("raids").where("members", "array-contains", session.userId)),
                transaction.get(adminDB.collection("sessions").where("userId", "==", session.userId)),
                transaction.get(adminDB.collection("discordConnections").where("lotsgoUserId", "==", session.userId)),
                transaction.get(adminDB.collection("discordGuildAuthorizations").where("lotsgoUserId", "==", session.userId))
            ]);
            if (!memberSnapshot.exists) throw new Error("ID_NOT_FOUND");

            raidSnapshot.docs.forEach(raidDoc => {
                transaction.update(raidDoc.ref, {
                    members: FieldValue.arrayRemove(session.userId)
                });
            });
            sessionSnapshot.docs.forEach(sessionDoc => transaction.delete(sessionDoc.ref));
            linkedConnectionSnapshot.docs.forEach(connectionDoc => transaction.delete(connectionDoc.ref));
            guildAuthorizationSnapshot.docs.forEach(authorizationDoc => transaction.delete(authorizationDoc.ref));
            if (discordUserId && !linkedConnectionSnapshot.docs.some(connectionDoc => connectionDoc.id === discordUserId)) {
                transaction.delete(adminDB.collection("discordConnections").doc(discordUserId));
            }
            transaction.delete(memberRef);
        });

        const response = NextResponse.json({ message: "데이터 처리가 정상적으로 처리되었습니다." });
        response.cookies.set({
            name: "refreshToken",
            value: "",
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 0
        });
        return response;
    } catch (error) {
        if (typeof error === "object" && error !== null && "code" in error && String(error.code).startsWith("auth/")) {
            return NextResponse.json({ error: "본인 인증에 실패했습니다." }, { status: 401 });
        }
        if (error instanceof Error && error.message === "ID_NOT_FOUND") {
            return NextResponse.json({ error: "회원정보를 찾을 수 없습니다." }, { status: 404 });
        }
        console.error("Failed to delete member account", error);
        return NextResponse.json({ error: "회원 탈퇴 처리 중 오류가 발생했습니다." }, { status: 500 });
    }
}
