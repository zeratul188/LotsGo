export const ELIXIR_PARTS = ["투구", "어깨", "상의", "하의", "장갑"] as const;
export const ELIXIR_TOTAL_TURNS = 10;
export type ElixirPart = (typeof ELIXIR_PARTS)[number];
export type EffectCategory = "공용" | `${ElixirPart} 전용`;

export type ElixirEffectDefinition = {
    name: string;
    category: EffectCategory;
    weight: number;
};

export type ElixirSlot = {
    effect: ElixirEffectDefinition;
    points: number;
    probability: number;
    probabilityWeight: number;
    greatSuccess: number;
    sealed: boolean;
};

export type SageAlignment = "order" | "chaos" | null;
export type SageState = {
    alignment: SageAlignment;
    stack: number;
    exhausted: boolean;
};

export type AdviceKind =
    | "probability"
    | "greatSuccess"
    | "forgeFixed"
    | "forgeSelected"
    | "freeTurn"
    | "stageRange"
    | "stageChance"
    | "stageRandom"
    | "stageLowest"
    | "stageHighest"
    | "shuffle"
    | "redistribute"
    | "rotateUp"
    | "rotateDown"
    | "swap"
    | "forgeAmount"
    | "simultaneous"
    | "refresh"
    | "cost"
    | "sealFixed"
    | "sealSelected"
    | "unsealAndSeal"
    | "reset"
    | "changeEffect"
    | "distributeSelected"
    | "distributeLowest"
    | "distributeHighest"
    | "exhaustSage"
    | "exhausted";

export type Advice = {
    id: string;
    text: string;
    weight: number;
    conditions?: number[];
    group?: string;
    kind: AdviceKind;
    target?: number | "selected";
    otherTarget?: number;
    amount?: number;
    chance?: number;
    persistent?: boolean;
    sealFirst?: boolean;
};

export type AdviceOffer = Advice & {
    sageIndex: number;
    special: SageAlignment | "seal" | null;
    disabled?: boolean;
};

export type ElixirTurnPlan = {
    sageIndex: number;
    probabilities: number[];
    forcedTarget: number | null;
    forgeCount: number;
    forgeAmount: number;
    freeTurn: boolean;
    forceNormalNext: boolean;
};

export type ElixirSlotChange = {
    index: number;
    pointsDelta: number;
    probabilityDelta: number;
    greatSuccessDelta: number;
    sealChanged: boolean;
};

export type ElixirPhase = "effects" | "forging" | "finalizing" | "complete";
export type ElixirGame = {
    phase: ElixirPhase;
    selectedEffects: ElixirEffectDefinition[];
    effectOptions: ElixirEffectDefinition[];
    slots: ElixirSlot[];
    turnsRemaining: number;
    refreshes: number;
    sages: [SageState, SageState, SageState];
    advices: AdviceOffer[];
    selectedAdvice: AdviceOffer | null;
    turnPlan: ElixirTurnPlan | null;
    previousAdviceIds: string[];
    costReduction: number;
    forceNormalAdvice: boolean;
    notice: string;
    resultMessages: string[];
    lastChanges: ElixirSlotChange[];
    greatSuccessSlots: number[];
    animationId: number;
};

export type StoredElixirEffect = {
    name: string;
    category: EffectCategory;
    points: number;
    level: number;
};

export type StoredElixir = {
    id: string;
    createdAt: number;
    effects: [StoredElixirEffect, StoredElixirEffect];
};

export type PartElixirStorage = {
    slots: [StoredElixir | null, StoredElixir | null, StoredElixir | null];
    selected: number | null;
};

export type ElixirStorage = Record<ElixirPart, PartElixirStorage>;

export const elixirLevel = (points: number) => {
    if (points >= 10) return 5;
    if (points >= 9) return 4;
    if (points >= 8) return 3;
    if (points >= 6) return 2;
    if (points >= 3) return 1;
    return 0;
};

export const createEmptyElixirStorage = (): ElixirStorage => Object.fromEntries(
    ELIXIR_PARTS.map((part) => [part, { slots: [null, null, null], selected: null }]),
) as ElixirStorage;

const isCategory = (value: unknown): value is EffectCategory =>
    value === "공용" || ELIXIR_PARTS.some((part) => value === `${part} 전용`);

const normalizeEffect = (value: unknown): StoredElixirEffect | null => {
    if (!value || typeof value !== "object") return null;
    const source = value as Record<string, unknown>;
    const points = Math.max(0, Math.min(10, Math.floor(Number(source.points))));
    if (typeof source.name !== "string" || !isCategory(source.category) || !Number.isFinite(points)) return null;
    return { name: source.name, category: source.category, points, level: elixirLevel(points) };
};

const normalizeStoredElixir = (value: unknown): StoredElixir | null => {
    if (!value || typeof value !== "object") return null;
    const source = value as Record<string, unknown>;
    if (!Array.isArray(source.effects) || source.effects.length !== 2) return null;
    const effects = source.effects.map(normalizeEffect);
    if (!effects[0] || !effects[1]) return null;
    return {
        id: typeof source.id === "string" ? source.id : `elixir-${Date.now()}`,
        createdAt: Number.isFinite(Number(source.createdAt)) ? Number(source.createdAt) : Date.now(),
        effects: [effects[0], effects[1]],
    };
};

export const normalizeElixirStorage = (value: unknown): ElixirStorage => {
    const source = value && typeof value === "object" ? value as Record<string, unknown> : {};
    return Object.fromEntries(ELIXIR_PARTS.map((part) => {
        const partSource = source[part] && typeof source[part] === "object"
            ? source[part] as Record<string, unknown>
            : {};
        const sourceSlots = Array.isArray(partSource.slots) ? partSource.slots : [];
        const slots = Array.from({ length: 3 }, (_, index) => normalizeStoredElixir(sourceSlots[index])) as PartElixirStorage["slots"];
        const selectedSource = partSource.selected;
        const selectedValue = typeof selectedSource === "number"
            ? selectedSource
            : typeof selectedSource === "string" && selectedSource.trim() !== ""
                ? Number(selectedSource)
                : Number.NaN;
        const selected = Number.isInteger(selectedValue) && selectedValue >= 0 && selectedValue < 3 && slots[selectedValue]
            ? selectedValue
            : null;
        return [part, { slots, selected }];
    })) as ElixirStorage;
};
