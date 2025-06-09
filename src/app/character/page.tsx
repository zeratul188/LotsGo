'use client'
import { useEffect } from "react";
import { EmptyComponent, LoadingComponent } from "../UtilsCompnents";
import { AbilityComponent, ExpeditionComponent, ProfileComponent, SearchComponent, useCharacterForm } from "./CharacterForm"
import { useSearchParams } from "next/navigation";
import { Button, Divider, Tab, Tabs } from "@heroui/react";
import { loadProfile, useClickUpdate } from "./characterFeat";
import { useMobileQuery } from "@/utiils/utils";
import { SkillComponent } from "./SkillForm";
import { PointComponent } from "./PointForm";
import { AvatarComponent } from "./AvatarForm";

export default function Character() {
    const characterForm = useCharacterForm();
    const searchParams = useSearchParams();
    const nickname = searchParams.get('nickname');
    const isMobile = useMobileQuery();
    const onClickUpdate = useClickUpdate(nickname, characterForm.setDisable, characterForm.setLoadingUpdate, characterForm.file, characterForm.setFile);
    
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
    
    const l = "{\r\n  \"Element_000\": {\r\n    \"type\": \"NameTagBox\",\r\n    \"value\": \"<P ALIGN='CENTER'><FONT COLOR='#ce43fc'>영롱한 보석 부적</FONT></P>\"\r\n  },\r\n  \"Element_001\": {\r\n    \"type\": \"ItemTitle\",\r\n    \"value\": {\r\n      \"bEquip\": 0,\r\n      \"leftStr0\": \"<FONT SIZE='12'><FONT COLOR='#ce43fc'>영웅 부적</FONT></FONT>\",\r\n      \"leftStr2\": \"\",\r\n      \"qualityValue\": -1,\r\n      \"rightStr0\": \"<FONT SIZE='12'><FONT COLOR='#FFD200'>장착중</FONT></FONT>\",\r\n      \"slotData\": {\r\n        \"advBookIcon\": 0,\r\n        \"battleItemTypeIcon\": 0,\r\n        \"blackListIcon\": 0,\r\n        \"cardIcon\": false,\r\n        \"friendship\": 0,\r\n        \"iconGrade\": 3,\r\n        \"iconPath\": \"https://cdn-lostark.game.onstove.com/efui_iconatlas/acc/acc_306.png\",\r\n        \"imagePath\": \"\",\r\n        \"islandIcon\": 0,\r\n        \"petBorder\": 0,\r\n        \"rtString\": \"\",\r\n        \"seal\": false,\r\n        \"temporary\": 0,\r\n        \"town\": 0,\r\n        \"trash\": 0\r\n      }\r\n    }\r\n  },\r\n  \"Element_002\": {\r\n    \"type\": \"SingleTextBox\",\r\n    \"value\": \"<FONT SIZE='12'>원정대 귀속됨 </FONT>\"\r\n  },\r\n  \"Element_003\": {\r\n    \"type\": \"MultiTextBox\",\r\n    \"value\": \"|<font color='#C24B46'>거래 불가</font>\"\r\n  },\r\n  \"Element_004\": {\r\n    \"type\": \"ItemPartBox\",\r\n    \"value\": {\r\n      \"Element_000\": \"<FONT COLOR='#A9D0F5'>추가 효과</FONT>\",\r\n      \"Element_001\": \"채집 속도 +2.00%<BR>내구도 미차감 확률 +3.20%<BR>모든 생활 전체 등급 재료 획득률 +15.00%\"\r\n    }\r\n  },\r\n  \"Element_005\": {\r\n    \"type\": \"IndentStringGroup\",\r\n    \"value\": null\r\n  },\r\n  \"Element_006\": {\r\n    \"type\": \"SingleTextBox\",\r\n    \"value\": \"<FONT COLOR='#E2C87A'><FONT SIZE='12'>영롱한 보석을 가공해 만든 부적.<br>가지고 있는 것만으로도 강한 힘을 얻게 된다.</FONT></FONT>\"\r\n  },\r\n  \"Element_007\": {\r\n    \"type\": \"SingleTextBox\",\r\n    \"value\": \"<FONT SIZE='12'><FONT COLOR='#C24B46'>판매불가</FONT>, <FONT COLOR='#C24B46'>파괴불가</FONT>, <FONT COLOR='#C24B46'>분해불가</FONT>, <FONT COLOR='#C24B46'>품질 업그레이드 불가</FONT></FONT>\"\r\n  },\r\n  \"Element_008\": {\r\n    \"type\": \"SingleTextBox\",\r\n    \"value\": \"<Font color='#5FD3F1'>[제작] 대도시 - 연금술사</font>\"\r\n  }\r\n}";

    return (
        <div className="w-full">
            <ProfileComponent file={characterForm.file}/>
            <div className="min-h-[calc(100vh-65px)] p-5 w-full max-w-[1280px] mx-auto md960:relative">
                <Button
                    radius="sm"
                    color="primary"
                    isLoading={characterForm.isLoadingUpdate}
                    isDisabled={characterForm.isDisable}
                    className="w-full md960:w-[max-content] md960:absolute md960:top-4 md960:right-4 mb-4 md960:mb-0"
                    onPress={onClickUpdate}>
                    갱신하기
                </Button>
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
            <p className="whitespace-pre-line hidden">{l}</p>
        </div>
    )
}