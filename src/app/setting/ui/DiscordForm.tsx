import { useEffect, useRef, useState } from "react";
import { addToast, Avatar, Button, Card, CardBody, Chip } from "@heroui/react";
import { useSearchParams } from "next/navigation";
import DiscordIcon from "@/Icons/DiscordIcon";
import type { DiscordConnectionStatus } from "../model/discordTypes";
import { LoadingComponent } from "../../UtilsCompnents";
import { signOut } from "firebase/auth";
import Cookies from "js-cookie";
import { auth } from "@/utiils/firebase";

const resultMessages: Record<string, { title: string, description: string, color: "success" | "danger" | "warning" }> = {
    connected: {
        title: "Discord 연동 완료",
        description: "Discord 계정이 로츠고 계정에 연결되었습니다.",
        color: "success"
    },
    refreshed: {
        title: "Discord 프로필 갱신 완료",
        description: "최신 Discord 닉네임과 프로필 사진을 반영했습니다.",
        color: "success"
    },
    cancelled: {
        title: "Discord 연동 취소",
        description: "Discord 계정 연동을 취소했습니다.",
        color: "warning"
    },
    "lotsgo-already-linked": {
        title: "이미 연동된 계정",
        description: "이 로츠고 계정에는 다른 Discord 계정이 연결되어 있습니다.",
        color: "danger"
    },
    "discord-already-linked": {
        title: "이미 사용 중인 Discord 계정",
        description: "이 Discord 계정은 다른 로츠고 계정에 연결되어 있습니다.",
        color: "danger"
    },
    "session-error": {
        title: "로그인 정보 만료",
        description: "다시 로그인한 뒤 Discord 연동을 시도해 주세요.",
        color: "danger"
    },
    "state-error": {
        title: "연동 요청 만료",
        description: "안전한 연동을 위해 처음부터 다시 시도해 주세요.",
        color: "danger"
    },
    "configuration-error": {
        title: "Discord 설정 오류",
        description: "Discord 연동 설정을 확인해 주세요.",
        color: "danger"
    },
    "oauth-error": {
        title: "Discord 인증 오류",
        description: "Discord 인증 요청을 완료하지 못했습니다.",
        color: "danger"
    },
    "callback-error": {
        title: "Discord 연동 오류",
        description: "Discord 계정을 연결하지 못했습니다. 잠시 후 다시 시도해 주세요.",
        color: "danger"
    }
};


function formatConnectedAt(value: string | null): string {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";
    return new Intl.DateTimeFormat("ko-KR", {
        dateStyle: "medium",
        timeStyle: "short"
    }).format(date);
}

export default function DiscordComponent() {
    const searchParams = useSearchParams();
    const shownResult = useRef<string | null>(null);
    const [status, setStatus] = useState<DiscordConnectionStatus | null>(null);
    const [isLoading, setLoading] = useState(true);
    const [isUnlinking, setUnlinking] = useState(false);

    const loadStatus = async () => {
        setLoading(true);
        try {
            const response = await fetch("/api/integrations/discord", {
                credentials: "include",
                cache: "no-store"
            });
            if (!response.ok) throw new Error("DISCORD_STATUS_FAILED");
            setStatus(await response.json() as DiscordConnectionStatus);
        } catch {
            addToast({
                title: "데이터 로드 오류",
                description: "Discord 연동 정보를 불러오지 못했습니다.",
                color: "danger"
            });
            setStatus({ linked: false });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void loadStatus();
    }, []);

    useEffect(() => {
        const result = searchParams.get("discord");
        if (!result || shownResult.current === result) return;
        shownResult.current = result;
        const message = resultMessages[result];
        if (message) addToast(message);
    }, [searchParams]);


    const unlink = async () => {
        setUnlinking(true);
        try {
            const response = await fetch("/api/integrations/discord", {
                method: "DELETE",
                credentials: "include"
            });
            if (!response.ok) throw new Error("DISCORD_UNLINK_FAILED");
            const data = await response.json() as { loggedOut?: boolean };
            setStatus({ linked: false });
            window.dispatchEvent(new CustomEvent("discord-connection-changed"));
            if (data.loggedOut) {
                sessionStorage.removeItem("token");
                sessionStorage.removeItem("user");
                localStorage.removeItem("sessionExpiresAt");
                localStorage.removeItem("userSettings");
                Cookies.remove("userApiKey", { path: "/" });
                await signOut(auth).catch(() => undefined);
                window.location.href = "/login?discord=unlinked";
                return;
            }
            addToast({
                title: "Discord 연동 해제",
                description: "Discord 계정 연동을 해제했습니다.",
                color: "success"
            });
        } catch {
            addToast({
                title: "Discord 연동 해제 오류",
                description: "Discord 계정 연동을 해제하지 못했습니다.",
                color: "danger"
            });
        } finally {
            setUnlinking(false);
        }
    };

    if (isLoading || !status) {
        return <LoadingComponent heightStyle="min-h-[320px]" message="Discord 연동 정보를 확인하고 있어요"/>;
    }

    const displayName = status.linked
        ? status.user.globalName || status.user.username
        : "";
    const avatarUrl = status.linked && status.user.avatar
        ? `https://cdn.discordapp.com/avatars/${status.user.id}/${status.user.avatar}.png?size=128`
        : undefined;

    return (
        <div className="w-full space-y-4">
            <div className="flex items-center justify-between gap-3">
                <div>
                    <h1 className="text-xl font-bold">Discord 연동</h1>
                    <p className="mt-1 text-xs text-default-500">Discord 봇에서 내 숙제 현황을 확인할 계정을 연결합니다.</p>
                </div>
                <Chip
                    size="sm"
                    radius="full"
                    variant="flat"
                    color={status.linked ? "success" : "default"}>
                    {status.linked ? "연동됨" : "미연동"}
                </Chip>
            </div>

            <Card radius="lg" shadow="none" className="border border-default-200/80 dark:border-white/10">
                <CardBody className="gap-5 p-4 sm:p-5">
                    {status.linked ? (
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                            <Avatar
                                showFallback
                                name={displayName}
                                src={avatarUrl}
                                className="h-14 w-14 bg-[#5865F2] text-white"/>
                            <div className="min-w-0 grow">
                                <p className="truncate text-base font-bold">{displayName}</p>
                                <p className="mt-1 truncate text-sm text-default-500">@{status.user.username}</p>
                                <p className="mt-2 text-xs text-default-400">연동일: {formatConnectedAt(status.user.connectedAt)}</p>
                            </div>
                            <Button
                                radius="lg"
                                color="danger"
                                variant="flat"
                                isLoading={isUnlinking}
                                onPress={unlink}
                                className="w-full font-semibold sm:w-auto">
                                연동 해제
                            </Button>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#5865F2]/10 text-[#5865F2] dark:bg-[#5865F2]/20 dark:text-[#8b9bff]">
                                <DiscordIcon className="h-9 w-9"/>
                            </div>
                            <div className="grow">
                                <p className="text-base font-bold">Discord 계정을 연결해 주세요</p>
                                <p className="mt-1 text-sm leading-6 text-default-500">연동 후 Discord 사용자 ID를 통해 본인의 로츠고 숙제 데이터만 조회할 수 있습니다.</p>
                            </div>
                            <Button
                                as="a"
                                href="/api/integrations/discord/connect"
                                radius="lg"
                                className="w-full bg-[#5865F2] font-semibold text-white sm:w-auto"
                                startContent={<DiscordIcon className="h-5 w-5"/>}>
                                Discord 계정 연동
                            </Button>
                        </div>
                    )}
                </CardBody>
            </Card>

            <Card radius="lg" shadow="none" className="border border-default-200/80 dark:border-white/10">
                <CardBody className="gap-3 p-4">
                    <p className="text-sm font-semibold">연동 안내</p>
                    <ul className="list-disc space-y-1.5 pl-5 text-xs leading-5 text-default-500">
                        <li>로츠고 계정과 Discord 계정은 각각 하나씩만 연결할 수 있습니다.</li>
                        <li>Discord 비밀번호와 이메일은 저장하지 않습니다.</li>
                        <li>연동에는 Discord 사용자 ID, 사용자명, 표시 이름, 프로필 이미지 정보가 사용됩니다.</li>
                        <li>연동을 해제하면 Discord 봇에서 숙제 현황을 조회할 수 없습니다.</li>
                    </ul>
                </CardBody>
            </Card>
        </div>
    );
}
