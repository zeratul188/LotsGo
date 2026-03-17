import { SetStateFn } from "@/utiils/utils";
import { ExpeditionCharacter } from "../model/types";
import data from "@/data/characters/data.json";

type EquipmentColor = "warning" | "primary" | "danger" | "secondary" | "default" | "success";
const EQUIPMENT_COLORS: readonly EquipmentColor[] = ["warning", "primary", "danger", "secondary", "default", "success"];

function isEquipmentColor(color: unknown): color is EquipmentColor {
    return typeof color === "string" && EQUIPMENT_COLORS.includes(color as EquipmentColor);
}

// 원정대 캐릭터 데이터 가져오기
type LoadCharacterListResponse = {
    expeditionCharacters?: ExpeditionCharacter[]
}
export async function fetchCharacterList(characterName: string): Promise<ExpeditionCharacter[]> {
    const res = await fetch(`/api/characterlist?characterName=${encodeURIComponent(characterName)}`);
    if (!res.ok) {
        return [];
    }

    const data: LoadCharacterListResponse = await res.json();
    return [...(data.expeditionCharacters ?? [])].sort(
        (a, b) => b.profile.itemLevel - a.profile.itemLevel
    );
}

export async function loadCharacterList(
    characterName: string, 
    setExpeditionCharacters: SetStateFn<ExpeditionCharacter[]>,
    setLoading: SetStateFn<boolean>
) {
    setLoading(true);
    const characters = await fetchCharacterList(characterName);
    setExpeditionCharacters(characters);
    setLoading(false);
}

// 장비 이름으로 계승 단계 가져오기
export function getTitleByEquipmentName(name: string): string {
    return data.armoryTiers.find(tier => name.includes(tier.tier))?.title ?? '-';
}

// 장비 이름으로 계승 색상 가져오기
export function getColorByEquipmentName(name: string): EquipmentColor {
    const color = data.armoryTiers.find(tier => name.includes(tier.tier))?.color;
    return isEquipmentColor(color) ? color : "default";
}
