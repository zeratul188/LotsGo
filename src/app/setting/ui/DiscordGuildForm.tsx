import { useEffect, useMemo, useRef, useState } from "react";
import {
    addToast,
    Avatar,
    Button,
    Card,
    CardBody,
    Chip,
    Divider,
    Input,
    Select,
    SelectItem,
    Switch,
    Tab,
    Tabs,
    Textarea
} from "@heroui/react";
import { useSearchParams } from "next/navigation";
import DiscordIcon from "@/Icons/DiscordIcon";
import { LoadingComponent } from "../../UtilsCompnents";
import type {
    DiscordGuildResources,
    DiscordWelcomeConfig,
    DiscordWelcomeForm,
    ManageableDiscordGuild
} from "../model/discordGuildTypes";

const defaultForm: DiscordWelcomeForm = {
    channelId: "",
    embedTitle: "서버 이용 안내",
    embedDescription: "안내 내용을 확인한 뒤 아래 버튼을 눌러 서버를 이용해 주세요.",
    guestButtonLabel: "이용하기",
    guestRoleId: "",
    memberButtonEnabled: false,
    memberButtonLabel: "길드원 인증",
    memberRoleId: "",
    memberPassword: "",
    removeGuestRole: true
};

const oauthResultMessages: Record<string, { title: string, description: string, color: "danger" | "warning" }> = {
    cancelled: {
        title: "Discord 권한 연결 취소",
        description: "서버 관리 기능을 사용하려면 Discord 권한 승인이 필요합니다.",
        color: "warning"
    },
    "session-error": {
        title: "로그인 정보 만료",
        description: "다시 로그인한 뒤 서버 관리 권한을 연결해 주세요.",
        color: "danger"
    },
    "state-error": {
        title: "연결 요청 만료",
        description: "안전한 연결을 위해 처음부터 다시 시도해 주세요.",
        color: "danger"
    },
    "lotsgo-already-linked": {
        title: "Discord 계정 불일치",
        description: "현재 로츠고 계정에 연결된 Discord 계정으로 승인해 주세요.",
        color: "danger"
    },
    "configuration-error": {
        title: "Discord 설정 오류",
        description: "Discord OAuth 환경설정과 콜백 주소를 확인해 주세요.",
        color: "danger"
    },
    "oauth-error": {
        title: "Discord 인증 오류",
        description: "Discord 서버 관리 권한 승인을 완료하지 못했습니다.",
        color: "danger"
    },
    "callback-error": {
        title: "Discord 연결 오류",
        description: "서버 관리 권한을 저장하지 못했습니다. 잠시 후 다시 시도해 주세요.",
        color: "danger"
    }
};

function toForm(config: DiscordWelcomeConfig | null): DiscordWelcomeForm {
    if (!config) return { ...defaultForm };
    return {
        channelId: config.channelId,
        embedTitle: config.embedTitle,
        embedDescription: config.embedDescription,
        guestButtonLabel: config.guestButtonLabel,
        guestRoleId: config.guestRoleId,
        memberButtonEnabled: config.memberButtonEnabled,
        memberButtonLabel: config.memberButtonLabel,
        memberRoleId: config.memberRoleId,
        memberPassword: "",
        removeGuestRole: config.removeGuestRole
    };
}

async function responseError(response: Response, fallback: string): Promise<Error> {
    const data = await response.json().catch(() => null) as { error?: unknown, code?: unknown } | null;
    const error = new Error(typeof data?.error === "string" ? data.error : fallback);
    if (typeof data?.code === "string") (error as Error & { code?: string }).code = data.code;
    return error;
}

function guildIconUrl(guild: ManageableDiscordGuild): string | undefined {
    return guild.icon
        ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png?size=128`
        : undefined;
}

function roleColor(color: number): string {
    return color > 0 ? `#${color.toString(16).padStart(6, "0")}` : "#99aab5";
}

export default function DiscordGuildComponent() {
    const searchParams = useSearchParams();
    const shownResult = useRef<string | null>(null);
    const hasLoadedGuilds = useRef(false);
    const [guilds, setGuilds] = useState<ManageableDiscordGuild[]>([]);
    const [botUserId, setBotUserId] = useState("");
    const [selectedGuildId, setSelectedGuildId] = useState("");
    const [resources, setResources] = useState<DiscordGuildResources | null>(null);
    const [savedConfig, setSavedConfig] = useState<DiscordWelcomeConfig | null>(null);
    const [form, setForm] = useState<DiscordWelcomeForm>({ ...defaultForm });
    const [needsAuthorization, setNeedsAuthorization] = useState(false);
    const [isLoadingGuilds, setLoadingGuilds] = useState(true);
    const [isLoadingResources, setLoadingResources] = useState(false);
    const [isSaving, setSaving] = useState(false);
    const [isPublishing, setPublishing] = useState(false);

    const selectedGuild = useMemo(
        () => guilds.find(guild => guild.id === selectedGuildId) ?? null,
        [guilds, selectedGuildId]
    );
    const isDirty = useMemo(() => {
        const saved = toForm(savedConfig);
        return JSON.stringify({ ...form, memberPassword: "" }) !== JSON.stringify(saved)
            || form.memberPassword.length > 0;
    }, [form, savedConfig]);

    const loadGuilds = async () => {
        setLoadingGuilds(true);
        try {
            const response = await fetch("/api/integrations/discord/guilds", {
                credentials: "include",
                cache: "no-store"
            });
            if (!response.ok) throw await responseError(response, "Discord 서버 목록을 불러오지 못했습니다.");
            const data = await response.json() as { guilds: ManageableDiscordGuild[], botUserId: string };
            setGuilds(data.guilds);
            setBotUserId(data.botUserId);
            setNeedsAuthorization(false);
            setSelectedGuildId(current => current || data.guilds[0]?.id || "");
        } catch (error) {
            if ((error as Error & { code?: string }).code === "DISCORD_GUILD_AUTH_REQUIRED") {
                setNeedsAuthorization(true);
                return;
            }
            addToast({
                title: "서버 목록 조회 오류",
                description: error instanceof Error ? error.message : "Discord 서버 목록을 불러오지 못했습니다.",
                color: "danger"
            });
        } finally {
            setLoadingGuilds(false);
        }
    };

    useEffect(() => {
        if (hasLoadedGuilds.current) return;
        hasLoadedGuilds.current = true;
        void loadGuilds();
    }, []);

    useEffect(() => {
        const result = searchParams.get("discord");
        if (!result || shownResult.current === result) return;
        shownResult.current = result;
        if (result === "guild-authorized") {
            addToast({
                title: "Discord 서버 관리 연결 완료",
                description: "관리 가능한 서버와 로츠고봇 상태를 불러옵니다.",
                color: "success"
            });
            return;
        }
        const message = oauthResultMessages[result];
        if (message) addToast(message);
    }, [searchParams]);

    useEffect(() => {
        if (!selectedGuildId || !selectedGuild?.botInstalled) {
            setResources(null);
            setSavedConfig(null);
            setForm({ ...defaultForm });
            return;
        }
        let cancelled = false;
        const load = async () => {
            setLoadingResources(true);
            try {
                const response = await fetch(`/api/integrations/discord/guilds/${selectedGuildId}`, {
                    credentials: "include",
                    cache: "no-store"
                });
                if (!response.ok) throw await responseError(response, "Discord 서버 설정을 불러오지 못했습니다.");
                const data = await response.json() as DiscordGuildResources;
                if (cancelled) return;
                setResources(data);
                setSavedConfig(data.config);
                setForm(toForm(data.config));
            } catch (error) {
                if (!cancelled) addToast({
                    title: "서버 설정 조회 오류",
                    description: error instanceof Error ? error.message : "Discord 서버 설정을 불러오지 못했습니다.",
                    color: "danger"
                });
            } finally {
                if (!cancelled) setLoadingResources(false);
            }
        };
        void load();
        return () => { cancelled = true; };
    }, [selectedGuildId, selectedGuild?.botInstalled]);

    const updateForm = <K extends keyof DiscordWelcomeForm>(key: K, value: DiscordWelcomeForm[K]) => {
        setForm(current => ({ ...current, [key]: value }));
    };

    const save = async () => {
        if (!selectedGuildId) return;
        setSaving(true);
        try {
            const response = await fetch(`/api/integrations/discord/guilds/${selectedGuildId}`, {
                method: "PUT",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form)
            });
            if (!response.ok) throw await responseError(response, "설정을 저장하지 못했습니다.");
            const data = await response.json() as { message: string, config: DiscordWelcomeConfig };
            setSavedConfig(data.config);
            setForm(toForm(data.config));
            addToast({ title: "설정 저장 완료", description: data.message, color: "success" });
        } catch (error) {
            addToast({
                title: "설정 저장 오류",
                description: error instanceof Error ? error.message : "설정을 저장하지 못했습니다.",
                color: "danger"
            });
        } finally {
            setSaving(false);
        }
    };

    const publish = async () => {
        if (!selectedGuildId) return;
        setPublishing(true);
        try {
            const response = await fetch(`/api/integrations/discord/guilds/${selectedGuildId}`, {
                method: "POST",
                credentials: "include"
            });
            if (!response.ok) throw await responseError(response, "입장 메시지를 전송하지 못했습니다.");
            const data = await response.json() as { message: string, config: DiscordWelcomeConfig };
            setSavedConfig(data.config);
            addToast({ title: "Discord 메시지 반영 완료", description: data.message, color: "success" });
        } catch (error) {
            addToast({
                title: "메시지 전송 오류",
                description: error instanceof Error ? error.message : "입장 메시지를 전송하지 못했습니다.",
                color: "danger"
            });
        } finally {
            setPublishing(false);
        }
    };

    if (isLoadingGuilds) {
        return <LoadingComponent heightStyle="min-h-[420px]" message="관리 가능한 Discord 서버를 확인하고 있어요"/>;
    }

    if (needsAuthorization) {
        return (
            <div className="flex min-h-[420px] items-center justify-center p-2 sm:p-6">
                <Card radius="lg" shadow="none" className="w-full max-w-xl border border-default-200/80 dark:border-white/10">
                    <CardBody className="items-center gap-5 p-6 text-center sm:p-9">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#5865F2]/10 text-[#5865F2] dark:bg-[#5865F2]/20 dark:text-[#8b9bff]">
                            <DiscordIcon className="h-10 w-10"/>
                        </div>
                        <div>
                            <h1 className="text-xl font-bold">Discord 서버 관리 권한 연결</h1>
                            <p className="mt-2 text-sm leading-6 text-default-500">
                                서버 소유자이거나 관리자 권한이 있는 서버만 불러옵니다. 로츠고는 승인 없이 서버 설정을 변경하지 않습니다.
                            </p>
                        </div>
                        <Button
                            as="a"
                            href="/api/integrations/discord/connect?mode=guilds&returnTo=%2Fsetting%3Ftab%3Ddiscord-guilds"
                            radius="lg"
                            className="bg-[#5865F2] px-6 font-semibold text-white"
                            startContent={<DiscordIcon className="h-5 w-5"/>}>
                            서버 관리 권한 연결
                        </Button>
                    </CardBody>
                </Card>
            </div>
        );
    }

    return (
        <div className="w-full space-y-5 pb-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <div className="flex items-center gap-2">
                        <h1 className="text-xl font-bold">Discord 길드 서버 관리</h1>
                        <Chip size="sm" radius="full" variant="flat" color="primary">관리자 전용</Chip>
                    </div>
                    <p className="mt-1 text-xs leading-5 text-default-500">서버별 기능과 권한을 한곳에서 설정하고 관리합니다.</p>
                </div>
                <Button
                    as="a"
                    href="/api/integrations/discord/connect?mode=guilds&returnTo=%2Fsetting%3Ftab%3Ddiscord-guilds"
                    size="sm"
                    radius="lg"
                    variant="flat"
                    className="font-semibold">
                    서버 권한 새로고침
                </Button>
            </div>

            <Card radius="lg" shadow="none" className="border border-default-200/80 dark:border-white/10">
                <CardBody className="gap-3 p-4 sm:flex-row sm:items-center">
                    <Avatar
                        showFallback
                        name={selectedGuild?.name ?? "Discord"}
                        src={selectedGuild ? guildIconUrl(selectedGuild) : undefined}
                        className="hidden h-12 w-12 shrink-0 bg-[#5865F2] text-white sm:flex"/>
                    <Select
                        label="관리할 Discord 서버"
                        placeholder="서버를 선택해 주세요"
                        selectedKeys={selectedGuildId ? new Set([selectedGuildId]) : new Set()}
                        onSelectionChange={keys => setSelectedGuildId(String(Array.from(keys)[0] ?? ""))}
                        className="grow"
                        radius="lg">
                        {guilds.map(guild => (
                            <SelectItem key={guild.id} textValue={guild.name}>
                                <div className="flex items-center justify-between gap-3">
                                    <span className="truncate font-medium">{guild.name}</span>
                                    <span className={guild.botInstalled ? "text-xs text-success" : "text-xs text-warning"}>
                                        {guild.botInstalled ? "봇 연결됨" : "봇 설치 필요"}
                                    </span>
                                </div>
                            </SelectItem>
                        ))}
                    </Select>
                    {selectedGuild ? (
                        <Chip
                            size="sm"
                            radius="full"
                            variant="flat"
                            color={selectedGuild.botInstalled ? "success" : "warning"}>
                            {selectedGuild.owner ? "서버 소유자" : "관리자"}
                        </Chip>
                    ) : null}
                </CardBody>
            </Card>

            <Tabs
                aria-label="Discord 서버 관리 기능"
                defaultSelectedKey="welcome-role"
                variant="solid"
                classNames={{
                    base: "w-full",
                    tabList: "w-full justify-start gap-1 rounded-xl border border-default-200/80 bg-default-100/70 p-1 dark:border-white/10 dark:bg-white/5",
                    tab: "h-10 w-auto px-4",
                    cursor: "bg-content1 shadow-sm dark:bg-white/10",
                    tabContent: "font-semibold group-data-[selected=true]:text-primary",
                    panel: "w-full px-0 pt-4"
                }}>
                <Tab key="welcome-role" title="입장 메시지 · 역할 지급">
                    <div className="w-full space-y-5">
                        {guilds.length === 0 ? (
                            <Card radius="lg" shadow="none" className="border border-default-200/80 dark:border-white/10">
                                <CardBody className="items-center gap-2 p-8 text-center">
                                    <p className="font-bold">관리 가능한 서버가 없습니다.</p>
                                    <p className="text-sm text-default-500">서버 소유자이거나 관리자 권한을 가진 Discord 계정인지 확인해 주세요.</p>
                                </CardBody>
                            </Card>
                        ) : null}

                        {selectedGuild && !selectedGuild.botInstalled ? (
                            <Card radius="lg" shadow="none" className="border border-warning-300/50 bg-warning-50/50 dark:border-warning-500/20 dark:bg-warning-500/5">
                                <CardBody className="gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <p className="font-bold text-warning-700 dark:text-warning-400">로츠고봇 설치가 필요합니다.</p>
                                        <p className="mt-1 text-sm leading-6 text-default-500">봇을 서버에 추가한 뒤 역할 목록에서 로츠고봇 역할을 지급할 역할보다 위로 이동해 주세요.</p>
                                    </div>
                                    <Button
                                        as="a"
                                        href={`https://discord.com/oauth2/authorize?client_id=${botUserId}&permissions=268520448&integration_type=0&scope=bot+applications.commands`}
                                        target="_blank"
                                        rel="noreferrer"
                                        radius="lg"
                                        color="warning"
                                        className="shrink-0 font-semibold">
                                        로츠고봇 초대
                                    </Button>
                                </CardBody>
                            </Card>
                        ) : null}

                        {isLoadingResources ? (
                            <LoadingComponent heightStyle="min-h-[360px]" message="서버의 채널과 역할을 확인하고 있어요"/>
                        ) : resources ? (
                            <div className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
                    <div className="min-w-0 space-y-4">
                        {!resources.botCanManageRoles ? (
                            <Card radius="lg" shadow="none" className="border border-danger-300/50 bg-danger-50/50 dark:border-danger-500/20 dark:bg-danger-500/5">
                                <CardBody className="p-4">
                                    <p className="text-sm font-bold text-danger">로츠고봇에 역할 관리 권한이 없습니다.</p>
                                    <p className="mt-1 text-xs leading-5 text-default-500">Discord 서버 설정에서 로츠고봇 역할에 ‘역할 관리’를 허용해야 역할을 지급할 수 있습니다.</p>
                                </CardBody>
                            </Card>
                        ) : null}

                        <Card radius="lg" shadow="none" className="border border-default-200/80 dark:border-white/10">
                            <CardBody className="gap-4 p-4 sm:p-5">
                                <div>
                                    <p className="font-bold">입장 메시지</p>
                                    <p className="mt-1 text-xs text-default-500">서버마다 하나의 메시지만 관리하며 다시 전송하면 기존 메시지가 수정됩니다.</p>
                                </div>
                                <Select
                                    label="메시지 전송 채널"
                                    placeholder="입장 채널 선택"
                                    selectedKeys={form.channelId ? new Set([form.channelId]) : new Set()}
                                    onSelectionChange={keys => updateForm("channelId", String(Array.from(keys)[0] ?? ""))}
                                    radius="lg">
                                    {resources.channels.map(channel => (
                                        <SelectItem key={channel.id} textValue={`#${channel.name}`}>#{channel.name}</SelectItem>
                                    ))}
                                </Select>
                                <Input
                                    label="임베드 제목"
                                    value={form.embedTitle}
                                    onValueChange={value => updateForm("embedTitle", value)}
                                    maxLength={256}
                                    radius="lg"/>
                                <Textarea
                                    label="임베드 본문"
                                    value={form.embedDescription}
                                    onValueChange={value => updateForm("embedDescription", value)}
                                    minRows={5}
                                    maxRows={10}
                                    maxLength={4096}
                                    radius="lg"/>
                            </CardBody>
                        </Card>

                        <Card radius="lg" shadow="none" className="border border-default-200/80 dark:border-white/10">
                            <CardBody className="gap-4 p-4 sm:p-5">
                                <div className="flex items-center justify-between gap-3">
                                    <div>
                                        <p className="font-bold">손님 이용 버튼</p>
                                        <p className="mt-1 text-xs text-default-500">누르면 별도 입력 없이 손님 역할을 지급합니다.</p>
                                    </div>
                                    <Chip size="sm" variant="flat" color="primary">필수</Chip>
                                </div>
                                <div className="grid gap-3 sm:grid-cols-2">
                                    <Input
                                        label="버튼 문구"
                                        value={form.guestButtonLabel}
                                        onValueChange={value => updateForm("guestButtonLabel", value)}
                                        maxLength={80}
                                        radius="lg"/>
                                    <Select
                                        label="지급할 손님 역할"
                                        placeholder="역할 선택"
                                        selectedKeys={form.guestRoleId ? new Set([form.guestRoleId]) : new Set()}
                                        onSelectionChange={keys => updateForm("guestRoleId", String(Array.from(keys)[0] ?? ""))}
                                        radius="lg">
                                        {resources.roles.map(role => (
                                            <SelectItem key={role.id} textValue={role.name}>
                                                <span style={{ color: roleColor(role.color) }} className="font-medium">{role.name}</span>
                                            </SelectItem>
                                        ))}
                                    </Select>
                                </div>
                            </CardBody>
                        </Card>

                        <Card radius="lg" shadow="none" className="border border-default-200/80 dark:border-white/10">
                            <CardBody className="gap-4 p-4 sm:p-5">
                                <div className="flex items-center justify-between gap-4">
                                    <div>
                                        <p className="font-bold">길드원 인증 버튼</p>
                                        <p className="mt-1 text-xs leading-5 text-default-500">비밀번호가 일치할 때만 선택한 역할을 지급합니다.</p>
                                    </div>
                                    <Switch
                                        isSelected={form.memberButtonEnabled}
                                        onValueChange={value => updateForm("memberButtonEnabled", value)}
                                        color="success"
                                        aria-label="길드원 인증 버튼 사용"/>
                                </div>
                                {form.memberButtonEnabled ? (
                                    <>
                                        <Divider/>
                                        <div className="grid gap-3 sm:grid-cols-2">
                                            <Input
                                                label="버튼 문구"
                                                value={form.memberButtonLabel}
                                                onValueChange={value => updateForm("memberButtonLabel", value)}
                                                maxLength={80}
                                                radius="lg"/>
                                            <Select
                                                label="지급할 길드원 역할"
                                                placeholder="역할 선택"
                                                selectedKeys={form.memberRoleId ? new Set([form.memberRoleId]) : new Set()}
                                                onSelectionChange={keys => updateForm("memberRoleId", String(Array.from(keys)[0] ?? ""))}
                                                radius="lg">
                                                {resources.roles.map(role => (
                                                    <SelectItem key={role.id} textValue={role.name}>
                                                        <span style={{ color: roleColor(role.color) }} className="font-medium">{role.name}</span>
                                                    </SelectItem>
                                                ))}
                                            </Select>
                                        </div>
                                        <Input
                                            type="password"
                                            label={savedConfig?.hasMemberPassword ? "새 비밀번호" : "인증 비밀번호"}
                                            placeholder={savedConfig?.hasMemberPassword ? "변경할 때만 입력해 주세요" : "4~64자로 입력해 주세요"}
                                            value={form.memberPassword}
                                            onValueChange={value => updateForm("memberPassword", value)}
                                            autoComplete="new-password"
                                            maxLength={64}
                                            description={savedConfig?.hasMemberPassword ? "비워 두면 기존 비밀번호를 유지합니다." : "Discord Modal에서 입력받으며 원문은 저장하지 않습니다."}
                                            radius="lg"/>
                                        <Switch
                                            isSelected={form.removeGuestRole}
                                            onValueChange={value => updateForm("removeGuestRole", value)}
                                            color="success">
                                            <span className="text-sm font-medium">길드원 역할 지급 후 손님 역할 자동 제거</span>
                                        </Switch>
                                    </>
                                ) : null}
                            </CardBody>
                        </Card>

                        <Card radius="lg" shadow="none" className="border border-warning-300/40 bg-warning-50/40 dark:border-warning-500/20 dark:bg-warning-500/5">
                            <CardBody className="p-4 text-xs leading-5 text-default-500">
                                <p className="font-bold text-warning-700 dark:text-warning-400">역할 안전 안내</p>
                                <p className="mt-1">관리자·역할 관리 등 위험 권한이 있거나 로츠고봇보다 높은 역할은 목록에서 제외됩니다. 지급 역할은 접근 권한만 가진 일반 역할로 구성해 주세요.</p>
                            </CardBody>
                        </Card>
                    </div>

                    <div className="min-w-0 xl:sticky xl:top-0 xl:self-start">
                        <Card radius="lg" shadow="none" className="overflow-hidden border border-default-200/80 dark:border-white/10">
                            <CardBody className="gap-4 p-4">
                                <div className="flex items-center justify-between gap-3">
                                    <p className="font-bold">Discord 미리보기</p>
                                    <Chip size="sm" variant="flat">#{resources.channels.find(channel => channel.id === form.channelId)?.name ?? "입장-채널"}</Chip>
                                </div>
                                <div className="rounded-xl bg-[#f2f3f5] p-4 text-[#313338] dark:bg-[#313338] dark:text-[#f2f3f5]">
                                    <div className="mb-3 flex items-center gap-2">
                                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#5865F2] text-white">
                                            <DiscordIcon className="h-5 w-5"/>
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold">로츠고봇 <span className="rounded bg-[#5865F2] px-1 py-0.5 text-[9px] text-white">앱</span></p>
                                            <p className="text-[10px] opacity-60">오늘</p>
                                        </div>
                                    </div>
                                    <div className="rounded border-l-4 border-[#5865F2] bg-white/70 p-3 dark:bg-[#2b2d31]">
                                        <p className="break-words text-sm font-bold">{form.embedTitle || "임베드 제목"}</p>
                                        <p className="mt-2 whitespace-pre-wrap break-words text-xs leading-5 opacity-80">{form.embedDescription || "임베드 본문을 입력해 주세요."}</p>
                                    </div>
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        <span className="rounded bg-[#5865F2] px-3 py-2 text-xs font-semibold text-white">{form.guestButtonLabel || "이용하기"}</span>
                                        {form.memberButtonEnabled ? (
                                            <span className="rounded bg-[#248046] px-3 py-2 text-xs font-semibold text-white">{form.memberButtonLabel || "길드원 인증"}</span>
                                        ) : null}
                                    </div>
                                </div>
                                <div className="grid gap-2">
                                    <Button
                                        radius="lg"
                                        color="primary"
                                        className="font-semibold"
                                        isLoading={isSaving}
                                        isDisabled={!isDirty || isPublishing}
                                        onPress={save}>
                                        설정 저장
                                    </Button>
                                    <Button
                                        radius="lg"
                                        variant="flat"
                                        color="success"
                                        className="font-semibold"
                                        isLoading={isPublishing}
                                        isDisabled={!savedConfig || isDirty || isSaving || !resources.botCanManageRoles}
                                        onPress={publish}>
                                        {savedConfig?.messageId ? "기존 메시지에 반영" : "메시지 보내기"}
                                    </Button>
                                    {savedConfig?.messageUrl ? (
                                        <Button
                                            as="a"
                                            href={savedConfig.messageUrl}
                                            target="_blank"
                                            rel="noreferrer"
                                            radius="lg"
                                            variant="light"
                                            className="font-semibold">
                                            Discord에서 메시지 열기
                                        </Button>
                                    ) : null}
                                </div>
                                {isDirty ? <p className="text-center text-xs text-warning">변경 내용을 저장한 뒤 메시지에 반영할 수 있습니다.</p> : null}
                            </CardBody>
                        </Card>
                    </div>
                            </div>
                        ) : null}
                    </div>
                </Tab>
            </Tabs>
        </div>
    );
}
