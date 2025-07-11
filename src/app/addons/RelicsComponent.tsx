import { useEffect, useState } from "react"
import { getDiffPrice, getUndoPrice, loadBooks, RelicBook } from "./relicsFeat";
import { LoadingComponent } from "../UtilsCompnents";
import Image from "next/image";
import { Button, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from "@heroui/react";
import clsx from "clsx";

export default function RelicsComponent() {
    const [isLoading, setLoading] = useState(true);
    const [relics, setRelics] = useState<RelicBook[]>([]);

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
                                            {Math.abs(getDiffPrice(relic)).toLocaleString()}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Button
                                        variant="flat"
                                        color="primary"
                                        size="sm"
                                        radius="sm">
                                        기록 보기
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}