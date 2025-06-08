'use client'
import { useEffect } from "react";
import { EmptyComponent, LoadingComponent } from "../UtilsCompnents";
import { AbilityComponent, ExpeditionComponent, ProfileComponent, SearchComponent, useCharacterForm } from "./CharacterForm"
import { useSearchParams } from "next/navigation";
import { Divider, Tab, Tabs } from "@heroui/react";
import { loadProfile } from "./characterFeat";
import { useMobileQuery } from "@/utiils/utils";

export default function Character() {
    const characterForm = useCharacterForm();
    const searchParams = useSearchParams();
    const nickname = searchParams.get('nickname');
    const isMobile = useMobileQuery();
    
    useEffect(() => {
        if (nickname) {
            characterForm.setSearched(true);
            characterForm.setLoading(true);
            characterForm.setNickname(nickname);
        }
    }, []);

    useEffect(() => {
        if (characterForm.nickname !== '') {
            const loadData = async () => await loadProfile(characterForm.nickname, characterForm.setSearched, characterForm.setLoading, characterForm.setNickname, characterForm.file, characterForm.setFile, characterForm.setNothing);
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
            component: null
        },
        {
            id: 'story',
            label: '수집형 포인트',
            component: null
        },
        {
            id: 'cody',
            label: '아바타',
            component: null
        },
        {
            id: 'expedition',
            label: '원정대',
            component: null
        }
    ]

    if (!characterForm.isSearched) {
        return (
            <div className="min-h-[calc(100vh-65px)] p-5 w-full max-w-[1280px] mx-auto">
                <SearchComponent 
                    setSearched={characterForm.setSearched} 
                    setLoading={characterForm.setLoading}
                    setNickname={characterForm.setNickname}/>
                <Divider/>
                <ExpeditionComponent 
                    setSearched={characterForm.setSearched} 
                    setLoading={characterForm.setLoading}
                    setNickname={characterForm.setNickname}/>
            </div>
        )
    }

    if (characterForm.isLoading) {
        return <LoadingComponent heightStyle="min-h-[calc(100vh-65px)]"/>
    }

    if (characterForm.isNothing) {
        return <EmptyComponent heightStyle="min-h-[calc(100vh-65px)]"/>
    }
    
    const l = "{\"Element_000\":{\"type\":\"NameTagBox\",\"value\":\"절제\"},\"Element_001\":{\"type\":\"CommonSkillTitle\",\"value\":{\"leftText\":\"아크 패시브 레벨 <FONT COLOR='#FFD200'>3</FONT>\",\"level\":\"\",\"name\":\"<FONT SIZE='13' COLOR='#FFFFAC'>깨달음</FONT>\",\"slotData\":{\"iconGrade\":0,\"iconPath\":\"https://cdn-lostark.game.onstove.com/efui_iconatlas/ark_passive_01/ark_passive_01_52.png\",\"imagePath\":\"\"}}},\"Element_002\":{\"type\":\"MultiTextBox\",\"value\":\"집중 스탠스를 사용할 수 없지만, 듀얼 게이지 획득량이 <FONT COLOR='#99ff99'>100.0%</FONT> 증가한다.||<BR>\"}}";

    return (
        <div className="w-full">
            <ProfileComponent file={characterForm.file}/>
            <div className="min-h-[calc(100vh-65px)] p-5 w-full max-w-[1280px] mx-auto">
                <Tabs fullWidth={isMobile} aria-label="character-tabs" items={tabs} size="lg" variant="underlined">
                    {(item) => (
                        <Tab key={item.id} title={item.label}>
                            {item.component}
                        </Tab>
                    )}
                </Tabs>
            </div>
            <p className="whitespace-pre-line hidden">{l}</p>
        </div>
    )
}