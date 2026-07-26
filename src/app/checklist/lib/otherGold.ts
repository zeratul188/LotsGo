import type { CheckCharacter } from "@/app/store/checklistSlice";
import {
    OTHER_GOLD_ICON_TYPES,
    OtherGoldIconType,
    OtherGoldRecord
} from "@/app/checklist/model/types";

export const OTHER_GOLD_PRESETS: {
    icon: OtherGoldIconType;
    label: string;
    source: string;
    image: string;
}[] = [
    { icon: "other", label: "기타", source: "", image: "/icons/other-gold/other.png" },
    { icon: "fate-ember", label: "편린", source: "편린 획득", image: "/icons/other-gold/fate-ember.png" },
    { icon: "relic-engraving", label: "유물 각인서", source: "유물 각인서 판매", image: "/icons/other-gold/relic-engraving.png" },
    { icon: "bracelet-sale", label: "팔찌 판매", source: "팔찌 판매", image: "/icons/other-gold/bracelet-sale.png" },
    { icon: "accessory-sale", label: "악세 판매", source: "악세서리 판매", image: "/icons/other-gold/accessory-sale.png" },
    { icon: "auction-share", label: "경매 분배금", source: "경매의 분배금", image: "/icons/other-gold/auction-share.png" }
];

const iconTypeSet = new Set<string>(OTHER_GOLD_ICON_TYPES);

export function isOtherGoldIconType(value: unknown): value is OtherGoldIconType {
    return typeof value === "string" && iconTypeSet.has(value);
}

export function getOtherGoldPreset(icon: OtherGoldIconType) {
    return OTHER_GOLD_PRESETS.find((preset) => preset.icon === icon) ?? OTHER_GOLD_PRESETS[0];
}

export function normalizeOtherGoldRecords(value: unknown, legacyOtherGold: unknown): OtherGoldRecord[] {
    if (Array.isArray(value)) {
        return value.flatMap((rawRecord, index) => {
            if (!rawRecord || typeof rawRecord !== "object") return [];
            const record = rawRecord as Partial<OtherGoldRecord>;
            const gold = Number(record.gold);
            if (!Number.isFinite(gold) || gold === 0) return [];

            return [{
                id: typeof record.id === "string" && record.id
                    ? record.id
                    : `legacy-record-${index}`,
                icon: isOtherGoldIconType(record.icon) ? record.icon : "other",
                source: typeof record.source === "string" ? record.source.trim() : "",
                createdAt: typeof record.createdAt === "string" && record.createdAt
                    ? record.createdAt
                    : null,
                gold: Math.trunc(gold)
            }];
        });
    }

    const legacyGold = Number(legacyOtherGold);
    if (!Number.isFinite(legacyGold) || legacyGold === 0) return [];

    return [{
        id: "legacy-other-gold",
        icon: "other",
        source: "",
        createdAt: null,
        gold: Math.trunc(legacyGold)
    }];
}

export function getOtherGoldTotal(character: Pick<CheckCharacter, "otherGold" | "otherGoldRecords">): number {
    if (Array.isArray(character.otherGoldRecords)) {
        return character.otherGoldRecords.reduce((sum, record) => sum + (Number(record.gold) || 0), 0);
    }
    return Number(character.otherGold) || 0;
}

export function getOtherGoldContributionTotal(records: OtherGoldRecord[]): number {
    return records.reduce((sum, record) => sum + Math.abs(record.gold), 0);
}

export type CharacterOtherGoldRecord = OtherGoldRecord & {
    nickname: string;
    job: string;
};

export function getAllOtherGoldRecords(checklist: CheckCharacter[]): CharacterOtherGoldRecord[] {
    return checklist
        .flatMap((character) => normalizeOtherGoldRecords(
            character.otherGoldRecords,
            character.otherGold
        ).map((record) => ({
            ...record,
            nickname: character.nickname,
            job: character.job
        })))
        .sort((a, b) => {
            if (!a.createdAt && !b.createdAt) return 0;
            if (!a.createdAt) return 1;
            if (!b.createdAt) return -1;
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
}

export function formatOtherGoldDate(createdAt: string | null): string {
    if (!createdAt) return "기록 시각 없음";
    const date = new Date(createdAt);
    if (Number.isNaN(date.getTime())) return "기록 시각 없음";
    return new Intl.DateTimeFormat("ko-KR", {
        timeZone: "Asia/Seoul",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false
    }).format(date);
}
