'use client'
import { useEffect, useRef, useState } from "react"
import { ChartData, formatMonthData, getDiffPrice, getMaxGoldByBook, getMinGoldByBook, getUndoPrice, RelicBook } from "./relicsFeat";
import { Button, Card, CardBody, Chip, Divider, Modal, ModalBody, ModalContent, ModalHeader, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow, useDisclosure } from "@heroui/react";
import clsx from "clsx";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { useMobileQuery } from "@/utiils/utils";
import { getEngravingSrcByName } from "../../character/characterFeat";

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
                        <YAxis
                            domain={['dataMin', 'dataMax']}
                            hide={true}/>
                        <Tooltip content={<CustomTooltip data={data}/>}/>
                        <Line type="monotone" dataKey="price" stroke="#338EF7" strokeWidth={2} dot={{ r: 4 }} />
                    </LineChart>
                </div>
            </div>
        </div>
    )
}

function YAxisComponent({ data }: { data: ChartData[] }) {
    const max = Math.max(...data.map(d => d.price));
    const min = Math.min(...data.map(d => d.price));
    const steps = 4;

    const stepSize = (max - min) / steps;
    const ticks = Array.from({ length: steps + 1 }, (_, i) =>
        Math.round(max - i * stepSize)
    );

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
                <img 
                    src="/icons/gold.png" 
                    alt="goldicon"
                    className="w-[16px] h-[16px]"/>
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
                {(onClose) => (
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
                                                <img 
                                                    src="/icons/gold.png" 
                                                    alt="goldicon"
                                                    className="w-[18px] h-[18px]"/>
                                                <span className="text-[14pt]">{getMaxGoldByBook(selectedRelic).toLocaleString()}</span>
                                            </div>
                                        </CardBody>
                                    </Card>
                                    <Card radius="sm">
                                        <CardBody>
                                            <div className="w-full flex gap-1 items-center">
                                                <Chip radius="sm" variant="flat">3개월 최저 가격</Chip>
                                                <div className="grow"/>
                                                <img 
                                                    src="/icons/gold.png" 
                                                    alt="goldicon"
                                                    className="w-[18px] h-[18px]"/>
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

    return (
        <div className="w-full">
            <p className="fadedtext text-sm mb-2">매 정각에 유각 시세가 업데이트됩니다.</p>
            <div className="w-full overflow-x-auto scrollbar-hide">
                <Table removeWrapper radius="sm" className="w-[700px] min-[701px]:w-full">
                    <TableHeader>
                        <TableColumn>각인서</TableColumn>
                        <TableColumn>가격</TableColumn>
                        <TableColumn>이전 가격</TableColumn>
                        <TableColumn>변동 골드</TableColumn>
                        <TableColumn>차트</TableColumn>
                    </TableHeader>
                    <TableBody emptyContent="데이터가 존재하지 않습니다.">
                        {relics.map((relic, index) => (
                            <TableRow key={index}>
                                <TableCell>
                                    <div className="flex gap-2 items-center">
                                        <img
                                            src={getEngravingSrcByName(relic.name.replaceAll(' 각인서', ''))} 
                                            alt="relic book icon"
                                            className="w-[28px] h-[28px] rounded-md"/>
                                        <p className="text-relics text-[12pt]">{relic.name}</p>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex gap-1 items-center">
                                        <img 
                                            src="/icons/gold.png" 
                                            alt="goldicon"
                                            className="w-[16px] h-[16px]"/>
                                        <span className="text-[12pt]">{relic.price.toLocaleString()}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex gap-1 items-center">
                                        <img 
                                            src="/icons/gold.png" 
                                            alt="goldicon"
                                            className="w-[16px] h-[16px]"/>
                                        <span className="text-[12pt]">{getUndoPrice(relic).toLocaleString()}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex gap-1 items-center">
                                        <span 
                                            className={clsx(
                                                "text-[12pt]",
                                                getDiffPrice(relic) > 0 ? "text-green-700 dark:text-green-400" : getDiffPrice(relic) < 0 ? 'text-red-700 dark:text-red-400' : 'fadedtext'
                                            )}>
                                            {getDiffPrice(relic) > 0 ? '+' : getDiffPrice(relic) < 0 ? '-' : ''}
                                        </span>
                                        <span 
                                            className={clsx(
                                                "text-[12pt]",
                                                getDiffPrice(relic) > 0 ? "text-green-700 dark:text-green-400" : getDiffPrice(relic) < 0 ? 'text-red-700 dark:text-red-400' : 'fadedtext'
                                            )}>
                                            {Math.abs(getDiffPrice(relic)).toLocaleString()} ({Math.round(getDiffPrice(relic) / getUndoPrice(relic) * 1000) / 10}%)
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Button
                                        variant="flat"
                                        color="primary"
                                        size="sm"
                                        radius="sm"
                                        onPress={() => {
                                            setSelectedRelic(relic);
                                            onOpen();
                                        }}>
                                        기록 보기
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
            <ChartModal isOpen={isOpen} selectedRelic={selectedRelic} onOpenChange={onOpenChange}/>
        </div>
    )
}