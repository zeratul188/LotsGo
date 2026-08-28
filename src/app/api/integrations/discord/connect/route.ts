import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { createDiscordAuthorizationUrl, getDiscordOAuthConfig } from "@/lib/discord";
import { getAuthenticatedMemberSession } from "@/lib/serverSession";

const OAUTH_COOKIE = "discordOAuthState";

export async function GET(req: NextRequest) {
    try {
        const session = await getAuthenticatedMemberSession(req);
        if (!session) {
            return NextResponse.redirect(new URL("/login?returnTo=%2Fsetting%3Ftab%3Ddiscord", req.url));
        }

        const state = crypto.randomBytes(32).toString("base64url");
        const cookieValue = Buffer.from(JSON.stringify({
            state,
            sessionId: session.sessionId
        })).toString("base64url");
        const config = getDiscordOAuthConfig(req);
        const response = NextResponse.redirect(createDiscordAuthorizationUrl(config, state));

        response.cookies.set({
            name: OAUTH_COOKIE,
            value: cookieValue,
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/api/integrations/discord",
            maxAge: 60 * 10
        });
        return response;
    } catch (error) {
        console.error("Failed to start Discord OAuth", error);
        return NextResponse.redirect(new URL("/setting?tab=discord&discord=configuration-error", req.url));
    }
}
