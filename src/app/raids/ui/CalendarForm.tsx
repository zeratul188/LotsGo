'use client'
import DeleteIcon from "@/app/icons/DeleteIcon";
import JobEmblemIcon from "@/Icons/JobEmblemIcon";
import SearchEmptyIcon from "@/Icons/SearchEmptyIcon";
import { Boss } from "@/app/api/checklist/boss/route";
import { EMPTY_STAGE_DIFFICULTY, createDefaultWeekStages, getDifficultyByStage, getTextColorByDifficulty, getWeekStages } from "@/app/checklist/lib/checklistFeat";
import { ControlStage } from "@/app/checklist/model/types";
import { AppDispatch, RootState } from "@/app/store/store";
import { Button, Chip, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Select, SelectItem, Tab, Tabs } from "@heroui/react";
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
    hasSelectedScheduleStages,
    openCharacterModal,
    persistCalendar,
    printScheduleStages,
    WEEK_LABELS
} from "../lib/calendarFeat";

const FixedLineAd = dynamic(() => import("@/app/ad/FixedLineAd"), { ssr: false });

type CalendarComponentProps = {
    dispatch: AppDispatch,
    bosses: Boss[]
}

export function CalendarComponent({ dispatch, bosses }: CalendarComponentProps) {
    const router = useRouter();
    const selectedRaid = useSelector((state: RootState) => state.party.selectedRaid);
    const loadedMembers = useSelector((state: RootState) => state.party.members);
    const userId = useSelector((state: RootState) => state.party.userId);

    const [scheduleTables, setScheduleTables] = useState<RaidScheduleTable[]>([]);
    const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
    const [isAddTableOpen, setAddTableOpen] = useState(false);
    const [isAddMemberOpen, setAddMemberOpen] = useState(false);
    const [isAddScheduleOpen, setAddScheduleOpen] = useState(false);
    const [editingCell, setEditingCell] = useState<EditingCell | null>(null);
    const [newTableName, setNewTableName] = useState("");
    const [newScheduleDay, setNewScheduleDay] = useState<RaidScheduleWeekday>("wednesday");
    const [newScheduleBossId, setNewScheduleBossId] = useState("");
    const [newScheduleStages, setNewScheduleStages] = useState<ControlStage[]>([]);
    const [isSaving, setSaving] = useState(false);
    const isMobile = useMobileQuery();

    const selectedTable = useMemo(() => scheduleTables.find((table) => table.id === selectedTableId) ?? null, [scheduleTables, selectedTableId]);
    const weeklySchedule = selectedTable?.weeklySchedule ?? [];
    const visibleMemberIds = selectedTable?.weeklyScheduleMemberIds ?? [];
    const rows = useMemo(() => buildCalendarRows(weeklySchedule), [weeklySchedule]);
    const availableRaidMemberIds = useMemo(() => getAvailableRaidMemberIds(selectedRaid, visibleMemberIds), [selectedRaid, visibleMemberIds]);
    const editingSchedule = useMemo(() => getEditingSchedule(weeklySchedule, editingCell), [editingCell, weeklySchedule]);
    const editingMemberInfo = useMemo(() => getEditingMemberInfo(loadedMembers, editingCell), [editingCell, loadedMembers]);
    const tableMinWidth = useMemo(() => getTableMinWidth(visibleMemberIds), [visibleMemberIds]);
    const selectedScheduleBoss = useMemo(() => bosses.find((boss) => boss.id === newScheduleBossId), [bosses, newScheduleBossId]);

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
                    <Button radius="sm" color="primary" onPress={() => setAddScheduleOpen(true)} isDisabled={!selectedTable || isSaving}>일정 추가</Button>
                    <Button radius="sm" color="secondary" onPress={() => setAddMemberOpen(true)} isDisabled={!selectedTable || availableRaidMemberIds.length === 0 || isSaving}>인원 추가</Button>
                </div>
                {selectedTable ? (
                    <div className="overflow-x-auto rounded-2xl border border-default-200 bg-white dark:border-default-100 dark:bg-[#1b1b1b]">
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
                                        <th className="whitespace-nowrap border-b border-r border-default-200 px-2 py-3 text-center font-semibold dark:border-default-100/20">요일</th>
                                        <th className="whitespace-nowrap border-b border-r border-default-200 px-2 py-3 text-left font-semibold dark:border-default-100/20">레이드</th>
                                        {visibleMemberIds.map((memberId) => {
                                            const memberInfo = loadedMembers.find((member) => member.id === memberId);
                                            const representativeName = memberInfo?.nickname ?? memberId;
                                            return (
                                                <th key={memberId} className="border-b border-r border-default-200 px-3 py-3 text-left dark:border-default-100/20">
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
                                        <th className="min-w-[100px] border-b border-default-200 px-3 py-3 dark:border-default-100/20" />
                                    </tr>
                                </thead>
                                <tbody>
                                    {rows.map((row, index) => (
                                        <tr key={row.id} className={clsx(index % 2 === 0 ? "bg-white dark:bg-[#1b1b1b]" : "bg-default-50/70 dark:bg-default-100/5")}>
                                            {row.showDayCell ? (
                                                <td rowSpan={row.dayRowSpan} className={clsx("whitespace-nowrap border-b border-r border-default-200 px-1 py-3 align-middle text-center font-medium dark:border-default-100/20", row.dayOfWeek === "saturday" || row.dayOfWeek === "sunday" ? "text-success-700 dark:text-success-300" : "text-foreground")}>
                                                    <span className="block overflow-hidden text-ellipsis whitespace-nowrap">{row.dayTitle}</span>
                                                </td>
                                            ) : null}
                                            <td className="border-b border-r border-default-200 px-1 py-3 align-middle text-center font-medium dark:border-default-100/20">
                                                <div className="flex flex-col items-start gap-1 px-1">
                                                    <span className="block overflow-hidden text-ellipsis whitespace-nowrap">{row.raidName || "-"}</span>
                                                    {row.stages.length > 0 ? (
                                                        <div className="flex flex-wrap justify-start gap-1">
                                                            {row.stages.map((stage, stageIndex) => <Chip key={`${row.id}-stage-${stageIndex}`} color={getTextColorByDifficulty(stage.difficulty)} radius="sm" variant="flat" size="sm">{stage.difficulty} {stage.stage}관</Chip>)}
                                                        </div>
                                                    ) : null}
                                                </div>
                                            </td>
                                            {visibleMemberIds.map((memberId) => {
                                                const value = row.memberMap[memberId];
                                                const canEditCell = !row.id.startsWith("empty-");
                                                return (
                                                    <td key={`${row.id}-${memberId}`} className="border-b border-r border-default-200 px-2 py-2 dark:border-default-100/20">
                                                        <button type="button" disabled={!canEditCell || isSaving} onClick={() => openCharacterModal(canEditCell, memberId, row.id, setEditingCell)} className={clsx("flex min-h-[44px] w-full items-center rounded-lg px-2 py-2 text-left transition", canEditCell ? value ? "bg-transparent hover:bg-default-100 dark:hover:bg-default-100/10" : "bg-primary-50 hover:bg-primary-100 dark:bg-primary-500/10 dark:hover:bg-primary-500/20" : "cursor-default bg-transparent", value ? "justify-start" : "justify-center")}>
                                                            {value ? (
                                                                <div className="flex w-full items-center gap-2">
                                                                    <JobEmblemIcon job={value.job} size={28} className="shrink-0 text-black dark:text-white" />
                                                                    <div className="flex min-w-0 flex-col">
                                                                        <span className="truncate text-sm font-medium text-primary-700 dark:text-primary-300">{value.characterName}</span>
                                                                        <span className="truncate text-[11px] text-default-500 dark:text-default-400">{value.job} · Lv.{value.level.toLocaleString()}</span>
                                                                    </div>
                                                                </div>
                                                            ) : canEditCell ? <span className="text-xs text-primary-600 dark:text-primary-300">캐릭터 선택</span> : <span className="text-default-300 dark:text-default-600">-</span>}
                                                        </button>
                                                    </td>
                                                );
                                            })}
                                            <td className="min-w-[100px] border-b border-default-200 px-3 py-3 dark:border-default-100/20">
                                                {row.id.startsWith("empty-") ? null : (
                                                    <Button size="sm" radius="sm" variant="flat" color="danger" isDisabled={isSaving} onPress={() => {
                                                        if (!window.confirm("이 레이드 일정을 삭제할까요?")) return;
                                                        void handleRemoveSchedule({ dispatch, setScheduleTables, setSaving, router }, { selectedRaid, scheduleTables, selectedTableId, scheduleId: row.id });
                                                    }}>삭제</Button>
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

            <Modal isOpen={isAddScheduleOpen} onOpenChange={setAddScheduleOpen} radius="sm">
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader>주간 레이드 일정 추가</ModalHeader>
                            <ModalBody>
                                <div className="flex flex-col gap-3">
                                    <Select label="요일" radius="sm" selectedKeys={new Set([newScheduleDay])} onSelectionChange={(keys) => {
                                        const value = Array.from(keys)[0] as RaidScheduleWeekday | undefined;
                                        if (value) setNewScheduleDay(value);
                                    }}>
                                        {WEEK_LABELS.map((week) => <SelectItem key={week.key}>{week.title}</SelectItem>)}
                                    </Select>
                                    <Select label="레이드" radius="sm" selectedKeys={newScheduleBossId ? new Set([newScheduleBossId]) : new Set([])} onSelectionChange={(keys) => {
                                        const value = Array.from(keys)[0] as string | undefined;
                                        setNewScheduleBossId(value ?? "");
                                        setNewScheduleStages(value ? createDefaultWeekStages(bosses, value) : []);
                                    }}>
                                        {bosses.map((boss) => <SelectItem key={boss.id}>{boss.name}</SelectItem>)}
                                    </Select>
                                    {selectedScheduleBoss ? (
                                        <div className="flex flex-col gap-3">
                                            {getWeekStages(bosses, selectedScheduleBoss.id).map((level, idx) => (
                                                <div key={level}>
                                                    <div className="mb-1 flex items-center justify-between">
                                                        <h3 className="font-bold">{level}관문</h3>
                                                        <span className="text-xs text-default-500 dark:text-default-400">{newScheduleStages[idx]?.difficulty !== EMPTY_STAGE_DIFFICULTY ? newScheduleStages[idx]?.difficulty : "난이도 선택"}</span>
                                                    </div>
                                                    <Tabs fullWidth radius="sm" color="primary" selectedKey={newScheduleStages.length > idx ? newScheduleStages[idx].difficulty : EMPTY_STAGE_DIFFICULTY} onSelectionChange={(key) => {
                                                        const diff = key.toString();
                                                        if (newScheduleStages.length <= idx) return;
                                                        const cloneStages = structuredClone(newScheduleStages);
                                                        if (idx > 0 && cloneStages[idx - 1].difficulty === EMPTY_STAGE_DIFFICULTY) return;
                                                        cloneStages[idx].difficulty = diff;
                                                        if (diff === EMPTY_STAGE_DIFFICULTY) {
                                                            for (let i = idx; i < cloneStages.length; i++) cloneStages[i].difficulty = EMPTY_STAGE_DIFFICULTY;
                                                        }
                                                        setNewScheduleStages(cloneStages);
                                                    }}>
                                                        {getDifficultyByStage(bosses, selectedScheduleBoss.id, level).map((diff) => <Tab key={diff} title={diff} />)}
                                                    </Tabs>
                                                </div>
                                            ))}
                                            {hasSelectedScheduleStages(newScheduleStages) ? <div className="rounded-lg bg-default-100 px-3 py-2 text-sm dark:bg-default-100/10">{printScheduleStages(newScheduleStages)}</div> : null}
                                        </div>
                                    ) : null}
                                </div>
                            </ModalBody>
                            <ModalFooter>
                                <Button variant="light" onPress={onClose}>닫기</Button>
                                <Button color="primary" isLoading={isSaving} isDisabled={!newScheduleBossId || !hasSelectedScheduleStages(newScheduleStages)} onPress={() => void handleAddSchedule({ dispatch, setScheduleTables, setSaving, router, setAddScheduleOpen, setNewScheduleDay, setNewScheduleBossId, setNewScheduleStages }, { selectedRaid, scheduleTables, selectedTableId, newScheduleDay, newScheduleBossId, newScheduleStages, bosses })}>추가</Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>

            <Modal isOpen={editingCell !== null} onOpenChange={(open) => { if (!open) setEditingCell(null); }} radius="sm" scrollBehavior="inside">
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader>
                                <div className="flex flex-col">
                                    <span>{editingSchedule?.raidName ?? "레이드 참여 캐릭터 선택"}</span>
                                    <span className="text-sm font-normal text-default-500 dark:text-default-400">{editingCell?.memberId ?? ""}</span>
                                </div>
                            </ModalHeader>
                            <ModalBody>
                                <div className="flex flex-col gap-2">
                                    {!editingMemberInfo ? (
                                        <div className="rounded-lg bg-default-100 px-3 py-4 text-sm text-default-500 dark:bg-default-100/10 dark:text-default-400">캐릭터 정보를 찾을 수 없습니다.</div>
                                    ) : (
                                        editingMemberInfo.expeditions.slice().sort((a, b) => b.level - a.level).map((character) => (
                                            <button key={`${character.server}-${character.nickname}`} type="button" onClick={() => void handleSelectCharacter({ dispatch, setScheduleTables, setSaving, router, setEditingCell }, { selectedRaid, scheduleTables, selectedTableId, editingCell, character: { userId: editingMemberInfo.id, characterName: character.nickname, level: character.level, job: character.job } })} disabled={isSaving} className="rounded-xl border border-default-200 px-3 py-3 text-left transition disabled:opacity-50 dark:border-default-100/20 dark:hover:bg-primary-500/10">
                                                <div className="font-medium">{character.nickname}</div>
                                                <div className="text-xs text-default-500 dark:text-default-400">{character.server} · {character.job} · Lv.{character.level.toLocaleString()}</div>
                                            </button>
                                        ))
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
