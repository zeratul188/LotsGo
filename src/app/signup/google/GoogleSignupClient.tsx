'use client'

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { addToast, Avatar, Button, Checkbox, Input, Link } from "@heroui/react";
import Cookies from "js-cookie";
import GoogleIcon from "@/Icons/GoogleIcon";
import { LoadingComponent } from "@/app/UtilsCompnents";
import { ExpeditionComponent, LogoComponent, useSignupForm } from "../SignupForm";
import { useOnClickExpeditionCheck } from "../signupFeat";
import { INTENTIONAL_LOGOUT_KEY } from "@/utiils/authSession";
import { logined, LoginUser, setCheckToken } from "@/app/store/loginSlice";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "@/app/store/store";

type GoogleProfile = { uid: string, email: string, displayName: string | null, photoURL: string | null };
const errorMessages: Record<string, string> = {
    INVALID_ID: "아이디는 영문과 숫자 조합 4~20자로 입력해 주세요.",
    INVALID_CHARACTER: "대표 캐릭터 이름과 원정대 정보를 다시 확인해 주세요.",
    INVALID_EXPEDITION: "대표 캐릭터의 원정대 정보를 다시 확인해 주세요.",
    PRIVACY_REQUIRED: "개인정보 수집 및 이용에 동의해 주세요.",
    SIGNUP_INTENT_EXPIRED: "Google 인증 시간이 만료되었습니다. 로그인 페이지에서 다시 인증해 주세요."
};

export default function GoogleSignupClient() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const dispatch = useDispatch<AppDispatch>();
    const form = useSignupForm();
    const [profile, setProfile] = useState<GoogleProfile | null>(null);
    const [loadingProfile, setLoadingProfile] = useState(true);
    const [idError, setIdError] = useState(false);
    const [idChecking, setIdChecking] = useState(false);
    const onExpeditionCheck = useOnClickExpeditionCheck(form.member, form.setExpeditionChecked, form.setExpedition);

    useEffect(() => {
        fetch("/api/auth/google/signup", { credentials: "include", cache: "no-store" })
            .then(async response => {
                const data = await response.json().catch(() => null);
                if (!response.ok || !data?.user) throw new Error(data?.code ?? "SIGNUP_INTENT_LOAD_FAILED");
                setProfile(data.user as GoogleProfile);
            })
            .catch(error => {
                addToast({ title: "Google 인증 정보 만료", description: errorMessages[error instanceof Error ? error.message : ""] ?? "Google 인증을 다시 진행해 주세요.", color: "danger" });
                router.replace("/login");
            })
            .finally(() => setLoadingProfile(false));
    }, [router]);

    const checkId = async () => {
        setIdChecking(true); setIdError(false);
        try {
            const response = await fetch("/api/auth/google/signup", { method: "PUT", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ field: "id", value: form.member.id }) });
            const data = await response.json().catch(() => null);
            if (!response.ok) throw new Error(data?.code ?? "SIGNUP_CHECK_FAILED");
            if (!data.available) { setIdError(true); addToast({ title: "아이디 사용 불가", description: "이미 사용 중인 아이디입니다.", color: "danger" }); return; }
            form.setDuplicateChecked({ isDuplicateChecked: true, isChecking: false, isError: false });
            addToast({ title: "아이디 사용 가능", description: "입력한 아이디를 사용할 수 있습니다.", color: "success" });
        } catch (error) { addToast({ title: "중복 확인 오류", description: errorMessages[error instanceof Error ? error.message : ""] ?? "중복 여부를 확인하지 못했습니다.", color: "danger" }); }
        finally { setIdChecking(false); }
    };

    const cancel = async () => { await fetch("/api/auth/google/signup", { method: "DELETE", credentials: "include" }).catch(() => undefined); router.push("/login"); };

    const submit = async () => {
        if (!form.duplicateChecked.isDuplicateChecked || !form.expeditionChecked.isExpeditionChecked || !form.isPrivacyPolicyAgreed) {
            addToast({ title: "가입 정보 확인 필요", description: "아이디 중복 확인, 원정대 확인, 개인정보 동의를 완료해 주세요.", color: "danger" }); return;
        }
        form.setLoading(true);
        try {
            const response = await fetch("/api/auth/google/signup", { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: form.member.id, character: form.member.character, expedition: form.expedition, privacyAccepted: true, returnTo: searchParams.get("returnTo") }) });
            const data = await response.json().catch(() => null);
            if (!response.ok) throw new Error(data?.code ?? "GOOGLE_SIGNUP_FAILED");
            const loginUser: LoginUser = { id: data.userData.id, expedition: data.userData.expeditions ?? [], character: data.userData.nickname ?? "", apiKey: data.userData.apiKey ?? null, isSupporter: data.userData.isSupporter === true, authProvider: "google" };
            sessionStorage.removeItem(INTENTIONAL_LOGOUT_KEY); sessionStorage.setItem("token", data.accessToken); sessionStorage.setItem("user", JSON.stringify(loginUser)); localStorage.setItem("sessionExpiresAt", data.sessionExpiresAt); Cookies.set("userApiKey", loginUser.apiKey ?? "", { path: "/", secure: window.location.protocol === "https:", sameSite: "lax" }); dispatch(logined(loginUser)); dispatch(setCheckToken(true));
            addToast({ title: "Google 회원가입 완료", description: "회원가입과 로그인이 완료되었습니다.", color: "success" });
            router.replace(searchParams.get("returnTo")?.startsWith("/") ? searchParams.get("returnTo")! : "/");
        } catch (error) { const code = error instanceof Error ? error.message : ""; addToast({ title: "회원가입 오류", description: errorMessages[code] ?? "Google 회원가입을 완료하지 못했습니다.", color: "danger" }); if (code === "SIGNUP_INTENT_EXPIRED") router.replace("/login"); }
        finally { form.setLoading(false); }
    };

    if (loadingProfile || !profile) return <LoadingComponent heightStyle="min-h-[calc(100vh-65px)]" message="Google 인증 정보를 확인하고 있어요"/>;
    return <main className="relative min-h-[calc(100vh-65px)] overflow-hidden bg-gray-50/70 px-4 py-8 dark:bg-[#111111] sm:px-6 lg:py-12"><div className="relative mx-auto min-w-0 w-full max-w-3xl rounded-2xl border border-gray-200/80 bg-white px-5 py-8 shadow-sm sm:px-10 sm:py-10 dark:border-white/10 dark:bg-[#171717]"><LogoComponent className="w-[190px]"/><div className="mt-8 flex items-center gap-3 rounded-2xl border border-[#4285F4]/20 bg-[#4285F4]/[0.06] p-4 dark:bg-[#4285F4]/10"><Avatar showFallback name={profile.displayName ?? profile.email} src={profile.photoURL ?? undefined} className="h-12 w-12"/><div className="min-w-0 grow"><p className="truncate font-bold">{profile.displayName || "Google 계정"}</p><p className="mt-1 truncate text-sm text-default-500">{profile.email}</p></div><GoogleIcon className="h-6 w-6 shrink-0"/></div><div className="mb-8 mt-8"><h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Google 회원가입</h1><p className="mt-2 text-sm text-default-500">Google 이메일은 자동으로 등록되며, 로츠고 이용에 필요한 정보만 입력합니다.</p></div><div className="space-y-7"><div className="space-y-2"><p className="font-medium">아이디</p><div className="flex flex-col gap-2 sm:flex-row"><Input size="lg" radius="sm" variant="bordered" maxLength={20} value={form.member.id} isDisabled={form.duplicateChecked.isDuplicateChecked} isInvalid={idError} errorMessage="이미 사용 중인 아이디입니다." placeholder="4~20글자 영문과 숫자로 입력하세요." onValueChange={value => { form.setMember(prev => ({ ...prev, id: value })); form.setDuplicateChecked({ isDuplicateChecked: false, isChecking: false, isError: false }); setIdError(false); }}/><Button size="lg" radius="sm" color="primary" variant="flat" className="w-full shrink-0 font-semibold sm:w-32" isLoading={idChecking} isDisabled={form.duplicateChecked.isDuplicateChecked} onPress={() => void checkId()}>{form.duplicateChecked.isDuplicateChecked ? "사용 가능" : "중복 확인"}</Button></div></div><div className="space-y-2"><p className="font-medium">대표 캐릭터 이름</p><div className="flex flex-col gap-2 sm:flex-row"><Input size="lg" radius="sm" variant="bordered" value={form.member.character} isDisabled={form.expeditionChecked.isExpeditionChecked} isInvalid={form.expeditionChecked.isError} errorMessage="원정대 정보를 불러오지 못했습니다." placeholder="대표 캐릭터 이름을 입력하세요." onValueChange={value => { form.setMember(prev => ({ ...prev, character: value })); form.setExpeditionChecked({ isExpeditionChecked: false, isChecking: false, isError: false }); form.setExpedition([]); }}/><Button size="lg" radius="sm" color="primary" variant="flat" className="w-full shrink-0 font-semibold sm:w-32" isLoading={form.expeditionChecked.isChecking} isDisabled={form.expeditionChecked.isExpeditionChecked} onPress={onExpeditionCheck}>{form.expeditionChecked.isExpeditionChecked ? "확인 완료" : "원정대 확인"}</Button></div></div><ExpeditionComponent expedition={form.expedition}/><div className="flex flex-col gap-2 rounded-xl border border-gray-200/80 bg-gray-50/60 p-4 sm:flex-row sm:items-center dark:border-white/10 dark:bg-white/[0.025]"><Checkbox size="lg" isSelected={form.isPrivacyPolicyAgreed} onValueChange={form.setPrivacyPolicyAgreed}>개인정보 수집 및 이용에 동의합니다.</Checkbox><Link className="w-max text-sm sm:ml-auto" underline="hover" href="/policy">자세히 보기</Link></div><Button fullWidth size="lg" radius="sm" color="primary" className="font-semibold" isLoading={form.isLoading} onPress={() => void submit()}>가입하고 Google로 로그인</Button><Button fullWidth radius="sm" variant="light" className="text-default-500" onPress={() => void cancel()}>가입 취소</Button></div></div></main>;
}
