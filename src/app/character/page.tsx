'use client'
import { useEffect } from "react";
import { LoadingComponent } from "../UtilsCompnents";
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
            const loadData = async () => await loadProfile(characterForm.nickname, characterForm.setSearched, characterForm.setLoading, characterForm.setNickname, characterForm.file, characterForm.setFile);
            loadData();
        }
    }, [characterForm.nickname]);

    const tabs = [
        {
            id: 'ability',
            label: '능력치',
            component: <AbilityComponent file={characterForm.file}/>
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
    
    const l = "{\r\n  \"Element_000\": {\r\n    \"type\": \"NameTagBox\",\r\n    \"value\": \"<FONT COLOR='#F99200'>각성한 진저웨일</FONT>\"\r\n  },\r\n  \"Element_001\": {\r\n    \"type\": \"Card\",\r\n    \"value\": {\r\n      \"awakeCount\": 5,\r\n      \"awakeTotal\": 5,\r\n      \"cardStack\": \"\",\r\n      \"iconData\": {\r\n        \"iconPath\": \"https://cdn-lostark.game.onstove.com/efui_iconatlas/card_legend/card_legend_05_5.png\"\r\n      },\r\n      \"isBookMark\": false,\r\n      \"notRegistered\": false,\r\n      \"tierGrade\": 5\r\n    }\r\n  },\r\n  \"Element_002\": {\r\n    \"type\": \"MultiTextBox\",\r\n    \"value\": \"|\"\r\n  },\r\n  \"Element_003\": {\r\n    \"type\": \"SingleTextBox\",\r\n    \"value\": \"<FONT COLOR='#E2C87A'><FONT SIZE='12'>마침내 환영술을 완성한 진저웨일. 무수히 많은 분신을 자유롭게 만들 수 있게 되었다.</FONT></FONT>\"\r\n  },\r\n  \"Element_004\": {\r\n    \"type\": \"SingleTextBox\",\r\n    \"value\": \"<Font color='#5FD3F1'>[카제로스 레이드] 서막 : 붉어진 백야의 나선 - 하드</font><BR><Font color='#5FD3F1'>[에픽 레이드] 폭풍의 지휘관, 베히모스</font><BR><Font color='#5FD3F1'>[카제로스 레이드] 1막 : 대지를 부수는 업화의 궤적</font><BR><Font color='#5FD3F1'>그 외에 획득처가 더 존재합니다.</FONT>\"\r\n  }\r\n}";

    return (
        <div className="w-full relative">
            <ProfileComponent file={characterForm.file}/>
            <div className="min-h-[calc(100vh-65px)] p-5 w-full max-w-[1280px] mx-auto mt-0 sm:mt-[300px]">
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