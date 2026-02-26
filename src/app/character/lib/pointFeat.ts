import { SetStateFn } from "@/utiils/utils"

// 수집품 데이터 불러오기
export type CollectItem = {
    name: string,
    point: number,
    maxPoint: number
}
export type Collect = {
    type: string,
    icon: string,
    bgIcon: string,
    point: number,
    maxPoint: number,
    items: CollectItem[]
}
export function loadCollects(datas: any[] | null, setCollects: SetStateFn<Collect[]>) {
    const collects: Collect[] = [];
    if (datas) {
        let iconIndex = 1;
        for (const item of datas) {
            const items: CollectItem[] = [];
            for (const collectItem of item.CollectiblePoints) {
                const newItem: CollectItem = {
                    name: collectItem.PointName,
                    point: Number(collectItem.Point),
                    maxPoint: Number(collectItem.MaxPoint)
                }
                items.push(newItem);
            }
            const newCollect: Collect = {
                type: item.Type,
                icon: `/point/point${iconIndex}.png`,
                bgIcon: item.Icon,
                point: Number(item.Point),
                maxPoint: Number(item.MaxPoint),
                items: items
            }
            collects.push(newCollect);
            iconIndex++;
        }
    }
    setCollects(collects);
}

// 수집품 완료한 갯수
export function getCompletePoint(collect: Collect): number {
    let sum = 0;
    for (const item of collect.items) {
        sum += item.point;
    }
    return sum;
}

// 수집품 총 갯수
export function getCompleteMaxPoint(collect: Collect): number {
    let sum = 0;
    for (const item of collect.items) {
        sum += item.maxPoint;
    }
    return sum;
}

// 성향 데이터 불러오기
export type Hobby = {
    type: string,
    point: number,
    maxPoint: number
}
export function loadHobbys(data: any | null, setHobbys: SetStateFn<Hobby[]>) {
    const hobbys: Hobby[] = [];
    if (data) {
        const datas: any[] = data.Tendencies;
        for (const item of datas) {
            const hobby: Hobby = {
                type: item.Type,
                point: Number(item.Point),
                maxPoint: Number(item.MaxPoint)
            }
            hobbys.push(hobby);
        }
    }
    setHobbys(hobbys);
}

// 전체 진행도 값 반환 함수
export function getProgressData(collects: Collect[]): number {
    let value = 0;
    for (const collect of collects) {
        let now = 0, max = 0;
        for (const item of collect.items) {
            now += item.point;
            max += item.maxPoint;
        }
        const percent = now / max * 100;
        value += percent;
    }
    return Math.round(value);
}

// 나침판, 부적 데이터 가져오기
export type CollectEquipment = {
    type: string,
    icon: string,
    grade: string,
    descriptions: string[]
}
export function loadItems(datas: any[] | null, setCollectEquipments: SetStateFn<CollectEquipment[]>) {
    const collectItems: CollectEquipment[] = [];
    if (datas) {
        for (const item of datas) {
            if (item.Type === '나침반' || item.Type === '부적') {
                const parsedTooltip = JSON.parse(item.Tooltip);
                const descriptions: string[] = findDescriptionInTooltip(parsedTooltip);
                const collectItem: CollectEquipment = {
                    type: item.Type,
                    icon: item.Icon,
                    grade: item.Grade,
                    descriptions: descriptions
                }
                collectItems.push(collectItem);
            }
        }
    }
    setCollectEquipments(collectItems);
}

// 나침판, 부적 설명 가져오기
function findDescriptionInTooltip(parsed: any): string[] {
    for (const key in parsed) {
        const element = parsed[key];
        const value = element?.value;

        const element000 = value?.Element_000;
        const element001 = value?.Element_001;
        if (typeof element000 === 'string' && typeof element001 === 'string' && element000.includes('추가 효과')) {
            const strs: string[] = element001.split('<BR>');
            return strs;
        }
    }
    return [];
}

// 수집품 진행률에 따른 색상 반환
export function getColorByProgress(value: number, max: number): "primary" | "default" | "secondary" | "success" | "warning" | "danger" | undefined {
    const percent = value / max * 100;
    if (percent === 100) { return 'success' }
    if (percent >= 75) { return 'secondary' }
    if (percent >= 50) { return 'primary' }
    if (percent >= 25) { return'warning' }
    if (percent > 0) { return 'danger' }
    return 'default'
}