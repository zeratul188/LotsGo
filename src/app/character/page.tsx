'use client'
import { useEffect } from "react";
import { LoadingComponent } from "../UtilsCompnents";
import { AbilityComponent, ExpeditionComponent, ProfileComponent, SearchComponent, useCharacterForm } from "./CharacterForm"
import { useSearchParams } from "next/navigation";
import { Divider, Tab, Tabs } from "@heroui/react";
import { loadProfile } from "./characterFeat";

export default function Character() {
    const characterForm = useCharacterForm();
    const searchParams = useSearchParams();
    const nickname = searchParams.get('nickname');
    
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
    
    const l = "{\r\n  \"Element_000\": {\r\n    \"type\": \"NameTagBox\",\r\n    \"value\": \"<P ALIGN='CENTER'><FONT COLOR='#E3C7A1'>위대한 비상의 돌</FONT></P>\"\r\n  },\r\n  \"Element_001\": {\r\n    \"type\": \"ItemTitle\",\r\n    \"value\": {\r\n      \"bEquip\": 0,\r\n      \"leftStr0\": \"<FONT SIZE='12'><FONT COLOR='#E3C7A1'>고대 어빌리티 스톤</FONT></FONT>\",\r\n      \"leftStr2\": \"<FONT SIZE='14'>아이템 티어 4</FONT>\",\r\n      \"qualityValue\": -1,\r\n      \"rightStr0\": \"<FONT SIZE='12'><FONT COLOR='#FFD200'>장착중</FONT></FONT>\",\r\n      \"slotData\": {\r\n        \"advBookIcon\": 0,\r\n        \"battleItemTypeIcon\": 0,\r\n        \"blackListIcon\": 0,\r\n        \"cardIcon\": false,\r\n        \"friendship\": 0,\r\n        \"iconGrade\": 6,\r\n        \"iconPath\": \"https://cdn-lostark.game.onstove.com/efui_iconatlas/ability/ability_246.png\",\r\n        \"imagePath\": \"\",\r\n        \"islandIcon\": 0,\r\n        \"petBorder\": 0,\r\n        \"rtString\": \"\",\r\n        \"seal\": false,\r\n        \"temporary\": 0,\r\n        \"town\": 0,\r\n        \"trash\": 0\r\n      }\r\n    }\r\n  },\r\n  \"Element_002\": {\r\n    \"type\": \"SingleTextBox\",\r\n    \"value\": \"<FONT SIZE='12'>캐릭터 귀속됨<BR><FONT COLOR='#C24B46'>거래 제한 아이템 레벨</FONT> 1640</FONT>\"\r\n  },\r\n  \"Element_003\": {\r\n    \"type\": \"MultiTextBox\",\r\n    \"value\": \"|<font color='#C24B46'>거래 불가</font>\"\r\n  },\r\n  \"Element_004\": {\r\n    \"type\": \"ItemPartBox\",\r\n    \"value\": {\r\n      \"Element_000\": \"<FONT COLOR='#A9D0F5'>기본 효과</FONT>\",\r\n      \"Element_001\": \"체력 +23481\"\r\n    }\r\n  },\r\n  \"Element_005\": {\r\n    \"type\": \"ItemPartBox\",\r\n    \"value\": {\r\n      \"Element_000\": \"<FONT COLOR='#A9D0F5'>세공 단계 보너스</FONT>\",\r\n      \"Element_001\": \"체력 +1175\"\r\n    }\r\n  },\r\n  \"Element_006\": {\r\n    \"type\": \"IndentStringGroup\",\r\n    \"value\": {\r\n      \"Element_000\": {\r\n        \"contentStr\": {\r\n          \"Element_000\": {\r\n            \"bPoint\": 0,\r\n            \"contentStr\": \"<FONT COLOR='#FFFFFF'>[<FONT COLOR='#FFFFAC'>저주받은 인형</FONT>] <img src='emoticon_tooltip_ability_stone_symbol' width='11' height='14' vspace ='-2'></img>Lv.2</FONT><BR>\",\r\n            \"pointType\": 2\r\n          },\r\n          \"Element_001\": {\r\n            \"bPoint\": 0,\r\n            \"contentStr\": \"<FONT COLOR='#FFFFFF'>[<FONT COLOR='#FFFFAC'>아드레날린</FONT>] <img src='emoticon_tooltip_ability_stone_symbol' width='11' height='14' vspace ='-2'></img>Lv.2</FONT><BR>\",\r\n            \"pointType\": 2\r\n          },\r\n          \"Element_002\": {\r\n            \"bPoint\": 0,\r\n            \"contentStr\": \"<FONT COLOR='#FFFFFF'>[<FONT COLOR='#FE2E2E'>공격속도 감소</FONT>] <img src='emoticon_tooltip_ability_stone_symbol' width='11' height='14' vspace ='-2'></img>Lv.0</FONT><BR>\",\r\n            \"pointType\": 2\r\n          }\r\n        },\r\n        \"topStr\": \"<FONT SIZE='12' COLOR='#A9D0F5'>무작위 각인 효과</FONT>\"\r\n      }\r\n    }\r\n  },\r\n  \"Element_007\": {\r\n    \"type\": \"IndentStringGroup\",\r\n    \"value\": null\r\n  },\r\n  \"Element_008\": {\r\n    \"type\": \"SingleTextBox\",\r\n    \"value\": \"<FONT COLOR='#E2C87A'><FONT SIZE='12'>푸른 기운과 붉은 기운이 희미하게 뒤섞여 신묘한 느낌이 난다. 자세히 보고 싶지만 더 만졌다가는 부서져 버릴 것 같다.<br><br><FONT COLOR='#FFFFAC'>어빌리티 스톤 세공사에게 세공 완료 후 장착 가능합니다.</FONT></FONT></FONT>\"\r\n  },\r\n  \"Element_009\": {\r\n    \"type\": \"SingleTextBox\",\r\n    \"value\": \"<FONT SIZE='12'><FONT COLOR='#C24B46'>판매불가</FONT></FONT>\"\r\n  },\r\n  \"Element_010\": {\r\n    \"type\": \"SingleTextBox\",\r\n    \"value\": \"<Font color='#5FD3F1'>[쿠르잔 전선]</font><BR><Font color='#5FD3F1'>[가디언 토벌] 4티어</font><BR><Font color='#5FD3F1'>[필드 보스] 쿠르잔 북부 - 세베크 아툰</font><BR><Font color='#5FD3F1'>그 외에 획득처가 더 존재합니다.</FONT>\"\r\n  }\r\n}";

    return (
        <div className="w-full relative">
            <ProfileComponent file={characterForm.file}/>
            <div className="min-h-[calc(100vh-65px)] p-5 w-full max-w-[1280px] mx-auto mt-0 sm:mt-[300px]">
                <Tabs aria-label="character-tabs" items={tabs} size="lg" variant="underlined">
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