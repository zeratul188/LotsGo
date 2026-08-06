'use client';

import {
    Button,
    Link,
    Table,
    TableBody,
    TableCell,
    TableColumn,
    TableHeader,
    TableRow,
    addToast
} from '@heroui/react';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/app/store/store';
import { getBackgroundByGrade } from '@/utiils/utils';
import clsx from 'clsx';
import {
    GEM_LEVELS,
    GemLevelPrice,
    GemPrice,
    GemPriceData,
    normalizeGemPriceData
} from '../model/types';

const PERSONAL_CACHE_MAX_AGE = 2 * 60 * 60 * 1000;
const REFRESH_COOLDOWN = 10 * 1000;
const PERSONAL_CACHE_KEY = 'lotsgo:gem-prices';
const REFRESH_COOLDOWN_KEY = 'lotsgo:gem-prices:refresh-until';
const DESCENDING_GEM_LEVELS = [...GEM_LEVELS].reverse();
const EMPTY_PRICE: GemPrice = { price: null, icon: null, grade: null, name: null };

function formatPrice(price: number | null) {
    return price === null ? '가격 없음' : price.toLocaleString();
}

function formatUpdatedAt(updatedAt: number | null) {
    if (!updatedAt) return '아직 갱신된 데이터가 없습니다.';
    return new Intl.DateTimeFormat('ko-KR', {
        dateStyle: 'medium',
        timeStyle: 'short'
    }).format(new Date(updatedAt));
}

function getCacheKey(userId: string) {
    return `${PERSONAL_CACHE_KEY}:${userId}`;
}

function GoldPrice({ price, highlight = false }: { price: number | null; highlight?: boolean }) {
    return (
        <div className={clsx('flex min-w-0 items-center gap-1.5', highlight && 'text-primary')}>
            {price !== null ? <img src="/icons/gold.png" alt="골드" className="h-[1em] w-[1em] shrink-0"/> : null}
            <span className={clsx('tabular-nums', highlight ? 'font-bold' : 'font-semibold')}>
                {formatPrice(price)}
            </span>
        </div>
    );
}

function GemLevelLabel({ level, value }: { level: number; value?: GemPrice }) {
    return (
        <div className="flex items-center gap-3">
            <div className={clsx(
                'h-10 w-10 shrink-0 rounded-lg p-[2px]',
                value?.icon && value.grade
                    ? getBackgroundByGrade(value.grade)
                    : 'border border-default-200 bg-default-100 dark:border-white/10 dark:bg-white/[0.06]'
            )}>
                {value?.icon ? (
                    <img src={value.icon} alt="" className="h-full w-full rounded-md object-cover"/>
                ) : (
                    <div className="h-full w-full rounded-md bg-default-200/60 dark:bg-white/[0.08]"/>
                )}
            </div>
            <span className="font-semibold text-foreground">{level}레벨 보석</span>
        </div>
    );
}

function DesktopPriceTable({ data }: { data: GemPriceData | null }) {
    return (
        <div className="hidden sm:block">
            <Table
                removeWrapper
                aria-label="보석 시세"
                classNames={{
                    th: 'h-11 bg-default-50 text-xs font-semibold text-default-500 dark:bg-white/[0.04]',
                    td: 'border-b border-default-100 py-4 last:border-b-0 dark:border-white/[0.06]',
                    tr: 'transition-colors hover:bg-default-50/80 dark:hover:bg-white/[0.03]'
                }}>
                <TableHeader>
                    <TableColumn>레벨</TableColumn>
                    <TableColumn>전체 최저가</TableColumn>
                    <TableColumn>겁화</TableColumn>
                    <TableColumn>작열</TableColumn>
                </TableHeader>
                <TableBody emptyContent="아직 공용 보석 시세가 갱신되지 않았습니다.">
                    {DESCENDING_GEM_LEVELS.map((level) => {
                        const levelData = data?.levels[String(level)];
                        const iconValue = levelData?.damage.icon ? levelData.damage : levelData?.cooldown;
                        return (
                            <TableRow key={level}>
                                <TableCell>
                                    <GemLevelLabel level={level} value={iconValue}/>
                                </TableCell>
                                <TableCell>
                                    <div className="text-base"><GoldPrice price={levelData?.lowestPrice ?? null} highlight/></div>
                                </TableCell>
                                <TableCell>
                                    <GoldPrice price={(levelData?.damage ?? EMPTY_PRICE).price}/>
                                </TableCell>
                                <TableCell>
                                    <GoldPrice price={(levelData?.cooldown ?? EMPTY_PRICE).price}/>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </div>
    );
}

function MobilePriceCards({ data }: { data: GemPriceData | null }) {
    return (
        <div className="divide-y divide-default-100 dark:divide-white/[0.06] sm:hidden">
            {DESCENDING_GEM_LEVELS.map((level) => {
                const levelData: GemLevelPrice | undefined = data?.levels[String(level)];
                const iconValue = levelData?.damage.icon ? levelData.damage : levelData?.cooldown;
                return (
                    <article key={level} className="space-y-3 px-4 py-4">
                        <div className="flex items-center justify-between">
                            <GemLevelLabel level={level} value={iconValue}/>
                            <div className="text-base"><GoldPrice price={levelData?.lowestPrice ?? null} highlight/></div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div className="rounded-xl bg-default-50 px-3 py-2.5 dark:bg-white/[0.04]">
                                <p className="text-xs text-default-500">겁화 최저가</p>
                                <div className="mt-1 text-sm"><GoldPrice price={(levelData?.damage ?? EMPTY_PRICE).price}/></div>
                            </div>
                            <div className="rounded-xl bg-default-50 px-3 py-2.5 dark:bg-white/[0.04]">
                                <p className="text-xs text-default-500">작열 최저가</p>
                                <div className="mt-1 text-sm"><GoldPrice price={(levelData?.cooldown ?? EMPTY_PRICE).price}/></div>
                            </div>
                        </div>
                    </article>
                );
            })}
        </div>
    );
}

export default function GemPriceForm() {
    const router = useRouter();
    const isCheckedToken = useSelector((state: RootState) => state.login.isCheckedToken);
    const isLogined = useSelector((state: RootState) => state.login.isLogined);
    const userId = useSelector((state: RootState) => state.login.user.id);
    const hasApiKey = Boolean(useSelector((state: RootState) => state.login.user.apiKey));
    const [data, setData] = useState<GemPriceData | null>(null);
    const [dataSource, setDataSource] = useState<'shared' | 'personal'>('shared');
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [cooldownUntil, setCooldownUntil] = useState(0);
    const [now, setNow] = useState(() => Date.now());

    useEffect(() => {
        let cancelled = false;

        const loadPrices = async () => {
            if (userId) {
                const raw = localStorage.getItem(getCacheKey(userId));
                if (raw) {
                    try {
                        const cached = JSON.parse(raw) as { data?: unknown; expiresAt?: number };
                        if (typeof cached.expiresAt === 'number' && cached.expiresAt > Date.now()) {
                            const normalized = normalizeGemPriceData(cached.data);
                            if (normalized) {
                                if (!cancelled) {
                                    setData(normalized);
                                    setDataSource('personal');
                                }
                                return;
                            }
                        }
                    } catch {
                        // 잘못된 개인 캐시는 아래에서 제거합니다.
                    }

                    localStorage.removeItem(getCacheKey(userId));
                }
            }

            try {
                const response = await fetch('/api/addons/gems/refresh', { cache: 'no-store' });
                const body = await response.json().catch(() => ({}));
                const normalized = normalizeGemPriceData(body.data);
                if (!response.ok || !normalized) throw new Error('공용 보석 시세를 불러오지 못했습니다.');
                if (!cancelled) {
                    setData(normalized);
                    setDataSource('shared');
                }
            } catch (error) {
                if (!cancelled) {
                    setData(null);
                    setDataSource('shared');
                }
                console.error('Failed to load shared gem prices', error);
            }
        };

        loadPrices();
        return () => {
            cancelled = true;
        };
    }, [userId]);

    useEffect(() => {
        const storedCooldown = Number(localStorage.getItem(REFRESH_COOLDOWN_KEY));
        if (Number.isFinite(storedCooldown) && storedCooldown > Date.now()) {
            setCooldownUntil(storedCooldown);
        }

        const interval = window.setInterval(() => {
            const current = Date.now();
            setNow(current);
            if (cooldownUntil > 0 && cooldownUntil <= current) {
                setCooldownUntil(0);
                localStorage.removeItem(REFRESH_COOLDOWN_KEY);
            }
        }, 1000);

        return () => window.clearInterval(interval);
    }, [cooldownUntil]);

    const cooldownSeconds = Math.max(0, Math.ceil((cooldownUntil - now) / 1000));
    const actionPath = '/addons/gems';
    const canRefresh = isCheckedToken && isLogined && hasApiKey && !isRefreshing && cooldownSeconds === 0;
    const sourceLabel = dataSource === 'personal' ? '내 API 키로 갱신한 시세' : '공용 시세';
    const updatedLabel = useMemo(() => formatUpdatedAt(data?.updatedAt ?? null), [data?.updatedAt]);

    const refreshPrices = async () => {
        if (!isCheckedToken || !isLogined) {
            router.push(`/login?returnTo=${encodeURIComponent(actionPath)}`);
            return;
        }
        if (!hasApiKey) {
            router.push(`/setting?tab=apikey&returnTo=${encodeURIComponent(actionPath)}`);
            return;
        }
        if (!canRefresh) return;

        const nextCooldown = Date.now() + REFRESH_COOLDOWN;
        setCooldownUntil(nextCooldown);
        localStorage.setItem(REFRESH_COOLDOWN_KEY, String(nextCooldown));
        setIsRefreshing(true);

        try {
            const token = sessionStorage.getItem('token');
            const response = await fetch('/api/addons/gems/refresh', {
                method: 'POST',
                headers: token ? { authorization: `Bearer ${token}` } : undefined
            });
            const body = await response.json().catch(() => ({}));
            if (!response.ok) {
                if (body.code === 'UNAUTHORIZED') {
                    router.push(`/login?returnTo=${encodeURIComponent(actionPath)}`);
                    return;
                }
                if (body.code === 'API_KEY_REQUIRED') {
                    router.push(`/setting?tab=apikey&returnTo=${encodeURIComponent(actionPath)}`);
                    return;
                }
                throw new Error(body.error ?? '보석 시세 갱신에 실패했습니다.');
            }

            const normalized = normalizeGemPriceData(body.data);
            if (!normalized || !userId) throw new Error('보석 시세 응답을 해석하지 못했습니다.');

            setData(normalized);
            setDataSource('personal');
            localStorage.setItem(getCacheKey(userId), JSON.stringify({
                data: normalized,
                expiresAt: normalized.updatedAt + PERSONAL_CACHE_MAX_AGE
            }));
            addToast({ title: '갱신 완료', description: '현재 API 키 기준 보석 시세를 가져왔습니다.', color: 'success' });
        } catch (error) {
            addToast({
                title: '갱신 실패',
                description: error instanceof Error ? error.message : '보석 시세를 가져오지 못했습니다.',
                color: 'danger'
            });
        } finally {
            setIsRefreshing(false);
        }
    };

    return (
        <div className="w-full">
            <section className="overflow-hidden rounded-2xl border border-default-200/80 bg-content1 shadow-sm dark:border-white/10 dark:bg-[#18181b]">
                <div className="border-b border-default-200/80 px-4 py-4 dark:border-white/10 sm:px-5">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                            <h1 className="text-xl font-bold">보석 시세</h1>
                            <p className="mt-1 text-sm text-default-500">겁화와 작열 보석의 거래소 최저가를 한눈에 확인할 수 있습니다.</p>
                        </div>
                        <div className="flex flex-col items-end gap-1.5">
                            <div className="flex flex-wrap items-center justify-end gap-2">
                                <Button
                                    radius="lg"
                                    color="primary"
                                    isLoading={isRefreshing}
                                    isDisabled={!isCheckedToken || !isLogined || !hasApiKey || (hasApiKey && !canRefresh)}
                                    onPress={refreshPrices}
                                    className="font-semibold">
                                    {cooldownSeconds > 0 ? `${cooldownSeconds}초 후 갱신 가능` : '현재 가격 갱신'}
                                </Button>
                                {!isCheckedToken ? null : !isLogined ? (
                                    <Button as={Link} href={`/login?returnTo=${encodeURIComponent(actionPath)}`} radius="lg" variant="flat" color="secondary" className="font-semibold">
                                        로그인하기
                                    </Button>
                                ) : !hasApiKey ? (
                                    <Button as={Link} href={`/setting?tab=apikey&returnTo=${encodeURIComponent(actionPath)}`} radius="lg" variant="flat" color="secondary" className="font-semibold">
                                        API 키 등록하기
                                    </Button>
                                ) : null}
                            </div>
                            {!isCheckedToken ? null : !isLogined ? (
                                <p className="text-right text-xs text-default-500">로그인해야 현재 가격 갱신을 이용할 수 있습니다.</p>
                            ) : !hasApiKey ? (
                                <p className="text-right text-xs text-default-500">API 키를 등록해야 현재 가격 갱신을 이용할 수 있습니다.</p>
                            ) : null}
                        </div>
                    </div>
                </div>

                {data ? (
                    <>
                        <DesktopPriceTable data={data}/>
                        <MobilePriceCards data={data}/>
                    </>
                ) : (
                    <div className="px-4 py-16 text-center text-sm text-default-500 sm:px-5">
                        공용 보석 시세가 아직 준비되지 않았습니다.
                    </div>
                )}

                <div className="flex flex-col gap-1 border-t border-default-100 bg-default-50/70 px-4 py-3 text-xs dark:border-white/[0.06] dark:bg-white/[0.02] sm:flex-row sm:items-center sm:justify-between sm:px-5">
                    <p className="text-default-500">마지막 갱신 {updatedLabel}</p>
                    <p className="font-medium text-secondary-600 dark:text-secondary-400">{sourceLabel}</p>
                </div>
            </section>
        </div>
    );
}
