import { SetStateFn } from "@/utiils/utils";
import { addToast } from "@heroui/react";
import { load } from 'cheerio'
import data from "@/data/characters/data.json";
import { CharacterHistory, saveHistory, updateHistory } from "./history";
import { Badge } from "../api/administrator/badge/route";

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
    avatars: any[] | null
}

export type CharacterInfo = {
    nickname: string,
    job: string,
    server: string,
    level: number
}

// 캐릭터 갱신 이벤트 함수
export function useClickUpdate(
    nickname: string | null,
    setDisable: SetStateFn<boolean>,
    setLoadingUpdate: SetStateFn<boolean>,
    file: CharacterFile,
    setFile: SetStateFn<CharacterFile>,
    setExpeditions: SetStateFn<CharacterInfo[]>,
    setGems: SetStateFn<Gem[]>,
    setCombat: SetStateFn<number>,
    combat: number
) {
    return async () => {
        if (nickname) {
            setLoadingUpdate(true);
            setGems([]);
            const lostarkRes = await fetch(`/api/lostark?value=${nickname}&code=5`);
            if (!lostarkRes.ok) {
                addToast({
                    title: "불러오기 오류",
                    description: `입력한 캐릭터가 존재하지 않거나 로스트아크 점검 시간 등의 이유로 데이터를 불러오지 못했습니다.`,
                    color: "danger"
                });
            } else {
                const data = await lostarkRes.json();
                const newFile = structuredClone(file);
                if (data) {
                    const expeditionRes = await fetch(`/api/lostark?value=${nickname}&code=0`);
                    if (!lostarkRes.ok) {
                        addToast({
                            title: "불러오기 오류",
                            description: `입력한 캐릭터가 존재하지 않거나 로스트아크 점검 시간 등의 이유로 데이터를 불러오지 못했습니다.`,
                            color: "danger"
                        });
                    } else {
                        const expeditionData = await expeditionRes.json();
                        let newExpeditions: CharacterInfo[] = [];
                        for (const item of expeditionData) {
                            const newCharacterInfo: CharacterInfo = {
                                nickname: item.CharacterName,
                                job: item.CharacterClassName,
                                server: item.ServerName,
                                level: Number(item.ItemAvgLevel.replaceAll(',', ''))
                            }
                            newExpeditions.push(newCharacterInfo);
                        }
                        newExpeditions = newExpeditions.sort((a, b) => b.level - a.level);
                        newFile.profile = data.ArmoryProfile;
                        newFile.equipment = data.ArmoryEquipment;
                        newFile.gem = data.ArmoryGem.Gems;
                        newFile.cards = data.ArmoryCard;
                        newFile.stats = data.ArmoryProfile.Stats;
                        newFile.engraving = data.ArmoryEngraving ? data.ArmoryEngraving.ArkPassiveEffects : null;
                        newFile.arkpassive = data.ArkPassive;
                        newFile.skills = data.ArmorySkills;
                        newFile.collects = data.Collectibles;
                        newFile.avatars = data.ArmoryAvatars;
                        const inputRes = await fetch('/api/characters', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                nickname: nickname,
                                file: newFile,
                                expeditions: newExpeditions,
                                combatPower: newFile.profile.CombatPower.replaceAll(',', '')
                            })
                        });
                        if (inputRes.ok) {
                            const today = new Date();
                            const history: CharacterHistory = {
                                nickname: nickname,
                                job: newFile.profile.CharacterClassName,
                                level: Number(newFile.profile.ItemAvgLevel.replaceAll(',', '')),
                                server: newFile.profile.ServerName,
                                date: today
                            }
                            const nowCombat: number = Number(newFile.profile.CombatPower?.replaceAll(',', '') || 0);
                            if (nowCombat > combat) {
                                setCombat(nowCombat);
                            }
                            updateHistory(history);
                            setFile(newFile);
                            setExpeditions(newExpeditions);
                            addToast({
                                title: "갱신 완료",
                                description: `캐릭터 정보를 갱신하였습니다.`,
                                color: "success"
                            });
                        }
                    }
                }
            }
            const cooldownMS = 2 * 60 * 1000;
            const cooldownEnd = Date.now() + cooldownMS;
            localStorage.setItem("refreshCooldownTime", cooldownEnd.toString());
            setDisable(true);
            setLoadingUpdate(false);
            setTimeout(() => {
                setDisable(false);
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
export async function loadProfile(
    nickname: string,
    setSearched: SetStateFn<boolean>,
    setLoading: SetStateFn<boolean>,
    setNickname: SetStateFn<string>,
    file: CharacterFile,
    setFile: SetStateFn<CharacterFile>,
    setNothing: SetStateFn<boolean>,
    setExpeditions: SetStateFn<CharacterInfo[]>,
    setBadge: SetStateFn<boolean>,
    setCombat: SetStateFn<number>,
    combat: number
) {
    const badgeRes = await fetch('/api/administrator/badge');
    if (badgeRes.ok) {
        const badges: Badge[] = await badgeRes.json();
        const findIndex = badges.findIndex(badge => badge.nickname === nickname);
        if (findIndex !== -1) {
            setBadge(true);
        } else {
            setBadge(false);
        }
    }

    const res = await fetch(`/api/characters?nickname=${nickname}`);
    let isPassed = false, savedCombat = 0;

    if (res.ok) {
        const data = await res.json();
        const basedDate = new Date(data.date.seconds * 1000 + data.date.nanoseconds / 1_000_000);
        const threeDaysInMs = 3 * 24 * 60 * 60 * 1000;
        const now = new Date();
        const hasPassed3Days = (now.getTime() - basedDate.getTime()) >= threeDaysInMs;

        if (!hasPassed3Days) {
            const today = new Date();
            const history: CharacterHistory = {
                nickname: nickname,
                job: data.file.profile.CharacterClassName,
                level: Number(data.file.profile.ItemAvgLevel.replaceAll(',', '')),
                server: data.file.profile.ServerName,
                date: today
            }
            saveHistory(history);
            setExpeditions(data.expeditions);
            setFile(data.file);
            setLoading(false);
            setNothing(false);
            setCombat(Number(data.combatPower));
            return;
        } else {
            savedCombat = Number(data.combatPower);
            isPassed = true;
        }
    }
    if (res.status === 401 || isPassed) {
        const lostarkRes = await fetch(`/api/lostark?value=${nickname}&code=5`);
        if (!lostarkRes.ok) {
            addToast({
                title: "불러오기 오류",
                description: `입력한 캐릭터가 존재하지 않거나 로스트아크 점검 시간 등의 이유로 데이터를 불러오지 못했습니다.`,
                color: "danger"
            });
            setNickname('');
            setSearched(false);
            setLoading(false);
            return;
        }
        const data = await lostarkRes.json();
        const newFile = structuredClone(file);
        if (data) {
            const expeditionRes = await fetch(`/api/lostark?value=${nickname}&code=0`);
            if (!lostarkRes.ok) {
                addToast({
                    title: "불러오기 오류",
                    description: `입력한 캐릭터가 존재하지 않거나 로스트아크 점검 시간 등의 이유로 데이터를 불러오지 못했습니다.`,
                    color: "danger"
                });
                setNickname('');
                setSearched(false);
                setLoading(false);
                return;
            }
            const expeditionData = await expeditionRes.json();
            let newExpeditions: CharacterInfo[] = [];
            for (const item of expeditionData) {
                const newCharacterInfo: CharacterInfo = {
                    nickname: item.CharacterName,
                    job: item.CharacterClassName,
                    server: item.ServerName,
                    level: Number(item.ItemAvgLevel.replaceAll(',', ''))
                }
                newExpeditions.push(newCharacterInfo);
            }
            newExpeditions = newExpeditions.sort((a, b) => b.level - a.level);
            newFile.profile = data.ArmoryProfile;
            newFile.equipment = data.ArmoryEquipment;
            newFile.gem = data.ArmoryGem.Gems;
            newFile.cards = data.ArmoryCard;
            newFile.stats = data.ArmoryProfile.Stats;
            newFile.engraving = data.ArmoryEngraving ? data.ArmoryEngraving.ArkPassiveEffects : null;
            newFile.arkpassive = data.ArkPassive;
            newFile.skills = data.ArmorySkills;
            newFile.collects = data.Collectibles;
            newFile.avatars = data.ArmoryAvatars;
            const inputRes = await fetch('/api/characters', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nickname: nickname,
                    file: newFile,
                    expeditions: newExpeditions,
                    combatPower: newFile.profile.CombatPower.replaceAll(',', '')
                })
            });
            if (inputRes.ok) {
                const today = new Date();
                const history: CharacterHistory = {
                    nickname: nickname,
                    job: newFile.profile.CharacterClassName,
                    level: Number(newFile.profile.ItemAvgLevel.replaceAll(',', '')),
                    server: newFile.profile.ServerName,
                    date: today
                }
                const nowCombat: number = Number(newFile.profile.CombatPower?.replaceAll(',', '') || 0);
                if (savedCombat > nowCombat) {
                    setCombat(savedCombat);
                } else {
                    setCombat(nowCombat);
                }
                saveHistory(history);
                setLoading(false);
                setFile(newFile);
                setNothing(false);
                setExpeditions(newExpeditions);
                return;
            }
        }
    }
    setLoading(false);
    setNothing(true);
    addToast({
        title: "불러오기 오류",
        description: `입력한 캐릭터가 존재하지 않거나 로스트아크 점검 시간 등의 이유로 데이터를 불러오지 못했습니다.`,
        color: "danger"
    });
}

// 장비 종류에 따른 값 반환 함수
export function getObjectByArmorType(list: any[], type: string): any {
    const obj = list.find((item) => item.Type === type);
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

type TooltipBoject = Record<string, any>;

// "상급 재련"이 들어간 객체 가져오기
function findHighUpgradeInTooltip(tooltip: any): number {
    let parsed: TooltipBoject;
    try {
        parsed = JSON.parse(tooltip);
    } catch (err) {
        console.error("Tooltip JSON 파싱 오류:", err);
        return -1;
    }

    for (const key in parsed) {
        const element = parsed[key];
        const value = element?.value;

        if (typeof value === 'string' && value.includes('상급')) {
            let text = getParsedText(value.split('<img')[0].replaceAll('[상급 재련] ', '').replaceAll('단계', ''));
            text = text.replaceAll('[상급 재련] ', '');
            return isNumeric(text) ? Number(text) : -1;
        }
    }

    return -1;
}

// 숫자인지 아닌지 여부 파악 함수
function isNumeric(value: any): boolean {
  return !isNaN(parseFloat(value)) && isFinite(value);
}

// "초월"이 들어간 객체 가져오기
function findPowerInTooltip(tooltip: any): number {
    let parsed: TooltipBoject;
    try {
        parsed = JSON.parse(tooltip);
    } catch (err) {
        console.error("Tooltip JSON 파싱 오류:", err);
        return -1;
    }

    for (const key in parsed) {
        const element = parsed[key];
        const value = element?.value;

        const topStr = value?.Element_000?.topStr;
        if (typeof topStr === "string" && topStr.includes("초월")) {
            let text = getParsedText(topStr);
            text = text.replaceAll('슬롯 효과[초월] ', '').split('단계 ')[1];
            return isNumeric(text) ? Number(text) : -1;
        }
    }
    return -1;
}

// "엘릭서"이 들어간 객체 가져오기
function findElixirInTooltip(tooltip: any): Elixir[] | null {
    let parsed: TooltipBoject;
    const elixirs: Elixir[] = [];
    try {
        parsed = JSON.parse(tooltip);
    } catch (err) {
        console.error("Tooltip JSON 파싱 오류:", err);
        return null;
    }

    for (const key in parsed) {
        const element = parsed[key];
        const value = element?.value;

        const topStr = value?.Element_000?.topStr;
        if (typeof topStr === "string" && topStr.includes("엘릭서")) {
            const content = value?.Element_000?.contentStr;
            if (content && typeof content === 'object') {
                for (const subKey in content) {
                    const str = content[subKey]?.contentStr;
                    if (typeof str === 'string') {
                        const tip = str.split('<br>')[1].replaceAll('<BR>', '\r\n');
                        const newStr = str.split('<br>')[0];
                        let text = getParsedText(newStr);
                        text = text.split('<br>')[0];
                        text = text.split(']')[1];
                        const name = text.split('Lv.')[0];
                        const level = Number(text.split('Lv.')[1]);
                        elixirs.push({
                            name: name,
                            level: level,
                            tooltip: tip
                        });
                    }
                }
                return elixirs.length > 0 ? elixirs : null;
            }
        }
    }
    return null;
}

export type Elixir = {
    name: string,
    level: number,
    tooltip: string
}
export type Equipment = {
    icon: string, // 장비 이미지
    type: string, // 장비 종류 (무기, 방어구)
    name: string, // 장비 이름 (강화 수치 포함)
    grade: string, // 장비 등급
    quality: number, // 장비 품질
    highUpgrade: number, // 장비 상급 재련
    power: number, // 장비 초월 등급
    elixirs: Elixir[] | null // 장비 엘릭서
}

// 장비 데이터 불러오기
export function applyEquipment(data: any, setEquipments: SetStateFn<Equipment[]>) {
    const attackType = ['무기', '투구', '어깨', '상의', '하의', '장갑'];
    const newEquipments: Equipment[] = [];
    for (const type of attackType) {
        const obj = getObjectByArmorType(data, type);
        const parsedTooltip = JSON.parse(obj.Tooltip);

        const elixirs: Elixir[] | null = findElixirInTooltip(obj.Tooltip);
        
        const newEquipment: Equipment = {
            icon: obj.Icon,
            type: type,
            name: obj.Name,
            grade: obj.Grade,
            quality: Number(parsedTooltip.Element_001.value.qualityValue),
            highUpgrade: findHighUpgradeInTooltip(obj.Tooltip),
            power: findPowerInTooltip(obj.Tooltip),
            elixirs: elixirs
        }
        newEquipments.push(newEquipment);
    }
    setEquipments(newEquipments);
}

// 엘릭서 레벨에 따른 색상 변경
type ColorType = "default" | "primary" | "secondary" | "success" | "warning" | "danger" | undefined;
export function applyColorElixir(value: number): ColorType {
    if (value === 5) return 'success';
    if (value >= 3) return 'primary';
    if (value >= 2) return 'warning';
    if (value >= 1) return 'danger';
    return 'default';
}

// 악세에서 연마 효과 가져오기기
function findItemInTooltip(tooltip: any): string[] {
    let parsed: TooltipBoject;
    let items: string[] = [];
    try {
        parsed = JSON.parse(tooltip);
    } catch (err) {
        console.error("Tooltip JSON 파싱 오류:", err);
        return [];
    }

    for (const key in parsed) {
        const element = parsed[key];
        const value = element?.value;

        const element000 = value?.Element_000;
        const element001 = value?.Element_001;
        if (typeof element000 === "string" && typeof element001 === "string" && element000.includes("연마 효과")) {
            const text = getParsedText(element001.replaceAll('<br>', '|').replaceAll('<BR>', '|'));
            items = text.split('|');
            return items;
        }
    }
    return [];
}

// 악세에서 깨달음 가져오기
function findPointInTooltip(tooltip: any): number {
    let parsed: TooltipBoject;
    try {
        parsed = JSON.parse(tooltip);
    } catch (err) {
        console.error("Tooltip JSON 파싱 오류:", err);
        return -1;
    }

    for (const key in parsed) {
        const element = parsed[key];
        const value = element?.value;

        const element000 = value?.Element_000;
        const element001 = value?.Element_001;
        if (typeof element000 === "string" && typeof element001 === "string" && element000.includes("아크 패시브 포인트 효과")) {
            const text = getParsedText(element001);
            return Number(text.split('+')[1])
        }
    }
    return -1;
}

export type Accessory = {
    icon: string, // 악세 이미지
    name: string, // 악세 이름
    type: string, // 악세 종류
    grade: string, // 악세 등급
    quality: number, // 악세 품질
    items: string[], // 악세 연마
    point: number, // 깨달음 포인트
    tooltip: string // Tooltip
}

// 장비 종류에 따른 값 반환 함수
export function getListByArmorType(list: any[], type: string): any[] {
    const obj = list.filter((item) => item.Type === type);
    return obj;
}

// 악세 데이터 불러오기
export function applyAccessories(data: any, setAccessories: SetStateFn<Accessory[]>) {
    const accessoryType = ['목걸이', '귀걸이', '반지'];
    const newAccessories: Accessory[] = [];
    for (const type of accessoryType) {
        const objs = getListByArmorType(data, type);
        for (const obj of objs) {
            const parsedTooltip = JSON.parse(obj.Tooltip);

            const newAccessory: Accessory = {
                icon: obj.Icon,
                name: obj.Name,
                type: type,
                grade: obj.Grade,
                quality: Number(parsedTooltip.Element_001.value.qualityValue),
                items: findItemInTooltip(obj.Tooltip),
                point: findPointInTooltip(obj.Tooltip),
                tooltip: obj.Tooltip
            }
            newAccessories.push(newAccessory);
        }
    }
    setAccessories(newAccessories);
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

// 등급 별 문자 반환
export function getTextByGrade(grade: string): string {
    switch(grade) {
        case 'lg': return '상';
        case 'md': return '중';
        case 'sm': return '하';
    }
    return '-';
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

// 팔찌 데이터 가져오기
export type Arm = {
    icon: string,
    type: string,
    name: string,
    grade: string,
    point: number,
    tooltip: any
}
export function applyArmData(data: any, setArm: SetStateFn<Arm | null>) {
    const objs = getListByArmorType(data, '팔찌');
    if (objs.length > 0) {
        const obj = objs[0];
        const parsedTooltip = JSON.parse(obj.Tooltip);
        const newArm: Arm = {
            icon: obj.Icon,
            type: '팔찌',
            name: obj.Name,
            grade: obj.Grade,
            point: findPointInTooltip(obj.Tooltip),
            tooltip: parsedTooltip
        }
        setArm(newArm);
    }
}

// 어빌리티 스톤 가져오기
export type StoneEffect = {
    name: string,
    level: number
}
export type Stone = {
    icon: string,
    type: string,
    name: string,
    grade: string,
    tooltip: any,
    effects: StoneEffect[]
}
export function applyStoneData(data: any, setArm: SetStateFn<Stone | null>) {
    const objs = getListByArmorType(data, '어빌리티 스톤');
    if (objs.length > 0) {
        const obj = objs[0];
        const parsedTooltip = JSON.parse(obj.Tooltip);
        const newStone: Stone = {
            icon: obj.Icon,
            type: '어빌리티 스톤',
            name: obj.Name,
            grade: obj.Grade,
            tooltip: parsedTooltip,
            effects: getStoneEffectInTooltip(parsedTooltip)
        }
        setArm(newStone);
    }
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

// 전체 초월 수 가져오기
export function getAllPower(equipments: Equipment[]): number {
    let sum = 0;
    for (const eqiupment of equipments) {
        sum += eqiupment.power;
    }
    return sum;
}

// 전체 엘릭서 총합 가져오기
export function getAllElixir(equipments: Equipment[]): number {
    let sum = 0;
    for (const equipment of equipments) {
        if (equipment.elixirs) {
            for (const elixir of equipment.elixirs) {
                sum += elixir.level;
            }
        }
    }
    return sum;
}

// 보석 데이터 가져오기
export type Gem = {
    slot: number,
    name: string,
    icon: string,
    level: number,
    grade: string,
    skillStr: string,
    attack: number
}
export function loadGems(datas: any[], setGems: SetStateFn<Gem[]>, setAttack: SetStateFn<number>) {
    let gems: Gem[] = [];
    let attactSum = 0;
    if (datas) {
        for (const data of datas) {
            const parsedTooltip = JSON.parse(data.Tooltip);
            const gemInfo: GemInfo | null = findGemInfoInTooltip(parsedTooltip);
            const newGem: Gem = {
                slot: Number(data.Slot),
                name: getParsedText(data.Name),
                icon: data.Icon,
                level: Number(data.Level),
                grade: data.Grade,
                skillStr: gemInfo ? gemInfo.skillStr : '',
                attack: gemInfo ? gemInfo.attack : 0
            }
            gems.push(newGem);
            attactSum += gemInfo ? gemInfo.attack : 0;
        }
    }
    gems = gems.sort((a, b) => b.level - a.level);
    setGems(gems);
    setAttack(attactSum);
}

// 스킬 또는 기본 공격력 가져오기
type GemInfo = {
    skillStr: string,
    attack: number
}
function findGemInfoInTooltip(parsed: any): GemInfo | null {
    for (const key in parsed) {
        const element = parsed[key];
        const value = element?.value;

        const element000 = value?.Element_000;
        const element001 = value?.Element_001;
        if (typeof element000 === 'string' && typeof element001 === 'string' && element000.includes('효과')) {
            const text = getParsedText(element001.replaceAll('<BR>', '\r\n'));
            const skillStr = text.split(/\r?\n/)[0];
            let attack = 0;
            if (text.includes('기본 공격력')) {
                attack = Number(text.split('기본 공격력 ')[1].replaceAll(' 증가', '').replaceAll('%', ''));
            }
            return {
                skillStr: skillStr,
                attack: attack
            }
        }
    }
    return null;
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
        if (gem.name.includes('겁화') || gem.name.includes('멸화') || gem.name.includes('청명')) {
            count++;
        }
    }
    return count;
}

// 겁화/멸화 개수 가져오기
export function getCountDekGems(gems: Gem[]): number {
    let count = 0;
    for (const gem of gems) {
        if (gem.name.includes('작열') || gem.name.includes('홍염') || gem.name.includes('원해')) {
            count++;
        }
    }
    return count;
}

// 카드 데이터 가져오기
export type CardData = {
    slot: number,
    name: string,
    icon: string,
    count: number,
    total: number,
    grade: string
}
export type CardDetailSet = {
    name: string,
    description: string,
    isEnable: boolean,
    enableCount: number
}
export type CardSet = {
    name: string,
    slots: number[],
    items: CardDetailSet[]
}
export function loadCards(data: any, setCards: SetStateFn<CardData[]>, setCardSet: SetStateFn<CardSet[]>) {
    const cards: CardData[] = [];
    const sets: CardSet[] = [];
    if (data) {
        const datas = data.Cards;
        for (const item of datas) {
            const newCard: CardData = {
                slot: Number(item.Slot),
                name: item.Name,
                icon: item.Icon,
                count: Number(item.AwakeCount),
                total: Number(item.AwakeTotal),
                grade: item.Grade
            }   
            cards.push(newCard);
        }
        const setDatas = data.Effects;
        for (const cardSet of setDatas) {
            const items: CardDetailSet[] = [];
            const cardCount = cardSet.CardSlots.length;
            for (const item of cardSet.Items) {
                let enableCount = 0, cardAllCount = 0;
                const cardText = item.Name;
                if (cardText.includes('각성합계')) {
                    const match = cardText.match(/(\d+)각성합계/);
                    enableCount = match ? parseInt(match[1], 10) : 0;
                }
                if (cardText.includes('세트')) {
                    const match = cardText.match(/(\d+)세트/);
                    cardAllCount = match ? parseInt(match[1], 10) : 0;
                }
                const newItem: CardDetailSet = {
                    name: item.Name,
                    description: item.Description,
                    isEnable: cardCount >= cardAllCount,
                    enableCount: enableCount
                }
                items.push(newItem);
            }
            const newSet: CardSet = {
                name: items[0].name.replace(/\s*\d+세트.*$/, ""),
                slots: cardSet.CardSlots,
                items: items
            }
            sets.push(newSet);
        }
        setCards(cards);
        setCardSet(sets);
    }
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

// 스택 데이터 가져오기
export type Stat = {
    type: string,
    value: number,
    tooltip: string[]
}
export function loadStats(datas: any[] | null, setStat:SetStateFn<Stat[]>) {
    const stat: Stat[] = [];
    if (datas) {
        for (const data of datas) {
            const tooltips: string[] = [];
            for (const tip of data.Tooltip) {
                tooltips.push(getParsedText(tip));
            }
            const newStat: Stat = {
                type: data.Type,
                value: Number(data.Value),
                tooltip: tooltips
            }
            stat.push(newStat);
        }
    }
    setStat(stat);
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

// 스택 비중이 높은 스택 반환 함수
export function getHighStats(stat: Stat[]): Stat[] {
    const filterdStats = stat.filter(item => item.type !== '공격력' && item.type !== '최대 생명력');
    let newStats: Stat[] = [];
    for (const item of filterdStats) {
        if (item.value >= 300) {
            newStats.push(item);
        }
    }
    newStats = newStats.sort((a, b) => b.value - a.value);
    return newStats;
}

// 스택 비중이 낮은 스택 반환 함수
export function getLowStats(stat: Stat[]): Stat[] {
    const filterdStats = stat.filter(item => item.type !== '공격력' && item.type !== '최대 생명력');
    const newStats: Stat[] = [];
    for (const item of filterdStats) {
        if (item.value < 300) {
            newStats.push(item);
        }
    }
    return newStats;
}

// 원하는 종류의 스택 반환 함수
export function getStatByType(stat: Stat[], type: string): Stat | undefined {
    return stat.find(item => item.type === type);
}

// 각인 데이터 가져오기
export type Engraving = {
    name: string,
    description: string,
    grade: string,
    level: number,
    stoneLevel : number
}
export function loadEngraving(datas: any[] | null, setEngravings: SetStateFn<Engraving[]>) {
    const engravings: Engraving[] = [];
    if (datas) {
        for (const data of datas) {
            const newEngraving: Engraving = {
                name: data.Name,
                description: getParsedText(data.Description),
                grade: data.Grade,
                level: Number(data.Level),
                stoneLevel: Number(data.AbilityStoneLevel ? data.AbilityStoneLevel : 0)
            }
            engravings.push(newEngraving);
        }
    }
    setEngravings(engravings);
}

//아크패시브 데이터 가져오기
export type ArkpassivePoint = {
    type: string,
    point: number,
    max: number
}
export type ArkpassiveItem = {
    tier: number,
    name: string,
    level: number,
    icon: string,
    description: string
}
export function loadArkpassive(
    data: any | null, 
    setPoints: SetStateFn<ArkpassivePoint[]>,
    setEvolution: SetStateFn<ArkpassiveItem[]>,
    setEnlightenment: SetStateFn<ArkpassiveItem[]>,
    setJump: SetStateFn<ArkpassiveItem[]>
) {
    const points: ArkpassivePoint[] = [];
    const evolution: ArkpassiveItem[] = [];
    const enlightenment: ArkpassiveItem[] = [];
    const jump: ArkpassiveItem[] = [];
    if (data) {
        const dataPoints = data.Points;
        for (const point of dataPoints) {
            const newPoint: ArkpassivePoint = {
                type: point.Name,
                point: Number(point.Value),
                max: maxPoint(point.Name)
            }
            points.push(newPoint);
        }
        const dataEffects = data.Effects;
        for (const effect of dataEffects) {
            const parsedTooltip = JSON.parse(effect.ToolTip);
            const tip = getParsedText(parsedTooltip.Element_002?.value).replaceAll('|', '');
            const description = getParsedText(effect.Description);
            const tier = description.split('티어 ')[0].replaceAll(effect.Name, '');
            const name = description.split('티어 ')[1].split(' Lv.')[0];
            const level = description.split(' Lv.')[1];
            const newItem: ArkpassiveItem = {
                tier: Number(tier),
                name: name,
                level: Number(level),
                icon: effect.Icon,
                description: tip
            }
            switch(effect.Name) {
                case '진화':
                    evolution.push(newItem);
                    break;
                case '깨달음':
                    enlightenment.push(newItem);
                    break;
                case '도약':
                    jump.push(newItem);
                    break;
            }
        }
    }
    setPoints(points);
    setEvolution(evolution);
    setEnlightenment(enlightenment);
    setJump(jump);
}

// 아크패시브 별 최대값 가져오기
function maxPoint(type: string): number {
    switch(type) {
        case '진화': return data.arkpassivePoints.evolution;
        case '깨달음': return data.arkpassivePoints.enlightenment;
        case '도약': return data.arkpassivePoints.jump;
    }
    return 0;
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