import "server-only";

import crypto from "crypto";
import { promisify } from "util";
import type { NextRequest } from "next/server";
import type { DocumentData } from "firebase-admin/firestore";
import { adminDB } from "@/utiils/firebaseAdmin";
import type { AuthenticatedMemberSession } from "@/lib/serverSession";
import {
    getDiscordOAuthConfig,
    refreshDiscordAuthorization,
    type DiscordOAuthTokens
} from "@/lib/discord";

const DISCORD_API_BASE = "https://discord.com/api/v10";
const ADMINISTRATOR = BigInt(1) << BigInt(3);
const VIEW_CHANNEL = BigInt(1) << BigInt(10);
const SEND_MESSAGES = BigInt(1) << BigInt(11);
const EMBED_LINKS = BigInt(1) << BigInt(14);
const MANAGE_ROLES = BigInt(1) << BigInt(28);
const DANGEROUS_ROLE_PERMISSIONS = ADMINISTRATOR
    | (BigInt(1) << BigInt(1))
    | (BigInt(1) << BigInt(2))
    | (BigInt(1) << BigInt(4))
    | (BigInt(1) << BigInt(5))
    | (BigInt(1) << BigInt(13))
    | (BigInt(1) << BigInt(28))
    | (BigInt(1) << BigInt(29))
    | (BigInt(1) << BigInt(30))
    | (BigInt(1) << BigInt(40));
const MESSAGE_PERMISSIONS = VIEW_CHANNEL | SEND_MESSAGES | EMBED_LINKS;
const scrypt = promisify(crypto.scrypt);

type EncryptedValue = {
    ciphertext: string,
    iv: string,
    tag: string
}

type StoredGuildAuthorization = {
    discordUserId?: unknown,
    lotsgoUserId?: unknown,
    accessToken?: unknown,
    refreshToken?: unknown,
    expiresAt?: unknown,
    scope?: unknown
}

type DiscordGuild = {
    id: string,
    name: string,
    icon: string | null,
    owner?: boolean,
    permissions?: string
}

type DiscordRole = {
    id: string,
    name: string,
    color: number,
    position: number,
    permissions: string,
    managed: boolean
}

type DiscordMember = {
    roles: string[]
}

type DiscordChannel = {
    id: string,
    guild_id?: string,
    name: string,
    type: number,
    position: number,
    parent_id: string | null,
    permission_overwrites?: Array<{
        id: string,
        type: number,
        allow: string,
        deny: string
    }>
}

export type ManageableDiscordGuild = {
    id: string,
    name: string,
    icon: string | null,
    owner: boolean,
    botInstalled: boolean
}

export type DiscordGuildChannel = {
    id: string,
    name: string,
    parentId: string | null
}

export type DiscordGuildRole = {
    id: string,
    name: string,
    color: number,
    position: number
}

export type DiscordGuildResources = {
    guild: ManageableDiscordGuild,
    botUserId: string,
    botCanManageRoles: boolean,
    channels: DiscordGuildChannel[],
    roles: DiscordGuildRole[]
}

function getEnvironmentKey(): string {
    const value = process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? "development";
    return value.replace(/[^a-zA-Z0-9_-]/g, "-");
}

export function getDiscordGuildAuthorizationId(discordUserId: string): string {
    return `${getEnvironmentKey()}_${discordUserId}`;
}

export function getDiscordGuildConfigId(guildId: string): string {
    return `${getEnvironmentKey()}_${guildId}`;
}

function getEncryptionKey(): Buffer {
    const configured = process.env.DISCORD_OAUTH_ENCRYPTION_KEY?.trim();
    if (!configured) throw new Error("DISCORD_OAUTH_ENCRYPTION_KEY_MISSING");
    const key = Buffer.from(configured, "base64");
    if (key.length !== 32) throw new Error("DISCORD_OAUTH_ENCRYPTION_KEY_INVALID");
    return key;
}

function encrypt(value: string): EncryptedValue {
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv("aes-256-gcm", getEncryptionKey(), iv);
    const ciphertext = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
    return {
        ciphertext: ciphertext.toString("base64"),
        iv: iv.toString("base64"),
        tag: cipher.getAuthTag().toString("base64")
    };
}

function decrypt(value: unknown): string {
    if (!value || typeof value !== "object") throw new Error("DISCORD_OAUTH_TOKEN_INVALID");
    const encrypted = value as Partial<EncryptedValue>;
    if (
        typeof encrypted.ciphertext !== "string"
        || typeof encrypted.iv !== "string"
        || typeof encrypted.tag !== "string"
    ) {
        throw new Error("DISCORD_OAUTH_TOKEN_INVALID");
    }
    const decipher = crypto.createDecipheriv(
        "aes-256-gcm",
        getEncryptionKey(),
        Buffer.from(encrypted.iv, "base64")
    );
    decipher.setAuthTag(Buffer.from(encrypted.tag, "base64"));
    return Buffer.concat([
        decipher.update(Buffer.from(encrypted.ciphertext, "base64")),
        decipher.final()
    ]).toString("utf8");
}

function toDate(value: unknown): Date | null {
    if (value instanceof Date) return value;
    if (value && typeof (value as { toDate?: unknown }).toDate === "function") {
        return (value as { toDate: () => Date }).toDate();
    }
    return null;
}

function toPermission(value: unknown): bigint {
    if (typeof value === "bigint" && value >= BigInt(0)) return value;
    if (typeof value === "number" && Number.isSafeInteger(value) && value >= 0) return BigInt(value);
    if (typeof value === "string" && /^\d+$/.test(value)) return BigInt(value);
    return BigInt(0);
}

function toStringArray(value: unknown): string[] {
    return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function toFiniteNumber(value: unknown, fallback = 0): number {
    return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

export function createStoredGuildAuthorization(
    discordUserId: string,
    lotsgoUserId: string,
    tokens: DiscordOAuthTokens
): DocumentData {
    return {
        environment: getEnvironmentKey(),
        discordUserId,
        lotsgoUserId,
        accessToken: encrypt(tokens.accessToken),
        refreshToken: encrypt(tokens.refreshToken),
        expiresAt: new Date(Date.now() + tokens.expiresIn * 1000),
        scope: tokens.scope,
        updatedAt: new Date(),
        schemaVersion: 1
    };
}

async function getGuildAccessToken(
    req: NextRequest,
    session: AuthenticatedMemberSession
): Promise<string> {
    const discord = session.memberData.discord;
    const discordUserId = typeof discord?.userId === "string" ? discord.userId : "";
    if (!discordUserId) throw new Error("DISCORD_GUILD_AUTH_REQUIRED");

    const authorizationRef = adminDB
        .collection("discordGuildAuthorizations")
        .doc(getDiscordGuildAuthorizationId(discordUserId));
    const snapshot = await authorizationRef.get();
    const stored = snapshot.data() as StoredGuildAuthorization | undefined;
    if (
        !snapshot.exists
        || stored?.lotsgoUserId !== session.userId
        || stored.discordUserId !== discordUserId
    ) {
        throw new Error("DISCORD_GUILD_AUTH_REQUIRED");
    }

    const expiresAt = toDate(stored.expiresAt);
    if (expiresAt && expiresAt.getTime() > Date.now() + 60_000) {
        return decrypt(stored.accessToken);
    }

    try {
        const tokens = await refreshDiscordAuthorization(
            getDiscordOAuthConfig(req),
            decrypt(stored.refreshToken)
        );
        await authorizationRef.set(createStoredGuildAuthorization(discordUserId, session.userId, tokens));
        return tokens.accessToken;
    } catch (error) {
        console.error("Failed to refresh Discord guild authorization", error);
        throw new Error("DISCORD_GUILD_AUTH_REQUIRED");
    }
}

async function discordFetch<T>(path: string, authorization: string, init?: RequestInit): Promise<T> {
    const method = (init?.method ?? "GET").toUpperCase();
    const canRetry = method === "GET";
    const maxAttempts = canRetry ? 3 : 1;

    for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
        try {
            const response = await fetch(`${DISCORD_API_BASE}${path}`, {
                ...init,
                headers: {
                    Authorization: authorization,
                    ...(init?.body ? { "Content-Type": "application/json" } : {}),
                    ...init?.headers
                },
                cache: "no-store",
                signal: AbortSignal.timeout(10_000)
            });
            if (response.ok) {
                if (response.status === 204) return undefined as T;
                return await response.json() as T;
            }

            const shouldRetry = canRetry
                && (response.status === 429 || response.status >= 500)
                && attempt < maxAttempts - 1;
            if (!shouldRetry) {
                const error = new Error(`DISCORD_API_ERROR_${response.status}`);
                (error as Error & { status?: number }).status = response.status;
                throw error;
            }

            const retryAfter = Number(response.headers.get("retry-after"));
            const delay = Number.isFinite(retryAfter) && retryAfter > 0
                ? Math.min(retryAfter * 1000, 2_000)
                : 300 * (attempt + 1);
            await new Promise(resolve => setTimeout(resolve, delay));
        } catch (error) {
            if (error instanceof Error && error.message.startsWith("DISCORD_API_ERROR_")) {
                throw error;
            }
            if (!canRetry || attempt >= maxAttempts - 1) throw error;
            await new Promise(resolve => setTimeout(resolve, 300 * (attempt + 1)));
        }
    }

    throw new Error("DISCORD_API_REQUEST_FAILED");
}

function getBotAuthorization(): string {
    const token = process.env.DISCORD_BOT_TOKEN?.trim();
    if (!token) throw new Error("DISCORD_BOT_TOKEN_MISSING");
    return `Bot ${token}`;
}

export async function getManageableDiscordGuilds(
    req: NextRequest,
    session: AuthenticatedMemberSession
): Promise<{ guilds: ManageableDiscordGuild[], botUserId: string }> {
    const accessToken = await getGuildAccessToken(req, session);
    const botAuthorization = getBotAuthorization();
    const [userGuilds, botGuilds, botUser] = await Promise.all([
        discordFetch<DiscordGuild[]>("/users/@me/guilds", `Bearer ${accessToken}`),
        discordFetch<DiscordGuild[]>("/users/@me/guilds", botAuthorization),
        discordFetch<{ id: string }>("/users/@me", botAuthorization)
    ]);
    if (!Array.isArray(userGuilds) || !Array.isArray(botGuilds) || typeof botUser?.id !== "string") {
        throw new Error("DISCORD_API_RESPONSE_INVALID");
    }
    const botGuildIds = new Set(botGuilds.flatMap(guild => typeof guild?.id === "string" ? [guild.id] : []));
    return {
        botUserId: botUser.id,
        guilds: userGuilds
            .filter(guild => typeof guild?.id === "string" && typeof guild.name === "string")
            .filter(guild => guild.owner === true || (toPermission(guild.permissions) & ADMINISTRATOR) === ADMINISTRATOR)
            .map(guild => ({
                id: guild.id,
                name: guild.name,
                icon: guild.icon,
                owner: guild.owner === true,
                botInstalled: botGuildIds.has(guild.id)
            }))
            .sort((a, b) => Number(b.botInstalled) - Number(a.botInstalled) || a.name.localeCompare(b.name, "ko"))
    };
}

export async function assertDiscordGuildAdministrator(
    req: NextRequest,
    session: AuthenticatedMemberSession,
    guildId: string
): Promise<DiscordGuild> {
    if (!/^\d{17,20}$/.test(guildId)) throw new Error("DISCORD_GUILD_INVALID");
    const accessToken = await getGuildAccessToken(req, session);
    const guilds = await discordFetch<DiscordGuild[]>("/users/@me/guilds", `Bearer ${accessToken}`);
    if (!Array.isArray(guilds)) throw new Error("DISCORD_API_RESPONSE_INVALID");
    const guild = guilds.find(item => item.id === guildId);
    if (!guild || (!guild.owner && (toPermission(guild.permissions) & ADMINISTRATOR) !== ADMINISTRATOR)) {
        throw new Error("DISCORD_GUILD_FORBIDDEN");
    }
    return guild;
}

function applyOverwrite(permissions: bigint, deny: unknown, allow: unknown): bigint {
    return (permissions & ~toPermission(deny)) | toPermission(allow);
}

function getChannelPermissions(
    guildId: string,
    botUserId: string,
    member: DiscordMember,
    roles: DiscordRole[],
    channel: DiscordChannel
): bigint {
    const everyone = roles.find(role => role.id === guildId);
    const memberRoleIds = toStringArray(member.roles);
    let permissions = toPermission(everyone?.permissions);
    memberRoleIds.forEach(roleId => {
        permissions |= toPermission(roles.find(role => role.id === roleId)?.permissions);
    });
    if ((permissions & ADMINISTRATOR) === ADMINISTRATOR) return ~BigInt(0);

    const overwrites = Array.isArray(channel.permission_overwrites) ? channel.permission_overwrites : [];
    const everyoneOverwrite = overwrites.find(overwrite => overwrite.type === 0 && overwrite.id === guildId);
    if (everyoneOverwrite) {
        permissions = applyOverwrite(permissions, everyoneOverwrite.deny, everyoneOverwrite.allow);
    }

    let roleAllow = BigInt(0);
    let roleDeny = BigInt(0);
    overwrites.forEach(overwrite => {
        if (overwrite.type === 0 && memberRoleIds.includes(overwrite.id)) {
            roleAllow |= toPermission(overwrite.allow);
            roleDeny |= toPermission(overwrite.deny);
        }
    });
    permissions = (permissions & ~roleDeny) | roleAllow;

    const memberOverwrite = overwrites.find(overwrite => overwrite.type === 1 && overwrite.id === botUserId);
    if (memberOverwrite) {
        permissions = applyOverwrite(permissions, memberOverwrite.deny, memberOverwrite.allow);
    }
    return permissions;
}

export async function getDiscordGuildResources(
    guild: DiscordGuild
): Promise<DiscordGuildResources> {
    const authorization = getBotAuthorization();
    const botUser = await discordFetch<{ id: string }>("/users/@me", authorization);
    const [roles, channels, botMember] = await Promise.all([
        discordFetch<DiscordRole[]>(`/guilds/${guild.id}/roles`, authorization),
        discordFetch<DiscordChannel[]>(`/guilds/${guild.id}/channels`, authorization),
        discordFetch<DiscordMember>(`/guilds/${guild.id}/members/${botUser.id}`, authorization)
    ]);
    if (
        typeof botUser?.id !== "string"
        || !Array.isArray(roles)
        || !Array.isArray(channels)
        || !botMember
        || typeof botMember !== "object"
    ) {
        throw new Error("DISCORD_API_RESPONSE_INVALID");
    }
    const botMemberRoleIds = toStringArray(botMember.roles);
    const validRoles = roles.filter(role => role && typeof role.id === "string" && typeof role.name === "string");
    const validChannels = channels.filter(channel => channel && typeof channel.id === "string" && typeof channel.name === "string");
    const botRoles = validRoles.filter(role => botMemberRoleIds.includes(role.id));
    const basePermissions = botRoles.reduce(
        (permissions, role) => permissions | toPermission(role.permissions),
        toPermission(validRoles.find(role => role.id === guild.id)?.permissions)
    );
    const botCanManageRoles = (basePermissions & ADMINISTRATOR) === ADMINISTRATOR
        || (basePermissions & MANAGE_ROLES) === MANAGE_ROLES;
    const highestBotPosition = Math.max(0, ...botRoles.map(role => toFiniteNumber(role.position)));

    return {
        guild: {
            id: guild.id,
            name: guild.name,
            icon: guild.icon,
            owner: guild.owner === true,
            botInstalled: true
        },
        botUserId: botUser.id,
        botCanManageRoles,
        channels: validChannels
            .filter(channel => channel.type === 0 || channel.type === 5)
            .filter(channel => {
                const permissions = getChannelPermissions(guild.id, botUser.id, { roles: botMemberRoleIds }, validRoles, channel);
                return (permissions & MESSAGE_PERMISSIONS) === MESSAGE_PERMISSIONS;
            })
            .sort((a, b) => toFiniteNumber(a.position) - toFiniteNumber(b.position))
            .map(channel => ({
                id: channel.id,
                name: channel.name,
                parentId: typeof channel.parent_id === "string" ? channel.parent_id : null
            })),
        roles: validRoles
            .filter(role => role.id !== guild.id)
            .filter(role => !role.managed && toFiniteNumber(role.position) < highestBotPosition)
            .filter(role => (toPermission(role.permissions) & DANGEROUS_ROLE_PERMISSIONS) === BigInt(0))
            .sort((a, b) => toFiniteNumber(b.position) - toFiniteNumber(a.position))
            .map(role => ({
                id: role.id,
                name: role.name,
                color: toFiniteNumber(role.color),
                position: toFiniteNumber(role.position)
            }))
    };
}

export async function hashGuildPassword(password: string): Promise<string> {
    const salt = crypto.randomBytes(16);
    const derived = await scrypt(password, salt, 32) as Buffer;
    return `scrypt$${salt.toString("base64")}$${derived.toString("base64")}`;
}

export async function sendDiscordMessage<T>(
    channelId: string,
    body: unknown
): Promise<T> {
    return discordFetch<T>(`/channels/${channelId}/messages`, getBotAuthorization(), {
        method: "POST",
        body: JSON.stringify(body)
    });
}

export async function editDiscordMessage<T>(
    channelId: string,
    messageId: string,
    body: unknown
): Promise<T> {
    return discordFetch<T>(`/channels/${channelId}/messages/${messageId}`, getBotAuthorization(), {
        method: "PATCH",
        body: JSON.stringify(body)
    });
}

export async function deleteDiscordMessage(channelId: string, messageId: string): Promise<void> {
    await discordFetch<void>(`/channels/${channelId}/messages/${messageId}`, getBotAuthorization(), {
        method: "DELETE"
    });
}

export function isDiscordApiNotFound(error: unknown): boolean {
    return error instanceof Error && error.message === "DISCORD_API_ERROR_404";
}
