import { updateRaidData } from "@/app/store/partySlice";
import { AppDispatch } from "@/app/store/store";
import { SetStateFn } from "@/utiils/utils";
import { addToast } from "@heroui/react";
import { Raid } from "../model/types";

// 파티명 변경 이벤트
export function handleChangeName(
    changeName: string, 
    raid: Raid,
    dispatch: AppDispatch, 
    setLoadingChangeName: SetStateFn<boolean>
) {
    return async () => {
        setLoadingChangeName(true);
        const res = await fetch(`/api/raids/partys`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: 'changeName',
                raidId: raid.id,
                changeName: changeName
            })
        });
        if (!res.ok) {
            let message = '요청 중 오류가 발생하였습니다.';
            try {
                const data = await res.json();
                message = data?.error ?? message;
            } catch {}
            addToast({
                title: `요청 오류`,
                description: message,
                color: "danger"
            });
            setLoadingChangeName(false);
            return;
        }
        const newRaid: Raid = {
            ...raid,
            name: changeName
        }
        const data = await res.json();
        dispatch(updateRaidData(newRaid));
        addToast({
            title: `변경 완료`,
            description: data.message,
            color: "success"
        });
        setLoadingChangeName(false);
    }
}

// 조작하는 사람이 파티장인지 파악하는 함수
export function isManagerByUserId(raid: Raid, userId: string | null): boolean {
    return raid.managerId === userId;
}