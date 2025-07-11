import { SetStateFn } from "@/utiils/utils"
import { addToast } from "@heroui/react"

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

// 유물 각인서 데이터 불러오기
export async function loadBooks(setRelics: SetStateFn<RelicBook[]>, setLoading: SetStateFn<boolean>) {
    const res = await fetch('/api/relics');
    if (!res.ok) {
        addToast({
            title: "로드 오류",
            description: `데이터를 불러오는데 문제가 발생하였습니다.`,
            color: "danger"
        });
        return;
    }
    const relicsBooks: RelicBook[] = await res.json();
    relicsBooks.sort((a, b) => b.price - a.price);
    setRelics(relicsBooks);
    setLoading(false);
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