'use client'

import {
    addToast,
    Button,
    Checkbox,
    Input,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    NumberInput,
    Pagination,
    Select,
    SelectItem,
    Tab,
    Tabs,
    useDisclosure
} from "@heroui/react";
import { useMemo, useState } from "react";

import JobEmblemIcon from "@/Icons/JobEmblemIcon";
import { jobEmblemMap } from "@/Icons/job-emblems";

import {
    calculateFineSettlement,
    getParticipantFineTotal,
    MAX_FINE_ACTIONS,
    MAX_FINE_GOLD,
    MAX_FINE_PARTICIPANTS,
    normalizeFineGold
} from "../lib/fineCalculator";
import type {
    FineAction,
    FineParticipant,
    FineSettlement,
    FineTransfer,
    ParticipantFineTotal
} from "../model/types";

const JOBS = Object.keys(jobEmblemMap);
const RESULT_PAGE_SIZE = 20;

function createId(prefix: string): string {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function GoldValue({ value, className = "" }: { value: number; className?: string }) {
    return (
        <span className={`inline-flex items-center gap-1 tabular-nums ${className}`}>
            <img src="/icons/gold.png" alt="골드" className="h-4 w-4 shrink-0"/>
            <span>{Math.ceil(value).toLocaleString()}</span>
        </span>
    );
}

function DeleteIcon() {
    return (
        <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="1.7">
            <path d="M4.5 6h11M8 3.5h4M6.25 6l.55 10h6.4l.55-10M8.25 8.5v5M11.75 8.5v5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
    );
}

function ParticipantIdentity({
    participant,
    emblemSize = 28,
    compact = false,
    showJob = false
}: {
    participant: Pick<FineParticipant, "nickname" | "job">;
    emblemSize?: number;
    compact?: boolean;
    showJob?: boolean;
}) {
    return (
        <span className="flex min-w-0 items-center gap-2">
            <JobEmblemIcon job={participant.job} size={emblemSize} className="text-foreground"/>
            <span className="min-w-0">
                <span className={compact ? "block truncate text-xs font-semibold sm:text-sm" : "block truncate font-semibold"}>
                    {participant.nickname}
                </span>
                {showJob ? <span className="mt-0.5 block truncate text-[11px] text-default-400">{participant.job}</span> : null}
            </span>
        </span>
    );
}

function FineCountButtons({
    participant,
    action,
    count,
    onChange
}: {
    participant: FineParticipant;
    action: FineAction;
    count: number;
    onChange: (participantId: string, actionId: string, delta: number) => void;
}) {
    return (
        <div className="flex items-center gap-2">
            <Button
                isIconOnly
                size="sm"
                radius="full"
                variant="flat"
                aria-label={`${participant.nickname} ${action.name} 감소`}
                isDisabled={count === 0}
                className="h-8 min-h-8 w-8 min-w-8 text-lg font-bold"
                onPress={() => onChange(participant.id, action.id, -1)}>−</Button>
            <span className="w-8 text-center text-base font-black tabular-nums">{count}</span>
            <Button
                isIconOnly
                size="sm"
                radius="full"
                color="primary"
                variant="flat"
                aria-label={`${participant.nickname} ${action.name} 증가`}
                className="h-8 min-h-8 w-8 min-w-8 text-lg font-bold"
                onPress={() => onChange(participant.id, action.id, 1)}>+</Button>
        </div>
    );
}

function SettlementModal({
    settlement,
    isOpen,
    onOpenChange
}: {
    settlement: FineSettlement | null;
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
}) {
    const [selectedTab, setSelectedTab] = useState("all");
    const [page, setPage] = useState(1);

    const filteredTransfers = useMemo(() => {
        if (!settlement) return [];
        if (selectedTab === "all") return settlement.transfers;
        return settlement.transfers.filter((transfer) => transfer.sender.id === selectedTab);
    }, [selectedTab, settlement]);
    const totalPages = Math.max(1, Math.ceil(filteredTransfers.length / RESULT_PAGE_SIZE));
    const visibleTransfers = filteredTransfers.slice(
        (page - 1) * RESULT_PAGE_SIZE,
        page * RESULT_PAGE_SIZE
    );

    function handleTabChange(key: React.Key) {
        setSelectedTab(String(key));
        setPage(1);
    }

    return (
        <Modal
            isOpen={isOpen}
            onOpenChange={(open) => {
                if (open) {
                    setSelectedTab("all");
                    setPage(1);
                }
                onOpenChange(open);
            }}
            size="5xl"
            scrollBehavior="inside"
            backdrop="blur"
            isDismissable={false}
            classNames={{
                base: "border border-default-200/80 dark:border-white/10",
                header: "border-b border-default-200/70 dark:border-white/10",
                footer: "border-t border-default-200/70 dark:border-white/10"
            }}>
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader className="flex flex-col items-start gap-1 px-5 py-4 sm:px-6">
                            <span className="text-xl font-bold">벌금 정산 결과</span>
                            <span className="text-xs font-normal text-default-500">
                                {settlement?.ignoreMailFee
                                    ? "우편 수수료를 제외한 정산 금액입니다."
                                    : "수령액이 부족하지 않도록 5% 우편 수수료를 포함해 올림한 금액입니다."}
                            </span>
                        </ModalHeader>
                        <ModalBody className="gap-5 px-4 py-5 sm:px-6">
                            {settlement ? (
                                <>
                                    <section>
                                        <p className="text-xs font-semibold text-default-500">전체 벌금 총액</p>
                                        <div className="mt-2 rounded-2xl border border-warning-200/70 bg-gradient-to-r from-warning-50 to-content1 px-4 py-4 dark:border-warning-500/20 dark:from-warning-500/10 dark:to-white/[0.03]">
                                            <GoldValue value={settlement.totalFine} className="text-2xl font-black text-warning-700 dark:text-warning-400"/>
                                        </div>
                                    </section>

                                    <section>
                                        <div className="mb-2 flex items-center justify-between gap-2">
                                            <h3 className="font-bold">캐릭터별 총 벌금</h3>
                                            <span className="text-xs text-default-400">{settlement.participantTotals.length}명</span>
                                        </div>
                                        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                                            {settlement.participantTotals.map((participant) => (
                                                <div key={participant.id} className="flex min-w-0 items-center justify-between gap-2 rounded-xl border border-default-200/70 bg-default-50/70 p-3 dark:border-white/10 dark:bg-white/[0.04]">
                                                    <ParticipantIdentity participant={participant} emblemSize={26} compact/>
                                                    <GoldValue value={participant.total} className="shrink-0 text-sm font-bold"/>
                                                </div>
                                            ))}
                                        </div>
                                    </section>

                                    <section>
                                        <div className="mb-2">
                                            <h3 className="font-bold">최종 송금 목록</h3>
                                            <p className="mt-0.5 text-xs text-default-500">참여자를 선택하면 해당 캐릭터가 보내야 할 내역만 확인할 수 있습니다.</p>
                                        </div>
                                        <div className="w-full overflow-x-auto pb-1 scrollbar-hide">
                                            <Tabs
                                                selectedKey={selectedTab}
                                                onSelectionChange={handleTabChange}
                                                motionProps={{
                                                    transition: {
                                                        type: "spring",
                                                        bounce: 0.15,
                                                        duration: 0.5
                                                    }
                                                }}
                                                color="primary"
                                                variant="light"
                                                radius="lg"
                                                aria-label="참여자별 송금 목록"
                                                classNames={{
                                                    base: "w-max min-w-full",
                                                    tabList: "w-max min-w-full gap-1 bg-default-100/80 p-1 dark:bg-white/[0.05]",
                                                    tab: "h-10 px-3",
                                                    panel: "hidden"
                                                }}>
                                                <Tab key="all" title={<span className="font-semibold">모두</span>}/>
                                                {settlement.participantTotals.map((participant) => (
                                                    <Tab
                                                        key={participant.id}
                                                        title={<ParticipantIdentity participant={participant} emblemSize={20} compact/>}/>
                                                ))}
                                            </Tabs>
                                        </div>

                                        <div className="mt-3 overflow-hidden rounded-xl border border-default-200/80 dark:border-white/10">
                                            {visibleTransfers.length > 0 ? (
                                                <div className="space-y-2 p-2 sm:hidden">
                                                    {visibleTransfers.map((transfer) => (
                                                        <div key={transfer.id} className="flex items-center gap-3 rounded-xl border border-default-200/70 bg-default-50/70 p-3 dark:border-white/10 dark:bg-white/[0.04]">
                                                            <div className="min-w-0 grow space-y-2">
                                                                <div className="flex min-w-0 items-center gap-2">
                                                                    <span className="w-[54px] shrink-0 text-[10px] font-semibold text-default-400">보내는 사람</span>
                                                                    <ParticipantIdentity participant={transfer.sender} emblemSize={22} compact/>
                                                                </div>
                                                                <div className="flex min-w-0 items-center gap-2">
                                                                    <span className="w-[54px] shrink-0 text-[10px] font-semibold text-default-400">받는 사람</span>
                                                                    <ParticipantIdentity participant={transfer.receiver} emblemSize={22} compact/>
                                                                </div>
                                                            </div>
                                                            <div className="shrink-0 border-l border-default-200/70 pl-3 text-right dark:border-white/10">
                                                                <p className="text-[10px] font-semibold text-default-400">우편 입력</p>
                                                                <GoldValue value={transfer.mailAmount} className="mt-1 justify-end text-sm font-black text-warning-700 dark:text-warning-400"/>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : null}
                                            <div className="hidden overflow-x-auto sm:block">
                                                <table className="w-full min-w-[620px] table-fixed text-sm">
                                                    <thead className="bg-default-100 text-xs text-default-500 dark:bg-white/[0.05]">
                                                        <tr>
                                                            <th className="w-[36%] px-4 py-3 text-left font-semibold">보내는 사람</th>
                                                            <th className="w-[36%] px-4 py-3 text-left font-semibold">받는 사람</th>
                                                            <th className="w-[28%] px-4 py-3 text-right font-semibold">우편 입력 금액</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-default-200/70 dark:divide-white/10">
                                                        {visibleTransfers.map((transfer) => (
                                                            <TransferRow key={transfer.id} transfer={transfer}/>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                            {visibleTransfers.length === 0 ? (
                                                <div className="px-4 py-10 text-center">
                                                    <p className="font-semibold text-default-600">보낼 금액이 없습니다.</p>
                                                    <p className="mt-1 text-xs text-default-400">서로 상계한 뒤 남은 송금 내역이 없습니다.</p>
                                                </div>
                                            ) : null}
                                        </div>
                                        {filteredTransfers.length > RESULT_PAGE_SIZE ? (
                                            <div className="mt-4 flex justify-center">
                                                <Pagination
                                                    page={Math.min(page, totalPages)}
                                                    total={totalPages}
                                                    onChange={setPage}
                                                    showControls
                                                    size="sm"/>
                                            </div>
                                        ) : null}
                                    </section>
                                </>
                            ) : null}
                        </ModalBody>
                        <ModalFooter className="px-5 py-4 sm:px-6">
                            <Button color="primary" radius="lg" className="font-semibold" onPress={onClose}>확인</Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
}

function TransferRow({ transfer }: { transfer: FineTransfer }) {
    return (
        <tr className="transition-colors hover:bg-primary-50/50 dark:hover:bg-primary-500/10">
            <td className="px-4 py-3">
                <ParticipantIdentity participant={transfer.sender} emblemSize={24} compact/>
            </td>
            <td className="px-4 py-3">
                <ParticipantIdentity participant={transfer.receiver} emblemSize={24} compact/>
            </td>
            <td className="px-4 py-3 text-right">
                <GoldValue value={transfer.mailAmount} className="justify-end font-bold text-warning-700 dark:text-warning-400"/>
            </td>
        </tr>
    );
}

export default function FineCalculatorClient() {
    const [actions, setActions] = useState<FineAction[]>([]);
    const [participants, setParticipants] = useState<FineParticipant[]>([]);
    const [actionName, setActionName] = useState("");
    const [actionGold, setActionGold] = useState(0);
    const [nickname, setNickname] = useState("");
    const [job, setJob] = useState("");
    const [ignoreMailFee, setIgnoreMailFee] = useState(true);
    const [settlement, setSettlement] = useState<FineSettlement | null>(null);
    const { isOpen, onOpen, onOpenChange } = useDisclosure();

    const participantTotals = useMemo(() => new Map(
        participants.map((participant) => [participant.id, getParticipantFineTotal(participant, actions)])
    ), [actions, participants]);

    function addAction() {
        const trimmedName = actionName.trim();
        if (!trimmedName) {
            addToast({ title: "행위 이름을 입력해주세요.", color: "warning" });
            return;
        }
        if (actions.length >= MAX_FINE_ACTIONS) {
            addToast({ title: "벌금 행위는 최대 10개까지 추가할 수 있습니다.", color: "warning" });
            return;
        }
        if (actions.some((action) => action.name.toLocaleLowerCase() === trimmedName.toLocaleLowerCase())) {
            addToast({ title: "이미 추가된 벌금 행위입니다.", color: "warning" });
            return;
        }

        const nextAction: FineAction = {
            id: createId("action"),
            name: trimmedName,
            gold: normalizeFineGold(actionGold)
        };
        setActions((current) => [...current, nextAction]);
        setActionName("");
        setActionGold(0);
    }

    function updateAction(actionId: string, field: "name" | "gold", value: string | number) {
        setActions((current) => current.map((action) => action.id === actionId
            ? {
                ...action,
                [field]: field === "gold" ? normalizeFineGold(Number(value)) : String(value)
            }
            : action));
    }

    function deleteAction(actionId: string) {
        setActions((current) => current.filter((action) => action.id !== actionId));
        setParticipants((current) => current.map((participant) => {
            const nextCounts = { ...participant.counts };
            delete nextCounts[actionId];
            return { ...participant, counts: nextCounts };
        }));
    }

    function addParticipant() {
        const trimmedNickname = nickname.trim();
        if (!trimmedNickname) {
            addToast({ title: "캐릭터명을 입력해주세요.", color: "warning" });
            return;
        }
        if (!job) {
            addToast({ title: "직업을 선택해주세요.", color: "warning" });
            return;
        }
        if (participants.length >= MAX_FINE_PARTICIPANTS) {
            addToast({ title: "참여 캐릭터는 최대 20명까지 추가할 수 있습니다.", color: "warning" });
            return;
        }
        if (participants.some((participant) => participant.nickname.toLocaleLowerCase() === trimmedNickname.toLocaleLowerCase())) {
            addToast({ title: "이미 추가된 캐릭터명입니다.", color: "warning" });
            return;
        }

        setParticipants((current) => [...current, {
            id: createId("participant"),
            nickname: trimmedNickname,
            job,
            counts: {}
        }]);
        setNickname("");
        setJob("");
    }

    function changeCount(participantId: string, actionId: string, delta: number) {
        setParticipants((current) => current.map((participant) => {
            if (participant.id !== participantId) return participant;
            const currentCount = participant.counts[actionId] ?? 0;
            return {
                ...participant,
                counts: {
                    ...participant.counts,
                    [actionId]: Math.max(0, currentCount + delta)
                }
            };
        }));
    }

    function calculate() {
        if (actions.length === 0) {
            addToast({ title: "벌금 행위를 하나 이상 추가해주세요.", color: "warning" });
            return;
        }
        if (participants.length < 2) {
            addToast({ title: "정산하려면 참여 캐릭터가 2명 이상 필요합니다.", color: "warning" });
            return;
        }
        setSettlement(calculateFineSettlement(participants, actions, ignoreMailFee));
        onOpen();
    }

    return (
        <div className="w-full">
            <section className="mb-5 overflow-hidden rounded-2xl border border-default-200/80 bg-gradient-to-br from-primary-50 via-content1 to-content1 px-5 py-5 shadow-sm dark:border-white/10 dark:from-primary-950/30 dark:via-[#18181b] dark:to-[#18181b] sm:px-6">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Fine Calculator</p>
                <h1 className="mt-1 text-2xl font-bold">벌금 계산기</h1>
                <p className="mt-1 text-sm text-default-500">레이드 중 발생한 벌금을 기록하고, 서로 주고받을 금액을 상계해 간편하게 정산합니다.</p>
            </section>

            <div className="grid gap-4 lg:grid-cols-2">
                <section className="rounded-2xl border border-default-200/80 bg-content1/95 p-4 shadow-sm dark:border-white/10 dark:bg-[#18181b] sm:p-5">
                    <div className="mb-4 flex items-start justify-between gap-3">
                        <div>
                            <h2 className="text-lg font-bold">벌금 행위</h2>
                            <p className="mt-0.5 text-xs text-default-500">행위와 1회당 금액을 등록해주세요.</p>
                        </div>
                        <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">{actions.length} / {MAX_FINE_ACTIONS}</span>
                    </div>
                    <div className="grid items-end gap-2 sm:grid-cols-[minmax(0,1fr)_180px_auto]">
                        <Input
                            label="행위 이름"
                            labelPlacement="outside"
                            placeholder="예: 특정 패턴에 잡히기"
                            value={actionName}
                            maxLength={30}
                            radius="lg"
                            onValueChange={setActionName}
                            onKeyDown={(event) => {
                                if (event.key === "Enter") addAction();
                            }}/>
                        <NumberInput
                            label="1회 벌금"
                            labelPlacement="outside"
                            value={actionGold}
                            minValue={0}
                            maxValue={MAX_FINE_GOLD}
                            radius="lg"
                            startContent={<img src="/icons/gold.png" alt="골드" className="h-4 w-4"/>}
                            onValueChange={(value) => setActionGold(normalizeFineGold(value))}/>
                        <Button
                            color="primary"
                            radius="lg"
                            className="h-10 font-semibold"
                            isDisabled={actions.length >= MAX_FINE_ACTIONS}
                            onPress={addAction}>추가</Button>
                    </div>
                    <div className="mt-4 space-y-2">
                        {actions.length === 0 ? (
                            <EmptyBox title="등록된 벌금 행위가 없습니다." description="행위를 추가하면 참여자별 횟수를 기록할 수 있습니다."/>
                        ) : actions.map((action, index) => (
                            <div key={action.id} className="grid items-center gap-2 rounded-xl border border-default-200/70 bg-default-50/70 p-2.5 dark:border-white/10 dark:bg-white/[0.04] sm:grid-cols-[28px_minmax(0,1fr)_170px_34px]">
                                <span className="hidden h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary sm:flex">{index + 1}</span>
                                <Input
                                    aria-label={`${index + 1}번 벌금 행위 이름`}
                                    size="sm"
                                    value={action.name}
                                    maxLength={30}
                                    onValueChange={(value) => updateAction(action.id, "name", value)}/>
                                <NumberInput
                                    aria-label={`${action.name} 1회 벌금`}
                                    size="sm"
                                    value={action.gold}
                                    minValue={0}
                                    maxValue={MAX_FINE_GOLD}
                                    startContent={<img src="/icons/gold.png" alt="골드" className="h-4 w-4"/>}
                                    onValueChange={(value) => updateAction(action.id, "gold", value)}/>
                                <Button
                                    isIconOnly
                                    size="sm"
                                    radius="lg"
                                    variant="light"
                                    color="danger"
                                    aria-label={`${action.name} 삭제`}
                                    onPress={() => deleteAction(action.id)}>
                                    <DeleteIcon/>
                                </Button>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="rounded-2xl border border-default-200/80 bg-content1/95 p-4 shadow-sm dark:border-white/10 dark:bg-[#18181b] sm:p-5">
                    <div className="mb-4 flex items-start justify-between gap-3">
                        <div>
                            <h2 className="text-lg font-bold">참여 캐릭터</h2>
                            <p className="mt-0.5 text-xs text-default-500">캐릭터명과 직업을 선택해주세요.</p>
                        </div>
                        <span className="rounded-full bg-secondary/10 px-2.5 py-1 text-xs font-semibold text-secondary">{participants.length} / {MAX_FINE_PARTICIPANTS}</span>
                    </div>
                    <div className="grid items-end gap-2 sm:grid-cols-[minmax(0,1fr)_190px_auto]">
                        <Input
                            label="캐릭터명"
                            labelPlacement="outside"
                            placeholder="캐릭터명 입력"
                            value={nickname}
                            maxLength={20}
                            radius="lg"
                            onValueChange={setNickname}
                            onKeyDown={(event) => {
                                if (event.key === "Enter") addParticipant();
                            }}/>
                        <Select
                            label="직업"
                            labelPlacement="outside"
                            placeholder="직업 선택"
                            radius="lg"
                            selectedKeys={job ? new Set([job]) : new Set()}
                            startContent={job ? <JobEmblemIcon job={job} size={20} className="text-foreground"/> : null}
                            onSelectionChange={(keys) => setJob(String(Array.from(keys)[0] ?? ""))}>
                            {JOBS.map((jobName) => (
                                <SelectItem key={jobName} textValue={jobName} startContent={<JobEmblemIcon job={jobName} size={22} className="text-foreground"/>}>
                                    {jobName}
                                </SelectItem>
                            ))}
                        </Select>
                        <Button
                            color="secondary"
                            radius="lg"
                            className="h-10 font-semibold text-white"
                            isDisabled={participants.length >= MAX_FINE_PARTICIPANTS}
                            onPress={addParticipant}>추가</Button>
                    </div>
                    <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                        {participants.length === 0 ? (
                            <div className="sm:col-span-2">
                                <EmptyBox title="등록된 참여 캐릭터가 없습니다." description="두 명 이상 추가하면 벌금을 정산할 수 있습니다."/>
                            </div>
                        ) : participants.map((participant) => (
                            <div key={participant.id} className="flex min-w-0 items-center gap-2 rounded-xl border border-default-200/70 bg-default-50/70 px-3 py-2.5 dark:border-white/10 dark:bg-white/[0.04]">
                                <div className="min-w-0 grow">
                                    <ParticipantIdentity participant={participant} emblemSize={30} showJob/>
                                </div>
                                <Button
                                    isIconOnly
                                    size="sm"
                                    radius="lg"
                                    variant="light"
                                    color="danger"
                                    aria-label={`${participant.nickname} 삭제`}
                                    onPress={() => setParticipants((current) => current.filter((item) => item.id !== participant.id))}>
                                    <DeleteIcon/>
                                </Button>
                            </div>
                        ))}
                    </div>
                </section>
            </div>

            <section className="mt-4 overflow-hidden rounded-2xl border border-default-200/80 bg-content1/95 shadow-sm dark:border-white/10 dark:bg-[#18181b]">
                <div className="flex flex-wrap items-end justify-between gap-2 border-b border-default-200/70 px-4 py-4 dark:border-white/10 sm:px-5">
                    <div>
                        <h2 className="text-lg font-bold">참여자별 벌금 기록</h2>
                        <p className="mt-0.5 text-xs text-default-500">행위 횟수를 조절하면 발생 금액과 총 벌금이 바로 반영됩니다.</p>
                    </div>
                    <span className="hidden text-xs text-default-400 sm:inline">가운데 영역을 좌우로 스크롤할 수 있습니다.</span>
                </div>
                {participants.length === 0 ? (
                    <div className="p-4 sm:p-5">
                        <EmptyBox title="참여 캐릭터를 먼저 추가해주세요." description="캐릭터명과 직업을 등록하면 이곳에 벌금 기록표가 표시됩니다."/>
                    </div>
                ) : (
                    <>
                    <div className="space-y-3 p-3 sm:hidden">
                        {participants.map((participant) => (
                            <article key={participant.id} className="overflow-hidden rounded-2xl border border-default-200/80 bg-content1 dark:border-white/10 dark:bg-white/[0.025]">
                                <div className="border-b border-default-200/70 px-3.5 py-3 dark:border-white/10">
                                    <ParticipantIdentity participant={participant} emblemSize={32} showJob/>
                                </div>
                                <div className="space-y-2 p-3">
                                    {actions.length === 0 ? (
                                        <div className="rounded-xl bg-default-50 px-3 py-5 text-center text-xs text-default-400 dark:bg-white/[0.04]">벌금 행위를 추가해주세요.</div>
                                    ) : actions.map((action) => {
                                        const count = participant.counts[action.id] ?? 0;
                                        return (
                                            <div key={action.id} className="rounded-xl border border-default-200/70 bg-default-50/70 p-3 dark:border-white/10 dark:bg-white/[0.04]">
                                                <div className="mb-3 flex min-w-0 items-center justify-between gap-2">
                                                    <span className="truncate text-sm font-bold">{action.name}</span>
                                                    <GoldValue value={action.gold} className="shrink-0 text-[11px] text-default-400"/>
                                                </div>
                                                <div className="flex items-center justify-between gap-3">
                                                    <FineCountButtons participant={participant} action={action} count={count} onChange={changeCount}/>
                                                    <div className="text-right">
                                                        <p className="mb-0.5 text-[10px] text-default-400">발생 금액</p>
                                                        <GoldValue value={count * action.gold} className="justify-end text-xs font-bold text-default-600"/>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                                <div className="flex items-center justify-between border-t border-warning-200/60 bg-warning-50/70 px-3.5 py-3 dark:border-warning-500/20 dark:bg-warning-500/10">
                                    <span className="text-xs font-bold text-warning-800 dark:text-warning-300">총 벌금</span>
                                    <GoldValue value={participantTotals.get(participant.id) ?? 0} className="text-base font-black text-warning-700 dark:text-warning-400"/>
                                </div>
                            </article>
                        ))}
                    </div>

                    <div className="hidden sm:grid sm:grid-cols-[190px_minmax(0,1fr)_150px]">
                        <div className="relative z-10 border-r border-default-200/70 bg-content1 dark:border-white/10 dark:bg-[#18181b]">
                            <div className="flex h-16 items-center px-4 text-xs font-bold text-default-500">캐릭터</div>
                            {participants.map((participant) => (
                                <div key={participant.id} className="flex h-[108px] min-w-0 items-center border-t border-default-200/70 px-4 dark:border-white/10">
                                    <ParticipantIdentity participant={participant} emblemSize={28} compact showJob/>
                                </div>
                            ))}
                        </div>

                        <div className="overflow-x-auto bg-default-50/30 dark:bg-white/[0.015]">
                            <div style={{ minWidth: actions.length > 0 ? `${actions.length * 170}px` : "100%" }}>
                                <div className="flex h-16">
                                    {actions.length === 0 ? (
                                        <div className="flex w-full items-center justify-center px-3 text-xs text-default-400">벌금 행위를 추가해주세요.</div>
                                    ) : actions.map((action) => (
                                        <div key={action.id} className="flex w-[170px] shrink-0 flex-col items-center justify-center border-r border-default-200/60 px-2 text-center last:border-r-0 dark:border-white/10">
                                            <span className="max-w-full truncate text-xs font-bold">{action.name}</span>
                                            <GoldValue value={action.gold} className="mt-1 text-[11px] text-default-400"/>
                                        </div>
                                    ))}
                                </div>
                                {participants.map((participant) => (
                                    <div key={participant.id} className="flex h-[108px] border-t border-default-200/70 dark:border-white/10">
                                        {actions.length === 0 ? (
                                            <div className="flex w-full items-center justify-center text-xs text-default-300">-</div>
                                        ) : actions.map((action) => {
                                            const count = participant.counts[action.id] ?? 0;
                                            return (
                                                <div key={action.id} className="flex w-[170px] shrink-0 flex-col items-center justify-center border-r border-default-200/60 px-2 last:border-r-0 dark:border-white/10">
                                                    <FineCountButtons participant={participant} action={action} count={count} onChange={changeCount}/>
                                                    <GoldValue value={count * action.gold} className="mt-2 text-[11px] font-medium text-default-500"/>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="relative z-10 border-l border-default-200/70 bg-content1 text-right shadow-[-8px_0_18px_rgba(0,0,0,0.025)] dark:border-white/10 dark:bg-[#18181b]">
                            <div className="flex h-16 items-center justify-end px-4 text-xs font-bold text-default-500">총 벌금</div>
                            {participants.map((participant) => (
                                <div key={participant.id} className="flex h-[108px] items-center justify-end border-t border-default-200/70 px-4 dark:border-white/10">
                                    <GoldValue value={participantTotals.get(participant.id) ?? 0} className="text-base font-black text-warning-700 dark:text-warning-400"/>
                                </div>
                            ))}
                        </div>
                    </div>
                    </>
                )}
            </section>

            <section className="mt-4 rounded-2xl border border-primary-200/60 bg-gradient-to-br from-primary-50/80 via-content1 to-content1 p-4 shadow-sm dark:border-primary-800/30 dark:from-primary-500/10 dark:via-[#18181b] dark:to-[#18181b] sm:p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="max-w-2xl">
                        <h2 className="text-lg font-bold">벌금 정산하기</h2>
                        <p className="mt-1 text-sm leading-6 text-default-500">각 벌금을 나머지 참여자에게 공평하게 나눈 뒤, 서로 주고받을 금액을 상계해 실제로 보내야 할 내역만 보여드립니다.</p>
                    </div>
                    <div className="flex w-full shrink-0 flex-col items-start gap-2 sm:w-auto sm:items-stretch">
                        <Checkbox
                            className="sm:self-center"
                            size="sm"
                            isSelected={ignoreMailFee}
                            onValueChange={setIgnoreMailFee}>
                            우편 수수료 5% 무시
                        </Checkbox>
                        <Button
                            color="primary"
                            radius="lg"
                            size="lg"
                            className="w-full font-bold shadow-md shadow-primary/20 sm:px-8"
                            isDisabled={actions.length === 0 || participants.length < 2}
                            onPress={calculate}>
                            계산하기
                        </Button>
                    </div>
                </div>
            </section>

            <SettlementModal settlement={settlement} isOpen={isOpen} onOpenChange={onOpenChange}/>
        </div>
    );
}

function EmptyBox({ title, description }: { title: string; description: string }) {
    return (
        <div className="rounded-xl border border-dashed border-default-300/80 bg-default-50/60 px-4 py-6 text-center dark:border-white/15 dark:bg-white/[0.025]">
            <p className="text-sm font-semibold text-default-600">{title}</p>
            <p className="mt-1 text-xs text-default-400">{description}</p>
        </div>
    );
}
