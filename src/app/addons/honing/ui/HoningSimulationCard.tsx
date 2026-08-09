'use client';

import { Button, Card, CardBody, CardHeader, Checkbox, Progress, Select, SelectItem, Tab, Tabs } from '@heroui/react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { calculateHoning, getHoningAttempt } from '../lib/honingCalculator';
import { findHoningRate, type HoningPart, type HoningTier } from '../data/honingRates';
import type { HoningAttempt, HoningCalculationInput, HoningSimulationOptions, OwnedMaterialKey, OwnedMaterials } from '../model/calculatorTypes';
import type { HoningMaterialPriceData } from '../model/types';

type SimulationMode = 'optimal' | 'custom';
type SimulationSpeed = 'fast' | 'normal' | 'slow';
type SimulationRow = HoningAttempt & { success: boolean };
type SimulationRecord = { id: string; createdAt: number; tier: HoningTier; part: HoningPart; level: number; mode: SimulationMode; useBook: boolean; useBreath: boolean; attempts: number; artisan: number; cost: number };
type Runtime = { failures: number; artisan: number; attempts: SimulationRow[]; cost: number; materials: Record<string, { amount: number; name: string; icon: string | null }> };

const STORAGE_KEY = 'lotsgo:honing-simulation-records';
const SPEED_INTERVALS: Record<SimulationSpeed, number> = { fast: 100, normal: 400, slow: 800 };
const emptyOwned = {} as OwnedMaterials;

function Gold({ value }: { value: number }) {
    return <span className="inline-flex items-center gap-1 font-bold tabular-nums"><img src="/icons/gold.png" alt="골드" className="h-4 w-4"/>{Math.ceil(value).toLocaleString('ko-KR')}</span>;
}

function MaterialIcon({ icon }: { icon: string | null }) {
    return icon ? <img src={icon} alt="" className="h-6 w-6 rounded object-cover"/> : <span className="h-6 w-6 rounded bg-default-100 dark:bg-white/10"/>;
}

function getBookKey(tier: HoningTier, part: HoningPart, level: number): OwnedMaterialKey | null {
    const ranges = tier === '4티어' ? [[11, 14], [15, 18], [19, 20]] : [[12, 15], [16, 19]];
    const range = ranges.find(([from, to]) => level >= from && level <= to);
    if (!range) return null;
    return `${part === '무기' ? 'metallurgy' : 'tailoring'}-${tier === '4티어' ? 'upheaval' : 'thrill'}-${range[0]}-${range[1]}` as OwnedMaterialKey;
}

function modeLabel(mode: SimulationMode) { return mode === 'optimal' ? '최적 재련' : '직접 설정'; }

function SimulationExtras({ row }: { row: SimulationRow }) {
    const extras = row.materials.filter((item) => item.key.includes('breath') || item.key.includes('metallurgy') || item.key.includes('tailoring'));
    if (extras.length === 0) return <span className="text-default-400">없음</span>;
    return <span className="flex items-center gap-2 whitespace-nowrap">{extras.map((item) => <span key={item.key} className="inline-flex items-center gap-1"><MaterialIcon icon={item.icon}/><span>× {item.amount.toLocaleString('ko-KR')}</span></span>)}</span>;
}

export default function HoningSimulationCard({ priceData }: { priceData: HoningMaterialPriceData }) {
    const [tier, setTier] = useState<HoningTier>('4티어');
    const [part, setPart] = useState<HoningPart>('무기');
    const [level, setLevel] = useState('11');
    const [mode, setMode] = useState<SimulationMode>('optimal');
    const [useBook, setUseBook] = useState(false);
    const [useBreath, setUseBreath] = useState(false);
    const [speed, setSpeed] = useState<SimulationSpeed>('normal');
    const [running, setRunning] = useState(false);
    const [completed, setCompleted] = useState(false);
    const [rows, setRows] = useState<SimulationRow[]>([]);
    const [artisan, setArtisan] = useState(0);
    const [spentGold, setSpentGold] = useState(0);
    const [records, setRecords] = useState<SimulationRecord[]>([]);
    const runtime = useRef<Runtime>({ failures: 0, artisan: 0, attempts: [], cost: 0, materials: {} });
    const leftColumnRef = useRef<HTMLDivElement>(null);
    const [leftColumnHeight, setLeftColumnHeight] = useState<number | null>(null);
    const rate = findHoningRate(tier, part, Number(level));
    const bookKey = getBookKey(tier, part, Number(level));
    const bookIcon = bookKey ? priceData.items[bookKey as keyof typeof priceData.items]?.icon ?? null : null;
    const breathIcon = priceData.items[part === '무기' ? 'lava-breath' : 'glacier-breath']?.icon ?? null;
    const input = useMemo<HoningCalculationInput>(() => ({ tier, part, level: Number(level), mode: 'optimal', owned: emptyOwned, prices: priceData }), [tier, part, level, priceData]);
    const optimalCalculation = useMemo(() => mode === 'optimal' ? calculateHoning(input) : null, [input, mode]);

    const resetProgress = () => {
        runtime.current = { failures: 0, artisan: 0, attempts: [], cost: 0, materials: {} };
        setRows([]); setArtisan(0); setSpentGold(0); setCompleted(false); setRunning(false);
    };

    const executeAttempt = useCallback(() => {
        const state = runtime.current;
        const optimalRow = mode === 'optimal' ? optimalCalculation?.attempts[state.failures] : null;
        const options: HoningSimulationOptions = { attempt: state.attempts.length + 1, failures: state.failures, artisan: state.artisan, useBook: mode === 'custom' && useBook, useBreath: mode === 'custom' && useBreath };
        const attempt = optimalRow ?? getHoningAttempt(input, options);
        if (!attempt) return false;
        const success = attempt.finalChance >= 100 || Math.random() * 100 < attempt.finalChance;
        const row = { ...attempt, success };
        const nextAttempts = [...state.attempts, row];
        const nextCost = state.cost + attempt.cost;
        for (const material of attempt.materials) {
            const current = state.materials[material.key] ?? { amount: 0, name: material.name, icon: material.icon };
            state.materials[material.key] = { ...current, amount: current.amount + material.amount };
        }
        state.attempts = nextAttempts; state.cost = nextCost; state.artisan = attempt.artisanAfter;
        setRows(nextAttempts); setSpentGold(nextCost); setArtisan(attempt.artisanAfter);
        if (success) { setCompleted(true); setRunning(false); }
        else { state.failures += 1; }
        return success;
    }, [input, mode, optimalCalculation, useBook, useBreath]);

    useEffect(() => {
        try {
            const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
            if (Array.isArray(stored)) setRecords(stored);
        } catch { setRecords([]); }
    }, []);

    useEffect(() => {
        const element = leftColumnRef.current;
        if (!element) return undefined;
        const updateHeight = () => setLeftColumnHeight(element.getBoundingClientRect().height);
        updateHeight();
        const observer = new ResizeObserver(updateHeight);
        observer.observe(element);
        return () => observer.disconnect();
    }, [records.length, rows.length]);

    useEffect(() => {
        if (!running) return undefined;
        const timer = window.setInterval(executeAttempt, SPEED_INTERVALS[speed]);
        return () => window.clearInterval(timer);
    }, [executeAttempt, running, speed]);

    const start = () => {
        resetProgress(); setRunning(true);
    };

    const stop = () => setRunning(false);

    const handleTierChange = (keys: Iterable<unknown>) => { const value = String(Array.from(keys)[0]) as HoningTier; if (value !== tier) { setTier(value); resetProgress(); } };
    const handlePartChange = (keys: Iterable<unknown>) => { const value = String(Array.from(keys)[0]) as HoningPart; if (value !== part) { setPart(value); resetProgress(); } };
    const handleLevelChange = (keys: Iterable<unknown>) => { const value = String(Array.from(keys)[0]); if (value !== level) { setLevel(value); resetProgress(); } };

    const saveRecord = () => {
        if (!completed || rows.length === 0) return;
        const record: SimulationRecord = { id: `${Date.now()}`, createdAt: Date.now(), tier, part, level: Number(level), mode, useBook, useBreath, attempts: rows.length, artisan: rows[rows.length - 1].artisanAfter, cost: spentGold };
        const next = [record, ...records]; setRecords(next); localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    };

    const reset = () => {
        runtime.current = { failures: 0, artisan: 0, attempts: [], cost: 0, materials: {} };
        setRows([]); setArtisan(0); setSpentGold(0); setCompleted(false); setRunning(false); setRecords([]); localStorage.removeItem(STORAGE_KEY);
    };

    const materialRows = Object.values(runtime.current.materials);
    const totalRecordedCost = records.reduce((sum, item) => sum + item.cost, 0);
    const average = records.length ? { attempts: records.reduce((sum, item) => sum + item.attempts, 0) / records.length, artisan: records.reduce((sum, item) => sum + item.artisan, 0) / records.length, cost: totalRecordedCost / records.length } : null;

    return <Card className="mt-4 border border-default-200/80 bg-content1 shadow-sm dark:border-white/10 dark:bg-[#18181b]">
        <CardHeader className="flex-col items-start gap-1 border-b border-default-100 px-4 py-4 dark:border-white/[0.06] sm:px-5"><h2 className="text-lg font-bold">재련 시뮬레이션</h2><p className="text-xs text-default-500">거래소 시세를 기준으로 재련 성공까지의 과정을 시뮬레이션합니다.</p></CardHeader>
        <CardBody className="grid items-stretch gap-4 p-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] sm:p-5">
            <div ref={leftColumnRef} className="min-w-0 space-y-4">
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3"><Select label="장비 등급" selectedKeys={new Set([tier])} onSelectionChange={handleTierChange}><SelectItem key="4티어">4티어</SelectItem><SelectItem key="세르카">세르카</SelectItem></Select><Select label="장비 종류" selectedKeys={new Set([part])} onSelectionChange={handlePartChange}><SelectItem key="무기">무기</SelectItem><SelectItem key="방어구">방어구</SelectItem></Select><Select label="강화 단계" selectionMode="single" selectedKeys={[level]} renderValue={() => `${level}강`} onSelectionChange={handleLevelChange}>{Array.from({ length: 15 }, (_, index) => String(index + 11)).map((item) => <SelectItem key={item}>{item}강</SelectItem>)}</Select></div>
                {rate ? <div className="rounded-xl bg-default-50 p-3 dark:bg-white/[0.04]"><div className="mb-2 flex items-center justify-between"><span className="text-xs font-bold text-default-500">1회 재련 필요 재료</span><span className="text-xs text-default-500">기본 확률 {rate.successRate}%</span></div><div className="flex flex-wrap gap-2">{rate ? [{ name: part === '무기' ? (tier === '세르카' ? '운명의 파괴석 결정' : '운명의 파괴석') : (tier === '세르카' ? '운명의 수호석 결정' : '운명의 수호석'), amount: rate.stone, key: part === '무기' ? (tier === '세르카' ? 'destiny-destruction-crystal' : 'destiny-destruction-stone') : (tier === '세르카' ? 'destiny-guardian-crystal' : 'destiny-guardian-stone') }, { name: tier === '세르카' ? '위대한 운명의 돌파석' : '운명의 돌파석', amount: rate.leapstone, key: tier === '세르카' ? 'great-destiny-leapstone' : 'destiny-leapstone' }, { name: tier === '세르카' ? '상급 아비도스 융화 재료' : '아비도스 융화 재료', amount: rate.fusion, key: tier === '세르카' ? 'superior-abidos-fusion-material' : 'abidos-fusion-material' }, { name: '운명의 파편', amount: rate.shard, key: 'destiny-shard' }].map((item) => { const price = item.key === 'destiny-shard' ? priceData.items['destiny-shard-pouch-large'] : priceData.items[item.key as keyof typeof priceData.items]; const unit = item.key === 'destiny-shard' ? price?.unitPrice ?? 0 : price?.unitPrice ?? price?.price ?? 0; return <div key={item.key} className="flex items-center gap-1.5 rounded-lg bg-default-100/80 px-2 py-1.5 text-xs dark:bg-white/[0.06]"><MaterialIcon icon={price?.icon ?? null}/><span>{item.name} × {item.amount.toLocaleString('ko-KR')}</span><span className="text-default-500">·</span><Gold value={item.amount * unit}/></div>; }) : null}<div className="flex items-center gap-1.5 rounded-lg bg-default-100/80 px-2 py-1.5 text-xs dark:bg-white/[0.06]"><img src="/icons/gold.png" alt="골드" className="h-6 w-6 rounded object-cover"/><span>{rate.gold.toLocaleString('ko-KR')}</span></div></div></div> : null}
                <Tabs fullWidth selectedKey={mode} onSelectionChange={(key) => setMode(String(key) as SimulationMode)}><Tab key="optimal" title="최적 재련"/><Tab key="custom" title="직접 설정"/></Tabs>
                <div className="flex flex-col gap-3 rounded-xl border border-default-200/80 p-3 dark:border-white/10">{bookKey ? <Checkbox isSelected={mode === 'optimal' || useBook} isDisabled={mode === 'optimal'} onValueChange={setUseBook}><span className="inline-flex items-center gap-2"><MaterialIcon icon={bookIcon}/>야금술 / 재봉술</span></Checkbox> : null}<Checkbox isSelected={mode === 'optimal' || useBreath} isDisabled={mode === 'optimal'} onValueChange={setUseBreath}><span className="inline-flex items-center gap-2"><MaterialIcon icon={breathIcon}/>숨결</span></Checkbox><p className="text-[11px] text-default-500">최적 재련은 기존 최적화 결과의 트라이별 투입 전략을 사용합니다.</p></div>
                <Select label="재련 속도" selectedKeys={new Set([speed])} isDisabled={running} onSelectionChange={(keys) => setSpeed(String(Array.from(keys)[0]) as SimulationSpeed)}><SelectItem key="fast">빠르게</SelectItem><SelectItem key="normal">보통</SelectItem><SelectItem key="slow">느리게</SelectItem></Select>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2"><Button color="secondary" radius="lg" className="w-full font-semibold" isDisabled={running || completed || !rate} onPress={executeAttempt}>1회 재련</Button><Button color={running ? 'danger' : 'primary'} radius="lg" className="w-full font-semibold" isDisabled={!running && !rate} onPress={running ? stop : start}>{running ? '자동 재련 중단' : '자동 재련'}</Button></div>
                <div className="rounded-xl bg-default-50 p-3 dark:bg-white/[0.04]"><div className="mb-1 flex items-center justify-between text-xs"><span>장인의 기운</span><span className="font-semibold tabular-nums">{artisan.toFixed(2)}%</span></div><Progress aria-label="장인의 기운" value={artisan} color={artisan >= 100 ? 'success' : 'primary'}/><div className="mt-3 flex items-center justify-between text-xs"><span>누적 골드</span><Gold value={spentGold}/></div></div>
                <div><h3 className="mb-2 text-xs font-bold text-default-500">사용 재료</h3><div className="flex flex-wrap gap-2">{materialRows.length ? materialRows.map((item) => <div key={item.name} className="flex items-center gap-1.5 rounded-lg bg-default-100/80 px-2 py-1.5 text-xs dark:bg-white/[0.06]"><MaterialIcon icon={item.icon}/><span>{item.name} × {item.amount.toLocaleString('ko-KR')}</span></div>) : <span className="text-xs text-default-400">재련을 시작하면 사용량이 표시됩니다.</span>}</div></div>
                <div className="flex gap-2"><Button className="flex-1" variant="flat" isDisabled={!completed} onPress={saveRecord}>기록하기</Button><Button className="flex-1" variant="flat" color="danger" onPress={reset}>초기화</Button></div>
                {average ? <div className="grid grid-cols-2 gap-2 rounded-xl bg-default-50 p-3 text-center text-xs dark:bg-white/[0.04] sm:grid-cols-4"><div className="min-w-0"><p className="truncate text-default-500">평균 트라이</p><p className="mt-1 font-bold">{average.attempts.toFixed(2)}</p></div><div className="min-w-0"><p className="truncate text-default-500">평균 장인 기운</p><p className="mt-1 font-bold">{average.artisan.toFixed(2)}%</p></div><div className="min-w-0"><p className="truncate text-default-500">평균 비용</p><p className="mt-1"><Gold value={average.cost}/></p></div><div className="min-w-0"><p className="truncate text-default-500">누적 골드</p><p className="mt-1"><Gold value={totalRecordedCost}/></p></div></div> : null}
                {records.length ? <><div className="max-h-[300px] overflow-y-auto rounded-xl border border-default-200/80 dark:border-white/10"><table className="w-full text-left text-xs"><thead className="sticky top-0 bg-default-100 dark:bg-[#27272a]"><tr><th className="px-2 py-2">조건</th><th className="px-2 py-2">트라이</th><th className="px-2 py-2">장인 기운</th><th className="px-2 py-2">비용</th></tr></thead><tbody>{records.map((item) => <tr key={item.id} className="border-t border-default-100 dark:border-white/[0.06]"><td className="px-2 py-2">{item.tier} {item.part} {item.level}강<br/>{modeLabel(item.mode)}</td><td className="px-2 py-2">{item.attempts}회</td><td className="px-2 py-2">{item.artisan.toFixed(2)}%</td><td className="px-2 py-2"><Gold value={item.cost}/></td></tr>)}</tbody></table></div><p className="mt-1 text-right text-xs text-default-500">총 {records.length}개 기록</p></> : null}
            </div>
            <div style={leftColumnHeight ? { height: `${leftColumnHeight}px` } : undefined} className="flex min-h-0 min-w-0 flex-col overflow-hidden rounded-xl border border-default-200/80 dark:border-white/10"><div className="flex shrink-0 items-center justify-between border-b border-default-100 px-3 py-3 dark:border-white/[0.06]"><h3 className="text-sm font-bold">재련 진행 결과</h3><span className="text-xs text-default-500">{running ? `${SPEED_INTERVALS[speed] / 1000}초마다 진행 중` : completed ? '재련 성공' : rows.length ? '재련 중단' : '대기 중'}</span></div><div className="min-h-0 flex-1 overflow-y-auto"><table className="w-full min-w-[650px] text-left text-xs"><thead className="sticky top-0 z-10 bg-default-100 dark:bg-[#27272a]"><tr><th className="px-3 py-2">트라이</th><th className="px-3 py-2">강화 확률</th><th className="px-3 py-2">장인의 기운</th><th className="px-3 py-2">추가 재료</th><th className="px-3 py-2">트라이 비용</th><th className="px-3 py-2">결과</th></tr></thead><tbody>{[...rows].reverse().map((row) => <tr key={row.attempt} className={`border-t border-default-100 dark:border-white/[0.06] ${row.success ? 'bg-success-50/70 dark:bg-success-500/10' : ''}`}><td className="px-3 py-2">{row.attempt}트</td><td className="px-3 py-2">{row.finalChance.toFixed(2)}%</td><td className="px-3 py-2">{row.artisanBefore.toFixed(2)}% → {row.artisanAfter.toFixed(2)}%</td><td className="px-3 py-2"><SimulationExtras row={row}/></td><td className="px-3 py-2"><Gold value={row.cost}/></td><td className={`px-3 py-2 font-semibold ${row.success ? 'text-success-600 dark:text-success-400' : 'text-default-500'}`}>{row.success ? '성공' : '실패'}</td></tr>)}</tbody></table>{rows.length === 0 ? <div className="p-10 text-center text-sm text-default-400">재련 시작 버튼을 누르면 진행 결과가 표시됩니다.</div> : null}</div></div>
        </CardBody>
    </Card>;
}
