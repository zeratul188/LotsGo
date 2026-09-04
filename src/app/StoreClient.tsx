'use client'
import { useEffect } from 'react';
import { useDispatch } from "react-redux";
import type { AppDispatch } from "./store/store";
import { logined, LoginUser, logout, setCheckToken } from "./store/loginSlice";
import { useRouter } from 'next/navigation';
import { addToast } from "@heroui/react";
import { signOut } from 'firebase/auth';
import { auth } from '@/utiils/firebase';
import { ensureFirebaseAuth } from '@/utiils/firebaseAuth';
import { INTENTIONAL_LOGOUT_KEY } from '@/utiils/authSession';
import Cookies from 'js-cookie';

type RefreshError = {
    code?: string;
};

export default function StoreClient({children}: { children: React.ReactNode }) {
    const dispatch = useDispatch<AppDispatch>();
    const router = useRouter();

    useEffect(() => {
      let isLoggingOut = false;

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
        if (isLoggingOut) return;
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
            if (isLoggingOut) return;
            if (sessionStorage.getItem(INTENTIONAL_LOGOUT_KEY) === 'true') {
                finishWithoutSession();
                return;
            }
            // Discord 로그인 완료 화면이 직접 세션을 복구하므로, 여기서 같은
            // refresh 요청을 동시에 보내지 않습니다. 새 브라우저에서 두 요청이
            // 겹치면 일시적인 서버 오류를 세션 만료로 잘못 처리할 수 있습니다.
            if (window.location.pathname === "/auth/discord/complete") return;
            const token = sessionStorage.getItem('token');
            const storedUser = sessionStorage.getItem('user');

            if (token && storedUser) {
                try {
                    const res = await fetch('/api/protected', {
                        headers: {
                            authorization: `Bearer ${token}`
                        }
                    });
                    if (res.ok && restoreStoredUser(storedUser)) {
                        await ensureFirebaseAuth();
                        dispatch(setCheckToken(true));
                        return;
                    }
                } catch {
                    // 오프라인 상태는 세션 만료가 아니므로 현재 로그인 정보를 유지합니다.
                    if (restoreStoredUser(storedUser)) {
                        dispatch(setCheckToken(true));
                        return;
                    }
                }
            }

            if (isLoggingOut) return;

            let refreshRes: Response | null = null;
            let refreshFailed = false;
            for (let attempt = 0; attempt < 3; attempt += 1) {
              try {
                refreshRes = await fetch("/api/auth/refresh", {
                    method: "POST",
                    credentials: "include",
                });
                if (refreshRes.status < 500 || attempt === 2) break;
              } catch {
                refreshFailed = true;
                if (attempt === 2) break;
              }
              await new Promise(resolve => setTimeout(resolve, 400 * (attempt + 1)));
            }

            if (refreshFailed && !refreshRes) {
                // 네트워크가 복구되면 online 이벤트에서 세션을 다시 확인합니다.
                if (!restoreStoredUser(storedUser)) finishWithoutSession();
                return;
            }

            if (!refreshRes) {
                if (!restoreStoredUser(storedUser)) finishWithoutSession();
                return;
            }

            if (!refreshRes.ok) {
                if (isLoggingOut) return;
                const errorData = await refreshRes.json().catch(() => ({})) as RefreshError;

                if (errorData.code === 'MISSING_REFRESH_TOKEN' && !token && !storedUser) {
                    finishWithoutSession();
                    return;
                }

                if (refreshRes.status >= 500) {
                    if (restoreStoredUser(storedUser)) {
                        dispatch(setCheckToken(true));
                    } else {
                        finishWithoutSession();
                    }
                    return;
                }

                await handleExpiredSession();
                return;
            }

            if (isLoggingOut) return;
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
            await ensureFirebaseAuth();
            dispatch(setCheckToken(true));
        };

        let isHandlingExpiration = false;

        const checkSessionExpiration = () => {
            if (isLoggingOut) return;
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
            if (isLoggingOut) return;
            if (sessionStorage.getItem(INTENTIONAL_LOGOUT_KEY) === 'true') {
                finishWithoutSession();
                return;
            }
            const token = sessionStorage.getItem('token');
            const storedUser = sessionStorage.getItem('user');

            // Keep the existing session visible while the server verification runs.
            // Protected APIs still perform their own authorization checks.
            if (token && storedUser) {
                restoreStoredUser(storedUser);
            } else {
                dispatch(setCheckToken(false));
            }

            checkToken().catch(() => {
                if (isLoggingOut) return;
                const storedUser = sessionStorage.getItem('user');
                if (restoreStoredUser(storedUser)) {
                    dispatch(setCheckToken(true));
                } else {
                    finishWithoutSession();
                }
            });
        };

        verifySession();
        checkSessionExpiration();
        const handleLogoutStarted = () => {
            isLoggingOut = true;
        };
        const handleLogoutFailed = () => {
            isLoggingOut = false;
        };
        window.addEventListener('lotsgo-logout-started', handleLogoutStarted);
        window.addEventListener('lotsgo-logout-failed', handleLogoutFailed);
        window.addEventListener('online', verifySession);
        const expirationInterval = window.setInterval(checkSessionExpiration, 30_000);

        return () => {
            window.removeEventListener('lotsgo-logout-started', handleLogoutStarted);
            window.removeEventListener('lotsgo-logout-failed', handleLogoutFailed);
            window.removeEventListener('online', verifySession);
            window.clearInterval(expirationInterval);
        };
    }, [dispatch, router]);

    return (<>{children}</>);
}
