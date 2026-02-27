import { SetStateFn } from "@/utiils/utils";
import { addToast } from "@heroui/react";
import { load } from 'cheerio'
import data from "@/data/characters/data.json";
import { CharacterHistory, saveHistory, updateHistory } from "./history";
import { Badge } from "../../api/administrator/badge/route";
import { LoginUser } from "../../store/loginSlice";
import { decrypt } from "@/utiils/crypto";
import { CardData, CardSet, CharacterInfo, Equipment, ExpeditionCharacterInfo, Gem, Stat, StoneEffect } from "../model/types";
import { getCharacterInfoByFile, toNumber } from "./characterInfo";

const secretKey = process.env.NEXT_PUBLIC_SECRET_KEY ? process.env.NEXT_PUBLIC_SECRET_KEY : 'null';

export type CharacterFile = {
    profile: any,
    equipment: any,
    gem: any[] | null,
    cards: any[] | null,
    stats: any[] | null,
    engraving: any[] | null,
    arkpassive: any | null,
    skills: any[] | null,
    collects: any[] | null,
    avatars: any[] | null,
    arkGrid: any | null
}

// 캐릭터 갱신 이벤트 함수
export type UpdateUI = {
    setDisable: SetStateFn<boolean>,
    setLoadingUpdate: SetStateFn<boolean>,
    setExpeditions: SetStateFn<ExpeditionCharacterInfo[]>,
    setCharacterInfo: SetStateFn<CharacterInfo | null>,
    setTitles: SetStateFn<string[]>
}
export type UpdatePayload = {
    nickname: string | null,
    expeditions: ExpeditionCharacterInfo[],
    titles: string[]
}
export function useClickUpdate(ui: UpdateUI, payload: UpdatePayload) {
    return async () => {
        const userStr = sessionStorage.getItem('user');
        const storedUser: LoginUser = userStr ? JSON.parse(userStr) : null;
        const decryptedApiKey = storedUser?.apiKey ? decrypt(storedUser.apiKey, secretKey) : null;
        
        if (payload.nickname) {
            ui.setLoadingUpdate(true);
            const lostarkRes = await fetch(`/api/lostark?value=${payload.nickname}&code=5&key=${decryptedApiKey}`);
            if (!lostarkRes.ok) {
                addToast({
                    title: "불러오기 오류",
                    description: `입력한 캐릭터가 존재하지 않거나 로스트아크 점검 시간 등의 이유로 데이터를 불러오지 못했습니다.`,
                    color: "danger"
                });
            } else {
                const data = await lostarkRes.json();
                if (data) {
                    const expeditionRes = await fetch(`/api/lostark?value=${payload.nickname}&code=0&key=${decryptedApiKey}`);
                    if (!lostarkRes.ok) {
                        addToast({
                            title: "불러오기 오류",
                            description: `입력한 캐릭터가 존재하지 않거나 로스트아크 점검 시간 등의 이유로 데이터를 불러오지 못했습니다.`,
                            color: "danger"
                        });
                    } else {
                        const expeditionData = await expeditionRes.json();
                        let newExpeditions: ExpeditionCharacterInfo[] = [];
                        for (const item of expeditionData) {
                            const newCharacterInfo: ExpeditionCharacterInfo = {
                                nickname: item.CharacterName,
                                job: item.CharacterClassName,
                                server: item.ServerName,
                                level: Number(item.ItemAvgLevel.replaceAll(',', '')),
                                combatPower: 0,
                                type: 'attack'
                            }
                            newExpeditions.push(newCharacterInfo);
                        }
                        newExpeditions = newExpeditions.sort((a, b) => b.level - a.level);
                        const file: CharacterFile = {
                            profile: data.ArmoryProfile,
                            equipment: data.ArmoryEquipment,
                            gem: data.ArmoryGem.Gems,
                            cards: data.ArmoryCard,
                            stats: data.ArmoryProfile.Stats,
                            engraving: data.ArmoryEngraving ? data.ArmoryEngraving.ArkPassiveEffects : null,
                            arkpassive: data.ArkPassive,
                            skills: data.ArmorySkills,
                            collects: data.Collectibles,
                            avatars: data.ArmoryAvatars,
                            arkGrid: data.ArkGrid
                        }
                        const combatPower = toNumber(file.profile.CombatPower);
                        const characterType = getCharacterType(file.arkpassive);
                        const title = getParsedText(file.profile.Title);
                        const cloneTitles = structuredClone(payload.titles);
                        if (isRareTitle(title) && !payload.titles.includes(title)) {
                            cloneTitles.push(title);
                        }
                        payload.expeditions.forEach(character => {
                            const findIndex = newExpeditions.findIndex(char => char.nickname === character.nickname);
                            if (findIndex > -1) {
                                newExpeditions[findIndex] = newExpeditions[findIndex].nickname === payload.nickname ? {
                                    ...character,
                                    combatPower: combatPower,
                                    type: characterType
                                } : character;
                            }
                        });
                        
                        const info = getCharacterInfoByFile(file, combatPower);
                        const inputRes = await fetch('/api/characters', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                nickname: payload.nickname,
                                characterInfo: info,
                                expeditions: newExpeditions,
                                titles: cloneTitles
                            })
                        });
                        if (inputRes.ok) {
                            const today = new Date();
                            const history: CharacterHistory = {
                                nickname: payload.nickname,
                                job: info.profile.className,
                                level: info.profile.itemLevel,
                                server: info.profile.server,
                                date: today
                            }
                            updateHistory(history);
                            ui.setExpeditions(newExpeditions);
                            ui.setTitles(cloneTitles);
                            ui.setCharacterInfo(info);
                            addToast({
                                title: "갱신 완료",
                                description: `캐릭터 정보를 갱신하였습니다.`,
                                color: "success"
                            });
                        }
                    }
                }
            }
            const cooldownMS = 1 * 60 * 1000;
            const cooldownEnd = Date.now() + cooldownMS;
            localStorage.setItem("refreshCooldownTime", cooldownEnd.toString());
            ui.setDisable(true);
            ui.setLoadingUpdate(false);
            setTimeout(() => {
                ui.setDisable(false);
            }, cooldownMS);
        }
    }
}

// 캐릭터 검색 함수
export function handleSearch(
    searchValue: string,
    setSearched: SetStateFn<boolean>,
    setLoading: SetStateFn<boolean>,
    setNickname: SetStateFn<string>
) {
    const params = new URLSearchParams(window.location.search);
    params.set("nickname", searchValue);
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.pushState({}, "", newUrl);
    setNickname(searchValue);
    setSearched(true);
    setLoading(true);
}

// 캐릭터 데이터 로스트아크 API로부터 받아오는 함수
export type LoadProfileUI = {
    setSearched: SetStateFn<boolean>,
    setLoading: SetStateFn<boolean>,
    setNickname: SetStateFn<string>,
    setNothing: SetStateFn<boolean>,
    setExpeditions: SetStateFn<ExpeditionCharacterInfo[]>,
    setBadge: SetStateFn<boolean>,
    setCharacterInfo: SetStateFn<CharacterInfo | null>,
    setTitles: SetStateFn<string[]>
}
export async function loadProfile(
    nickname: string,
    ui: LoadProfileUI
) {
    const badgeRes = await fetch('/api/administrator/badge');
    if (badgeRes.ok) {
        const badges: Badge[] = await badgeRes.json();
        const findIndex = badges.findIndex(badge => badge.nickname === nickname);
        if (findIndex !== -1) {
            ui.setBadge(true);
        } else {
            ui.setBadge(false);
        }
    }

    const res = await fetch(`/api/characters?nickname=${nickname}`);
    let isPassed = false;
    let titles: string[] = [];
    let loadedExpeditions: ExpeditionCharacterInfo[] = [];

    if (res.ok) {
        const data = await res.json();
        titles = data.titles;
        loadedExpeditions = data.expeditions;
        if (data.date && data.character) {
            const basedDate = new Date(data.date.seconds * 1000 + data.date.nanoseconds / 1_000_000);
            const threeDaysInMs = 3 * 24 * 60 * 60 * 1000;
            const now = new Date();
            const hasPassed3Days = (now.getTime() - basedDate.getTime()) >= threeDaysInMs;

            if (!hasPassed3Days) {
                const today = new Date();
                const history: CharacterHistory = {
                    nickname: nickname,
                    job: data.character.profile.className,
                    level: data.character.profile.itemLevel,
                    server: data.character.profile.server,
                    date: today
                }
                ui.setCharacterInfo(data.character);
                ui.setTitles(data.titles);
                saveHistory(history);
                ui.setExpeditions(loadedExpeditions);
                ui.setLoading(false);
                ui.setNothing(false);
                return;
            } else {
                isPassed = true;
            }
        } else {
            isPassed = true;
        }
    }

    const userStr = sessionStorage.getItem('user');
    const storedUser: LoginUser = userStr ? JSON.parse(userStr) : null;
    const decryptedApiKey = storedUser?.apiKey ? decrypt(storedUser.apiKey, secretKey) : null;

    if (res.status === 401 || isPassed) {
        const lostarkRes = await fetch(`/api/lostark?value=${nickname}&code=5&key=${decryptedApiKey}`);
        if (!lostarkRes.ok) {
            addToast({
                title: "불러오기 오류",
                description: `입력한 캐릭터가 존재하지 않거나 로스트아크 점검 시간 등의 이유로 데이터를 불러오지 못했습니다.`,
                color: "danger"
            });
            ui.setNickname('');
            ui.setSearched(false);
            ui.setLoading(false);
            return;
        }
        const data = await lostarkRes.json();
        if (data) {
            const expeditionRes = await fetch(`/api/lostark?value=${nickname}&code=0&key=${decryptedApiKey}`);
            if (!lostarkRes.ok) {
                addToast({
                    title: "불러오기 오류",
                    description: `입력한 캐릭터가 존재하지 않거나 로스트아크 점검 시간 등의 이유로 데이터를 불러오지 못했습니다.`,
                    color: "danger"
                });
                ui.setNickname('');
                ui.setSearched(false);
                ui.setLoading(false);
                return;
            }
            const expeditionData = await expeditionRes.json();
            let newExpeditions: ExpeditionCharacterInfo[] = [];
            for (const item of expeditionData) {
                const newCharacterInfo: ExpeditionCharacterInfo = {
                    nickname: item.CharacterName,
                    job: item.CharacterClassName,
                    server: item.ServerName,
                    level: Number(item.ItemAvgLevel.replaceAll(',', '')),
                    combatPower: 0,
                    type: 'attack'
                }
                newExpeditions.push(newCharacterInfo);
            }
            newExpeditions = newExpeditions.sort((a, b) => b.level - a.level);
            const file: CharacterFile = {
                profile: data.ArmoryProfile,
                equipment: data.ArmoryEquipment,
                gem: data.ArmoryGem.Gems,
                cards: data.ArmoryCard,
                stats: data.ArmoryProfile.Stats,
                engraving: data.ArmoryEngraving ? data.ArmoryEngraving.ArkPassiveEffects : null,
                arkpassive: data.ArkPassive,
                skills: data.ArmorySkills,
                collects: data.Collectibles,
                avatars: data.ArmoryAvatars,
                arkGrid: data.ArkGrid
            }
            ui.setNothing(false);
            ui.setLoading(false);
            const combatPower = toNumber(file.profile.CombatPower);
            const characterType = getCharacterType(file.arkpassive);
            const title = getParsedText(file.profile.Title);
            if (isRareTitle(title) && !titles.includes(title)) {
                titles.push(title);
            }
            loadedExpeditions.forEach(character => {
                const findIndex = newExpeditions.findIndex(char => char.nickname === character.nickname);
                if (findIndex > -1) {
                    newExpeditions[findIndex] = newExpeditions[findIndex].nickname === nickname ? {
                        ...character,
                        combatPower: combatPower,
                        type: characterType
                    } : character;
                }
            });
            ui.setTitles(titles);
            ui.setExpeditions(newExpeditions);
            const info = getCharacterInfoByFile(file, combatPower);
            ui.setCharacterInfo(info);
            const inputRes = await fetch('/api/characters', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nickname: nickname,
                    characterInfo: info,
                    expeditions: newExpeditions,
                    titles: titles
                })
            });
            if (inputRes.ok) {
                const today = new Date();
                const history: CharacterHistory = {
                    nickname: nickname,
                    job: info.profile.className,
                    level: info.profile.itemLevel,
                    server: info.profile.server,
                    date: today
                }
                saveHistory(history);
                return;
            }
        }
    }
    ui.setLoading(false);
    ui.setNothing(true);
    addToast({
        title: "불러오기 오류",
        description: `입력한 캐릭터가 존재하지 않거나 로스트아크 점검 시간 등의 이유로 데이터를 불러오지 못했습니다.`,
        color: "danger"
    });
}

// 해당 칭호가 희귀칭호인지 아닌지 파악하는 함수
function isRareTitle(title: string): boolean {
    return data.titles.includes(title);
}

// 장비 종류에 따른 값 반환 함수
export function getObjectByArmorType(list: Equipment[], type: string): any {
    const obj = list.find((item) => item.type === type);
    return obj;
}

// JSON 파싱 후 문자열 반환
export function getParsedText(parsedText: string | undefined) {
    if (parsedText) {
        const $ = load(parsedText);
        return $.text();
    }
    return '';
}

// 품질 별 색 반환
export function getColorByQuality(quality: number) {
    if (quality === 100) return 'bg-[#ff8000]'
    if (quality >= 90) return 'bg-[#a335ee]';
    if (quality >= 70) return 'bg-[#0070dd]';
    if (quality >= 40) return 'bg-[#1e8800]';
    if (quality >= 10) return 'bg-[#e23737]';
    return 'bg-[#6f6f6f]';
}

// 장비 종류에 따른 값 반환 함수
export function getListByArmorType(list: any[], type: string): any[] {
    const obj = list.filter((item) => item.Type === type);
    return obj;
}


// 악세 등급 표시
export type ItemGrade = {
    name: string,
    grade: string
}
export function getSmallGradeByAccessory(type: String, item: string) {
    const datas = data.accessory;
    let findItem = null;
    switch(type) {
        case "목걸이":
            findItem = datas.neck.find(dataItem => item.includes(dataItem.name));
            if (findItem) {
                let grade = 'none';
                if (item.includes(findItem.lg)) { grade = 'lg' }
                else if (item.includes(findItem.md)) { grade = 'md' }
                else if (item.includes(findItem.sm)) { grade = 'sm' }
                return {
                    name: findItem.small,
                    grade: grade
                }
            }
        case "귀걸이":
            findItem = datas.ear.find(dataItem => item.includes(dataItem.name) && ((item.includes('%') && dataItem.lg.includes('%')) || (!item.includes("%") && !dataItem.lg.includes('%'))));
            if (findItem) {
                let grade = 'none';
                if (item.includes(findItem.lg)) { grade = 'lg' }
                else if (item.includes(findItem.md)) { grade = 'md' }
                else if (item.includes(findItem.sm)) { grade = 'sm' }
                return {
                    name: findItem.small,
                    grade: grade
                }
            }
        case "반지":
            findItem = datas.pinger.find(dataItem => item.includes(dataItem.name));
            if (findItem) {
                let grade = 'none';
                if (item.includes(findItem.lg)) { grade = 'lg' }
                else if (item.includes(findItem.md)) { grade = 'md' }
                else if (item.includes(findItem.sm)) { grade = 'sm' }
                return {
                    name: findItem.small,
                    grade: grade
                }
            }
    }
    return {
        name: "null",
        grade: "none"
    }
}
function cleanText(text: string): string {
    text = text.replaceAll(/\r\n|\r|\n/g, '').replace(/\s+/g, '').replace(/(\d+\.\d)0%/, '$1%').replaceAll('몬스터', '적');
    text = text.replace(/(\d+\.\d{1,2})%/g, (_, num) => {
        const cleaned = parseFloat(num).toString(); // 숫자로 변환 후 문자열로
        return `${cleaned}%`;
    });
    return text;
}

// 팔찌 등급 표시
export function getSmallGradeByArm(item: string) {
    const datas = data.arms;
    const findItem = datas.find(dataItem => cleanText(item) === cleanText(dataItem.name))
    if (findItem) {
        let grade = 'none';
        switch(findItem.grade) {
            case '하':
                grade = 'sm';
                break;
            case '중':
                grade = 'md';
                break;
            case '상':
                grade = 'lg';
                break;
        }
        return {
            name: findItem.small,
            grade: grade
        }
    }
    return {
        name: "null",
        grade: "none"
    }
}

// 등급 별 문자 반환
export function getTextByGrade(grade: string): string {
    switch(grade) {
        case 'lg': return '상';
        case 'md': return '중';
        case 'sm': return '하';
    }
    return '-';
}

// 등급 별 이미지 SRC 반환
export function getSrcByGrade(grade: string): string {
    switch(grade) {
        case 'lg': return '/lg.png';
        case 'md': return '/md.png';
        case 'sm': return '/sm.png';
    }
    return '/noeffect.png';
}

// 등급 별 배경 색상 반환
export function getBgColorByGrade(grade: string): string {
    switch(grade) {
        case 'lg': return 'bg-[#f7890c]';
        case 'md': return 'bg-[#ae30e9]';
        case 'sm': return 'bg-[#1f88dd]';
    }
    return 'bg-[#808080]';
}

// 등급 별 글자 색상 반환
export function getTextColorByGrade(grade: string): string {
    switch(grade) {
        case 'lg': return 'text-[#f7890c]';
        case 'md': return 'text-[#ae30e9]';
        case 'sm': return 'text-[#1f88dd]';
    }
    return 'fadedtext';
}

//스톤 각인 가져오기
export function getStoneEffectInTooltip(parsed: any): StoneEffect[] {
    for (const key in parsed) {
        const element = parsed[key];
        const value = element?.value;

        const topStr = value?.Element_000?.topStr;
        if (typeof topStr === 'string' && topStr.includes("무작위 각인 효과")) {
            const effects: StoneEffect[] = [];
            const stone1Element = value?.Element_000?.contentStr?.Element_000?.contentStr;
            const stone1 = getParsedText(stone1Element);
            effects.push({
                name: stone1.split('Lv.')[0].replaceAll('[', '').replaceAll(']', ''),
                level: Number(stone1.split('Lv.')[1])
            });
            const stone2Element = value?.Element_000?.contentStr?.Element_001?.contentStr;
            const stone2 = getParsedText(stone2Element);
            effects.push({
                name: stone2.split('Lv.')[0].replaceAll('[', '').replaceAll(']', ''),
                level: Number(stone2.split('Lv.')[1])
            });
            const stone3Element = value?.Element_000?.contentStr?.Element_002?.contentStr;
            const stone3 = getParsedText(stone3Element);
            effects.push({
                name: stone3.split('Lv.')[0].replaceAll('[', '').replaceAll(']', ''),
                level: Number(stone3.split('Lv.')[1])
            });
            return effects;
        }
    }
    return [];
}

// index 기반으로 정해진 slot의 보석 가져오기
export function getGemByIndex(gems: Gem[], index: number): Gem | null {
    const gem = gems.find(gem => gem.slot === index);
    if (gem) {
        return gem;
    } else {
        return null;
    }
}

// 보석 이름 간략히 조절
export function getGemSimpleTailName(gem: Gem | null): string {
    if (gem) {
        const name = gem.name;
        const tail = name.split('레벨 ')[1].replaceAll('의 보석', '').replaceAll(' (귀속)', '');
        return tail;
    }
    return '';
}

// 겁화/멸화 개수 가져오기
export function getCountAtkGems(gems: Gem[]): number {
    let count = 0;
    for (const gem of gems) {
        if (gem.skillStr.includes('피해') || gem.skillStr.includes('지원')) {
            count++;
        }
    }
    return count;
}

// 겁화/멸화 개수 가져오기
export function getCountDekGems(gems: Gem[]): number {
    let count = 0;
    for (const gem of gems) {
        if (gem.skillStr.includes('재사용 대기시간')) {
            count++;
        }
    }
    return count;
}

// 카드 이미지 안 각성 보석 이미지 반환 함수
export function getUrlGemInImage(count: number): string {
    const urls: string[] = [
        '/character/card/card0.png',
        '/character/card/card1.png',
        '/character/card/card2.png',
        '/character/card/card3.png',
        '/character/card/card4.png',
        '/character/card/card5.png'
    ]
    return urls[count];
}

// index 기반으로 정해진 slot의 보석 가져오기
export function getCardByIndex(cards: CardData[], index: number): CardData | null {
    const card = cards.find(card => card.slot === index);
    if (card) {
        return card;
    } else {
        return null;
    }
}

// 적용된 카드 세트 효과 목록 출력
export function getCardSetNames(cardSet: CardSet[], cards: CardData[]): string {
    let resultStr = "";
    for (const sets of cardSet) {
        let str = '';
        let cardSumGems = 0;
        for (const index of sets.slots) {
            const card = cards.find(item => item.slot === index);
            if (card) {
                cardSumGems += card.count;
            }
        }
        for (const item of sets.items) {
            if (item.isEnable && cardSumGems >= item.enableCount) {
                str = item.name;
            }
        }
        if (resultStr !== '') resultStr += ', ';
        resultStr += str;
    }
    return resultStr;
}

// 적용된 카드 세트의 각성 개수 반환 함수
export function getCardGems(sets: CardSet, cards: CardData[]): number {
    let cardSumGems = 0;
    for (const index of sets.slots) {
        const card = cards.find(item => item.slot === index);
        if (card) {
            cardSumGems += card.count;
        }
    }
    return cardSumGems;
}

// 총 스택 반환 함수 - 공격력, 최생 제외
export function getSumStat(stat: Stat[]): number {
    let sum = 0;
    const filterdStats = stat.filter(item => item.type !== '공격력' && item.type !== '최대 생명력');
    for (const item of filterdStats) {
        sum += item.value;
    }
    return sum;
}

// 원하는 종류의 스택 반환 함수
export function getStatByType(stat: Stat[], type: string): Stat | undefined {
    return stat.find(item => item.type === type);
}

// 특성에 따른 동그라미 색상
export function getBackgroundColorByStat(type: string): string {
    switch(type) {
        case '신속':
            return 'bg-blue-500';
        case '치명':
            return 'bg-red-500';
        case '특화':
            return 'bg-purple-500';
        case '제압':
            return 'bg-neutral-500';
        case '숙련':
            return 'bg-yellow-500';
        case '인내':
            return 'bg-green-500';
    }
    return 'bg-black';
}

// 특성 위치에 따른 가로길이 반환
export function getWidthByStat(stat: Stat[], index: number): number {
    let sum = getSumStat(stat);
    for (let i = 0; i < index; i++) {
        sum -= stat[i].value;
    }
    return sum;
}

// 아크패시브 별 프로그레스 색상 가져오기
export function getColorProgressArkpassive(type: string): "warning" | "primary" | "success" | "default" {
    switch(type) {
        case '진화': return "warning";
        case '깨달음': return "primary";
        case '도약': return "success";
    }
    return 'default';
}

// 아크패시브 타입 별 글자 색 반환 함수
export function getColorByType(type: string): string {
    switch(type) {
        case '진화':
            return 'text-[#7e733e] dark:text-[#d8c34a]';
        case '깨달음':
            return 'text-[#228a8a] dark:text-[#41d1eb]';
        case '도약':
            return 'text-[#20722b] dark:text-[#41eb58]';
    }   
    return '';
}

// 아크패시브 전투력 관련 딜러인지 폿인지 여부 가져오기
export function getCharacterType(arkpassive: any | null): string {
    if (arkpassive) {
        const dataEffects = arkpassive.Effects;
        for (const effect of dataEffects) {
            const description = getParsedText(effect.Description);
            const name = description.split('티어 ')[1].split(' Lv.')[0];
            if (effect.Name === '깨달음') {
                if (data.arkType.includes(name)) {
                    return "supportor";
                }
            }
        }
    }
    return 'attack';
}

// 각인 이미지 링크 가져오기
export function getEngravingSrcByName(name: string): string {
    const obj = data.engravings.find(item => item.name === name);
    if (obj) {
        return obj.url;
    }
    return '/character/classimgs/nothing.png';
}

// 각인서 레벨에 따른 보석 반복 메시지 반환
export function printEngravingLevel(level: number): string {
    switch(level) {
        case 1: return '◆◇◇◇';
        case 2: return '◆◆◇◇';
        case 3: return '◆◆◆◇';
        case 4: return '◆◆◆◆';
    }
    return '◇◇◇◇';
}

// 명예 진행값 반환
export function getProgressValueByHonor(honorPoint: number): number {
    if (honorPoint >= 100 && honorPoint < 300) return honorPoint - 100;
    else if (honorPoint >= 300 && honorPoint < 500) return honorPoint - 300;
    else if (honorPoint >= 500 && honorPoint < 1000) return honorPoint - 500;
    return honorPoint;
}

// 명예 최댓값 반환
export function getProgressMaxByHonor(honorPoint: number): number {
    if (honorPoint < 100) return 100;
    else if (honorPoint >= 100 && honorPoint < 300) return 200;
    else if (honorPoint >= 300 && honorPoint < 500) return 200;
    return 500;
}

// 명예 색상 반환
export function getProgressColorByHonor(honorPoint: number): "default" | "success" | "primary" | "secondary" | "warning" {
    if (honorPoint < 100) return "default";
    else if (honorPoint >= 100 && honorPoint < 300) return "success";
    else if (honorPoint >= 300 && honorPoint < 500) return "primary";
    else if (honorPoint >= 500 && honorPoint < 1000) return "secondary"
    return "warning";
}

// 다음 명예까지 남은 포인트 반환 함수
export function getRemainHonor(honorPoint: number): number {
    if (honorPoint < 100) return 100 - honorPoint;
    else if (honorPoint >= 100 && honorPoint < 300) return 300 - honorPoint;
    else if (honorPoint >= 300 && honorPoint < 500) return 500 - honorPoint;
    else if (honorPoint >= 500 && honorPoint < 1000) return 1000 - honorPoint;
    return 0;
}