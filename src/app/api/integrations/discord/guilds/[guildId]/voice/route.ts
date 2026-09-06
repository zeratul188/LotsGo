// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminDB } from "@/utiils/firebaseAdmin";
import { getAuthenticatedMemberSession } from "@/lib/serverSession";
import { assertDiscordGuildAdministrator, deleteDiscordMessage, editDiscordMessage, getDiscordGuildConfigId, getDiscordGuildResources, isDiscordApiNotFound, sendDiscordMessage } from "@/lib/discordGuild";

type RouteContext = { params: Promise<{ guildId: string }> };
type VoiceButton = { id: string, label: string, channelName: string, categoryId: string, userLimit: number | null, maxChannels: number };
type StoredConfig = { guildId?: unknown, botUserId?: unknown, channelId?: unknown, embedTitle?: unknown, embedDescription?: unknown, autoMove?: unknown, buttons?: unknown, messageId?: unknown, messageChannelId?: unknown, createdAt?: unknown };

function stringValue(value: unknown): string { return typeof value === "string" ? value.trim() : ""; }
function sameOrigin(req: NextRequest): boolean { const origin = req.headers.get("origin"); return !origin || origin === req.nextUrl.origin; }
function idValue(value: unknown): string { return /^[a-zA-Z0-9_-]{1,40}$/.test(stringValue(value)) ? stringValue(value) : ""; }
function parseButtons(value: unknown): VoiceButton[] {
    if (!Array.isArray(value)) return [];
    return value.slice(0, 5).map((item, index) => {
        const data = item as Record<string, unknown>;
        const limit = Number(data.userLimit);
        const max = Number(data.maxChannels);
        return { id: idValue(data.id) || `button-${index + 1}`, label: stringValue(data.label), channelName: stringValue(data.channelName), categoryId: stringValue(data.categoryId), userLimit: Number.isInteger(limit) && limit >= 1 && limit <= 99 ? limit : null, maxChannels: Number.isInteger(max) && max >= 1 && max <= 25 ? max : 1 };
    });
}
function serialize(data: StoredConfig | undefined) {
    if (!data || typeof data.guildId !== "string") return null;
    return { channelId: stringValue(data.channelId), embedTitle: stringValue(data.embedTitle), embedDescription: stringValue(data.embedDescription), autoMove: data.autoMove === true, buttons: parseButtons(data.buttons), messageId: stringValue(data.messageId) || null, messageChannelId: stringValue(data.messageChannelId) || null, messageUrl: typeof data.messageId === "string" && typeof data.messageChannelId === "string" ? `https://discord.com/channels/${data.guildId}/${data.messageChannelId}/${data.messageId}` : null };
}
function errorResponse(error: unknown): NextResponse { const code = error instanceof Error ? error.message : ""; if (code.includes("AUTH_REQUIRED")) return NextResponse.json({ error: "Discord 서버 관리 권한 승인이 필요합니다." }, { status: 403 }); if (code.includes("FORBIDDEN") || code.includes("INVALID")) return NextResponse.json({ error: "이 Discord 서버를 관리할 권한이 없습니다." }, { status: 403 }); if (code.includes("DISCORD_API_ERROR_")) return NextResponse.json({ error: "로츠고봇이 서버에 없거나 필요한 권한이 없습니다." }, { status: 409 }); console.error("Failed to manage Discord voice configuration", error); return NextResponse.json({ error: "음성 채널 설정을 처리하지 못했습니다." }, { status: 500 }); }

export async function GET(req: NextRequest, context: RouteContext) {
    try { const session = await getAuthenticatedMemberSession(req); if (!session) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 }); const { guildId } = await context.params; const guild = await assertDiscordGuildAdministrator(req, session, guildId); const resources = await getDiscordGuildResources(guild); const snapshot = await adminDB.collection("discordGuildVoiceConfigs").doc(getDiscordGuildConfigId(guildId)).get(); return NextResponse.json({ ...resources, voiceConfig: serialize(snapshot.data() as StoredConfig | undefined) }); } catch (error) { return errorResponse(error); }
}

export async function PUT(req: NextRequest, context: RouteContext) {
    if (!sameOrigin(req)) return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 403 });
    try {
        const session = await getAuthenticatedMemberSession(req); if (!session) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 }); const { guildId } = await context.params; const guild = await assertDiscordGuildAdministrator(req, session, guildId); const resources = await getDiscordGuildResources(guild); const body = await req.json() as Record<string, unknown>; const channelId = stringValue(body.channelId); const title = stringValue(body.embedTitle); const description = stringValue(body.embedDescription); const buttons = parseButtons(body.buttons);
        if (!resources.botCanManageChannels) return NextResponse.json({ error: "로츠고봇에 채널 관리 권한이 없습니다." }, { status: 409 });
        if (!resources.channels.some(channel => channel.id === channelId)) return NextResponse.json({ error: "메시지를 보낼 텍스트 채널을 선택해 주세요." }, { status: 400 });
        if (!title || title.length > 256 || !description || description.length > 4096) return NextResponse.json({ error: "임베드 제목과 본문 길이를 확인해 주세요." }, { status: 400 });
        if (buttons.length < 1 || buttons.length > 5 || buttons.some(button => !button.label || button.label.length > 80 || !button.channelName || button.channelName.length > 100 || !resources.categories.some(category => category.id === button.categoryId))) return NextResponse.json({ error: "버튼, 음성 채널명, 카테고리 설정을 확인해 주세요." }, { status: 400 });
        const ref = adminDB.collection("discordGuildVoiceConfigs").doc(getDiscordGuildConfigId(guildId)); const current = await ref.get(); await ref.set({ environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? "development", guildId, guildName: guild.name, botUserId: resources.botUserId, channelId, embedTitle: title, embedDescription: description, autoMove: body.autoMove === true, buttons, updatedByDiscordUserId: session.memberData.discord?.userId ?? null, updatedByLotsgoUserId: session.userId, updatedAt: new Date(), createdAt: current.exists ? (current.data() as StoredConfig)?.createdAt ?? new Date() : new Date(), schemaVersion: 1 }, { merge: true }); return NextResponse.json({ message: "음성 채널 설정을 저장했습니다.", config: serialize((await ref.get()).data() as StoredConfig) });
    } catch (error) { return errorResponse(error); }
}

export async function POST(req: NextRequest, context: RouteContext) {
    if (!sameOrigin(req)) return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 403 });
    try { const session = await getAuthenticatedMemberSession(req); if (!session) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 }); const { guildId } = await context.params; const guild = await assertDiscordGuildAdministrator(req, session, guildId); const resources = await getDiscordGuildResources(guild); const ref = adminDB.collection("discordGuildVoiceConfigs").doc(getDiscordGuildConfigId(guildId)); const snapshot = await ref.get(); const config = snapshot.data() as StoredConfig | undefined; if (!config || config.guildId !== guildId || config.botUserId !== resources.botUserId) return NextResponse.json({ error: "먼저 음성 채널 설정을 저장해 주세요." }, { status: 400 }); if (!resources.botCanManageChannels) return NextResponse.json({ error: "로츠고봇에 채널 관리 권한이 없습니다." }, { status: 409 }); const buttons = parseButtons(config.buttons); const payload = { embeds: [{ title: stringValue(config.embedTitle), description: stringValue(config.embedDescription), color: 0x5865F2 }], components: [{ type: 1, components: buttons.map(button => ({ type: 2, style: 1, custom_id: `voice:create:${getDiscordGuildConfigId(guildId)}:${button.id}`, label: button.label })) }], allowed_mentions: { parse: [] } }; const oldId = stringValue(config.messageId); const oldChannel = stringValue(config.messageChannelId); let message: { id: string, channel_id: string } | null = null; if (oldId && oldChannel === stringValue(config.channelId)) { try { message = await editDiscordMessage(stringValue(config.channelId), oldId, payload); } catch (error) { if (!isDiscordApiNotFound(error)) throw error; } } if (!message) { if (oldId && oldChannel && oldChannel !== stringValue(config.channelId)) await deleteDiscordMessage(oldChannel, oldId).catch(() => undefined); message = await sendDiscordMessage(stringValue(config.channelId), payload); } await ref.update({ messageId: message.id, messageChannelId: message.channel_id, publishedAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp() }); return NextResponse.json({ message: oldId === message.id ? "음성 채널 메시지를 수정했습니다." : "음성 채널 메시지를 전송했습니다.", config: serialize((await ref.get()).data() as StoredConfig) }); } catch (error) { return errorResponse(error); }
}
