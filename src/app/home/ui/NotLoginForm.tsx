import { Button, Link } from "@heroui/react";
import { useEffect, useState } from "react";
import { isLogin } from "../lib/checklistFeat";
import CalendarIcon from "@/Icons/CalendarIcon";
import CharacterIcon from "@/Icons/CharacterIcon";
import HomeworkIcon from "@/Icons/HomeworkIcon";

export default function NotLoginComponent() {
    const [isLogined, setLogined] = useState(false);

    useEffect(() => {
        setLogined(isLogin());
    }, []);

    if (isLogined) {
        return <></>;
    }

    return (
        <section className="relative isolate mb-6 overflow-hidden rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/[0.08] via-white to-sky-50/70 shadow-[0_12px_35px_rgba(15,23,42,0.07)] dark:border-primary/20 dark:from-primary/[0.14] dark:via-[#171717] dark:to-[#151a22] dark:shadow-none">
            <div className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full bg-primary/10 blur-3xl"/>
            <div className="pointer-events-none absolute -bottom-24 left-1/4 h-48 w-48 rounded-full bg-sky-300/10 blur-3xl"/>

            <div className="relative grid gap-5 p-5 sm:p-6 lg:grid-cols-[0.85fr_1.35fr] lg:items-center lg:gap-8 lg:p-8">
                <div>
                    <div className="mb-3 flex items-center gap-2 text-primary">
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 dark:bg-primary/20">
                            <CharacterIcon size={18}/>
                        </span>
                        <p className="text-xs font-bold tracking-[0.08em]">로츠고 시작하기</p>
                    </div>
                    <h2 className="break-keep text-xl font-bold leading-snug tracking-tight sm:text-2xl">
                        내 원정대에 맞춘 로츠고를 시작해보세요
                    </h2>
                    <p className="mt-2 max-w-md break-keep text-sm leading-6 text-default-500 dark:text-default-400">
                        로그인하면 캐릭터별 숙제와 일정, 진행 현황을 한곳에서 편리하게 관리할 수 있습니다.
                    </p>

                    <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                        <Button
                            as={Link}
                            href="/login"
                            radius="lg"
                            color="primary"
                            className="w-full px-6 font-semibold shadow-sm sm:w-auto">
                            로그인
                        </Button>
                        <Button
                            as={Link}
                            href="/signup"
                            radius="lg"
                            variant="bordered"
                            className="w-full border-default-300 bg-white/60 px-6 font-semibold sm:w-auto dark:border-white/15 dark:bg-white/[0.03]">
                            회원가입
                        </Button>
                    </div>
                </div>

                <div className="grid gap-2.5 sm:grid-cols-3">
                    <article className="rounded-xl border border-white/80 bg-white/75 p-4 shadow-sm backdrop-blur-sm dark:border-white/10 dark:bg-white/[0.045] dark:shadow-none">
                        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-primary dark:bg-primary/15">
                            <HomeworkIcon size={19}/>
                        </span>
                        <h3 className="mt-3 text-sm font-semibold">숙제 관리</h3>
                        <p className="mt-1 break-keep text-xs leading-5 text-default-500 dark:text-default-400">
                            일일·주간 콘텐츠를 캐릭터별로 기록해요.
                        </p>
                    </article>

                    <article className="rounded-xl border border-white/80 bg-white/75 p-4 shadow-sm backdrop-blur-sm dark:border-white/10 dark:bg-white/[0.045] dark:shadow-none">
                        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400">
                            <CharacterIcon size={19}/>
                        </span>
                        <h3 className="mt-3 text-sm font-semibold">진행 현황</h3>
                        <p className="mt-1 break-keep text-xs leading-5 text-default-500 dark:text-default-400">
                            완료율과 남은 콘텐츠를 한눈에 확인해요.
                        </p>
                    </article>

                    <article className="rounded-xl border border-white/80 bg-white/75 p-4 shadow-sm backdrop-blur-sm dark:border-white/10 dark:bg-white/[0.045] dark:shadow-none">
                        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-50 text-violet-600 dark:bg-violet-500/15 dark:text-violet-400">
                            <CalendarIcon className="h-[19px] w-[19px]"/>
                        </span>
                        <h3 className="mt-3 text-sm font-semibold">일정 관리</h3>
                        <p className="mt-1 break-keep text-xs leading-5 text-default-500 dark:text-default-400">
                            개인·길드 일정을 모아 놓치지 않게 관리해요.
                        </p>
                    </article>
                </div>
            </div>
        </section>
    )
}
