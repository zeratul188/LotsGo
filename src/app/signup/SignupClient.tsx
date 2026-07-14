'use client'
import { useEffect } from "react";
import { LogoComponent, InputsComponent, useSignupForm } from "./SignupForm"
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
        <main className="relative min-h-[calc(100vh-65px)] overflow-hidden bg-gray-50/70 px-4 py-8 sm:px-6 lg:py-12 dark:bg-[#111111]">
            <div className="pointer-events-none absolute -left-32 -top-32 h-80 w-80 rounded-full bg-primary/10 blur-3xl"/>
            <div className="pointer-events-none absolute -bottom-40 -right-24 h-96 w-96 rounded-full bg-secondary/10 blur-3xl"/>

            <div className="relative mx-auto grid w-full max-w-6xl overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.08)] lg:grid-cols-[0.78fr_1.22fr] dark:border-white/10 dark:bg-[#171717] dark:shadow-none">
                <section className="relative hidden flex-col justify-between overflow-hidden border-r border-gray-200/80 bg-primary/[0.04] p-10 lg:flex dark:border-white/10 dark:bg-primary/[0.07]">
                    <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full border-[32px] border-primary/[0.06]"/>
                    <div className="relative">
                        <LogoComponent className="w-[220px]"/>
                        <p className="mt-8 text-3xl font-bold leading-tight tracking-tight">
                            원정대 관리를 위한<br/>첫 단계를 시작하세요.
                        </p>
                        <p className="mt-4 max-w-sm text-sm leading-6 fadedtext">
                            계정 정보와 대표 캐릭터를 등록하면 원정대 캐릭터를 기반으로 로츠고의 주요 기능을 이용할 수 있습니다.
                        </p>
                    </div>
                    <div className="relative mt-12 space-y-3">
                        {['계정 정보 입력 및 중복 확인', '대표 캐릭터로 원정대 확인', '약관 동의 후 가입 완료'].map((item, index) => (
                            <div key={item} className="flex items-center gap-3 text-sm font-medium">
                                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">{index + 1}</span>
                                {item}
                            </div>
                        ))}
                    </div>
                </section>

                <section className="px-5 py-8 sm:px-10 sm:py-12 lg:px-14">
                    <div className="mx-auto w-full max-w-[640px]">
                        <div className="mb-8 lg:hidden">
                            <LogoComponent className="w-[190px]"/>
                        </div>
                        <div className="mb-8">
                            <div className="flex items-center gap-2">
                                <span className="h-5 w-1 rounded-full bg-primary"/>
                                <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">회원가입</h1>
                            </div>
                            <p className="mt-2 pl-3 text-sm fadedtext">필수 정보를 입력하고 로츠고를 시작해 보세요.</p>
                        </div>
                        <InputsComponent {...signupForm}/>
                    </div>
                </section>
            </div>
        </main>
    )
}
