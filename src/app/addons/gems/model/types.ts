export const GEM_LEVELS = [5, 6, 7, 8, 9, 10] as const;

export type GemLevel = typeof GEM_LEVELS[number];
export type GemKind = '겁화' | '작열';

export type GemPrice = {
    price: number | null;
    icon: string | null;
    grade: string | null;
    name: string | null;
};

export type GemLevelPrice = {
    lowestPrice: number | null;
    damage: GemPrice;
    cooldown: GemPrice;
};

export type GemPriceData = {
    version: 1;
    updatedAt: number;
    levels: Record<string, GemLevelPrice>;
};

export const EMPTY_GEM_PRICE: GemPrice = {
    price: null,
    icon: null,
    grade: null,
    name: null
};

export function createEmptyGemLevelPrice(): GemLevelPrice {
    return {
        lowestPrice: null,
        damage: { ...EMPTY_GEM_PRICE },
        cooldown: { ...EMPTY_GEM_PRICE }
    };
}

function normalizePrice(value: unknown): number | null {
    const price = Number(value);
    return Number.isFinite(price) && price > 0 ? price : null;
}

function normalizeGemPrice(value: unknown): GemPrice {
    if (!value || typeof value !== 'object') {
        return { ...EMPTY_GEM_PRICE };
    }

    const item = value as Record<string, unknown>;
    return {
        price: normalizePrice(item.price),
        icon: typeof item.icon === 'string' ? item.icon : null,
        grade: typeof item.grade === 'string' ? item.grade : null,
        name: typeof item.name === 'string' ? item.name : null
    };
}

export function normalizeGemPriceData(value: unknown): GemPriceData | null {
    if (!value || typeof value !== 'object') return null;

    const data = value as Record<string, unknown>;
    const updatedAt = Number(data.updatedAt);
    if (data.version !== 1 || !Number.isFinite(updatedAt) || !data.levels || typeof data.levels !== 'object') {
        return null;
    }

    const sourceLevels = data.levels as Record<string, unknown>;
    const levels: Record<string, GemLevelPrice> = {};

    for (const level of GEM_LEVELS) {
        const source = sourceLevels[String(level)];
        const levelData = source && typeof source === 'object' ? source as Record<string, unknown> : {};
        const damage = normalizeGemPrice(levelData.damage);
        const cooldown = normalizeGemPrice(levelData.cooldown);
        const prices = [damage.price, cooldown.price].filter((price): price is number => price !== null);

        levels[String(level)] = {
            lowestPrice: prices.length > 0 ? Math.min(...prices) : null,
            damage,
            cooldown
        };
    }

    return { version: 1, updatedAt, levels };
}

export function getGemPrice(levelData: GemLevelPrice, kind: GemKind): GemPrice {
    return kind === '겁화' ? levelData.damage : levelData.cooldown;
}
