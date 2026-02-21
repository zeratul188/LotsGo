import { SetStateFn } from "@/utiils/utils";
import { Member } from "../api/auth/members/route";
import { addToast } from "@heroui/react";
import { History } from "../setting/model/types";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { RefObject } from "react";

// 맴버들 데이터 가져오기
export async function loadData(setMembers: SetStateFn<Member[]>, setLoading: SetStateFn<boolean>) {
    const res = await fetch('/api/auth/members');
    if (!res.ok) {
        addToast({
            title: "로드 오류",
            description: `데이터를 불러오는데 문제가 발생하였습니다.`,
            color: "danger"
        });
        return;
    }
    const items = await res.json();
    const members: Member[] = [];
    for (const item of items) {
        const member: Member = {
            ...item,
            loginDate: item.loginDate ? new Date(item.loginDate.seconds * 1000 + item.loginDate.nanoseconds / 1_000_000) : '-'
        }
        members.push(member);
    }
    members.sort((a, b) => a.character.localeCompare(b.character, 'ko-KR'));
    setMembers(members);
    setLoading(false);
}

// 특정 맴버 제거 이벤트 함수
export async function handleRemoveMember(
    uid: string, 
    id: string,
    members: Member[],
    setMembers: SetStateFn<Member[]>,
    setLoadingButton: SetStateFn<boolean>
) {
    setLoadingButton(true);
    const deleteRes = await fetch(`/api/auth/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            uid: uid,
            id: id
        })
    });
    if (deleteRes.ok) {
        const removedMembers = members.filter(member => member.id !== id);
        setMembers(removedMembers);
        addToast({
            title: "삭제 완료",
            description: `데이터를 삭제하였습니다.`,
            color: "success"
        });
    } else {
        addToast({
            title: "삭제 오류",
            description: `데이터를 삭제하는데 문제가 발생하였습니다.`,
            color: "danger"
        });
    }
    setLoadingButton(false);
}

// 선택한 userId를 통해 로그인 기록 불러오기
export async function loadHistorys(
    userId: string,
    setHistorys: SetStateFn<History[]>,
    setLoaded: SetStateFn<boolean>
) {
    const res = await fetch("/api/administrator/loginhistory", {
        method: "GET",
        headers: { Authorization: `Bearer ${userId}` },
        credentials: "include",
    });
    const data = await res.json();
    if (!res.ok) {
        addToast({
            title: "로드 오류",
            description: data.error,
            color: "danger"
        });
        setLoaded(true);
        return;
    }
    const historys: History[] = data.historys.map((history: any) => ({
        ...history,
        createdAt: history.createdAt ? new Date(history.createdAt.seconds * 1000) : null,
        expiresAt: history.expiresAt ? new Date(history.expiresAt.seconds * 1000) : null,
        lastUsedAt: history.lastUsedAt ? new Date(history.lastUsedAt.seconds * 1000) : null,
        revokedAt: history.revokedAt ? new Date(history.revokedAt.seconds * 1000) : null
    }));
    setHistorys(historys);
    setLoaded(true);
}

type ActivityLevel = "success" | "warning" | "danger" | "default";
dayjs.extend(utc);
dayjs.extend(timezone);

export function getActivityRange(lastUsedAt?: Date | null): {
    label: string;
    level: ActivityLevel;
} {
    if (!lastUsedAt) {
        return { label: "기록 없음", level: "default" };
    }

    const now = dayjs().tz("Asia/Seoul");
    const seen = dayjs(lastUsedAt).tz("Asia/Seoul");

    const diffDay = now.diff(seen, "day");

    if (diffDay < 7) {
        return { label: "일주일 이내", level: "success" };
    }
    if (diffDay < 30) {
        return { label: "한달 이내", level: "warning" };
    }
    if (diffDay < 90) {
        return { label: "3개월 이내", level: "warning" };
    }
    if (diffDay < 365) {
        return { label: "1년 이내", level: "danger" };
    }

    return { label: "1년 이상", level: "danger" };
}

export function revealFor10Seconds(
    id: string, 
    timersRef: RefObject<Map<string, number>>,
    setLockedIds: SetStateFn<Set<string>>,
    setRevealedIps: SetStateFn<Map<string, string>>
) {
    setLockedIds((prev) => {
        const next = new Set(prev);
        next.add(id);
        return next;
    });
    const prevTimer = timersRef.current.get(id);
    if (prevTimer) {
        window.clearTimeout(prevTimer);
        timersRef.current.delete(id);
    }
    const timer = window.setTimeout(() => {
        setRevealedIps((prev) => {
            const next = new Map(prev);
            next.delete(id);
            return next;
        });
        setLockedIds((prev) => {
            const next = new Set(prev);
            next.delete(id);
            return next;
        });
        timersRef.current.delete(id);
    }, 10_000);
    timersRef.current.set(id, timer);
}

export function isLocked(id: string, lockedIds: Set<string>): boolean {
    return lockedIds.has(id);
}

export function handleClickIp(
    sessionId: string,
    lockedIds: Set<string>,
    timersRef: RefObject<Map<string, number>>,
    setLockedIds: SetStateFn<Set<string>>,
    setRevealedIps: SetStateFn<Map<string, string>>
) {
    return async () => {
        if (isLocked(sessionId, lockedIds)) return;
        try {
            revealFor10Seconds(sessionId, timersRef, setLockedIds, setRevealedIps);

            const res = await fetch("/api/administrator/loadip", {
                method: "GET",
                headers: { Authorization: `Bearer ${sessionId}` },
                credentials: "include",
            });
            const data = await res.json();
            if (!res.ok) {
                addToast({
                    title: "로드 오류",
                    description: data.error,
                    color: "danger"
                });
                throw new Error("IP_FETCH_FAILED");
            }
            const ip = data.ip ?? '-';
            setRevealedIps((prev) => {
                const next = new Map(prev);
                next.set(sessionId, ip);
                return next;
            });
        } catch {
            const t = timersRef.current.get(sessionId);
            if (t) window.clearTimeout(t);
            timersRef.current.delete(sessionId);

            setRevealedIps((prev) => {
                const next = new Map(prev);
                next.delete(sessionId);
                return next;
            });
            setLockedIds((prev) => {
                const next = new Set(prev);
                next.delete(sessionId);
                return next;
            });
        }
    }
}