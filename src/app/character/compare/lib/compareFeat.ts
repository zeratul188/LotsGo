import { addToast } from "@heroui/react";
import { decrypt } from "@/utiils/crypto";
import { LoginUser } from "@/app/store/loginSlice";
import { ArkGridOption, CharacterInfo } from "../../model/types";
import { CharacterFile } from "../../lib/characterFeat";
import { getCharacterInfoByFile, toNumber } from "../../lib/characterInfo";
import { ExpeditionCharacter } from "../../characterlist/model/types";
import data from "@/data/characters/data.json";
import { getEnhanceLevel } from "../../characterlist/lib/characterInfoFeat";
import { getSmallGradeByAccessory, getSmallGradeByArm } from "../../lib/characterFeat";
import { printEffectInTooltip } from "../../lib/armPrints";

const secretKey = process.env.NEXT_PUBLIC_SECRET_KEY ? process.env.NEXT_PUBLIC_SECRET_KEY : "null";
const COMPARE_EQUIPMENT_TYPES = ["무기", "투구", "어깨", "장갑", "상의", "하의"] as const;
const ACCESSORY_GRADE_SCORE: Record<string, number> = {
    lg: 3,
    md: 2,
    sm: 1,
    none: 0,
};
const ENGRAVING_GRADE_OFFSET: Record<string, number> = {
    영웅: 0,
    전설: 4,
    유물: 8,
};
const TIER4_GEM_KEYWORDS = ["광휘", "겁화", "작열"];
const ARKGRID_CORE_GRADE_SCORE: Record<string, number> = {
    영웅: 1,
    전설: 2,
    유물: 3,
    고대: 4,
};
const ATTACK_ARKGRID_OPTION_NAMES = ["공격력", "보스 피해", "추가 피해"];

// 캐릭터 역할에 맞는 유효 악세서리 옵션 목록을 가져온다.
function getEffectiveAccessoryOptions(character: ExpeditionCharacter | null): string[] {
    if (!character) {
        return [];
    }

    return data.effectedAccessories[character.profile.characterType as "attack" | "supportor"] ?? [];
}

export type EquipmentDiffRow = {
    type: string;
    leftText: string;
    rightText: string;
};

// 특정 특성의 수치를 찾아 비교용 숫자로 반환한다.
function getStatValue(character: ExpeditionCharacter | null, type: string): number | null {
    return character?.stats.find((stat) => stat.type === type)?.value ?? null;
}

// 강조 표시 대상인 300 이상 특성들의 합계를 계산한다.
function getHighlightedStatSum(character: ExpeditionCharacter | null): number | null {
    if (!character) {
        return null;
    }

    return character.stats
        .filter((stat) => stat.type !== "공격력" && stat.type !== "최대 생명력" && stat.value >= 300)
        .reduce((sum, stat) => sum + stat.value, 0);
}

// 귀걸이와 반지처럼 같은 종류의 악세서리에 번호 라벨을 붙인다.
function getAccessoryLineLabel(type: string, index: number): string {
    if (type === "귀걸이" || type === "반지") {
        return `${type}${index}`;
    }

    return type;
}

// 한 줄의 악세서리에서 유효 옵션만 골라 등급 점수 합계를 계산한다.
function getAccessoryCompareValue(character: ExpeditionCharacter | null, index: number): number | null {
    const accessory = character?.equipment.accessories[index];
    if (!accessory) {
        return null;
    }

    const effectiveOptions = getEffectiveAccessoryOptions(character);

    return accessory.items
        .slice(0, 3)
        .reduce((sum, item) => {
            const parsedItem = getSmallGradeByAccessory(accessory.type, item);
            if (!effectiveOptions.includes(parsedItem.name)) {
                return sum;
            }

            return sum + ACCESSORY_GRADE_SCORE[parsedItem.grade];
        }, 0);
}

// 어빌리티 스톤의 1, 2옵션은 더하고 3옵션은 빼서 비교값을 만든다.
function getStoneCompareValue(character: ExpeditionCharacter | null): number | null {
    const stone = character?.equipment.stone;
    if (!stone || stone.effects.length === 0) {
        return null;
    }

    return stone.effects.slice(0, 3).reduce((sum, effect, index) => {
        return sum + (index === 2 ? -effect.level : effect.level);
    }, 0);
}

// 팔찌 효과 중 판정 가능한 옵션만 모아 등급 점수 합계를 계산한다.
function getArmCompareValue(character: ExpeditionCharacter | null): number | null {
    const arm = character?.equipment.arm;
    if (!arm) {
        return null;
    }

    const effects = printEffectInTooltip(arm.tooltip);
    if (effects.length === 0) {
        return null;
    }

    return effects.reduce((sum, effect) => {
        const parsedEffect = getSmallGradeByArm(effect);
        if (parsedEffect.name === "null") {
            return sum;
        }

        return sum + ACCESSORY_GRADE_SCORE[parsedEffect.grade];
    }, 0);
}

export async function loadCompareCharacterInfo(nickname: string): Promise<CharacterInfo | null> {
    const trimmedNickname = nickname.trim();
    if (!trimmedNickname) {
        return null;
    }

    const res = await fetch(`/api/characters?nickname=${trimmedNickname}`);
    let shouldLoadFromApi = false;

    if (res.ok) {
        const data = await res.json();
        if (data.date && data.character) {
            const basedDate = new Date(data.date.seconds * 1000 + data.date.nanoseconds / 1_000_000);
            const threeDaysInMs = 3 * 24 * 60 * 60 * 1000;
            const now = new Date();
            const hasPassed3Days = (now.getTime() - basedDate.getTime()) >= threeDaysInMs;

            if (!hasPassed3Days) {
                return data.character as CharacterInfo;
            }
        }

        shouldLoadFromApi = true;
    } else if (res.status === 401) {
        shouldLoadFromApi = true;
    } else {
        addToast({
            title: "불러오기 오류",
            description: "데이터베이스에서 캐릭터 정보를 불러오지 못했습니다.",
            color: "danger"
        });
        return null;
    }

    if (!shouldLoadFromApi) {
        return null;
    }

    const userStr = sessionStorage.getItem("user");
    const storedUser: LoginUser = userStr ? JSON.parse(userStr) : null;
    const decryptedApiKey = storedUser?.apiKey ? decrypt(storedUser.apiKey, secretKey) : null;

    const lostarkRes = await fetch(`/api/lostark?value=${trimmedNickname}&code=5&key=${decryptedApiKey}`);
    if (!lostarkRes.ok) {
        addToast({
            title: "불러오기 오류",
            description: "입력한 캐릭터 정보를 불러오지 못했습니다.",
            color: "danger"
        });
        return null;
    }

    const data = await lostarkRes.json();
    const file: CharacterFile = {
        profile: data.ArmoryProfile,
        equipment: data.ArmoryEquipment,
        gem: data.ArmoryGem?.Gems ?? null,
        cards: data.ArmoryCard,
        stats: data.ArmoryProfile?.Stats ?? null,
        engraving: data.ArmoryEngraving ? data.ArmoryEngraving.ArkPassiveEffects : null,
        arkpassive: data.ArkPassive,
        skills: data.ArmorySkills,
        collects: data.Collectibles,
        avatars: data.ArmoryAvatars,
        arkGrid: data.ArkGrid
    };
    const combatPower = toNumber(file.profile?.CombatPower);

    return getCharacterInfoByFile(file, combatPower);
}

// 비교 화면에서 사용하는 캐릭터 타입으로 데이터를 변환한다.
export function toExpeditionCharacter(info: CharacterInfo | null): ExpeditionCharacter | null {
    if (!info) return null;
    return {
        ...info,
        id: info.nickname,
    };
}

// 캐릭터가 특정 부위 장비를 착용 중인지 조회한다.
function getCharacterEquipment(character: ExpeditionCharacter | null, type: string) {
    return character?.equipment.equipments.find((item) => item.type === type) ?? null;
}

// 무기 등급이 에스더인지 확인한다.
function isEstherEquipment(character: ExpeditionCharacter | null, type: string): boolean {
    return getCharacterEquipment(character, type)?.grade === "에스더";
}

// 장비 이름에 포함된 tier 문자열을 기준으로 장비 기본 레벨을 찾는다.
function getEquipmentStartLevel(name: string): number {
    return data.armoryTiers.find((tier) => name.includes(tier.tier))?.startLevel ?? 0;
}

// 장비 내부 비교값 차이를 UI에 표시할 강화 수치 형식으로 변환한다.
function formatEquipmentDiff(diff: number): string {
    return (diff / 5).toString();
}

// 장비의 실제 비교값을 계산한다. 기본 레벨에 강화 수치와 상급 재련 수치를 더한다.
function getEquipmentCompareValue(character: ExpeditionCharacter | null, type: string): number | null {
    const equipment = getCharacterEquipment(character, type);
    if (!equipment) {
        return null;
    }

    const enhanceLevel = Number(getEnhanceLevel(equipment.name).replace("+", ""));
    if (Number.isNaN(enhanceLevel)) {
        return null;
    }

    return getEquipmentStartLevel(equipment.name) + enhanceLevel * 5 + Math.max(equipment.highUpgrade, 0);
}

// 좌우 캐릭터의 6부위 장비를 비교해서 더 높은 쪽에만 표시할 문구를 만든다.
export function getEquipmentDiffRows(
    leftCharacter: ExpeditionCharacter | null,
    rightCharacter: ExpeditionCharacter | null
): EquipmentDiffRow[] {
    return COMPARE_EQUIPMENT_TYPES.map((type) => {
        const leftEsther = type === "무기" && isEstherEquipment(leftCharacter, type);
        const rightEsther = type === "무기" && isEstherEquipment(rightCharacter, type);

        if (leftEsther !== rightEsther) {
            return {
                type,
                leftText: leftEsther ? `${type} 에스더` : "",
                rightText: rightEsther ? `${type} 에스더` : "",
            };
        }

        const leftValue = getEquipmentCompareValue(leftCharacter, type);
        const rightValue = getEquipmentCompareValue(rightCharacter, type);

        if (leftValue === null || rightValue === null || leftValue === rightValue) {
            return {
                type,
                leftText: "",
                rightText: "",
            };
        }

        const diff = Math.abs(leftValue - rightValue);
        return {
            type,
            leftText: leftValue > rightValue ? `${type} +${formatEquipmentDiff(diff)}` : "",
            rightText: rightValue > leftValue ? `${type} +${formatEquipmentDiff(diff)}` : "",
        };
    });
}

// 악세서리, 팔찌, 스톤 비교 결과를 좌우 표시용 문구로 만든다.
export function getAccessoryDiffRows(
    leftCharacter: ExpeditionCharacter | null,
    rightCharacter: ExpeditionCharacter | null
): EquipmentDiffRow[] {
    const leftAccessories = leftCharacter?.equipment.accessories ?? [];
    const rightAccessories = rightCharacter?.equipment.accessories ?? [];
    const accessoryLength = Math.max(leftAccessories.length, rightAccessories.length);
    const typeCounts: Record<string, number> = {};

    const accessoryRows = Array.from({ length: accessoryLength }, (_, index) => {
        const type = leftAccessories[index]?.type ?? rightAccessories[index]?.type ?? `악세${index + 1}`;
        typeCounts[type] = (typeCounts[type] ?? 0) + 1;
        const label = getAccessoryLineLabel(type, typeCounts[type]);

        const leftValue = getAccessoryCompareValue(leftCharacter, index);
        const rightValue = getAccessoryCompareValue(rightCharacter, index);

        if (leftValue === null || rightValue === null || leftValue === rightValue) {
            return {
                type: `${type}-${index}`,
                leftText: "",
                rightText: "",
            };
        }

        const diff = Math.abs(leftValue - rightValue);
        return {
            type: `${type}-${index}`,
            leftText: leftValue > rightValue ? `${label} +${diff}` : "",
            rightText: rightValue > leftValue ? `${label} +${diff}` : "",
        };
    });

    const leftStoneValue = getStoneCompareValue(leftCharacter);
    const rightStoneValue = getStoneCompareValue(rightCharacter);
    const leftArmValue = getArmCompareValue(leftCharacter);
    const rightArmValue = getArmCompareValue(rightCharacter);
    const extraRows = [];

    if (leftArmValue !== null && rightArmValue !== null && leftArmValue !== rightArmValue) {
        const armDiff = Math.abs(leftArmValue - rightArmValue);
        extraRows.push({
            type: "arm",
            leftText: leftArmValue > rightArmValue ? "팔찌 +" + armDiff : "",
            rightText: rightArmValue > leftArmValue ? "팔찌 +" + armDiff : "",
        });
    }

    if (leftStoneValue !== null && rightStoneValue !== null && leftStoneValue !== rightStoneValue) {
        const stoneDiff = Math.abs(leftStoneValue - rightStoneValue);
        extraRows.push({
            type: "stone",
            leftText: leftStoneValue > rightStoneValue ? `스톤 +${stoneDiff}` : "",
            rightText: rightStoneValue > leftStoneValue ? `스톤 +${stoneDiff}` : "",
        });
    }

    return [...accessoryRows, ...extraRows];
}

// 공격력, 최대 생명력, 강조 특성 합 비교 결과를 문구로 만든다.
export function getStatDiffRows(
    leftCharacter: ExpeditionCharacter | null,
    rightCharacter: ExpeditionCharacter | null
): EquipmentDiffRow[] {
    const rows = [
        {
            type: "attack-power",
            label: "공격력",
            leftValue: getStatValue(leftCharacter, "공격력"),
            rightValue: getStatValue(rightCharacter, "공격력"),
        },
        {
            type: "max-hp",
            label: "최대 생명력",
            leftValue: getStatValue(leftCharacter, "최대 생명력"),
            rightValue: getStatValue(rightCharacter, "최대 생명력"),
        },
        {
            type: "highlighted-stats",
            label: "주특성 합",
            leftValue: getHighlightedStatSum(leftCharacter),
            rightValue: getHighlightedStatSum(rightCharacter),
        },
    ];

    return rows.map(({ type, label, leftValue, rightValue }) => {
        if (leftValue === null || rightValue === null || leftValue === rightValue) {
            return {
                type,
                leftText: "",
                rightText: "",
            };
        }

        const diff = Math.abs(leftValue - rightValue);
        return {
            type,
            leftText: leftValue > rightValue ? `${label} +${diff.toLocaleString()}` : "",
            rightText: rightValue > leftValue ? `${label} +${diff.toLocaleString()}` : "",
        };
    });
}

// 카르마 설명 문자열에서 각 타입의 실제 레벨 수치를 추출한다.
function getKarmaLevelValue(character: ExpeditionCharacter | null, type: string): number | null {
    const description = character?.arkpassive.points.find((point) => point.type === type)?.description;
    if (!description) {
        return null;
    }

    const numbers = description.match(/\d+/g);
    if (!numbers || numbers.length < 2) {
        return null;
    }

    return Number(numbers[numbers.length - 1]);
}

// 카르마 타입별 포인트 수치를 찾아 비교값으로 반환한다.
function getKarmaPointValue(character: ExpeditionCharacter | null, type: string): number | null {
    return character?.arkpassive.points.find((point) => point.type === type)?.point ?? null;
}

// 카르마 레벨 차이와 포인트 차이를 각각 분리해 비교용 문구로 만든다.
export function getKarmaDiffRows(
    leftCharacter: ExpeditionCharacter | null,
    rightCharacter: ExpeditionCharacter | null
): { levelRows: EquipmentDiffRow[]; pointRows: EquipmentDiffRow[] } {
    const karmaTypes = ["진화", "깨달음", "도약"];

    const levelRows = karmaTypes.map((type) => {
        const leftValue = getKarmaLevelValue(leftCharacter, type);
        const rightValue = getKarmaLevelValue(rightCharacter, type);

        if (leftValue === null || rightValue === null || leftValue === rightValue) {
            return {
                type: `${type}-level`,
                leftText: "",
                rightText: "",
            };
        }

        const diff = Math.abs(leftValue - rightValue);
        return {
            type: `${type}-level`,
            leftText: leftValue > rightValue ? `${type} 레벨 +${diff}` : "",
            rightText: rightValue > leftValue ? `${type} 레벨 +${diff}` : "",
        };
    });

    const pointRows = karmaTypes.map((type) => {
        const leftValue = getKarmaPointValue(leftCharacter, type);
        const rightValue = getKarmaPointValue(rightCharacter, type);

        if (leftValue === null || rightValue === null || leftValue === rightValue) {
            return {
                type: `${type}-point`,
                leftText: "",
                rightText: "",
            };
        }

        const diff = Math.abs(leftValue - rightValue);
        return {
            type: `${type}-point`,
            leftText: leftValue > rightValue ? `${type} 포인트 +${diff}` : "",
            rightText: rightValue > leftValue ? `${type} 포인트 +${diff}` : "",
        };
    });

    return { levelRows, pointRows };
}

// 각인 등급 보정을 포함한 총합 차이를 비교용 문구로 만든다.
export function getEngravingDiffRows(
    leftCharacter: ExpeditionCharacter | null,
    rightCharacter: ExpeditionCharacter | null
): EquipmentDiffRow[] {
    const leftValue = leftCharacter?.engravings.reduce(
        (sum, engraving) => sum + engraving.level + (ENGRAVING_GRADE_OFFSET[engraving.grade] ?? 0),
        0
    ) ?? null;
    const rightValue = rightCharacter?.engravings.reduce(
        (sum, engraving) => sum + engraving.level + (ENGRAVING_GRADE_OFFSET[engraving.grade] ?? 0),
        0
    ) ?? null;

    if (leftValue === null || rightValue === null || leftValue === rightValue) {
        return [{
            type: "engraving-level",
            leftText: "",
            rightText: "",
        }];
    }

    const diff = Math.abs(leftValue - rightValue);
    return [{
        type: "engraving-level",
        leftText: leftValue > rightValue ? `각인 합 +${diff}` : "",
        rightText: rightValue > leftValue ? `각인 합 +${diff}` : "",
    }];
}

// 보석 이름을 기준으로 4티어 여부를 판별해 비교용 레벨을 환산한다.
function getGemCompareLevel(name: string, level: number): number {
    return TIER4_GEM_KEYWORDS.some((keyword) => name.includes(keyword)) ? level + 2 : level;
}

// 보석 레벨 총합과 기본 공격력 합 차이를 비교용 문구로 만든다.
export function getGemDiffRows(
    leftCharacter: ExpeditionCharacter | null,
    rightCharacter: ExpeditionCharacter | null
): { levelRows: EquipmentDiffRow[]; attackRows: EquipmentDiffRow[] } {
    const leftLevelValue = leftCharacter?.gems.reduce((sum, gem) => sum + getGemCompareLevel(gem.name, gem.level), 0) ?? null;
    const rightLevelValue = rightCharacter?.gems.reduce((sum, gem) => sum + getGemCompareLevel(gem.name, gem.level), 0) ?? null;
    const leftAttackValue = leftCharacter?.gems.reduce((sum, gem) => sum + gem.attack, 0) ?? null;
    const rightAttackValue = rightCharacter?.gems.reduce((sum, gem) => sum + gem.attack, 0) ?? null;

    const levelRows = [{
        type: "gem-level",
        leftText:
            leftLevelValue !== null && rightLevelValue !== null && leftLevelValue > rightLevelValue
                ? `보석 레벨 합 +${leftLevelValue - rightLevelValue}`
                : "",
        rightText:
            leftLevelValue !== null && rightLevelValue !== null && rightLevelValue > leftLevelValue
                ? `보석 레벨 합 +${rightLevelValue - leftLevelValue}`
                : "",
    }];

    const attackRows = [{
        type: "gem-attack",
        leftText:
            leftAttackValue !== null && rightAttackValue !== null && leftAttackValue > rightAttackValue
                ? `기본 공격력 +${(leftAttackValue - rightAttackValue).toFixed(1)}%`
                : "",
        rightText:
            leftAttackValue !== null && rightAttackValue !== null && rightAttackValue > leftAttackValue
                ? `기본 공격력 +${(rightAttackValue - leftAttackValue).toFixed(1)}%`
                : "",
    }];

    return { levelRows, attackRows };
}

// 캐릭터 타입에 맞게 아크그리드 옵션 중 비교 대상만 추려낸다.
function getFilteredArkgridOptions(character: ExpeditionCharacter | null) {
    if (!character) {
        return [];
    }

    if (character.profile.characterType === "attack") {
        return character.arkgrid.options.filter((item) => ATTACK_ARKGRID_OPTION_NAMES.includes(item.name));
    }

    return character.arkgrid.options.filter((item) => !ATTACK_ARKGRID_OPTION_NAMES.includes(item.name));
}

// 아크그리드 코어 등급 합과 옵션 레벨 합 차이를 비교용 문구로 만든다.
export function getArkgridDiffRows(
    leftCharacter: ExpeditionCharacter | null,
    rightCharacter: ExpeditionCharacter | null
): { coreRows: EquipmentDiffRow[]; optionRows: EquipmentDiffRow[] } {
    const leftCoreValue = leftCharacter?.arkgrid.cores.reduce((sum, core) => sum + (ARKGRID_CORE_GRADE_SCORE[core.grade] ?? 0), 0) ?? null;
    const rightCoreValue = rightCharacter?.arkgrid.cores.reduce((sum, core) => sum + (ARKGRID_CORE_GRADE_SCORE[core.grade] ?? 0), 0) ?? null;
    const leftOptionValue = getFilteredArkgridOptions(leftCharacter).reduce((sum, item) => sum + item.level, 0);
    const rightOptionValue = getFilteredArkgridOptions(rightCharacter).reduce((sum, item) => sum + item.level, 0);

    const coreRows = [{
        type: "arkgrid-core",
        leftText:
            leftCoreValue !== null && rightCoreValue !== null && leftCoreValue > rightCoreValue
                ? `코어 +${leftCoreValue - rightCoreValue}`
                : "",
        rightText:
            leftCoreValue !== null && rightCoreValue !== null && rightCoreValue > leftCoreValue
                ? `코어 +${rightCoreValue - leftCoreValue}`
                : "",
    }];

    const optionRows = [{
        type: "arkgrid-option",
        leftText:
            leftCharacter && rightCharacter && leftOptionValue > rightOptionValue
                ? `효과 +${leftOptionValue - rightOptionValue}`
                : "",
        rightText:
            leftCharacter && rightCharacter && rightOptionValue > leftOptionValue
                ? `효과 +${rightOptionValue - leftOptionValue}`
                : "",
    }];

    return { coreRows, optionRows };
}

// 카르마 이름 색상
export function getColorChipByKarmaType(type: string): "primary" | "success" | "warning" | "default" {
    switch(type) {
        case '진화': return 'warning';
        case '깨달음': return 'primary';
        case '도약': return 'success';
    }
    return 'default';
}
