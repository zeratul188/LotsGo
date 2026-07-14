'use client'
import { useEffect } from "react";
import { FindPasswordModal, InputsComponent, LogoComponent } from "./LoginForm";
import { useLoginForm } from "./LoginForm";
import { addToast, useDisclosure } from "@heroui/react";
import { useRouter } from "next/navigation";

export default function LoginClient() {
    const loginForm = useLoginForm();
    const router = useRouter();
    const {isOpen, onOpen, onOpenChange} = useDisclosure();

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
        <main className="relative flex min-h-[calc(100vh-65px)] items-center justify-center overflow-hidden bg-gray-50/70 px-4 py-8 sm:px-6 lg:py-12 dark:bg-[#111111]">
            <div className="pointer-events-none absolute -left-32 -top-32 h-80 w-80 rounded-full bg-primary/10 blur-3xl"/>
            <div className="pointer-events-none absolute -bottom-40 -right-24 h-96 w-96 rounded-full bg-secondary/10 blur-3xl"/>

            <div className="relative grid w-full max-w-5xl overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.08)] lg:grid-cols-[0.9fr_1.1fr] dark:border-white/10 dark:bg-[#171717] dark:shadow-none">
                <section className="relative hidden flex-col justify-between overflow-hidden border-r border-gray-200/80 bg-primary/[0.04] p-10 lg:flex dark:border-white/10 dark:bg-primary/[0.07]">
                    <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full border-[32px] border-primary/[0.06]"/>
                    <div className="relative">
                        <LogoComponent className="w-[220px]"/>
                        <p className="mt-8 max-w-sm text-3xl font-bold leading-tight tracking-tight">
                            로스트아크의 매주를<br/>더 간편하게 관리하세요.
                        </p>
                        <p className="mt-4 max-w-sm text-sm leading-6 fadedtext">
                            로그인하면 등록한 원정대를 기준으로 주간 숙제와 골드, 일정을 한곳에서 확인할 수 있습니다.
                        </p>
                    </div>
                    <div className="relative mt-12 space-y-3">
                        {['캐릭터별 숙제 진행 상황', '주간 골드와 콘텐츠 일정', '레이드 파티 및 원정대 관리'].map((item) => (
                            <div key={item} className="flex items-center gap-3 text-sm font-medium">
                                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">✓</span>
                                {item}
                            </div>
                        ))}
                    </div>
                </section>

                <section className="flex items-center justify-center px-5 py-8 sm:px-10 sm:py-12 lg:px-14">
                    <div className="w-full max-w-[420px]">
                        <div className="mb-8 lg:hidden">
                            <LogoComponent className="w-[190px]"/>
                        </div>
                        <div className="mb-8">
                            <div className="flex items-center gap-2">
                                <span className="h-5 w-1 rounded-full bg-primary"/>
                                <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">로그인</h1>
                            </div>
                            <p className="mt-2 pl-3 text-sm fadedtext">로츠고 계정으로 계속 진행하세요.</p>
                        </div>
                        <InputsComponent
                            isLoading={loginForm.isLoading}
                            setLoading={loginForm.setLoading}
                            isIdDuplicated={loginForm.isIdDuplicated}
                            setIdDuplicated={loginForm.setIdDuplicated}
                            isPasswordNotMatch={loginForm.isPasswordNotMatch}
                            setPasswordNotMatch={loginForm.setPasswordNotMatch}
                            user={loginForm.user}
                            setUser={loginForm.setUser}
                            onOpen={onOpen}/>
                    </div>
                </section>
            </div>
            <FindPasswordModal isOpen={isOpen} onOpenChange={onOpenChange}/>
        </main>
    )
}
