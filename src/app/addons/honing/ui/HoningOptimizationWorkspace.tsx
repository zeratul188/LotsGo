'use client';

import { Input, Select, SelectItem, Tab, Tabs } from '@heroui/react';
import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { HONING_MATERIALS, type HoningMaterialPriceData } from '../model/types';
import { calculateHoning } from '../lib/honingCalculator';
import type { HoningMode, OwnedMaterialKey, OwnedMaterials } from '../model/calculatorTypes';
import { findHoningRate, type HoningPart, type HoningTier } from '../data/honingRates';

const ownedItems = [
    { key: 'destiny-shard', name: '운명의 파편', group: '기본 재료' },
    ...HONING_MATERIALS.filter((item) => item.key !== 'destiny-shard-pouch-large').map((item) => ({ key: item.key, name: item.name, group: item.group }))
] as { key: OwnedMaterialKey; name: string; group: string }[];

const initialOwned = Object.fromEntries(ownedItems.map(({ key }) => [key, 0])) as OwnedMaterials;

function Gold({ value }: { value: number }) {
    return <span className="inline-flex items-center gap-1 font-bold tabular-nums"><img src="/icons/gold.png" alt="골드" className="h-4 w-4"/>{Math.ceil(value).toLocaleString('ko-KR')}</span>;
}

function MaterialIcon({ icon }: { icon: string | null }) {
    return icon ? <img src={icon} alt="" className="h-7 w-7 rounded-md object-cover"/> : <span className="h-7 w-7 rounded-md bg-default-100 dark:bg-white/10"/>;
}

function InputMaterialIcon({ icon }: { icon: string | null }) {
    return icon ? <img src={icon} alt="" className="h-5 w-5 rounded object-cover"/> : <span className="h-5 w-5 rounded bg-default-100 dark:bg-white/10"/>;
}

function materialUnitPrice(key: OwnedMaterialKey, prices: HoningMaterialPriceData) {
    return key === 'destiny-shard' ? prices.items['destiny-shard-pouch-large']?.unitPrice ?? 0 : prices.items[key]?.unitPrice ?? prices.items[key]?.price ?? 0;
}

function GoldMaterialCard({ value }: { value: number }) {
    return <div className="flex items-center gap-1.5 rounded-lg bg-default-100/80 px-2 py-1.5 text-xs dark:bg-white/[0.06]"><img src="/icons/gold.png" alt="골드" className="h-7 w-7 rounded-md object-cover"/><span className="font-semibold tabular-nums">{Math.ceil(value).toLocaleString('ko-KR')}</span></div>;
}

function MaterialList({ items, title, prices, extra }: { items: { key: OwnedMaterialKey; amount: number; paid?: number; icon: string | null; name: string }[]; title: string; prices: HoningMaterialPriceData; extra?: ReactNode }) {
    return <div className="min-w-0"><h4 className="mb-2 text-xs font-bold text-default-500">{title}</h4><div className="flex flex-wrap gap-2">{items.map((item) => <div key={item.key} className="flex items-center gap-1.5 rounded-lg bg-default-100/80 px-2 py-1.5 text-xs dark:bg-white/[0.06]"><MaterialIcon icon={item.icon}/><span className="whitespace-nowrap">{item.name} × {item.amount.toLocaleString('ko-KR', { maximumFractionDigits: 1 })}</span><span className="text-default-500">·</span><Gold value={item.amount * materialUnitPrice(item.key, prices)}/></div>)}{extra}</div>{items.length === 0 ? <span className="text-xs text-default-400">표시할 재료가 없습니다.</span> : null}</div>;
}

function AttemptExtras({ attempt, bookKey, breathKey }: { attempt: { book: number; breath: number; materials: { key: OwnedMaterialKey; amount: number; icon: string | null }[] }; bookKey: OwnedMaterialKey | null; breathKey: OwnedMaterialKey }) {
    const extras = attempt.materials.filter((item) => item.key === bookKey || item.key === breathKey);
    if (extras.length === 0) return <span className="text-default-400">없음</span>;
    return <span className="flex items-center gap-2 whitespace-nowrap">{extras.map((item) => <span key={item.key} className="inline-flex items-center gap-1"><MaterialIcon icon={item.icon}/><span>× {item.amount.toLocaleString('ko-KR')}</span></span>)}</span>;
}

function modeLabel(mode: HoningMode) { return mode === 'optimal' ? '최적 재련' : mode === 'no-breath' ? '노숨 재련' : '풀숨 재련'; }

export default function HoningOptimizationWorkspace({ priceData }: { priceData: HoningMaterialPriceData }) {
    const [tier, setTier] = useState<HoningTier>('4티어');
    const [part, setPart] = useState<HoningPart>('무기');
    const [level, setLevel] = useState('11');
    const [mode, setMode] = useState<HoningMode>('optimal');
    const [owned, setOwned] = useState<OwnedMaterials>(initialOwned);
    const rate = findHoningRate(tier, part, Number(level));
    const calculation = useMemo(() => rate ? calculateHoning({ tier, part, level: Number(level), mode, owned, prices: priceData }) : null, [tier, part, level, mode, owned, priceData, rate]);

    const updateOwned = (key: OwnedMaterialKey, value: string) => setOwned((current) => ({ ...current, [key]: Math.max(0, Number(value) || 0) }));
    const grouped = [...new Set(ownedItems.map((item) => item.group))];
    const required = rate ? [
        { key: part === '무기' ? (tier === '세르카' ? 'destiny-destruction-crystal' : 'destiny-destruction-stone') : (tier === '세르카' ? 'destiny-guardian-crystal' : 'destiny-guardian-stone'), amount: rate.stone },
        { key: tier === '세르카' ? 'great-destiny-leapstone' : 'destiny-leapstone', amount: rate.leapstone },
        { key: tier === '세르카' ? 'superior-abidos-fusion-material' : 'abidos-fusion-material', amount: rate.fusion },
        { key: 'destiny-shard', amount: rate.shard }
    ].map((item) => { const source = ownedItems.find((candidate) => candidate.key === item.key); const price = item.key === 'destiny-shard' ? priceData.items['destiny-shard-pouch-large'] : priceData.items[item.key as keyof typeof priceData.items]; return { ...item, name: source?.name ?? '', icon: item.key === 'destiny-shard' ? priceData.items['destiny-shard-pouch-large']?.icon ?? null : price?.icon ?? null }; }) : [];

    return <section className="mt-4 grid items-stretch gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
        <div className="h-full min-h-0 self-stretch overflow-y-auto rounded-2xl border border-default-200/80 bg-content1 p-4 shadow-sm dark:border-white/10 dark:bg-[#18181b] sm:p-5">
            <div className="mb-4"><h2 className="text-lg font-bold">보유 귀속 재료</h2><p className="mt-1 text-xs text-default-500">보유한 귀속 재료는 계산에서 무료로 먼저 사용합니다.</p></div>
            <div className="space-y-5">{grouped.map((group) => <section key={group}><h3 className="mb-2 border-b border-default-100 pb-2 text-xs font-bold text-primary dark:border-white/[0.08]">{group}</h3><div className="grid grid-cols-1 gap-2">{ownedItems.filter((item) => item.group === group).map((item) => { const icon = item.key === 'destiny-shard' ? priceData.items['destiny-shard-pouch-large']?.icon ?? null : priceData.items[item.key]?.icon ?? null; return <Input key={item.key} size="sm" type="number" min="0" label={item.name} value={String(owned[item.key] ?? 0)} onValueChange={(value) => updateOwned(item.key, value)} startContent={<InputMaterialIcon icon={icon}/>} endContent={<span className="text-xs text-default-400">개</span>}/>; })}</div></section>)}</div>
        </div>
        <div className="min-w-0 rounded-2xl border border-default-200/80 bg-content1 p-4 shadow-sm dark:border-white/10 dark:bg-[#18181b] sm:p-5">
            <div className="mb-4"><h2 className="text-lg font-bold">재련 최적화</h2><p className="mt-1 text-xs text-default-500">장비 조건과 보유 재료를 기준으로 기대 비용을 계산합니다.</p></div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                <Select label="장비 등급" selectedKeys={new Set([tier])} onSelectionChange={(keys) => setTier(String(Array.from(keys)[0]) as HoningTier)}><SelectItem key="4티어">4티어</SelectItem><SelectItem key="세르카">세르카</SelectItem></Select>
                <Select label="장비 종류" selectedKeys={new Set([part])} onSelectionChange={(keys) => setPart(String(Array.from(keys)[0]) as HoningPart)}><SelectItem key="무기">무기</SelectItem><SelectItem key="방어구">방어구</SelectItem></Select>
                <Select label="강화 단계" selectionMode="single" selectedKeys={[level]} renderValue={() => `${level}강`} onSelectionChange={(keys) => setLevel(String(Array.from(keys)[0]))}>{Array.from({ length: 15 }, (_, index) => String(index + 11)).map((item) => <SelectItem key={item}>{item}강</SelectItem>)}</Select>
            </div>
            {rate ? <div className="mt-4 rounded-xl bg-default-50 p-3 dark:bg-white/[0.04]"><div className="mb-2 flex items-center justify-between"><span className="text-xs font-bold text-default-500">1회 재련 필요 재료</span><span className="text-xs text-default-500">기본 확률 {rate.successRate}%</span></div><MaterialList title="" items={required as { key: OwnedMaterialKey; amount: number; icon: string | null; name: string }[]} prices={priceData} extra={<GoldMaterialCard value={rate.gold}/>}/></div> : null}
            <Tabs className="mt-5" fullWidth selectedKey={mode} onSelectionChange={(key) => setMode(String(key) as HoningMode)}><Tab key="optimal" title="최적 재련"/><Tab key="no-breath" title="노숨 재련"/><Tab key="full-breath" title="풀숨 재련"/></Tabs>
            {calculation ? <>
                <div className="mt-4 grid gap-3 sm:grid-cols-2"><div className="rounded-xl border border-default-200/80 p-3 dark:border-white/10"><p className="text-xs text-default-500">평균 ({modeLabel(mode)})</p><p className="mt-1 text-lg font-bold"><Gold value={calculation.averageCost}/></p><p className="mt-1 text-xs text-default-500">평균 {calculation.averageAttempts.toFixed(2)}회</p></div><div className="rounded-xl border border-danger-200/70 p-3 dark:border-danger-500/20"><p className="text-xs text-default-500">장인의 기운 100% 장기백</p><p className="mt-1 text-lg font-bold"><Gold value={calculation.pityCost}/></p><p className="mt-1 text-xs text-default-500">{calculation.pityAttempts.length}회 시도</p></div></div>
                <div className="mt-4 space-y-4"><MaterialList title="평균 소모 재료" items={calculation.averageMaterials} prices={priceData}/><MaterialList title="장기백 소모 재료" items={calculation.pityMaterials} prices={priceData}/></div>
                <div className="mt-5"><div className="mb-2 flex items-center justify-between"><h3 className="text-sm font-bold">트라이별 계산</h3><span className="text-xs text-default-500">실패 경로 · 최대 500px</span></div><div className="max-h-[500px] overflow-y-auto rounded-xl border border-default-200/80 dark:border-white/10"><table className="w-full min-w-[650px] text-left text-xs"><thead className="sticky top-0 z-10 bg-default-100 dark:bg-[#27272a]"><tr><th className="px-3 py-2">트라이</th><th className="px-3 py-2">강화 확률</th><th className="px-3 py-2">장인의 기운</th><th className="px-3 py-2">추가 재료</th><th className="px-3 py-2">트라이 비용</th></tr></thead><tbody>{calculation.attempts.map((attempt) => <tr key={attempt.attempt} className="border-t border-default-100 dark:border-white/[0.06]"><td className="px-3 py-2">{attempt.attempt}트</td><td className="px-3 py-2">{attempt.finalChance.toFixed(2)}%</td><td className="px-3 py-2">{attempt.artisanBefore.toFixed(2)}% → {attempt.artisanAfter.toFixed(2)}%</td><td className="px-3 py-2"><AttemptExtras attempt={attempt} bookKey={calculation.bookKey} breathKey={calculation.breathKey}/></td><td className="px-3 py-2"><Gold value={attempt.cost}/></td></tr>)}</tbody></table></div></div>
            </> : <div className="mt-6 rounded-xl bg-default-50 p-8 text-center text-sm text-default-500 dark:bg-white/[0.04]">해당 강화 단계의 계산 데이터를 찾을 수 없습니다.</div>}
        </div>
    </section>;
}
