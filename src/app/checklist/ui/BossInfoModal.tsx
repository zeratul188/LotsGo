'use client'

import { useEffect, useMemo, useState } from "react";
import {
    Button,
    Chip,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    Select,
    SelectItem,
    Selection
} from "@heroui/react";
import type { Boss, Difficulty } from "../../api/checklist/boss/route";
import {
    getBoundGoldByDifficulty,
    getDifficultyByBosses,
    getGoldByDifficulty,
    getSumGoldByDifficulty,
    getTextColorByDifficulty
} from "../lib/checklistFeat";

type BossInfoModalProps = {
    isOpenBosses: boolean,
    onOpenBosses: (isOpen: boolean) => void,
    bosses: Boss[]
}

function sortBossesByLevel(bosses: Boss[]): Boss[] {
    return [...bosses].sort((a, b) => {
        const bDiff = bosses.find(boss => boss.name === b.name);
        const aDiff = bosses.find(boss => boss.name === a.name);
        let bValue = 0, aValue = 0;
        if (bDiff){
            bValue = Math.min(...bDiff.difficulty.map(diff => diff.level));
        }
        if (aDiff) {
            aValue = Math.min(...aDiff.difficulty.map(diff => diff.level));
        }
        return bValue - aValue;
    });
}

const REMOVED_BOSS_NAMES = new Set(["카멘 익스트림"]);

export default function BossInfoModal({ isOpenBosses, onOpenBosses, bosses }: BossInfoModalProps) {
    const availableBosses = useMemo(
        () => sortBossesByLevel(bosses.filter((item) => !REMOVED_BOSS_NAMES.has(item.name))),
        [bosses]
    );
    const [selectedBossId, setSelectedBossId] = useState<string | undefined>(() => availableBosses[0]?.id);

    useEffect(() => {
        setSelectedBossId((currentId) => (
            currentId && availableBosses.some((item) => item.id === currentId)
                ? currentId
                : availableBosses[0]?.id
        ));
    }, [availableBosses]);

    const boss = availableBosses.find((item) => item.id === selectedBossId) ?? availableBosses[0];

    return (
        <Modal
            radius="lg"
            size="2xl"
            scrollBehavior="inside"
            isOpen={isOpenBosses}
            onOpenChange={onOpenBosses}>
            <ModalContent className="border border-gray-200/80 bg-white dark:border-gray-800 dark:bg-gray-950">
                {(onClose) => (
                    <>
                        <ModalHeader className="flex flex-col gap-1 border-b border-gray-200/80 px-6 py-5 dark:border-gray-800">
                            <div className="flex items-center gap-2">
                                <span className="h-5 w-1 rounded-full bg-secondary"/>
                                <p className="text-xl font-semibold">콘텐츠 정보</p>
                            </div>
                            <p className="pl-3 text-sm font-normal fadedtext">레이드별 관문 보상과 획득 골드를 확인하세요.</p>
                        </ModalHeader>
                        <ModalBody className="gap-4 px-6 py-5">
                            <div className="w-full">
                                <Select
                                    fullWidth
                                    label="콘텐츠 선택"
                                    placeholder="콘텐츠를 선택하세요."
                                    selectedKeys={selectedBossId ? new Set([selectedBossId]) : new Set()}
                                    disallowEmptySelection={availableBosses.length > 0}
                                    radius="md"
                                    variant="bordered"
                                    onSelectionChange={(keys: Selection) => {
                                        const selectedKey = Array.from(keys)[0];
                                        if (selectedKey && selectedKey !== 'all') {
                                            setSelectedBossId(String(selectedKey));
                                        }
                                    }}>
                                    {availableBosses.map((item) => (
                                        <SelectItem key={item.id}>{item.name}</SelectItem>
                                    ))}
                                </Select>
                                {boss ? <div className="mt-5 w-full">
                                    <div className="flex items-end justify-between gap-3">
                                        <div>
                                            <p className="text-xs font-medium text-secondary">선택 콘텐츠</p>
                                            <h3 className="mt-0.5 text-lg font-semibold">{boss.name}</h3>
                                        </div>
                                        <Chip size="sm" radius="md" variant="flat" className="shrink-0 text-xs fadedtext">
                                            {getDifficultyByBosses(boss).length}개 난이도
                                        </Chip>
                                    </div>
                                    <div className="mt-3 space-y-3">
                                        {getDifficultyByBosses(boss).map((diff) => {
                                            const difficultyItems = boss.difficulty.filter(item => item.difficulty === diff);
                                            const entryLevel = Math.min(...difficultyItems.map(item => item.level));

                                            return (
                                                <section key={diff} className="overflow-hidden rounded-xl border border-gray-200/80 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950/70">
                                                    <div className="flex items-center justify-between gap-3 border-b border-gray-200/80 bg-gray-50/70 px-4 py-3 dark:border-gray-800 dark:bg-gray-900/60">
                                                        <div className="flex min-w-0 items-center gap-2.5">
                                                            <span className={`h-8 w-1 shrink-0 rounded-full ${getDifficultyAccentClass(diff)}`}/>
                                                            <div className="min-w-0">
                                                                <div className="flex items-center gap-2">
                                                                    <p className={`text-sm font-bold ${getDifficultyTextClass(diff)}`}>
                                                                        {diff}
                                                                    </p>
                                                                    <p className="text-xs fadedtext">{difficultyItems.length}개 관문</p>
                                                                </div>
                                                                <p className="mt-1 text-xs fadedtext">
                                                                    입장 아이템 레벨 <strong className="text-sm font-bold text-gray-900 dark:text-white">{entryLevel.toLocaleString()}</strong>
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="shrink-0 text-right">
                                                            <p className="text-[11px] font-medium fadedtext">총 획득 골드</p>
                                                            <GoldAmount value={getSumGoldByDifficulty(boss, diff)} size="lg"/>
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-2 p-3">
                                                        <GoldSummary label="일반 골드" value={getGoldByDifficulty(boss, diff)}/>
                                                        <GoldSummary label="귀속 골드" value={getBoundGoldByDifficulty(boss, diff)} tone="bound"/>
                                                    </div>

                                                    <div className="border-t border-gray-200/80 px-3 pb-3 pt-2.5 dark:border-gray-800">
                                                        <div className="flex items-center justify-between px-1">
                                                            <p className="text-xs font-semibold">관문별 보상</p>
                                                            <p className="text-[11px] fadedtext">더보기 비용 포함</p>
                                                        </div>
                                                        <div className="mt-2 space-y-2">
                                                            {difficultyItems.map((item) => (
                                                                <StageRewardRow key={`${diff}-${item.stage}`} item={item} difficulty={diff}/>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </section>
                                            )
                                        })}
                                    </div>
                                </div> : null}
                            </div>
                        </ModalBody>
                        <ModalFooter className="border-t border-gray-200/80 px-6 py-4 dark:border-gray-800">
                            <Button radius="md" variant="flat" onPress={onClose}>닫기</Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    )
}

function getDifficultyAccentClass(diff: string): string {
    const color = getTextColorByDifficulty(diff);
    if (color === 'primary') return 'bg-primary';
    if (color === 'success') return 'bg-success';
    if (color === 'danger') return 'bg-danger';
    if (color === 'secondary') return 'bg-secondary';
    return 'bg-default-400';
}

function getDifficultyTextClass(diff: string): string {
    const color = getTextColorByDifficulty(diff);
    if (color === 'primary') return 'text-primary-600 dark:text-primary-300';
    if (color === 'success') return 'text-success-600 dark:text-success-300';
    if (color === 'danger') return 'text-danger-600 dark:text-danger-300';
    if (color === 'secondary') return 'text-secondary-600 dark:text-secondary-300';
    return 'text-gray-700 dark:text-gray-200';
}

function getDifficultyStageClass(diff: string): string {
    const color = getTextColorByDifficulty(diff);
    if (color === 'primary') return 'bg-primary-100 text-primary-700 dark:bg-primary-400/20 dark:text-primary-200';
    if (color === 'success') return 'bg-success-100 text-success-700 dark:bg-success-400/20 dark:text-success-200';
    if (color === 'danger') return 'bg-danger-100 text-danger-700 dark:bg-danger-400/20 dark:text-danger-200';
    if (color === 'secondary') return 'bg-secondary-100 text-secondary-700 dark:bg-secondary-400/20 dark:text-secondary-200';
    return 'bg-default-100 text-default-700 dark:bg-default-400/20 dark:text-default-200';
}

function GoldSummary({ label, value, tone = 'default' }: { label: string, value: number, tone?: 'default' | 'gold' | 'bound' }) {
    return (
        <div className={
            tone === 'gold'
                ? "rounded-lg border border-amber-200/80 bg-amber-50/70 p-2.5 dark:border-amber-500/20 dark:bg-amber-500/10"
                : tone === 'bound'
                    ? "rounded-lg border border-secondary-200/70 bg-secondary-50/60 p-2.5 dark:border-secondary-500/20 dark:bg-secondary-500/10"
                    : "rounded-lg border border-gray-200/70 bg-gray-50/70 p-2.5 dark:border-gray-800 dark:bg-gray-900/50"
        }>
            <p className="text-[11px] font-medium fadedtext">{label}</p>
            <GoldAmount value={value}/>
        </div>
    )
}

function StageRewardRow({ item, difficulty }: { item: Difficulty, difficulty: string }) {
    return (
        <div className="grid grid-cols-[52px_repeat(3,minmax(0,1fr))] items-center gap-2 rounded-lg border border-gray-200/70 bg-gray-50/60 px-2.5 py-2.5 dark:border-gray-800 dark:bg-gray-900/40 sm:grid-cols-[64px_repeat(3,minmax(0,1fr))]">
            <div className="flex items-center gap-1.5">
                <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg text-xs font-bold ${getDifficultyStageClass(difficulty)}`}>
                    {item.stage}
                </span>
                <span className="hidden text-xs font-semibold sm:inline">관문</span>
            </div>
            <StageGoldValue label="일반" value={item.gold}/>
            <StageGoldValue label="귀속" value={item.boundGold}/>
            <StageGoldValue label="더보기" value={item.bonus}/>
        </div>
    )
}

function StageGoldValue({ label, value }: { label: string, value: number }) {
    return (
        <div className="min-w-0">
            <p className="text-[10px] font-medium fadedtext">{label}</p>
            <GoldAmount value={value} muted={value === 0}/>
        </div>
    )
}

function GoldAmount({ value, size = 'md', muted = false }: { value: number, size?: 'md' | 'lg', muted?: boolean }) {
    return (
        <div className={`mt-0.5 flex items-center gap-1 font-semibold tabular-nums ${size === 'lg' ? 'justify-end text-base text-amber-600 dark:text-amber-300' : 'text-xs sm:text-sm'} ${muted ? 'opacity-45' : ''}`}>
            <GoldIcon/>
            <span className="truncate">{value.toLocaleString()}</span>
        </div>
    )
}

function GoldIcon() {
    return <img src="/icons/gold.png" alt="" aria-hidden="true" className="h-3.5 w-3.5 shrink-0"/>
}
