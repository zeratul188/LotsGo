import { SetStateFn } from "@/utiils/utils";
import { addToast } from "@heroui/react";
import { Donate } from "../api/administrator/donate/route";

// 후원 데이터 불러오기
export async function loadDonates(
    setDonates: SetStateFn<Donate[]>, 
    setLoading: SetStateFn<boolean>
) {
    setLoading(false);
    const res = await fetch('/api/administrator/donate');
    if (!res.ok) {
        addToast({
            title: "데이터 로드 오류",
            description: `데이터를 가져오는데 문제가 발생하였습니다.`,
            color: "danger"
        });
        setLoading(false);
        return;
    }
    const donateData = await res.json();
    const newDonates: Donate[] = [];
    for (const data of donateData) {
        const date = new Date(data.date);
        const newDonate: Donate = {
            ...data,
            date: date
        }
        newDonates.push(newDonate);
    }
    newDonates.sort((a, b) => b.date.getTime() - a.date.getTime());
    setDonates(newDonates);
    setLoading(false);
}

export function formatDate(date: Date): string {
    const year = date.getFullYear().toString().padStart(4, '0');
    const month = (date.getMonth()+1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hour = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');

    return `${year}-${month}-${day} ${hour}:${minutes}`;
}

// 입력 초기화
export function resetInputs(
    setID: SetStateFn<string>,
    setPrice: SetStateFn<number>,
    setMemo: SetStateFn<string>
) {
    setID('');
    setPrice(0);
    setMemo('');
}

// 후원 항목 추가
export async function handleAddDonate(
    id: string,
    price: number,
    memo: string,
    setLoading: SetStateFn<boolean>,
    onClose: () => void,
    donates: Donate[],
    setDonates: SetStateFn<Donate[]>
) {
    setLoading(true);
    const today = new Date();
    const res = await fetch(`/api/administrator/donate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            type: 'add',
            newDonate: {
                id: id,
                price: price,
                date: today,
                memo: memo
            }
        })
    });
    if (res.ok) {
        const data = await res.json();
        const addUID = data.id;
        const newDonates = structuredClone(donates);
        const newDonate: Donate = {
            uid: addUID,
            id: id,
            price: price,
            date: today,
            memo: memo
        }
        newDonates.push(newDonate);
        newDonates.sort((a, b) => b.date.getTime() - a.date.getTime());
        setDonates(newDonates);
        addToast({
            title: "추가 완료",
            description: `후원 항목을 추가하였습니다.`,
            color: "success"
        });
    } else {
        addToast({
            title: "데이터 저장 오류",
            description: `데이터를 저장하는데 문제가 발생하였습니다.`,
            color: "danger"
        });
    }
    setLoading(false);
    onClose();
}

// 후원 항목 제거
export async function handleDeleteItem(
    uid: string,
    donates: Donate[],
    setDonates: SetStateFn<Donate[]>,
    setLoadingDelete: SetStateFn<boolean>
) {
    setLoadingDelete(true);
    const res = await fetch(`/api/administrator/donate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            type: 'remove',
            uid: uid
        })
    });
    if (res.ok) {
        const newDonates = donates.filter(item => item.uid !== uid);
        setDonates(newDonates);
        addToast({
            title: "삭제 완료",
            description: `후원 항목을 삭제하였습니다.`,
            color: "success"
        });
    } else {
        addToast({
            title: "데이터 저장 오류",
            description: `데이터를 저장하는데 문제가 발생하였습니다.`,
            color: "danger"
        });
    }
    setLoadingDelete(false);
}

// 총 후원 금액 - 검색된 필터만 포함
export function getSumPrice(results: Donate[]): number {
    let sum = 0;
    for (const donate of results) {
        sum += donate.price;
    }
    return sum;
}