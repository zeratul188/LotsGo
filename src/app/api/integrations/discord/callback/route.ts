import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { adminDB } from "@/utiils/firebaseAdmin";
import { getDiscordOAuthConfig, getDiscordUserByAuthorizationCode } from "@/lib/discord";
import { getAuthenticatedMemberSession } from "@/lib/serverSession";

const OAUTH_COOKIE = "discordOAuthState";

type OAuthCookie = {
    state: string,
    sessionId: string,
    mode: "connect" | "refresh",
    returnTo: string
}

function redirectToSetting(req: NextRequest, result: string, returnTo = "/setting?tab=discord"): NextResponse {
    const target = new URL(returnTo, req.url);
    target.searchParams.set("discord", result);
    const response = NextResponse.redirect(target);
    response.cookies.set({
        name: OAUTH_COOKIE,
        value: "",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/api/integrations/discord",
        maxAge: 0
    });
    return response;
}

function parseOAuthCookie(value: string | undefined): OAuthCookie | null {
    if (!value) return null;
    try {
        const parsed = JSON.parse(Buffer.from(value, "base64url").toString("utf8")) as Partial<OAuthCookie>;
        if (typeof parsed.state !== "string" || typeof parsed.sessionId !== "string") return null;
        return {
            state: parsed.state,
            sessionId: parsed.sessionId,
            mode: parsed.mode === "refresh" ? "refresh" : "connect",
            returnTo: typeof parsed.returnTo === "string" && parsed.returnTo.startsWith("/") && !parsed.returnTo.startsWith("//")
                ? parsed.returnTo
                : "/setting?tab=discord"
        };
    } catch {
        return null;
    }
}

function statesMatch(expected: string, received: string): boolean {
    const expectedBuffer = Buffer.from(expected);
    const receivedBuffer = Buffer.from(received);
    return expectedBuffer.length === receivedBuffer.length
        && crypto.timingSafeEqual(expectedBuffer, receivedBuffer);
}

export async function GET(req: NextRequest) {
    const oauthError = req.nextUrl.searchParams.get("error");
    if (oauthError) return redirectToSetting(req, oauthError === "access_denied" ? "cancelled" : "oauth-error");

    const code = req.nextUrl.searchParams.get("code") ?? "";
    const state = req.nextUrl.searchParams.get("state") ?? "";
    const oauthCookie = parseOAuthCookie(req.cookies.get(OAUTH_COOKIE)?.value);

    try {
        const session = await getAuthenticatedMemberSession(req);
        if (!session) return redirectToSetting(req, "session-error");
        if (
            !code
            || !state
            || !oauthCookie
            || oauthCookie.sessionId !== session.sessionId
            || !statesMatch(oauthCookie.state, state)
        ) {
            return redirectToSetting(req, "state-error");
        }

        const config = getDiscordOAuthConfig(req);
        const discordUser = await getDiscordUserByAuthorizationCode(config, code);
        const connectionRef = adminDB.collection("discordConnections").doc(discordUser.id);
        const now = new Date();

        await adminDB.runTransaction(async transaction => {
            const memberSnapshot = await transaction.get(session.memberRef);
            const connectionSnapshot = await transaction.get(connectionRef);
            if (!memberSnapshot.exists) throw new Error("MEMBER_NOT_FOUND");

            const memberData = memberSnapshot.data();
            const currentDiscord = memberData?.discord;
            const currentDiscordId = typeof currentDiscord?.userId === "string"
                ? currentDiscord.userId
                : "";

            if (oauthCookie.mode === "refresh" && currentDiscordId !== discordUser.id) {
                throw new Error("DISCORD_REFRESH_NOT_LINKED");
            }
            if (currentDiscordId && currentDiscordId !== discordUser.id) {
                throw new Error("LOTSGO_ALREADY_LINKED");
            }
            if (connectionSnapshot.exists && connectionSnapshot.data()?.lotsgoUserId !== session.userId) {
                throw new Error("DISCORD_ALREADY_LINKED");
            }

            const connectedAt = currentDiscord?.connectedAt ?? connectionSnapshot.data()?.connectedAt ?? now;
            const discord = {
                userId: discordUser.id,
                username: discordUser.username,
                globalName: discordUser.global_name,
                avatar: discordUser.avatar,
                connectedAt,
                updatedAt: now
            };

            transaction.set(connectionRef, {
                lotsgoUserId: session.userId,
                memberDocumentId: session.memberRef.id,
                provider: "discord",
                schemaVersion: 1,
                ...discord
            });
            transaction.update(session.memberRef, { discord });
        });

        return redirectToSetting(req, oauthCookie.mode === "refresh" ? "refreshed" : "connected", oauthCookie.returnTo);
    } catch (error) {
        const message = error instanceof Error ? error.message : "";
        if (message === "LOTSGO_ALREADY_LINKED") return redirectToSetting(req, "lotsgo-already-linked");
        if (message === "DISCORD_ALREADY_LINKED") return redirectToSetting(req, "discord-already-linked");
        if (message === "DISCORD_REFRESH_NOT_LINKED") return redirectToSetting(req, "not-linked");
        console.error("Failed to complete Discord OAuth", error);
        return redirectToSetting(req, "callback-error");
    }
}
