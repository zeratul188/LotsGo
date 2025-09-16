import { SetStateFn } from "@/utiils/utils";
import { Raid } from "../api/raids/route";
import { decrypt, encrypt } from "@/utiils/crypto";
import { addToast } from "@heroui/react";

const secretKey = process.env.NEXT_PUBLIC_SECRET_KEY ? process.env.NEXT_PUBLIC_SECRET_KEY : 'null';

// 파티 목록 데이터 가져오기
export async function loadRaids(
    userId: string | null,
    setRaids: SetStateFn<Raid[]>,
    setJoinRaids: SetStateFn<Raid[]>
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

// 파티 참가 이벤트 함수
export async function handleJoinParty(
    userId: string | null,
    inputLink: string, 
    inputPwd: string,
    setLoadingJoin: SetStateFn<boolean>,
    party: Raid | null,
    setParty: SetStateFn<Raid | null>,
    setErrorLink: SetStateFn<boolean>,
    setErrorPwd: SetStateFn<boolean>,
    onClose: () => void,
    joinRaids: Raid[],
    setJoinRaids: SetStateFn<Raid[]>
) {
    setLoadingJoin(true);
    setErrorLink(false);
    setErrorPwd(false);
    if (!party) {
        const res = await fetch(`/api/raids?link=${inputLink}`);
        if (!res.ok) {
            addToast({
                title: `데이터 로드 오류`,
                description: `데이터를 로드하는데 문제가 발생하였습니다.`,
                color: "danger"
            });
            setLoadingJoin(false);
            return;
        }
        const data = await res.json();
        const jRaids: Raid[] = data.joinRaids;

        if (jRaids.length === 1) {
            const raid: Raid = jRaids[0];
            if (raid.isPwd) {
                setParty(raid);
                setLoadingJoin(false);
            } else {
                const res = await fetch(`/api/raids`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        type: 'join',
                        raid: raid,
                        id: userId
                    })
                });
                if (!res.ok) {
                    addToast({
                        title: `데이터 수정 오류`,
                        description: `데이터를 수정하는데 문제가 발생하였습니다.`,
                        color: "danger"
                     });
                    setLoadingJoin(false);
                    return;
                }
                const cloneRaids = structuredClone(joinRaids);
                if (userId) {
                    raid.members.push(userId);
                }
                cloneRaids.push(raid);
                setJoinRaids(cloneRaids);
                setLoadingJoin(false);
                onClose();
                addToast({
                    title: `참가 완료`,
                    description: `\"${raid.name}\" 파티에 참가하였습니다.`,
                    color: "success"
                });
            }
        } else {
            addToast({
                title: `파티 없음`,
                description: `들어가고자 하는 파티가 존재하지 않습니다.`,
                color: "danger"
            });
            setLoadingJoin(false);
            setErrorLink(true);
            return;
        }
    } else {
        const decryptedPassword = decrypt(party.pwd, secretKey);
        if (party.link === inputLink && decryptedPassword === inputPwd) {
            const res = await fetch(`/api/raids`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'join',
                    raid: party,
                    id: userId
                })
            });
            if (!res.ok) {
                addToast({
                    title: `데이터 수정 오류`,
                    description: `데이터를 수정하는데 문제가 발생하였습니다.`,
                    color: "danger"
                });
                setLoadingJoin(false);
                return;
            }
            const cloneRaids = structuredClone(joinRaids);
            if (userId) {
                party.members.push(userId);
            }
            cloneRaids.push(party);
            setJoinRaids(cloneRaids);
            setLoadingJoin(false);
            addToast({
                title: `참가 완료`,
                description: `\"${party.name}\" 파티에 참가하였습니다.`,
                color: "success"
            });
            onClose();
        } else {
            addToast({
                title: `입력 오류`,
                description: `초대 링크가 일치한 파티가 없거나 비밀번호가 일치하지 않습니다.`,
                color: "danger"
            });
            setLoadingJoin(false);
            setErrorLink(true);
            setErrorPwd(true);
            return;
        }
    }
}

// 공개 파티 참가 이벤트
export async function joinPublicParty(
    userId: string | null,
    raid: Raid,
    joinRaids: Raid[],
    setJoinRaids: SetStateFn<Raid[]>,
    setLoadingJoin: SetStateFn<{ [id: string]: boolean }>
) {
    setLoadingJoin(prev => ({...prev, [raid.id]: true}));
    const res = await fetch(`/api/raids`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            type: 'join',
            raid: raid,
            id: userId
        })
    });
    if (!res.ok) {
        addToast({
            title: `데이터 수정 오류`,
            description: `데이터를 수정하는데 문제가 발생하였습니다.`,
            color: "danger"
        });
        setLoadingJoin(prev => ({...prev, [raid.id]: false}));
        return;
    }
    const cloneRaids = structuredClone(joinRaids);
    if (userId) {
        raid.members.push(userId);
    }
    cloneRaids.push(raid);
    setJoinRaids(cloneRaids);
    setLoadingJoin(prev => ({...prev, [raid.id]: false}));
    addToast({
        title: `참가 완료`,
        description: `\"${raid.name}\" 파티에 참가하였습니다.`,
        color: "success"
    });
}

// 공개 파티 비밀번호 입력 이벤트
export async function handleJoinPrivateParty(
    userId: string | null,
    selectedRaid: Raid | null,
    inputPwd: string,
    joinRaids: Raid[],
    setJoinRaids: SetStateFn<Raid[]>,
    setLoadingJoin: SetStateFn<boolean>,
    onClose: () => void
) {
    setLoadingJoin(true);
    if (selectedRaid) {
        const decryptedPassword = decrypt(selectedRaid.pwd, secretKey);
        if (decryptedPassword === inputPwd) {
            const res = await fetch(`/api/raids`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'join',
                    raid: selectedRaid,
                    id: userId
                })
            });
            if (!res.ok) {
                addToast({
                    title: `데이터 수정 오류`,
                    description: `데이터를 수정하는데 문제가 발생하였습니다.`,
                    color: "danger"
                });
                setLoadingJoin(false);
                return;
            }
            const cloneRaids = structuredClone(joinRaids);
            if (userId) {
                selectedRaid.members.push(userId);
            }
            cloneRaids.push(selectedRaid);
            setJoinRaids(cloneRaids);
            addToast({
                title: `참가 완료`,
                description: `\"${selectedRaid.name}\" 파티에 참가하였습니다.`,
                color: "success"
            });
            onClose();
        } else {
            addToast({
                title: `비밀번호 미일치`,
                description: `초대 링크가 일치한 파티가 없거나 비밀번호가 일치하지 않습니다.`,
                color: "danger"
            });
            setLoadingJoin(false);
            return; 
        }
    } else {
        addToast({
            title: `오류 발생`,
            description: `참가할 파티가 존재하지 않습니다.`,
            color: "danger"
        });
        setLoadingJoin(false);
    }
}