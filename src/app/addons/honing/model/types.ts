export const HONING_MATERIALS = [
    { key: 'destiny-shard-pouch-large', name: '운명의 파편 주머니(대)', group: '기본 재료', divisor: 3000, unitLabel: '파편 1개당' },
    { key: 'destiny-destruction-stone', name: '운명의 파괴석', group: '기본 재료', divisor: null, unitLabel: '개당' },
    { key: 'destiny-destruction-crystal', name: '운명의 파괴석 결정', group: '기본 재료', divisor: null, unitLabel: '개당' },
    { key: 'destiny-guardian-stone', name: '운명의 수호석', group: '기본 재료', divisor: null, unitLabel: '개당' },
    { key: 'destiny-guardian-crystal', name: '운명의 수호석 결정', group: '기본 재료', divisor: null, unitLabel: '개당' },
    { key: 'destiny-leapstone', name: '운명의 돌파석', group: '기본 재료', divisor: null, unitLabel: '개당' },
    { key: 'great-destiny-leapstone', name: '위대한 운명의 돌파석', group: '기본 재료', divisor: null, unitLabel: '개당' },
    { key: 'abidos-fusion-material', name: '아비도스 융화 재료', group: '기본 재료', divisor: null, unitLabel: '개당' },
    { key: 'superior-abidos-fusion-material', name: '상급 아비도스 융화 재료', group: '기본 재료', divisor: null, unitLabel: '개당' },
    { key: 'lava-breath', name: '용암의 숨결', group: '추가 재료', divisor: null, unitLabel: '개당' },
    { key: 'glacier-breath', name: '빙하의 숨결', group: '추가 재료', divisor: null, unitLabel: '개당' },
    { key: 'tailoring-upheaval-11-14', name: '재봉술 : 업화 [11-14]', group: '재봉술', divisor: null, unitLabel: '개당' },
    { key: 'tailoring-upheaval-15-18', name: '재봉술 : 업화 [15-18]', group: '재봉술', divisor: null, unitLabel: '개당' },
    { key: 'tailoring-upheaval-19-20', name: '재봉술 : 업화 [19-20]', group: '재봉술', divisor: null, unitLabel: '개당' },
    { key: 'metallurgy-upheaval-11-14', name: '야금술 : 업화 [11-14]', group: '야금술', divisor: null, unitLabel: '개당' },
    { key: 'metallurgy-upheaval-15-18', name: '야금술 : 업화 [15-18]', group: '야금술', divisor: null, unitLabel: '개당' },
    { key: 'metallurgy-upheaval-19-20', name: '야금술 : 업화 [19-20]', group: '야금술', divisor: null, unitLabel: '개당' },
    { key: 'tailoring-thrill-12-15', name: '재봉술 : 전율 [12-15]', group: '재봉술', divisor: null, unitLabel: '개당' },
    { key: 'tailoring-thrill-16-19', name: '재봉술 : 전율 [16-19]', group: '재봉술', divisor: null, unitLabel: '개당' },
    { key: 'metallurgy-thrill-12-15', name: '야금술 : 전율 [12-15]', group: '야금술', divisor: null, unitLabel: '개당' },
    { key: 'metallurgy-thrill-16-19', name: '야금술 : 전율 [16-19]', group: '야금술', divisor: null, unitLabel: '개당' }
] as const;

export type HoningMaterialKey = typeof HONING_MATERIALS[number]['key'];
export type HoningMaterialGroup = typeof HONING_MATERIALS[number]['group'];

export type HoningMaterialPrice = {
    name: string;
    price: number | null;
    bundleCount: number | null;
    unitPrice: number | null;
    icon: string | null;
    grade: string | null;
};

export type HoningMaterialPriceData = {
    version: 1;
    updatedAt: number;
    items: Record<HoningMaterialKey, HoningMaterialPrice>;
};

export function createEmptyHoningMaterialPrice(name: string): HoningMaterialPrice {
    return { name, price: null, bundleCount: null, unitPrice: null, icon: null, grade: null };
}

function normalizePositiveNumber(value: unknown): number | null {
    const number = Number(value);
    return Number.isFinite(number) && number > 0 ? number : null;
}

export function normalizeHoningMaterialPriceData(value: unknown): HoningMaterialPriceData | null {
    if (!value || typeof value !== 'object') return null;
    const data = value as Record<string, unknown>;
    const updatedAt = Number(data.updatedAt);
    if (data.version !== 1 || !Number.isFinite(updatedAt) || !data.items || typeof data.items !== 'object') return null;

    const sourceItems = data.items as Record<string, unknown>;
    const items = {} as Record<HoningMaterialKey, HoningMaterialPrice>;

    for (const material of HONING_MATERIALS) {
        const source = sourceItems[material.key];
        const item = source && typeof source === 'object' ? source as Record<string, unknown> : {};
        const price = normalizePositiveNumber(item.price);
        const bundleCount = normalizePositiveNumber(item.bundleCount);
        const unitPrice = material.divisor
            ? price === null ? null : price / material.divisor
            : price !== null && bundleCount !== null ? price / bundleCount : price;

        items[material.key] = {
            name: typeof item.name === 'string' ? item.name : material.name,
            price,
            bundleCount,
            unitPrice,
            icon: typeof item.icon === 'string' ? item.icon : null,
            grade: typeof item.grade === 'string' ? item.grade : null
        };
    }

    return { version: 1, updatedAt, items };
}
