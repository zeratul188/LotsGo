import axios from 'axios';
import {
    createEmptyGemLevelPrice,
    GEM_LEVELS,
    GemPriceData
} from '../model/types';

const LOSTARK_AUCTION_URL = 'https://developer-lostark.game.onstove.com/auctions/items';
const GEM_CATEGORY_CODE = 210000;

type AuctionItem = {
    Name?: string;
    Icon?: string;
    Grade?: string;
    AuctionInfo?: {
        BuyPrice?: number;
    };
};

type AuctionResponse = {
    Items?: AuctionItem[];
};

function getLowerPrice(current: { price: number | null; icon: string | null; grade: string | null; name: string | null }, item: AuctionItem) {
    const price = Number(item.AuctionInfo?.BuyPrice);
    if (!Number.isFinite(price) || price <= 0) return current;
    if (current.price !== null && current.price <= price) return current;

    return {
        price,
        icon: typeof item.Icon === 'string' ? item.Icon : null,
        grade: typeof item.Grade === 'string' ? item.Grade : null,
        name: typeof item.Name === 'string' ? item.Name : null
    };
}

async function loadGemAuctionPrice(apiKey: string, level: number, kind: '겁화' | '작열') {
    const response = await axios.post<AuctionResponse>(
        LOSTARK_AUCTION_URL,
        {
            Sort: 'BUY_PRICE',
            CategoryCode: GEM_CATEGORY_CODE,
            CharacterClass: null,
            ItemTier: 4,
            ItemGrade: null,
            ItemLevel: null,
            ItemName: `${level}레벨 ${kind}의 보석`,
            PageNo: 0,
            SortCondition: 'ASC'
        },
        {
            headers: {
                Authorization: `Bearer ${apiKey}`,
                Accept: 'application/json',
                'Content-Type': 'application/json'
            },
            timeout: 15000
        }
    );

    let result = createEmptyGemLevelPrice()[kind === '겁화' ? 'damage' : 'cooldown'];
    for (const item of response.data.Items ?? []) {
        result = getLowerPrice(result, item);
    }

    return result;
}

export async function loadGemPriceData(apiKey: string): Promise<GemPriceData> {
    const entries = await Promise.all(
        GEM_LEVELS.map(async (level) => {
            const [damage, cooldown] = await Promise.all([
                loadGemAuctionPrice(apiKey, level, '겁화'),
                loadGemAuctionPrice(apiKey, level, '작열')
            ]);
            const prices = [damage.price, cooldown.price].filter((price): price is number => price !== null);
            return [String(level), {
                lowestPrice: prices.length > 0 ? Math.min(...prices) : null,
                damage,
                cooldown
            }] as const;
        })
    );

    const levels = Object.fromEntries(entries);
    return {
        version: 1,
        updatedAt: Date.now(),
        levels
    };
}
