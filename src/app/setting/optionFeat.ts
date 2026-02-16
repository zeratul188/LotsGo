import { SetStateFn } from "@/utiils/utils";
import { Settings } from "../api/setting/route";
import { LoginUser } from "../store/loginSlice";
import { addToast } from "@heroui/react";
import { defaultSettings } from "../checklist/ChecklistClient";

export async function loadSettings(setSettings: SetStateFn<Settings | null>) {
    const settingLocal = localStorage.getItem('userSettings');
    if (settingLocal) {
        const localSetting: Settings = JSON.parse(settingLocal);
        const settings: Settings = { ...defaultSettings, ...localSetting};
        setSettings(settings);
        return;
    }
    const userStr = sessionStorage.getItem('user');
    const storedUser: LoginUser = userStr ? JSON.parse(userStr) : null;
    if (storedUser) {
        const id = storedUser.id;
        const res = await fetch(`/api/setting?id=${id}`);
        if (res.ok) {
            const settings: Settings = await res.json();
            localStorage.setItem('userSettings', JSON.stringify(settings));
            setSettings(settings);
        } else {
            addToast({
                title: "로드 오류",
                description: `데이터를 가져오는데 문제가 발생하였습니다.`,
                color: "danger"
            });
        }
    }
}

export async function handleHideDayContent(
    settings: Settings | null, 
    setSettings: SetStateFn<Settings | null>
) {
    const userStr = sessionStorage.getItem('user');
    const storedUser: LoginUser = userStr ? JSON.parse(userStr) : null;
    if (storedUser && settings) {
        const id = storedUser.id;
        const cloneSettings = structuredClone(settings);
        cloneSettings.isHideDayContent = !cloneSettings.isHideDayContent;
        const res = await fetch(`/api/setting`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id: id,
                settings: cloneSettings
            })
        });
        if (res.ok) {
            localStorage.setItem('userSettings', JSON.stringify(cloneSettings));
            setSettings(cloneSettings);
        } else {
            addToast({
                title: "저장 오류",
                description: `변경된 옵션이 정상적으로 저장되지 않았습니다.`,
                color: "danger"
            });
        }
    }
}

export async function handleHideBonusMode(
    settings: Settings | null, 
    setSettings: SetStateFn<Settings | null>
) {
    const userStr = sessionStorage.getItem('user');
    const storedUser: LoginUser = userStr ? JSON.parse(userStr) : null;
    if (storedUser && settings) {
        const id = storedUser.id;
        const cloneSettings = structuredClone(settings);
        cloneSettings.isHideBonusMode = !cloneSettings.isHideBonusMode;
        const res = await fetch(`/api/setting`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id: id,
                settings: cloneSettings
            })
        });
        if (res.ok) {
            localStorage.setItem('userSettings', JSON.stringify(cloneSettings));
            setSettings(cloneSettings);
        } else {
            addToast({
                title: "저장 오류",
                description: `변경된 옵션이 정상적으로 저장되지 않았습니다.`,
                color: "danger"
            });
        }
    }
}

// 모든 기기 로그아웃 이벤트 함수
export function useAllLogout(setLoadingAllLogout: SetStateFn<boolean>) {
    return async () => {
        if (confirm('모든 기기에서 로그아웃을 하시겠습니까?')) {
            setLoadingAllLogout(true);
            const res = await fetch("/api/auth/alllogout", {
                method: "POST",
                credentials: "include",
            });
            const data = await res.json();
            if (!res.ok) {
                addToast({
                    title: "처리 오류",
                    description: data.error,
                    color: "danger"
                });
                setLoadingAllLogout(false);
                return;
            }
            addToast({
                title: "로그아웃 완료",
                description: `총 ${data.revokedCount}개의 기기가 로그아웃되었습니다.`,
                color: "success"
            });
            setLoadingAllLogout(false);
        }
    }
}