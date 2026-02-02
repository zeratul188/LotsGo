import { normalize, SetStateFn } from "@/utiils/utils";
import { Party, PartyResponse, Raid, TeamCharacter } from "../model/types";
import { decrypt, encrypt } from "@/utiils/crypto";
import { addToast } from "@heroui/react";
import type { AppDispatch } from "../../store/store";
import { addRaid, changeJoinRaids, initialRaids, updatePartys } from "../../store/partySlice";
import { getBossDataById, InvolvedCharacter } from "./raidsFeat";
import { Boss } from "../../api/checklist/boss/route";
import { RaidMember } from "../../api/raids/members/route";
import characterData from "@/data/characters/data.json";

const secretKey = process.env.NEXT_PUBLIC_SECRET_KEY ? process.env.NEXT_PUBLIC_SECRET_KEY : 'null';
const REFRESH_COOLDOWN = 5000; // 새로고침 빈도 시간
const TEAM_MAX = 4;

// 파티 목록 데이터 가져오기
export async function loadRaids(
    dispatch: AppDispatch,
    userId: string | null
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
    dispatch(initialRaids({
        raids: data.raids,
        joinRaids: data.joinRaids
    }));
}

// 파티 추가 이벤트
export async function handleAddRaid(
    dispatch: AppDispatch,
    name: string,
    isOpen: boolean,
    isPwd: boolean,
    pwd: string,
    onClose: () => void,
    userId: string | null,
    setLoadingAdd: SetStateFn<boolean>,
    titleCharacter: string,
    joinRaids: Raid[],
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
    dispatch(addRaid(newRaid));
    const cloneJoinRaids = structuredClone(joinRaids);
    cloneJoinRaids.push(newRaid);
    dispatch(changeJoinRaids(cloneJoinRaids));
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
    dispatch: AppDispatch
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
                dispatch(changeJoinRaids(cloneRaids));
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
            dispatch(changeJoinRaids(cloneRaids));
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
    setLoadingJoin: SetStateFn<{ [id: string]: boolean }>,
    dispatch: AppDispatch
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
    dispatch(changeJoinRaids(cloneRaids));
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
    setLoadingJoin: SetStateFn<boolean>,
    onClose: () => void,
    dispatch: AppDispatch
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
            dispatch(changeJoinRaids(cloneRaids));
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

// 파티의 레이드 목록의 새로고침 이벤트 함수
export async function handleRefreshPartys(
    setLoadingRefresh: SetStateFn<boolean>,
    isRefreshCooldown: boolean,
    setRefreshCooldown: SetStateFn<boolean>,
    raidId: string | undefined,
    dispatch: AppDispatch
) {
    if (isRefreshCooldown) {
        addToast({
            title: "요청 거부",
            description: `새로고침은 5초에 한 번만 가능합니다.`,
            color: "danger"
        });
    }
    setLoadingRefresh(true);
    try {
        const res = await fetch(`/api/raids/partys?raidId=${raidId}`);
        if (!res.ok || !raidId) throw new Error();
        const partys: Party[] = await res.json();
        dispatch(updatePartys({
            id: raidId,
            partys: partys
        }));
        addToast({
            title: "새로고침 완료",
            description: `레이드 목록이 최신 상태로 업데이트되었습니다.`,
            color: "success"
        });
    } catch {
        addToast({
            title: "요청 오류",
            description: `데이터를 불러오는데 문제가 발생하였습니다.`,
            color: "danger"
        });
    } finally {
        setLoadingRefresh(false);
        setRefreshCooldown(true);
        setTimeout(() => {
            setRefreshCooldown(false);
        }, REFRESH_COOLDOWN);
    }
}

// 참여할 파티의 콘텐츠 최대 인원 반환 함수
export function getMaxLengthByContent(bosses: Boss[], contentId: string): number {
    const findBoss = getBossDataById(bosses, contentId);
    return findBoss ? findBoss.max : 0;
}

// 파티 참여 이벤트 함수
export type JoinRaidUI = {
    onClose: () => void,
    setLoadingJoin: SetStateFn<boolean>,
    dispatch: AppDispatch
}
export type JoinRaidPayload = {
    selectedCharacter: InvolvedCharacter | null,
    isManager: boolean,
    tabType: string,
    raidId: string | null,
    partyId: string,
    userId: string,
    position: number,
    partyNumber: number
}
export async function handleJoinRaid(ui: JoinRaidUI, payload: JoinRaidPayload) {
    ui.setLoadingJoin(true);
    if (!payload.raidId || !payload.selectedCharacter) {
        addToast({
            title: `오류 발생!`,
            description: `참여하는데 문제가 발생하였습니다.`,
            color: "danger"
        });
        ui.setLoadingJoin(false);
        return;
    }
    let type = payload.tabType;
    if (!characterData.classSupporters.includes(payload.selectedCharacter.job)) {
        type = 'attack';
    }
    const teamCharacter: TeamCharacter = {
        isManager: payload.isManager,
        nickname: payload.selectedCharacter.nickname,
        userId: payload.userId,
        type: type,
        partyIndex: payload.partyNumber,
        position: payload.position
    }
    const res = await fetch(`/api/raids`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            type: 'involvedParty',
            raidId: payload.raidId,
            partyId: payload.partyId,
            userId: payload.userId,
            teamCharacter: teamCharacter
        })
    });
    if (!res.ok) {
        addToast({
            title: `요청 오류`,
            description: `데이터를 수정하는데 문제가 발생하였습니다.`,
            color: "danger"
        });
        ui.setLoadingJoin(false);
        return;
    }
    const data: PartyResponse = await res.json();
    ui.dispatch(updatePartys({
        id: payload.raidId,
        partys: data.partys
    }));
    addToast({
        title: `참여 완료`,
        description: data.message,
        color: "success"
    });
    ui.setLoadingJoin(false);
    ui.onClose();
}  

// 유저ID와 캐릭터명으로 캐릭터 정보 가져오기
export type CharacterInfo = {
    level: number,
    server: string,
    job: string
}
const EMPTY_CHARACTER: CharacterInfo = {
    job: 'null',
    level: 0,
    server: 'null'
}
export function getCharacterInfoById(members: RaidMember[], userId: string, nickname: string): CharacterInfo {
    const member = members.find(m => m.id === userId);
    if (!member) return EMPTY_CHARACTER;

    const character = member.expeditions.find(c => normalize(c.nickname) === normalize(nickname)) ?? member.checklist.find(c => normalize(c.nickname) === normalize(nickname));

    return character ? {
        job: character.job,
        level: character.level,
        server: character.server
    } : EMPTY_CHARACTER;
}

// 해당 파티의 참여를 취소하는 이벤트 함수
type CancelRaidUI = {
    setLoadingCancel: SetStateFn<boolean>,
    dispatch: AppDispatch
}
type CancelRaidPayload = {
    raidId: string | undefined,
    partyId: string | null,
    userId: string | null    
}
export async function handleCancelInvolvedParty(ui: CancelRaidUI, payload: CancelRaidPayload) {
    ui.setLoadingCancel(true);
    if (!payload.raidId || !payload.partyId || !payload.userId) {
        addToast({
            title: `오류 발생!`,
            description: `참여를 취소하는데 문제가 발생하였습니다.`,
            color: "danger"
        });
        ui.setLoadingCancel(false);
        return;
    }
    const res = await fetch(`/api/raids`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            type: 'cancelInvolvedParty',
            raidId: payload.raidId,
            partyId: payload.partyId,
            userId: payload.userId,
        })
    });
    if (!res.ok) {
        addToast({
            title: `요청 오류`,
            description: `데이터를 수정하는데 문제가 발생하였습니다.`,
            color: "danger"
        });
        ui.setLoadingCancel(false);
        return;
    }
    const data: PartyResponse = await res.json();
    ui.dispatch(updatePartys({
        id: payload.raidId,
        partys: data.partys
    }));
    addToast({
        title: `취소 완료`,
        description: data.message,
        color: "success"
    });
    ui.setLoadingCancel(false);
}