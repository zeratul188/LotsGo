'use client'
import { useEffect, useState } from "react";
import { EmptyComponent, LoadingComponent } from "../UtilsCompnents";
import { AbilityComponent, ExpeditionComponent, HistoryComponent, ProfileComponent, SearchComponent, useCharacterForm } from "./CharacterForm"
import { useSearchParams } from "next/navigation";
import { Button, Divider, Input, Tab, Tabs, Tooltip } from "@heroui/react";
import { handleSearch, loadProfile, useClickUpdate } from "./characterFeat";
import { useMobileQuery } from "@/utiils/utils";
import { SkillComponent } from "./SkillForm";
import { PointComponent } from "./PointForm";
import { AvatarComponent } from "./AvatarForm";
import { ExpeditionsComponent } from "./ExpeditionForm";

export default function Character() {
    const characterForm = useCharacterForm();
    const searchParams = useSearchParams();
    const nickname = searchParams.get('nickname');
    const isMobile = useMobileQuery();
    const onClickUpdate = useClickUpdate(nickname, characterForm.setDisable, characterForm.setLoadingUpdate, characterForm.file, characterForm.setFile, characterForm.setExpeditions, characterForm.setGems);
    
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
            const loadData = async () => await loadProfile(characterForm.nickname, characterForm.setSearched, characterForm.setLoading, characterForm.setNickname, characterForm.file, characterForm.setFile, characterForm.setNothing, characterForm.setExpeditions);
            loadData();
        }
    }, [characterForm.nickname]);

    const tabs = [
        {
            id: 'ability',
            label: '능력치',
            component: <AbilityComponent file={characterForm.file} gems={characterForm.gems} setGems={characterForm.setGems}/>
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
                <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3 mx-auto mt-10">
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
        return <EmptyComponent heightStyle="min-h-[calc(100vh-65px)]"/>
    }

    return (
        <div className="w-full">
            <ProfileComponent file={characterForm.file}/>
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
            </div>
        </div>
    )
}