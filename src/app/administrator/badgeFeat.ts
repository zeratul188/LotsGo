import { SetStateFn } from "@/utiils/utils";
import { Badge } from "../api/administrator/badge/route";
import { addToast } from "@heroui/react";
import { BadgeToUser } from "../api/badgetomembers/route";

// 뱃지 데이터 불러오기
export async function loadBadges(setBadges: SetStateFn<Badge[]>) {
    const res = await fetch(`/api/administrator/badge`);
    if (!res.ok) {
        addToast({
            title: "데이터 로드 오류",
            description: `데이터를 가져오는데 문제가 발생하였습니다.`,
            color: "danger"
        });
        return;
    }
    const badges: Badge[] = await res.json();
    badges.sort((a, b) => a.id.localeCompare(b.nickname, 'ko'));
    setBadges(badges);
}

// 후원 아이디 불러오기
export async function loadIds(setIds: SetStateFn<string[]>) {
    const res = await fetch('/api/administrator/donate');
    if (!res.ok) {
        addToast({
            title: "데이터 로드 오류",
            description: `데이터를 가져오는데 문제가 발생하였습니다.`,
            color: "danger"
        });
        return;
    }
    const datas = await res.json();
    const ids: string[] = [];
    for (const data of datas) {
        ids.push(data.id);
    }
    setIds(ids);
}

// 데이터 최신화 작업
export function useUpdateData(
    ids: string[],
    setLoadingButton: SetStateFn<boolean>,
    setBadges: SetStateFn<Badge[]>
) {
    return async () => {
        setLoadingButton(true);
        const res = await fetch('/api/badgetomembers');
        if (res.ok) {
            const idDatas: BadgeToUser[] = await res.json();
            const filterDatas = idDatas.filter(data => ids.includes(data.id));
            const newBadges: Badge[] = [];
            filterDatas.forEach((data) => {
                data.expeditions.forEach((character) => {
                    if (!newBadges.some(badge => badge.nickname === character.nickname)) {
                        const newBadge: Badge = {
                            uid: 'null',
                            id: data.id,
                            nickname: character.nickname
                        }
                        newBadges.push(newBadge);
                    }
                });
            });
            newBadges.sort((a, b) => a.id.localeCompare(b.nickname, 'ko'));
            const editRes = await fetch(`/api/administrator/badge`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    badges: newBadges
                })
            });
            if (editRes.ok) {
                const data = await editRes.json();
                const inputBadges: Badge[] = data.badges;
                setBadges(inputBadges);
                addToast({
                    title: "최신화 완료",
                    description: `데이터를 최산화하였습니다.`,
                    color: "success"
                });
            } else {
                addToast({
                    title: "데이터 저장 오류2",
                    description: `데이터를 저장하는데 문제가 발생하였습니다.`,
                    color: "danger"
                });
            }
        } else {
            addToast({
                title: "데이터 저장 오류",
                description: `데이터를 저장하는데 문제가 발생하였습니다.`,
                color: "danger"
            });
        }
        setLoadingButton(false);
    }
}