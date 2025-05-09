'use client'
import { useEffect } from 'react';
import { useDispatch } from "react-redux";
import type { AppDispatch } from "./store/store";
import { logined, logout, switchAdministrator } from "./store/loginSlice";
import { useRouter } from 'next/navigation';
import { addToast } from "@heroui/react";

export default function StoreClient({children}: { children: React.ReactNode }) {
    const dispatch = useDispatch<AppDispatch>();
    const router = useRouter();

    useEffect(() => {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        dispatch(logined(JSON.parse(storedUser)));
      }
    }, []);

    useEffect(() => {
        const checkToken = async () => {
            const token = localStorage.getItem('token');
            if (!token) return;

            const res = await fetch('/api/protected', {
                headers: {
                    authorization: `Bearer ${token}`
                }
            });

            if (res.status === 401) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                dispatch(logout());
                addToast({
                    title: "유효 기간 만료",
                    description: `아이디의 유효 기간이 만료되었습니다. 다시 로그인해주시기 바랍니다.`,
                    color: "danger"
                });
                router.push('/');
            }

            if (res.ok) {
                const data = await res.json();
                const decoded = data.result;
                if (decoded.result.isAdministrator) {
                    dispatch(switchAdministrator(true));
                    addToast({
                        title: "관리자 전환",
                        description: `관리자 계정으로 전환이 완료되었습니다.`,
                        color: "success"
                    });
                }
            }
        }
        checkToken();
    }, [dispatch, router]);

    return (<>{children}</>);
}