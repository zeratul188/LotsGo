import { addToast } from "@heroui/react";
import { decrypt } from "@/utiils/crypto";
import { LoginUser } from "@/app/store/loginSlice";
import { CharacterInfo } from "../../model/types";
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

function getStatValue(character: ExpeditionCharacter | null, type: string): number | null {
    return character?.stats.find((stat) => stat.type === type)?.value ?? null;
}

function getHighlightedStatSum(character: ExpeditionCharacter | null): number | null {
    if (!character) {
        return null;
    }

    return character.stats
        .filter((stat) => stat.type !== "공격력" && stat.type !== "최대 생명력" && stat.value >= 300)
        .reduce((sum, stat) => sum + stat.value, 0);
}

function getAccessoryLineLabel(type: string, index: number): string {
    if (type === "귀걸이" || type === "반지") {
        return `${type}${index}`;
    }

    return type;
}

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

function getStoneCompareValue(character: ExpeditionCharacter | null): number | null {
    const stone = character?.equipment.stone;
    if (!stone || stone.effects.length === 0) {
        return null;
    }

    return stone.effects.slice(0, 3).reduce((sum, effect, index) => {
        return sum + (index === 2 ? -effect.level : effect.level);
    }, 0);
}

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

function getKarmaPointValue(character: ExpeditionCharacter | null, type: string): number | null {
    return character?.arkpassive.points.find((point) => point.type === type)?.point ?? null;
}

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

// 카르마 이름 색상
export function getColorChipByKarmaType(type: string): "primary" | "success" | "warning" | "default" {
    switch(type) {
        case '진화': return 'warning';
        case '깨달음': return 'primary';
        case '도약': return 'success';
    }
    return 'default';
}
