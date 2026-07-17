'use client'
import { useEffect, useState } from "react";
import { LoadingComponent } from "../UtilsCompnents";
import { AbilityComponent, ExpeditionComponent, HistoryComponent, InfomationComponent, NotFoundComponent, ProfileComponent, SearchComponent, useCharacterForm } from "./ui/CharacterForm"
import { useSearchParams } from "next/navigation";
import { Button, Divider, Input, Tooltip } from "@heroui/react";
import { handleSearch, loadProfile, LoadProfileUI, UpdatePayload, UpdateUI, useClickUpdate } from "./lib/characterFeat";
import { useMobileQuery } from "@/utiils/utils";
import { SkillComponent } from "./ui/SkillForm";
import { PointComponent } from "./ui/PointForm";
import { AvatarComponent } from "./ui/AvatarForm";
import { ExpeditionsComponent } from "./ui/ExpeditionForm";
import LineAd from "../ad/LineAd";
import BoxAd from "../ad/BoxAd";
import Script from "next/script";
import FixedLineAd from "../ad/FixedLineAd";
import { ArkGridComponent } from "./ui/ArkGridForm";
import { ExpeditionStatComponent } from "./ui/ExpeditionStatForm";
import { ExpeditionCharacter } from "./characterlist/model/types";
import { fetchCharacterList } from "./characterlist/lib/characterListFeat";

export default function CharacterClient() {
    const characterForm = useCharacterForm();
    const searchParams = useSearchParams();
    const nickname = searchParams.get('nickname');
    const isMobile = useMobileQuery();
    const [selectedTab, setSelectedTab] = useState("ability");
    const [expeditionStatRefreshKey, setExpeditionStatRefreshKey] = useState(0);
    const [expeditionStatCharacters, setExpeditionStatCharacters] = useState<ExpeditionCharacter[]>([]);
    const [isLoadingExpeditionStat, setLoadingExpeditionStat] = useState(false);
    const [loadedExpeditionStatNickname, setLoadedExpeditionStatNickname] = useState<string | null>(null);
    const [loadedExpeditionStatRefreshKey, setLoadedExpeditionStatRefreshKey] = useState(-1);
    //const onClickUpdate = useClickUpdate(nickname, characterForm.setDisable, characterForm.setLoadingUpdate, characterForm.file, characterForm.setFile, characterForm.setExpeditions, characterForm.setGems, characterForm.setCombat, characterForm.combat);
    
    useEffect(() => {
        if (nickname) {
            characterForm.setSearched(true);
            characterForm.setLoading(true);
            characterForm.setNickname(nickname);
        }
        const storedTime = localStorage.getItem('refreshCooldownTime');
        if (storedTime) {
            const cooldownEnd = parseInt(storedTime, 10);
            const now = Date.now();
            const diff = cooldownEnd - now;
            if (diff > 0) {
                characterForm.setDisable(true);
                const timer = setTimeout(() => {
                    characterForm.setDisable(false);
                }, diff);
                return () => clearTimeout(timer);
            }
        }
    }, []);

    const loadProfileUI: LoadProfileUI = {
        setSearched: characterForm.setSearched,
        setLoading: characterForm.setLoading,
        setNickname: characterForm.setNickname,
        setNothing: characterForm.setNothing,
        setExpeditions: characterForm.setExpeditions,
        setBadge: characterForm.setBadge,
        setCharacterInfo: characterForm.setCharacterInfo,
        setTitles: characterForm.setTitles,
        setAttackPieces: characterForm.setAttackPieces,
        setSupporterPieces: characterForm.setSupporterPieces
    }

    useEffect(() => {
        if (characterForm.nickname !== '') {
            document.title = `${characterForm.nickname}님의 전투정보실`
            const loadData = async () => await loadProfile(characterForm.nickname, loadProfileUI);
            loadData();
        } else {
            document.title = `전투정보실 · 로츠고 Lot's Go`
        }
    }, [characterForm.nickname]);

    useEffect(() => {
        setExpeditionStatCharacters([]);
        setLoadingExpeditionStat(false);
        setLoadedExpeditionStatNickname(null);
        setLoadedExpeditionStatRefreshKey(-1);
    }, [characterForm.nickname]);

    useEffect(() => {
        const targetNickname = characterForm.nickname;
        if (!targetNickname || selectedTab !== 'expeditionstat') {
            return;
        }
        if (
            loadedExpeditionStatNickname === targetNickname &&
            loadedExpeditionStatRefreshKey === expeditionStatRefreshKey
        ) {
            return;
        }

        let isMounted = true;

        const loadExpeditionStatCharacters = async () => {
            setLoadingExpeditionStat(true);
            const characters = await fetchCharacterList(targetNickname);
            if (!isMounted) {
                return;
            }

            setExpeditionStatCharacters(characters);
            setLoadedExpeditionStatNickname(targetNickname);
            setLoadedExpeditionStatRefreshKey(expeditionStatRefreshKey);
            setLoadingExpeditionStat(false);
        };

        loadExpeditionStatCharacters();

        return () => {
            isMounted = false;
        };
    }, [
        characterForm.nickname,
        expeditionStatRefreshKey,
        loadedExpeditionStatNickname,
        loadedExpeditionStatRefreshKey,
        selectedTab
    ]);
    const [inputSearch, setInputSearch] = useState('');

    if (!characterForm.isSearched) {
        return (
            <div className="min-h-[calc(100vh-65px)] p-5 w-full max-w-[1280px] mx-auto">
                <SearchComponent 
                    setSearched={characterForm.setSearched} 
                    setLoading={characterForm.setLoading}
                    setNickname={characterForm.setNickname}/>
                <Divider/>
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
                <InfomationComponent/>
                <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3 mx-auto mt-4">
                    <HistoryComponent 
                        setSearched={characterForm.setSearched} 
                        setLoading={characterForm.setLoading}
                        setNickname={characterForm.setNickname}/>
                    <ExpeditionComponent 
                        setSearched={characterForm.setSearched} 
                        setLoading={characterForm.setLoading}
                        setNickname={characterForm.setNickname}/>
                </div>
            </div>
        )
    }

    if (characterForm.isLoading) {
        return <LoadingComponent heightStyle="min-h-[calc(100vh-65px)]"/>
    }

    if (characterForm.isNothing) {
        return <NotFoundComponent
            nickname={characterForm.nickname}
            setSearched={characterForm.setSearched} 
            setLoading={characterForm.setLoading}
            setNickname={characterForm.setNickname}/>
    }

    if (!characterForm.characterInfo) {
        return <LoadingComponent heightStyle="min-h-[calc(100vh-65px)]"/>
    }

    const tabs = [
        {
            id: 'ability',
            label: '능력치',
            component: <AbilityComponent 
                info={characterForm.characterInfo}
                titles={characterForm.titles}
                attackPieces={characterForm.attackPieces}
                supportorPieces={characterForm.supporterPieces}/>
        },
        {
            id: 'skill',
            label: '스킬',
            component: <SkillComponent info={characterForm.characterInfo}/>
        },
        {
            id: 'arkgrid',
            label: '아크그리드',
            component: <ArkGridComponent info={characterForm.characterInfo}/>
        },
        {
            id: 'story',
            label: '수집형 포인트',
            component: <PointComponent info={characterForm.characterInfo}/>
        },
        {
            id: 'cody',
            label: '아바타',
            component: <AvatarComponent info={characterForm.characterInfo}/>
        },
        {
            id: 'expedition',
            label: '원정대',
            component: <ExpeditionsComponent expeditions={characterForm.expeditions}/>
        },
        {
            id: 'expeditionstat',
            label: '원정대 정보',
            component: (
                <ExpeditionStatComponent
                    nickname={characterForm.nickname || null}
                    expeditionCharacters={expeditionStatCharacters}
                    isLoading={isLoadingExpeditionStat}/>
            )
        }
    ]
    const selectedTabItem = tabs.find((tab) => tab.id === selectedTab) ?? tabs[0];

    const updateUI: UpdateUI = {
        setDisable: characterForm.setDisable,
        setCharacterInfo: characterForm.setCharacterInfo,
        setExpeditions: characterForm.setExpeditions,
        setLoadingUpdate: characterForm.setLoadingUpdate,
        setTitles: characterForm.setTitles,
        setAttackPieces: characterForm.setAttackPieces,
        setSupportorPieces: characterForm.setSupporterPieces
    }
    const updatePayload: UpdatePayload = {
        nickname: characterForm.nickname,
        expeditions: characterForm.expeditions,
        titles: characterForm.titles,
        attackPieces: characterForm.attackPieces,
        supportorPieces: characterForm.supporterPieces
    }
    const onClickUpdate = useClickUpdate(updateUI, updatePayload);
    const onPressUpdate = async () => {
        const isSuccess = await onClickUpdate();
        if (isSuccess) {
            setExpeditionStatRefreshKey((prev) => prev + 1);
        }
    };

    return (
        <>
            <div className="w-full">
                <ProfileComponent info={characterForm.characterInfo} isBadge={characterForm.isBadge}/>
                {!characterForm.isLoading ? isMobile ? (
                    <div className="w-full flex justify-center px-4 overflow-hidden mt-4">
                        <div className="w-full max-w-[970px] min-h-[60px] max-h-[80px]">
                            <LineAd isLoaded={!characterForm.isLoading}/>
                        </div>
                    </div>
                ) : (
                    <div className="w-full flex justify-center mt-4 overflow-hidden">
                        <div className="w-full max-w-[1240px] flex justify-center rounded-2xl bg-[#eeeeee] dark:bg-[#222222] p-4 mx-4">
                            <FixedLineAd isLoaded={!characterForm.isLoading}/>
                        </div>
                    </div>
                ) : <></>}
                <div className="min-h-[calc(100vh-65px)] p-5 w-full max-w-[1280px] mx-auto">
                    <div className="rounded-2xl border border-default-200 bg-white p-2 shadow-sm dark:border-white/10 dark:bg-[#171717] md960:flex md960:items-center md960:gap-3">
                    <div role="tablist" aria-label="전투정보실 메뉴" className="flex min-w-0 grow gap-1 overflow-x-auto rounded-xl bg-default-100/80 p-1 scrollbar-hide dark:bg-white/[0.05]">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                type="button"
                                role="tab"
                                aria-selected={selectedTab === tab.id}
                                className={selectedTab === tab.id
                                    ? "h-10 shrink-0 rounded-lg bg-white px-4 text-sm font-semibold text-primary shadow-sm transition-colors dark:bg-white/10"
                                    : "h-10 shrink-0 rounded-lg px-4 text-sm font-semibold text-default-500 transition-colors hover:bg-white/60 hover:text-foreground dark:hover:bg-white/[0.06]"}
                                onClick={() => setSelectedTab(tab.id)}>
                                {tab.label}
                            </button>
                        ))}
                    </div>
                    <div className="mt-2 flex w-full flex-col items-center gap-2 md960:mt-0 md960:w-auto md960:shrink-0 md960:flex-row">
                        <Input
                            radius="lg"
                            variant="bordered"
                            aria-label="다른 캐릭터 검색"
                            placeholder="다른 캐릭터 검색"
                            value={inputSearch}
                            onValueChange={setInputSearch}
                            maxLength={12}
                            startContent={<span className="text-lg text-default-400">⌕</span>}
                            className="w-full md960:w-[220px]"
                            classNames={{
                                inputWrapper: "h-10 border-default-200 bg-default-50 shadow-none data-[hover=true]:border-primary/50 dark:border-white/10 dark:bg-white/[0.05]",
                                input: "text-sm"
                            }}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    handleSearch(inputSearch, characterForm.setSearched, characterForm.setLoading, characterForm.setNickname);
                                    const params = new URLSearchParams(window.location.search);
                                    params.set("nickname", inputSearch);
                                    const newUrl = `${window.location.pathname}?${params.toString()}`;
                                    setInputSearch('');
                                    window.history.pushState({}, "", newUrl);
                                }
                            }}/>
                        <Tooltip showArrow content="해당 캐릭터 접속을 종료하고 갱신해주세요.">
                            <Button
                                radius="lg"
                                color="primary"
                                isLoading={characterForm.isLoadingUpdate}
                                isDisabled={characterForm.isDisable}
                                className="h-10 w-full min-w-28 font-bold md960:w-auto"
                                onPress={onPressUpdate}>
                                <span className="text-base">↻</span>
                                정보 갱신
                            </Button>
                        </Tooltip>
                    </div>
                    </div>
                    <div className="pt-5">{selectedTabItem.component}</div>
                    {!characterForm.isLoading && !characterForm.isNothing ? isMobile ? (
                        <div className="w-full flex justify-center px-4">
                            <div className="w-full max-w-[360px] min-h-[100px] mt-4">
                                <BoxAd isLoaded={!characterForm.isLoading}/>
                            </div>
                        </div>
                    ) : (
                        <div className="w-full flex justify-center px-4 overflow-hidden mt-8">
                            <div className="w-full max-w-[1240px] flex justify-center rounded-2xl bg-[#eeeeee] dark:bg-[#222222] p-8">
                                <div className="w-full max-w-[970px] min-h-[60px] max-h-[80px]">
                                    <LineAd isLoaded={!characterForm.isLoading}/>
                                </div>
                            </div>
                        </div>
                    ) : <></>}
                </div>
                <Script
                    async
                    src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1236449818258742"
                    crossOrigin="anonymous"/>
            </div>
        </>
    )
}
