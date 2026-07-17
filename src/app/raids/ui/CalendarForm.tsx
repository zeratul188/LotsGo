'use client'
import DeleteIcon from "@/app/icons/DeleteIcon";
import AddIcon from "@/app/icons/AddIcon";
import JobEmblemIcon from "@/Icons/JobEmblemIcon";
import SearchEmptyIcon from "@/Icons/SearchEmptyIcon";
import { Boss } from "@/app/api/checklist/boss/route";
import { EMPTY_STAGE_DIFFICULTY, createDefaultWeekStages, getBackgroundByStage, getDifficultyByStage, getWeekStages } from "@/app/checklist/lib/checklistFeat";
import { ControlStage } from "@/app/checklist/model/types";
import { AppDispatch, RootState } from "@/app/store/store";
import { Button, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Select, SelectItem, Tab, Tabs, Tooltip } from "@heroui/react";
import clsx from "clsx";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useMobileQuery } from "@/utiils/utils";
import { RaidScheduleTable, RaidScheduleWeekday } from "../model/types";
import {
    buildCalendarRows,
    createScheduleTable,
    EditingCell,
    getAvailableRaidMemberIds,
    getCalendarStateFromRaid,
    getEditingMemberInfo,
    getEditingSchedule,
    getTableMinWidth,
    handleAddSchedule,
    handleAddVisibleMember,
    handleClearCharacter,
    handleRemoveSchedule,
    handleRemoveVisibleMember,
    handleSelectCharacter,
    handleUpdateSchedule,
    hasSelectedScheduleRaidItems,
    hasSelectedScheduleStages,
    openCharacterModal,
    persistCalendar,
    printScheduleRaidLabel,
    printScheduleStages,
    WEEK_LABELS
} from "../lib/calendarFeat";

const FixedLineAd = dynamic(() => import("@/app/ad/FixedLineAd"), { ssr: false });

const calendarModalClassNames = {
    backdrop: "bg-black/60 backdrop-blur-sm",
    base: "border border-default-200 bg-white shadow-2xl dark:border-white/10 dark:bg-[#171717]",
    header: "border-b border-default-200 px-5 py-4 dark:border-white/10",
    body: "gap-4 px-5 py-5",
    footer: "border-t border-default-200 px-5 py-4 dark:border-white/10"
};

const calendarInputClassNames = {
    inputWrapper: "border-default-200 bg-default-50/70 shadow-none hover:border-default-300 dark:border-white/10 dark:bg-white/[0.04]"
};

const calendarSelectClassNames = {
    trigger: "border-default-200 bg-default-50/70 shadow-none hover:border-default-300 dark:border-white/10 dark:bg-white/[0.04]"
};

type CalendarDeleteTarget =
    | { type: "table" }
    | { type: "member", memberId: string }
    | { type: "schedule", scheduleId: string };

function CalendarModalHeader({ title, description }: { title: string, description: string }) {
    return (
        <div className="space-y-1">
            <h2 className="text-lg font-bold text-foreground">{title}</h2>
            <p className="text-sm font-normal text-default-500">{description}</p>
        </div>
    )
}

function CalendarOutlineIcon({ className = "h-5 w-5" }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="5" width="18" height="16" rx="2"/>
            <path d="M16 3v4M8 3v4M3 10h18"/>
        </svg>
    )
}

function UsersOutlineIcon({ className = "h-5 w-5" }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
    )
}

type CalendarComponentProps = {
    dispatch: AppDispatch,
    bosses: Boss[]
}

export function CalendarComponent({ dispatch, bosses }: CalendarComponentProps) {
    type CharacterSourceTab = "expeditions" | "checklist";
    type ScheduleRaidFormItem = { bossId: string; stages: ControlStage[] };

    const router = useRouter();
    const selectedRaid = useSelector((state: RootState) => state.party.selectedRaid);
    const loadedMembers = useSelector((state: RootState) => state.party.members);
    const userId = useSelector((state: RootState) => state.party.userId);

    const [scheduleTables, setScheduleTables] = useState<RaidScheduleTable[]>([]);
    const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
    const [isAddTableOpen, setAddTableOpen] = useState(false);
    const [isAddMemberOpen, setAddMemberOpen] = useState(false);
    const [isAddScheduleOpen, setAddScheduleOpen] = useState(false);
    const [editingScheduleId, setEditingScheduleId] = useState<string | null>(null);
    const [editingCell, setEditingCell] = useState<EditingCell | null>(null);
    const [characterSourceTab, setCharacterSourceTab] = useState<CharacterSourceTab>("expeditions");
    const [newTableName, setNewTableName] = useState("");
    const [newScheduleDay, setNewScheduleDay] = useState<RaidScheduleWeekday>("wednesday");
    const [newScheduleRaids, setNewScheduleRaids] = useState<ScheduleRaidFormItem[]>([]);
    const [isSaving, setSaving] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<CalendarDeleteTarget | null>(null);
    const isMobile = useMobileQuery();

    const selectedTable = useMemo(() => scheduleTables.find((table) => table.id === selectedTableId) ?? null, [scheduleTables, selectedTableId]);
    const weeklySchedule = selectedTable?.weeklySchedule ?? [];
    const visibleMemberIds = selectedTable?.weeklyScheduleMemberIds ?? [];
    const rows = useMemo(() => buildCalendarRows(weeklySchedule), [weeklySchedule]);
    const availableRaidMemberIds = useMemo(() => getAvailableRaidMemberIds(selectedRaid, visibleMemberIds), [selectedRaid, visibleMemberIds]);
    const editingSchedule = useMemo(() => getEditingSchedule(weeklySchedule, editingCell), [editingCell, weeklySchedule]);
    const editingMemberInfo = useMemo(() => getEditingMemberInfo(loadedMembers, editingCell), [editingCell, loadedMembers]);
    const selectableCharacters = useMemo(() => {
        if (!editingMemberInfo) return [];
        const source = characterSourceTab === "expeditions" ? editingMemberInfo.expeditions : editingMemberInfo.checklist;
        return source.slice().sort((a, b) => b.level - a.level);
    }, [characterSourceTab, editingMemberInfo]);
    const tableMinWidth = useMemo(() => getTableMinWidth(visibleMemberIds), [visibleMemberIds]);
    const isValidNewSchedule = useMemo(() => hasSelectedScheduleRaidItems(newScheduleRaids), [newScheduleRaids]);
    const isEditingSchedule = editingScheduleId !== null;
    const deleteTargetLabel = useMemo(() => {
        if (!deleteTarget) return "";
        if (deleteTarget.type === "table") return selectedTable?.name ?? "선택한 일정표";
        if (deleteTarget.type === "member") {
            const member = loadedMembers.find((item) => item.id === deleteTarget.memberId);
            return member?.nickname ? `${member.nickname} (${deleteTarget.memberId})` : deleteTarget.memberId;
        }
        const schedule = weeklySchedule.find((item) => item.id === deleteTarget.scheduleId);
        return schedule ? printScheduleRaidLabel(schedule.raids) : "선택한 레이드 일정";
    }, [deleteTarget, loadedMembers, selectedTable?.name, weeklySchedule]);

    function addScheduleRaidItem() {
        setNewScheduleRaids((prev) => prev.length >= 5 ? prev : [...prev, { bossId: "", stages: [] }]);
    }

    function updateScheduleRaidBoss(index: number, bossId: string) {
        setNewScheduleRaids((prev) => prev.map((item, itemIndex) => itemIndex !== index ? item : {
            bossId,
            stages: bossId ? createDefaultWeekStages(bosses, bossId) : []
        }));
    }

    function updateScheduleRaidStages(index: number, nextStages: ControlStage[]) {
        setNewScheduleRaids((prev) => prev.map((item, itemIndex) => itemIndex !== index ? item : {
            ...item,
            stages: nextStages
        }));
    }

    function removeScheduleRaidItem(index: number) {
        setNewScheduleRaids((prev) => prev.filter((_, itemIndex) => itemIndex !== index));
    }

    function resetScheduleEditor() {
        setNewScheduleDay("wednesday");
        setNewScheduleRaids([]);
        setEditingScheduleId(null);
    }

    function openAddScheduleModal() {
        setEditingScheduleId(null);
        setNewScheduleDay("wednesday");
        setNewScheduleRaids([{ bossId: "", stages: [] }]);
        setAddScheduleOpen(true);
    }

    function openEditScheduleModal(scheduleId: string) {
        const schedule = weeklySchedule.find((item) => item.id === scheduleId);
        if (!schedule) return;

        setEditingScheduleId(scheduleId);
        setNewScheduleDay(schedule.dayOfWeek);
        setNewScheduleRaids(schedule.raids.map((raid) => ({
            bossId: raid.bossId,
            stages: structuredClone(raid.stages)
        })));
        setAddScheduleOpen(true);
    }

    async function confirmCalendarDelete(onClose: () => void) {
        if (!deleteTarget || !selectedRaid) return;

        if (deleteTarget.type === "table") {
            if (!selectedTable) return;
            const nextScheduleTables = scheduleTables.filter((table) => table.id !== selectedTable.id);
            const success = await persistCalendar({ dispatch, setScheduleTables, setSaving, router }, { selectedRaid, nextScheduleTables });
            if (success) setSelectedTableId(nextScheduleTables[0]?.id ?? null);
        } else if (deleteTarget.type === "member") {
            await handleRemoveVisibleMember(
                { dispatch, setScheduleTables, setSaving, router },
                { selectedRaid, scheduleTables, selectedTableId, memberId: deleteTarget.memberId }
            );
        } else {
            await handleRemoveSchedule(
                { dispatch, setScheduleTables, setSaving, router },
                { selectedRaid, scheduleTables, selectedTableId, scheduleId: deleteTarget.scheduleId }
            );
        }

        setDeleteTarget(null);
        onClose();
    }

    useEffect(() => {
        const { scheduleTables: nextScheduleTables, selectedTableId: nextSelectedTableId } = getCalendarStateFromRaid(selectedRaid);
        setScheduleTables(nextScheduleTables);
        setSelectedTableId((prev) => {
            if (prev && nextScheduleTables.some((table) => table.id === prev)) {
                return prev;
            }
            return nextSelectedTableId;
        });
    }, [selectedRaid]);

    return (
        <div className="w-full pt-2">
            {isMobile ? null : (
                <div className="mt-8 mb-4 flex w-full justify-center overflow-hidden">
                    <div className="mx-4 flex w-full max-w-[1240px] justify-center rounded-2xl border border-default-200 bg-default-50 p-4 dark:border-white/10 dark:bg-white/[0.03]">
                        <FixedLineAd isLoaded={true} />
                    </div>
                </div>
            )}
            <div className="mt-2 flex w-full flex-col gap-5">
                <section className="rounded-2xl border border-default-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-[#171717] sm:p-5">
                    <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary"><CalendarOutlineIcon/></span>
                                <h2 className="text-lg font-bold text-foreground">주간 일정표 관리</h2>
                            </div>
                            <p className="mt-2 text-sm text-default-500">파티별 일정표를 선택하고 레이드 일정과 참여 인원을 관리합니다.</p>
                        </div>
                        {selectedTable ? (
                            <div className="flex gap-2 text-xs font-semibold">
                                <span className="rounded-full bg-primary/10 px-3 py-1.5 text-primary">일정 {weeklySchedule.length}개</span>
                                <span className="rounded-full bg-secondary/10 px-3 py-1.5 text-secondary">인원 {visibleMemberIds.length}명</span>
                            </div>
                        ) : null}
                    </div>
                    <div className="grid gap-3 lg:grid-cols-[minmax(240px,1fr)_auto_auto_1fr_auto_auto] lg:items-end">
                        <div className="min-w-[220px]">
                            <Select aria-label="일정표 선택" label="일정표" placeholder="일정표를 선택하세요" radius="lg" variant="bordered" classNames={calendarSelectClassNames} disallowEmptySelection={scheduleTables.length > 0} selectedKeys={selectedTableId ? new Set([selectedTableId]) : new Set([])} onSelectionChange={(keys) => {
                                const value = Array.from(keys)[0] as string | undefined;
                                if (!value) return;
                                setSelectedTableId(value);
                            }} isDisabled={scheduleTables.length === 0 || isSaving}>
                                {scheduleTables.map((table) => <SelectItem key={table.id}>{table.name}</SelectItem>)}
                            </Select>
                        </div>
                        <Button radius="lg" size="lg" color="secondary" variant="flat" startContent={<AddIcon size={19}/>} className="font-semibold" isDisabled={isSaving} onPress={() => {
                            setNewTableName(`일정표 ${scheduleTables.length + 1}`);
                            setAddTableOpen(true);
                        }}>일정표 추가</Button>
                        <Button radius="lg" size="lg" color="danger" variant="flat" startContent={<DeleteIcon className="h-4 w-4"/>} className="font-semibold" isDisabled={!selectedTable || isSaving} onPress={() => setDeleteTarget({ type: "table" })}>일정표 삭제</Button>
                        <div className="grow" />
                        <Button radius="lg" size="lg" color="primary" startContent={<CalendarOutlineIcon/>} className="font-semibold shadow-lg shadow-primary/20" onPress={openAddScheduleModal} isDisabled={!selectedTable || isSaving}>일정 추가</Button>
                        <Button radius="lg" size="lg" color="secondary" startContent={<UsersOutlineIcon/>} className="font-semibold shadow-lg shadow-secondary/20" onPress={() => setAddMemberOpen(true)} isDisabled={!selectedTable || availableRaidMemberIds.length === 0 || isSaving}>인원 추가</Button>
                    </div>
                    </section>
                {selectedTable ? (
                    <div className="overflow-x-auto rounded-2xl border border-default-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#171717]">
                        <div className="sticky left-0 flex min-w-full items-center justify-between border-b border-default-200 bg-default-50/80 px-5 py-4 dark:border-white/10 dark:bg-white/[0.03]">
                            <div>
                                <h3 className="font-bold text-foreground">{selectedTable.name}</h3>
                                <p className="mt-1 text-xs text-default-500">수요일부터 화요일까지 반복되는 주간 레이드 일정입니다.</p>
                            </div>
                            <span className="rounded-full bg-success/10 px-3 py-1.5 text-xs font-semibold text-success">공유 중</span>
                        </div>
                        <div className="min-w-full">
                            <table className="table-fixed border-collapse text-sm" style={{ width: `max(100%, ${tableMinWidth})` }}>
                                <colgroup>
                                    <col style={{ width: "56px" }} />
                                    <col style={{ width: "218px" }} />
                                    {visibleMemberIds.map((memberId) => <col key={memberId} style={{ width: "200px" }} />)}
                                    <col />
                                </colgroup>
                                <thead>
                                    <tr className="bg-default-100/80 dark:bg-white/[0.05]">
                                        <th className="whitespace-nowrap border-b border-r border-default-200 px-2 py-3.5 text-center text-xs font-bold uppercase tracking-wide text-default-500 dark:border-white/10">요일</th>
                                        <th className="whitespace-nowrap border-b border-r border-default-200 px-3 py-3.5 text-left text-xs font-bold uppercase tracking-wide text-default-500 dark:border-white/10">레이드</th>
                                        {visibleMemberIds.map((memberId) => {
                                            const memberInfo = loadedMembers.find((member) => member.id === memberId);
                                            const representativeName = memberInfo?.nickname ?? memberId;
                                            return (
                                                <th key={memberId} className="border-b border-r border-default-200 px-3 py-3 text-left dark:border-white/10">
                                                    <div className={clsx("flex flex-row items-center gap-1", memberId === userId ? "text-primary" : "") }>
                                                        <div className="grow flex flex-col items-start justify-between">
                                                            <p className="text-sm font-bold">{representativeName}</p>
                                                            <p className="text-[11px] font-normal text-default-400">{memberId}</p>
                                                        </div>
                                                        <Button isIconOnly size="sm" radius="lg" variant="flat" color="danger" aria-label={`${representativeName} 인원 삭제`} isDisabled={isSaving} onPress={() => setDeleteTarget({ type: "member", memberId })} className="h-8 min-h-8 w-8 min-w-8">
                                                            <DeleteIcon className="h-5 w-5" />
                                                        </Button>
                                                    </div>
                                                </th>
                                            );
                                        })}
                                        <th className="min-w-[112px] border-b border-default-200 px-3 py-3 text-left text-xs font-bold uppercase tracking-wide text-default-500 dark:border-white/10">관리</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rows.map((row, index) => (
                                        <tr key={row.id} className={clsx("transition-colors hover:bg-primary-50/30 dark:hover:bg-primary-500/[0.04]", index % 2 === 0 ? "bg-white dark:bg-[#171717]" : "bg-default-50/60 dark:bg-white/[0.02]")}>
                                            {row.showDayCell ? (
                                                <td rowSpan={row.dayRowSpan} className={clsx("whitespace-nowrap border-b border-r border-default-200 px-1 py-3 align-middle text-center font-medium dark:border-white/10", row.dayOfWeek === "saturday" || row.dayOfWeek === "sunday" ? "text-success-700 dark:text-success-300" : "text-foreground")}>
                                                    <span className={clsx("mx-auto block w-fit rounded-lg px-2 py-1 text-xs font-bold", row.dayOfWeek === "saturday" || row.dayOfWeek === "sunday" ? "bg-success-50 dark:bg-success-500/10" : "bg-default-100 dark:bg-white/[0.06]")}>{row.dayTitle}</span>
                                                </td>
                                            ) : null}
                                            <td className="border-b border-r border-default-200 px-2 py-3 align-middle text-center font-medium dark:border-white/10">
                                                <div className="flex flex-col items-start gap-1 px-1">
                                                    {row.raids.length === 0 ? <span className="block overflow-hidden text-ellipsis whitespace-nowrap">-</span> : row.raids.map((raid, raidIndex) => (
                                                        <div key={`${row.id}-raid-${raidIndex}`} className="flex w-full flex-col items-start gap-1 rounded-xl border border-default-200 bg-default-50 px-3 py-2.5 dark:border-white/10 dark:bg-white/[0.03]">
                                                            <div className="flex w-full items-center gap-2">
                                                                <span className="block min-w-0 overflow-hidden text-ellipsis whitespace-nowrap font-medium">{raid.raidName}</span>
                                                                <div className="ml-auto flex shrink-0 flex-nowrap items-center gap-1">
                                                                    {raid.stages.map((stage, stageIndex) => (
                                                                        <Tooltip key={`${row.id}-raid-${raidIndex}-stage-${stageIndex}`} showArrow content={`${stage.difficulty} ${stage.stage}관`}>
                                                                            <div
                                                                                className={clsx(
                                                                                    "h-[10px] w-[10px] rounded-full opacity-75",
                                                                                    getBackgroundByStage(stage.difficulty, false)
                                                                                )}
                                                                            />
                                                                        </Tooltip>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </td>
                                            {visibleMemberIds.map((memberId) => {
                                                const value = row.memberMap[memberId];
                                                const canEditCell = !row.id.startsWith("empty-");
                                                return (
                                                    <td key={`${row.id}-${memberId}`} className="border-b border-r border-default-200 px-2 py-2 dark:border-white/10">
                                                        <button type="button" disabled={!canEditCell || isSaving} onClick={() => openCharacterModal(canEditCell, memberId, row.id, setEditingCell)} className={clsx("flex min-h-[52px] w-full items-center rounded-xl border px-2.5 py-2 text-left transition", canEditCell ? value ? "border-transparent bg-transparent hover:border-default-200 hover:bg-default-50 dark:hover:border-white/10 dark:hover:bg-white/[0.04]" : "border-dashed border-primary/30 bg-primary-50/70 hover:border-primary/60 hover:bg-primary-100 dark:bg-primary-500/10 dark:hover:bg-primary-500/20" : "cursor-default border-transparent bg-transparent", value ? "justify-start" : "justify-center")}>
                                                            {value ? (
                                                                <div className="flex w-full items-center gap-2">
                                                                    <JobEmblemIcon job={value.job} size={28} className="shrink-0 text-black dark:text-white" />
                                                                    <div className="flex min-w-0 flex-col">
                                                                        <span className="truncate text-sm font-medium">{value.characterName}</span>
                                                                        <span className="truncate text-[11px] text-default-500 dark:text-default-400">{value.job} · Lv.{value.level.toLocaleString()}</span>
                                                                    </div>
                                                                </div>
                                                            ) : canEditCell ? <span className="text-xs text-primary-600 dark:text-primary-300">캐릭터 선택</span> : <span className="text-default-300 dark:text-default-600">-</span>}
                                                        </button>
                                                    </td>
                                                );
                                            })}
                                            <td className="min-w-[112px] border-b border-default-200 px-3 py-3 dark:border-white/10">
                                                {row.id.startsWith("empty-") ? null : (
                                                    <div className="flex items-center justify-start gap-2">
                                                        <Button size="sm" radius="lg" variant="flat" color="success" className="font-semibold" isDisabled={isSaving} onPress={() => openEditScheduleModal(row.id)}>수정</Button>
                                                        <Button size="sm" radius="lg" variant="flat" color="danger" className="font-semibold" isDisabled={isSaving} onPress={() => setDeleteTarget({ type: "schedule", scheduleId: row.id })}>삭제</Button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <div className="flex min-h-[280px] flex-col items-center justify-center rounded-2xl border border-dashed border-default-300 bg-default-50/40 px-6 text-center dark:border-default-100/20 dark:bg-default-100/5">
                        <SearchEmptyIcon size={72} className="mb-4 text-default-400 dark:text-default-500" />
                        <p className="text-base font-semibold text-default-700 dark:text-default-200">
                            아직 만든 일정표가 없습니다
                        </p>
                        <p className="mt-2 max-w-[360px] text-sm text-default-500 dark:text-default-400">
                            위 일정표 관리 영역에서 새 일정표를 추가한 뒤, 레이드 일정과 인원을 채워서 사용하세요.
                        </p>
                    </div>
                )}
            </div>
            <Modal isOpen={isAddTableOpen} onOpenChange={setAddTableOpen} radius="lg" classNames={calendarModalClassNames}>
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader>
                                <CalendarModalHeader title="새 일정표 만들기" description="파티에서 함께 사용할 주간 일정표의 이름을 입력하세요."/>
                            </ModalHeader>
                            <ModalBody>
                                <Input
                                    autoFocus
                                    label="일정표 이름"
                                    placeholder="일정표 이름을 입력하세요"
                                    radius="lg"
                                    variant="bordered"
                                    value={newTableName}
                                    onValueChange={setNewTableName}
                                    classNames={calendarInputClassNames}
                                />
                            </ModalBody>
                            <ModalFooter>
                                <Button radius="lg" variant="light" onPress={onClose}>취소</Button>
                                <Button
                                    color="primary"
                                    radius="lg"
                                    className="min-w-28 font-semibold"
                                    isDisabled={!newTableName.trim() || isSaving}
                                    onPress={async () => {
                                        if (!selectedRaid) return;
                                        const nextScheduleTables = [...scheduleTables, createScheduleTable(newTableName.trim())];
                                        const success = await persistCalendar(
                                            { dispatch, setScheduleTables, setSaving, router },
                                            { selectedRaid, nextScheduleTables }
                                        );
                                        if (success) {
                                            setSelectedTableId(nextScheduleTables[nextScheduleTables.length - 1].id);
                                            setNewTableName("");
                                            onClose();
                                        }
                                    }}
                                >
                                    일정표 만들기
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>

            <Modal isOpen={isAddMemberOpen} onOpenChange={setAddMemberOpen} radius="lg" size="lg" scrollBehavior="inside" classNames={calendarModalClassNames}>
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader>
                                <CalendarModalHeader title="일정표 인원 추가" description="일정표에 표시하고 캐릭터 일정을 공유할 파티원을 선택하세요."/>
                            </ModalHeader>
                            <ModalBody>
                                <div className="flex max-h-[420px] flex-col gap-2 overflow-y-auto pr-1">
                                    {availableRaidMemberIds.length === 0 ? (
                                        <div className="rounded-xl border border-dashed border-default-300 bg-default-50 px-4 py-8 text-center text-sm text-default-500 dark:border-white/15 dark:bg-white/[0.03]">추가할 수 있는 멤버가 없습니다.</div>
                                    ) : availableRaidMemberIds.map((memberId) => {
                                        const memberInfo = loadedMembers.find((member) => member.id === memberId);
                                        return (
                                            <button key={memberId} type="button" onClick={() => void handleAddVisibleMember({ dispatch, setScheduleTables, setSaving, router, setAddMemberOpen }, { selectedRaid, scheduleTables, selectedTableId, memberId })} disabled={isSaving} className="group flex items-center gap-3 rounded-xl border border-default-200 bg-default-50/60 px-4 py-3 text-left transition hover:border-secondary/50 hover:bg-secondary-50/40 disabled:opacity-50 dark:border-white/10 dark:bg-white/[0.03] dark:hover:bg-secondary-500/10">
                                                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary/10 text-secondary"><UsersOutlineIcon/></span>
                                                <div className="min-w-0 grow">
                                                    <div className="truncate font-semibold text-foreground">{memberInfo?.nickname ?? memberId}</div>
                                                    <div className="truncate text-xs text-default-500">{memberId}</div>
                                                </div>
                                                <span className="text-xs font-semibold text-secondary opacity-0 transition group-hover:opacity-100">추가</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </ModalBody>
                            <ModalFooter><Button radius="lg" variant="light" onPress={onClose}>닫기</Button></ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>

            <Modal isOpen={isAddScheduleOpen} onOpenChange={(open) => {
                setAddScheduleOpen(open);
                if (!open) resetScheduleEditor();
            }} radius="lg" size="2xl" scrollBehavior="inside" classNames={calendarModalClassNames}>
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader>
                                <CalendarModalHeader
                                    title={isEditingSchedule ? "주간 레이드 일정 수정" : "주간 레이드 일정 추가"}
                                    description="요일과 레이드별 관문 난이도를 설정해 한 묶음의 일정을 만듭니다."
                                />
                            </ModalHeader>
                            <ModalBody>
                                <div className="flex flex-col gap-3">
                                    <Select label="요일" radius="lg" variant="bordered" classNames={calendarSelectClassNames} selectedKeys={new Set([newScheduleDay])} onSelectionChange={(keys) => {
                                        const value = Array.from(keys)[0] as RaidScheduleWeekday | undefined;
                                        if (value) setNewScheduleDay(value);
                                    }}>
                                        {WEEK_LABELS.map((week) => <SelectItem key={week.key}>{week.title}</SelectItem>)}
                                    </Select>
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-medium text-default-700 dark:text-default-300">레이드 묶음</p>
                                        <Button size="sm" radius="lg" color="success" variant="flat" startContent={<AddIcon size={16}/>} className="font-semibold" isDisabled={newScheduleRaids.length >= 5} onPress={addScheduleRaidItem}>레이드 추가</Button>
                                    </div>
                                    <div className="flex flex-col gap-4">
                                        {newScheduleRaids.map((raidItem, raidIndex) => {
                                            const selectedBoss = bosses.find((boss) => boss.id === raidItem.bossId);
                                            return (
                                                <div key={`schedule-raid-item-${raidIndex}`} className="rounded-2xl border border-default-200 bg-default-50/60 p-4 dark:border-white/10 dark:bg-white/[0.03]">
                                                    <div className="mb-3 flex items-center gap-2">
                                                        <p className="grow text-sm font-semibold">레이드 {raidIndex + 1}</p>
                                                        <Button size="sm" radius="lg" variant="flat" color="danger" isDisabled={newScheduleRaids.length <= 1} onPress={() => removeScheduleRaidItem(raidIndex)}>삭제</Button>
                                                    </div>
                                                    <div className="flex flex-col gap-3">
                                                        <Select label="레이드" radius="lg" variant="bordered" classNames={calendarSelectClassNames} selectedKeys={raidItem.bossId ? new Set([raidItem.bossId]) : new Set([])} onSelectionChange={(keys) => {
                                                            const value = Array.from(keys)[0] as string | undefined;
                                                            updateScheduleRaidBoss(raidIndex, value ?? "");
                                                        }}>
                                                            {bosses.map((boss) => <SelectItem key={boss.id}>{boss.name}</SelectItem>)}
                                                        </Select>
                                                        {selectedBoss ? (
                                                            <div className="flex flex-col gap-3">
                                                                {getWeekStages(bosses, selectedBoss.id).map((level, stageIndex) => (
                                                                    <div key={`${selectedBoss.id}-${level}`} className="rounded-xl border border-default-200 bg-white p-3 dark:border-white/10 dark:bg-white/[0.03]">
                                                                        <div className="mb-1 flex items-center justify-between">
                                                                            <h3 className="font-bold">{level}관문</h3>
                                                                            <span className="text-xs text-default-500 dark:text-default-400">{raidItem.stages[stageIndex]?.difficulty !== EMPTY_STAGE_DIFFICULTY ? raidItem.stages[stageIndex]?.difficulty : "난이도 선택"}</span>
                                                                        </div>
                                                                        <Tabs fullWidth radius="lg" color="primary" classNames={{ tabList: "bg-default-100 p-1 dark:bg-white/[0.06]", tabContent: "font-semibold" }} selectedKey={raidItem.stages.length > stageIndex ? raidItem.stages[stageIndex].difficulty : EMPTY_STAGE_DIFFICULTY} onSelectionChange={(key) => {
                                                                            const diff = key.toString();
                                                                            if (raidItem.stages.length <= stageIndex) return;
                                                                            const cloneStages = structuredClone(raidItem.stages);
                                                                            if (stageIndex > 0 && cloneStages[stageIndex - 1].difficulty === EMPTY_STAGE_DIFFICULTY) return;
                                                                            cloneStages[stageIndex].difficulty = diff;
                                                                            if (diff === EMPTY_STAGE_DIFFICULTY) {
                                                                                for (let i = stageIndex; i < cloneStages.length; i++) cloneStages[i].difficulty = EMPTY_STAGE_DIFFICULTY;
                                                                            }
                                                                            updateScheduleRaidStages(raidIndex, cloneStages);
                                                                        }}>
                                                                            {getDifficultyByStage(bosses, selectedBoss.id, level).map((diff) => <Tab key={diff} title={diff} />)}
                                                                        </Tabs>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        ) : null}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </ModalBody>
                            <ModalFooter>
                                <Button variant="light" radius="lg" onPress={onClose}>취소</Button>
                                <Button color="primary" radius="lg" className="min-w-28 font-semibold" isLoading={isSaving} isDisabled={!isValidNewSchedule} onPress={() => {
                                    if (editingScheduleId) {
                                        void handleUpdateSchedule({ dispatch, setScheduleTables, setSaving, router, setAddScheduleOpen, setNewScheduleDay, setNewScheduleRaids, setEditingScheduleId }, { selectedRaid, scheduleTables, selectedTableId, scheduleId: editingScheduleId, newScheduleDay, newScheduleRaids, bosses });
                                        return;
                                    }
                                    void handleAddSchedule({ dispatch, setScheduleTables, setSaving, router, setAddScheduleOpen, setNewScheduleDay, setNewScheduleRaids, setEditingScheduleId }, { selectedRaid, scheduleTables, selectedTableId, newScheduleDay, newScheduleRaids, bosses });
                                }}>{isEditingSchedule ? "저장" : "추가"}</Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>

            <Modal isOpen={editingCell !== null} onOpenChange={(open) => { if (!open) { setEditingCell(null); setCharacterSourceTab("expeditions"); } }} radius="lg" size="lg" scrollBehavior="inside" classNames={calendarModalClassNames}>
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader>
                                <CalendarModalHeader
                                    title={editingSchedule ? printScheduleRaidLabel(editingSchedule.raids) : "레이드 참여 캐릭터 선택"}
                                    description={`${editingCell?.memberId ?? ""} · 참여할 캐릭터를 선택하세요.`}
                                />
                            </ModalHeader>
                            <ModalBody>
                                <div className="flex flex-col gap-2">
                                    {!editingMemberInfo ? (
                                        <div className="rounded-lg bg-default-100 px-3 py-4 text-sm text-default-500 dark:bg-default-100/10 dark:text-default-400">캐릭터 정보를 찾을 수 없습니다.</div>
                                    ) : (
                                        <>
                                            <Tabs
                                                selectedKey={characterSourceTab}
                                                onSelectionChange={(key) => setCharacterSourceTab(key.toString() as CharacterSourceTab)}
                                                radius="lg"
                                                color="primary"
                                                fullWidth
                                                classNames={{ tabList: "bg-default-100 p-1 dark:bg-white/[0.06]", cursor: "bg-white shadow-sm dark:bg-white/10", tabContent: "font-semibold group-data-[selected=true]:text-primary" }}
                                            >
                                                <Tab key="expeditions" title="원정대" />
                                                <Tab key="checklist" title="숙제" />
                                            </Tabs>
                                            {selectableCharacters.length === 0 ? (
                                                <div className="rounded-lg bg-default-100 px-3 py-4 text-sm text-default-500 dark:bg-default-100/10 dark:text-default-400">
                                                    {characterSourceTab === "expeditions" ? "원정대 캐릭터가 없습니다." : "숙제 캐릭터가 없습니다."}
                                                </div>
                                            ) : selectableCharacters.map((character) => (
                                                <button key={`${character.server}-${character.nickname}`} type="button" onClick={() => void handleSelectCharacter({ dispatch, setScheduleTables, setSaving, router, setEditingCell }, { selectedRaid, scheduleTables, selectedTableId, editingCell, character: { userId: editingMemberInfo.id, characterName: character.nickname, level: character.level, job: character.job } })} disabled={isSaving} className="flex items-center gap-3 rounded-xl border border-default-200 bg-default-50/60 px-3 py-3 text-left transition hover:border-primary/50 hover:bg-primary-50/40 disabled:opacity-50 dark:border-white/10 dark:bg-white/[0.03] dark:hover:bg-primary-500/10">
                                                    <JobEmblemIcon job={character.job} size={32} className="shrink-0 text-foreground"/>
                                                    <div className="min-w-0">
                                                        <div className="truncate font-semibold">{character.nickname}</div>
                                                        <div className="truncate text-xs text-default-500">{character.server} · {character.job} · Lv.{character.level.toLocaleString()}</div>
                                                    </div>
                                                </button>
                                            ))}
                                        </>
                                    )}
                                </div>
                            </ModalBody>
                            <ModalFooter>
                                <Button color="danger" radius="lg" variant="flat" isDisabled={!editingSchedule?.members.some((member) => member.userId === editingCell?.memberId) || isSaving} onPress={() => void handleClearCharacter({ dispatch, setScheduleTables, setSaving, router, setEditingCell }, { selectedRaid, scheduleTables, selectedTableId, editingCell })}>참여 해제</Button>
                                <Button radius="lg" variant="light" onPress={onClose}>닫기</Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
            <Modal
                isOpen={deleteTarget !== null}
                onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
                radius="lg"
                classNames={calendarModalClassNames}>
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader>
                                <CalendarModalHeader
                                    title={deleteTarget?.type === "table" ? "일정표 삭제" : deleteTarget?.type === "member" ? "일정표 인원 삭제" : "레이드 일정 삭제"}
                                    description="삭제한 정보는 자동으로 복구되지 않습니다."
                                />
                            </ModalHeader>
                            <ModalBody>
                                <div className="rounded-xl border border-danger-200 bg-danger-50/70 p-4 dark:border-danger-500/30 dark:bg-danger-500/10">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-default-500">삭제 대상</p>
                                    <p className="mt-1 font-bold text-foreground">{deleteTargetLabel}</p>
                                    <p className="mt-3 text-sm text-danger">정말 삭제하시겠습니까?</p>
                                </div>
                            </ModalBody>
                            <ModalFooter>
                                <Button radius="lg" variant="light" onPress={onClose}>취소</Button>
                                <Button radius="lg" color="danger" className="min-w-28 font-semibold" isLoading={isSaving} onPress={() => void confirmCalendarDelete(onClose)}>삭제하기</Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </div>
    );
}
