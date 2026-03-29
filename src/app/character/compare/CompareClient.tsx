'use client'
import { useState } from "react"
import { CharacterInfo } from "../model/types"
import { CharacterInputComponent, CharactersComponent } from "./ui/CompareForm";
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
        <div className="min-h-[calc(100vh-65px)] p-5 w-full max-w-[1280px] mx-auto">
            <h1 className="text-3xl font-bold">캐릭터 비교하기</h1>
            <div className="mt-2">
                <p className="text-sm fadedtext">2명의 캐릭터들의 스펙을 비교 확인할 수 있습니다.</p>
                <p className="text-xs fadedtext">불러온 캐릭터 정보가 갱신이 되지 않았을 경우 전투정보실에서 갱신해주시기 바랍니다.</p>
            </div>
            <CharacterInputComponent
                leftInput={leftInput}
                rightInput={rightInput}
            />
            {isMobile ? (
                <div className="w-full flex justify-center px-4 overflow-hidden mt-8 mb-8">
                    <div className="w-full max-w-[970px] min-h-[60px] max-h-[80px]">
                        <LineAd isLoaded={true}/>
                    </div>
                </div>
            ) : (
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
