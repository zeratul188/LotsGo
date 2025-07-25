'use client'
import { useEffect, useState } from "react";
import { LoadingComponent } from "../UtilsCompnents";
import { AbilityComponent, ExpeditionComponent, HistoryComponent, InfomationComponent, NotFoundComponent, ProfileComponent, SearchComponent, useCharacterForm } from "./CharacterForm"
import { useSearchParams } from "next/navigation";
import { Button, Divider, Input, Tab, Tabs, Tooltip } from "@heroui/react";
import { handleSearch, loadProfile, useClickUpdate } from "./characterFeat";
import { useMobileQuery } from "@/utiils/utils";
import { SkillComponent } from "./SkillForm";
import { PointComponent } from "./PointForm";
import { AvatarComponent } from "./AvatarForm";
import { ExpeditionsComponent } from "./ExpeditionForm";
import LineAd from "../ad/LineAd";
import BoxAd from "../ad/BoxAd";
import Script from "next/script";
import FixedLineAd from "../ad/FixedLineAd";

export default function CharacterClient() {
    const characterForm = useCharacterForm();
    const searchParams = useSearchParams();
    const nickname = searchParams.get('nickname');
    const isMobile = useMobileQuery();
    const onClickUpdate = useClickUpdate(nickname, characterForm.setDisable, characterForm.setLoadingUpdate, characterForm.file, characterForm.setFile, characterForm.setExpeditions, characterForm.setGems, characterForm.setCombat, characterForm.combat);
    
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

    useEffect(() => {
        if (characterForm.nickname !== '') {
            document.title = `${characterForm.nickname}님의 전투정보실`
            const loadData = async () => await loadProfile(characterForm.nickname, characterForm.setSearched, characterForm.setLoading, characterForm.setNickname, characterForm.file, characterForm.setFile, characterForm.setNothing, characterForm.setExpeditions, characterForm.setBadge, characterForm.setCombat, characterForm.combat);
            loadData();
        } else {
            document.title = `전투정보실 · 로츠고 Lot's Go`
        }
    }, [characterForm.nickname]);

    const tabs = [
        {
            id: 'ability',
            label: '능력치',
            component: <AbilityComponent file={characterForm.file} gems={characterForm.gems} setGems={characterForm.setGems} combat={characterForm.combat}/>
        },
        {
            id: 'skill',
            label: '스킬',
            component: <SkillComponent file={characterForm.file} gems={characterForm.gems}/>
        },
        {
            id: 'story',
            label: '수집형 포인트',
            component: <PointComponent file={characterForm.file}/>
        },
        {
            id: 'cody',
            label: '아바타',
            component: <AvatarComponent file={characterForm.file}/>
        },
        {
            id: 'expedition',
            label: '원정대',
            component: <ExpeditionsComponent expeditions={characterForm.expeditions}/>
        }
    ]
    const [inputSearch, setInputSearch] = useState('');

    if (!characterForm.isSearched) {
        return (
            <div className="min-h-[calc(100vh-65px)] p-5 w-full max-w-[1280px] mx-auto">
                <SearchComponent 
                    setSearched={characterForm.setSearched} 
                    setLoading={characterForm.setLoading}
                    setNickname={characterForm.setNickname}/>
                <Divider/>
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

    return (
        <>
            <div className="w-full">
                <ProfileComponent file={characterForm.file} isBadge={characterForm.isBadge}/>
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
                <div className="min-h-[calc(100vh-65px)] p-5 w-full max-w-[1280px] mx-auto md960:relative">
                    <div className="w-full md960:w-[max-content] md960:absolute md960:top-4 md960:right-4 mb-4 md960:mb-0 flex flex-col md960:flex-row gap-3">
                        <Input
                            radius="sm"
                            placeholder="캐릭터명을 입력 후 Enter"
                            value={inputSearch}
                            onValueChange={setInputSearch}
                            maxLength={12}
                            className="w-full md960:w-[220px]"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    characterForm.setGems([]);
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
                                radius="sm"
                                color="primary"
                                isLoading={characterForm.isLoadingUpdate}
                                isDisabled={characterForm.isDisable}
                                className="w-full md960:w-[max-content]"
                                onPress={onClickUpdate}>
                                갱신하기
                            </Button>
                        </Tooltip>
                    </div>
                    <Tabs 
                        fullWidth={isMobile} 
                        aria-label="character-tabs" 
                        items={tabs} 
                        size="lg" 
                        variant="underlined">
                        {(item) => (
                            <Tab key={item.id} title={item.label}>
                                {item.component}
                            </Tab>
                        )}
                    </Tabs>
                    {!characterForm.isLoading && !characterForm.isNothing && characterForm.file.profile ? isMobile ? (
                        <div className="w-full flex justify-center px-4">
                            <div className="w-full max-w-[360px] min-h-[100px] mt-4">
                                <BoxAd isLoaded={!characterForm.isLoading}/>
                            </div>
                        </div>
                    ) : (
                        <div className="w-full flex justify-center px-4 overflow-hidden mt-4">
                            <div className="w-full max-w-[970px] min-h-[60px] max-h-[80px]">
                                <LineAd isLoaded={!characterForm.isLoading}/>
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