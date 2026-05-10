'use client'
import DeleteIcon from "@/app/icons/DeleteIcon";
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
        <div className="w-full">
            {isMobile ? null : (
                <div className="mt-8 mb-4 flex w-full justify-center overflow-hidden">
                    <div className="mx-4 flex w-full max-w-[1240px] justify-center rounded-2xl bg-[#eeeeee] p-4 dark:bg-[#222222]">
                        <FixedLineAd isLoaded={true} />
                    </div>
                </div>
            )}
            <div className="mt-2 flex w-full flex-col gap-3">
                <div className="flex w-full flex-row flex-wrap items-center gap-2 mb-2">
                    <div className="min-w-[220px] flex-1 max-w-[320px]">
                        <Select aria-label="일정표 선택" placeholder="일정표 선택" radius="sm" disallowEmptySelection={scheduleTables.length > 0} selectedKeys={selectedTableId ? new Set([selectedTableId]) : new Set([])} onSelectionChange={(keys) => {
                            const value = Array.from(keys)[0] as string | undefined;
                            if (!value) return;
                            setSelectedTableId(value);
                        }} isDisabled={scheduleTables.length === 0 || isSaving}>
                            {scheduleTables.map((table) => <SelectItem key={table.id}>{table.name}</SelectItem>)}
                        </Select>
                    </div>
                    <Button radius="sm" color="secondary" isDisabled={isSaving} onPress={() => {
                        setNewTableName(`일정표 ${scheduleTables.length + 1}`);
                        setAddTableOpen(true);
                    }}>일정표 추가</Button>
                    <Button radius="sm" color="danger" variant="flat" isDisabled={!selectedTable || isSaving} onPress={async () => {
                        if (!selectedTable || !selectedRaid) return;
                        if (!window.confirm(`'${selectedTable.name}' 일정표를 삭제할까요?`)) return;
                        const nextScheduleTables = scheduleTables.filter((table) => table.id !== selectedTable.id);
                        const success = await persistCalendar({ dispatch, setScheduleTables, setSaving, router }, { selectedRaid, nextScheduleTables });
                        if (success) setSelectedTableId(nextScheduleTables[0]?.id ?? null);
                    }}>일정표 삭제</Button>
                    <div className="grow" />
                    <Button radius="sm" color="primary" onPress={openAddScheduleModal} isDisabled={!selectedTable || isSaving}>일정 추가</Button>
                    <Button radius="sm" color="secondary" onPress={() => setAddMemberOpen(true)} isDisabled={!selectedTable || availableRaidMemberIds.length === 0 || isSaving}>인원 추가</Button>
                </div>
                {selectedTable ? (
                    <div className="overflow-x-auto rounded-2xl border border-default-200 bg-white dark:border-default-100/40 dark:bg-[#1b1b1b]">
                        <div className="min-w-full">
                            <table className="table-fixed border-collapse text-sm" style={{ width: `max(100%, ${tableMinWidth})` }}>
                                <colgroup>
                                    <col style={{ width: "56px" }} />
                                    <col style={{ width: "218px" }} />
                                    {visibleMemberIds.map((memberId) => <col key={memberId} style={{ width: "200px" }} />)}
                                    <col />
                                </colgroup>
                                <thead>
                                    <tr className="bg-default-100 dark:bg-default-100/10">
                                        <th className="whitespace-nowrap border-b border-r border-default-200 px-2 py-3 text-center font-semibold dark:border-default-100/35">요일</th>
                                        <th className="whitespace-nowrap border-b border-r border-default-200 px-2 py-3 text-left font-semibold dark:border-default-100/35">레이드</th>
                                        {visibleMemberIds.map((memberId) => {
                                            const memberInfo = loadedMembers.find((member) => member.id === memberId);
                                            const representativeName = memberInfo?.nickname ?? memberId;
                                            return (
                                                <th key={memberId} className="border-b border-r border-default-200 px-3 py-3 text-left dark:border-default-100/35">
                                                    <div className={clsx("flex flex-row items-center gap-1", memberId === userId ? "text-primary" : "") }>
                                                        <div className="grow flex flex-col items-start justify-between">
                                                            <p className="font-semibold">{representativeName}</p>
                                                            <p className="fadedtext text-xs font-normal">{memberId}</p>
                                                        </div>
                                                        <Button isIconOnly size="sm" radius="sm" variant="light" color="danger" isDisabled={isSaving} onPress={() => {
                                                            if (!window.confirm(`${memberId} 인원을 삭제할까요?`)) return;
                                                            void handleRemoveVisibleMember({ dispatch, setScheduleTables, setSaving, router }, { selectedRaid, scheduleTables, selectedTableId, memberId });
                                                        }} className="h-8 min-h-8 w-8 min-w-8">
                                                            <DeleteIcon className="h-5 w-5" />
                                                        </Button>
                                                    </div>
                                                </th>
                                            );
                                        })}
                                        <th className="min-w-[100px] border-b border-default-200 px-3 py-3 dark:border-default-100/35" />
                                    </tr>
                                </thead>
                                <tbody>
                                    {rows.map((row, index) => (
                                        <tr key={row.id} className={clsx(index % 2 === 0 ? "bg-white dark:bg-[#1b1b1b]" : "bg-default-50/70 dark:bg-default-100/5")}>
                                            {row.showDayCell ? (
                                                <td rowSpan={row.dayRowSpan} className={clsx("whitespace-nowrap border-b border-r border-default-200 px-1 py-3 align-middle text-center font-medium dark:border-default-100/35", row.dayOfWeek === "saturday" || row.dayOfWeek === "sunday" ? "text-success-700 dark:text-success-300" : "text-foreground")}>
                                                    <span className="block overflow-hidden text-ellipsis whitespace-nowrap">{row.dayTitle}</span>
                                                </td>
                                            ) : null}
                                            <td className="border-b border-r border-default-200 px-1 py-3 align-middle text-center font-medium dark:border-default-100/35">
                                                <div className="flex flex-col items-start gap-1 px-1">
                                                    {row.raids.length === 0 ? <span className="block overflow-hidden text-ellipsis whitespace-nowrap">-</span> : row.raids.map((raid, raidIndex) => (
                                                        <div key={`${row.id}-raid-${raidIndex}`} className="flex w-full flex-col items-start gap-1 rounded-xl bg-default-100/50 px-2 py-2 dark:bg-default-100/10">
                                                            <div className="flex w-full items-center gap-2">
                                                                <span className="block min-w-0 overflow-hidden text-ellipsis whitespace-nowrap font-medium">{raid.raidName}</span>
                                                                <div className="ml-auto flex shrink-0 flex-nowrap items-center gap-1">
                                                                    {raid.stages.map((stage, stageIndex) => (
                                                                        <Tooltip key={`${row.id}-raid-${raidIndex}-stage-${stageIndex}`} showArrow content={`${stage.difficulty} ${stage.stage}관`}>
                                                                            <div
                                                                            key={`${row.id}-raid-${raidIndex}-stage-${stageIndex}`}
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
                                                    <td key={`${row.id}-${memberId}`} className="border-b border-r border-default-200 px-2 py-2 dark:border-default-100/35">
                                                        <button type="button" disabled={!canEditCell || isSaving} onClick={() => openCharacterModal(canEditCell, memberId, row.id, setEditingCell)} className={clsx("flex min-h-[44px] w-full items-center rounded-lg px-2 py-2 text-left transition", canEditCell ? value ? "bg-transparent hover:bg-default-100 dark:hover:bg-default-100/10" : "bg-primary-50 hover:bg-primary-100 dark:bg-primary-500/10 dark:hover:bg-primary-500/20" : "cursor-default bg-transparent", value ? "justify-start" : "justify-center")}>
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
                                            <td className="min-w-[100px] border-b border-default-200 px-3 py-3 dark:border-default-100/35">
                                                {row.id.startsWith("empty-") ? null : (
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Button size="sm" radius="sm" variant="flat" color="secondary" isDisabled={isSaving} onPress={() => openEditScheduleModal(row.id)}>수정</Button>
                                                        <Button size="sm" radius="sm" variant="flat" color="danger" isDisabled={isSaving} onPress={() => {
                                                            if (!window.confirm("이 레이드 일정을 삭제할까요?")) return;
                                                            void handleRemoveSchedule({ dispatch, setScheduleTables, setSaving, router }, { selectedRaid, scheduleTables, selectedTableId, scheduleId: row.id });
                                                        }}>삭제</Button>
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
                            좌측의 일정표 선택 영역에서 새 일정표를 추가한 뒤, 레이드 일정과 인원을 채워서 사용하세요.
                        </p>
                    </div>
                )}
            </div>
            <Modal isOpen={isAddTableOpen} onOpenChange={setAddTableOpen} radius="sm">
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader>새 일정표 추가</ModalHeader>
                            <ModalBody>
                                <Input
                                    autoFocus
                                    label="일정표 이름"
                                    placeholder="일정표 이름을 입력하세요"
                                    radius="sm"
                                    value={newTableName}
                                    onValueChange={setNewTableName}
                                />
                            </ModalBody>
                            <ModalFooter>
                                <Button variant="light" onPress={onClose}>닫기</Button>
                                <Button
                                    color="primary"
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
                                    추가
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>

            <Modal isOpen={isAddMemberOpen} onOpenChange={setAddMemberOpen} radius="sm">
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader>표에 표시할 멤버 추가</ModalHeader>
                            <ModalBody>
                                <div className="flex max-h-[360px] flex-col gap-2 overflow-y-auto">
                                    {availableRaidMemberIds.length === 0 ? (
                                        <div className="rounded-lg bg-default-100 px-3 py-4 text-sm text-default-500 dark:bg-default-100/10 dark:text-default-400">추가할 수 있는 멤버가 없습니다.</div>
                                    ) : availableRaidMemberIds.map((memberId) => {
                                        const memberInfo = loadedMembers.find((member) => member.id === memberId);
                                        return (
                                            <button key={memberId} type="button" onClick={() => void handleAddVisibleMember({ dispatch, setScheduleTables, setSaving, router, setAddMemberOpen }, { selectedRaid, scheduleTables, selectedTableId, memberId })} disabled={isSaving} className="rounded-xl border border-default-200 px-3 py-3 text-left transition hover:bg-default-50 disabled:opacity-50 dark:border-default-100/20 dark:hover:bg-default-100/10">
                                                <div className="font-medium">{memberId}</div>
                                                <div className="text-xs text-default-500 dark:text-default-400">{memberInfo?.nickname ?? "멤버 정보 로딩 전"}</div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </ModalBody>
                            <ModalFooter><Button variant="light" onPress={onClose}>닫기</Button></ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>

            <Modal isOpen={isAddScheduleOpen} onOpenChange={(open) => {
                setAddScheduleOpen(open);
                if (!open) resetScheduleEditor();
            }} radius="sm">
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader>{isEditingSchedule ? "주간 레이드 일정 수정" : "주간 레이드 일정 추가"}</ModalHeader>
                            <ModalBody>
                                <div className="flex flex-col gap-3">
                                    <Select label="요일" radius="sm" selectedKeys={new Set([newScheduleDay])} onSelectionChange={(keys) => {
                                        const value = Array.from(keys)[0] as RaidScheduleWeekday | undefined;
                                        if (value) setNewScheduleDay(value);
                                    }}>
                                        {WEEK_LABELS.map((week) => <SelectItem key={week.key}>{week.title}</SelectItem>)}
                                    </Select>
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-medium text-default-700 dark:text-default-300">레이드 묶음</p>
                                        <Button size="sm" radius="sm" variant="flat" color="secondary" isDisabled={newScheduleRaids.length >= 5} onPress={addScheduleRaidItem}>레이드 추가</Button>
                                    </div>
                                    <div className="flex flex-col gap-4">
                                        {newScheduleRaids.map((raidItem, raidIndex) => {
                                            const selectedBoss = bosses.find((boss) => boss.id === raidItem.bossId);
                                            return (
                                                <div key={`schedule-raid-item-${raidIndex}`} className="rounded-2xl border border-default-200 px-3 py-3 dark:border-default-100/20">
                                                    <div className="mb-3 flex items-center gap-2">
                                                        <p className="grow text-sm font-semibold">레이드 {raidIndex + 1}</p>
                                                        <Button size="sm" radius="sm" variant="light" color="danger" isDisabled={newScheduleRaids.length <= 1} onPress={() => removeScheduleRaidItem(raidIndex)}>삭제</Button>
                                                    </div>
                                                    <div className="flex flex-col gap-3">
                                                        <Select label="레이드" radius="sm" selectedKeys={raidItem.bossId ? new Set([raidItem.bossId]) : new Set([])} onSelectionChange={(keys) => {
                                                            const value = Array.from(keys)[0] as string | undefined;
                                                            updateScheduleRaidBoss(raidIndex, value ?? "");
                                                        }}>
                                                            {bosses.map((boss) => <SelectItem key={boss.id}>{boss.name}</SelectItem>)}
                                                        </Select>
                                                        {selectedBoss ? (
                                                            <div className="flex flex-col gap-3">
                                                                {getWeekStages(bosses, selectedBoss.id).map((level, stageIndex) => (
                                                                    <div key={`${selectedBoss.id}-${level}`}>
                                                                        <div className="mb-1 flex items-center justify-between">
                                                                            <h3 className="font-bold">{level}관문</h3>
                                                                            <span className="text-xs text-default-500 dark:text-default-400">{raidItem.stages[stageIndex]?.difficulty !== EMPTY_STAGE_DIFFICULTY ? raidItem.stages[stageIndex]?.difficulty : "난이도 선택"}</span>
                                                                        </div>
                                                                        <Tabs fullWidth radius="sm" color="primary" selectedKey={raidItem.stages.length > stageIndex ? raidItem.stages[stageIndex].difficulty : EMPTY_STAGE_DIFFICULTY} onSelectionChange={(key) => {
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
                                <Button variant="light" onPress={onClose}>닫기</Button>
                                <Button color="primary" isLoading={isSaving} isDisabled={!isValidNewSchedule} onPress={() => {
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

            <Modal isOpen={editingCell !== null} onOpenChange={(open) => { if (!open) { setEditingCell(null); setCharacterSourceTab("expeditions"); } }} radius="sm" scrollBehavior="inside">
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader>
                                <div className="flex flex-col">
                                    <span>{editingSchedule ? printScheduleRaidLabel(editingSchedule.raids) : "레이드 참여 캐릭터 선택"}</span>
                                    <span className="text-sm font-normal text-default-500 dark:text-default-400">{editingCell?.memberId ?? ""}</span>
                                </div>
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
                                                radius="sm"
                                                color="primary"
                                                fullWidth
                                            >
                                                <Tab key="expeditions" title="원정대" />
                                                <Tab key="checklist" title="숙제" />
                                            </Tabs>
                                            {selectableCharacters.length === 0 ? (
                                                <div className="rounded-lg bg-default-100 px-3 py-4 text-sm text-default-500 dark:bg-default-100/10 dark:text-default-400">
                                                    {characterSourceTab === "expeditions" ? "원정대 캐릭터가 없습니다." : "숙제 캐릭터가 없습니다."}
                                                </div>
                                            ) : selectableCharacters.map((character) => (
                                                <button key={`${character.server}-${character.nickname}`} type="button" onClick={() => void handleSelectCharacter({ dispatch, setScheduleTables, setSaving, router, setEditingCell }, { selectedRaid, scheduleTables, selectedTableId, editingCell, character: { userId: editingMemberInfo.id, characterName: character.nickname, level: character.level, job: character.job } })} disabled={isSaving} className="rounded-xl border border-default-200 px-3 py-3 text-left transition disabled:opacity-50 dark:border-default-100/20 dark:hover:bg-primary-500/10">
                                                    <div className="font-medium">{character.nickname}</div>
                                                    <div className="text-xs text-default-500 dark:text-default-400">{character.server} · {character.job} · Lv.{character.level.toLocaleString()}</div>
                                                </button>
                                            ))}
                                        </>
                                    )}
                                </div>
                            </ModalBody>
                            <ModalFooter>
                                <Button color="danger" radius="sm" isDisabled={!editingSchedule?.members.some((member) => member.userId === editingCell?.memberId) || isSaving} onPress={() => void handleClearCharacter({ dispatch, setScheduleTables, setSaving, router, setEditingCell }, { selectedRaid, scheduleTables, selectedTableId, editingCell })}>참여 해제</Button>
                                <Button variant="light" onPress={onClose}>닫기</Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </div>
    );
}
