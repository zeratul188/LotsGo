import { useRouter } from "next/navigation"
import { addToast } from "@heroui/react";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../store/store";
import { logout } from "../store/loginSlice";
import { signOut } from "firebase/auth";
import { auth } from "@/utiils/firebase";
import Cookies from 'js-cookie';

type Key = string | number;

export function useOnActionProfile() {
    const router = useRouter();
    const dispatch = useDispatch<AppDispatch>();

    return async (key: Key) => {
        switch(key) {
            case "setting":
                router.push('/setting');
                break;
            case "logout":
                const logoutRes = await fetch("/api/auth/logout", {
                    method: "POST",
                    credentials: "include",
                });
                if (!logoutRes.ok) {
                    addToast({
                        title: "처리 오류",
                        description: `로그아웃하는데 문제가 발생하였습니다.`,
                        color: "danger"
                    });
                    return;
                }
                sessionStorage.removeItem('token');
                sessionStorage.removeItem('user');
                localStorage.removeItem('userSettings');
                Cookies.remove('userApiKey', {
                    path: '/',
                });
                dispatch(logout());
                signOut(auth);
                addToast({
                    title: "로그아웃 완료",
                    description: `로그아웃되었습니다.`,
                    color: "success"
                });
                location.href = '/';
                break;
            case "administrator":
                router.push('/administrator');
                break;
        }
    }
}

export function useLogout() {
    const dispatch = useDispatch<AppDispatch>();
    return async () => {
        const logoutRes = await fetch("/api/auth/logout", {
            method: "POST",
            credentials: "include",
        });
        if (!logoutRes.ok) {
            addToast({
                title: "처리 오류",
                description: `로그아웃하는데 문제가 발생하였습니다.`,
                color: "danger"
            });
            return;
        }
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        dispatch(logout());
        signOut(auth);
        addToast({
            title: "로그아웃 완료",
            description: `로그아웃되었습니다.`,
            color: "success"
        });
        location.href = '/';
    }
}