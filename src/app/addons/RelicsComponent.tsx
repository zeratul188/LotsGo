import { useEffect, useRef, useState } from "react"
import { ChartData, formatMonthData, getDiffPrice, getUndoPrice, loadBooks, RelicBook } from "./relicsFeat";
import { LoadingComponent } from "../UtilsCompnents";
import Image from "next/image";
import { Button, Chip, Divider, Modal, ModalBody, ModalContent, ModalHeader, Tab, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow, Tabs, useDisclosure } from "@heroui/react";
import clsx from "clsx";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';
import { useMobileQuery } from "@/utiils/utils";

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
                <div style={{ width: `${data.length * itemSize}px`, minWidth: '100%' }}>
                    <LineChart width={data.length * itemSize < bigSize ? bigSize : data.length * itemSize} height={400} data={data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <Tooltip content={<CustomTooltip/>}/>
                        <Line type="monotone" dataKey="price" stroke="#338EF7" strokeWidth={2} dot={{ r: 4 }} />
                    </LineChart>
                </div>
            </div>
        </div>
    )
}

function YAxisComponent({ data }: { data: ChartData[] }) {
    const max = Math.max(...data.map(d => d.price));
    const min = 0;
    const steps = 4;

    const stepSize = (max - min) / steps;
    const ticks = Array.from({ length: steps + 1 }, (_, i) =>
        Math.round(max - i * stepSize)
    );

    return (
        <div className="w-[58px] h-[400px] flex flex-col justify-between pb-7">
            {ticks.map((tick, idx) => (
                <div key={idx}>{tick.toLocaleString()}</div>
            ))}
        </div>
    )
}

function CustomTooltip({ active, payload, label }: any) {
    if (active && payload && payload.length) {
        const price = payload[0].value;

        return (
        <div className="rounded-lg border-1 border-[#eeeeee] dark:border-[#333333] px-3 py-2 bg-white dark:bg-[#1a1a1a] flex gap-1 items-center">
            <Chip size="sm" radius="sm" variant="flat" className="min-w-[50px] text-center">{label}</Chip>
            <div className="flex gap-1 items-center">
                <Image 
                    src="/icons/gold.png" 
                    width={14} 
                    height={14} 
                    alt="goldicon"
                    className="w-[16px] h-[16px]"/>
                <span className="text-sm">{price?.toLocaleString()}</span>
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
                                <Image 
                                    src={selectedRelic.icon} 
                                    width={14} 
                                    height={14} 
                                    alt="relic book icon"
                                    className="w-[20px] h-[20px]"/>
                                <p className="text-relics text-[12pt]">{selectedRelic.name}</p>
                            </div>
                        </ModalHeader>
                        <Divider/>
                        <ModalBody>
                            <div className="w-full mt-2">
                                <MonthChart selectedRelic={selectedRelic}/>
                            </div>
                        </ModalBody>
                    </>
                )}
            </ModalContent>
        </Modal>
    )
}

export default function RelicsComponent() {
    const [isLoading, setLoading] = useState(true);
    const [relics, setRelics] = useState<RelicBook[]>([]);
    const [selectedRelic, setSelectedRelic] = useState<RelicBook | null>(null);
    const {isOpen, onOpen, onOpenChange} = useDisclosure();

    useEffect(() => {
        const loadData = async () => {
            await loadBooks(setRelics, setLoading);
        }
        loadData();
    }, []);
    
    if (isLoading) {
        return <LoadingComponent heightStyle={'h-[calc(100vh-155px)]'}/>;
    }

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
                                        <Image 
                                            src={relic.icon} 
                                            width={14} 
                                            height={14} 
                                            alt="relic book icon"
                                            className="w-[20px] h-[20px]"/>
                                        <p className="text-relics text-[12pt]">{relic.name}</p>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex gap-1 items-center">
                                        <Image 
                                            src="/icons/gold.png" 
                                            width={14} 
                                            height={14} 
                                            alt="goldicon"
                                            className="w-[16px] h-[16px]"/>
                                        <span className="text-[12pt]">{relic.price.toLocaleString()}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex gap-1 items-center">
                                        <Image 
                                            src="/icons/gold.png" 
                                            width={14} 
                                            height={14} 
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