import { ControlStage } from "@/app/checklist/ChecklistForm"

// 파티 인원
export type TeamCharacter = {
    partyIndex: number,
    position: number,
    nickname: string,
    userId: string,
    type: string,
    isManager: boolean
}

// 파티
export type Party = {
    id: string,
    name: string,
    date: string,
    content: string,
    stages: ControlStage[],
    teams: TeamCharacter[]
}

// 레이드 파티 정보
export type Raid = {
    id: string,
    name: string,
    managerId: string,
    managerNickname: string,
    avgLevel: number,
    link: string,
    isOpen: boolean,
    isPwd: boolean,
    pwd: string,
    members: string[],
    party: Party[]
}

export type ChangePartys = {
    id: string,
    partys: Party[]
}

// Dragable 타입들 - 순서 변경
export type TeamMember = {
    userId: string,
    nickname: string,
    type: string,
    isManager: boolean,
    partyIndex: number
}

export type DragableParty = {
    id: string,
    index: number,
    members: TeamMember[]
}

export type PartyResponse = {
    message: string,
    partys: Party[]
}