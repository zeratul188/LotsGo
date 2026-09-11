'use client'

import { useEffect, useRef } from "react";
import { addToast } from "@heroui/react";
import { useDispatch } from "react-redux";
import { signOut } from "firebase/auth";
import Cookies from "js-cookie";
import GoogleIcon from "@/Icons/GoogleIcon";
import { auth } from "@/utiils/firebase";
import type { AppDispatch } from "@/app/store/store";
import { logout, setCheckToken } from "@/app/store/loginSlice";

export default function GoogleDeleteCompleteClient() {
    const dispatch = useDispatch<AppDispatch>();
    const started = useRef(false);

    useEffect(() => {
        if (started.current) return;
        started.current = true;
        const finish = async () => {
            await signOut(auth).catch(() => undefined);
            sessionStorage.removeItem("token");
            sessionStorage.removeItem("user");
            localStorage.removeItem("sessionExpiresAt");
            Cookies.remove("userApiKey", { path: "/" });
            dispatch(logout());
            dispatch(setCheckToken(true));
            addToast({ title: "탈퇴 완료", description: "회원 탈퇴가 완료되었습니다.", color: "success" });
            window.location.replace("/");
        };
        void finish();
    }, [dispatch]);

    return (
        <main className="flex min-h-[calc(100vh-65px)] items-center justify-center bg-gray-50/70 px-4 dark:bg-[#111111]">
            <div className="flex max-w-sm flex-col items-center rounded-2xl border border-default-200/80 bg-content1 px-8 py-10 text-center shadow-sm dark:border-white/10">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-danger/10">
                    <GoogleIcon className="h-10 w-10"/>
                </div>
                <h1 className="mt-5 text-lg font-bold">회원 탈퇴를 완료하고 있어요</h1>
                <p className="mt-2 text-sm leading-6 text-default-500">계정 정보와 로그인 상태를 안전하게 정리하고 있습니다.</p>
                <span className="mt-6 h-6 w-6 animate-spin rounded-full border-2 border-danger/20 border-t-danger" aria-label="회원 탈퇴 처리 중"/>
            </div>
        </main>
    );
}
