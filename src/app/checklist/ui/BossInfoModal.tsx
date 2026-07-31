'use client'

import { useEffect, useState } from "react";
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
    Selection,
    Table,
    TableBody,
    TableCell,
    TableColumn,
    TableHeader,
    TableRow
} from "@heroui/react";
import type { Boss } from "../../api/checklist/boss/route";
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
    return bosses.sort((a, b) => {
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

export default function BossInfoModal({ isOpenBosses, onOpenBosses, bosses }: BossInfoModalProps) {
    const [value, setValue] = useState<Selection>(new Set(['0']));
    const [boss, setBoss] = useState<Boss>(sortBossesByLevel(bosses)[0]);

    useEffect(() => {
        const valueList = Array.from(value);
        const sortedBosses = sortBossesByLevel(bosses);
        if (valueList.length === 0) {
            setBoss(sortedBosses[0]);
        } else {
            setBoss(sortedBosses[Number(valueList[0])]);
        }
    }, [value]);

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
                                    selectedKeys={value}
                                    radius="md"
                                    variant="bordered"
                                    defaultSelectedKeys={'0'}
                                    onSelectionChange={setValue}>
                                    {sortBossesByLevel(bosses).map(boss => boss.name).map((boss, index) => (
                                        <SelectItem key={index}>{boss}</SelectItem>
                                    ))}
                                </Select>
                                <div className="mt-5 w-full">
                                    <h3 className="text-lg font-semibold">{boss.name}</h3>
                                    {getDifficultyByBosses(boss).map((diff, idx) => (
                                        <div key={idx} className="mt-3 rounded-xl border border-gray-200/80 bg-gray-50/60 p-3 dark:border-gray-800 dark:bg-gray-900/50 sm:p-4">
                                            <div className="flex items-center justify-between gap-3">
                                                <p className="text-sm font-medium fadedtext">난이도</p>
                                                <Chip
                                                    variant="flat"
                                                    radius="md"
                                                    color={getTextColorByDifficulty(diff)}
                                                    className="font-medium">
                                                    {diff}
                                                </Chip>
                                            </div>
                                            <div className="mt-3 grid grid-cols-1 gap-2 min-[420px]:grid-cols-3">
                                                <GoldSummary label="총 골드량" value={getSumGoldByDifficulty(boss, diff)}/>
                                                <GoldSummary label="골드량" value={getGoldByDifficulty(boss, diff)}/>
                                                <GoldSummary label="귀속 골드" value={getBoundGoldByDifficulty(boss, diff)}/>
                                            </div>
                                            <div className="mt-3 overflow-x-auto rounded-lg border border-gray-200/80 bg-white dark:border-gray-800 dark:bg-gray-950/70">
                                                <Table removeWrapper aria-label={`${boss.name} ${diff} 골드 정보`} className="min-w-[480px]">
                                                    <TableHeader>
                                                        <TableColumn>관문</TableColumn>
                                                        <TableColumn>골드</TableColumn>
                                                        <TableColumn>귀속 골드</TableColumn>
                                                        <TableColumn>더보기</TableColumn>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {boss.difficulty.filter(d => d.difficulty === diff).map((item, ix) => (
                                                            <TableRow key={ix}>
                                                                <TableCell>{item.stage}관문</TableCell>
                                                                <TableCell><GoldValue value={item.gold}/></TableCell>
                                                                <TableCell><GoldValue value={item.boundGold}/></TableCell>
                                                                <TableCell><GoldValue value={item.bonus}/></TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </div>
                                        </div>
                                    ))}
                                </div>
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

function GoldSummary({ label, value }: { label: string, value: number }) {
    return (
        <div className="rounded-lg bg-white p-3 dark:bg-gray-950/70">
            <p className="fadedtext text-sm">{label}</p>
            <div className="mt-1 flex items-center gap-1.5 font-semibold">
                <GoldIcon/>
                <p>{value.toLocaleString()}</p>
            </div>
        </div>
    )
}

function GoldValue({ value }: { value: number }) {
    return (
        <div className="flex gap-1 items-center">
            <GoldIcon/>
            <p>{value.toLocaleString()}</p>
        </div>
    )
}

function GoldIcon() {
    return <img src="/icons/gold.png" alt="goldicon" className="w-[14px] h-[14px]"/>
}
