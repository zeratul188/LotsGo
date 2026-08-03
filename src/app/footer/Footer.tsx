'use client'
import { useMobileQuery } from "@/utiils/utils";
import { LogoComponent, SiteInformation } from "./FooterForm";
import { Button, Divider, Link, Popover, PopoverContent, PopoverTrigger } from "@heroui/react";

export default function Footer() {
    const isMobile = useMobileQuery();
    return (
        <footer className="w-full border-t border-gray-200/80 bg-gradient-to-b from-gray-50 to-gray-100/90 dark:border-white/10 dark:from-[#181818] dark:to-[#111111]">
            <div className="m-auto flex w-full max-w-[1280px] flex-col gap-6 px-5 py-7 sm:flex-row sm:items-stretch sm:gap-7 sm:px-6 sm:py-8">
                <div className="flex min-w-0 grow flex-col justify-between">
                    <LogoComponent/>
                    <SiteInformation/>
                </div>
                <div className="flex shrink-0">
                    <Divider
                        orientation={isMobile ? 'horizontal' : 'vertical'}
                        className="w-full bg-gray-200/80 dark:bg-white/10 sm:h-auto sm:w-px"/>
                </div>
                <div className="w-full rounded-2xl border border-gray-200/80 bg-white/80 p-3 shadow-sm backdrop-blur-sm dark:border-white/10 dark:bg-white/[0.035] sm:w-[280px]">
                    <Button
                        fullWidth
                        showAnchorIcon
                        as={Link}
                        radius="lg"
                        color="primary"
                        className="h-11 font-semibold shadow-sm"
                        startContent={
                            <img src="/discord.png" alt="discord-icon" className="h-5 w-5"/>
                        }
                        onPress={() => {
                            window.open('https://discord.gg/FzP3zuyW4s', '_target');
                        }}>
                        Lot's Go 디스코드
                    </Button>
                    <Button
                        fullWidth
                        as={Link}
                        radius="lg"
                        size="sm"
                        color="primary"
                        variant="bordered"
                        href="/about"
                        className="mt-2.5 h-10 border-primary-200/80 bg-primary-50/40 font-semibold text-primary-700 dark:border-primary-500/25 dark:bg-primary-500/10 dark:text-primary-300">
                        Lot's Go 가이드
                    </Button>
                    <Popover>
                        <PopoverTrigger>
                            <Button
                                fullWidth
                                radius="lg"
                                size="sm"
                                variant="flat"
                                className="mt-2.5 h-10 border border-gray-200/80 bg-gray-100/80 font-semibold text-gray-600 dark:border-white/10 dark:bg-white/[0.06] dark:text-gray-300">
                                후원하기
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="rounded-xl border border-gray-200/80 bg-white/95 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-[#171717]/95">
                            <div className="w-[240px] p-2 text-sm leading-5">
                                <p>투네이션으로 후원할 경우 아이디를 반드시 입력해주시고 보내주시기 바랍니다.</p>
                                <p>후원 후 담당자가 확인하고 바로 적용해드립니다.</p>
                                <Divider className="mt-2"/>
                                <p className="mt-2">투네이션 후원 시 혜택</p>
                                <ul className="list-disc pl-4">
                                    <li>캐릭터 명 뒤에 뱃지</li>
                                </ul>
                                <p className="mt-2">후원 금액 사용처</p>
                                <ul className="list-disc pl-4">
                                    <li>로츠고 운영비</li>
                                    <li>개발자 간식값</li>
                                </ul>
                                <Button
                                    fullWidth
                                    radius="lg"
                                    size="sm"
                                    color="primary"
                                    className="mt-3 font-semibold"
                                    onPress={() => {
                                        window.open('https://toon.at/donate/lotsgo', '_target');
                                    }}>
                                    투네이션 후원하기
                                </Button>
                            </div>
                        </PopoverContent>
                    </Popover>
                </div>
            </div>
        </footer>
    )
}
