'use client'
import { Image, Input, Divider, Button, Checkbox } from "@heroui/react";
import { useState } from "react";

export default function Login() {
    const [isLoading, setLoading] = useState(false);
    return (
        <div className="min-h-[calc(100vh-65px)] flex justify-center items-center flex-col p-5 sm:p-0">
            <Image 
                src="title(L).png" 
                width={340} 
                className="dark:hidden cursor-pointer"
                onClick={() => location.href = '/'}/>
            <Image 
                src="title(D).png" 
                width={340} 
                className="hidden dark:block cursor-pointer"
                onClick={() => location.href = '/'}/>
            <div className="mt-8 w-full sm:w-100">
                <Input
                    fullWidth
                    label="이메일"
                    type="email"
                    size="lg"
                    variant="flat"/>
                <Input
                    fullWidth
                    className="mt-5"
                    type="password"
                    label="비밀번호"
                    size="lg"
                    variant="flat"/>
                <Checkbox
                    size="sm"
                    className="mt-2">이메일 저장</Checkbox>
                <Divider className="mt-8 mb-8"/>
                <Button
                    fullWidth
                    isLoading={isLoading}
                    color="primary"
                    size="lg">
                    로그인
                </Button>
                <Button
                    fullWidth
                    size="lg"
                    color="default"
                    className="mt-5">
                    회원가입
                </Button>
            </div>
        </div>
    )
}