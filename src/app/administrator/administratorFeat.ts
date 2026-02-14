import { addToast } from "@heroui/react";
import { LoginUser, logout } from "../store/loginSlice";
import Cookies from 'js-cookie';
import { signOut } from 'firebase/auth';
import { auth } from '@/utiils/firebase';
import { AppDispatch } from "../store/store";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

async function checkAdministrator(token: string) {
    const res = await fetch("/api/auth/checkadministrator", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
    });

    const data = await res.json().catch(() => ({}));
    return { res, data };
}

async function hardLogout(dispatch: AppDispatch, router: AppRouterInstance) {
    const res = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
    });

    if (!res.ok) {
        addToast({
            title: "처리 오류",
            description: "로그아웃하는데 문제가 발생하였습니다.",
            color: "danger",
        });
        return;
    }

    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    localStorage.removeItem("userSettings");
    Cookies.remove("userApiKey", { path: "/" });

    dispatch(logout());
    await signOut(auth);

    addToast({
        title: "유효 기간 만료",
        description: "아이디의 유효 기간이 만료되었습니다. 다시 로그인해주시기 바랍니다.",
        color: "danger",
    });

    router.push("/");
}

// 관리자인지 파악하는 함수
export async function isAdministratorByToken(dispatch: AppDispatch, router: AppRouterInstance): Promise<boolean> {
    const token = sessionStorage.getItem('token');
    if (!token) return false;

    try {
        let { res, data } = await checkAdministrator(token);
        if (res.ok) return Boolean(data.isAdministrator);

        if (data?.type === 'expired') {
            const refreshRes = await fetch("/api/auth/refresh", {
                method: "POST",
                credentials: "include",
            });

            const refreshData = await refreshRes.json().catch(() => ({}));
            if (!refreshRes.ok) {
                await hardLogout(dispatch, router);
                return false;
            }

            sessionStorage.setItem("token", refreshData.accessToken);
            if (refreshData?.userData) {
                const loginUser: LoginUser = {
                id: refreshData.userData.id,
                expedition: refreshData.userData.expeditions,
                character: refreshData.userData.nickname ?? "",
                apiKey: refreshData.userData.apiKey ?? null,
                };
                sessionStorage.setItem("user", JSON.stringify(loginUser));
            }

            ({ res, data } = await checkAdministrator(refreshData.accessToken));
            if (res.ok) return Boolean(data.isAdministrator);

            addToast({
                title: "인증 오류",
                description: data?.error ?? "토큰 검증에 실패했습니다.",
                color: "danger",
            });
            return false;
        }
        addToast({
            title: "인증 오류",
            description: data?.error ?? "토큰 검증에 실패했습니다.",
            color: "danger",
        });
        return false;
    } catch {
        addToast({
            title: "확인 오류",
            description: "회원의 데이터를 처리하는데 문제가 발생하였습니다.",
            color: "danger",
        });
        return false;
    }
}