import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { createDiscordAuthorizationUrl, getDiscordOAuthConfig } from "@/lib/discord";
import { getLotsGoCookieDomain } from "@/lib/auth";
import { getAuthenticatedMemberSession } from "@/lib/serverSession";

const OAUTH_COOKIE = "discordOAuthState";

export async function GET(req: NextRequest) {
    try {
        const session = await getAuthenticatedMemberSession(req);
        if (!session) {
            return NextResponse.redirect(new URL("/login?returnTo=%2Fsetting%3Ftab%3Ddiscord", req.url));
        }

        const state = crypto.randomBytes(32).toString("base64url");
        const requestedMode = req.nextUrl.searchParams.get("mode");
        const mode = requestedMode === "refresh"
            ? "refresh"
            : requestedMode === "guilds"
                ? "guilds"
                : "connect";
        const requestedReturnTo = req.nextUrl.searchParams.get("returnTo");
        const returnTo = requestedReturnTo?.startsWith("/") && !requestedReturnTo.startsWith("//")
            ? requestedReturnTo
            : "/setting?tab=discord";
        const cookieValue = Buffer.from(JSON.stringify({
            state,
            sessionId: session.sessionId,
            mode,
            returnTo
        })).toString("base64url");
        const config = getDiscordOAuthConfig(req);
        const response = NextResponse.redirect(createDiscordAuthorizationUrl(
            config,
            state,
            mode === "refresh" ? null : "consent",
            mode === "guilds" ? ["identify", "guilds"] : ["identify"]
        ));

        response.cookies.set({
            name: OAUTH_COOKIE,
            value: cookieValue,
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/api/integrations/discord",
            domain: getLotsGoCookieDomain(req.nextUrl.hostname),
            maxAge: 60 * 10
        });
        const refreshToken = req.cookies.get("refreshToken")?.value;
        if (refreshToken) {
            // 기존 호스트 전용 세션도 www 콜백에서 사용할 수 있도록 공유 쿠키로 승격합니다.
            response.cookies.set({
                name: "refreshToken",
                value: refreshToken,
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                path: "/",
                domain: getLotsGoCookieDomain(req.nextUrl.hostname),
                maxAge: 60 * 60 * 24 * 30
            });
        }
        return response;
    } catch (error) {
        console.error("Failed to start Discord OAuth", error);
        return NextResponse.redirect(new URL("/setting?tab=discord&discord=configuration-error", req.url));
    }
}
