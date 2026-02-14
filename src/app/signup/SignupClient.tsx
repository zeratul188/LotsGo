'use client'
import { useEffect } from "react";
import { LogoComponent, InputsComponent, useSignupForm } from "./SignupForm"
import { Divider } from "@heroui/react";
import { addToast } from "@heroui/react";
import { useRouter } from "next/navigation";

export default function SignupClient() {
    const signupForm = useSignupForm();
    const router = useRouter();

    useEffect(() => {
        const storedUser = sessionStorage.getItem('user');
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
        <div className="min-h-[calc(100vh-65px)] sm:max-w-[640px] w-full mx-auto px-4 box-border">
            <LogoComponent/>
            <Divider className="mt-10 mb-10"/>
            <InputsComponent {...signupForm}/>
        </div>
    ) 
}