import 'server-only';

import type { NextRequest } from "next/server";

const DISCORD_API_BASE = "https://discord.com/api/v10";
const DISCORD_CALLBACK_PATH = "/api/integrations/discord/callback";
const DISCORD_LOGIN_CALLBACK_PATH = "/api/auth/discord/callback";

export type DiscordUser = {
    id: string,
    username: string,
    global_name: string | null,
    avatar: string | null
}

export type DiscordOAuthConfig = {
    clientId: string,
    clientSecret: string,
    redirectUri: string
}

export type DiscordOAuthTokens = {
    accessToken: string,
    refreshToken: string,
    expiresIn: number,
    scope: string
}

export type DiscordAuthorization = {
    user: DiscordUser,
    tokens: DiscordOAuthTokens
}

export function getDiscordOAuthConfig(req: NextRequest): DiscordOAuthConfig {
    const clientId = process.env.DISCORD_CLIENT_ID?.trim();
    const clientSecret = process.env.DISCORD_CLIENT_SECRET?.trim();
    const configuredRedirectUri = process.env.DISCORD_REDIRECT_URI?.trim();
    const isLocal = req.nextUrl.hostname === "localhost" || req.nextUrl.hostname === "127.0.0.1";
    const redirectUri = isLocal
        ? `${req.nextUrl.origin}${DISCORD_CALLBACK_PATH}`
        : configuredRedirectUri;

    if (!clientId || !clientSecret || !redirectUri) {
        throw new Error("DISCORD_CONFIGURATION_ERROR");
    }

    return { clientId, clientSecret, redirectUri };
}

export function getDiscordLoginOAuthConfig(req: NextRequest): DiscordOAuthConfig {
    const clientId = process.env.DISCORD_CLIENT_ID?.trim();
    const clientSecret = process.env.DISCORD_CLIENT_SECRET?.trim();
    const configuredRedirectUri = process.env.DISCORD_LOGIN_REDIRECT_URI?.trim();
    const isLocal = req.nextUrl.hostname === "localhost" || req.nextUrl.hostname === "127.0.0.1";
    const redirectUri = isLocal
        ? `${req.nextUrl.origin}${DISCORD_LOGIN_CALLBACK_PATH}`
        : configuredRedirectUri ?? `${req.nextUrl.origin}${DISCORD_LOGIN_CALLBACK_PATH}`;

    if (!clientId || !clientSecret || !redirectUri) {
        throw new Error("DISCORD_LOGIN_CONFIGURATION_ERROR");
    }

    return { clientId, clientSecret, redirectUri };
}

export function createDiscordAuthorizationUrl(
    config: DiscordOAuthConfig,
    state: string,
    prompt: "consent" | null = "consent",
    scopes: string[] = ["identify"]
): string {
    const url = new URL("https://discord.com/oauth2/authorize");
    url.searchParams.set("client_id", config.clientId);
    url.searchParams.set("response_type", "code");
    url.searchParams.set("redirect_uri", config.redirectUri);
    url.searchParams.set("scope", scopes.join(" "));
    url.searchParams.set("state", state);
    if (prompt) url.searchParams.set("prompt", prompt);
    return url.toString();
}

async function loadDiscordUser(accessToken: string): Promise<DiscordUser> {
    const userResponse = await fetch(`${DISCORD_API_BASE}/users/@me`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        cache: "no-store",
        signal: AbortSignal.timeout(10_000)
    });

    if (!userResponse.ok) throw new Error("DISCORD_USER_LOAD_FAILED");

    const user = await userResponse.json() as Partial<DiscordUser>;
    if (
        typeof user.id !== "string"
        || !/^\d{17,20}$/.test(user.id)
        || typeof user.username !== "string"
    ) {
        throw new Error("DISCORD_USER_INVALID");
    }

    return {
        id: user.id,
        username: user.username,
        global_name: typeof user.global_name === "string" ? user.global_name : null,
        avatar: typeof user.avatar === "string" ? user.avatar : null
    };
}

export async function getDiscordAuthorizationByCode(
    config: DiscordOAuthConfig,
    code: string
): Promise<DiscordAuthorization> {
    const tokenResponse = await fetch(`${DISCORD_API_BASE}/oauth2/token`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
            client_id: config.clientId,
            client_secret: config.clientSecret,
            grant_type: "authorization_code",
            code,
            redirect_uri: config.redirectUri
        }),
        cache: "no-store",
        signal: AbortSignal.timeout(10_000)
    });

    if (!tokenResponse.ok) throw new Error("DISCORD_TOKEN_EXCHANGE_FAILED");

    const tokenData = await tokenResponse.json() as {
        access_token?: unknown,
        refresh_token?: unknown,
        expires_in?: unknown,
        scope?: unknown
    };
    const accessToken = typeof tokenData.access_token === "string" ? tokenData.access_token : "";
    const refreshToken = typeof tokenData.refresh_token === "string" ? tokenData.refresh_token : "";
    const expiresIn = typeof tokenData.expires_in === "number" ? tokenData.expires_in : 0;
    if (!accessToken || !refreshToken || expiresIn <= 0) {
        throw new Error("DISCORD_TOKEN_EXCHANGE_FAILED");
    }

    return {
        user: await loadDiscordUser(accessToken),
        tokens: {
            accessToken,
            refreshToken,
            expiresIn,
            scope: typeof tokenData.scope === "string" ? tokenData.scope : ""
        }
    };
}

export async function refreshDiscordAuthorization(
    config: DiscordOAuthConfig,
    refreshToken: string
): Promise<DiscordOAuthTokens> {
    const response = await fetch(`${DISCORD_API_BASE}/oauth2/token`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
            client_id: config.clientId,
            client_secret: config.clientSecret,
            grant_type: "refresh_token",
            refresh_token: refreshToken
        }),
        cache: "no-store",
        signal: AbortSignal.timeout(10_000)
    });
    if (!response.ok) throw new Error("DISCORD_TOKEN_REFRESH_FAILED");

    const tokenData = await response.json() as {
        access_token?: unknown,
        refresh_token?: unknown,
        expires_in?: unknown,
        scope?: unknown
    };
    if (
        typeof tokenData.access_token !== "string"
        || typeof tokenData.refresh_token !== "string"
        || typeof tokenData.expires_in !== "number"
    ) {
        throw new Error("DISCORD_TOKEN_REFRESH_FAILED");
    }
    return {
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        expiresIn: tokenData.expires_in,
        scope: typeof tokenData.scope === "string" ? tokenData.scope : ""
    };
}

export async function getDiscordUserByAuthorizationCode(
    config: DiscordOAuthConfig,
    code: string
): Promise<DiscordUser> {
    return (await getDiscordAuthorizationByCode(config, code)).user;
}
