'use client'
import { useEffect } from 'react';
import { useDispatch } from "react-redux";
import type { AppDispatch } from "./store/store";
import { logined, LoginUser, logout, setCheckToken } from "./store/loginSlice";
import { useRouter } from 'next/navigation';
import { addToast } from "@heroui/react";
import { signOut } from 'firebase/auth';
import { auth } from '@/utiils/firebase';
import Cookies from 'js-cookie';

export default function StoreClient({children}: { children: React.ReactNode }) {
    const dispatch = useDispatch<AppDispatch>();
    const router = useRouter();

    useEffect(() => {
      const clearAuthState = async () => {
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        localStorage.removeItem('userSettings');
        Cookies.remove('userApiKey', { path: '/' });
        dispatch(logout());
        await signOut(auth).catch(() => undefined);
      };

      const handleExpiredSession = async () => {
        await clearAuthState();
        addToast({
            title: "로그인 세션 만료",
            description: "로그인 세션이 만료되었거나 인증 상태가 불안정합니다. 다시 로그인해 주세요.",
            color: "danger"
        });
        router.push('/login');
      };

      const checkToken = async () => {
            const token = sessionStorage.getItem('token');
            const storedUser = sessionStorage.getItem('user');
            if (token && storedUser) {
                const res = await fetch('/api/protected', {
                    headers: {
                        authorization: `Bearer ${token}`
                    }
                });
                if (res.ok) {
                    dispatch(setCheckToken(true));
                    dispatch(logined(JSON.parse(storedUser)));
                    return;
                }
            }
            const refreshRes = await fetch("/api/auth/refresh", {
                method: "POST",
                credentials: "include",
            });
            if (!refreshRes.ok) {
                await handleExpiredSession();
                return;
            }

            const data = await refreshRes.json();
            const loginUser: LoginUser = {
                id: data.userData.id,
                expedition: data.userData.expeditions,
                character: data.userData ? data.userData.nickname : '',
                apiKey: data.userData ? data.userData.apiKey ? data.userData.apiKey : null : null
            };
            sessionStorage.setItem('token', data.accessToken);
            sessionStorage.setItem('user', JSON.stringify(loginUser));
            dispatch(logined(loginUser));
            dispatch(setCheckToken(true));
        };

        dispatch(setCheckToken(false));
        checkToken().catch(() => handleExpiredSession());
    }, [dispatch, router]);

    return (<>{children}</>);
}
