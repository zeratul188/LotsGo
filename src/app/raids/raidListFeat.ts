import { SetStateFn } from "@/utiils/utils";
import { Raid } from "../api/raids/route";
import { encrypt } from "@/utiils/crypto";
import { addToast } from "@heroui/react";

const secretKey = process.env.NEXT_PUBLIC_SECRET_KEY ? process.env.NEXT_PUBLIC_SECRET_KEY : 'null';

// 파티 목록 데이터 가져오기
export async function loadRaids(
    userId: string | null,
    setRaids: SetStateFn<Raid[]>,
    setJoinRaids: SetStateFn<Raid[]>,
    setLoadingData: SetStateFn<boolean>
) {
    const fetchLink = userId ? `/api/raids?id=${userId}` : `/api/raids`
    const res = await fetch(fetchLink);
    if (!res.ok) {
        addToast({
            title: `데이터 로드 오류`,
            description: `데이터를 로드하는데 문제가 발생하였습니다.`,
            color: "danger"
        });
        return;
    }
    const data = await res.json();
    setRaids(data.raids);
    setJoinRaids(data.joinRaids);
    setLoadingData(false);
}

// 파티 추가 이벤트
export async function handleAddRaid(
    name: string,
    isOpen: boolean,
    isPwd: boolean,
    pwd: string,
    raids: Raid[],
    setRaids: SetStateFn<Raid[]>,
    onClose: () => void,
    userId: string | null,
    setLoadingAdd: SetStateFn<boolean>,
    titleCharacter: string,
    joinRaids: Raid[],
    setJoinRaids: SetStateFn<Raid[]>,
    avgLevel: number
) {
    setLoadingAdd(true);
    const newRaid: Raid = {
        id: 'none',
        name: name,
        managerId: userId ?? 'null',
        managerNickname: titleCharacter,
        link: getRandomInviteLink(),
        isOpen: isOpen,
        isPwd: isPwd,
        pwd: pwd.trim() !== '' ? encrypt(pwd.trim(), secretKey) : 'null',
        members: [userId ?? 'null'],
        party: [],
        avgLevel: avgLevel
    }
    const res = await fetch(`/api/raids`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            type: 'add',
            raid: newRaid,
            id: userId
        })
    });
    if (!res.ok) {
        addToast({
            title: `데이터 수정 오류`,
            description: `데이터를 수정하는데 문제가 발생하였습니다.`,
            color: "danger"
        });
        setLoadingAdd(false);
        return;
    }
    const data = await res.json();
    const raidId = data.id;
    newRaid.id = raidId;
    const cloneRaids = structuredClone(raids);
    cloneRaids.push(newRaid);
    setRaids(cloneRaids);
    const cloneJoinRaids = structuredClone(joinRaids);
    cloneJoinRaids.push(newRaid);
    setJoinRaids(cloneJoinRaids);
    addToast({
        title: `파티 추가`,
        description: `파티를 추가하였습니다.`,
        color: "success"
    });
    setLoadingAdd(false);
    onClose();
}

// 랜덤 초대 링크 생성하기
export function getRandomInviteLink(): string {
    const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    const DIGITS  = "0123456789";
    const ALPHABET = LETTERS + DIGITS;

    const BASE = ALPHABET.length;
    const ACCEPT_BOUND = 256 - (256 % BASE);

    const length = 30;

    const out: string[] = [];
    const buf = new Uint8Array(length * 2); // 여유 버퍼

    while (out.length < length) {
        crypto.getRandomValues(buf);
        for (let i = 0; i < buf.length && out.length < length; i++) {
        const v = buf[i];
        if (v < ACCEPT_BOUND) out.push(ALPHABET[v % BASE]);
        }
    }

    return out.join("");
}

// 이미 참가한 파티 여부
export function isInvitedParty(partyId: string, joinRaids: Raid[]) {
    return joinRaids.some(raid => raid.id === partyId);
}

// 