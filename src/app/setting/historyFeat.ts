import { SetStateFn } from "@/utiils/utils";
import { History } from "./model/types";
import { LoginUser } from "../store/loginSlice";
import { addToast } from "@heroui/react";

export async function loadHistorys(setHistorys: SetStateFn<History[]>, setLoaded: SetStateFn<boolean>) {
    const userStr = sessionStorage.getItem('user');
    const storedUser: LoginUser = userStr ? JSON.parse(userStr) : null;
    const res = await fetch("/api/auth/loginhistory", {
        method: "GET",
        headers: { Authorization: `Bearer ${storedUser.id}` },
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

export function getRemainingDays(targetDate: Date | null): number {
    if (!targetDate) return 0;
    const now = new Date();

    const diffMs = targetDate.getTime() - now.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);

    return Math.ceil(diffDays);
}