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

export function getUndoPrice(relic: RelicBook): number {
    const lastIndex = relic.list.length - 1;
    return relic.list[lastIndex].price;
}

export function getDiffPrice(relic: RelicBook): number {
    return relic.price - getUndoPrice(relic);
}

export function formatMonthData(relic: RelicBook | null): ChartData[] {
    if (!relic) return [];

    const datas = relic.list.map((item) => ({
        date: `${item.month.toString().padStart(2, '0')}-${item.day.toString().padStart(2, '0')}`,
        price: item.price
    }));

    datas.push({
        date: "현재",
        price: relic.price
    });

    return datas;
}

export function getMaxGoldByBook(relic: RelicBook | null): number {
    if (!relic) {
        return 0;
    }

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

    return Math.max(...filteredList.map((d) => d.price));
}

export function getMinGoldByBook(relic: RelicBook | null): number {
    if (!relic) {
        return 0;
    }

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

    return Math.min(...filteredList.map((d) => d.price));
}
