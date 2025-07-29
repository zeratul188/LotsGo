export type RelicList = {
    year: number,
    month: number,
    day: number,
    price: number
}

export type RelicBook = {
    name: string,
    price: number,
    icon: string,
    list: RelicList[]
}

export type ChartData = {
    date: string,
    price: number
}

// 유물 각인서 데이터 불러오기
export async function loadBooks(): Promise<RelicBook[]> {
    const res = await fetch('https://www.lotsgo.kr/api/relics');
    if (!res.ok) {
        return [];
    }
    const relicsBooks: RelicBook[] = await res.json();
    relicsBooks.sort((a, b) => b.price - a.price);
    return relicsBooks;
}

// 특정 유물 각인서 이전 가격 가져오기
export function getUndoPrice(relic: RelicBook): number {
    const lastIndex = relic.list.length - 1;
    return relic.list[lastIndex].price;
}

// 가격 변동 값 가져오기
export function getDiffPrice(relic: RelicBook): number {
    return relic.price - getUndoPrice(relic);
}

// 차트 데이터 형식 변환 - 2개월 단위
export function formatMonthData(relic: RelicBook | null): ChartData[] {
    if (!relic) return [];
    const datas: ChartData[] = [];
    for (const item of relic.list) {
        const date = `${item.month.toString().padStart(2, '0')}-${item.day.toString().padStart(2, '0')}`;
        const newData: ChartData = {
            date: date,
            price: item.price
        }
        datas.push(newData);
    }
    const newData: ChartData = {
        date: "현재", 
        price: relic.price
    }
    datas.push(newData);
    return datas;
}

// 3개월간 최고 골드값 가져오기
export function getMaxGoldByBook(relic: RelicBook | null): number {
    if (!relic) return 0;
    const filteredList = relic.list.filter((item) => {
        const date = new Date(item.year, item.month - 1, item.day);
        const now = new Date();
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(now.getMonth() - 3);
        return date > threeMonthsAgo;
    });
    filteredList.push({
        day: 0,
        month: 0,
        year: 0,
        price: relic.price
    });
    const max = Math.max(...filteredList.map(d => d.price));
    return max;
}

// 3개월간 최저 골드값 가져오기
export function getMinGoldByBook(relic: RelicBook | null): number {
    if (!relic) return 0;
    const filteredList = relic.list.filter((item) => {
        const date = new Date(item.year, item.month - 1, item.day);
        const now = new Date();
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(now.getMonth() - 3);
        return date > threeMonthsAgo;
    });
    filteredList.push({
        day: 0,
        month: 0,
        year: 0,
        price: relic.price
    });
    const min = Math.min(...filteredList.map(d => d.price));
    return min;
}