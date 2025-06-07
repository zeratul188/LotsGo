import { SetStateFn } from "@/utiils/utils";
import { addToast } from "@heroui/react";
import { load } from 'cheerio'
import data from "./data.json";

export type CharacterFile = {
    profile: any,
    equipment: any
}

// 캐릭터 검색 함수
export function handleSearch(
    searchValue: string,
    setSearched: SetStateFn<boolean>,
    setLoading: SetStateFn<boolean>,
    setNickname: SetStateFn<string>
) {
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
    setFile: SetStateFn<CharacterFile>
) {
    const lostarkRes = await fetch(`/api/lostark?value=${nickname}&code=5`);
    if (!lostarkRes.ok) {
        addToast({
            title: "불러오기 오류",
            description: `입력한 캐릭터가 존재학지 않거나 로스트아크 점검 시간 등의 이유로 데이터를 불러오지 못했습니다.`,
            color: "danger"
        });
        setNickname('');
        setSearched(false);
        setLoading(false);
        return;
    }
    const data = await lostarkRes.json();
    const newFile = structuredClone(file);
    newFile.profile = data.ArmoryProfile;
    newFile.equipment = data.ArmoryEquipment;
    setLoading(false);
    setFile(newFile);
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
            const text = getParsedText(element001.replaceAll('<BR>', '|'));
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