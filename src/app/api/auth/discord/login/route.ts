import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { createDiscordAuthorizationUrl, getDiscordLoginOAuthConfig } from "@/lib/discord";

const OAUTH_COOKIE = "discordLoginOAuthState";

function getSafeReturnTo(value: string | null): string {
    return value?.startsWith("/") && !value.startsWith("//") ? value : "/";
}

export async function GET(req: NextRequest) {
    try {
        const state = crypto.randomBytes(32).toString("base64url");
        const returnTo = getSafeReturnTo(req.nextUrl.searchParams.get("returnTo"));
        const cookieValue = Buffer.from(JSON.stringify({ state, returnTo })).toString("base64url");
        const config = getDiscordLoginOAuthConfig(req);
        const response = NextResponse.redirect(createDiscordAuthorizationUrl(config, state, null));

        response.cookies.set({
            name: OAUTH_COOKIE,
            value: cookieValue,
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/api/auth/discord",
            maxAge: 60 * 10
        });
        return response;
    } catch (error) {
        console.error("Failed to start Discord login", error);
        return NextResponse.redirect(new URL("/login?discord=configuration-error", req.url));
    }
}
