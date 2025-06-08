'use client'
import { useEffect } from "react";
import { EmptyComponent, LoadingComponent } from "../UtilsCompnents";
import { AbilityComponent, ExpeditionComponent, ProfileComponent, SearchComponent, useCharacterForm } from "./CharacterForm"
import { useSearchParams } from "next/navigation";
import { Divider, Tab, Tabs } from "@heroui/react";
import { loadProfile } from "./characterFeat";
import { useMobileQuery } from "@/utiils/utils";
import { SkillComponent } from "./SkillForm";

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
            component: <SkillComponent file={characterForm.file} gems={characterForm.gems}/>
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
    
    const l = "{\"Element_000\":{\"type\":\"NameTagBox\",\"value\":\"<P ALIGN='CENTER'><FONT COLOR='#F99200'>질풍</FONT></P>\"},\"Element_001\":{\"type\":\"ItemTitle\",\"value\":{\"bEquip\":0,\"leftStr0\":\"<FONT SIZE='12'><FONT COLOR='#F99200'>전설 스킬 룬</FONT></FONT>\",\"leftStr1\":\"\",\"leftStr2\":\"\",\"qualityValue\":-1,\"rightStr0\":\"\",\"slotData\":{\"advBookIcon\":0,\"battleItemTypeIcon\":0,\"blackListIcon\":0,\"cardIcon\":false,\"friendship\":0,\"iconGrade\":4,\"iconPath\":\"efui_iconatlas/use/use_7_194.png\",\"imagePath\":\"\",\"islandIcon\":0,\"petBorder\":0,\"rtString\":\"\",\"seal\":false,\"temporary\":0,\"town\":0,\"trash\":0}}},\"Element_002\":{\"type\":\"ItemPartBox\",\"value\":{\"Element_000\":\"<FONT COLOR='#A9D0F5'>스킬 룬 효과</FONT>\",\"Element_001\":\"스킬 시전 속도가 14% 증가\"}},\"Element_003\":{\"type\":\"SingleTextBox\",\"value\":\"<FONT COLOR='#E2C87A'><FONT SIZE='12'>스킬에 강력한 힘을 부여할 수 있는 특별한 룬이다.</FONT></FONT>\"},\"Element_004\":{\"type\":\"SingleTextBox\",\"value\":\"<Font color='#5FD3F1'>[가디언 토벌] 정화 1단계</font><BR><Font color='#5FD3F1'>[가디언 토벌] 정화 2단계</font>\"}}";

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