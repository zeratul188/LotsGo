'use client'

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
    addToast,
    Avatar,
    Button,
    Checkbox,
    Input,
    Link,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader
} from "@heroui/react";
import DiscordIcon from "@/Icons/DiscordIcon";
import { LoadingComponent } from "@/app/UtilsCompnents";
import { ExpeditionComponent, LogoComponent, useSignupForm } from "../SignupForm";
import { useOnClickExpeditionCheck } from "../signupFeat";

type DiscordProfile = {
    id: string,
    username: string,
    globalName: string | null,
    avatar: string | null
}

const errorMessages: Record<string, string> = {
    INVALID_ID: "아이디는 영문과 숫자 조합 4~20자로 입력해 주세요.",
    INVALID_EMAIL: "올바른 이메일 주소를 입력해 주세요.",
    INVALID_CHARACTER: "대표 캐릭터 이름을 다시 확인해 주세요.",
    INVALID_PASSWORD: "비밀번호는 6~18자로 입력하고 비밀번호 확인과 일치시켜 주세요.",
    INVALID_EXPEDITION: "대표 캐릭터의 원정대 정보를 다시 확인해 주세요.",
    PRIVACY_REQUIRED: "개인정보 수집 및 이용에 동의해 주세요.",
    SIGNUP_INTENT_EXPIRED: "Discord 인증 시간이 만료되었습니다. 로그인 페이지에서 다시 인증해 주세요."
};

export default function DiscordSignupClient() {
    const router = useRouter();
    const form = useSignupForm();
    const [profile, setProfile] = useState<DiscordProfile | null>(null);
    const [isProfileLoading, setProfileLoading] = useState(true);
    const [duplicatePrompt, setDuplicatePrompt] = useState(false);
    const [duplicateMessage, setDuplicateMessage] = useState("");
    const onClickExpeditionCheck = useOnClickExpeditionCheck(
        form.member,
        form.setExpeditionChecked,
        form.setExpedition
    );

    useEffect(() => {
        const loadIntent = async () => {
            try {
                const response = await fetch("/api/auth/discord/signup", { credentials: "include", cache: "no-store" });
                const data = await response.json().catch(() => null);
                if (!response.ok || !data?.user) throw new Error(data?.code ?? "SIGNUP_INTENT_LOAD_FAILED");
                setProfile(data.user as DiscordProfile);
            } catch (error) {
                addToast({
                    title: "Discord 인증 정보 만료",
                    description: errorMessages[error instanceof Error ? error.message : ""] ?? "Discord 인증을 다시 진행해 주세요.",
                    color: "danger"
                });
                router.replace("/login");
            } finally {
                setProfileLoading(false);
            }
        };
        void loadIntent();
    }, [router]);

    const showDuplicatePrompt = (fields: string[]) => {
        const label = fields.includes("id") && fields.includes("email")
            ? "아이디와 이메일이"
            : fields.includes("email") ? "이메일이" : "아이디가";
        setDuplicateMessage(`${label} 이미 가입된 계정에 사용되고 있습니다.`);
        setDuplicatePrompt(true);
    };

    const checkField = async (field: "id" | "email") => {
        if (field === "id") {
            form.setDuplicateChecked(prev => ({ ...prev, isChecking: true, isError: false }));
        } else {
            form.setEmailChecked(prev => ({ ...prev, isLoading: true }));
        }
        try {
            const value = field === "id" ? form.member.id : form.member.email;
            const response = await fetch("/api/auth/discord/signup", {
                method: "PUT",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ field, value })
            });
            const data = await response.json().catch(() => null);
            if (!response.ok) throw new Error(data?.code ?? "SIGNUP_CHECK_FAILED");
            if (!data.available) {
                if (field === "id") form.setDuplicateChecked({ isDuplicateChecked: false, isChecking: false, isError: true });
                else form.setEmailChecked({ isCheck: false, isLoading: false });
                showDuplicatePrompt(data.duplicateFields ?? [field]);
                return;
            }
            if (field === "id") form.setDuplicateChecked({ isDuplicateChecked: true, isChecking: false, isError: false });
            else form.setEmailChecked({ isCheck: true, isLoading: false });
            addToast({
                title: `${field === "id" ? "아이디" : "이메일"} 사용 가능`,
                description: `입력한 ${field === "id" ? "아이디" : "이메일"}을 사용할 수 있습니다.`,
                color: "success"
            });
        } catch (error) {
            const code = error instanceof Error ? error.message : "";
            addToast({
                title: "중복 확인 오류",
                description: errorMessages[code] ?? "중복 여부를 확인하지 못했습니다.",
                color: "danger"
            });
            if (field === "id") form.setDuplicateChecked(prev => ({ ...prev, isChecking: false }));
            else form.setEmailChecked(prev => ({ ...prev, isLoading: false }));
        }
    };

    const cancelSignup = async (goToLogin = true) => {
        await fetch("/api/auth/discord/signup", { method: "DELETE", credentials: "include" }).catch(() => undefined);
        if (goToLogin) router.push("/login");
    };

    const continueWithExistingAccount = async () => {
        setDuplicatePrompt(false);
        await cancelSignup(false);
        router.push(`/login?returnTo=${encodeURIComponent("/setting?tab=discord")}`);
    };

    const submit = async () => {
        if (!form.duplicateChecked.isDuplicateChecked || !form.emailChecked.isCheck) {
            addToast({ title: "중복 확인 필요", description: "아이디와 이메일 중복 확인을 완료해 주세요.", color: "danger" });
            return;
        }
        if (!form.expeditionChecked.isExpeditionChecked) {
            addToast({ title: "원정대 확인 필요", description: "대표 캐릭터의 원정대 확인을 완료해 주세요.", color: "danger" });
            return;
        }
        if (!form.isPrivacyPolicyAgreed) {
            addToast({ title: "개인정보 수집 미동의", description: "개인정보 수집 및 이용에 동의해 주세요.", color: "danger" });
            return;
        }

        form.setLoading(true);
        try {
            const response = await fetch("/api/auth/discord/signup", {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...form.member,
                    expedition: form.expedition,
                    privacyAccepted: form.isPrivacyPolicyAgreed
                })
            });
            const data = await response.json().catch(() => null);
            if (response.status === 409) {
                showDuplicatePrompt(data?.duplicateFields ?? []);
                return;
            }
            if (!response.ok || typeof data?.completionUrl !== "string") {
                throw new Error(data?.code ?? "DISCORD_SIGNUP_FAILED");
            }
            window.location.href = data.completionUrl;
        } catch (error) {
            const code = error instanceof Error ? error.message : "";
            addToast({
                title: "회원가입 오류",
                description: errorMessages[code] ?? "Discord 회원가입을 완료하지 못했습니다. 잠시 후 다시 시도해 주세요.",
                color: "danger"
            });
            if (code === "SIGNUP_INTENT_EXPIRED") router.replace("/login");
        } finally {
            form.setLoading(false);
        }
    };

    if (isProfileLoading || !profile) {
        return <LoadingComponent heightStyle="min-h-[calc(100vh-65px)]" message="Discord 인증 정보를 확인하고 있어요"/>;
    }

    const displayName = profile.globalName || profile.username;
    const avatarUrl = profile.avatar
        ? `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png?size=128`
        : undefined;

    return (
        <main className="relative min-h-[calc(100vh-65px)] overflow-hidden bg-gray-50/70 px-4 py-8 sm:px-6 lg:py-12 dark:bg-[#111111]">
            <div className="relative mx-auto min-w-0 w-full max-w-3xl rounded-2xl border border-gray-200/80 bg-white px-5 py-8 shadow-[0_20px_60px_rgba(15,23,42,0.08)] sm:px-10 sm:py-10 dark:border-white/10 dark:bg-[#171717] dark:shadow-none">
                <LogoComponent className="w-[190px]"/>
                <div className="mt-8 flex items-center gap-3 rounded-2xl border border-[#5865F2]/20 bg-[#5865F2]/[0.06] p-4 dark:bg-[#5865F2]/10">
                    <Avatar showFallback name={displayName} src={avatarUrl} className="h-12 w-12 bg-[#5865F2] text-white"/>
                    <div className="min-w-0 grow">
                        <div className="flex items-center gap-2">
                            <p className="truncate font-bold">{displayName}</p>
                            <span className="shrink-0 text-xs text-default-400">인증된 Discord 계정</span>
                        </div>
                        <p className="mt-1 truncate text-sm text-default-500">@{profile.username}</p>
                    </div>
                    <DiscordIcon className="h-6 w-6 shrink-0 text-[#5865F2]"/>
                </div>

                <div className="mb-8 mt-8">
                    <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Discord 회원가입</h1>
                    <p className="mt-2 text-sm text-default-500">필수 정보를 모두 입력하면 Discord 계정이 자동으로 연동되고 로그인됩니다.</p>
                </div>

                <div className="space-y-7">
                    <div className="space-y-2">
                        <p className="font-medium">아이디</p>
                        <div className="flex flex-col gap-2 sm:flex-row">
                            <Input
                                size="lg" radius="sm" variant="bordered" maxLength={20}
                                value={form.member.id}
                                isDisabled={form.duplicateChecked.isDuplicateChecked}
                                isInvalid={form.duplicateChecked.isError}
                                errorMessage="이미 사용 중인 아이디입니다."
                                placeholder="4~20글자 영문과 숫자로 입력하세요."
                                onValueChange={value => {
                                    form.setMember(prev => ({ ...prev, id: value }));
                                    form.setDuplicateChecked({ isDuplicateChecked: false, isChecking: false, isError: false });
                                }}/>
                            <Button size="lg" radius="sm" color="primary" variant="flat" className="w-full shrink-0 font-semibold sm:w-32"
                                isLoading={form.duplicateChecked.isChecking} isDisabled={form.duplicateChecked.isDuplicateChecked}
                                onPress={() => void checkField("id")}>
                                {form.duplicateChecked.isDuplicateChecked ? "사용 가능" : "중복 확인"}
                            </Button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <p className="font-medium">대표 캐릭터 이름</p>
                        <div className="flex flex-col gap-2 sm:flex-row">
                            <Input size="lg" radius="sm" variant="bordered" value={form.member.character}
                                isDisabled={form.expeditionChecked.isExpeditionChecked}
                                isInvalid={form.expeditionChecked.isError}
                                errorMessage="원정대 정보를 불러오지 못했습니다."
                                placeholder="대표 캐릭터 이름을 입력하세요."
                                onValueChange={value => {
                                    form.setMember(prev => ({ ...prev, character: value }));
                                    form.setExpeditionChecked({ isExpeditionChecked: false, isChecking: false, isError: false });
                                    form.setExpedition([]);
                                }}/>
                            <Button size="lg" radius="sm" color="primary" variant="flat" className="w-full shrink-0 font-semibold sm:w-32"
                                isLoading={form.expeditionChecked.isChecking} isDisabled={form.expeditionChecked.isExpeditionChecked}
                                onPress={onClickExpeditionCheck}>
                                {form.expeditionChecked.isExpeditionChecked ? "확인 완료" : "원정대 확인"}
                            </Button>
                        </div>
                    </div>

                    <ExpeditionComponent expedition={form.expedition}/>

                    <div className="space-y-2">
                        <p className="font-medium">이메일</p>
                        <div className="flex flex-col gap-2 sm:flex-row">
                            <Input size="lg" radius="sm" variant="bordered" type="email" value={form.member.email}
                                isDisabled={form.emailChecked.isCheck} placeholder="ex) test@example.com"
                                onValueChange={value => {
                                    form.setMember(prev => ({ ...prev, email: value }));
                                    form.setEmailChecked({ isCheck: false, isLoading: false });
                                }}/>
                            <Button size="lg" radius="sm" color="primary" variant="flat" className="w-full shrink-0 font-semibold sm:w-32"
                                isLoading={form.emailChecked.isLoading} isDisabled={form.emailChecked.isCheck}
                                onPress={() => void checkField("email")}>
                                {form.emailChecked.isCheck ? "확인 완료" : "중복 확인"}
                            </Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <div className="space-y-2">
                            <p className="font-medium">비밀번호</p>
                            <Input size="lg" radius="sm" variant="bordered" type="password" value={form.member.password}
                                placeholder="6~18글자 내로 입력하세요."
                                onValueChange={value => form.setMember(prev => ({ ...prev, password: value }))}/>
                        </div>
                        <div className="space-y-2">
                            <p className="font-medium">비밀번호 확인</p>
                            <Input size="lg" radius="sm" variant="bordered" type="password" value={form.member.passwordCheck}
                                isInvalid={form.member.password !== form.member.passwordCheck}
                                errorMessage="입력한 비밀번호와 일치해야 합니다."
                                placeholder="비밀번호를 다시 입력하세요."
                                onValueChange={value => form.setMember(prev => ({ ...prev, passwordCheck: value }))}/>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2 rounded-xl border border-gray-200/80 bg-gray-50/60 p-4 sm:flex-row sm:items-center dark:border-white/10 dark:bg-white/[0.025]">
                        <Checkbox size="lg" isSelected={form.isPrivacyPolicyAgreed} onValueChange={form.setPrivacyPolicyAgreed}>
                            개인정보 수집 및 이용에 동의합니다.
                        </Checkbox>
                        <Link className="w-max text-sm sm:ml-auto" underline="hover" href="/policy">자세히 보기</Link>
                    </div>

                    <Button fullWidth size="lg" radius="sm" color="primary" className="font-semibold" isLoading={form.isLoading} onPress={() => void submit()}>
                        가입하고 Discord로 로그인
                    </Button>
                    <Button fullWidth radius="sm" variant="light" className="text-default-500" onPress={() => void cancelSignup()}>
                        가입 취소
                    </Button>
                </div>
            </div>

            <Modal isOpen={duplicatePrompt} onOpenChange={setDuplicatePrompt} placement="center">
                <ModalContent>
                    <ModalHeader>기존 계정 안내</ModalHeader>
                    <ModalBody>
                        <p>{duplicateMessage}</p>
                        <p className="text-sm text-default-500">기존 계정으로 로그인한 뒤 Discord 연동 화면으로 이동하시겠습니까?</p>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="light" onPress={() => setDuplicatePrompt(false)}>아니요</Button>
                        <Button color="primary" onPress={() => void continueWithExistingAccount()}>예</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </main>
    );
}
