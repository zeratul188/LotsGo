import { useEffect, useMemo, useState } from "react";
import {
    addToast,
    Button,
    Card,
    CardBody,
    Chip,
    Divider,
    Input,
    Select,
    SelectItem,
    Switch,
    Textarea
} from "@heroui/react";
import DiscordIcon from "@/Icons/DiscordIcon";
import { LoadingComponent } from "../../UtilsCompnents";
import DiscordBotInstallNotice from "./DiscordBotInstallNotice";
import type {
    DiscordGuildResources,
    DiscordNicknameConfig,
    DiscordNicknameForm
} from "../model/discordGuildTypes";

type Props = {
    selectedGuildId: string,
    botInstalled: boolean,
    botUserId: string
};

type NicknameResources = DiscordGuildResources & {
    nicknameConfig: DiscordNicknameConfig | null
};

const defaultForm: DiscordNicknameForm = {
    channelId: "",
    embedTitle: "로스트아크 닉네임 변경",
    embedDescription: "아래 버튼을 눌러 로스트아크 캐릭터명을 입력하면 Discord 닉네임을 변경할 수 있습니다.",
    buttonLabel: "닉네임 변경",
    validateCharacter: true,
    grantRoleEnabled: false,
    grantRoleId: ""
};

function toForm(config: DiscordNicknameConfig | null): DiscordNicknameForm {
    if (!config) return { ...defaultForm };
    return {
        channelId: config.channelId,
        embedTitle: config.embedTitle,
        embedDescription: config.embedDescription,
        buttonLabel: config.buttonLabel,
        validateCharacter: config.validateCharacter,
        grantRoleEnabled: config.grantRoleEnabled,
        grantRoleId: config.grantRoleId
    };
}

async function responseError(response: Response, fallback: string): Promise<Error> {
    const data = await response.json().catch(() => null) as { error?: unknown } | null;
    return new Error(typeof data?.error === "string" ? data.error : fallback);
}

function roleColor(color: number): string {
    return color > 0 ? `#${color.toString(16).padStart(6, "0")}` : "#99aab5";
}

export default function DiscordNicknameForm({ selectedGuildId, botInstalled, botUserId }: Props) {
    const [resources, setResources] = useState<NicknameResources | null>(null);
    const [savedConfig, setSavedConfig] = useState<DiscordNicknameConfig | null>(null);
    const [form, setForm] = useState<DiscordNicknameForm>({ ...defaultForm });
    const [isLoading, setLoading] = useState(false);
    const [isSaving, setSaving] = useState(false);
    const [isPublishing, setPublishing] = useState(false);

    const isDirty = useMemo(() => {
        return JSON.stringify(form) !== JSON.stringify(toForm(savedConfig));
    }, [form, savedConfig]);

    useEffect(() => {
        if (!selectedGuildId || !botInstalled) {
            setResources(null);
            setSavedConfig(null);
            setForm({ ...defaultForm });
            return;
        }

        let cancelled = false;
        const load = async () => {
            setLoading(true);
            try {
                const response = await fetch(`/api/integrations/discord/guilds/${selectedGuildId}/nickname`, {
                    credentials: "include",
                    cache: "no-store"
                });
                if (!response.ok) throw await responseError(response, "닉네임 변경 설정을 불러오지 못했습니다.");
                const data = await response.json() as NicknameResources;
                if (cancelled) return;
                setResources(data);
                setSavedConfig(data.nicknameConfig);
                setForm(toForm(data.nicknameConfig));
            } catch (error) {
                if (!cancelled) addToast({
                    title: "닉네임 설정 조회 오류",
                    description: error instanceof Error ? error.message : "닉네임 변경 설정을 불러오지 못했습니다.",
                    color: "danger"
                });
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        void load();
        return () => { cancelled = true; };
    }, [selectedGuildId, botInstalled]);

    const updateForm = <K extends keyof DiscordNicknameForm>(key: K, value: DiscordNicknameForm[K]) => {
        setForm(current => ({ ...current, [key]: value }));
    };

    const save = async () => {
        if (!selectedGuildId) return;
        setSaving(true);
        try {
            const response = await fetch(`/api/integrations/discord/guilds/${selectedGuildId}/nickname`, {
                method: "PUT",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form)
            });
            if (!response.ok) throw await responseError(response, "닉네임 변경 설정을 저장하지 못했습니다.");
            const data = await response.json() as { message: string, config: DiscordNicknameConfig };
            setSavedConfig(data.config);
            setForm(toForm(data.config));
            addToast({ title: "설정 저장 완료", description: data.message, color: "success" });
        } catch (error) {
            addToast({
                title: "설정 저장 오류",
                description: error instanceof Error ? error.message : "닉네임 변경 설정을 저장하지 못했습니다.",
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
            const response = await fetch(`/api/integrations/discord/guilds/${selectedGuildId}/nickname`, {
                method: "POST",
                credentials: "include"
            });
            if (!response.ok) throw await responseError(response, "닉네임 변경 메시지를 전송하지 못했습니다.");
            const data = await response.json() as { message: string, config: DiscordNicknameConfig };
            setSavedConfig(data.config);
            addToast({ title: "Discord 메시지 반영 완료", description: data.message, color: "success" });
        } catch (error) {
            addToast({
                title: "메시지 전송 오류",
                description: error instanceof Error ? error.message : "닉네임 변경 메시지를 전송하지 못했습니다.",
                color: "danger"
            });
        } finally {
            setPublishing(false);
        }
    };

    if (!botInstalled) {
        return <DiscordBotInstallNotice botUserId={botUserId}/>;
    }

    if (isLoading) return <LoadingComponent heightStyle="min-h-[360px]" message="닉네임 변경 설정을 불러오고 있어요"/>;
    if (!resources) return null;

    return (
        <div className="w-full space-y-5">
            {!resources.botCanManageNicknames ? (
                <Card radius="lg" shadow="none" className="border border-danger-300/50 bg-danger-50/50 dark:border-danger-500/20 dark:bg-danger-500/5">
                    <CardBody className="p-4">
                        <p className="text-sm font-bold text-danger">로츠고봇에 닉네임 관리 권한이 없습니다.</p>
                        <p className="mt-1 text-xs leading-5 text-default-500">Discord 서버 설정에서 로츠고봇 역할에 ‘닉네임 관리’를 허용하고, 봇 역할을 일반 회원보다 위로 이동해 주세요.</p>
                    </CardBody>
                </Card>
            ) : null}

            <div className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
                <div className="min-w-0 space-y-4">
                    <Card radius="lg" shadow="none" className="border border-default-200/80 dark:border-white/10">
                        <CardBody className="gap-4 p-4 sm:p-5">
                            <div>
                                <p className="font-bold">닉네임 변경 메시지</p>
                                <p className="mt-1 text-xs text-default-500">버튼을 누르면 Discord Modal에서 변경할 로스트아크 캐릭터명을 입력받습니다.</p>
                            </div>
                            <Select
                                label="메시지 전송 채널"
                                placeholder="채널 선택"
                                selectedKeys={form.channelId ? new Set([form.channelId]) : new Set()}
                                onSelectionChange={keys => updateForm("channelId", String(Array.from(keys)[0] ?? ""))}
                                radius="lg">
                                {resources.channels.map(channel => (
                                    <SelectItem key={channel.id} textValue={`#${channel.name}`}>#{channel.name}</SelectItem>
                                ))}
                            </Select>
                            <Input label="임베드 제목" value={form.embedTitle} onValueChange={value => updateForm("embedTitle", value)} maxLength={256} radius="lg"/>
                            <Textarea label="임베드 본문" value={form.embedDescription} onValueChange={value => updateForm("embedDescription", value)} minRows={5} maxRows={10} maxLength={4096} radius="lg"/>
                            <Input label="버튼 문구" value={form.buttonLabel} onValueChange={value => updateForm("buttonLabel", value)} maxLength={80} radius="lg"/>
                        </CardBody>
                    </Card>

                    <Card radius="lg" shadow="none" className="border border-default-200/80 dark:border-white/10">
                        <CardBody className="gap-4 p-4 sm:p-5">
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <p className="font-bold">로스트아크 캐릭터 확인</p>
                                    <p className="mt-1 text-xs leading-5 text-default-500">실제로 존재하는 로스트아크 캐릭터명일 때만 닉네임을 변경합니다.</p>
                                </div>
                                <Switch isSelected={form.validateCharacter} onValueChange={value => updateForm("validateCharacter", value)} color="success" aria-label="로스트아크 캐릭터 확인"/>
                            </div>
                            <Divider/>
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <p className="font-bold">닉네임 변경 후 역할 지급</p>
                                    <p className="mt-1 text-xs leading-5 text-default-500">닉네임 변경과 함께 선택한 역할을 지급합니다.</p>
                                </div>
                                <Switch isSelected={form.grantRoleEnabled} onValueChange={value => updateForm("grantRoleEnabled", value)} color="success" aria-label="닉네임 변경 후 역할 지급"/>
                            </div>
                            {form.grantRoleEnabled ? (
                                <Select
                                    label="자동 지급 역할"
                                    placeholder="역할 선택"
                                    selectedKeys={form.grantRoleId ? new Set([form.grantRoleId]) : new Set()}
                                    onSelectionChange={keys => updateForm("grantRoleId", String(Array.from(keys)[0] ?? ""))}
                                    radius="lg">
                                    {resources.roles.map(role => (
                                        <SelectItem key={role.id} textValue={role.name}>
                                            <span style={{ color: roleColor(role.color) }} className="font-medium">{role.name}</span>
                                        </SelectItem>
                                    ))}
                                </Select>
                            ) : null}
                        </CardBody>
                    </Card>
                </div>

                <div className="min-w-0 xl:sticky xl:top-0 xl:self-start">
                    <Card radius="lg" shadow="none" className="overflow-hidden border border-default-200/80 dark:border-white/10">
                        <CardBody className="gap-4 p-4">
                            <div className="flex items-center justify-between gap-3">
                                <p className="font-bold">Discord 미리보기</p>
                                <Chip size="sm" variant="flat">#{resources.channels.find(channel => channel.id === form.channelId)?.name ?? "닉네임-변경"}</Chip>
                            </div>
                            <div className="rounded-xl bg-[#f2f3f5] p-4 text-[#313338] dark:bg-[#313338] dark:text-[#f2f3f5]">
                                <div className="mb-3 flex items-center gap-2">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#5865F2] text-white"><DiscordIcon className="h-5 w-5"/></div>
                                    <div><p className="text-sm font-bold">로츠고봇 <span className="rounded bg-[#5865F2] px-1 py-0.5 text-[9px] text-white">앱</span></p><p className="text-[10px] opacity-60">오늘</p></div>
                                </div>
                                <div className="rounded border-l-4 border-[#5865F2] bg-white/70 p-3 dark:bg-[#2b2d31]">
                                    <p className="break-words text-sm font-bold">{form.embedTitle || "임베드 제목"}</p>
                                    <p className="mt-2 whitespace-pre-wrap break-words text-xs leading-5 opacity-80">{form.embedDescription || "임베드 본문을 입력해 주세요."}</p>
                                </div>
                                <div className="mt-2 flex flex-wrap gap-2"><span className="rounded bg-[#5865F2] px-3 py-2 text-xs font-semibold text-white">{form.buttonLabel || "닉네임 변경"}</span></div>
                            </div>
                            <div className="grid gap-2">
                                <Button radius="lg" color="primary" className="font-semibold" isLoading={isSaving} isDisabled={!isDirty || isPublishing} onPress={save}>설정 저장</Button>
                                <Button radius="lg" variant="flat" color="success" className="font-semibold" isLoading={isPublishing} isDisabled={!savedConfig || isDirty || isSaving || !resources.botCanManageNicknames} onPress={publish}>{savedConfig?.messageId ? "기존 메시지에 반영" : "메시지 보내기"}</Button>
                                {savedConfig?.messageUrl ? <Button as="a" href={savedConfig.messageUrl} target="_blank" rel="noreferrer" radius="lg" variant="light" className="font-semibold">Discord에서 메시지 열기</Button> : null}
                            </div>
                            {isDirty ? <p className="text-center text-xs text-warning">변경 내용을 저장한 뒤 메시지에 반영할 수 있습니다.</p> : null}
                        </CardBody>
                    </Card>
                </div>
            </div>
        </div>
    );
}
