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
    if (!response.ok) {
        const error = new Error(`DISCORD_API_ERROR_${response.status}`);
        (error as Error & { status?: number }).status = response.status;
        throw error;
    }
    if (response.status === 204) return undefined as T;
    return await response.json() as T;
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
    const botGuildIds = new Set(botGuilds.map(guild => guild.id));
    return {
        botUserId: botUser.id,
        guilds: userGuilds
            .filter(guild => guild.owner === true || (BigInt(guild.permissions ?? "0") & ADMINISTRATOR) === ADMINISTRATOR)
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
    const guild = guilds.find(item => item.id === guildId);
    if (!guild || (!guild.owner && (BigInt(guild.permissions ?? "0") & ADMINISTRATOR) !== ADMINISTRATOR)) {
        throw new Error("DISCORD_GUILD_FORBIDDEN");
    }
    return guild;
}

function applyOverwrite(permissions: bigint, deny: string, allow: string): bigint {
    return (permissions & ~BigInt(deny)) | BigInt(allow);
}

function getChannelPermissions(
    guildId: string,
    botUserId: string,
    member: DiscordMember,
    roles: DiscordRole[],
    channel: DiscordChannel
): bigint {
    const everyone = roles.find(role => role.id === guildId);
    let permissions = BigInt(everyone?.permissions ?? "0");
    member.roles.forEach(roleId => {
        permissions |= BigInt(roles.find(role => role.id === roleId)?.permissions ?? "0");
    });
    if ((permissions & ADMINISTRATOR) === ADMINISTRATOR) return ~BigInt(0);

    const overwrites = channel.permission_overwrites ?? [];
    const everyoneOverwrite = overwrites.find(overwrite => overwrite.type === 0 && overwrite.id === guildId);
    if (everyoneOverwrite) {
        permissions = applyOverwrite(permissions, everyoneOverwrite.deny, everyoneOverwrite.allow);
    }

    let roleAllow = BigInt(0);
    let roleDeny = BigInt(0);
    overwrites.forEach(overwrite => {
        if (overwrite.type === 0 && member.roles.includes(overwrite.id)) {
            roleAllow |= BigInt(overwrite.allow);
            roleDeny |= BigInt(overwrite.deny);
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
    const botRoles = roles.filter(role => botMember.roles.includes(role.id));
    const basePermissions = botRoles.reduce(
        (permissions, role) => permissions | BigInt(role.permissions),
        BigInt(roles.find(role => role.id === guild.id)?.permissions ?? "0")
    );
    const botCanManageRoles = (basePermissions & ADMINISTRATOR) === ADMINISTRATOR
        || (basePermissions & MANAGE_ROLES) === MANAGE_ROLES;
    const highestBotPosition = Math.max(0, ...botRoles.map(role => role.position));

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
        channels: channels
            .filter(channel => channel.type === 0 || channel.type === 5)
            .filter(channel => {
                const permissions = getChannelPermissions(guild.id, botUser.id, botMember, roles, channel);
                return (permissions & MESSAGE_PERMISSIONS) === MESSAGE_PERMISSIONS;
            })
            .sort((a, b) => a.position - b.position)
            .map(channel => ({ id: channel.id, name: channel.name, parentId: channel.parent_id })),
        roles: roles
            .filter(role => role.id !== guild.id)
            .filter(role => !role.managed && role.position < highestBotPosition)
            .filter(role => (BigInt(role.permissions) & DANGEROUS_ROLE_PERMISSIONS) === BigInt(0))
            .sort((a, b) => b.position - a.position)
            .map(role => ({
                id: role.id,
                name: role.name,
                color: role.color,
                position: role.position
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
