'use client'
import { useEffect } from "react";
import { InputsComponent, LogoComponent } from "./LoginForm";
import { useLoginForm } from "./LoginForm";
import { addToast } from "@heroui/react";
import { useRouter } from "next/navigation";

export default function Login() {
    const loginForm = useLoginForm();
    const router = useRouter();

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            addToast({
                title: "로그인 되어있음",
                description: `이미 로그인이 완료되어 있습니다.`,
                color: "danger"
            });
            router.back();
        }
    }, []);

    return (
        <div className="min-h-[calc(100vh-65px)] flex justify-center items-center flex-col p-5 sm:p-0">
            <LogoComponent/>
            <div className="mt-8 w-full sm:w-100">
                <InputsComponent {...loginForm}/>
            </div>
        </div>
    )
}