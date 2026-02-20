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
      const checkToken = async () => {
            const token = sessionStorage.getItem('token');
            const storedUser = sessionStorage.getItem('user');
            if (token && storedUser) {
                const res = await fetch('/api/protected', {
                    headers: {
                        authorization: `Bearer ${token}`
                    }
                });
                if (res.status !== 401) {
                    dispatch(setCheckToken(true));
                    dispatch(logined(JSON.parse(storedUser)));
                    return;
                }
            }
            const refreshRes = await fetch("/api/auth/refresh", {
                method: "POST",
                credentials: "include",
            });
            const data = await refreshRes.json();
            if (refreshRes.ok) {
                const loginUser: LoginUser = {
                    id: data.userData.id,
                    expedition: data.userData.expeditions,
                    character: data.userData ? data.userData.nickname : '',
                    apiKey: data.userData ? data.userData.apiKey ? data.userData.apiKey : null : null
                }
                sessionStorage.setItem('token', data.accessToken);
                sessionStorage.setItem('user', JSON.stringify(loginUser));
                dispatch(logined(loginUser));
            }
            else {
                if (data.type === 'logout') {
                    const logoutRes = await fetch("/api/auth/logout", {
                        method: "POST",
                        credentials: "include",
                    });
                    if (logoutRes.ok) {
                        sessionStorage.removeItem('token');
                        sessionStorage.removeItem('user');
                        localStorage.removeItem('userSettings');
                        Cookies.remove('userApiKey', {
                            path: '/',
                        });
                        dispatch(logout());
                        await signOut(auth);
                        addToast({
                            title: "유효 기간 만료",
                            description: `아이디의 유효 기간이 만료되었거나 강제 로그아웃되었습니다. 다시 로그인해주시기 바랍니다.`,
                            color: "danger"
                        });
                        router.push('/');
                    }
                }
            }
            dispatch(setCheckToken(true));
        }
        dispatch(setCheckToken(false));
        checkToken();
    }, []);

    return (<>{children}</>);
}