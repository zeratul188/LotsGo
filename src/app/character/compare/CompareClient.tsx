'use client'
import { useState } from "react"
import { CharacterInfo } from "../model/types"
import { CharactersComponent } from "./ui/CompareForm";
import { CharacterInputComponent } from "./ui/CharacterCompareSearch";
import Script from "next/script";
import dynamic from "next/dynamic";
import { useMobileQuery } from "@/utiils/utils";
const LineAd = dynamic(() => import("@/app/ad/LineAd"), { ssr: false });
const FixedLineAd = dynamic(() => import("@/app/ad/FixedLineAd"), { ssr: false });
const BoxAd = dynamic(() => import("@/app/ad/BoxAd"), { ssr: false });

export default function CompareClient() {
    const isMobile = useMobileQuery();
    const [leftInfo, setLeftInfo] = useState<CharacterInfo | null>(null);
    const [rightInfo, setRightInfo] = useState<CharacterInfo | null>(null);

    const [leftValue, setLeftValue] = useState('');
    const [rightValue, setRightValue] = useState('');
    const [isLoadingLeft, setLoadingLeft] = useState(false);
    const [isLoadingRight, setLoadingRight] = useState(false);

    const leftInput = {
        value: leftValue,
        setValue: setLeftValue,
        isLoading: isLoadingLeft,
        setLoading: setLoadingLeft,
        setInfo: setLeftInfo
    };

    const rightInput = {
        value: rightValue,
        setValue: setRightValue,
        isLoading: isLoadingRight,
        setLoading: setLoadingRight,
        setInfo: setRightInfo
    };

    return (
        <div className="mx-auto min-h-[calc(100vh-65px)] w-full max-w-[1280px] p-4 sm:p-5">
            <section className="relative overflow-hidden rounded-2xl border border-gray-200/80 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-[#171717] sm:p-6">
                <div className="pointer-events-none absolute -right-20 -top-24 h-56 w-56 rounded-full bg-primary/10 blur-3xl"/>
                <div className="relative">
                    <div className="flex items-center gap-2">
                        <span className="h-7 w-1 rounded-full bg-primary"/>
                        <h1 className="whitespace-nowrap text-2xl font-bold tracking-tight sm:text-3xl">캐릭터 비교하기</h1>
                        <span className="rounded-full bg-primary-50 px-2 py-1 text-[10px] font-semibold text-primary dark:bg-primary/10">1 : 1</span>
                    </div>
                    <div className="mt-3 space-y-1">
                        <p className="text-sm text-default-600 dark:text-default-400">두 캐릭터의 주요 전투 세팅과 수치 차이를 같은 기준으로 비교해 보세요.</p>
                        <p className="text-xs fadedtext">정보가 최신 상태가 아니라면 전투정보실에서 캐릭터 정보를 먼저 갱신해 주세요.</p>
                    </div>
                    <CharacterInputComponent
                        leftInput={leftInput}
                        rightInput={rightInput}
                    />
                </div>
            </section>
            {isMobile ? null : (
                <div className="w-full flex justify-center mt-8 overflow-hidden mb-8">
                    <div className="w-full max-w-[1240px] flex justify-center rounded-2xl bg-[#eeeeee] dark:bg-[#222222] p-4 mx-4">
                        <FixedLineAd isLoaded={true}/>
                    </div>
                </div>
            )}
            <CharactersComponent leftInfo={leftInfo} rightInfo={rightInfo}/>
            {isMobile ? (
                <div className="w-full flex justify-center px-4">
                    <div className="w-full max-w-[360px] min-h-[100px] mt-4">
                        <BoxAd isLoaded={true}/>
                    </div>
                </div>
            ) : (
                <div className="w-full flex justify-center px-4 overflow-hidden mt-8">
                    <div className="w-full max-w-[1240px] flex justify-center rounded-2xl bg-[#eeeeee] dark:bg-[#222222] p-8">
                        <div className="w-full max-w-[970px] min-h-[60px] max-h-[80px]">
                            <LineAd isLoaded={true}/>
                        </div>
                    </div>
                </div>
            )}
            <Script
                async
                src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1236449818258742"
                crossOrigin="anonymous"/>
        </div>
    )
}
