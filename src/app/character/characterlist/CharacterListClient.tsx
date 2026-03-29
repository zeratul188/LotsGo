'use client'
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { ExpeditionCharacter } from "./model/types";
import { loadCharacterList } from "./lib/characterListFeat";
import { Button, Card, CardBody, CardHeader, Divider, Input, Spinner } from "@heroui/react";
import SupportorIcon from "@/Icons/SupportorIcon";
import AttackIcon from "@/Icons/AttackIcon";
import clsx from "clsx";
import { LoadingComponent } from "@/app/UtilsCompnents";
import { AccessoriesComponent, ArkgridComponent, ArkpassiveComponent, CardComponent, EngravingComponent, EquipmentComponent, GemComponent, StatComponent } from "./ui/CharacterForm";
import JobEmblemIcon from "@/Icons/JobEmblemIcon";
import Script from "next/script";
import dynamic from "next/dynamic";
import { useMobileQuery } from "@/utiils/utils";
const LineAd = dynamic(() => import("@/app/ad/LineAd"), { ssr: false });
const FixedLineAd = dynamic(() => import("@/app/ad/FixedLineAd"), { ssr: false });
const BoxAd = dynamic(() => import("@/app/ad/BoxAd"), { ssr: false });

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
            <div className="min-h-[calc(100vh-65px)] p-5 w-full flex justify-center items-center">
                <Spinner label="로그인 정보를 확인 중입니다..." variant="wave" classNames={{ label: 'fadedtext mt-4' }}/>
            </div>
        )
    }

    return (
        <div className="min-h-[calc(100vh-65px)] p-5 w-full max-w-[1280px] mx-auto">
            <div className="w-full flex gap-1 flex-col sm:flex-row sm:items-end mb-4">
                <div className="grow">
                    <h1 className="text-3xl font-bold">원정대 모아보기</h1>
                    <div className="mt-2">
                        <p className="text-sm fadedtext">원정대 캐릭터의 핵심 스펙을 한눈에 간략하게 확인할 수 있습니다.</p>
                        <p className="text-xs fadedtext">전투정보실에서 최소 1회 이상 조회한 캐릭터만 표시되며, 전투정보실 조회 시점에 저장된 데이터만 노출됩니다.</p>
                    </div>
                </div>
                <div className="w-full sm:w-fit flex gap-2">
                    <Input
                        radius="sm"
                        placeholder="닉네임을 검색하세요."
                        value={search}
                        onValueChange={setSearch}
                        onKeyDown={async (e) => {
                            if (e.key === 'Enter') await handleSearchCharacter();
                        }}/>
                    <Button
                        radius="sm"
                        color="primary"
                        onPress={async () => await handleSearchCharacter()}>
                        검색
                    </Button>
                </div>
            </div>
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
            {isLoading 
                ? <LoadingComponent heightStyle="min-h-[calc(100vh-165px)]"/> 
                : expeditionCharacters.length > 0 
                ? (
                    <div className="w-full grid min-[812px]:grid-cols-2 min-[1224px]:grid-cols-3 gap-3">
                        {expeditionCharacters.map((character) => (
                            <Card key={character.id} fullWidth radius="sm">
                                <CardHeader>
                                    <div className="w-full flex gap-2 items-center">
                                        <JobEmblemIcon job={character.profile.className} size={38}/>
                                        <div>
                                            <p className="fadedtext text-[9pt]">{character.profile.className} · Lv.{character.profile.itemLevel}</p>
                                            <p>{character.nickname}</p>
                                        </div>
                                        <div className="ml-auto flex flex-col">
                                            <p className="text-[9pt] text-right text-orange-700 dark:text-orange-300">{character.profile.arkpassiveTitle}</p>
                                            <div className="flex items-center justify-end">
                                                {character.profile.characterType === 'supportor' ? <SupportorIcon size={18}/> : <AttackIcon size={16}/>}
                                                <p className={clsx(
                                                    "font-bold",
                                                    character.profile.characterType === 'supportor' ? 'text-green-800 dark:text-green-300' : 'text-red-800 dark:text-red-300 ml-0.5'
                                                )}>{character.profile.combatPower}</p>
                                            </div>
                                        </div>
                                    </div>
                                </CardHeader>
                                <Divider/>
                                <CardBody>
                                    <div className="w-full flex flex-col gap-2">
                                        <EquipmentComponent character={character}/>
                                        <Divider/>
                                        <AccessoriesComponent character={character}/>
                                        <Divider/>
                                        <StatComponent character={character}/>
                                        <Divider/>
                                        <ArkpassiveComponent character={character}/>
                                        <Divider/>
                                        <EngravingComponent character={character}/>
                                        <Divider/>
                                        <GemComponent character={character}/>
                                        <Divider/>
                                        <ArkgridComponent character={character}/>
                                        <Divider/>
                                        <CardComponent character={character}/>
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
