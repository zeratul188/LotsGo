import simulatorData from "@/data/combatSimulator.json";
import characterData from "@/data/characters/data.json";
import { CharacterInfo } from "../model/types";
import { getSmallGradeByAccessory, getSmallGradeByArm } from "./characterFeat";
import { printEffectInTooltip } from "./armPrints";

export type OptionGrade = "none" | "sm" | "md" | "lg";
export type SimulatorSection = "equipment" | "avatar" | "bracelet" | "gem" | "engraving" | "arkgrid" | "arkpassive";

export type EquipmentSimulation = {
    levels: Record<string, number>;
    advancedLevels: Record<string, number>;
    grades: Record<string, string>;
    qualities: Record<string, number>;
    weaponQuality: number;
};

export type AccessorySimulation = {
    key: string;
    type: string;
    name: string;
    mainStat: number;
    vitality: number;
    options: Array<{ name: string; grade: OptionGrade }>;
};

export type BraceletSimulation = {
    type: string;
    value: number;
    grade: OptionGrade;
};

export type CoreSimulation = {
    grade: string;
    point: number;
    name: string;
};

export type SimulatorState = {
    equipment: EquipmentSimulation;
    accessories: AccessorySimulation[];
    avatars: Record<string, string>;
    bracelet: BraceletSimulation[];
    gems: number[];
    engravings: Array<{ name: string; level: number }>;
    stones: Array<{ name: string; level: number }>;
    stoneHealthBonus: number;
    cores: CoreSimulation[];
    arkGridOptions: Record<string, number>;
    karma: Record<string, number>;
};

type HoningRow = (typeof simulatorData.honing)[number];
const MAIN_STAT_GROWTH_AT_11 = 0.0273501720962638;
const SUPPORT_BRACELET_MAIN_STAT_MULTIPLIER = 0.9965;
const SUPPORT_MAX_HP_CARE_MULTIPLIER = 4.005;
const SUPPORT_COMBAT_STAT_COEFFICIENT = 0.000389;
const SUPPORT_ENGRAVING_BUFF_SHARE_MULTIPLIER = 0.99562;
const SUPPORT_ENLIGHTENMENT_COMBAT_MULTIPLIER = 0.9954;
const SUPPORT_EVOLUTION_HEALTH_MULTIPLIER = 0.1613;
const SUPPORT_EXPERT_BOOK_LEVEL_COEFFICIENT = 0.010388;
const SUPPORT_GEM_LEVEL_COEFFICIENT = 0.012704;
const SUPPORT_ARK_GRID_BRAND_LEVEL_COEFFICIENT = 0.0007864;
const SUPPORT_ARK_GRID_ALLY_ATTACK_LEVEL_COEFFICIENT = 0.0010426;
const SUPPORT_ARK_GRID_ALLY_DAMAGE_LEVEL_COEFFICIENT = 0.0004369;
const SUPPORT_STONE_HEALTH_MULTIPLIER = 0.32264;
const WRIST_GUARD_HONING_STAT_MULTIPLIER = 0.98419;
export const STONE_HEALTH_BONUSES = [0, 1175, 2350, 3525] as const;
const SUPPORT_ADVANCED_ARMOR_SHARE: Record<string, number> = {
    투구: 0.765,
    견갑: 0.743,
    상의: 0.934,
    하의: 0.852,
    장갑: 0.716,
};
const SUPPORT_ADVANCED_WEAPON_SHARE_OF_BUFF = 0.967;
const SUPPORT_AVATAR_MAIN_STAT_SHARE_OF_BUFF = 0.977;
const SUPPORT_MAIN_STAT_SHARE_OF_BUFF = 0.985;
const SUPPORT_WEAPON_ATTACK_SHARE_OF_BUFF = 0.96;

export const EQUIPMENT_SLOTS = ["무기", "투구", "견갑", "상의", "하의", "장갑", "완갑"];
export const AVATAR_SLOTS = ["무기", "투구", "상의", "하의"];
export const CORE_POINTS = [0, 10, 14, 17, 18, 19, 20];
export const CORE_GRADES = ["영웅", "전설", "유물", "고대"];
export const WRIST_GUARD_GRADES = ["영웅", "전설", "유물", "고대"];
const WRIST_GUARD_GRADE_RANGES = [
    { grade: "영웅", min: 0, max: 10 },
    { grade: "전설", min: 10, max: 15 },
    { grade: "유물", min: 15, max: 20 },
    { grade: "고대", min: 20, max: 25 },
];
export const ARK_GRID_OPTION_NAMES = ["공격력", "보스 피해", "추가 피해", "낙인력", "아군 공격 강화", "아군 피해 강화"];
export const ENGRAVING_NAMES = characterData.engravings.map((item) => item.name).sort((a, b) => a.localeCompare(b, "ko"));
export const ENGRAVING_ICON_BY_NAME: Record<string, string> = Object.fromEntries(characterData.engravings.map((item) => [item.name, item.url]));

const gradeIndex: Record<OptionGrade, number> = { none: -1, sm: 0, md: 1, lg: 2 };

export const braceletSpecialOptions = Array.from(new Set(characterData.arms.map((item) => item.small)))
    .map((name) => ({ name, label: name }));

export const braceletRawOptions = [
    { name: "mainStat", label: "힘/민첩/지능", max: 20000 },
    { name: "weaponAttack", label: "무기 공격력", max: 999999 },
    { name: "maxHp", label: "최대 생명력", max: 999999 },
    { name: "치명", label: "치명", max: 120 },
    { name: "특화", label: "특화", max: 120 },
    { name: "신속", label: "신속", max: 120 },
    { name: "제압", label: "제압", max: 120 },
    { name: "인내", label: "인내", max: 120 },
    { name: "숙련", label: "숙련", max: 120 },
];

function stripHtml(value: string): string {
    return value.replace(/<br\s*\/?\s*>/gi, "\n").replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").trim();
}

function parseNumber(value: string): number {
    return Number(value.replaceAll(",", "").replaceAll("%", "").replaceAll("+", "").trim()) || 0;
}

function getTooltipPart(tooltip: string, title: string): string {
    try {
        const parsed = JSON.parse(tooltip);
        for (const item of Object.values(parsed) as any[]) {
            if (stripHtml(item?.value?.Element_000 ?? "") === title) {
                return stripHtml(item?.value?.Element_001 ?? "");
            }
        }
    } catch {
        return "";
    }
    return "";
}

function getStoneHealthBonus(tooltip: unknown): number {
    try {
        const parsed = typeof tooltip === "string" ? JSON.parse(tooltip) : tooltip;
        for (const item of Object.values(parsed as Record<string, any>)) {
            if (stripHtml(item?.value?.Element_000 ?? "") === "세공 단계 보너스") {
                const value = parseNumber(stripHtml(item?.value?.Element_001 ?? "").match(/체력\s*\+?\s*([\d,]+)/)?.[1] ?? "0");
                return STONE_HEALTH_BONUSES.includes(value as typeof STONE_HEALTH_BONUSES[number]) ? value : 0;
            }
        }
    } catch {
        return 0;
    }
    return 0;
}

export function getEquipmentSet(name: string): "에기르" | "세르카" {
    return name.includes("운명의 전율") ? "세르카" : "에기르";
}

export function normalizeEquipmentSlot(type: string): string {
    return type === "어깨" ? "견갑" : type;
}

export function getEnhancementLevel(name: string): number {
    return Number(name.match(/\+(\d+)/)?.[1] ?? 0);
}

export function getPureBaseAttack(info: CharacterInfo): number {
    const tooltip = info.stats.find((item) => item.type === "공격력")?.tooltip ?? [];
    for (const line of tooltip) {
        const match = line.match(/기본 공격력은\s*([\d,]+)/);
        if (match) return parseNumber(match[1]);
    }
    return info.stats.find((item) => item.type === "공격력")?.value ?? 0;
}

export function getCurrentWeaponAttack(info: CharacterInfo): number {
    const weaponAttack = info.equipment.equipments.reduce((sum, item) => {
        const baseText = getTooltipPart(item.tooltip, "기본 효과");
        return sum + parseNumber(baseText.match(/무기 공격력\s*\+?\s*([\d,]+)/)?.[1] ?? "0");
    }, 0);
    return Math.max(weaponAttack, 1);
}

export function getCurrentMainStat(info: CharacterInfo): number {
    const equipmentStat = info.equipment.equipments.reduce((sum, item) => sum + getEquipmentMainStat(item.tooltip), 0);
    const accessoryStat = info.equipment.accessories.reduce((sum, item) => sum + getAccessoryBaseStats(item).mainStat, 0);
    const braceletStat = (info.equipment.arm ? printEffectInTooltip(info.equipment.arm.tooltip) : []).reduce((sum, effect) => {
        const match = stripHtml(effect).match(/^(?:힘|민첩|지능)\s*\+?\s*([\d,]+)/);
        return sum + (match ? parseNumber(match[1]) : 0);
    }, 0);
    return Math.max(1, equipmentStat + accessoryStat + braceletStat);
}

function getEquipmentMainStat(tooltip: string): number {
    const text = getTooltipPart(tooltip, "기본 효과");
    return parseNumber(text.match(/(?:힘|민첩|지능)\s*\+?\s*([\d,]+)/)?.[1] ?? "0");
}

export function getAccessoryBaseStats(accessory: CharacterInfo["equipment"]["accessories"][number]) {
    const text = getTooltipPart(accessory.tooltip, "기본 효과");
    const mainStat = parseNumber(text.match(/(?:힘|민첩|지능)\s*\+?\s*([\d,]+)/)?.[1] ?? "0");
    const vitality = parseNumber(text.match(/체력\s*\+?\s*([\d,]+)/)?.[1] ?? "0");
    return { mainStat, vitality };
}

export function getAccessoryMaxMainStat(accessory: AccessorySimulation): number {
    const data = characterData.accessoryOption.find((item) => item.names.some((name) => accessory.name.includes(name)));
    if (!data) return Math.max(accessory.mainStat, 20000);
    const key = accessory.type === "목걸이" ? "neck" : accessory.type === "귀걸이" ? "ear" : "ring";
    const count = accessory.options.filter((item) => item.name !== "없음").length;
    return data[key].find((item) => item.level === count)?.max ?? Math.max(accessory.mainStat, 20000);
}

function toOptionGrade(value: string): OptionGrade {
    return value === "sm" || value === "md" || value === "lg" ? value : "none";
}

export function createInitialState(info: CharacterInfo): SimulatorState {
    const levels: Record<string, number> = {};
    const advancedLevels: Record<string, number> = {};
    const grades: Record<string, string> = {};
    for (const item of info.equipment.equipments) {
        if (item.grade === "에스더") continue;
        const slot = normalizeEquipmentSlot(item.type);
        levels[slot] = getEnhancementLevel(item.name);
        advancedLevels[slot] = getEquipmentSet(item.name) === "에기르" ? Math.max(item.highUpgrade, 0) : 0;
        grades[slot] = item.grade;
    }

    const accessories = info.equipment.accessories.map((accessory, index) => {
        const stats = getAccessoryBaseStats(accessory);
        const options = accessory.items.slice(0, 3).map((item) => {
            const parsed = getSmallGradeByAccessory(accessory.type, item);
            return { name: parsed.name === "null" ? "없음" : parsed.name, grade: toOptionGrade(parsed.grade) };
        });
        while (options.length < 3) options.push({ name: "없음", grade: "none" });
        return { key: `${accessory.type}-${index}`, type: accessory.type, name: accessory.name, ...stats, options };
    });

    const avatars: Record<string, string> = Object.fromEntries(AVATAR_SLOTS.map((slot) => [slot, "없음"]));
    const avatarGradeRank: Record<string, number> = { 없음: 0, 영웅: 1, 전설: 2 };
    const matchesAvatarSlot = (avatar: CharacterInfo["avatars"][number], slot: string) => {
        if (slot === "무기") return avatar.type.startsWith("무기");
        if (slot === "투구") return avatar.type.startsWith("머리");
        if (slot === "상의") return avatar.type.startsWith("상의");
        return avatar.type.startsWith("하의") || (avatar.type.startsWith("상의") && /상하의|한벌|한 벌/.test(avatar.name));
    };
    for (const slot of AVATAR_SLOTS) {
        const candidates = info.avatars.filter((avatar) => matchesAvatarSlot(avatar, slot) && avatarGradeRank[avatar.grade] > 0);
        const equippedCandidates = candidates.some((avatar) => avatar.isInner) ? candidates.filter((avatar) => avatar.isInner) : candidates;
        const equipped = equippedCandidates.sort((left, right) => avatarGradeRank[right.grade] - avatarGradeRank[left.grade])[0];
        if (equipped) avatars[slot] = equipped.grade;
    }

    const bracelet: BraceletSimulation[] = [];
    for (const raw of info.equipment.arm ? printEffectInTooltip(info.equipment.arm.tooltip) : []) {
        const text = stripHtml(raw).replace(/\s+/g, " ").trim();
        const special = getSmallGradeByArm(raw);
        if (special.name !== "null") {
            bracelet.push({ type: special.name, value: 0, grade: toOptionGrade(special.grade) });
            continue;
        }
        const match = text.match(/^(힘|민첩|지능|치명|특화|신속|제압|인내|숙련|무기 공격력|최대 생명력)\s*\+?\s*([\d,]+)/);
        if (!match) continue;
        const type = ["힘", "민첩", "지능"].includes(match[1]) ? "mainStat" : match[1] === "무기 공격력" ? "weaponAttack" : match[1] === "최대 생명력" ? "maxHp" : match[1];
        bracelet.push({ type, value: parseNumber(match[2]), grade: "none" });
    }
    while (bracelet.length < 5) bracelet.push({ type: "없음", value: 0, grade: "none" });

    const support = info.profile.characterType === "supportor";
    const cores = Array.from({ length: 6 }, (_, index) => {
        const core = info.arkgrid.cores.find((item) => item.index === index);
        if (!core) return { grade: "유물", point: 0, name: "없음" };
        const parsedName = core.name.split(":").at(-1)?.trim() ?? core.name;
        const name = index >= 3 && !getCoreChoices(index, support).includes(parsedName) ? "그외 코어" : parsedName;
        return { grade: core.grade, point: core.point, name };
    });

    const karma = Object.fromEntries(info.arkpassive.points.map((point) => [point.type, Number(point.description.match(/(\d+)레벨/)?.[1] ?? 0)]));
    const qualities = Object.fromEntries(info.equipment.equipments.map((item) => [normalizeEquipmentSlot(item.type), item.quality ?? 0]));
    return {
        equipment: { levels, advancedLevels, grades, qualities, weaponQuality: qualities.무기 ?? 0 },
        accessories,
        avatars,
        bracelet: bracelet.slice(0, 5),
        gems: info.gems.slice(0, 11).map((gem) => gem.level),
        engravings: info.engravings.slice(0, 5).map((engraving) => ({ name: engraving.name, level: engraving.level })),
        stones: info.equipment.stone?.effects
            .filter((effect) => effect.level > 0)
            .slice(0, 2)
            .map((effect) => ({ ...effect, name: effect.name.trim() })) ?? [],
        stoneHealthBonus: getStoneHealthBonus(info.equipment.stone?.tooltip),
        cores,
        arkGridOptions: Object.fromEntries(ARK_GRID_OPTION_NAMES.map((name) => [name, info.arkgrid.options.find((option) => option.name === name || (name === "아군 공격 강화" && option.name === "아군 공격력 강화"))?.level ?? 0])),
        karma,
    };
}

function sumHoning(rows: HoningRow[], set: string, slot: string, from: number, to: number) {
    const direction = to >= from ? 1 : -1;
    const min = Math.min(from, to);
    const max = Math.max(from, to);
    const selected = rows.filter((row) => row.set === set && row.slot === slot && row.from >= min && row.to <= max);
    const sum = selected.reduce((acc, row) => ({
        mainStat: acc.mainStat + Number(row.mainStat),
        vitality: acc.vitality + Number(row.vitality),
        weaponAttack: acc.weaponAttack + Number(row.weaponAttack),
        baseAttack: acc.baseAttack + Number(row.baseAttack),
    }), { mainStat: 0, vitality: 0, weaponAttack: 0, baseAttack: 0 });
    return { ...sum, mainStat: sum.mainStat * direction, vitality: sum.vitality * direction, weaponAttack: sum.weaponAttack * direction, baseAttack: sum.baseAttack * direction };
}

function scaledEquipmentMainStatDelta(rows: HoningRow[], set: string, slot: string, from: number, to: number, currentStat: number): number {
    if (!currentStat || from === to) return 0;
    const statRows = rows
        .filter((row) => row.set === set && row.slot === slot && Number(row.mainStat) > 0)
        .sort((a, b) => Number(a.from) - Number(b.from));
    const anchorIndex = statRows.findIndex((row) => Number(row.from) === 11);
    if (anchorIndex < 0) return 0;

    const rates: Record<number, number> = { 11: MAIN_STAT_GROWTH_AT_11 };
    for (let index = anchorIndex + 1; index < statRows.length; index++) {
        const previous = statRows[index - 1];
        const row = statRows[index];
        const previousRate = rates[Number(previous.from)];
        rates[Number(row.from)] = (Number(row.mainStat) / Number(previous.mainStat)) * previousRate / (1 + previousRate);
    }
    for (let index = anchorIndex - 1; index >= 0; index--) {
        const row = statRows[index];
        const next = statRows[index + 1];
        const nextRate = rates[Number(next.from)];
        const ratio = Number(next.mainStat) / Number(row.mainStat);
        rates[Number(row.from)] = nextRate / (ratio - nextRate);
    }

    let targetStat = currentStat;
    if (to > from) {
        for (let level = from; level < to; level++) targetStat *= 1 + (rates[level] ?? 0);
    } else {
        for (let level = from - 1; level >= to; level--) targetStat /= 1 + (rates[level] ?? 0);
    }
    return targetStat - currentStat;
}

function advancedRatio(slot: string, from: number, to: number): number {
    let ratio = 1;
    if (to > from) for (let level = from + 1; level <= to; level++) ratio *= Number((simulatorData.advancedHoning as any)[level]?.[slot] ?? 1);
    if (to < from) for (let level = to + 1; level <= from; level++) ratio /= Number((simulatorData.advancedHoning as any)[level]?.[slot] ?? 1);
    return ratio;
}

function weaponQualityDamage(quality: number): number {
    return quality <= 0 ? 10 : 10 + 0.002 * Math.min(100, quality) ** 2;
}

function armorLifeActivity(quality: number): number {
    const normalizedQuality = Math.min(100, Math.max(0, quality));
    return Math.ceil(1400 * (normalizedQuality / 100) ** 2);
}

function armorLifeActivityMultiplier(qualities: Record<string, number> = {}): number {
    const lifeActivity = ["투구", "견갑", "상의", "하의", "장갑"]
        .reduce((sum, slot) => sum + armorLifeActivity(qualities[slot] ?? 0), 0);
    return 1 + lifeActivity / 14000;
}

function accessoryFactor(type: string, name: string, grade: OptionGrade, support: boolean): number {
    const i = gradeIndex[grade];
    if (i < 0 || name === "없음") return 1;
    const dealer: Record<string, number[]> = {
        공격력: [0.00056, 0.001365, 0.00273], 치적: [0.0030968, 0.0073549, 0.0120001], 치피: [0.0033, 0.0072, 0.012],
        추피: [0.0046152, 0.0123072, 0.0199992], 적주피: [0.0055, 0.012, 0.02], "공격력%": [0.004, 0.0095, 0.0155],
    };
    const supporter: Record<string, number[]> = {
        파티회복: [0.00665, 0.0147, 0.0245], 파티보호: [0.00665, 0.0147, 0.0245], 공격강화: [0.010125, 0.0225, 0.0375],
        피해강화: [0.01, 0.0225, 0.0375], 낙인력: [0.0129, 0.0288, 0.048], 폿아덴: [0.008, 0.018, 0.03],
    };
    const value = (support ? supporter : dealer)[name]?.[i] ?? 0;
    return 1 + value;
}

function accessoryOptionValue(type: string, name: string, grade: OptionGrade): number {
    if (grade === "none" || name === "없음") return 0;
    const option = getAccessoryOptions(type).find((item) => item.small === name);
    if (!option || !("sm" in option)) return 0;
    return parseNumber(String(option[grade]));
}

function braceletFactor(option: BraceletSimulation, support: boolean): number {
    const i = gradeIndex[option.grade];
    if (i < 0) return 1;
    const common: Record<string, number[]> = {
        "치적 이중": [0.035, 0.04, 0.045], "치피 이중": [0.035, 0.04, 0.045], "추피 악추피": [0.035, 0.04, 0.045],
        "쿨증 적주피": [0.035, 0.04, 0.045], "적주피 무력피해": [0.028, 0.034, 0.04], "무공 공이속": [0.0188, 0.0214, 0.024],
        "안상 무공": [0.0054, 0.0059, 0.0065], "무공 중첩": [0.0105, 0.0113, 0.0121], 적주피: [0.02, 0.025, 0.03],
        추피: [0.023076, 0.026922, 0.030768], "백 적주피": [0.0175, 0.021, 0.0245], "헤드 적주피": [0.0175, 0.021, 0.0245],
        "타대 적주피": [0.025, 0.03, 0.035], 치적: [0.0238, 0.0294, 0.035], 치피: [0.0226644, 0.0279972, 0.03333],
    };
    const supporter: Record<string, number[]> = {
        "방감 아공강": [0.09112, 0.1073, 0.12752], "치명저항 아공강": [0.09112, 0.1073, 0.12752],
        "적주피+ 아공강": [0.09112, 0.1073, 0.12752], "치피저항 아공강": [0.09112, 0.1073, 0.12752],
        "보호 및 회복": [0.035, 0.042, 0.049],
        아공강: [0.02987, 0.037338, 0.044805],
        아피강: [0.02987, 0.037338, 0.044805],
    };
    if (support) {
        const supportWeaponAttack = ["무공 공이속", "안상 무공", "무공 중첩"].includes(option.type)
            ? common[option.type]?.[i]
            : undefined;
        return 1 + (supporter[option.type]?.[i] ?? supportWeaponAttack ?? 0);
    }
    return 1 + (common[option.type]?.[i] ?? 0);
}

function gemFactor(level: number, support: boolean): number {
    if (level < 1 || level > 10) return 1;
    if (support) return 1 + level * SUPPORT_GEM_LEVEL_COEFFICIENT;
    return 1 + (level + 1) * 0.0064;
}

function gemBaseAttackPercent(level: number): number {
    return Number(simulatorData.gems.find((item) => item.level === level)?.baseAttackPercent ?? 0);
}

function abilityStoneBaseAttackPercent(stones: SimulatorState["stones"]): number {
    return stones.reduce((sum, stone) => sum + stone.level, 0) >= 5 ? 1.5 : 0;
}

function chaosStarWeaponEffect(core: CoreSimulation, support: boolean): { flat: number; percent: number } {
    if (support || core.name !== "무기" || core.point < 10) return { flat: 0, percent: 0 };

    let flat = 1300;
    let percent = core.point >= 14 ? 0.75 : 0;
    if (core.point >= 17) {
        if (core.grade === "고대") {
            flat += 3900;
            percent += 2.25;
        } else {
            flat += 2600;
            percent += 1.5;
        }
    }
    if (core.point >= 18) percent += 0.23;
    if (core.point >= 19) percent += 0.23;
    if (core.point >= 20) percent += 0.23;
    return { flat, percent };
}

function coreFactor(index: number, core: CoreSimulation, support: boolean): number {
    const points = [10, 14, 17, 18, 19, 20];
    const p = points.indexOf(core.point);
    if (p < 0) return 1;
    const ancient = core.grade === "고대" && core.point >= 17 ? 0.01 : 0;
    if (support && index < 2) return 1 + [0.012, 0.012, 0.078, 0.0798, 0.081, 0.0822][p] + (ancient ? [0, 0, 0.012, 0.012, 0.012, 0.012][p] : 0);
    if (support && index === 2) return 1 + [0, 0.006, 0.021, 0.022, 0.023, 0.024][p] + (ancient ? [0, 0, 0.009, 0.009, 0.009, 0.009][p] : 0);
    if (index < 3) {
        const values = index === 2 ? [0.01, 0.025, 0.045, 0.0467, 0.0483, 0.05] : [0.015, 0.04, 0.075, 0.0767, 0.0783, 0.08];
        return 1 + values[p] + ancient;
    }
    const tierOneValues = [0.005, 0.01, 0.025, 0.0267, 0.0283, 0.03];
    const tierTwoValues = [0, 0.005, 0.015, 0.0167, 0.0183, 0.02];
    let tier: 0 | 1 | 2 = 0;
    if (index === 3) {
        const tierOneNames = support ? ["신념의 강화"] : ["현란한 공격"];
        const tierTwoNames = support ? ["흐르는 마나", "불굴의 강화"] : ["안정적인 공격", "재빠른 공격"];
        tier = tierOneNames.includes(core.name) ? 1 : tierTwoNames.includes(core.name) ? 2 : 0;
    } else if (index === 4) {
        const tierOneNames = support ? ["낙인의 흔적"] : ["불타는 일격"];
        const tierTwoNames = support ? ["강철의 흔적", "치명적인 흔적"] : ["흡수의 일격", "부수는 일격"];
        tier = tierOneNames.includes(core.name) ? 1 : tierTwoNames.includes(core.name) ? 2 : 0;
    } else if (index === 5) {
        const tierOneNames = support ? ["무기"] : ["공격", "공격력"];
        const tierTwoNames = support ? ["생명"] : ["무기"];
        tier = tierOneNames.includes(core.name) ? 1 : tierTwoNames.includes(core.name) ? 2 : 0;
    }
    if (tier === 0) return 1;
    if (!support && index === 5 && tier === 2) return 1;
    const values = tier === 1 ? tierOneValues : index === 5 ? [0.0035, 0.007, 0.022, 0.023, 0.0241, 0.0253] : tierTwoValues;
    const ancientBonus = core.grade === "고대" && core.point >= 17 && (index !== 5 || tier === 1) ? 0.01 : 0;
    return 1 + values[p] + ancientBonus;
}

function arkGridGemFactor(options: Record<string, number>, support: boolean): number {
    const attack = (options.공격력 ?? 0) * 0.00036;
    const boss = (options["보스 피해"] ?? 0) * 0.0008;
    const additional = (options["추가 피해"] ?? 0) * 0.0008 / 1.3;
    if (!support) return (1 + attack) * (1 + boss) * (1 + additional);
    const brand = (options.낙인력 ?? 0) * SUPPORT_ARK_GRID_BRAND_LEVEL_COEFFICIENT;
    const allyAttack = (options["아군 공격 강화"] ?? 0) * SUPPORT_ARK_GRID_ALLY_ATTACK_LEVEL_COEFFICIENT;
    const allyDamage = (options["아군 피해 강화"] ?? 0) * SUPPORT_ARK_GRID_ALLY_DAMAGE_LEVEL_COEFFICIENT;
    return (1 + brand) * (1 + allyAttack) * (1 + allyDamage);
}

function engravingFactor(name: string, bookLevel: number, stoneLevel: number, support: boolean): number {
    const supportTables: Record<string, number[][]> = {
        각성: [
            [0.27, 0.3, 0.3075, 0.3225, 0.33],
            [0.2775, 0.3075, 0.315, 0.33, 0.3375],
            [0.285, 0.315, 0.3225, 0.3375, 0.345],
            [0.2925, 0.3225, 0.33, 0.345, 0.3525],
            [0.3, 0.33, 0.3375, 0.3525, 0.36],
        ],
        구슬동자: [
            [0.24, 0.2688, 0.276, 0.2904, 0.2976],
            [0.2496, 0.2784, 0.2856, 0.3, 0.3072],
            [0.2592, 0.288, 0.2952, 0.3096, 0.3168],
            [0.2688, 0.2976, 0.3048, 0.3192, 0.3264],
            [0.2784, 0.3072, 0.3144, 0.3288, 0.336],
        ],
        "마나의 흐름": Array.from({ length: 5 }, (_, book) => Array(5).fill(0.14 + book * 0.015)),
        "분쇄의 주먹": Array.from({ length: 5 }, () => [0.024, 0.033, 0.0353, 0.0398, 0.042]),
    };
    if (support && supportTables[name]) {
        const book = Math.min(4, Math.max(0, bookLevel));
        const stone = Math.min(4, Math.max(0, stoneLevel));
        return 1 + supportTables[name][book][stone];
    }
    const supportBase: Record<string, number> = { 전문의: 0.392 };
    const dealerBase: Record<string, number> = { 원한: 0.18, 아드레날린: 0.152, 돌격대장: 0.16, "질량 증가": 0.16, "결투의 대가": 0.153, "기습의 대가": 0.153, "예리한 둔기": 0.1439 };
    const base = (support ? supportBase : dealerBase)[name] ?? (support ? 0 : 0.14);
    const bookStep = name === "아드레날린" ? 0.0105 : name === "돌격대장" ? 0.008 : name === "결투의 대가" || name === "기습의 대가" ? 0.007 : 0.0075;
    const stoneStep = stoneLevel <= 0 ? 0 : stoneLevel === 1 ? 0.03 : stoneLevel === 2 ? 0.0375 : stoneLevel === 3 ? 0.0525 : 0.06;
    return 1 + base + bookLevel * bookStep + (name === "마나의 흐름" ? 0 : stoneStep);
}

function getCurrentSupportCareCombatPower(info: CharacterInfo, state: SimulatorState): number {
    const maxHp = info.stats.find((item) => item.type === "최대 생명력")?.value ?? 0;
    let care = maxHp * 0.0012;
    for (const accessory of state.accessories) {
        for (const option of accessory.options) {
            if (["파티회복", "파티보호"].includes(option.name)) {
                care *= accessoryFactor(accessory.type, option.name, option.grade, true);
            }
        }
    }
    for (const bracelet of state.bracelet) {
        if (bracelet.type === "보호 및 회복") care *= braceletFactor(bracelet, true);
    }
    const expert = state.engravings.find((engraving) => engraving.name === "전문의");
    if (expert) {
        const stoneLevel = state.stones.find((stone) => stone.name === "전문의")?.level ?? 0;
        care *= engravingFactor(expert.name, expert.level, stoneLevel, true);
    }
    return care;
}

export function calculateExpectedCombatPower(info: CharacterInfo, initial: SimulatorState, state: SimulatorState): number {
    const support = info.profile.characterType === "supportor";
    let ratio = 1;
    const currentSupportCare = support ? getCurrentSupportCareCombatPower(info, initial) : 0;
    const supportCareShare = support
        ? Math.min(1, Math.max(0, currentSupportCare / Math.max(info.profile.combatPower, 1)))
        : 0;
    const supportBuffShare = 1 - supportCareShare;
    let supportAccessoryCareRatio = 1;
    let supportAccessoryBuffRatio = 1;
    let supportBraceletCareRatio = 1;
    let supportBraceletBuffRatio = 1;
    const pureBase = Math.max(getPureBaseAttack(info), 1);
    const equipmentWeaponAttack = getCurrentWeaponAttack(info);
    const currentAccessoryWeaponAttack = initial.accessories.flatMap((accessory) => accessory.options)
        .filter((option) => option.name === "무공")
        .reduce((sum, option) => sum + accessoryOptionValue("귀걸이", option.name, option.grade), 0);
    const currentBraceletWeaponAttack = initial.bracelet
        .filter((option) => option.type === "weaponAttack")
        .reduce((sum, option) => sum + option.value, 0);
    const currentWeaponAttack = equipmentWeaponAttack + currentAccessoryWeaponAttack + currentBraceletWeaponAttack;
    const currentMainStat = getCurrentMainStat(info);
    let mainStatDelta = 0;
    let weaponAttackDelta = 0;
    let baseAttackDelta = 0;
    let maxHpDelta = 0;

    for (const equipment of info.equipment.equipments) {
        if (equipment.grade === "에스더") continue;
        const slot = normalizeEquipmentSlot(equipment.type);
        const set = getEquipmentSet(equipment.name);
        const current = initial.equipment.levels[slot] ?? 0;
        const target = state.equipment.levels[slot] ?? current;
        const delta = sumHoning(simulatorData.honing, set, slot, current, target);
        const honingStatMultiplier = slot === "완갑" ? WRIST_GUARD_HONING_STAT_MULTIPLIER : 1;
        const equipmentMainStat = getEquipmentMainStat(equipment.tooltip);
        mainStatDelta += slot !== "완갑" && equipmentMainStat
            ? scaledEquipmentMainStatDelta(simulatorData.honing, set, slot, current, target, equipmentMainStat)
            : delta.mainStat * honingStatMultiplier;
        weaponAttackDelta += delta.weaponAttack * honingStatMultiplier;
        baseAttackDelta += delta.baseAttack * honingStatMultiplier;
        if (set === "에기르") {
            const honingRatio = advancedRatio(slot, initial.equipment.advancedLevels[slot] ?? 0, state.equipment.advancedLevels[slot] ?? 0);
            ratio *= support
                ? slot === "무기"
                    ? 1 + (honingRatio - 1) * supportBuffShare * SUPPORT_ADVANCED_WEAPON_SHARE_OF_BUFF
                    : 1 + (honingRatio - 1) * (SUPPORT_ADVANCED_ARMOR_SHARE[slot] ?? 1)
                : honingRatio;
        }
    }
    for (let index = 0; index < state.accessories.length; index++) {
        const before = initial.accessories[index];
        const after = state.accessories[index];
        if (!before || !after) continue;
        mainStatDelta += after.mainStat - before.mainStat;
        for (let optionIndex = 0; optionIndex < 3; optionIndex++) {
            const oldOption = before.options[optionIndex];
            const newOption = after.options[optionIndex];
            const optionRatio = accessoryFactor(after.type, newOption.name, newOption.grade, support)
                / accessoryFactor(before.type, oldOption.name, oldOption.grade, support);
            if (support) {
                if (["파티회복", "파티보호"].includes(oldOption.name) || ["파티회복", "파티보호"].includes(newOption.name)) {
                    supportAccessoryCareRatio *= optionRatio;
                } else {
                    supportAccessoryBuffRatio *= optionRatio;
                }
            } else {
                ratio *= optionRatio;
            }
            const oldValue = accessoryOptionValue(before.type, oldOption.name, oldOption.grade);
            const newValue = accessoryOptionValue(after.type, newOption.name, newOption.grade);
            if (oldOption.name === "무공") weaponAttackDelta -= oldValue;
            if (newOption.name === "무공") weaponAttackDelta += newValue;
        }
    }
    if (support) {
        ratio *= supportCareShare * supportAccessoryCareRatio + supportBuffShare * supportAccessoryBuffRatio;
    }
    const oldAvatarPercent = Object.values(initial.avatars).reduce((sum, grade) => sum + (grade === "전설" ? 2 : grade === "영웅" ? 1 : 0), 0);
    const newAvatarPercent = Object.values(state.avatars).reduce((sum, grade) => sum + (grade === "전설" ? 2 : grade === "영웅" ? 1 : 0), 0);
    const avatarMainStatRatio = Math.sqrt((1 + newAvatarPercent / 100) / (1 + oldAvatarPercent / 100));
    ratio *= support
        ? supportCareShare + supportBuffShare * (1 + (avatarMainStatRatio - 1) * SUPPORT_AVATAR_MAIN_STAT_SHARE_OF_BUFF)
        : avatarMainStatRatio;

    for (let index = 0; index < 5; index++) {
        const before = initial.bracelet[index] ?? { type: "없음", value: 0, grade: "none" as OptionGrade };
        const after = state.bracelet[index] ?? before;
        const braceletMainStatMultiplier = support ? SUPPORT_BRACELET_MAIN_STAT_MULTIPLIER : 1;
        if (before.type === "mainStat") mainStatDelta -= before.value * braceletMainStatMultiplier;
        if (after.type === "mainStat") mainStatDelta += after.value * braceletMainStatMultiplier;
        if (before.type === "weaponAttack") weaponAttackDelta -= before.value;
        if (after.type === "weaponAttack") weaponAttackDelta += after.value;
        if (before.type === "maxHp") maxHpDelta -= before.value;
        if (after.type === "maxHp") maxHpDelta += after.value;
        const optionRatio = braceletFactor(after, support) / braceletFactor(before, support);
        if (support) {
            if (before.type === "보호 및 회복" || after.type === "보호 및 회복") {
                supportBraceletCareRatio *= optionRatio;
            } else {
                supportBraceletBuffRatio *= optionRatio;
            }
        } else {
            ratio *= optionRatio;
        }
    }
    if (support) {
        ratio *= supportCareShare * supportBraceletCareRatio + supportBuffShare * supportBraceletBuffRatio;
        const vitalityHpCoefficient: Record<string, number> = { 바드: 1.9, 도화가: 2, 홀리나이트: 2.5, 발키리: 2.5 };
        const currentQualities = Object.fromEntries(info.equipment.equipments.map((item) => [normalizeEquipmentSlot(item.type), item.quality ?? 0]));
        const targetLifeMultiplier = armorLifeActivityMultiplier({ ...currentQualities, ...state.equipment.qualities });
        maxHpDelta += (state.stoneHealthBonus - initial.stoneHealthBonus)
            * (vitalityHpCoefficient[info.profile.className] ?? 2)
            * targetLifeMultiplier
            * SUPPORT_STONE_HEALTH_MULTIPLIER;
        maxHpDelta += ((state.karma.진화 ?? 0) - (initial.karma.진화 ?? 0))
            * 400
            * (vitalityHpCoefficient[info.profile.className] ?? 2)
            * targetLifeMultiplier
            * SUPPORT_EVOLUTION_HEALTH_MULTIPLIER;
        const currentMaxHp = Math.max(info.stats.find((item) => item.type === "최대 생명력")?.value ?? 0, 1);
        ratio *= Math.max(0.01, 1 + supportCareShare * maxHpDelta / currentMaxHp * SUPPORT_MAX_HP_CARE_MULTIPLIER);
    }
    const effectiveCombatStats = support ? ["특화", "신속"] : ["치명", "특화", "신속"];
    const oldCombatStats = initial.bracelet.filter((item) => effectiveCombatStats.includes(item.type)).reduce((sum, item) => sum + item.value, 0);
    const newCombatStats = state.bracelet.filter((item) => effectiveCombatStats.includes(item.type)).reduce((sum, item) => sum + item.value, 0);
    const currentCombatStats = info.stats
        .filter((item) => effectiveCombatStats.includes(item.type))
        .reduce((sum, item) => sum + item.value, 0);
    const combatStatCoefficient = support ? SUPPORT_COMBAT_STAT_COEFFICIENT : 0.0003;
    const combatStatRatio = Math.max(0.01, (1 + (currentCombatStats + newCombatStats - oldCombatStats) * combatStatCoefficient)
        / (1 + currentCombatStats * combatStatCoefficient));
    ratio *= support
        ? supportCareShare + supportBuffShare * combatStatRatio
        : combatStatRatio;
    const wristGuardAttackPercent = (grade: string) => Math.max(WRIST_GUARD_GRADES.indexOf(grade), 0);
    const initialGemBaseAttackPercent = initial.gems.reduce((sum, level) => sum + gemBaseAttackPercent(level), 0);
    const newGemBaseAttackPercent = state.gems.reduce((sum, level) => sum + gemBaseAttackPercent(level), 0);
    const initialOtherBaseAttackPercent = abilityStoneBaseAttackPercent(initial.stones)
        + wristGuardAttackPercent(initial.equipment.grades.완갑);
    const newOtherBaseAttackPercent = abilityStoneBaseAttackPercent(state.stones)
        + wristGuardAttackPercent(state.equipment.grades.완갑);
    const initialBaseAttackPercent = initialGemBaseAttackPercent + initialOtherBaseAttackPercent;
    const newBaseAttackPercent = newGemBaseAttackPercent + newOtherBaseAttackPercent;
    ratio *= support
        ? (1 + newOtherBaseAttackPercent / 100) / (1 + initialOtherBaseAttackPercent / 100)
        : (1 + newBaseAttackPercent / 100) / (1 + initialBaseAttackPercent / 100);

    if (support) {
        const currentQualities = Object.fromEntries(info.equipment.equipments.map((item) => [normalizeEquipmentSlot(item.type), item.quality ?? 0]));
        const initialLifeMultiplier = armorLifeActivityMultiplier({ ...currentQualities, ...initial.equipment.qualities });
        const targetLifeMultiplier = armorLifeActivityMultiplier({ ...currentQualities, ...state.equipment.qualities });
        ratio *= Math.max(0.01, 1 + supportCareShare * (targetLifeMultiplier / initialLifeMultiplier - 1));
    } else {
        ratio *= (1 + weaponQualityDamage(state.equipment.weaponQuality) / 100) / (1 + weaponQualityDamage(initial.equipment.weaponQuality) / 100);
    }
    const oldAccessoryWeaponAttackPercent = initial.accessories.flatMap((accessory) => accessory.options)
        .filter((option) => option.name === "무공%")
        .reduce((sum, option) => sum + accessoryOptionValue("귀걸이", option.name, option.grade), 0);
    const newAccessoryWeaponAttackPercent = state.accessories.flatMap((accessory) => accessory.options)
        .filter((option) => option.name === "무공%")
        .reduce((sum, option) => sum + accessoryOptionValue("귀걸이", option.name, option.grade), 0);
    const mainStatRatio = Math.sqrt(Math.max(0.01, (currentMainStat + mainStatDelta) / currentMainStat));
    ratio *= support
        ? supportCareShare + supportBuffShare * (1 + (mainStatRatio - 1) * SUPPORT_MAIN_STAT_SHARE_OF_BUFF)
        : mainStatRatio;
    const initialChaosStarWeapon = chaosStarWeaponEffect(initial.cores[5], support);
    const newChaosStarWeapon = chaosStarWeaponEffect(state.cores[5], support);
    const existingWeaponAttackPercent = (oldAccessoryWeaponAttackPercent
        + (initial.karma.깨달음 ?? 0) * 0.1) / 100;
    const effectiveCurrentWeaponAttack = Math.max(currentWeaponAttack + initialChaosStarWeapon.flat, 1)
        * (1 + existingWeaponAttackPercent)
        + currentWeaponAttack * initialChaosStarWeapon.percent / 100;
    const targetBaseWeaponAttack = Math.max(currentWeaponAttack + weaponAttackDelta, 1);
    const targetWeaponAttackPercent = existingWeaponAttackPercent
        + (newAccessoryWeaponAttackPercent - oldAccessoryWeaponAttackPercent) / 100
        + ((state.karma.깨달음 ?? 0) - (initial.karma.깨달음 ?? 0))
        * 0.001
        * (support ? SUPPORT_ENLIGHTENMENT_COMBAT_MULTIPLIER : 1);
    const effectiveTargetWeaponAttack = (targetBaseWeaponAttack + newChaosStarWeapon.flat)
        * Math.max(0.01, 1 + targetWeaponAttackPercent)
        + targetBaseWeaponAttack * newChaosStarWeapon.percent / 100;
    const weaponAttackRatio = Math.sqrt(Math.max(0.01, effectiveTargetWeaponAttack / effectiveCurrentWeaponAttack));
    ratio *= support
        ? supportCareShare + supportBuffShare * (1 + (weaponAttackRatio - 1) * SUPPORT_WEAPON_ATTACK_SHARE_OF_BUFF)
        : weaponAttackRatio;
    ratio *= Math.max(0.01, (pureBase + baseAttackDelta * (1 + initialBaseAttackPercent / 100)) / pureBase);

    for (let index = 0; index < Math.max(initial.gems.length, state.gems.length); index++) {
        ratio *= gemFactor(state.gems[index] ?? 0, support) / gemFactor(initial.gems[index] ?? 0, support);
    }
    for (let index = 0; index < initial.engravings.length; index++) {
        const before = initial.engravings[index];
        const after = state.engravings[index] ?? before;
        const oldStone = initial.stones.find((item) => item.name === before.name)?.level ?? 0;
        const newStone = state.stones.find((item) => item.name === after.name)?.level ?? 0;
        const engravingRatio = engravingFactor(after.name, after.level, newStone, support)
            / engravingFactor(before.name, before.level, oldStone, support);
        if (support) {
            if (["각성", "구슬동자", "마나의 흐름", "분쇄의 주먹"].includes(before.name)) {
                ratio *= 1 + (engravingRatio - 1) * supportBuffShare * SUPPORT_ENGRAVING_BUFF_SHARE_MULTIPLIER;
            } else if (before.name === "전문의") {
                const expertBookRatio = (1 + after.level * SUPPORT_EXPERT_BOOK_LEVEL_COEFFICIENT)
                    / (1 + before.level * SUPPORT_EXPERT_BOOK_LEVEL_COEFFICIENT);
                ratio *= supportBuffShare + supportCareShare * expertBookRatio;
            }
        } else {
            ratio *= engravingRatio;
        }
    }
    for (let index = 0; index < 6; index++) ratio *= coreFactor(index, state.cores[index], support) / coreFactor(index, initial.cores[index], support);
    ratio *= arkGridGemFactor(state.arkGridOptions, support) / arkGridGemFactor(initial.arkGridOptions, support);
    if (!support) {
        ratio *= Math.max(0.01, 1 + ((state.karma.도약 ?? 0) - (initial.karma.도약 ?? 0)) * 0.0002);
    }
    return Math.max(0, info.profile.combatPower * ratio);
}

export function calculateBraceletCombatPowerPercent(info: CharacterInfo, initial: SimulatorState, state: SimulatorState): number {
    const withoutBracelet = structuredClone(state);
    withoutBracelet.bracelet = Array.from({ length: 5 }, () => ({
        type: "없음",
        value: 0,
        grade: "none" as OptionGrade,
    }));
    const basePower = calculateExpectedCombatPower(info, initial, withoutBracelet);
    const currentPower = calculateExpectedCombatPower(info, initial, state);
    return basePower > 0 ? (currentPower / basePower - 1) * 100 : 0;
}

export function getHoningRange(set: string, slot: string, equipmentName = ""): number[] {
    const values = simulatorData.honing.filter((row) => row.set === set && row.slot === slot).flatMap((row) => [Number(row.from), Number(row.to)]);
    const unique = Array.from(new Set(values)).sort((a, b) => a - b);
    const maxLevel = equipmentName.includes("운명의 결단") ? 20 : 25;
    return unique.filter((level) => level <= maxLevel);
}

export function getWristGuardGradeForLevel(level: number, currentGrade: string): string {
    const currentRange = WRIST_GUARD_GRADE_RANGES.find((range) => range.grade === currentGrade);
    if (currentRange && level >= currentRange.min && level <= currentRange.max) return currentGrade;
    return WRIST_GUARD_GRADE_RANGES.find((range) => level >= range.min && level <= range.max)?.grade ?? currentGrade;
}

export function clampWristGuardLevelForGrade(level: number, grade: string): number {
    const range = WRIST_GUARD_GRADE_RANGES.find((item) => item.grade === grade);
    return range ? Math.min(Math.max(level, range.min), range.max) : level;
}

export function getAccessoryOptions(type: string) {
    const data = type === "목걸이" ? characterData.accessory.neck : type === "귀걸이" ? characterData.accessory.ear : characterData.accessory.pinger;
    return [{ name: "없음", small: "없음" }, ...data];
}

export function getBraceletInputMax(type: string): number {
    return braceletRawOptions.find((option) => option.name === type)?.max ?? 0;
}

export function getCoreChoices(index: number, support: boolean): string[] {
    if (index < 3) return ["현재 코어"];
    if (index === 3) return support ? ["신념의 강화", "흐르는 마나", "불굴의 강화", "없음", "그외 코어"] : ["현란한 공격", "안정적인 공격", "재빠른 공격", "없음", "그외 코어"];
    if (index === 4) return support ? ["낙인의 흔적", "강철의 흔적", "치명적인 흔적", "없음", "그외 코어"] : ["불타는 일격", "흡수의 일격", "부수는 일격", "없음", "그외 코어"];
    return support ? ["무기", "생명", "없음", "그외 코어"] : ["공격", "무기", "없음", "그외 코어"];
}
