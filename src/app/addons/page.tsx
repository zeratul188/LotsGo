'use client'
import { 
    addToast,
    Button,
    Card,
    CardBody,
    NumberInput, 
    Pagination, 
    Radio, RadioGroup, 
    Table, TableBody, TableCell, TableColumn, TableHeader, TableRow 
} from "@heroui/react";
import { useEffect, useState } from "react"
import Image from "next/image";
import { CalData, formatGold, getBreakpointGold, loadData, useClickPersons, useClickResetDatas, useClickSaveData } from "./calcFeat";

export default function CalcComponent() {
    const [gold, setGold] = useState(0);
    const [inputPerson, setInputPerson] = useState(10);
    const [person, setPerson] = useState(4);
    const [type, setType] = useState('4');
    const [datas, setDatas] = useState<CalData[]>([]);
    const [page, setPage] = useState(1);
    const countByPage = 20;

    const onClickPersons = useClickPersons(inputPerson, setPerson, setType);
    const onClickSaveData = useClickSaveData(datas, setDatas, gold, person);
    const onClickResetDatas = useClickResetDatas(setDatas, setPage);

    useEffect(() => {
        loadData(setDatas);
    }, []);

    useEffect(() => {
        if (type === 'custom') {
            setPerson(inputPerson);
        }
    }, [inputPerson]);

    return (
        <div className="w-full">
            <div className="w-full grid sm:grid-cols-[2fr_3fr] gap-4">
                <div>
                    <div className="w-full flex gap-2 items-end">
                        <NumberInput
                            fullWidth
                            maxValue={999999999}
                            value={gold}
                            onValueChange={setGold}
                            labelPlacement="outside"
                            label="경매 아이템 가격 (입력 후 Enter)"
                            placeholder="아이템 가격을 입력해주세요."
                            radius="sm"
                            className="grow"/>
                        <Button
                            color="primary"
                            radius="sm"
                            isDisabled={gold <= 0 || isNaN(gold)}
                            onPress={onClickSaveData}>
                            저장
                        </Button>
                    </div>
                    <RadioGroup 
                        orientation="horizontal" 
                        defaultValue="4" 
                        className="mt-4 mb-4"
                        onValueChange={onClickPersons}>
                        <Radio value="4"><span className="pl-1 sm:pl-2 pr-2 sm:pr-4">4인</span></Radio>
                        <Radio value="8"><span className="pl-1 sm:pl-2 pr-2 sm:pr-4">8인</span></Radio>
                        <Radio value="16"><span className="pl-1 sm:pl-2 pr-2 sm:pr-4">16인</span></Radio>
                        <Radio value="custom">
                        </Radio>
                        <div className="flex items-center gap-1">
                            <NumberInput
                                maxLength={2}
                                value={inputPerson}
                                radius="sm"
                                size="sm"
                                onValueChange={setInputPerson}
                                className="w-[80px]"/>
                            <span>인</span>
                        </div>
                    </RadioGroup>
                    <Table 
                        aria-label="item calc table"
                        selectionMode="single">
                        <TableHeader>
                            <TableColumn>:</TableColumn>
                            <TableColumn>입찰가 골드</TableColumn>
                            <TableColumn>이익 골드</TableColumn>
                            <TableColumn>분배금</TableColumn>
                        </TableHeader>
                        <TableBody>
                            <TableRow 
                                key="self" 
                                className="cursor-pointer"
                                onClick={async () => {
                                    const value = Math.floor(gold * (person - 1) / person);
                                    try {
                                        await navigator.clipboard.writeText(value.toString());
                                        addToast({
                                            title: "복사 완료",
                                            description: `직접 이용할 값을 복사하였습니다.`,
                                            color: "success"
                                        });
                                    } catch(err) {
                                        console.error(err);
                                    }
                                }}>
                                <TableCell>직접 이용 시</TableCell>
                                <TableCell>
                                    <div className="flex gap-1 items-center">
                                        <Image 
                                            src="/icons/gold.png" 
                                            width={14} 
                                            height={14} 
                                            alt="goldicon"
                                            className="w-[16px] h-[16px] hidden sm:flex"/>
                                        <span>{formatGold(gold * (person - 1) / person)}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex gap-1 items-center">
                                        <Image 
                                            src="/icons/gold.png" 
                                            width={14} 
                                            height={14} 
                                            alt="goldicon"
                                            className="w-[16px] h-[16px] hidden sm:flex"/>
                                        <span>{formatGold(gold - (gold * (person - 1) / person))}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex gap-1 items-center">
                                        <Image 
                                            src="/icons/gold.png" 
                                            width={14} 
                                            height={14} 
                                            alt="goldicon"
                                            className="w-[16px] h-[16px] hidden sm:flex"/>
                                        <span>{formatGold((gold * (person - 1) / person) / (person - 1))}</span>
                                    </div>
                                </TableCell>
                            </TableRow>
                            <TableRow 
                                key="breakpoint" 
                                className="cursor-pointer"
                                onClick={async () => {
                                    const value = getBreakpointGold(gold, person);
                                    try {
                                        await navigator.clipboard.writeText(value.toString());
                                        addToast({
                                            title: "복사 완료",
                                            description: `순익 분기점 값을 복사하였습니다.`,
                                            color: "success"
                                        });
                                    } catch(err) {
                                        console.error(err);
                                    }
                                }}>
                                <TableCell>순익 분기점</TableCell>
                                <TableCell>
                                    <div className="flex gap-1 items-center">
                                        <Image 
                                            src="/icons/gold.png" 
                                            width={14} 
                                            height={14} 
                                            alt="goldicon"
                                            className="w-[16px] h-[16px] hidden sm:flex"/>
                                        <span>{formatGold(getBreakpointGold(gold, person))}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex gap-1 items-center">
                                        <Image 
                                            src="/icons/gold.png" 
                                            width={14} 
                                            height={14} 
                                            alt="goldicon"
                                            className="w-[16px] h-[16px] hidden sm:flex"/>
                                        <span>0</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex gap-1 items-center">
                                        <Image 
                                            src="/icons/gold.png" 
                                            width={14} 
                                            height={14} 
                                            alt="goldicon"
                                            className="w-[16px] h-[16px] hidden sm:flex"/>
                                        <span>{formatGold(getBreakpointGold(gold, person) / (person - 1))}</span>
                                    </div>
                                </TableCell>
                            </TableRow>
                            <TableRow 
                                key="first" 
                                className="cursor-pointer"
                                onClick={async () => {
                                    const value = Math.floor(getBreakpointGold(gold, person) / 1.1);
                                    try {
                                        await navigator.clipboard.writeText(value.toString());
                                        addToast({
                                            title: "복사 완료",
                                            description: `선점 입찰가 값을 복사하였습니다.`,
                                            color: "success"
                                        });
                                    } catch(err) {
                                        console.error(err);
                                    }
                                }}>
                                <TableCell>선점 입찰가</TableCell>
                                <TableCell>
                                    <div className="flex gap-1 items-center">
                                        <Image 
                                            src="/icons/gold.png" 
                                            width={14} 
                                            height={14} 
                                            alt="goldicon"
                                            className="w-[16px] h-[16px] hidden sm:flex"/>
                                        <span>{formatGold(getBreakpointGold(gold, person) / 1.1)}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex gap-1 items-center">
                                        <Image 
                                            src="/icons/gold.png" 
                                            width={14} 
                                            height={14} 
                                            alt="goldicon"
                                            className="w-[16px] h-[16px] hidden sm:flex"/>
                                        <span>{formatGold(getBreakpointGold(gold, person) - (getBreakpointGold(gold, person) / 1.1))}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex gap-1 items-center">
                                        <Image 
                                            src="/icons/gold.png" 
                                            width={14} 
                                            height={14} 
                                            alt="goldicon"
                                            className="w-[16px] h-[16px] hidden sm:flex"/>
                                        <span>{formatGold((getBreakpointGold(gold, person) / 1.1) / (person - 1))}</span>
                                    </div>
                                </TableCell>
                            </TableRow>
                            <TableRow 
                                key="first25" 
                                className="cursor-pointer"
                                onClick={async () => {
                                    const value = Math.floor(getBreakpointGold(gold, person) / 1.025);
                                    try {
                                        await navigator.clipboard.writeText(value.toString());
                                        addToast({
                                            title: "복사 완료",
                                            description: `선점 입찰가의 25% 값을 복사하였습니다.`,
                                            color: "success"
                                        });
                                    } catch(err) {
                                        console.error(err);
                                    }
                                }}>
                                <TableCell>선점 - 25%</TableCell>
                                <TableCell>
                                    <div className="flex gap-1 items-center">
                                        <Image 
                                            src="/icons/gold.png" 
                                            width={14} 
                                            height={14} 
                                            alt="goldicon"
                                            className="w-[16px] h-[16px] hidden sm:flex"/>
                                        <span>{formatGold(getBreakpointGold(gold, person) / 1.025)}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex gap-1 items-center">
                                        <Image 
                                            src="/icons/gold.png" 
                                            width={14} 
                                            height={14} 
                                            alt="goldicon"
                                            className="w-[16px] h-[16px] hidden sm:flex"/>
                                        <span>{formatGold(getBreakpointGold(gold, person) - (getBreakpointGold(gold, person) / 1.025))}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex gap-1 items-center">
                                        <Image 
                                            src="/icons/gold.png" 
                                            width={14} 
                                            height={14} 
                                            alt="goldicon"
                                            className="w-[16px] h-[16px] hidden sm:flex"/>
                                        <span>{formatGold((getBreakpointGold(gold, person) / 1.025) / (person - 1))}</span>
                                    </div>
                                </TableCell>
                            </TableRow>
                            <TableRow 
                                key="first50" 
                                className="cursor-pointer"
                                onClick={async () => {
                                    const value = Math.floor(getBreakpointGold(gold, person) / 1.05);
                                    try {
                                        await navigator.clipboard.writeText(value.toString());
                                        addToast({
                                            title: "복사 완료",
                                            description: `선점 입찰가의 50% 값을 복사하였습니다.`,
                                            color: "success"
                                        });
                                    } catch(err) {
                                        console.error(err);
                                    }
                                }}>
                                <TableCell>선점 - 50%</TableCell>
                                <TableCell>
                                    <div className="flex gap-1 items-center">
                                        <Image 
                                            src="/icons/gold.png" 
                                            width={14} 
                                            height={14} 
                                            alt="goldicon"
                                            className="w-[16px] h-[16px] hidden sm:flex"/>
                                        <span>{formatGold(getBreakpointGold(gold, person) / 1.05)}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex gap-1 items-center">
                                        <Image 
                                            src="/icons/gold.png" 
                                            width={14} 
                                            height={14} 
                                            alt="goldicon"
                                            className="w-[16px] h-[16px] hidden sm:flex"/>
                                        <span>{formatGold(getBreakpointGold(gold, person) - (getBreakpointGold(gold, person) / 1.05))}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex gap-1 items-center">
                                        <Image 
                                            src="/icons/gold.png" 
                                            width={14} 
                                            height={14} 
                                            alt="goldicon"
                                            className="w-[16px] h-[16px] hidden sm:flex"/>
                                        <span>{formatGold((getBreakpointGold(gold, person) / 1.05) / (person - 1))}</span>
                                    </div>
                                </TableCell>
                            </TableRow>
                            <TableRow 
                                key="first75" 
                                className="cursor-pointer"
                                onClick={async () => {
                                    const value = Math.floor(getBreakpointGold(gold, person) / 1.075);
                                    try {
                                        await navigator.clipboard.writeText(value.toString());
                                        addToast({
                                            title: "복사 완료",
                                            description: `선점 입찰가의 75% 값을 복사하였습니다.`,
                                            color: "success"
                                        });
                                    } catch(err) {
                                        console.error(err);
                                    }
                                }}>
                                <TableCell>선점 - 75%</TableCell>
                                <TableCell>
                                    <div className="flex gap-1 items-center">
                                        <Image 
                                            src="/icons/gold.png" 
                                            width={14} 
                                            height={14} 
                                            alt="goldicon"
                                            className="w-[16px] h-[16px] hidden sm:flex"/>
                                        <span>{formatGold(getBreakpointGold(gold, person) / 1.075)}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex gap-1 items-center">
                                        <Image 
                                            src="/icons/gold.png" 
                                            width={14} 
                                            height={14} 
                                            alt="goldicon"
                                            className="w-[16px] h-[16px] hidden sm:flex"/>
                                        <span>{formatGold(getBreakpointGold(gold, person) - (getBreakpointGold(gold, person) / 1.075))}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex gap-1 items-center">
                                        <Image 
                                            src="/icons/gold.png" 
                                            width={14} 
                                            height={14} 
                                            alt="goldicon"
                                            className="w-[16px] h-[16px] hidden sm:flex"/>
                                        <span>{formatGold((getBreakpointGold(gold, person) / 1.075) / (person - 1))}</span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                    <p className="mt-2 fadedtext text-sm">항목을 클릭하시면 클립보드에 복사됩니다.</p>
                </div>
                <Card radius="sm" className="h-[max-content]">
                    <CardBody>
                        <div className="w-full">
                            <h3 className="font-bold text-lg">직접 이용 시</h3>
                            <div className="flex flex-col sm:flex-row gap-1">
                                <p>경매가 × (인원수 - 1) × 인원수<span className="hidden sm:inline"> :</span></p>
                                <p className="text-green-700 dark:text-green-400">{gold.toLocaleString()} × ({person} - 1) × {person}</p>
                            </div>
                            <h3 className="font-bold text-lg mt-2">순익 분기점</h3>
                            <div className="flex flex-col sm:flex-row gap-1">
                                <p>경매가 × 0.95 × (인원수 - 1) × 인원수<span className="hidden sm:inline"> :</span></p>
                                <p className="text-green-700 dark:text-green-400">{gold.toLocaleString()} * 0.95 × ({person} - 1) × {person}</p>
                            </div>
                            <h3 className="font-bold text-lg mt-2">선점 입찰가</h3>
                            <div className="flex flex-col sm:flex-row gap-1">
                                <p>순익 분기점 ÷ 1.1<span className="hidden sm:inline"> :</span></p>
                                <p className="text-green-700 dark:text-green-400">{getBreakpointGold(gold, person).toLocaleString()} ÷ 1.1</p>
                            </div>
                            <h3 className="font-bold text-lg mt-2">선점 25%</h3>
                            <div className="flex flex-col sm:flex-row gap-1">
                                <p>순익 분기점 ÷ 1.025<span className="hidden sm:inline"> :</span></p>
                                <p className="text-green-700 dark:text-green-400">{getBreakpointGold(gold, person).toLocaleString()} ÷ 1.025</p>
                            </div>
                            <h3 className="font-bold text-lg mt-2">선점 50%</h3>
                            <div className="flex flex-col sm:flex-row gap-1">
                                <p>순익 분기점 ÷ 1.05<span className="hidden sm:inline"> :</span></p>
                                <p className="text-green-700 dark:text-green-400">{getBreakpointGold(gold, person).toLocaleString()} ÷ 1.05</p>
                            </div>
                            <h3 className="font-bold text-lg mt-2">선점 75%</h3>
                            <div className="flex flex-col sm:flex-row gap-1">
                                <p>순익 분기점 ÷ 1.075<span className="hidden sm:inline"> :</span></p>
                                <p className="text-green-700 dark:text-green-400">{getBreakpointGold(gold, person).toLocaleString()} ÷ 1.075</p>
                            </div>
                        </div>
                    </CardBody>
                </Card>
            </div>
            <div className="flex gap-2 mt-8 items-center">
                <div className="flex flex-row gap-3 items-end grow">
                    <p className="text-2xl">저장 기록</p>
                    <p className="text-sm fadedtext">총 {datas.length}개의 기록</p>
                </div>
                <Button
                    color="danger"
                    radius="sm"
                    onPress={onClickResetDatas}>
                    데이터 초기화
                </Button>
            </div>
            <div className="w-full overflow-x-auto scrollbar-hide">
                <Table 
                    removeWrapper 
                    aria-label="table datas" 
                    className="mt-4 w-[1000px] min-[1001px]:w-full">
                    <TableHeader>
                        <TableColumn>인원수</TableColumn>
                        <TableColumn>경매가</TableColumn>
                        <TableColumn>직접 이용 시</TableColumn>
                        <TableColumn>순익 분기점</TableColumn>
                        <TableColumn>선점 입찰가</TableColumn>
                        <TableColumn>선점 25%</TableColumn>
                        <TableColumn>선점 50%</TableColumn>
                        <TableColumn>선점 75%</TableColumn>
                    </TableHeader>
                    <TableBody emptyContent="저장된 기록이 없습니다.">
                        {[...datas].reverse().slice((page-1)*countByPage, page*countByPage).map((data, index) => (
                            <TableRow key={index}>
                                <TableCell>{data.person}인</TableCell>
                                <TableCell>
                                    <div className="flex gap-1 items-center px-2.5 py-1.5">
                                        <Image 
                                            src="/icons/gold.png" 
                                            width={14} 
                                            height={14} 
                                            alt="goldicon"
                                            className="w-[16px] h-[16px]"/>
                                        <span>{formatGold(data.gold)}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div 
                                        className="flex gap-1 items-center cursor-pointer px-2.5 py-1.5 rounded-md hover:bg-[#eeeeee] hover:dark:bg-[#333333]"
                                        onClick={async () => {
                                            const value = Math.floor(data.self);
                                            try {
                                                await navigator.clipboard.writeText(value.toString());
                                                addToast({
                                                    title: "복사 완료",
                                                    description: `직접 이용할 값을 복사하였습니다.`,
                                                    color: "success"
                                                });
                                            } catch(err) {
                                                console.error(err);
                                            }
                                        }}>
                                        <Image 
                                            src="/icons/gold.png" 
                                            width={14} 
                                            height={14} 
                                            alt="goldicon"
                                            className="w-[16px] h-[16px]"/>
                                        <span>{formatGold(data.self)}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div 
                                        className="flex gap-1 items-center cursor-pointer px-2.5 py-1.5 rounded-md hover:bg-[#eeeeee] hover:dark:bg-[#333333]"
                                        onClick={async () => {
                                            const value = Math.floor(data.breakpoint);
                                            try {
                                                await navigator.clipboard.writeText(value.toString());
                                                addToast({
                                                    title: "복사 완료",
                                                    description: `순익 분기점 값을 복사하였습니다.`,
                                                    color: "success"
                                                });
                                            } catch(err) {
                                                console.error(err);
                                            }
                                        }}>
                                        <Image 
                                            src="/icons/gold.png" 
                                            width={14} 
                                            height={14} 
                                            alt="goldicon"
                                            className="w-[16px] h-[16px]"/>
                                        <span>{formatGold(data.breakpoint)}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div 
                                        className="flex gap-1 items-center cursor-pointer px-2.5 py-1.5 rounded-md hover:bg-[#eeeeee] hover:dark:bg-[#333333]"
                                        onClick={async () => {
                                            const value = Math.floor(data.first);
                                            try {
                                                await navigator.clipboard.writeText(value.toString());
                                                addToast({
                                                    title: "복사 완료",
                                                    description: `선점 입찰가 값을 복사하였습니다.`,
                                                    color: "success"
                                                });
                                            } catch(err) {
                                                console.error(err);
                                            }
                                        }}>
                                        <Image 
                                            src="/icons/gold.png" 
                                            width={14} 
                                            height={14} 
                                            alt="goldicon"
                                            className="w-[16px] h-[16px]"/>
                                        <span>{formatGold(data.first)}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div 
                                        className="flex gap-1 items-center cursor-pointer px-2.5 py-1.5 rounded-md hover:bg-[#eeeeee] hover:dark:bg-[#333333]"
                                        onClick={async () => {
                                            const value = Math.floor(data.first25);
                                            try {
                                                await navigator.clipboard.writeText(value.toString());
                                                addToast({
                                                    title: "복사 완료",
                                                    description: `선점 입찰가의 25% 값을 복사하였습니다.`,
                                                    color: "success"
                                                });
                                            } catch(err) {
                                                console.error(err);
                                            }
                                        }}>
                                        <Image 
                                            src="/icons/gold.png" 
                                            width={14} 
                                            height={14} 
                                            alt="goldicon"
                                            className="w-[16px] h-[16px]"/>
                                        <span>{formatGold(data.first25)}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div 
                                        className="flex gap-1 items-center cursor-pointer px-2.5 py-1.5 rounded-md hover:bg-[#eeeeee] hover:dark:bg-[#333333]"
                                        onClick={async () => {
                                            const value = Math.floor(data.first50);
                                            try {
                                                await navigator.clipboard.writeText(value.toString());
                                                addToast({
                                                    title: "복사 완료",
                                                    description: `선점 입찰가의 50% 값을 복사하였습니다.`,
                                                    color: "success"
                                                });
                                            } catch(err) {
                                                console.error(err);
                                            }
                                        }}>
                                        <Image 
                                            src="/icons/gold.png" 
                                            width={14} 
                                            height={14} 
                                            alt="goldicon"
                                            className="w-[16px] h-[16px]"/>
                                        <span>{formatGold(data.first50)}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div 
                                        className="flex gap-1 items-center cursor-pointer px-2.5 py-1.5 rounded-md hover:bg-[#eeeeee] hover:dark:bg-[#333333]"
                                        onClick={async () => {
                                            const value = Math.floor(data.first75);
                                            try {
                                                await navigator.clipboard.writeText(value.toString());
                                                addToast({
                                                    title: "복사 완료",
                                                    description: `선점 입찰가의 75% 값을 복사하였습니다.`,
                                                    color: "success"
                                                });
                                            } catch(err) {
                                                console.error(err);
                                            }
                                        }}>
                                        <Image 
                                            src="/icons/gold.png" 
                                            width={14} 
                                            height={14} 
                                            alt="goldicon"
                                            className="w-[16px] h-[16px]"/>
                                        <span>{formatGold(data.first75)}</span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
            {datas.length > 0 ? (
                <div className="w-full flex justify-center mt-2">
                    <Pagination
                        isCompact
                        showControls
                        color="primary"
                        page={page}
                        total={Math.ceil(datas.length / countByPage)}
                        onChange={setPage}/>
                </div>
            ) : <></>}
            <p className="mt-2 fadedtext text-sm">항목을 클릭하시면 클립보드에 복사됩니다.</p>
        </div>
    )
}