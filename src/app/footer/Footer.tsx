'use client'
import { useMobileQuery } from "@/utiils/utils";
import { LogoComponent, SiteInformation } from "./FooterForm";
import { Button, Divider, Link, Popover, PopoverContent, PopoverTrigger } from "@heroui/react";
import Image from "next/image";

export default function Footer() {
    const isMobile = useMobileQuery();
    return (
        <div className="w-full min-h-[160px] bg-[#eeeeee] dark:bg-[#1d1d1d]">
            <div className="w-full max-w-[1280px] p-5 flex gap-5 flex-col sm:flex-row m-auto">
                <div className="grow h-[max-content] sm:h-[120px] flex flex-col">
                    <LogoComponent/>
                    <div className="grow"/>
                    <SiteInformation/>
                </div>
                <div>
                    <Divider orientation={isMobile ? 'horizontal' : 'vertical'} className="w-full sm:w-[1px]"/>
                </div>
                <div className="w-full sm:w-[260px]">
                    <Button
                        fullWidth
                        showAnchorIcon
                        as={Link}
                        radius="sm"
                        color="primary"
                        startContent={
                            <Image width={20} height={20} src="/discord.png" alt="discord-icon"/>
                        }
                        onPress={() => {
                            window.open('https://discord.gg/FzP3zuyW4s', '_target');
                        }}>
                        Lot's Go 디스코드
                    </Button>
                    <Popover>
                        <PopoverTrigger>
                            <Button
                                fullWidth
                                radius="sm"
                                size="sm"
                                variant="flat"
                                className="mt-2">
                                후원하기
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent>
                            <div className="w-[240px] p-2">
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
                                    radius="sm"
                                    size="sm"
                                    color="primary"
                                    className="mt-2"
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
        </div>
    )
}