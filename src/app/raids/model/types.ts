import { ControlStage } from "@/app/checklist/ChecklistForm"
import { ChecklistItem } from "@/app/store/checklistSlice"

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

// 레이드 일정
export type RaidWork = {
    name: string,
    raidName: string,
    date: Date,
    content: string,
    stages: ControlStage[],
}

// 파티장 위임 리스트
export type MemberBox = {
    userId: string,
    nickname: string,
    level: number,
    job: string,
    server: string
}

// 파티 탈퇴 시 데이터 처림 묶음
export type LeaveDataBox = {
    raidId: string,
    party: Party[],
    members: string[]
}
export type LeaveData = {
    message: string,
    leaveBox: LeaveDataBox
}

// 남은 콘텐츠 관련 묶음
export type RemainCharacter = {
    nickname: string,
    job: string,
    level: number,
    server: string,
    isGold: boolean,
    items: ChecklistItem[]
}