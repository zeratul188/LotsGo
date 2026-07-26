'use client'

import { useMemo, useState } from "react";
import {
    addToast,
    Button,
    Divider,
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownTrigger,
    Input,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    NumberInput,
    Progress,
    Table,
    TableBody,
    TableCell,
    TableColumn,
    TableHeader,
    TableRow,
    Tooltip,
    useDisclosure
} from "@heroui/react";
import type { AppDispatch } from "@/app/store/store";
import type { CheckCharacter } from "@/app/store/checklistSlice";
import type { OtherGoldIconType, OtherGoldRecord } from "@/app/checklist/model/types";
import {
    formatOtherGoldDate,
    getOtherGoldContributionTotal,
    getOtherGoldPreset,
    getOtherGoldTotal,
    OTHER_GOLD_PRESETS
} from "@/app/checklist/lib/otherGold";
import { handleOtherGoldRecord } from "@/app/checklist/lib/checklistFeat";
import DeleteIcon from "@/app/icons/DeleteIcon";
import { EditIcon } from "@/Icons/EditIcon";
import AnimatedNumber from "./AnimatedNumber";

type OtherGoldManagerProps = {
    character: CheckCharacter;
    dispatch: AppDispatch;
};

type OtherGoldEditor = {
    icon: OtherGoldIconType;
    source: string;
    gold: number;
};

const emptyEditor = (): OtherGoldEditor => ({
    icon: "other",
    source: "",
    gold: 0
});

function OtherGoldIcon({ icon, size = 28 }: { icon: OtherGoldIconType; size?: number }) {
    const preset = getOtherGoldPreset(icon);
    return (
        <img
            src={preset.image}
            alt={`${preset.label} 아이콘`}
            width={size}
            height={size}
            className="shrink-0 object-contain"/>
    );
}

function OtherGoldIconSelector({
    value,
    onChange,
    isDisabled
}: {
    value: OtherGoldIconType;
    onChange: (icon: OtherGoldIconType) => void;
    isDisabled?: boolean;
}) {
    return (
        <Dropdown placement="bottom-start">
            <DropdownTrigger>
                <Button
                    isIconOnly
                    size="sm"
                    radius="md"
                    variant="flat"
                    aria-label="부수입 아이콘 선택"
                    isDisabled={isDisabled}
                    className="h-10 min-h-10 w-10 min-w-10 border border-default-200 bg-default-50 dark:border-white/10 dark:bg-white/[0.04]">
                    <OtherGoldIcon icon={value} size={30}/>
                </Button>
            </DropdownTrigger>
            <DropdownMenu
                aria-label="부수입 아이콘 목록"
                selectionMode="single"
                selectedKeys={new Set([value])}
                onAction={(key) => onChange(key as OtherGoldIconType)}>
                {OTHER_GOLD_PRESETS.map((preset) => (
                    <DropdownItem
                        key={preset.icon}
                        startContent={<OtherGoldIcon icon={preset.icon} size={28}/>}>
                        {preset.label}
                    </DropdownItem>
                ))}
            </DropdownMenu>
        </Dropdown>
    );
}

function OtherGoldFields({
    editor,
    setEditor,
    isDisabled
}: {
    editor: OtherGoldEditor;
    setEditor: (editor: OtherGoldEditor) => void;
    isDisabled?: boolean;
}) {
    const isOther = editor.icon === "other";
    return (
        <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
                <OtherGoldIconSelector
                    value={editor.icon}
                    isDisabled={isDisabled}
                    onChange={(icon) => {
                        const preset = getOtherGoldPreset(icon);
                        setEditor({
                            ...editor,
                            icon,
                            source: preset.source
                        });
                    }}/>
                <Input
                    fullWidth
                    size="sm"
                    placeholder={isOther ? "입력하지 않으면 알 수 없음으로 표시됩니다." : ""}
                    value={editor.source}
                    isDisabled={isDisabled}
                    maxLength={20}
                    onValueChange={(source) => setEditor({ ...editor, source })}
                    classNames={{
                        inputWrapper: "h-10 min-h-10 bg-default-50 dark:bg-white/[0.04]"
                    }}/>
            </div>
            <NumberInput
                fullWidth
                size="sm"
                label="골드량"
                labelPlacement="outside"
                placeholder="-999999999 ~ 999999999"
                minValue={-999999999}
                maxValue={999999999}
                value={editor.gold}
                isDisabled={isDisabled}
                onValueChange={(gold) => setEditor({ ...editor, gold })}/>
        </div>
    );
}

export default function OtherGoldManager({ character, dispatch }: OtherGoldManagerProps) {
    const [editor, setEditor] = useState<OtherGoldEditor>(emptyEditor);
    const [editEditor, setEditEditor] = useState<OtherGoldEditor>(emptyEditor);
    const [editingRecord, setEditingRecord] = useState<OtherGoldRecord | null>(null);
    const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);
    const [isSaving, setSaving] = useState(false);
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const {
        isOpen: isEditOpen,
        onOpen: onEditOpen,
        onOpenChange: onEditOpenChange,
        onClose: onEditClose
    } = useDisclosure();

    const records = character.otherGoldRecords ?? [];
    const totalGold = getOtherGoldTotal(character);
    const selectedRecord = records.find((record) => record.id === selectedRecordId)
        ?? records[0]
        ?? null;
    const contributionTotal = getOtherGoldContributionTotal(records);
    const selectedPercent = selectedRecord && contributionTotal > 0
        ? Math.abs(selectedRecord.gold) / contributionTotal * 100
        : 0;

    const sortedRecords = useMemo(() => [...records].sort((a, b) => {
        if (!a.createdAt && !b.createdAt) return 0;
        if (!a.createdAt) return 1;
        if (!b.createdAt) return -1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }), [records]);

    const saveRecord = async () => {
        if (!Number.isInteger(editor.gold) || editor.gold === 0) return;
        setSaving(true);
        try {
            const nextRecords = await handleOtherGoldRecord({
                action: "add",
                nickname: character.nickname,
                icon: editor.icon,
                source: editor.source,
                gold: editor.gold
            }, dispatch);
            setEditor(emptyEditor());
            setSelectedRecordId(nextRecords[0]?.id ?? null);
            addToast({
                title: "부수입 기록 추가",
                description: "부수입 기록을 저장했습니다.",
                color: "success"
            });
        } catch (error) {
            addToast({
                title: "부수입 기록 오류",
                description: error instanceof Error ? error.message : "부수입 기록을 저장하지 못했습니다.",
                color: "danger"
            });
        } finally {
            setSaving(false);
        }
    };

    const openEditRecord = (record: OtherGoldRecord) => {
        setEditingRecord(record);
        setEditEditor({
            icon: record.icon,
            source: record.source,
            gold: record.gold
        });
        onEditOpen();
    };

    const updateRecord = async () => {
        if (!editingRecord || !Number.isInteger(editEditor.gold) || editEditor.gold === 0) return;
        setSaving(true);
        try {
            await handleOtherGoldRecord({
                action: "update",
                nickname: character.nickname,
                recordId: editingRecord.id,
                icon: editEditor.icon,
                source: editEditor.source,
                gold: editEditor.gold
            }, dispatch);
            setEditingRecord(null);
            addToast({
                title: "부수입 기록 수정",
                description: "부수입 기록을 수정했습니다.",
                color: "success"
            });
            onEditClose();
        } catch (error) {
            addToast({
                title: "부수입 기록 오류",
                description: error instanceof Error ? error.message : "부수입 기록을 수정하지 못했습니다.",
                color: "danger"
            });
        } finally {
            setSaving(false);
        }
    };

    const deleteRecord = async (record: OtherGoldRecord) => {
        if (!confirm(`"${record.source || "알 수 없음"}" 부수입 기록을 삭제하시겠습니까? 삭제 후 되돌릴 수 없습니다.`)) {
            return;
        }
        setSaving(true);
        try {
            const nextRecords = await handleOtherGoldRecord({
                action: "delete",
                nickname: character.nickname,
                recordId: record.id
            }, dispatch);
            setSelectedRecordId(nextRecords[0]?.id ?? null);
            addToast({
                title: "부수입 기록 삭제",
                description: "부수입 기록을 삭제했습니다.",
                color: "success"
            });
        } catch (error) {
            addToast({
                title: "부수입 기록 오류",
                description: error instanceof Error ? error.message : "부수입 기록을 삭제하지 못했습니다.",
                color: "danger"
            });
        } finally {
            setSaving(false);
        }
    };

    return (
        <>
            <div className="w-full">
                <OtherGoldFields editor={editor} setEditor={setEditor} isDisabled={isSaving}/>
                <div className="mt-3 grid grid-cols-2 gap-2">
                    <Button
                        color="secondary"
                        variant="flat"
                        size="sm"
                        radius="md"
                        className="font-medium"
                        isLoading={isSaving}
                        isDisabled={!Number.isInteger(editor.gold) || editor.gold === 0}
                        onPress={() => void saveRecord()}>
                        기록 추가
                    </Button>
                    <Button
                        variant="flat"
                        size="sm"
                        radius="md"
                        className="font-medium"
                        onPress={() => {
                            setSelectedRecordId(records[0]?.id ?? null);
                            onOpen();
                        }}>
                        내역 보기
                    </Button>
                </div>
            </div>

            <Modal
                isOpen={isOpen}
                onOpenChange={onOpenChange}
                size="4xl"
                scrollBehavior="inside"
                classNames={{
                    base: "border border-default-200 bg-background dark:border-white/10",
                    header: "border-b border-default-200 dark:border-white/10",
                    footer: "border-t border-default-200 dark:border-white/10"
                }}>
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col items-start gap-2 sm:flex-row sm:justify-between sm:gap-3">
                                <div className="min-w-0">
                                    <p className="font-semibold">{character.nickname} 부수입 내역</p>
                                    <p className="mt-1 text-xs text-default-500 dark:text-default-400">
                                        기록을 선택하면 이번 주 부수입에서 차지하는 비율을 확인할 수 있습니다.
                                    </p>
                                </div>
                                <span className="whitespace-nowrap text-xs text-default-500 sm:pr-6 dark:text-default-400">
                                    총 {records.length.toLocaleString()}건
                                </span>
                            </ModalHeader>
                            <ModalBody className="py-4">
                                <div className="rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/[0.06] via-default-50/80 to-default-100/50 p-4 shadow-sm dark:border-primary/20 dark:from-primary/[0.12] dark:via-white/[0.04] dark:to-white/[0.02]">
                                    <div className="mb-2 flex items-center justify-between gap-3">
                                        <p className="text-xs font-semibold text-default-500 dark:text-default-400">선택한 기록의 주간 기여도</p>
                                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary dark:bg-primary/20">선택 기록</span>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-x-2 gap-y-2 tabular-nums">
                                        <span className="flex items-center gap-1 text-base font-semibold text-foreground">
                                            <img src="/icons/gold.png" alt="골드" className="h-4 w-4"/>
                                            <AnimatedNumber
                                                value={selectedRecord?.gold ?? 0}
                                                className={selectedRecord && selectedRecord.gold < 0
                                                    ? "text-danger"
                                                    : "text-foreground"}/>
                                        </span>
                                        <span className="text-xl font-bold text-default-400">/</span>
                                        <span className="flex items-center gap-1 text-lg font-bold text-foreground">
                                            <img src="/icons/gold.png" alt="골드" className="h-[18px] w-[18px]"/>
                                            <AnimatedNumber value={totalGold}/>
                                        </span>
                                        <span className="ml-auto text-base font-bold text-blue-600 dark:text-blue-400">
                                            구성 비율 <AnimatedNumber value={selectedPercent} fractionDigits={1}/>%
                                        </span>
                                    </div>
                                    <Progress
                                        aria-label="선택한 부수입 구성 비율"
                                        color="primary"
                                        size="sm"
                                        radius="sm"
                                        value={selectedPercent}
                                        maxValue={100}
                                        className="mt-3"/>
                                </div>

                                <div className="flex flex-col gap-2 sm:hidden">
                                    {sortedRecords.length === 0 ? (
                                        <div className="rounded-xl border border-default-200 px-4 py-10 text-center text-sm text-default-500 dark:border-white/10 dark:text-default-400">
                                            이번 주에 등록한 부수입 기록이 없습니다.
                                        </div>
                                    ) : sortedRecords.map((record) => (
                                        <div
                                            key={record.id}
                                            role="button"
                                            tabIndex={0}
                                            onClick={() => setSelectedRecordId(record.id)}
                                            onKeyDown={(event) => {
                                                if (event.key === "Enter" || event.key === " ") {
                                                    event.preventDefault();
                                                    setSelectedRecordId(record.id);
                                                }
                                            }}
                                            className={`rounded-xl border p-3 transition-colors ${
                                                selectedRecord?.id === record.id
                                                    ? "border-primary/30 bg-primary-50/80 dark:border-primary/30 dark:bg-primary-500/10"
                                                    : "border-default-200 bg-content1 dark:border-white/10 dark:bg-white/[0.025]"
                                            }`}>
                                            <div className="flex items-start gap-3">
                                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-default-100 dark:bg-white/[0.06]">
                                                    <OtherGoldIcon icon={record.icon} size={34}/>
                                                </div>
                                                <div className="min-w-0 grow">
                                                    <p className="truncate text-sm font-semibold text-foreground">
                                                        {record.source || "알 수 없음"}
                                                    </p>
                                                    <p className="mt-1 text-xs text-default-500 dark:text-default-400">
                                                        {formatOtherGoldDate(record.createdAt)}
                                                    </p>
                                                </div>
                                                <span className={`flex shrink-0 items-center gap-1 whitespace-nowrap text-sm font-bold tabular-nums ${
                                                    record.gold < 0 ? "text-danger" : "text-foreground"
                                                }`}>
                                                    <img src="/icons/gold.png" alt="골드" className="h-4 w-4"/>
                                                    {record.gold.toLocaleString()}
                                                </span>
                                            </div>
                                            <div className="mt-3 flex justify-end gap-1 border-t border-default-200 pt-2 dark:border-white/10">
                                                <Button
                                                    isIconOnly
                                                    size="sm"
                                                    variant="flat"
                                                    aria-label={`${record.source || "알 수 없음"} 수정`}
                                                    onClick={(event) => event.stopPropagation()}
                                                    onPress={() => openEditRecord(record)}>
                                                    <EditIcon title="수정" className="h-4 w-4"/>
                                                </Button>
                                                <Button
                                                    isIconOnly
                                                    size="sm"
                                                    variant="flat"
                                                    color="danger"
                                                    aria-label={`${record.source || "알 수 없음"} 삭제`}
                                                    isDisabled={isSaving}
                                                    onClick={(event) => event.stopPropagation()}
                                                    onPress={() => void deleteRecord(record)}>
                                                    <DeleteIcon className="h-4 w-4"/>
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="hidden overflow-x-auto rounded-xl border border-default-200 sm:block dark:border-white/10">
                                    <Table removeWrapper aria-label={`${character.nickname} 부수입 기록`}>
                                        <TableHeader>
                                            <TableColumn>아이콘</TableColumn>
                                            <TableColumn>경로</TableColumn>
                                            <TableColumn>날짜</TableColumn>
                                            <TableColumn>골드량</TableColumn>
                                            <TableColumn>조작 관리</TableColumn>
                                        </TableHeader>
                                        <TableBody emptyContent="이번 주에 등록한 부수입 기록이 없습니다.">
                                            {sortedRecords.map((record) => (
                                                <TableRow
                                                    key={record.id}
                                                    onClick={() => setSelectedRecordId(record.id)}
                                                    className={selectedRecord?.id === record.id
                                                        ? "cursor-pointer bg-primary-50/80 dark:bg-primary-500/10"
                                                        : "cursor-pointer hover:bg-default-100/70 dark:hover:bg-white/[0.04]"}>
                                                    <TableCell>
                                                        <OtherGoldIcon icon={record.icon} size={32}/>
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className="font-medium">{record.source || "알 수 없음"}</span>
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className="whitespace-nowrap text-xs text-default-500 dark:text-default-400">
                                                            {formatOtherGoldDate(record.createdAt)}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className={`flex items-center gap-1 whitespace-nowrap font-medium tabular-nums ${
                                                            record.gold < 0 ? "text-danger" : "text-foreground"
                                                        }`}>
                                                            <img src="/icons/gold.png" alt="골드" className="h-4 w-4"/>
                                                            {record.gold.toLocaleString()}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-1">
                                                            <Tooltip content="수정" showArrow>
                                                                <Button
                                                                    isIconOnly
                                                                    size="sm"
                                                                    variant="flat"
                                                                    aria-label={`${record.source || "알 수 없음"} 수정`}
                                                                    onClick={(event) => event.stopPropagation()}
                                                                    onPress={() => openEditRecord(record)}>
                                                                    <EditIcon title="수정" className="h-4 w-4"/>
                                                                </Button>
                                                            </Tooltip>
                                                            <Tooltip content="삭제" color="danger" showArrow>
                                                                <Button
                                                                    isIconOnly
                                                                    size="sm"
                                                                    variant="flat"
                                                                    color="danger"
                                                                    aria-label={`${record.source || "알 수 없음"} 삭제`}
                                                                    isDisabled={isSaving}
                                                                    onClick={(event) => event.stopPropagation()}
                                                                    onPress={() => void deleteRecord(record)}>
                                                                    <DeleteIcon className="h-4 w-4"/>
                                                                </Button>
                                                            </Tooltip>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </ModalBody>
                            <ModalFooter>
                                <Button variant="flat" onPress={onClose}>닫기</Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>

            <Modal
                isOpen={isEditOpen}
                onOpenChange={onEditOpenChange}
                size="md"
                classNames={{
                    base: "border border-default-200 bg-background dark:border-white/10"
                }}>
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader>부수입 기록 수정</ModalHeader>
                            <ModalBody>
                                <OtherGoldFields
                                    editor={editEditor}
                                    setEditor={setEditEditor}
                                    isDisabled={isSaving}/>
                                <Divider/>
                                <div>
                                    <p className="text-xs text-default-500 dark:text-default-400">기록 날짜</p>
                                    <p className="mt-1 text-sm text-default-500 dark:text-default-400">
                                        {formatOtherGoldDate(editingRecord?.createdAt ?? null)}
                                    </p>
                                </div>
                            </ModalBody>
                            <ModalFooter>
                                <Button variant="flat" onPress={onClose}>취소</Button>
                                <Button
                                    color="primary"
                                    isLoading={isSaving}
                                    isDisabled={!Number.isInteger(editEditor.gold) || editEditor.gold === 0}
                                    onPress={() => void updateRecord()}>
                                    수정 저장
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </>
    );
}
