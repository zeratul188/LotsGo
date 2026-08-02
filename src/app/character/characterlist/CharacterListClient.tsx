'use client'
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { ExpeditionCharacter } from "./model/types";
import { loadCharacterList } from "./lib/characterListFeat";
import { Button, Card, CardBody, CardHeader, Chip, Input } from "@heroui/react";
import SupportorIcon from "@/Icons/SupportorIcon";
import AttackIcon from "@/Icons/AttackIcon";
import clsx from "clsx";
import { LoadingComponent } from "@/app/UtilsCompnents";
import { ArkpassiveComponent, CardComponent, EngravingComponent, EquipmentComponent, GemComponent, StatComponent } from "./ui/CharacterForm";
import JobEmblemIcon from "@/Icons/JobEmblemIcon";
import Script from "next/script";
import dynamic from "next/dynamic";
import { useMobileQuery } from "@/utiils/utils";
const LineAd = dynamic(() => import("@/app/ad/LineAd"), { ssr: false });
const FixedLineAd = dynamic(() => import("@/app/ad/FixedLineAd"), { ssr: false });
const BoxAd = dynamic(() => import("@/app/ad/BoxAd"), { ssr: false });

function CompactSection({ title, children }: { title: string, children: ReactNode }) {
    return (
        <section className="min-w-0">
            <div className="mb-2 flex items-center gap-1.5">
                <span className="h-3 w-0.5 rounded-full bg-primary"/>
                <h3 className="whitespace-nowrap text-[11px] font-semibold text-default-600 dark:text-default-400">{title}</h3>
            </div>
            <div className="min-w-0 rounded-xl bg-gray-50/80 p-2.5 dark:bg-white/[0.035]">
                {children}
            </div>
        </section>
    )
}

export default function CharacterListClient() {
    const characterName: string = useSelector((state: RootState) => state.login.user.character);
    const isCheckedToken = useSelector((state: RootState) => state.login.isCheckedToken);
    const [expeditionCharacters, setExpeditionCharacters] = useState<ExpeditionCharacter[]>([]);
    const [isLoading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const isMobile = useMobileQuery();

    const handleSearchCharacter = async () => {
        if (!search) return;
        await loadCharacterList(search, setExpeditionCharacters, setLoading);
    };

    useEffect(() => {
        if (!characterName || !isCheckedToken) return;

        const loadInitialCharacterList = async () => {
            await loadCharacterList(characterName, setExpeditionCharacters, setLoading);
        };

        loadInitialCharacterList();
    }, [characterName, isCheckedToken]);

    if (!isCheckedToken) {
        return (
            <LoadingComponent
                heightStyle="min-h-[calc(100vh-65px)]"
                message="원정대 정보를 준비하고 있어요"
                detail="로그인 정보와 대표 캐릭터를 확인하고 있습니다."/>
        )
    }

    return (
        <div className="mx-auto min-h-[calc(100vh-65px)] w-full max-w-[1280px] p-4 sm:p-5">
            <section className="relative mb-5 overflow-hidden rounded-2xl border border-gray-200/80 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-[#171717] sm:p-6">
                <div className="pointer-events-none absolute -right-20 -top-24 h-56 w-56 rounded-full bg-primary/10 blur-3xl"/>
                <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                    <div className="min-w-0">
                        <div className="flex items-center gap-2">
                            <span className="h-7 w-1 rounded-full bg-primary"/>
                            <h1 className="whitespace-nowrap text-2xl font-bold tracking-tight sm:text-3xl">원정대 모아보기</h1>
                            {expeditionCharacters.length > 0 ? (
                                <Chip size="sm" radius="sm" color="primary" variant="flat" className="shrink-0">
                                    {expeditionCharacters.length}명
                                </Chip>
                            ) : null}
                        </div>
                        <div className="mt-3 space-y-1">
                            <p className="text-sm text-default-600 dark:text-default-400">원정대 캐릭터의 장비와 핵심 전투 정보를 한 화면에서 비교해 보세요.</p>
                            <p className="text-xs fadedtext">전투정보실에서 한 번 이상 조회한 캐릭터의 마지막 저장 정보를 기준으로 표시합니다.</p>
                        </div>
                    </div>
                    <div className="flex w-full gap-2 lg:w-[390px]">
                        <Input
                            aria-label="원정대 캐릭터 검색"
                            radius="md"
                            variant="bordered"
                            placeholder="캐릭터 닉네임을 입력하세요."
                            value={search}
                            onValueChange={setSearch}
                            onKeyDown={async (e) => {
                                if (e.key === 'Enter') await handleSearchCharacter();
                            }}
                            classNames={{
                                inputWrapper: "bg-white/80 shadow-sm dark:bg-white/[0.04]"
                            }}/>
                        <Button
                            radius="md"
                            color="primary"
                            className="shrink-0 px-6 font-semibold"
                            onPress={async () => await handleSearchCharacter()}>
                            검색
                        </Button>
                    </div>
                </div>
            </section>
            {isMobile ? null : (
                <div className="w-full flex justify-center mt-8 overflow-hidden mb-8">
                    <div className="w-full max-w-[1240px] flex justify-center rounded-2xl bg-[#eeeeee] dark:bg-[#222222] p-4 mx-4">
                        <FixedLineAd isLoaded={true}/>
                    </div>
                </div>
            )}
            {isLoading 
                ? <LoadingComponent heightStyle="min-h-[calc(100vh-165px)]"/> 
                : expeditionCharacters.length > 0 
                ? (
                    <div className="grid w-full grid-cols-1 gap-3 min-[812px]:grid-cols-2 min-[1224px]:grid-cols-3">
                        {expeditionCharacters.map((character) => (
                            <Card
                                key={character.id}
                                fullWidth
                                radius="lg"
                                shadow="sm"
                                className="overflow-hidden border border-gray-200/80 bg-white dark:border-white/10 dark:bg-[#171717]">
                                <CardHeader className="block border-b border-gray-200/80 p-3 dark:border-white/10">
                                    <div className="flex w-full min-w-0 items-center gap-2.5">
                                        <div className="flex min-w-0 items-center gap-3">
                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 dark:bg-primary-500/10">
                                                <JobEmblemIcon job={character.profile.className} size={34}/>
                                            </div>
                                            <div className="min-w-0 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                                                <h2 className="whitespace-nowrap text-sm font-bold">{character.nickname}</h2>
                                                <p className="mt-0.5 whitespace-nowrap text-[10px] fadedtext">
                                                    {character.profile.className} · 아이템 레벨 {character.profile.itemLevel.toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-3 grid grid-cols-2 gap-2">
                                        <div className="min-w-0 rounded-lg border border-orange-200/70 bg-orange-50/70 px-2.5 py-2 dark:border-orange-500/20 dark:bg-orange-500/10">
                                            <p className="whitespace-nowrap text-[9px] text-orange-700/70 dark:text-orange-300/70">아크 패시브</p>
                                            <p className="mt-0.5 overflow-x-auto whitespace-nowrap text-[11px] font-semibold text-orange-700 [scrollbar-width:none] dark:text-orange-300 [&::-webkit-scrollbar]:hidden">
                                                {character.profile.arkpassiveTitle || '미설정'}
                                            </p>
                                        </div>
                                        <div className="min-w-0 rounded-lg border border-gray-200/80 bg-gray-50 px-2.5 py-2 dark:border-white/10 dark:bg-white/[0.04]">
                                            <p className="whitespace-nowrap text-[9px] fadedtext">전투력</p>
                                            <div className="mt-0.5 flex items-center whitespace-nowrap">
                                                {character.profile.characterType === 'supportor' ? <SupportorIcon size={16}/> : <AttackIcon size={14}/>}
                                                <p className={clsx(
                                                    "ml-1 text-[11px] font-bold",
                                                    character.profile.characterType === 'supportor' ? 'text-green-800 dark:text-green-300' : 'text-red-800 dark:text-red-300'
                                                )}>{character.profile.combatPower.toLocaleString()}</p>
                                            </div>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardBody className="p-3">
                                    <div className="flex min-w-0 flex-col gap-3">
                                        <CompactSection title="장비 강화">
                                            <EquipmentComponent character={character}/>
                                        </CompactSection>
                                        <CompactSection title="전투 특성 · 아크 패시브">
                                            <div className="space-y-2">
                                                <StatComponent character={character}/>
                                                <div className="border-t border-gray-200/80 pt-2 dark:border-white/10">
                                                    <ArkpassiveComponent character={character}/>
                                                </div>
                                            </div>
                                        </CompactSection>
                                        <CompactSection title="각인 · 보석">
                                            <div className="space-y-2">
                                                <EngravingComponent character={character}/>
                                                <div className="border-t border-gray-200/80 pt-2 dark:border-white/10">
                                                    <GemComponent character={character}/>
                                                </div>
                                            </div>
                                        </CompactSection>
                                        <CompactSection title="카드 세트">
                                            <CardComponent character={character}/>
                                        </CompactSection>
                                    </div>
                                </CardBody>
                            </Card>
                        ))}
                    </div>
                )
                : (
                    <div className="w-full h-[600px] flex justify-center items-center">
                        <p className="fadedtext text-lg">검색 결과가 없습니다.</p>
                    </div>
                )}
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
