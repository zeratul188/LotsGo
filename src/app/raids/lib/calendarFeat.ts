import { Boss } from "@/app/api/checklist/boss/route";
import { RaidMember } from "@/app/api/raids/members/route";
import { EMPTY_STAGE_DIFFICULTY } from "@/app/checklist/lib/checklistFeat";
import { ControlStage } from "@/app/checklist/model/types";
import { updateRaidData } from "@/app/store/partySlice";
import { AppDispatch } from "@/app/store/store";
import { SetStateFn } from "@/utiils/utils";
import { addToast } from "@heroui/react";
import { Raid, RaidScheduleTable, RaidScheduleWeekday, WeeklyRaidSchedule, WeeklyRaidScheduleMember, WeeklyRaidScheduleRaid } from "../model/types";

type CalendarRouter = {
    refresh: () => void
}

export type CalendarRow = WeeklyRaidSchedule & {
    dayTitle: string,
    memberMap: Record<string, WeeklyRaidScheduleMember>,
    showDayCell: boolean,
    dayRowSpan: number
}

export type EditingCell = {
    scheduleId: string,
    memberId: string
}

export const WEEK_LABELS: { key: RaidScheduleWeekday; title: string }[] = [
    { key: "wednesday", title: "수요일" },
    { key: "thursday", title: "목요일" },
    { key: "friday", title: "금요일" },
    { key: "saturday", title: "토요일" },
    { key: "sunday", title: "일요일" },
    { key: "monday", title: "월요일" },
    { key: "tuesday", title: "화요일" }
];

export function createScheduleId(prefix: string) {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
        return crypto.randomUUID();
    }

    return `${prefix}-${Date.now()}`;
}

export function normalizeScheduleTables(tables: RaidScheduleTable[]) {
    return tables.map((table) => ({
        ...table,
        weeklySchedule: (table.weeklySchedule ?? []).map((schedule) => ({
            ...schedule,
            raids: (schedule.raids ?? [{
                bossId: "",
                raidName: schedule.raidName ?? "",
                stages: schedule.stages ?? []
            }]).map((item) => ({
                bossId: item.bossId ?? "",
                raidName: item.raidName ?? "",
                stages: item.stages ?? []
            })),
            stages: schedule.stages ?? [],
            members: schedule.members ?? []
        })),
        weeklyScheduleMemberIds: table.weeklyScheduleMemberIds ?? []
    }));
}

export function buildCalendarRows(weeklySchedule: WeeklyRaidSchedule[]): CalendarRow[] {
    return WEEK_LABELS.flatMap((week) => {
        const schedules = weeklySchedule.filter((schedule) => schedule.dayOfWeek === week.key);

        if (schedules.length === 0) {
            return [{
                id: `empty-${week.key}`,
                dayOfWeek: week.key,
                raids: [],
                members: [],
                dayTitle: week.title,
                memberMap: {},
                showDayCell: true,
                dayRowSpan: 1
            }];
        }

        return schedules.map((schedule, index) => ({
            ...schedule,
            dayTitle: week.title,
            memberMap: schedule.members.reduce<Record<string, WeeklyRaidScheduleMember>>((acc, member) => {
                acc[member.userId] = member;
                return acc;
            }, {}),
            showDayCell: index === 0,
            dayRowSpan: index === 0 ? schedules.length : 0
        }));
    });
}

export function getAvailableRaidMemberIds(raid: Raid | null, visibleMemberIds: string[]) {
    const joinedMembers = raid?.members ?? [];
    return joinedMembers.filter((memberId) => !visibleMemberIds.includes(memberId));
}

export function getEditingSchedule(weeklySchedule: WeeklyRaidSchedule[], editingCell: EditingCell | null) {
    return editingCell ? weeklySchedule.find((schedule) => schedule.id === editingCell.scheduleId) ?? null : null;
}

export function getEditingMemberInfo(loadedMembers: RaidMember[], editingCell: EditingCell | null) {
    return editingCell ? loadedMembers.find((member) => member.id === editingCell.memberId) ?? null : null;
}

export function getTableMinWidth(visibleMemberIds: string[]) {
    const baseWidth = 56 + 218 + 100;
    return `${baseWidth + visibleMemberIds.length * 200}px`;
}

export function getCalendarStateFromRaid(raid: Raid | null) {
    const scheduleTables = normalizeScheduleTables(raid?.scheduleTables ?? []);
    return {
        scheduleTables,
        selectedTableId: scheduleTables[0]?.id ?? null
    };
}

export function hasSelectedScheduleStages(stages: ControlStage[]) {
    return stages.some((stage) => stage.difficulty !== EMPTY_STAGE_DIFFICULTY);
}

export function hasSelectedScheduleRaidItems(raids: Array<{ bossId: string; stages: ControlStage[] }>) {
    if (raids.length === 0 || raids.length > 5) return false;
    return raids.every((raid) => raid.bossId && hasSelectedScheduleStages(raid.stages));
}

export function printScheduleStages(stages: ControlStage[]) {
    const selectedStages = stages.filter((stage) => stage.difficulty !== EMPTY_STAGE_DIFFICULTY);
    const prints: Array<{ difficulty: string; result: string }> = [];

    for (const stage of selectedStages) {
        const last = prints[prints.length - 1];
        if (last && last.difficulty === stage.difficulty) {
            last.result += stage.stage.toString();
            continue;
        }

        prints.push({ difficulty: stage.difficulty, result: stage.stage.toString() });
    }

    return prints.map((item) => `${item.difficulty}${item.result}`).join(" ");
}

export function printScheduleRaidLabel(raids: WeeklyRaidScheduleRaid[]) {
    return raids.map((raid) => raid.raidName).join(" / ");
}

type PersistCalendarUI = {
    dispatch: AppDispatch,
    setScheduleTables: SetStateFn<RaidScheduleTable[]>,
    setSaving: SetStateFn<boolean>,
    router: CalendarRouter
}

type PersistCalendarPayload = {
    selectedRaid: Raid | null,
    nextScheduleTables: RaidScheduleTable[]
}

export async function persistCalendar(ui: PersistCalendarUI, payload: PersistCalendarPayload) {
    if (!payload.selectedRaid) return false;

    ui.setSaving(true);

    const res = await fetch(`/api/raids/partys`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            type: "changeScheduleTables",
            raidId: payload.selectedRaid.id,
            scheduleTables: payload.nextScheduleTables
        })
    });

    if (!res.ok) {
        let message = "일정표 저장 중 문제가 발생했습니다.";
        try {
            const data = await res.json();
            message = data?.error ?? message;
        } catch {}

        addToast({ title: "저장 실패", description: message, color: "danger" });
        ui.setSaving(false);
        return false;
    }

    const nextRaid: Raid = {
        ...payload.selectedRaid,
        scheduleTables: payload.nextScheduleTables,
        weeklySchedule: [],
        weeklyScheduleMemberIds: []
    };

    ui.setScheduleTables(payload.nextScheduleTables);
    ui.dispatch(updateRaidData(nextRaid));
    ui.router.refresh();
    ui.setSaving(false);
    return true;
}

export function createScheduleTable(name: string): RaidScheduleTable {
    return {
        id: createScheduleId("schedule-table"),
        name,
        weeklySchedule: [],
        weeklyScheduleMemberIds: []
    };
}

export function updateScheduleTable(
    scheduleTables: RaidScheduleTable[],
    selectedTableId: string | null,
    updater: (table: RaidScheduleTable) => RaidScheduleTable
) {
    return scheduleTables.map((table) => (table.id === selectedTableId ? updater(table) : table));
}

type AddVisibleMemberUI = PersistCalendarUI & {
    setAddMemberOpen: SetStateFn<boolean>
}

type AddVisibleMemberPayload = {
    selectedRaid: Raid | null,
    scheduleTables: RaidScheduleTable[],
    selectedTableId: string | null,
    memberId: string
}

export async function handleAddVisibleMember(ui: AddVisibleMemberUI, payload: AddVisibleMemberPayload) {
    const nextScheduleTables = updateScheduleTable(payload.scheduleTables, payload.selectedTableId, (table) => ({
        ...table,
        weeklyScheduleMemberIds: [...table.weeklyScheduleMemberIds, payload.memberId]
    }));

    const success = await persistCalendar(ui, {
        selectedRaid: payload.selectedRaid,
        nextScheduleTables
    });

    if (success) ui.setAddMemberOpen(false);
}

type RemoveVisibleMemberPayload = {
    selectedRaid: Raid | null,
    scheduleTables: RaidScheduleTable[],
    selectedTableId: string | null,
    memberId: string
}

export async function handleRemoveVisibleMember(ui: PersistCalendarUI, payload: RemoveVisibleMemberPayload) {
    const nextScheduleTables = updateScheduleTable(payload.scheduleTables, payload.selectedTableId, (table) => ({
        ...table,
        weeklyScheduleMemberIds: table.weeklyScheduleMemberIds.filter((id) => id !== payload.memberId),
        weeklySchedule: table.weeklySchedule.map((schedule) => ({
            ...schedule,
            members: schedule.members.filter((member) => member.userId !== payload.memberId)
        }))
    }));

    await persistCalendar(ui, {
        selectedRaid: payload.selectedRaid,
        nextScheduleTables
    });
}

type AddScheduleUI = PersistCalendarUI & {
    setAddScheduleOpen: SetStateFn<boolean>,
    setNewScheduleDay: SetStateFn<RaidScheduleWeekday>,
    setNewScheduleRaids: SetStateFn<Array<{ bossId: string; stages: ControlStage[] }>>,
    setEditingScheduleId?: SetStateFn<string | null>
}

type AddSchedulePayload = {
    selectedRaid: Raid | null,
    scheduleTables: RaidScheduleTable[],
    selectedTableId: string | null,
    newScheduleDay: RaidScheduleWeekday,
    newScheduleRaids: Array<{ bossId: string; stages: ControlStage[] }>,
    bosses: Boss[]
}

export async function handleAddSchedule(ui: AddScheduleUI, payload: AddSchedulePayload) {
    if (!hasSelectedScheduleRaidItems(payload.newScheduleRaids)) {
        addToast({ title: "입력 필요", description: "1~5개의 레이드와 관문 난이도를 모두 설정해 주세요.", color: "warning" });
        return;
    }

    const raids = payload.newScheduleRaids.map((item) => {
        const boss = payload.bosses.find((candidate) => candidate.id === item.bossId);
        return {
            bossId: item.bossId,
            raidName: boss?.simple || boss?.name || "",
            stages: item.stages.filter((stage) => stage.difficulty !== EMPTY_STAGE_DIFFICULTY)
        };
    }).filter((item) => item.raidName && item.stages.length > 0);

    if (raids.length === 0) {
        addToast({ title: "입력 필요", description: "레이드를 선택해 주세요.", color: "warning" });
        return;
    }

    const nextScheduleTables = updateScheduleTable(payload.scheduleTables, payload.selectedTableId, (table) => ({
        ...table,
        weeklySchedule: [
            ...table.weeklySchedule,
            {
                id: createScheduleId(payload.newScheduleDay),
                dayOfWeek: payload.newScheduleDay,
                raids,
                members: []
            }
        ]
    }));

    const success = await persistCalendar(ui, {
        selectedRaid: payload.selectedRaid,
        nextScheduleTables
    });

    if (success) {
        ui.setNewScheduleDay("wednesday");
        ui.setNewScheduleRaids([]);
        ui.setEditingScheduleId?.(null);
        ui.setAddScheduleOpen(false);
    }
}

type UpdateSchedulePayload = AddSchedulePayload & {
    scheduleId: string
}

export async function handleUpdateSchedule(ui: AddScheduleUI, payload: UpdateSchedulePayload) {
    if (!hasSelectedScheduleRaidItems(payload.newScheduleRaids)) {
        addToast({ title: "입력 필요", description: "1~5개의 레이드와 관문 난이도를 모두 설정해 주세요.", color: "warning" });
        return;
    }

    const raids = payload.newScheduleRaids.map((item) => {
        const boss = payload.bosses.find((candidate) => candidate.id === item.bossId);
        return {
            bossId: item.bossId,
            raidName: boss?.simple || boss?.name || "",
            stages: item.stages.filter((stage) => stage.difficulty !== EMPTY_STAGE_DIFFICULTY)
        };
    }).filter((item) => item.raidName && item.stages.length > 0);

    if (raids.length === 0) {
        addToast({ title: "입력 필요", description: "레이드를 선택해 주세요.", color: "warning" });
        return;
    }

    const nextScheduleTables = updateScheduleTable(payload.scheduleTables, payload.selectedTableId, (table) => ({
        ...table,
        weeklySchedule: table.weeklySchedule.map((schedule) => schedule.id !== payload.scheduleId ? schedule : {
            ...schedule,
            dayOfWeek: payload.newScheduleDay,
            raids
        })
    }));

    const success = await persistCalendar(ui, {
        selectedRaid: payload.selectedRaid,
        nextScheduleTables
    });

    if (success) {
        ui.setNewScheduleDay("wednesday");
        ui.setNewScheduleRaids([]);
        ui.setEditingScheduleId?.(null);
        ui.setAddScheduleOpen(false);
    }
}

type RemoveSchedulePayload = {
    selectedRaid: Raid | null,
    scheduleTables: RaidScheduleTable[],
    selectedTableId: string | null,
    scheduleId: string
}

export async function handleRemoveSchedule(ui: PersistCalendarUI, payload: RemoveSchedulePayload) {
    const nextScheduleTables = updateScheduleTable(payload.scheduleTables, payload.selectedTableId, (table) => ({
        ...table,
        weeklySchedule: table.weeklySchedule.filter((schedule) => schedule.id !== payload.scheduleId)
    }));

    await persistCalendar(ui, {
        selectedRaid: payload.selectedRaid,
        nextScheduleTables
    });
}

export function openCharacterModal(canEdit: boolean, memberId: string, scheduleId: string, setEditingCell: SetStateFn<EditingCell | null>) {
    if (!canEdit) return;
    setEditingCell({ scheduleId, memberId });
}

type SelectCharacterUI = PersistCalendarUI & {
    setEditingCell: SetStateFn<EditingCell | null>
}

type SelectCharacterPayload = {
    selectedRaid: Raid | null,
    scheduleTables: RaidScheduleTable[],
    selectedTableId: string | null,
    editingCell: EditingCell | null,
    character: WeeklyRaidScheduleMember
}

export async function handleSelectCharacter(ui: SelectCharacterUI, payload: SelectCharacterPayload) {
    if (!payload.editingCell) return;
    const editingCell = payload.editingCell;

    const nextScheduleTables = updateScheduleTable(payload.scheduleTables, payload.selectedTableId, (table) => ({
        ...table,
        weeklySchedule: table.weeklySchedule.map((schedule) => {
            if (schedule.id !== editingCell.scheduleId) return schedule;
            return {
                ...schedule,
                members: [
                    ...schedule.members.filter((member) => member.userId !== editingCell.memberId),
                    payload.character
                ]
            };
        })
    }));

    const success = await persistCalendar(ui, {
        selectedRaid: payload.selectedRaid,
        nextScheduleTables
    });

    if (success) ui.setEditingCell(null);
}

type ClearCharacterPayload = {
    selectedRaid: Raid | null,
    scheduleTables: RaidScheduleTable[],
    selectedTableId: string | null,
    editingCell: EditingCell | null
}

export async function handleClearCharacter(ui: SelectCharacterUI, payload: ClearCharacterPayload) {
    if (!payload.editingCell) return;
    const editingCell = payload.editingCell;

    const nextScheduleTables = updateScheduleTable(payload.scheduleTables, payload.selectedTableId, (table) => ({
        ...table,
        weeklySchedule: table.weeklySchedule.map((schedule) => {
            if (schedule.id !== editingCell.scheduleId) return schedule;
            return {
                ...schedule,
                members: schedule.members.filter((member) => member.userId !== editingCell.memberId)
            };
        })
    }));

    const success = await persistCalendar(ui, {
        selectedRaid: payload.selectedRaid,
        nextScheduleTables
    });

    if (success) ui.setEditingCell(null);
}
