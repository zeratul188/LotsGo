import { SetStateFn } from "@/utiils/utils";
import { addToast } from "@heroui/react";
import { ActivityLevel, History, Member } from "../model/types";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import type { RefObject } from "react";

// 맴버들 데이터 가져오기
export async function loadData(
    setMembers: SetStateFn<Member[]>, 
    setLoading: SetStateFn<boolean>,
    setMemberLength: SetStateFn<number>,
    setFilterLength: SetStateFn<number>,
    setHasMore: SetStateFn<boolean>
) {
    const res = await fetch('/api/auth/members?filter=id');
    if (!res.ok) {
        addToast({
            title: "로드 오류",
            description: `데이터를 불러오는데 문제가 발생하였습니다.`,
            color: "danger"
        });
        return;
    }
    const data = await res.json();
    setMembers(data.members);
    setMemberLength(data.memberCount);
    setFilterLength(data.filterCount);
    setHasMore(data.hasMore);
    setLoading(false);
}

// 다음 데이터 가져오기
export function handleMoreData(
    members: Member[],
    searchValue: string,
    selectedFilter: string,
    setLoadingMore: SetStateFn<boolean>,
    setHasMore: SetStateFn<boolean>,
    setMembers: SetStateFn<Member[]>
) {
    return async () => {
        setLoadingMore(true);
        const lastMember = members.at(-1);
        if (!lastMember) return;
        const params = new URLSearchParams();
        params.append("searchValue", searchValue);
        params.append("filter", selectedFilter);
        params.append("id", lastMember.id);
        if (selectedFilter === "character") {
            params.append("character", lastMember.character);
        }
        const res = await fetch(`/api/auth/members?${params.toString()}`);
        const data = await res.json();
        if (!res.ok) {
            addToast({
                title: "로드 오류",
                description: data.error,
                color: "danger"
            });
            return;
        }
        const appendMembers: Member[] = data.members;
        setMembers(prev => {
            const merged = [...prev, ...appendMembers];
            const unique = Array.from(
                new Map(merged.map(member => [member.id, member])).values()
            );
            return unique;
        });
        setHasMore(data.hasMore);
        setLoadingMore(false);
    }
}

// 검색 이벤트 함수
export async function handleSearchData(
    searchValue: string,
    selectedFilter: string,
    setHasMore: SetStateFn<boolean>,
    setMembers: SetStateFn<Member[]>,
    setLoading: SetStateFn<boolean>,
    setFilterLength: SetStateFn<number>
) {
    setLoading(true);
    setHasMore(false);
    const params = new URLSearchParams();
    params.append("searchValue", searchValue);
    params.append("filter", selectedFilter);
    const res = await fetch(`/api/auth/members?${params.toString()}`);
    const data = await res.json();
    if (!res.ok) {
        addToast({
            title: "로드 오류",
            description: data.error,
            color: "danger"
        });
        return;
    }
    const members: Member[] = data.members;
    setMembers(members);
    setHasMore(data.hasMore);
    setFilterLength(data.filterCount);
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

type ResetPasswordResponse = {
    temporaryPassword?: string,
    error?: string
}

// 특정 회원의 Firebase Authentication 및 회원 데이터 비밀번호 재생성
export async function handleResetMemberPassword(
    id: string,
    setResettingMemberId: SetStateFn<string | null>
): Promise<string | null> {
    setResettingMemberId(id);
    try {
        const storedToken = sessionStorage.getItem('token');
        if (!storedToken) throw new Error('로그인 토큰이 없습니다. 다시 로그인해주세요.');
        let token = storedToken;

        const request = (accessToken: string) => fetch('/api/administrator/resetpassword', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken}`
            },
            credentials: 'include',
            body: JSON.stringify({ id })
        });

        let response = await request(token);
        if (response.status === 401) {
            const refreshResponse = await fetch('/api/auth/refresh', { method: 'POST', credentials: 'include' });
            const refreshData = await refreshResponse.json().catch(() => null);
            if (refreshResponse.ok && typeof refreshData?.accessToken === 'string') {
                token = refreshData.accessToken;
                sessionStorage.setItem('token', token);
                response = await request(token);
            }
        }

        const data: ResetPasswordResponse = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error ?? '임시 비밀번호를 생성하지 못했습니다.');
        if (typeof data.temporaryPassword !== 'string' || data.temporaryPassword.length !== 12) {
            throw new Error('생성된 임시 비밀번호를 확인할 수 없습니다.');
        }

        addToast({
            title: "재생성 완료",
            description: `${id} 회원의 임시 비밀번호를 생성했습니다.`,
            color: "success"
        });
        return data.temporaryPassword;
    } catch (error) {
        addToast({
            title: "재생성 오류",
            description: error instanceof Error ? error.message : '임시 비밀번호를 생성하지 못했습니다.',
            color: "danger"
        });
        return null;
    } finally {
        setResettingMemberId(null);
    }
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
    })).sort((a: History, b: History) => {
        const timeA = a.lastUsedAt ? a.lastUsedAt.getTime() : 0;
        const timeB = b.lastUsedAt ? b.lastUsedAt.getTime() : 0;
        return timeB - timeA;
    });
    setHistorys(historys);
    setLoaded(true);
}

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

    if (diffDay < 3) {
        return { label: "3일 이내", level: "success" };
    }
    if (diffDay < 7) {
        return { label: "일주일 이내", level: "warning" };
    }
    if (diffDay < 30) {
        return { label: "한달 이내", level: "danger" };
    }
    if (diffDay < 45) {
        return { label: "한달 이후", level: "danger" };
    }

    return { label: "오래된 기록", level: "danger" };
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

// 특정 로그인 기록을 만료 처리 이벤트 함수
export function handleRevorkHistory(
    sessionId: string, 
    setHistorys: SetStateFn<History[]>,
    setLoadings: SetStateFn<Map<string, boolean>>
) {
    return async () => {
        setLoadings(prev => {
            const newMap = new Map(prev);
            newMap.set(sessionId, true);
            return newMap;
        });
        const res = await fetch("/api/administrator/loadip", {
            method: "POST",
            credentials: "include",
            body: JSON.stringify({
                sessionId: sessionId
            })
        });
        const data = await res.json();
        if (!res.ok) {
            addToast({
                title: "입력 불가",
                description: data.error,
                color: "danger"
            });
            return;
        }
        setHistorys(prev => prev.map(history => history.id === sessionId ? 
            { ...history, revoked: data.revoked, revokedAt: new Date(data.revokedAtSeconds * 1000) }
            : history
        ));
        setLoadings(prev => {
            const newMap = new Map(prev);
            newMap.set(sessionId, false);
            return newMap;
        });
        addToast({
            title: "처리 완료",
            description: "해당 기록을 만료 처리하였습니다.",
            color: "success"
        });
    }
}
