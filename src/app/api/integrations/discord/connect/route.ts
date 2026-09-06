import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import {
    createDiscordAuthorizationUrl,
    getDiscordOAuthConfig,
    getDiscordUserByAccessToken,
    refreshDiscordAuthorization
} from "@/lib/discord";
import { getLotsGoCookieDomain } from "@/lib/auth";
import { getAuthenticatedMemberSession } from "@/lib/serverSession";
import { adminDB } from "@/utiils/firebaseAdmin";
import { decryptDiscordToken, encryptDiscordToken } from "@/lib/discordGuild";

const OAUTH_COOKIE = "discordOAuthState";

type StoredDiscordOAuth = {
    accessToken?: unknown,
    refreshToken?: unknown,
    expiresAt?: unknown
};

function toDate(value: unknown): Date | null {
    if (value instanceof Date) return value;
    if (value && typeof (value as { toDate?: unknown }).toDate === "function") {
        return (value as { toDate: () => Date }).toDate();
    }
    return null;
}

function redirectToSetting(req: NextRequest, returnTo: string, result: string): NextResponse {
    const target = new URL(returnTo, req.url);
    target.searchParams.set("discord", result);
    return NextResponse.redirect(target);
}

async function refreshDiscordProfileWithoutOAuth(
    req: NextRequest,
    session: Awaited<ReturnType<typeof getAuthenticatedMemberSession>>,
    returnTo: string
): Promise<NextResponse | null> {
    if (!session) return null;

    const currentDiscord = session.memberData.discord;
    const discordUserId = typeof currentDiscord?.userId === "string" ? currentDiscord.userId : "";
    if (!discordUserId) return null;

    const connectionRef = adminDB.collection("discordConnections").doc(discordUserId);
    const snapshot = await connectionRef.get();
    const data = snapshot.data();
    const oauth = data?.oauth as StoredDiscordOAuth | undefined;
    if (!snapshot.exists || data?.lotsgoUserId !== session.userId || !oauth) return null;

    try {
        const config = getDiscordOAuthConfig(req);
        const expiresAt = toDate(oauth.expiresAt);
        let accessToken: string;
        let refreshedTokens: Awaited<ReturnType<typeof refreshDiscordAuthorization>> | null = null;

        if (expiresAt && expiresAt.getTime() > Date.now() + 60_000) {
            accessToken = decryptDiscordToken(oauth.accessToken);
        } else {
            refreshedTokens = await refreshDiscordAuthorization(config, decryptDiscordToken(oauth.refreshToken));
            accessToken = refreshedTokens.accessToken;
        }

        const discordUser = await getDiscordUserByAccessToken(accessToken);
        const now = new Date();
        const profile = {
            userId: discordUser.id,
            username: discordUser.username,
            globalName: discordUser.global_name,
            avatar: discordUser.avatar,
            updatedAt: now
        };
        const connectionUpdate = refreshedTokens
            ? {
                ...profile,
                oauth: {
                    accessToken: encryptDiscordToken(refreshedTokens.accessToken),
                    refreshToken: encryptDiscordToken(refreshedTokens.refreshToken),
                    expiresAt: new Date(now.getTime() + refreshedTokens.expiresIn * 1000),
                    scope: refreshedTokens.scope,
                    updatedAt: now
                }
            }
            : profile;

        await adminDB.runTransaction(async transaction => {
            const memberSnapshot = await transaction.get(session.memberRef);
            if (!memberSnapshot.exists) throw new Error("MEMBER_NOT_FOUND");
            const memberDiscord = memberSnapshot.data()?.discord;
            if (memberDiscord?.userId !== discordUserId) throw new Error("DISCORD_CONNECTION_MISMATCH");

            transaction.update(connectionRef, connectionUpdate);
            transaction.update(session.memberRef, { discord: { ...memberDiscord, ...profile } });
        });

        return redirectToSetting(req, returnTo, "refreshed");
    } catch (error) {
        // 기존 연결에 토큰이 없거나 토큰이 폐기된 경우 일반 OAuth 재승인으로 fallback합니다.
        console.warn("Silent Discord profile refresh unavailable", error);
        return null;
    }
}

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

        if (mode === "refresh") {
            const silentResponse = await refreshDiscordProfileWithoutOAuth(req, session, returnTo);
            if (silentResponse) return silentResponse;
        }

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
