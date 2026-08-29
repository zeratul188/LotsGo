import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { Timestamp } from "firebase-admin/firestore";
import { adminDB } from "@/utiils/firebaseAdmin";
import { generateRefreshToken, hashToken } from "@/lib/auth";
import { getDiscordLoginOAuthConfig, getDiscordUserByAuthorizationCode } from "@/lib/discord";
import { getClientIp } from "@/app/api/login/loginFeat";
import { createDiscordSignupIntent, getDiscordSignupIntent, setDiscordSignupCookie } from "@/lib/discordSignup";

const OAUTH_COOKIE = "discordLoginOAuthState";

type OAuthCookie = {
    state: string,
    returnTo: string
}

function getSafeReturnTo(value: unknown): string {
    return typeof value === "string" && value.startsWith("/") && !value.startsWith("//")
        ? value
        : "/";
}

function parseOAuthCookie(value: string | undefined): OAuthCookie | null {
    if (!value) return null;
    try {
        const parsed = JSON.parse(Buffer.from(value, "base64url").toString("utf8")) as Partial<OAuthCookie>;
        if (typeof parsed.state !== "string") return null;
        return {
            state: parsed.state,
            returnTo: getSafeReturnTo(parsed.returnTo)
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

function redirectToLogin(req: NextRequest, result: string): NextResponse {
    const response = NextResponse.redirect(new URL(`/login?discord=${result}`, req.url));
    clearOAuthCookie(response);
    return response;
}

function clearOAuthCookie(response: NextResponse) {
    response.cookies.set({
        name: OAUTH_COOKIE,
        value: "",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/api/auth/discord",
        maxAge: 0
    });
}

export async function GET(req: NextRequest) {
    const oauthError = req.nextUrl.searchParams.get("error");
    if (oauthError) return redirectToLogin(req, oauthError === "access_denied" ? "cancelled" : "oauth-error");

    const code = req.nextUrl.searchParams.get("code") ?? "";
    const state = req.nextUrl.searchParams.get("state") ?? "";
    const oauthCookie = parseOAuthCookie(req.cookies.get(OAUTH_COOKIE)?.value);

    try {
        if (!code || !state || !oauthCookie || !statesMatch(oauthCookie.state, state)) {
            return redirectToLogin(req, "state-error");
        }

        const config = getDiscordLoginOAuthConfig(req);
        const discordUser = await getDiscordUserByAuthorizationCode(config, code);
        const connectionRef = adminDB.collection("discordConnections").doc(discordUser.id);
        const initialConnectionSnapshot = await connectionRef.get();
        if (!initialConnectionSnapshot.exists) {
            const previousIntent = await getDiscordSignupIntent(req);
            if (previousIntent) await previousIntent.ref.delete().catch(() => undefined);
            const signupToken = await createDiscordSignupIntent(discordUser);
            const response = NextResponse.redirect(new URL("/signup/discord", req.url));
            setDiscordSignupCookie(response, signupToken);
            clearOAuthCookie(response);
            return response;
        }

        const initialConnection = initialConnectionSnapshot.data();
        const lotsgoUserId = typeof initialConnection?.lotsgoUserId === "string"
            ? initialConnection.lotsgoUserId
            : "";
        const memberDocumentId = typeof initialConnection?.memberDocumentId === "string"
            ? initialConnection.memberDocumentId
            : "";
        if (!lotsgoUserId || !memberDocumentId) return redirectToLogin(req, "not-linked");

        const memberRef = adminDB.collection("members").doc(memberDocumentId);
        const sessionRef = adminDB.collection("sessions").doc();
        const refreshToken = generateRefreshToken();
        const now = new Date();
        const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        const deleteAfter = new Date(now.getTime() + 45 * 24 * 60 * 60 * 1000);

        await adminDB.runTransaction(async transaction => {
            const connectionSnapshot = await transaction.get(connectionRef);
            const memberSnapshot = await transaction.get(memberRef);
            if (!connectionSnapshot.exists || !memberSnapshot.exists) throw new Error("DISCORD_CONNECTION_NOT_FOUND");

            const connection = connectionSnapshot.data();
            const member = memberSnapshot.data();
            if (!connection || !member) throw new Error("DISCORD_CONNECTION_NOT_FOUND");
            if (
                connection.lotsgoUserId !== lotsgoUserId
                || connection.memberDocumentId !== memberDocumentId
                || member.id !== lotsgoUserId
                || member.discord?.userId !== discordUser.id
            ) {
                throw new Error("DISCORD_CONNECTION_MISMATCH");
            }

            const updatedAt = now;
            transaction.update(connectionRef, {
                username: discordUser.username,
                globalName: discordUser.global_name,
                avatar: discordUser.avatar,
                updatedAt,
                lastAuthenticatedAt: updatedAt
            });
            transaction.update(memberRef, {
                "discord.username": discordUser.username,
                "discord.globalName": discordUser.global_name,
                "discord.avatar": discordUser.avatar,
                "discord.updatedAt": updatedAt,
                "discord.lastAuthenticatedAt": updatedAt
            });
            transaction.set(sessionRef, {
                userId: lotsgoUserId,
                refreshTokenHash: hashToken(refreshToken),
                createdAt: now,
                lastUsedAt: now,
                expiresAt,
                revoked: false,
                ipAddress: getClientIp(req),
                deleteAfter: Timestamp.fromDate(deleteAfter),
                authProvider: "discord",
                discordUserId: discordUser.id
            });
        });

        const completionUrl = new URL("/auth/discord/complete", req.url);
        completionUrl.searchParams.set("returnTo", oauthCookie.returnTo);
        const response = NextResponse.redirect(completionUrl);
        response.cookies.set({
            name: "refreshToken",
            value: refreshToken,
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 60 * 24 * 30
        });
        clearOAuthCookie(response);
        return response;
    } catch (error) {
        const message = error instanceof Error ? error.message : "";
        if (message === "DISCORD_CONNECTION_NOT_FOUND" || message === "DISCORD_CONNECTION_MISMATCH") {
            return redirectToLogin(req, "not-linked");
        }
        console.error("Failed to complete Discord login", error);
        return redirectToLogin(req, "callback-error");
    }
}
