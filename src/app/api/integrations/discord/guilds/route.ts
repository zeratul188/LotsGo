import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedMemberSession } from "@/lib/serverSession";
import { getManageableDiscordGuilds } from "@/lib/discordGuild";

export async function GET(req: NextRequest) {
    try {
        const session = await getAuthenticatedMemberSession(req);
        if (!session) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
        return NextResponse.json(await getManageableDiscordGuilds(req, session));
    } catch (error) {
        const code = error instanceof Error ? error.message : "";
        if (code === "DISCORD_GUILD_AUTH_REQUIRED") {
            return NextResponse.json({
                error: "Discord 서버 관리 권한 승인이 필요합니다.",
                code
            }, { status: 403 });
        }
        if (code === "DISCORD_BOT_TOKEN_MISSING") {
            return NextResponse.json({ error: "Discord 봇 환경설정이 필요합니다." }, { status: 503 });
        }
        console.error("Failed to load manageable Discord guilds", error);
        return NextResponse.json({ error: "Discord 서버 목록을 불러오지 못했습니다." }, { status: 500 });
    }
}
