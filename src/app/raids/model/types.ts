import { ControlStage } from "@/app/checklist/model/types"
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
    party: Party[],
    weeklySchedule: WeeklyRaidSchedule[],
    weeklyScheduleMemberIds?: string[],
    scheduleTables: RaidScheduleTable[]
}

export type RaidScheduleWeekday =
    | "monday"
    | "tuesday"
    | "wednesday"
    | "thursday"
    | "friday"
    | "saturday"
    | "sunday"

export type WeeklyRaidScheduleMember = {
    userId: string,
    characterName: string,
    level: number,
    job: string
}

export type WeeklyRaidSchedule = {
    id: string,
    dayOfWeek: RaidScheduleWeekday,
    raidName: string,
    stages: ControlStage[],
    members: WeeklyRaidScheduleMember[]
}

export type RaidScheduleTable = {
    id: string,
    name: string,
    weeklySchedule: WeeklyRaidSchedule[],
    weeklyScheduleMemberIds: string[]
}

export const DEFAULT_WEEKLY_SCHEDULE: WeeklyRaidSchedule[] = [];

export function getDefaultWeeklySchedule(): WeeklyRaidSchedule[] {
    return [];
}

type RaidSource = Partial<Raid> & {
    id: string
}

export function normalizeRaid(raid: RaidSource): Raid {
    const scheduleTables = (raid.scheduleTables ?? []).map((table) => ({
        id: table.id ?? "",
        name: table.name ?? "",
        weeklySchedule: (table.weeklySchedule ?? []).map((schedule) => ({
            ...schedule,
            stages: schedule.stages ?? []
        })),
        weeklyScheduleMemberIds: table.weeklyScheduleMemberIds ?? []
    }));

    return {
        id: raid.id,
        name: raid.name ?? "",
        managerId: raid.managerId ?? "",
        managerNickname: raid.managerNickname ?? "",
        avgLevel: raid.avgLevel ?? 0,
        link: raid.link ?? "",
        isOpen: raid.isOpen ?? false,
        isPwd: raid.isPwd ?? false,
        pwd: raid.pwd ?? "",
        members: raid.members ?? [],
        party: raid.party ?? [],
        weeklySchedule: (raid.weeklySchedule ?? getDefaultWeeklySchedule()).map((schedule) => ({
            ...schedule,
            stages: schedule.stages ?? []
        })),
        weeklyScheduleMemberIds: raid.weeklyScheduleMemberIds ?? [],
        scheduleTables
    };
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
