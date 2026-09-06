import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminDB } from "@/utiils/firebaseAdmin";
import { getAuthenticatedMemberSession } from "@/lib/serverSession";
import {
    assertDiscordGuildAdministrator,
    deleteDiscordMessage,
    editDiscordMessage,
    getDiscordGuildConfigId,
    getDiscordGuildResources,
    isDiscordApiNotFound,
    sendDiscordMessage
} from "@/lib/discordGuild";

type RouteContext = { params: Promise<{ guildId: string }> };

type NicknameConfigInput = {
    channelId?: unknown,
    embedTitle?: unknown,
    embedDescription?: unknown,
    buttonLabel?: unknown,
    validateCharacter?: unknown,
    grantRoleEnabled?: unknown,
    grantRoleId?: unknown
};

type StoredNicknameConfig = {
    guildId?: unknown,
    botUserId?: unknown,
    channelId?: unknown,
    embedTitle?: unknown,
    embedDescription?: unknown,
    buttonLabel?: unknown,
    validateCharacter?: unknown,
    grantRoleEnabled?: unknown,
    grantRoleId?: unknown,
    messageId?: unknown,
    messageChannelId?: unknown,
    createdAt?: unknown,
    updatedAt?: unknown
};

function sameOrigin(req: NextRequest): boolean {
    const origin = req.headers.get("origin");
    return !origin || origin === req.nextUrl.origin;
}

function stringValue(value: unknown): string {
    return typeof value === "string" ? value.trim() : "";
}

function serializeConfig(data: StoredNicknameConfig | undefined) {
    if (!data || typeof data.guildId !== "string") return null;
    return {
        channelId: stringValue(data.channelId),
        embedTitle: stringValue(data.embedTitle),
        embedDescription: stringValue(data.embedDescription),
        buttonLabel: stringValue(data.buttonLabel) || "닉네임 변경",
        validateCharacter: data.validateCharacter === true,
        grantRoleEnabled: data.grantRoleEnabled === true,
        grantRoleId: stringValue(data.grantRoleId),
        messageId: stringValue(data.messageId) || null,
        messageChannelId: stringValue(data.messageChannelId) || null,
        messageUrl: typeof data.messageId === "string" && typeof data.messageChannelId === "string"
            ? `https://discord.com/channels/${data.guildId}/${data.messageChannelId}/${data.messageId}`
            : null
    };
}

function errorResponse(error: unknown): NextResponse {
    const code = error instanceof Error ? error.message : "";
    if (code === "DISCORD_GUILD_AUTH_REQUIRED") {
        return NextResponse.json({ error: "Discord 서버 관리 권한 승인이 필요합니다.", code }, { status: 403 });
    }
    if (code === "DISCORD_GUILD_FORBIDDEN" || code === "DISCORD_GUILD_INVALID") {
        return NextResponse.json({ error: "이 Discord 서버를 관리할 권한이 없습니다." }, { status: 403 });
    }
    if (code === "DISCORD_API_ERROR_403" || code === "DISCORD_API_ERROR_404") {
        return NextResponse.json({ error: "로츠고봇이 서버에 없거나 필요한 권한이 없습니다." }, { status: 409 });
    }
    console.error("Failed to manage Discord nickname configuration", error);
    return NextResponse.json({ error: "Discord 닉네임 설정을 처리하지 못했습니다." }, { status: 500 });
}

export async function GET(req: NextRequest, context: RouteContext) {
    try {
        const session = await getAuthenticatedMemberSession(req);
        if (!session) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
        const { guildId } = await context.params;
        const guild = await assertDiscordGuildAdministrator(req, session, guildId);
        const resources = await getDiscordGuildResources(guild);
        const snapshot = await adminDB
            .collection("discordGuildNicknameConfigs")
            .doc(getDiscordGuildConfigId(guildId))
            .get();
        return NextResponse.json({ ...resources, nicknameConfig: serializeConfig(snapshot.data() as StoredNicknameConfig | undefined) });
    } catch (error) {
        return errorResponse(error);
    }
}

export async function PUT(req: NextRequest, context: RouteContext) {
    if (!sameOrigin(req)) return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 403 });
    try {
        const session = await getAuthenticatedMemberSession(req);
        if (!session) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
        const { guildId } = await context.params;
        const guild = await assertDiscordGuildAdministrator(req, session, guildId);
        const resources = await getDiscordGuildResources(guild);
        const body = await req.json() as NicknameConfigInput;
        const channelId = stringValue(body.channelId);
        const embedTitle = stringValue(body.embedTitle);
        const embedDescription = stringValue(body.embedDescription);
        const buttonLabel = stringValue(body.buttonLabel);
        const validateCharacter = body.validateCharacter === true;
        const grantRoleEnabled = body.grantRoleEnabled === true;
        const grantRoleId = stringValue(body.grantRoleId);

        if (!resources.channels.some(channel => channel.id === channelId)) {
            return NextResponse.json({ error: "메시지를 보낼 수 있는 채널을 선택해 주세요." }, { status: 400 });
        }
        if (!embedTitle || embedTitle.length > 256 || !embedDescription || embedDescription.length > 4096) {
            return NextResponse.json({ error: "임베드 제목과 본문 길이를 확인해 주세요." }, { status: 400 });
        }
        if (!buttonLabel || buttonLabel.length > 80) {
            return NextResponse.json({ error: "버튼 문구는 1~80자로 입력해 주세요." }, { status: 400 });
        }
        if (grantRoleEnabled && !resources.roles.some(role => role.id === grantRoleId)) {
            return NextResponse.json({ error: "자동 지급할 역할을 선택해 주세요." }, { status: 400 });
        }

        const configRef = adminDB.collection("discordGuildNicknameConfigs").doc(getDiscordGuildConfigId(guildId));
        const currentSnapshot = await configRef.get();
        const current = currentSnapshot.data() as StoredNicknameConfig | undefined;
        await configRef.set({
            environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? "development",
            guildId,
            guildName: guild.name,
            botUserId: resources.botUserId,
            channelId,
            embedTitle,
            embedDescription,
            buttonLabel,
            validateCharacter,
            grantRoleEnabled,
            grantRoleId: grantRoleEnabled ? grantRoleId : "",
            updatedByDiscordUserId: session.memberData.discord?.userId ?? null,
            updatedByLotsgoUserId: session.userId,
            updatedAt: new Date(),
            createdAt: currentSnapshot.exists ? current?.createdAt ?? new Date() : new Date(),
            schemaVersion: 1
        }, { merge: true });

        const updated = (await configRef.get()).data() as StoredNicknameConfig;
        return NextResponse.json({ message: "Discord 닉네임 설정을 저장했습니다.", config: serializeConfig(updated) });
    } catch (error) {
        return errorResponse(error);
    }
}

export async function POST(req: NextRequest, context: RouteContext) {
    if (!sameOrigin(req)) return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 403 });
    try {
        const session = await getAuthenticatedMemberSession(req);
        if (!session) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
        const { guildId } = await context.params;
        const guild = await assertDiscordGuildAdministrator(req, session, guildId);
        const resources = await getDiscordGuildResources(guild);
        const configId = getDiscordGuildConfigId(guildId);
        const configRef = adminDB.collection("discordGuildNicknameConfigs").doc(configId);
        const snapshot = await configRef.get();
        const config = snapshot.data() as StoredNicknameConfig | undefined;
        if (!config || config.guildId !== guildId || config.botUserId !== resources.botUserId) {
            return NextResponse.json({ error: "먼저 닉네임 변경 설정을 저장해 주세요." }, { status: 400 });
        }
        if (!resources.botCanManageNicknames) {
            return NextResponse.json({ error: "로츠고봇에 닉네임 관리 권한이 없습니다." }, { status: 409 });
        }
        const channelId = stringValue(config.channelId);
        const roleId = stringValue(config.grantRoleId);
        if (!resources.channels.some(channel => channel.id === channelId)) {
            return NextResponse.json({ error: "선택한 채널에 메시지를 보낼 수 없습니다." }, { status: 409 });
        }
        if (config.grantRoleEnabled === true && !resources.roles.some(role => role.id === roleId)) {
            return NextResponse.json({ error: "자동 지급 역할을 지급할 수 없습니다. 역할 순서와 권한을 확인해 주세요." }, { status: 409 });
        }

        const payload = {
            embeds: [{
                title: stringValue(config.embedTitle),
                description: stringValue(config.embedDescription),
                color: 0x5865F2
            }],
            components: [{
                type: 1,
                components: [{
                    type: 2,
                    style: 1,
                    custom_id: `nickname:open:${configId}`,
                    label: stringValue(config.buttonLabel) || "닉네임 변경"
                }]
            }],
            allowed_mentions: { parse: [] }
        };

        let message: { id: string, channel_id: string } | null = null;
        const oldMessageId = stringValue(config.messageId);
        const oldChannelId = stringValue(config.messageChannelId);
        if (oldMessageId && oldChannelId === channelId) {
            try {
                message = await editDiscordMessage(channelId, oldMessageId, payload);
            } catch (error) {
                if (!isDiscordApiNotFound(error)) throw error;
            }
        }
        if (!message) {
            if (oldMessageId && oldChannelId && oldChannelId !== channelId) {
                await deleteDiscordMessage(oldChannelId, oldMessageId).catch(error => {
                    if (!isDiscordApiNotFound(error)) console.warn("Failed to remove previous Discord nickname message", error);
                });
            }
            message = await sendDiscordMessage(channelId, payload);
        }
        if (!message) throw new Error("DISCORD_MESSAGE_SEND_FAILED");

        await configRef.update({
            messageId: message.id,
            messageChannelId: message.channel_id,
            publishedAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp()
        });
        const updated = (await configRef.get()).data() as StoredNicknameConfig;
        return NextResponse.json({
            message: oldMessageId === message.id ? "닉네임 변경 메시지를 수정했습니다." : "닉네임 변경 메시지를 전송했습니다.",
            config: serializeConfig(updated)
        });
    } catch (error) {
        return errorResponse(error);
    }
}
