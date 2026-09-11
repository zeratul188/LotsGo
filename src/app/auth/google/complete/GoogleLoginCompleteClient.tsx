'use client'

import { useEffect, useRef } from "react";
import { addToast } from "@heroui/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDispatch } from "react-redux";
import Cookies from "js-cookie";
import GoogleIcon from "@/Icons/GoogleIcon";
import { INTENTIONAL_LOGOUT_KEY } from "@/utiils/authSession";
import { ensureFirebaseAuth } from "@/utiils/firebaseAuth";
import type { AppDispatch } from "@/app/store/store";
import { logined, LoginUser, logout, setCheckToken } from "@/app/store/loginSlice";

function getSafeReturnTo(value: string | null): string {
    return value?.startsWith("/") && !value.startsWith("//") ? value : "/";
}

export default function GoogleLoginCompleteClient() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const dispatch = useDispatch<AppDispatch>();
    const started = useRef(false);

    useEffect(() => {
        if (started.current) return;
        started.current = true;

        const completeLogin = async () => {
            let serverSessionEstablished = false;
            try {
                let response: Response | null = null;
                for (let attempt = 0; attempt < 3; attempt += 1) {
                    try {
                        response = await fetch("/api/auth/refresh", { method: "POST", credentials: "include" });
                        if (response.status < 500 || attempt === 2) break;
                    } catch {
                        if (attempt === 2) throw new Error("GOOGLE_LOGIN_REFRESH_NETWORK_FAILED");
                    }
                    await new Promise(resolve => setTimeout(resolve, 500 * (attempt + 1)));
                }
                if (!response) throw new Error("GOOGLE_LOGIN_REFRESH_FAILED");
                const data = await response.json().catch(() => null);
                if (!response.ok || !data?.userData || typeof data.accessToken !== "string") {
                    const error = new Error("GOOGLE_LOGIN_REFRESH_FAILED") as Error & { status?: number };
                    error.status = response.status;
                    throw error;
                }
                serverSessionEstablished = true;

                const loginUser: LoginUser = {
                    id: data.userData.id,
                    expedition: data.userData.expeditions ?? [],
                    character: data.userData.nickname ?? "",
                    apiKey: data.userData.apiKey ?? null,
                    isSupporter: data.userData.isSupporter === true,
                    authProvider: data.userData.authProvider === "password" ? "password" : "google"
                };
                sessionStorage.removeItem(INTENTIONAL_LOGOUT_KEY);
                sessionStorage.setItem("token", data.accessToken);
                sessionStorage.setItem("user", JSON.stringify(loginUser));
                localStorage.setItem("sessionExpiresAt", data.sessionExpiresAt);
                Cookies.set("userApiKey", loginUser.apiKey ?? "", { path: "/", secure: window.location.protocol === "https:", sameSite: "lax" });
                dispatch(logined(loginUser));
                try {
                    await ensureFirebaseAuth();
                } catch (firebaseError) {
                    console.warn("Firebase sync deferred after Google login", firebaseError);
                }
                dispatch(setCheckToken(true));
                addToast({ title: "Google 로그인 완료", description: "Google 계정으로 로그인했습니다.", color: "success" });
                router.replace(getSafeReturnTo(searchParams.get("returnTo")));
            } catch (error) {
                console.error("Failed to finish Google login", error);
                const status = error instanceof Error && "status" in error ? (error as Error & { status?: number }).status : undefined;
                const message = error instanceof Error ? error.message : "";
                if (message === "GOOGLE_LOGIN_REFRESH_NETWORK_FAILED" || (status !== undefined && status >= 500) || serverSessionEstablished) {
                    dispatch(setCheckToken(true));
                    router.replace(getSafeReturnTo(searchParams.get("returnTo")));
                    return;
                }
                await fetch("/api/auth/logout", { method: "POST", credentials: "include" }).catch(() => undefined);
                sessionStorage.removeItem("token");
                sessionStorage.removeItem("user");
                localStorage.removeItem("sessionExpiresAt");
                Cookies.remove("userApiKey", { path: "/" });
                dispatch(logout());
                dispatch(setCheckToken(true));
                router.replace("/login?google=complete-error");
            }
        };

        void completeLogin();
    }, [dispatch, router, searchParams]);

    return (
        <main className="flex min-h-[calc(100vh-65px)] items-center justify-center bg-gray-50/70 px-4 dark:bg-[#111111]">
            <div className="flex max-w-sm flex-col items-center rounded-2xl border border-default-200/80 bg-content1 px-8 py-10 text-center shadow-sm dark:border-white/10">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#4285F4]/10 dark:bg-[#4285F4]/20">
                    <GoogleIcon className="h-10 w-10"/>
                </div>
                <h1 className="mt-5 text-lg font-bold">Google 로그인을 완료하고 있어요</h1>
                <p className="mt-2 text-sm leading-6 text-default-500">연결된 로츠고 계정과 저장된 데이터를 불러오고 있습니다.</p>
                <span className="mt-6 h-6 w-6 animate-spin rounded-full border-2 border-[#4285F4]/20 border-t-[#4285F4]" aria-label="로그인 처리 중"/>
            </div>
        </main>
    );
}
