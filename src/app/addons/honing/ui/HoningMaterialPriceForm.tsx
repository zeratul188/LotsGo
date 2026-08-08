'use client';

import { Button, Link, addToast } from '@heroui/react';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/app/store/store';
import { useLoadingTask } from '@/app/components/loading/LoadingProgress';
import clsx from 'clsx';
import { HONING_MATERIALS, HoningMaterialPrice, HoningMaterialPriceData, normalizeHoningMaterialPriceData } from '../model/types';

const PERSONAL_CACHE_MAX_AGE = 2 * 60 * 60 * 1000;
const REFRESH_COOLDOWN = 10 * 1000;
const PERSONAL_CACHE_KEY = 'lotsgo:honing-material-prices';
const REFRESH_COOLDOWN_KEY = 'lotsgo:honing-material-prices:refresh-until';

function formatPrice(price: number | null, decimals = 0) {
    return price === null ? '가격 없음' : price.toLocaleString('ko-KR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

function formatUpdatedAt(updatedAt: number | null) {
    if (!updatedAt) return '아직 갱신된 데이터가 없습니다.';
    return new Intl.DateTimeFormat('ko-KR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(updatedAt));
}

function getCacheKey(userId: string) {
    return `${PERSONAL_CACHE_KEY}:${userId}`;
}

function GoldPrice({ price, decimals = 0, highlight = false }: { price: number | null; decimals?: number; highlight?: boolean }) {
    return (
        <div className={clsx('flex min-w-0 items-center gap-1.5 whitespace-nowrap', highlight ? 'font-bold text-foreground dark:text-white' : 'font-semibold')}>
            {price !== null ? <img src="/icons/gold.png" alt="골드" className="h-[1em] w-[1em] shrink-0"/> : null}
            <span className="tabular-nums">{formatPrice(price, decimals)}</span>
        </div>
    );
}

function MaterialLabel({ material, value }: { material: typeof HONING_MATERIALS[number]; value: HoningMaterialPrice | undefined }) {
    return (
        <div className="flex min-w-0 flex-1 items-center gap-2">
            <div className="h-7 w-7 shrink-0 overflow-hidden rounded-md border border-default-200 bg-default-100 dark:border-white/10 dark:bg-white/[0.06]">
                {value?.icon ? <img src={value.icon} alt="" className="h-full w-full object-cover"/> : null}
            </div>
            <span className="min-w-0 truncate whitespace-nowrap text-[13px] font-semibold text-foreground" title={material.name}>{material.name}</span>
        </div>
    );
}

function PriceDetails({ material, value }: { material: typeof HONING_MATERIALS[number]; value: HoningMaterialPrice | undefined }) {
    if (!value || value.price === null) return <span className="text-xs text-default-400">거래 가능한 가격 없음</span>;
    const showsUnitPrice = material.divisor === 3000 || (value.bundleCount ?? 1) > 1;
    if (!showsUnitPrice) return null;
    const bundleLabel = material.divisor === 3000
        ? '파편 3,000개'
        : value.bundleCount && value.bundleCount > 1 ? `${value.bundleCount.toLocaleString()}개 묶음` : null;
    return (
        <div className="flex min-w-0 items-center justify-end gap-1 whitespace-nowrap text-[10px] text-default-500">
            {bundleLabel ? <span>{bundleLabel}</span> : null}
            <span aria-hidden="true">·</span>
            <span>{material.unitLabel}</span>
            <GoldPrice price={value.unitPrice} decimals={2}/>
        </div>
    );
}

function MaterialPriceGrid({ data }: { data: HoningMaterialPriceData }) {
    const groups = [...new Set(HONING_MATERIALS.map((material) => material.group))];
    return (
        <div className="space-y-5 p-4 sm:p-5">
            {groups.map((group) => (
                <section key={group} aria-labelledby={`material-group-${group}`}>
                    <div className="mb-2 flex items-center gap-2">
                        <h2 id={`material-group-${group}`} className="shrink-0 text-xs font-bold text-primary">{group}</h2>
                        <div className="h-px w-full bg-default-100 dark:bg-white/[0.06]"/>
                    </div>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                        {HONING_MATERIALS.filter((material) => material.group === group).map((material) => {
                            const value = data.items[material.key];
                            return (
                                <article key={material.key} className="min-w-0 rounded-xl border border-default-200/80 bg-default-50/50 p-2.5 transition-colors hover:border-primary/30 hover:bg-primary-50/30 dark:border-white/[0.08] dark:bg-white/[0.025] dark:hover:bg-primary-500/[0.06]">
                                    <div className="flex min-w-0 items-center gap-2">
                                        <MaterialLabel material={material} value={value}/>
                                        <div className="flex shrink-0 flex-col items-end gap-0.5">
                                            <GoldPrice price={value.price} highlight/>
                                            <PriceDetails material={material} value={value}/>
                                        </div>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                </section>
            ))}
        </div>
    );
}

export default function HoningMaterialPriceForm() {
    const router = useRouter();
    const isCheckedToken = useSelector((state: RootState) => state.login.isCheckedToken);
    const isLogined = useSelector((state: RootState) => state.login.isLogined);
    const userId = useSelector((state: RootState) => state.login.user.id);
    const hasApiKey = Boolean(useSelector((state: RootState) => state.login.user.apiKey));
    const [data, setData] = useState<HoningMaterialPriceData | null>(null);
    const [dataSource, setDataSource] = useState<'shared' | 'personal'>('shared');
    const [isLoadingPrices, setIsLoadingPrices] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [cooldownUntil, setCooldownUntil] = useState(0);
    const [now, setNow] = useState(() => Date.now());

    useLoadingTask('재련 재료 시세를 불러오는 중이에요', isLoadingPrices || isRefreshing);

    useEffect(() => {
        let cancelled = false;
        const loadPrices = async () => {
            setIsLoadingPrices(true);
            if (userId) {
                const raw = localStorage.getItem(getCacheKey(userId));
                if (raw) {
                    try {
                        const cached = JSON.parse(raw) as { data?: unknown; expiresAt?: number };
                        if (typeof cached.expiresAt === 'number' && cached.expiresAt > Date.now()) {
                            const normalized = normalizeHoningMaterialPriceData(cached.data);
                            if (normalized) {
                                if (!cancelled) {
                                    setData(normalized);
                                    setDataSource('personal');
                                    setIsLoadingPrices(false);
                                }
                                return;
                            }
                        }
                    } catch { /* 손상된 캐시는 삭제하고 공용 시세를 불러옵니다. */ }
                    localStorage.removeItem(getCacheKey(userId));
                }
            }
            try {
                const response = await fetch('/api/addons/honing/refresh', { cache: 'no-store' });
                const body = await response.json().catch(() => ({}));
                const normalized = normalizeHoningMaterialPriceData(body.data);
                if (!response.ok || !normalized) throw new Error('공용 재련 재료 시세를 불러오지 못했습니다.');
                if (!cancelled) { setData(normalized); setDataSource('shared'); }
            } catch (error) { if (!cancelled) setData(null); console.error('Failed to load shared honing material prices', error); }
            finally { if (!cancelled) setIsLoadingPrices(false); }
        };
        void loadPrices();
        return () => { cancelled = true; };
    }, [userId]);

    useEffect(() => {
        const updateCooldown = () => {
            const current = Date.now();
            const stored = Number(localStorage.getItem(REFRESH_COOLDOWN_KEY));
            setNow(current);
            setCooldownUntil(Number.isFinite(stored) && stored > current ? stored : 0);
            if (!Number.isFinite(stored) || stored <= current) localStorage.removeItem(REFRESH_COOLDOWN_KEY);
        };
        updateCooldown();
        const interval = window.setInterval(updateCooldown, 1000);
        return () => window.clearInterval(interval);
    }, []);

    const cooldownSeconds = Math.max(0, Math.ceil((cooldownUntil - now) / 1000));
    const actionPath = '/addons/honing';
    const canRefresh = isCheckedToken && isLogined && hasApiKey && !isRefreshing && cooldownSeconds === 0;
    const sourceLabel = dataSource === 'personal' ? '내 API 키로 갱신한 시세' : '공용 시세';
    const updatedLabel = useMemo(() => formatUpdatedAt(data?.updatedAt ?? null), [data?.updatedAt]);

    const refreshPrices = async () => {
        if (!isCheckedToken || !isLogined) { router.push(`/login?returnTo=${encodeURIComponent(actionPath)}`); return; }
        if (!hasApiKey) { router.push(`/setting?tab=apikey&returnTo=${encodeURIComponent(actionPath)}`); return; }
        if (!canRefresh) return;
        const nextCooldown = Date.now() + REFRESH_COOLDOWN;
        setCooldownUntil(nextCooldown); setNow(Date.now()); localStorage.setItem(REFRESH_COOLDOWN_KEY, String(nextCooldown)); setIsRefreshing(true);
        try {
            const token = sessionStorage.getItem('token');
            const response = await fetch('/api/addons/honing/refresh', { method: 'POST', headers: token ? { authorization: `Bearer ${token}` } : undefined });
            const body = await response.json().catch(() => ({}));
            if (!response.ok) {
                if (body.code === 'UNAUTHORIZED') { router.push(`/login?returnTo=${encodeURIComponent(actionPath)}`); return; }
                if (body.code === 'API_KEY_REQUIRED') { router.push(`/setting?tab=apikey&returnTo=${encodeURIComponent(actionPath)}`); return; }
                throw new Error(body.error ?? '재련 재료 시세 갱신에 실패했습니다.');
            }
            const normalized = normalizeHoningMaterialPriceData(body.data);
            if (!normalized || !userId) throw new Error('재련 재료 시세 응답을 해석하지 못했습니다.');
            setData(normalized); setDataSource('personal');
            localStorage.setItem(getCacheKey(userId), JSON.stringify({ data: normalized, expiresAt: normalized.updatedAt + PERSONAL_CACHE_MAX_AGE }));
            addToast({ title: '갱신 완료', description: '현재 API 키 기준 재련 재료 시세를 가져왔습니다.', color: 'success' });
        } catch (error) { addToast({ title: '갱신 실패', description: error instanceof Error ? error.message : '재련 재료 시세를 가져오지 못했습니다.', color: 'danger' }); }
        finally { setIsRefreshing(false); }
    };

    return <div className="w-full">
        <section className="overflow-hidden rounded-2xl border border-default-200/80 bg-content1 shadow-sm dark:border-white/10 dark:bg-[#18181b]">
            <div className="border-b border-default-200/80 px-4 py-4 dark:border-white/10 sm:px-5"><div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between"><div><h1 className="text-xl font-bold">재련 최적화</h1><p className="mt-1 text-sm text-default-500">강화에 필요한 재련 재료의 거래소 최저가를 확인할 수 있습니다.</p></div><div className="flex flex-col items-end gap-1.5"><div className="flex flex-wrap items-center justify-end gap-2"><Button radius="lg" color="primary" isLoading={isRefreshing} isDisabled={!isCheckedToken || !isLogined || !hasApiKey || !canRefresh} onPress={refreshPrices} className="font-semibold">{cooldownSeconds > 0 ? `${cooldownSeconds}초 후 갱신 가능` : '현재 가격 갱신'}</Button>{!isCheckedToken ? null : !isLogined ? <Button as={Link} href={`/login?returnTo=${encodeURIComponent(actionPath)}`} radius="lg" variant="flat" color="secondary" className="font-semibold">로그인하기</Button> : !hasApiKey ? <Button as={Link} href={`/setting?tab=apikey&returnTo=${encodeURIComponent(actionPath)}`} radius="lg" variant="flat" color="secondary" className="font-semibold">API 키 등록하기</Button> : null}</div></div></div></div>
            {data ? <MaterialPriceGrid data={data}/> : <div className="px-4 py-16 text-center text-sm text-default-500 sm:px-5">공용 재련 재료 시세가 아직 준비되지 않았습니다.</div>}
            <div className="flex flex-col gap-1 border-t border-default-100 bg-default-50/70 px-4 py-3 text-xs dark:border-white/[0.06] dark:bg-white/[0.02] sm:flex-row sm:items-center sm:justify-between sm:px-5"><p className="text-default-500">마지막 갱신 {updatedLabel}</p><p className="font-medium text-secondary-600 dark:text-secondary-400">{sourceLabel}</p></div>
        </section>
    </div>;
}
