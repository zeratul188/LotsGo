import axios from 'axios';
import { createEmptyHoningMaterialPrice, HONING_MATERIALS, HoningMaterialPriceData } from '../model/types';

const LOSTARK_MARKET_URL = 'https://developer-lostark.game.onstove.com/markets/items';
const MARKET_CATEGORY_CODE = 50000;

type MarketItem = {
    Name?: string;
    Icon?: string;
    Grade?: string;
    BundleCount?: number;
    CurrentMinPrice?: number;
};

type MarketResponse = { Items?: MarketItem[] };

async function loadMaterialPrice(apiKey: string, material: typeof HONING_MATERIALS[number]) {
    const response = await axios.post<MarketResponse>(LOSTARK_MARKET_URL, {
        Sort: 'CURRENT_MIN_PRICE',
        CategoryCode: MARKET_CATEGORY_CODE,
        CharacterClass: null,
        ItemTier: 4,
        ItemGrade: null,
        ItemName: material.name,
        PageNo: 1,
        SortCondition: 'ASC'
    }, {
        headers: {
            Authorization: `Bearer ${apiKey}`,
            Accept: 'application/json',
            'Content-Type': 'application/json'
        },
        timeout: 15000
    });

    const matchingItems = (response.data.Items ?? [])
        .filter((item) => item.Name === material.name)
        .filter((item) => Number.isFinite(Number(item.CurrentMinPrice)) && Number(item.CurrentMinPrice) > 0);
    const lowest = matchingItems.reduce<MarketItem | null>((current, item) => {
        if (!current || Number(item.CurrentMinPrice) < Number(current.CurrentMinPrice)) return item;
        return current;
    }, null);

    if (!lowest) return createEmptyHoningMaterialPrice(material.name);

    return {
        name: material.name,
        price: Number(lowest.CurrentMinPrice),
        bundleCount: Number(lowest.BundleCount) > 0 ? Number(lowest.BundleCount) : 1,
        unitPrice: null,
        icon: typeof lowest.Icon === 'string' ? lowest.Icon : null,
        grade: typeof lowest.Grade === 'string' ? lowest.Grade : null
    };
}

export async function loadHoningMaterialPriceData(apiKey: string): Promise<HoningMaterialPriceData> {
    const entries = await Promise.all(HONING_MATERIALS.map(async (material) => {
        const price = await loadMaterialPrice(apiKey, material);
        return [material.key, price] as const;
    }));

    return {
        version: 1,
        updatedAt: Date.now(),
        items: Object.fromEntries(entries)
    } as HoningMaterialPriceData;
}
