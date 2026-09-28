'use client';

import { useEffect, useMemo, useRef, useState } from "react";
import { Button, Checkbox, Tab, Tabs, Tooltip } from "@heroui/react";
import { animate, motion, useMotionValue, useReducedMotion, useTransform } from "framer-motion";
import type { MotionValue } from "framer-motion";
import clsx from "clsx";
import JobEmblemIcon from "@/Icons/JobEmblemIcon";
import type { Boss } from "@/app/api/checklist/boss/route";
import type { CheckCharacter } from "@/app/store/checklistSlice";
import type { AnalysisGold, GoldAnalysisSelection } from "../model/types";
import { buildGoldAnalysis, getGoldCompositionLanes, GOLD_ANALYSIS_DIFFICULTIES, goldAnalysisPercent } from "../lib/goldAnalysisFeat";
import { getSimpleBossName } from "../lib/checklistFeat";

const COLORS = ["bg-green-500", "bg-yellow-400", "bg-purple-500"];
const PARTS = [
    { key: "shared", label: "거래가능" },
    { key: "bound", label: "귀속" },
    { key: "other", label: "부수입" }
] as const;
const clampPercent = (value: number) => Math.max(0, Math.min(100, value));

function GoldValue({ value, total }: { value: number; total?: number }) {
    return <span className="inline-flex items-center justify-end gap-1 whitespace-nowrap tabular-nums">
        <img src="/icons/gold.png" alt="골드" className="h-3.5 w-3.5 shrink-0"/>
        <span>{value.toLocaleString()}</span>
        {total !== undefined && <span className="text-xs text-default-500">({goldAnalysisPercent(value, total).toFixed(1)}%)</span>}
    </span>;
}

function GoldBreakdown({ gold, total }: { gold: AnalysisGold; total: number }) {
    const detail = <div className="space-y-1 p-1 text-xs">
        <div className="flex justify-between gap-4"><span>거래가능 골드</span><GoldValue value={gold.shared}/></div>
        <div className="flex justify-between gap-4"><span>귀속 골드</span><GoldValue value={gold.bound}/></div>
    </div>;
    return <Tooltip content={detail} showArrow>
        <span className="inline-block px-1 py-2"><GoldValue value={gold.total} total={total}/></span>
    </Tooltip>;
}

// 막대 너비와 화살표 위치를 하나의 motion value에서 파생해 이동을 동기화합니다.
function useAnimatedPercent(target: number) {
    const value = useMotionValue(0);
    const reducedMotion = useReducedMotion();
    useEffect(() => {
        const animation = animate(value, clampPercent(target), { duration: reducedMotion ? 0 : 0.4, ease: "easeInOut" });
        return () => animation.stop();
    }, [target, reducedMotion, value]);
    return value;
}

function SelectionProgress({ selected, label, total, have, expected }: {
    selected: AnalysisGold | null; label: string; total: number; have: number; expected: number;
}) {
    const progress = clampPercent(goldAnalysisPercent(have, expected));
    const position = useAnimatedPercent(selected ? goldAnalysisPercent(selected.total, expected) : 0);
    const width = useTransform(position, value => `${value}%`);
    const labelLeft = useTransform(position, value => `clamp(76px, ${value}%, calc(100% - 76px))`);
    return <div>
        <div className="relative h-7 w-full rounded-md bg-default-200" role="progressbar" aria-label="주간 골드 획득 진행률" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}>
            <div className="absolute inset-0 overflow-hidden rounded-md">
                <div className="h-full bg-orange-400 transition-[width] duration-400" style={{ width: `${progress}%` }}/>
                <motion.div className="absolute inset-y-0 left-0 bg-blue-500" style={{ width }}/>
            </div>
        </div>
        <div className="relative h-[62px] w-full" aria-live="polite">
            {selected && <>
                <motion.div className="absolute top-1" style={{ left: width }}><span className="block -translate-x-1/2 border-x-[5px] border-b-[7px] border-x-transparent border-b-blue-500"/></motion.div>
                <motion.div className="absolute top-[11px] h-[5px] w-px -translate-x-1/2 bg-blue-500" style={{ left: width }}/>
                <motion.div className="absolute top-4 flex w-[152px] -translate-x-1/2 flex-col items-center gap-1 text-xs" style={{ left: labelLeft }}>
                    <span className="max-w-full truncate font-semibold" title={label}>{label}</span>
                    <GoldValue value={selected.total} total={total}/>
                </motion.div>
            </>}
        </div>
    </div>;
}

function CompositionPart({ index, start, span, total, selected, share, lanes }: {
    index: number; start: number; span: number; total: number; selected: number | null;
    share: MotionValue<number>; lanes: MotionValue<number[]>;
}) {
    const width = useTransform(share, value => `${value}%`);
    const point = useTransform(share, value => `${start + span * value / 100}%`);
    const labelLeft = useTransform(share, value => `clamp(76px, ${start + span * value / 100}%, calc(100% - 76px))`);
    const labelBottom = useTransform(lanes, value => 22 + value[index] * 46);
    const connectorHeight = useTransform(lanes, value => 3 + value[index] * 46);
    return <>
        <div className={clsx("absolute bottom-0 h-2 overflow-hidden", start === 0 && "rounded-l-full", start + span >= 99.999 && "rounded-r-full")} style={{ left: `${start}%`, width: `${span}%` }}>
            <div className={clsx("absolute inset-0", COLORS[index], selected === null ? "opacity-100" : "opacity-25")}/>
            <motion.div className={clsx("absolute inset-y-0 left-0", COLORS[index])} style={{ width }}/>
        </div>
        {selected !== null && selected !== 0 && <>
            <motion.div className="absolute flex w-[152px] -translate-x-1/2 flex-col items-center gap-1 text-xs" style={{ bottom: labelBottom, left: labelLeft }}>
                <span className="block font-medium">{PARTS[index].label}</span>
                <GoldValue value={selected} total={total}/>
            </motion.div>
            <motion.div className={clsx("absolute bottom-[19px] w-px -translate-x-1/2", COLORS[index])} style={{ left: point, height: connectorHeight }}/>
            <motion.div className="absolute bottom-3" style={{ left: point }}><span className={clsx("block -translate-x-1/2 border-x-[5px] border-t-[7px] border-x-transparent", ["border-t-green-500", "border-t-yellow-400", "border-t-purple-500"][index])}/></motion.div>
        </>}
    </>;
}

function CompositionProgress({ gold, selected }: { gold: AnalysisGold; selected: AnalysisGold | null }) {
    // 순수 지출이 있는 오래된 기록도 수치는 유지하고, 막대는 음수 너비가 되지 않게 합니다.
    const positiveTotal = PARTS.reduce((sum, part) => sum + Math.max(0, gold[part.key]), 0);
    const spans = PARTS.map(part => goldAnalysisPercent(Math.max(0, gold[part.key]), positiveTotal));
    const starts = [0, spans[0], spans[0] + spans[1]];
    const shares = [
        useAnimatedPercent(selected ? goldAnalysisPercent(selected.shared, gold.shared) : 100),
        useAnimatedPercent(selected ? goldAnalysisPercent(selected.bound, gold.bound) : 100),
        useAnimatedPercent(selected ? goldAnalysisPercent(selected.other, gold.other) : 100)
    ];
    const barRef = useRef<HTMLDivElement>(null);
    const barWidth = useMotionValue(0);
    useEffect(() => {
        const bar = barRef.current;
        if (!bar) return;
        const updateWidth = () => barWidth.set(bar.getBoundingClientRect().width);
        updateWidth();
        const observer = new ResizeObserver(updateWidth);
        observer.observe(bar);
        return () => observer.disconnect();
    }, [barWidth]);
    const visible = PARTS.map(part => gold.total > 0 && !!selected && selected[part.key] !== 0);
    const lanes = useTransform<number, number[]>([...shares, barWidth], values => getGoldCompositionLanes(
        starts.map((start, index) => start + spans[index] * values[index] / 100), visible, values[3]
    ));
    const height = useTransform(lanes, values => visible.some(Boolean) ? 58 + Math.max(...values) * 46 : 8);
    return <div>
        <motion.div ref={barRef} className="relative w-full" style={{ height }} role="img" aria-label={`현재 획득 골드 구성: 거래가능 ${gold.shared}, 귀속 ${gold.bound}, 부수입 ${gold.other}`}>
            <div className="absolute bottom-0 h-2 w-full rounded-full bg-default-200"/>
            {gold.total > 0 && PARTS.map((part, index) => {
                return <CompositionPart key={part.key} index={index} start={starts[index]} span={spans[index]} total={gold[part.key]} selected={selected ? selected[part.key] : null} share={shares[index]} lanes={lanes}/>;
            })}
        </motion.div>
    </div>;
}

export default function GoldAnalysis({ checklist, bosses }: { checklist: CheckCharacter[]; bosses: Boss[] }) {
    const [tab, setTab] = useState("character");
    const [includeIncomplete, setIncludeIncomplete] = useState(false);
    const [selection, setSelection] = useState<GoldAnalysisSelection>(null);
    const completed = useMemo(() => buildGoldAnalysis(bosses, checklist, false), [bosses, checklist]);
    const expected = useMemo(() => buildGoldAnalysis(bosses, checklist, true), [bosses, checklist]);
    const analysis = includeIncomplete ? expected : completed;
    const resolveSelection = (data: typeof analysis) => {
        if (!selection) return null;
        if (selection.type === "character") return data.characters.find(row => row.key === selection.key)?.gold ?? null;
        if (selection.type === "account") return data.accounts.get(selection.key) ?? null;
        return data.contents.find(row => row.key === selection.key)?.gold ?? null;
    };
    const selected = resolveSelection(analysis);
    const selectedCompleted = resolveSelection(completed);
    const label = selection?.type === "character"
        ? analysis.characters.find(row => row.key === selection.key)?.character.nickname ?? ""
        : selection?.type === "content" ? getSimpleBossName(bosses, analysis.contents.find(row => row.key === selection.key)?.name ?? "") : selection?.key ?? "";
    const select = (type: NonNullable<GoldAnalysisSelection>["type"], key: string) => {
        setSelection(previous => previous?.type === type && previous.key === key ? null : { type, key });
    };
    const cell = "px-3 py-2 text-right";
    const stickyCell = "sm:sticky sm:left-0 sm:z-10 border-r border-default-200";
    const sticky = `${stickyCell} bg-white dark:bg-[#171717]`;
    return <div className="space-y-4">
        <div className="flex justify-end">
            <Checkbox size="sm" color="warning" isSelected={includeIncomplete} onValueChange={setIncludeIncomplete}>미완료도 포함</Checkbox>
        </div>
        <div className="rounded-xl border border-default-200 bg-default-50 p-3 sm:p-4">
            <div className="mb-2 flex flex-wrap items-center justify-end gap-x-4 gap-y-2">
                <span className="flex flex-wrap items-center gap-1 text-sm"><GoldValue value={completed.gold.total}/><span className="text-default-500">/ {expected.gold.total.toLocaleString()} ({clampPercent(goldAnalysisPercent(completed.gold.total, expected.gold.total)).toFixed(1)}%)</span></span>
                {tab === "character" && <div className="flex gap-3 text-[11px] text-default-500">{PARTS.map((part, index) => <span key={part.key} className="flex items-center gap-1"><span className={clsx("h-2 w-2 rounded-full", COLORS[index])}/>{part.label}</span>)}</div>}
            </div>
            {tab === "character" && <CompositionProgress gold={completed.gold} selected={selectedCompleted}/>}
            <div className={tab === "character" ? "mt-1" : undefined}><SelectionProgress selected={selected} label={label} total={analysis.gold.total} have={completed.gold.total} expected={expected.gold.total}/></div>
            <div className="flex flex-wrap justify-end gap-x-3 gap-y-1 text-[11px] text-default-500" aria-label="주간 골드 진행바 범례">
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-blue-500"/>선택 비중</span>
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-orange-400"/>획득 진행률</span>
            </div>
        </div>
        <Tabs aria-label="골드 분석 기준" selectedKey={tab} onSelectionChange={key => { setTab(String(key)); setSelection(null); }} color="warning" variant="underlined">
            <Tab key="character" title="캐릭터">
                <div className="mb-3 flex flex-wrap gap-2" aria-label="분석할 계정 선택">
                    {[...analysis.accounts.keys()].map(account => <Button key={account} size="sm" variant={selection?.type === "account" && selection.key === account ? "solid" : "flat"} color={selection?.type === "account" && selection.key === account ? "primary" : "default"} aria-pressed={selection?.type === "account" && selection.key === account} onPress={() => select("account", account)}>{account}</Button>)}
                </div>
                <div className="max-h-[420px] overflow-auto rounded-xl border border-default-200">
                    <table className="w-full min-w-[790px] text-sm" aria-label="캐릭터별 골드 분석">
                        <thead className="text-xs text-default-500"><tr><th scope="col" className={clsx(sticky, "w-[190px] px-3 py-3 text-left")}>캐릭터 정보</th>{["거래가능 골드", "귀속 골드", "부수입", "총 골드량"].map(title => <th scope="col" key={title} className={cell}>{title}</th>)}</tr></thead>
                        <tbody>{analysis.characters.map(row => {
                            const active = selection?.type === "character" && selection.key === row.key || selection?.type === "account" && selection.key === (row.character.account || "본계정");
                            return <tr key={row.key} className={clsx("cursor-pointer border-t border-default-200 hover:bg-default-100", active && "bg-success-50 dark:bg-success-950/30")} onClick={() => select("character", row.key)}>
                                <th scope="row" className={clsx(sticky, "p-0 text-left font-normal")}><button type="button" aria-pressed={selection?.type === "character" && selection.key === row.key} onClick={event => { event.stopPropagation(); select("character", row.key); }} className={clsx("flex w-full items-center gap-2 p-3 text-left focus-visible:outline focus-visible:outline-primary", active && "bg-success-50 dark:bg-success-950/30")}>
                                    <JobEmblemIcon job={row.character.job} size={30}/><span className="min-w-0"><span className="block break-all font-semibold">{row.character.nickname}</span><span className="block text-[11px] text-default-500">Lv.{row.character.level.toLocaleString()} · {row.character.job}</span></span>
                                </button></th>
                                {[row.gold.shared, row.gold.bound, row.gold.other, row.gold.total].map((value, index) => <td key={PARTS[index]?.key ?? "total"} className={clsx(cell, index === 3 && "font-semibold")}><GoldValue value={value} total={analysis.gold.total}/></td>)}
                            </tr>;
                        })}</tbody>
                    </table>
                    {!analysis.characters.length && <p className="p-6 text-center text-sm text-default-500">등록된 캐릭터가 없습니다.</p>}
                </div>
            </Tab>
            <Tab key="content" title="콘텐츠">
                <div className="max-h-[420px] overflow-auto rounded-xl border border-default-200">
                    <table className="w-full min-w-[920px] text-sm" aria-label="콘텐츠 난이도별 골드 분석">
                        <thead className="text-xs text-default-500"><tr><th scope="col" className={clsx(sticky, "w-[210px] px-3 py-3 text-left")}>콘텐츠명</th>{GOLD_ANALYSIS_DIFFICULTIES.map(diff => <th scope="col" className={cell} key={diff.key}>{diff.label}</th>)}<th scope="col" className={cell}>총 골드량</th></tr></thead>
                        <tbody>{analysis.contents.map(row => {
                            const active = selection?.type === "content" && selection.key === row.key;
                            return <tr key={row.key} onClick={() => select("content", row.key)} className={clsx("group cursor-pointer border-t border-default-200", active ? "bg-success-50 hover:bg-success-100 dark:bg-success-950/30 dark:hover:bg-success-950/50" : "hover:bg-default-100")}>
                                <th scope="row" className={clsx(stickyCell, "p-0 text-left font-normal", active ? "bg-success-50 group-hover:bg-success-100 dark:bg-success-950/30 dark:group-hover:bg-success-950/50" : "bg-white group-hover:bg-default-100 dark:bg-[#171717]")}><button type="button" aria-pressed={active} onClick={event => { event.stopPropagation(); select("content", row.key); }} className="w-full p-3 text-left font-medium focus-visible:outline focus-visible:outline-primary">{getSimpleBossName(bosses, row.name)}</button></th>
                                {GOLD_ANALYSIS_DIFFICULTIES.map(diff => <td key={diff.key} className={cell}>{row.supported.includes(diff.key) ? <GoldBreakdown gold={row.difficulties[diff.key]} total={analysis.gold.total}/> : <span className="text-default-400">—</span>}</td>)}
                                <td className={clsx(cell, "font-semibold")}><GoldBreakdown gold={row.gold} total={analysis.gold.total}/></td>
                            </tr>;
                        })}</tbody>
                    </table>
                    {!analysis.contents.length && <p className="p-6 text-center text-sm text-default-500">등록된 콘텐츠가 없습니다.</p>}
                </div>
            </Tab>
        </Tabs>
    </div>;
}
