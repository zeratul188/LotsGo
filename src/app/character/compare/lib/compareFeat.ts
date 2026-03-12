import { addToast } from "@heroui/react";
import { decrypt } from "@/utiils/crypto";
import { LoginUser } from "@/app/store/loginSlice";
import { CharacterInfo } from "../../model/types";
import { CharacterFile } from "../../lib/characterFeat";
import { getCharacterInfoByFile, toNumber } from "../../lib/characterInfo";
import { ExpeditionCharacter } from "../../characterlist/model/types";
import data from "@/data/characters/data.json";
import { getEnhanceLevel } from "../../characterlist/lib/characterInfoFeat";

const secretKey = process.env.NEXT_PUBLIC_SECRET_KEY ? process.env.NEXT_PUBLIC_SECRET_KEY : "null";
const COMPARE_EQUIPMENT_TYPES = ["무기", "투구", "어깨", "장갑", "상의", "하의"] as const;

export type EquipmentDiffRow = {
    type: string;
    leftText: string;
    rightText: string;
};

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

// 장비 이름에 포함된 tier 문자열을 기준으로 계승 단계를 찾는다.
function getEquipmentTierLevel(name: string): number {
    return data.armoryTiers.find((tier) => name.includes(tier.tier))?.level ?? 0;
}

// 장비의 실제 비교값을 계산한다. 계승 단계 1당 강화 9와 같은 가치로 환산한다.
function getEquipmentCompareValue(character: ExpeditionCharacter | null, type: string): number | null {
    const equipment = getCharacterEquipment(character, type);
    if (!equipment) {
        return null;
    }

    const enhanceLevel = Number(getEnhanceLevel(equipment.name).replace("+", ""));
    if (Number.isNaN(enhanceLevel)) {
        return null;
    }

    return enhanceLevel + getEquipmentTierLevel(equipment.name) * 9;
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
            leftText: leftValue > rightValue ? `${type} +${diff}` : "",
            rightText: rightValue > leftValue ? `${type} +${diff}` : "",
        };
    });
}
