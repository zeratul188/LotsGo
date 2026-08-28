import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminDB } from "@/utiils/firebaseAdmin";
import { getAuthenticatedMemberSession } from "@/lib/serverSession";

type StoredDiscordConnection = {
    userId?: unknown,
    username?: unknown,
    globalName?: unknown,
    avatar?: unknown,
    connectedAt?: unknown
}

function toISOString(value: unknown): string | null {
    if (value instanceof Date) return value.toISOString();
    if (value && typeof (value as { toDate?: unknown }).toDate === "function") {
        return (value as { toDate: () => Date }).toDate().toISOString();
    }
    return null;
}

export async function GET(req: NextRequest) {
    try {
        const session = await getAuthenticatedMemberSession(req);
        if (!session) {
            return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
        }

        const discord = session.memberData.discord as StoredDiscordConnection | undefined;
        if (!discord || typeof discord.userId !== "string") {
            return NextResponse.json({ linked: false });
        }

        const connectionSnapshot = await adminDB.collection("discordConnections").doc(discord.userId).get();
        if (!connectionSnapshot.exists || connectionSnapshot.data()?.lotsgoUserId !== session.userId) {
            return NextResponse.json({ linked: false });
        }

        return NextResponse.json({
            linked: true,
            user: {
                id: discord.userId,
                username: typeof discord.username === "string" ? discord.username : "",
                globalName: typeof discord.globalName === "string" ? discord.globalName : null,
                avatar: typeof discord.avatar === "string" ? discord.avatar : null,
                connectedAt: toISOString(discord.connectedAt)
            }
        });
    } catch (error) {
        console.error("Failed to load Discord connection", error);
        return NextResponse.json({ error: "Discord 연동 정보를 불러오지 못했습니다." }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const origin = req.headers.get("origin");
        if (origin && origin !== req.nextUrl.origin) {
            return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 403 });
        }

        const session = await getAuthenticatedMemberSession(req);
        if (!session) {
            return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
        }

        await adminDB.runTransaction(async transaction => {
            const memberSnapshot = await transaction.get(session.memberRef);
            if (!memberSnapshot.exists) throw new Error("MEMBER_NOT_FOUND");

            const discord = memberSnapshot.data()?.discord as StoredDiscordConnection | undefined;
            const discordUserId = typeof discord?.userId === "string" ? discord.userId : "";
            if (!discordUserId) return;

            const connectionRef = adminDB.collection("discordConnections").doc(discordUserId);
            const connectionSnapshot = await transaction.get(connectionRef);
            if (connectionSnapshot.exists && connectionSnapshot.data()?.lotsgoUserId === session.userId) {
                transaction.delete(connectionRef);
            }
            transaction.update(session.memberRef, {
                discord: FieldValue.delete()
            });
        });

        return NextResponse.json({ message: "Discord 연동을 해제했습니다." });
    } catch (error) {
        console.error("Failed to unlink Discord account", error);
        return NextResponse.json({ error: "Discord 연동을 해제하지 못했습니다." }, { status: 500 });
    }
}
