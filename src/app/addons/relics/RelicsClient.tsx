'use client'
import dynamic from "next/dynamic";
import Script from "next/script";
import { useEffect, useRef, useState } from "react"
import { ChartData, formatMonthData, getDiffPrice, getMaxGoldByBook, getMinGoldByBook, getUndoPrice, RelicBook } from "./relicsFeat";
import { Button, Card, CardBody, Chip, Divider, Modal, ModalBody, ModalContent, ModalHeader, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow, useDisclosure } from "@heroui/react";
import clsx from "clsx";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { useMobileQuery } from "@/utiils/utils";
import { getEngravingSrcByName } from "../../character/lib/characterFeat";

const LineAd = dynamic(() => import("@/app/ad/LineAd"), { ssr: false });
const BoxAd = dynamic(() => import("@/app/ad/BoxAd"), { ssr: false });

type MonthChartProps = {
    selectedRelic: RelicBook | null
}

function MonthChart({ selectedRelic }: MonthChartProps) {
    const [data, setData] = useState<ChartData[]>([]);
    const isMobile = useMobileQuery();
    const scrollRef = useRef<HTMLDivElement>(null);

    const itemSize = isMobile ? 40 : 60;
    const bigSize = isMobile ? 600 : 918;

    useEffect(() => {
        if (selectedRelic) {
            setData(formatMonthData(selectedRelic));
        }
        requestAnimationFrame(() => {
            const container = scrollRef.current;
            if (container) {
                container.scrollLeft = container.scrollWidth;
            }
        });
    }, [selectedRelic]);

    return (
        <div className="w-full flex">
            <YAxisComponent data={data} />
            <div ref={scrollRef} className="w-full overflow-x-auto">
                <div style={{ width: `${data.length * itemSize}px`, minWidth: '100%' }} className="relative pt-2 pb-2">
                    <div style={{ width: data.length * itemSize < bigSize ? `${bigSize}px` : `${data.length * itemSize}px` }} className="h-[calc(100%-51px)] absolute top-2 left-0 flex flex-col justify-between">
                        {Array.from({ length: 5 }).map((_, index) => (
                            <div key={index} className={clsx(
                                "border border-dashed border-[#d0d0d0] dark:border-[#686868] w-full h-[1px]",
                                index === 4 ? 'border-0' : ''
                            )}/>
                        ))}
                    </div>
                    <LineChart width={data.length * itemSize < bigSize ? bigSize : data.length * itemSize} height={389} data={data}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false}/>
                        <XAxis dataKey="date" />
                        <YAxis domain={['dataMin', 'dataMax']} hide={true}/>
                        <Tooltip content={<CustomTooltip data={data}/>}/>
                        <Line type="monotone" dataKey="price" stroke="#338EF7" strokeWidth={2} dot={{ r: 4 }} />
                    </LineChart>
                </div>
            </div>
        </div>
    )
}

function YAxisComponent({ data }: { data: ChartData[] }) {
    const max = Math.max(...data.map((d) => d.price));
    const min = Math.min(...data.map((d) => d.price));
    const steps = 4;
    const stepSize = (max - min) / steps;
    const ticks = Array.from({ length: steps + 1 }, (_, i) => Math.round(max - i * stepSize));

    return (
        <div className="w-[58px] h-[400px] flex flex-col justify-between pb-7">
            {ticks.map((tick, idx) => (
                <div key={idx} className="w-full text-right text-sm pr-1">{tick.toLocaleString()}</div>
            ))}
        </div>
    )
}

function CustomTooltip({ active, payload, label, data }: any) {
    if (active && payload && payload.length) {
        const price = payload[0].value;
        const currentIndex = data.findIndex((item: any) => item.date === label);
        const prevPrice = currentIndex > 0 ? data[currentIndex - 1].price : null;
        const diff = prevPrice !== null ? price - prevPrice : 0;

        return (
            <div className="rounded-lg border-1 border-[#eeeeee] dark:border-[#333333] px-3 py-2 bg-white dark:bg-[#1a1a1a] flex gap-1 items-center">
                <Chip size="sm" radius="sm" variant="flat" className="min-w-[50px] text-center">{label}</Chip>
                <div className="flex gap-1 items-center">
                    <img src="/icons/gold.png" alt="goldicon" className="w-[16px] h-[16px]"/>
                    <span className="text-sm">{price?.toLocaleString()}</span>
                    <span className={clsx(
                        "text-sm ml-2",
                        diff > 0 ? 'text-green-700 dark:text-green-400' : diff < 0 ? 'text-red-700 dark:text-red-400' : 'fadedtext'
                    )}>{diff > 0 ? '+ ' : diff < 0 ? '- ' : ''}{Math.abs(diff).toLocaleString()}</span>
                </div>
            </div>
        );
    }

    return null;
}

type ChartModalProps = {
    selectedRelic: RelicBook | null,
    isOpen: boolean,
    onOpenChange: () => void
}

function ChartModal({ selectedRelic, isOpen, onOpenChange }: ChartModalProps) {
    if (!selectedRelic) {
        return <></>
    }

    return (
        <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="5xl">
            <ModalContent>
                {() => (
                    <>
                        <ModalHeader>
                            <div className="flex gap-2 items-center">
                                <img
                                    src={getEngravingSrcByName(selectedRelic.name.replaceAll(' 각인서', ''))}
                                    alt="relic book icon"
                                    className="w-[32px] h-[32px] rounded-md"/>
                                <p className="text-relics text-[12pt]">{selectedRelic.name}</p>
                            </div>
                        </ModalHeader>
                        <Divider/>
                        <ModalBody>
                            <div className="w-full mt-2 mb-4 pt-4">
                                <MonthChart selectedRelic={selectedRelic}/>
                                <div className="w-full grid sm:grid-cols-2 gap-3 mt-3">
                                    <Card radius="sm">
                                        <CardBody>
                                            <div className="w-full flex gap-1 items-center">
                                                <Chip radius="sm" variant="flat">3개월 최고 가격</Chip>
                                                <div className="grow"/>
                                                <img src="/icons/gold.png" alt="goldicon" className="w-[18px] h-[18px]"/>
                                                <span className="text-[14pt]">{getMaxGoldByBook(selectedRelic).toLocaleString()}</span>
                                            </div>
                                        </CardBody>
                                    </Card>
                                    <Card radius="sm">
                                        <CardBody>
                                            <div className="w-full flex gap-1 items-center">
                                                <Chip radius="sm" variant="flat">3개월 최저 가격</Chip>
                                                <div className="grow"/>
                                                <img src="/icons/gold.png" alt="goldicon" className="w-[18px] h-[18px]"/>
                                                <span className="text-[14pt]">{getMinGoldByBook(selectedRelic).toLocaleString()}</span>
                                            </div>
                                        </CardBody>
                                    </Card>
                                </div>
                            </div>
                        </ModalBody>
                    </>
                )}
            </ModalContent>
        </Modal>
    )
}

type RelicsClientProps = {
    relics: RelicBook[]
}

export default function RelicsClient({ relics }: RelicsClientProps) {
    const [selectedRelic, setSelectedRelic] = useState<RelicBook | null>(null);
    const {isOpen, onOpen, onOpenChange} = useDisclosure();
    const isMobile = useMobileQuery();
    const highestRelic = relics.length > 0
        ? relics.reduce((highest, relic) => relic.price > highest.price ? relic : highest)
        : null;
    const increasedCount = relics.filter((relic) => getDiffPrice(relic) > 0).length;
    const decreasedCount = relics.filter((relic) => getDiffPrice(relic) < 0).length;

    const getChangeRate = (relic: RelicBook) => {
        const previousPrice = getUndoPrice(relic);
        if (previousPrice === 0) return 0;
        return Math.round((getDiffPrice(relic) / previousPrice) * 1000) / 10;
    }

    const openHistory = (relic: RelicBook) => {
        setSelectedRelic(relic);
        onOpen();
    }

    return (
        <div className="w-full">
            <section className="overflow-hidden rounded-2xl border border-default-200/80 bg-content1 shadow-sm dark:border-white/10 dark:bg-[#18181b]">
                <div className="border-b border-default-200/80 px-4 py-4 dark:border-white/10 sm:px-5">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-xl font-bold">유물 각인서 시세</h1>
                                <span className="rounded-full bg-primary-50 px-2 py-1 text-[11px] font-semibold text-primary dark:bg-primary-500/15">총 {relics.length}종</span>
                            </div>
                            <p className="mt-1 text-sm text-default-500">경매장 기준 현재가와 직전 가격의 변동을 확인할 수 있습니다.</p>
                        </div>
                        <div className="flex w-fit items-center gap-2 rounded-full bg-default-100 px-3 py-1.5 text-xs text-default-600 dark:bg-white/[0.06]">
                            <span className="h-2 w-2 rounded-full bg-success"/>
                            매 정각 업데이트
                        </div>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
                        <div className="col-span-2 rounded-xl bg-default-50 px-3 py-3 dark:bg-white/[0.04] sm:col-span-1">
                            <p className="text-xs text-default-500">현재 최고가</p>
                            {highestRelic ? (
                                <div className="mt-1 flex items-center gap-2">
                                    <img
                                        src={getEngravingSrcByName(highestRelic.name.replaceAll(' 각인서', ''))}
                                        alt="relic book icon"
                                        className="h-8 w-8 rounded-lg"/>
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-semibold text-relics">{highestRelic.name}</p>
                                        <div className="flex items-center gap-1">
                                            <img src="/icons/gold.png" alt="goldicon" className="h-3.5 w-3.5"/>
                                            <span className="text-sm font-bold tabular-nums">{highestRelic.price.toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>
                            ) : <p className="mt-2 text-sm text-default-400">데이터 없음</p>}
                        </div>
                        <div className="rounded-xl bg-success-50 px-3 py-3 dark:bg-success-500/10">
                            <p className="text-xs text-success-700 dark:text-success-400">가격 상승</p>
                            <p className="mt-1 text-xl font-bold text-success-700 dark:text-success-400">{increasedCount}<span className="ml-1 text-xs font-medium">종</span></p>
                        </div>
                        <div className="rounded-xl bg-danger-50 px-3 py-3 dark:bg-danger-500/10">
                            <p className="text-xs text-danger-700 dark:text-danger-400">가격 하락</p>
                            <p className="mt-1 text-xl font-bold text-danger-700 dark:text-danger-400">{decreasedCount}<span className="ml-1 text-xs font-medium">종</span></p>
                        </div>
                    </div>
                </div>

                <div className="hidden sm:block">
                    <Table
                        removeWrapper
                        aria-label="유물 각인서 시세"
                        classNames={{
                            th: "h-10 bg-default-50 text-xs font-semibold text-default-500 dark:bg-white/[0.04]",
                            td: "border-b border-default-100 py-3 last:border-b-0 dark:border-white/[0.06]",
                            tr: "transition-colors hover:bg-default-50/80 dark:hover:bg-white/[0.03]"
                        }}>
                        <TableHeader>
                            <TableColumn>각인서</TableColumn>
                            <TableColumn>현재 가격</TableColumn>
                            <TableColumn>이전 가격</TableColumn>
                            <TableColumn>가격 변동</TableColumn>
                            <TableColumn align="center">기록</TableColumn>
                        </TableHeader>
                        <TableBody emptyContent="데이터가 존재하지 않습니다.">
                            {relics.map((relic) => (
                                <TableRow key={relic.name}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <img
                                                src={getEngravingSrcByName(relic.name.replaceAll(' 각인서', ''))}
                                                alt="relic book icon"
                                                className="h-10 w-10 rounded-lg ring-1 ring-black/5 dark:ring-white/10"/>
                                            <div>
                                                <p className="font-semibold text-relics">{relic.name}</p>
                                                <p className="mt-0.5 text-[11px] text-default-400">유물 등급 각인서</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1.5">
                                            <img src="/icons/gold.png" alt="goldicon" className="h-4 w-4"/>
                                            <span className="text-base font-bold tabular-nums">{relic.price.toLocaleString()}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1.5 text-default-500">
                                            <img src="/icons/gold.png" alt="goldicon" className="h-3.5 w-3.5 opacity-70"/>
                                            <span className="text-sm tabular-nums">{getUndoPrice(relic).toLocaleString()}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className={clsx(
                                            "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold tabular-nums",
                                            getDiffPrice(relic) > 0
                                                ? "bg-success-50 text-success-700 dark:bg-success-500/10 dark:text-success-400"
                                                : getDiffPrice(relic) < 0
                                                    ? "bg-danger-50 text-danger-700 dark:bg-danger-500/10 dark:text-danger-400"
                                                    : "bg-default-100 text-default-500 dark:bg-white/[0.06]"
                                        )}>
                                            <span>{getDiffPrice(relic) > 0 ? '↑' : getDiffPrice(relic) < 0 ? '↓' : '−'}</span>
                                            <span>{Math.abs(getDiffPrice(relic)).toLocaleString()}</span>
                                            <span className="font-medium opacity-75">({Math.abs(getChangeRate(relic))}%)</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Button
                                            variant="flat"
                                            color="primary"
                                            size="sm"
                                            radius="lg"
                                            className="font-medium"
                                            onPress={() => openHistory(relic)}>
                                            기록 보기
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                <div className="divide-y divide-default-100 dark:divide-white/[0.06] sm:hidden">
                    {relics.length > 0 ? relics.map((relic) => (
                        <article key={relic.name} className="px-4 py-4">
                            <div className="flex items-start gap-3">
                                <img
                                    src={getEngravingSrcByName(relic.name.replaceAll(' 각인서', ''))}
                                    alt="relic book icon"
                                    className="h-11 w-11 shrink-0 rounded-lg ring-1 ring-black/5 dark:ring-white/10"/>
                                <div className="min-w-0 grow">
                                    <p className="truncate font-semibold text-relics">{relic.name}</p>
                                    <div className="mt-1 flex items-center gap-1.5">
                                        <img src="/icons/gold.png" alt="goldicon" className="h-4 w-4"/>
                                        <span className="text-lg font-bold tabular-nums">{relic.price.toLocaleString()}</span>
                                        <span className="text-xs text-default-400">골드</span>
                                    </div>
                                </div>
                                <div className={clsx(
                                    "shrink-0 rounded-full px-2 py-1 text-xs font-semibold tabular-nums",
                                    getDiffPrice(relic) > 0
                                        ? "bg-success-50 text-success-700 dark:bg-success-500/10 dark:text-success-400"
                                        : getDiffPrice(relic) < 0
                                            ? "bg-danger-50 text-danger-700 dark:bg-danger-500/10 dark:text-danger-400"
                                            : "bg-default-100 text-default-500 dark:bg-white/[0.06]"
                                )}>
                                    {getDiffPrice(relic) > 0 ? '↑' : getDiffPrice(relic) < 0 ? '↓' : '−'} {Math.abs(getChangeRate(relic))}%
                                </div>
                            </div>
                            <div className="mt-3 flex items-center justify-between rounded-xl bg-default-50 px-3 py-2 dark:bg-white/[0.04]">
                                <div>
                                    <p className="text-[11px] text-default-400">이전 가격</p>
                                    <p className="mt-0.5 text-sm font-medium tabular-nums">{getUndoPrice(relic).toLocaleString()} 골드</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[11px] text-default-400">변동 금액</p>
                                    <p className={clsx(
                                        "mt-0.5 text-sm font-semibold tabular-nums",
                                        getDiffPrice(relic) > 0
                                            ? "text-success-700 dark:text-success-400"
                                            : getDiffPrice(relic) < 0
                                                ? "text-danger-700 dark:text-danger-400"
                                                : "text-default-500"
                                    )}>
                                        {getDiffPrice(relic) > 0 ? '+' : getDiffPrice(relic) < 0 ? '-' : ''}{Math.abs(getDiffPrice(relic)).toLocaleString()} 골드
                                    </p>
                                </div>
                                <Button
                                    variant="flat"
                                    color="primary"
                                    size="sm"
                                    radius="lg"
                                    className="font-medium"
                                    onPress={() => openHistory(relic)}>
                                    기록 보기
                                </Button>
                            </div>
                        </article>
                    )) : (
                        <div className="px-4 py-12 text-center text-sm text-default-400">데이터가 존재하지 않습니다.</div>
                    )}
                </div>
            </section>
            {isMobile ? (
                <div className="w-full flex justify-center px-4">
                    <div className="w-full max-w-[360px] min-h-[100px] mt-4">
                        <BoxAd isLoaded={true}/>
                    </div>
                </div>
            ) : (
                <div className="w-full flex justify-center px-4 overflow-hidden mt-8">
                    <div className="w-full max-w-[1240px] flex justify-center rounded-2xl bg-[#eeeeee] dark:bg-[#222222] p-8">
                        <div className="w-full max-w-[970px] min-h-[60px] max-h-[80px]">
                            <LineAd isLoaded={true}/>
                        </div>
                    </div>
                </div>
            )}
            <ChartModal isOpen={isOpen} selectedRelic={selectedRelic} onOpenChange={onOpenChange}/>
            <Script
                async
                src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1236449818258742"
                crossOrigin="anonymous"/>
        </div>
    )
}
