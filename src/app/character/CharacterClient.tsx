'use client'
import { useCallback, useEffect, useRef, useState } from "react";
import { LoadingComponent } from "../UtilsCompnents";
import { AbilityComponent, InfomationComponent, NotFoundComponent, useCharacterForm } from "./ui/CharacterForm"
import { ExpeditionComponent, HistoryComponent, RecentCharacterSearchMenu, SearchComponent } from "./ui/CharacterSearchSections"
import { ProfileComponent } from "./ui/CharacterProfile"
import { useSearchParams } from "next/navigation";
import { Button, Divider, Input, Modal, ModalBody, ModalContent, ModalFooter, Tooltip } from "@heroui/react";
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
import { CombatSimulatorComponent } from "./ui/CombatSimulatorForm";
import { CharacterHistory, getRecentCharacterHistory } from "./lib/history";

function RefreshIcon({ className }: { className?: string }) {
    return (
        <svg
            aria-hidden="true"
            className={className}
            fill="none"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg">
            <path
                d="M20 11a8.1 8.1 0 0 0-14.9-4.4L3 9"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"/>
            <path
                d="M3 4v5h5M4 13a8.1 8.1 0 0 0 14.9 4.4L21 15"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"/>
            <path
                d="M21 20v-5h-5"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"/>
        </svg>
    );
}

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
    const [isSettingConfirmOpen, setSettingConfirmOpen] = useState(false);
    const [tabIndicator, setTabIndicator] = useState({ left: 0, width: 0 });
    const settingConfirmResolver = useRef<((useCachedCharacter: boolean) => void) | null>(null);
    const tabListRef = useRef<HTMLDivElement | null>(null);
    const tabButtonRefs = useRef<Record<string, HTMLButtonElement | null>>({});
    //const onClickUpdate = useClickUpdate(nickname, characterForm.setDisable, characterForm.setLoadingUpdate, characterForm.file, characterForm.setFile, characterForm.setExpeditions, characterForm.setGems, characterForm.setCombat, characterForm.combat);

    const confirmUseCachedCharacter = useCallback(() => {
        return new Promise<boolean>((resolve) => {
            settingConfirmResolver.current = resolve;
            setSettingConfirmOpen(true);
        });
    }, []);

    const answerSettingConfirm = useCallback((useCachedCharacter: boolean) => {
        settingConfirmResolver.current?.(useCachedCharacter);
        settingConfirmResolver.current = null;
        setSettingConfirmOpen(false);
    }, []);

    const syncTabIndicator = useCallback(() => {
        const activeTab = tabButtonRefs.current[selectedTab];
        if (!activeTab) {
            return;
        }

        setTabIndicator((current) => {
            const next = { left: activeTab.offsetLeft, width: activeTab.offsetWidth };
            return current.left === next.left && current.width === next.width ? current : next;
        });
    }, [selectedTab]);

    useEffect(() => {
        const frame = requestAnimationFrame(syncTabIndicator);
        const resizeObserver = new ResizeObserver(syncTabIndicator);
        const tabList = tabListRef.current;
        const activeTab = tabButtonRefs.current[selectedTab];

        if (tabList) {
            resizeObserver.observe(tabList);
        }
        if (activeTab) {
            resizeObserver.observe(activeTab);
        }

        return () => {
            cancelAnimationFrame(frame);
            resizeObserver.disconnect();
        };
    }, [characterForm.characterInfo, characterForm.isLoading, selectedTab, syncTabIndicator]);

    const settingConfirmModal = (
        <Modal
            aria-label="캐릭터 정보 확인"
            isOpen={isSettingConfirmOpen}
            isDismissable={false}
            isKeyboardDismissDisabled
            hideCloseButton
            placement="center"
            size="md"
            classNames={{
                backdrop: "bg-black/55 backdrop-blur-[2px]",
                base: "overflow-hidden border border-default-200/80 bg-content1 shadow-2xl dark:border-white/10 dark:bg-[#171717]"
            }}>
            <ModalContent>
                <div className="h-1 w-full bg-gradient-to-r from-primary-400 via-primary to-sky-400"/>
                <ModalBody className="px-5 pb-4 pt-5 sm:px-6 sm:pt-6">
                    <div className="flex items-start gap-3">
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-xl font-black text-primary dark:bg-primary/20">
                            !
                        </span>
                        <div className="min-w-0 pt-0.5">
                            <p className="text-lg font-bold tracking-tight text-foreground">캐릭터 세팅을 확인해주세요</p>
                            <p className="mt-1 text-sm leading-6 text-default-500">현재 조회된 정보가 평소 전투 세팅과 다를 수 있습니다.</p>
                        </div>
                    </div>
                    <div className="mt-1 rounded-xl border border-default-200/80 bg-default-50 px-4 py-3.5 dark:border-white/10 dark:bg-white/[0.04]">
                        <p className="text-sm font-semibold text-foreground">카던 세팅 또는 보석이 없습니다.</p>
                        <p className="mt-1 text-sm text-default-500">데이터베이스에서 데이터를 불러올까요?</p>
                    </div>
                </ModalBody>
                <ModalFooter className="gap-2 border-t border-default-100 px-5 pb-5 pt-4 dark:border-white/[0.08] sm:px-6">
                    <Button
                        className="h-11 flex-1 font-semibold"
                        radius="lg"
                        variant="bordered"
                        onPress={() => answerSettingConfirm(false)}>
                        아니요
                    </Button>
                    <Button
                        className="h-11 flex-1 font-bold shadow-sm shadow-primary/20"
                        radius="lg"
                        color="primary"
                        onPress={() => answerSettingConfirm(true)}>
                        예
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
    
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
        setSupporterPieces: characterForm.setSupporterPieces,
        confirmUseCachedCharacter
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
    const [recentSearches, setRecentSearches] = useState<CharacterHistory[]>([]);
    const [isRecentSearchOpen, setRecentSearchOpen] = useState(false);
    const recentSearchRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const handlePointerDown = (event: PointerEvent) => {
            if (!recentSearchRef.current?.contains(event.target as Node)) {
                setRecentSearchOpen(false);
            }
        };

        document.addEventListener('pointerdown', handlePointerDown);
        return () => document.removeEventListener('pointerdown', handlePointerDown);
    }, []);

    const openRecentSearches = () => {
        setRecentSearches(getRecentCharacterHistory(5));
        setRecentSearchOpen(true);
    };

    const searchOtherCharacter = (searchValue: string) => {
        const trimmedSearch = searchValue.trim();
        if (!trimmedSearch) {
            return;
        }

        handleSearch(trimmedSearch, characterForm.setSearched, characterForm.setLoading, characterForm.setNickname);
        const params = new URLSearchParams(window.location.search);
        params.set("nickname", trimmedSearch);
        const newUrl = `${window.location.pathname}?${params.toString()}`;
        window.history.pushState({}, "", newUrl);
        setInputSearch('');
        setRecentSearchOpen(false);
    };

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
        return (
            <>
                <LoadingComponent
                    heightStyle="min-h-[calc(100vh-65px)]"
                    message="전투정보실 데이터를 불러오고 있어요"
                    detail="프로필과 장비, 보석, 아크 패시브 정보를 분석하고 있습니다."/>
                {settingConfirmModal}
            </>
        )
    }

    if (characterForm.isNothing) {
        return <NotFoundComponent
            nickname={characterForm.nickname}
            setSearched={characterForm.setSearched} 
            setLoading={characterForm.setLoading}
            setNickname={characterForm.setNickname}/>
    }

    if (!characterForm.characterInfo) {
        return (
            <LoadingComponent
                heightStyle="min-h-[calc(100vh-65px)]"
                message="캐릭터 정보를 정리하고 있어요"
                detail="불러온 전투 데이터를 화면에 맞게 구성하고 있습니다."/>
        )
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
            id: 'simulator',
            label: '시뮬레이션',
            component: <CombatSimulatorComponent info={characterForm.characterInfo}/>
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
        setSupportorPieces: characterForm.setSupporterPieces,
        confirmUseCachedCharacter
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
            {settingConfirmModal}
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
                    <div className="min-w-0 grow overflow-x-auto rounded-xl bg-gradient-to-r from-default-100 via-primary-50/80 to-default-100 scrollbar-hide dark:from-white/[0.05] dark:via-primary/10 dark:to-white/[0.05]">
                        <div ref={tabListRef} role="tablist" aria-label="전투정보실 메뉴" className="relative flex w-max min-w-full gap-1 p-1">
                            <span
                                aria-hidden="true"
                                className={`pointer-events-none absolute inset-y-1 left-0 rounded-lg border border-primary/15 bg-white shadow-[0_3px_12px_rgba(0,111,238,0.14)] transition-[width,transform,opacity] duration-300 ease-out dark:border-primary/30 dark:bg-primary/20 dark:shadow-[0_3px_14px_rgba(0,111,238,0.16)] ${tabIndicator.width > 0 ? "opacity-100" : "opacity-0"}`}
                                style={{
                                    width: tabIndicator.width,
                                    transform: `translateX(${tabIndicator.left}px)`
                                }}/>
                            {tabs.map((tab) => (
                                <button
                                    ref={(element) => {
                                        tabButtonRefs.current[tab.id] = element;
                                    }}
                                    key={tab.id}
                                    type="button"
                                    role="tab"
                                    aria-selected={selectedTab === tab.id}
                                    className={selectedTab === tab.id
                                        ? "relative z-10 h-10 shrink-0 cursor-pointer rounded-lg px-4 text-sm font-bold text-primary outline-none transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-inset"
                                        : "relative z-10 h-10 shrink-0 cursor-pointer rounded-lg px-4 text-sm font-semibold text-default-500 outline-none transition-colors duration-300 hover:text-foreground focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-inset"}
                                    onClick={() => setSelectedTab(tab.id)}>
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="mt-2 flex w-full flex-col items-center gap-2 md960:mt-0 md960:w-auto md960:shrink-0 md960:flex-row">
                        <div ref={recentSearchRef} className="relative w-full md960:w-[220px]">
                            <Input
                                radius="lg"
                                variant="bordered"
                                aria-label="다른 캐릭터 검색"
                                placeholder="다른 캐릭터 검색"
                                value={inputSearch}
                                onValueChange={setInputSearch}
                                onFocus={openRecentSearches}
                                maxLength={12}
                                startContent={<span className="text-lg text-default-400">⌕</span>}
                                className="w-full"
                                classNames={{
                                    inputWrapper: "h-10 border-default-200 bg-default-50 shadow-none data-[hover=true]:border-primary/50 dark:border-white/10 dark:bg-white/[0.05]",
                                    input: "text-sm"
                                }}
                                onKeyDown={(event) => {
                                    if (event.key === 'Enter') {
                                        event.preventDefault();
                                        searchOtherCharacter(inputSearch);
                                    } else if (event.key === 'Escape') {
                                        setRecentSearchOpen(false);
                                    }
                                }}/>
                            {isRecentSearchOpen ? (
                                <RecentCharacterSearchMenu
                                    historys={recentSearches}
                                    onSelect={searchOtherCharacter}/>
                            ) : null}
                        </div>
                        <Tooltip showArrow content="해당 캐릭터 접속을 종료하고 갱신해주세요.">
                            <Button
                                radius="lg"
                                color="primary"
                                isDisabled={characterForm.isDisable || characterForm.isLoadingUpdate}
                                className="h-10 w-full min-w-28 font-bold md960:w-auto"
                                onPress={onPressUpdate}>
                                <RefreshIcon className={`h-[18px] w-[18px] ${characterForm.isLoadingUpdate ? "animate-spin [animation-direction:reverse]" : ""}`}/>
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
