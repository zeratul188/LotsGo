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

type RefreshError = {
    code?: string;
};

export default function StoreClient({children}: { children: React.ReactNode }) {
    const dispatch = useDispatch<AppDispatch>();
    const router = useRouter();

    useEffect(() => {
      const clearAuthState = async () => {
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        localStorage.removeItem('sessionExpiresAt');
        localStorage.removeItem('userSettings');
        Cookies.remove('userApiKey', { path: '/' });
        dispatch(logout());
        await signOut(auth).catch(() => undefined);
      };

      const handleExpiredSession = async () => {
        await clearAuthState();
        dispatch(setCheckToken(true));
        addToast({
            title: "로그인 세션 만료",
            description: "로그인 세션이 만료되었습니다. 다시 로그인해 주세요.",
            color: "danger"
        });
        router.push('/login');
      };

      const restoreStoredUser = (storedUser: string | null) => {
        if (!storedUser) return false;

        try {
            dispatch(logined(JSON.parse(storedUser) as LoginUser));
            dispatch(setCheckToken(true));
            return true;
        } catch {
            sessionStorage.removeItem('user');
            return false;
        }
      };

      const finishWithoutSession = () => {
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        localStorage.removeItem('sessionExpiresAt');
        dispatch(logout());
        dispatch(setCheckToken(true));
      };

      const checkToken = async () => {
            const token = sessionStorage.getItem('token');
            const storedUser = sessionStorage.getItem('user');

            if (token && storedUser) {
                try {
                    const res = await fetch('/api/protected', {
                        headers: {
                            authorization: `Bearer ${token}`
                        }
                    });
                    const sessionExpiresAt = localStorage.getItem('sessionExpiresAt');
                    const hasKnownExpiration = sessionExpiresAt !== null
                        && !Number.isNaN(new Date(sessionExpiresAt).getTime());
                    if (res.ok && hasKnownExpiration && restoreStoredUser(storedUser)) return;
                } catch {
                    // 오프라인 상태는 세션 만료가 아니므로 현재 로그인 정보를 유지합니다.
                    if (restoreStoredUser(storedUser)) return;
                }
            }

            let refreshRes: Response;
            try {
                refreshRes = await fetch("/api/auth/refresh", {
                    method: "POST",
                    credentials: "include",
                });
            } catch {
                // 네트워크가 복구되면 online 이벤트에서 세션을 다시 확인합니다.
                if (!restoreStoredUser(storedUser)) finishWithoutSession();
                return;
            }

            if (!refreshRes.ok) {
                const errorData = await refreshRes.json().catch(() => ({})) as RefreshError;

                if (errorData.code === 'MISSING_REFRESH_TOKEN' && !token && !storedUser) {
                    finishWithoutSession();
                    return;
                }

                if (refreshRes.status >= 500) {
                    if (!restoreStoredUser(storedUser)) finishWithoutSession();
                    return;
                }

                await handleExpiredSession();
                return;
            }

            const data = await refreshRes.json();
            const loginUser: LoginUser = {
                id: data.userData.id,
                expedition: data.userData.expeditions,
                character: data.userData ? data.userData.nickname : '',
                apiKey: data.userData ? data.userData.apiKey ? data.userData.apiKey : null : null,
                isSupporter: data.userData?.isSupporter === true
            };
            sessionStorage.setItem('token', data.accessToken);
            sessionStorage.setItem('user', JSON.stringify(loginUser));
            localStorage.setItem('sessionExpiresAt', data.sessionExpiresAt);
            dispatch(logined(loginUser));
            dispatch(setCheckToken(true));
        };

        let isHandlingExpiration = false;

        const checkSessionExpiration = () => {
            const storedUser = sessionStorage.getItem('user');
            const sessionExpiresAt = localStorage.getItem('sessionExpiresAt');
            if (!storedUser || !sessionExpiresAt) return;

            const expiresAt = new Date(sessionExpiresAt).getTime();
            if (Number.isNaN(expiresAt)) {
                localStorage.removeItem('sessionExpiresAt');
                return;
            }

            if (expiresAt > Date.now()) {
                isHandlingExpiration = false;
                return;
            }

            if (isHandlingExpiration) return;
            isHandlingExpiration = true;
            handleExpiredSession();
        };

        const verifySession = () => {
            dispatch(setCheckToken(false));
            checkToken().catch(() => {
                const storedUser = sessionStorage.getItem('user');
                if (!restoreStoredUser(storedUser)) finishWithoutSession();
            });
        };

        verifySession();
        checkSessionExpiration();
        window.addEventListener('online', verifySession);
        const expirationInterval = window.setInterval(checkSessionExpiration, 30_000);

        return () => {
            window.removeEventListener('online', verifySession);
            window.clearInterval(expirationInterval);
        };
    }, [dispatch, router]);

    return (<>{children}</>);
}
