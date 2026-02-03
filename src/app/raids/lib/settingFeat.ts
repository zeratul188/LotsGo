import { changeKey, leaveRaid, updateRaidData } from "@/app/store/partySlice";
import { AppDispatch } from "@/app/store/store";
import { containsKorean, SetStateFn } from "@/utiils/utils";
import { addToast } from "@heroui/react";
import { LeaveData, MemberBox, Raid } from "../model/types";
import { RaidMember } from "@/app/api/raids/members/route";
import { Character } from "@/app/store/loginSlice";
import { getRandomInviteLink } from "./raidListFeat";
import { encrypt } from "@/utiils/crypto";

const secretKey = process.env.NEXT_PUBLIC_SECRET_KEY ? process.env.NEXT_PUBLIC_SECRET_KEY : 'null';

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

// 파티장 변경 시 선택 리스트 변환 함수
export function getMemberBoxs(idList: string[], members: RaidMember[], managerId: string): MemberBox[] {
    const boxs: MemberBox[] = [];
    idList.forEach(id => {
        const findMember = members.find(m => m.id === id && managerId !== id);
        if (findMember) {
            const character: Character = findMember.expeditions.reduce((prev, cur) => cur.level > prev.level ? cur : prev);
            boxs.push({
                userId: id,
                job: character.job,
                level: character.level,
                nickname: character.nickname,
                server: character.server
            });
        }
    });
    return boxs;
}

// 파티장 변경 이벤트
type ChangeManagerUI = {
    dispatch: AppDispatch,
    onClose: () => void,
    setLoadingChange: SetStateFn<boolean>
}
type CHangeManagerPayload = {
    selectedMember: MemberBox | null,
    raid: Raid
}
export async function handleChangeManager(ui: ChangeManagerUI, payload: CHangeManagerPayload) {
    ui.setLoadingChange(true);
    if (!payload.selectedMember) {
        addToast({
            title: `오류 발생!`,
            description: `처리 중 문제가 발생하였습니다.`,
            color: "danger"
        });
        ui.setLoadingChange(false);
        return;
    }
    const res = await fetch(`/api/raids/partys`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            type: 'changeManager',
            raidId: payload.raid.id,
            managerBox: payload.selectedMember
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
        ui.setLoadingChange(false);
        return;
    }
    const newRaid: Raid = {
        ...payload.raid,
        managerId: payload.selectedMember.userId,
        managerNickname: payload.selectedMember.nickname
    }
    const data = await res.json();
    ui.dispatch(updateRaidData(newRaid));
    addToast({
        title: `변경 완료`,
        description: data.message,
        color: "success"
    });
    ui.setLoadingChange(false);
    ui.onClose();
}

// 초대코드 재변경 이벤트
export function handleChangeLink(
    dispatch: AppDispatch,
    setLoadingChangeLink: SetStateFn<boolean>,
    raid: Raid
) {
    return async () => {
        setLoadingChangeLink(true);
        const newLink = getRandomInviteLink();
        const res = await fetch(`/api/raids/partys`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: 'changeLink',
                raidId: raid.id,
                link: newLink
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
            setLoadingChangeLink(false);
            return;
        }
        const newRaid: Raid = {
            ...raid,
            link: newLink
        }
        const data = await res.json();
        dispatch(updateRaidData(newRaid));
        addToast({
            title: `변경 완료`,
            description: data.message,
            color: "success"
        });
        setLoadingChangeLink(false);
    }
}

// 비밀번호 설정 Switch 작동 이벤트
export function handleChangePwdSetting(
    dispatch: AppDispatch,
    setDisabledPwd: SetStateFn<boolean>,
    setShowPwd: SetStateFn<boolean>,
    raid: Raid
) {
    return async (isSelected: boolean) => {
        setDisabledPwd(true);
        setShowPwd(false);
        const res = await fetch(`/api/raids/partys`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: 'settingPwd',
                raidId: raid.id,
                isSelected: isSelected
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
            setDisabledPwd(false);
            return;
        }
        const newRaid: Raid = {
            ...raid,
            isPwd: isSelected
        }
        const data = await res.json();
        dispatch(updateRaidData(newRaid));
        addToast({
            title: `설정 완료`,
            description: data.message,
            color: "success"
        });
        setDisabledPwd(false);
    }
}

// 비밀번호 변경 이벤트
export function handleChangePwd(
    dispatch: AppDispatch,
    setLoadingChangePwd: SetStateFn<boolean>,
    setShowPwd: SetStateFn<boolean>,
    setChangePwd: SetStateFn<string>,
    raid: Raid,
    changePwd: string
) {
    return async () => {
        setLoadingChangePwd(true);
        setShowPwd(false);

        if (containsKorean(changePwd)) {
            addToast({
                title: `부적절한 입력값 발생`,
                description: "비밀번호에는 한글을 포함할 수 없습니다.",
                color: "danger"
            });
            setLoadingChangePwd(false);
            return;
        }

        const encryptedPwd = encrypt(changePwd, secretKey);
        const res = await fetch(`/api/raids/partys`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: 'changePwd',
                raidId: raid.id,
                encryptedPwd: encryptedPwd
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
            setLoadingChangePwd(false);
            return;
        }
        const newRaid: Raid = {
            ...raid,
            pwd: encryptedPwd
        }
        const data = await res.json();
        dispatch(updateRaidData(newRaid));
        addToast({
            title: `변경 완료`,
            description: data.message,
            color: "success"
        });
        setChangePwd('');
        setLoadingChangePwd(false);
    }
}

// 파티 공개 여부 Switch 작동 이벤트
export function handleChangePublicSetting(
    dispatch: AppDispatch,
    setDisablePublic: SetStateFn<boolean>,
    raid: Raid
) {
    return async (isSelected: boolean) => {
        setDisablePublic(true);
        const res = await fetch(`/api/raids/partys`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: 'switchPublic',
                raidId: raid.id,
                isSelected: isSelected
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
            setDisablePublic(false);
            return;
        }
        const newRaid: Raid = {
            ...raid,
            isOpen: isSelected
        }
        const data = await res.json();
        dispatch(updateRaidData(newRaid));
        addToast({
            title: `설정 완료`,
            description: data.message,
            color: "success"
        });
        setDisablePublic(false);
    }
}

// 파티 탈퇴 이벤트
export function handleLeaveRaid(
    dispatch: AppDispatch,
    setLoadingLeave: SetStateFn<boolean>,
    raid: Raid,
    userId: string | null
) {
    return async () => {
        if (!userId) {
            addToast({
                title: `오류 발생!`,
                description: `처리 중 문제가 발생하였습니다.`,
                color: "danger"
            });
            return;
        }
        setLoadingLeave(true);
        const res = await fetch(`/api/raids/partys`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: 'leaveParty',
                raidId: raid.id,
                userId: userId
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
            setLoadingLeave(false);
            return;
        }
        const data: LeaveData = await res.json();
        dispatch(leaveRaid(data.leaveBox));
        addToast({
            title: `설정 완료`,
            description: data.message,
            color: "success"
        });
        dispatch(changeKey('find'));
        setLoadingLeave(false);
    }
}