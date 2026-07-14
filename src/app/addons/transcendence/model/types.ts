export const EQUIPMENTS = ["투구", "견갑", "상의", "하의", "장갑", "무기"] as const;
export type Equipment = (typeof EQUIPMENTS)[number];
export type TranscendenceGrade = 0 | 1 | 2 | 3;
export type TranscendenceProgress = Record<Equipment, TranscendenceGrade[]>;

export const createEmptyTranscendenceProgress = (): TranscendenceProgress =>
    Object.fromEntries(EQUIPMENTS.map((equipment) => [equipment, Array<TranscendenceGrade>(7).fill(0)])) as TranscendenceProgress;

export const normalizeTranscendenceProgress = (value: unknown): TranscendenceProgress => {
    const source = value && typeof value === "object" ? value as Record<string, unknown> : {};
    return Object.fromEntries(EQUIPMENTS.map((equipment) => {
        const stages = Array.isArray(source[equipment]) ? source[equipment] : [];
        const normalized = Array.from({ length: 7 }, (_, index) => {
            const grade = Number(stages[index]);
            return Number.isInteger(grade) && grade >= 0 && grade <= 3 ? grade as TranscendenceGrade : 0;
        });
        return [equipment, normalized];
    })) as TranscendenceProgress;
};

export const DEFAULT_SPIRITS = [
    "업화", "대폭발", "벼락", "낙뢰", "용오름",
    "충격파", "지진", "해일", "폭풍우", "정화",
] as const;
export const MYSTERY_SPIRITS = ["분출", "세계수의 공명"] as const;
export type SpiritName = (typeof DEFAULT_SPIRITS)[number] | (typeof MYSTERY_SPIRITS)[number];
export type SpiritLevel = 1 | 2 | 3;
export type SpiritElement = "default" | "earth" | "water" | "fire" | "lightning" | "light";
export type Position = { row: number; col: number };
export type BaseTile = "normal" | "distorted";
export type SpecialTile = "추가" | "재배치" | "축복" | "신비" | "강화" | "복제";

export type Tile = {
    base: BaseTile;
    special?: SpecialTile;
};

export type SpiritCard = {
    name: SpiritName;
    level: SpiritLevel;
    id: string;
};

export type StagePreset = {
    try: number;
    change: number;
    blocks: (0 | 1 | 2)[][];
};

export type EquipmentPreset = {
    equipment: Equipment;
    setting: StagePreset[];
};

export type PreviewCell = Position & {
    chance: number;
    distorted: boolean;
};

export type GameState = {
    equipment: Equipment;
    stage: number;
    preset: StagePreset;
    board: (Tile | null)[][];
    cards: [SpiritCard, SpiritCard];
    upcoming: SpiritCard[];
    usedTurns: number;
    remainingChanges: number;
    selectedCardIndex: 0 | 1 | null;
    specialPosition: Position | null;
    completedGrade: 0 | 1 | 2 | 3 | null;
};
