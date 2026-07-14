'use client'
import { 
    addToast,
    Button,
    Card,
    CardBody,
    CardHeader,
    Divider,
    NumberInput, 
    Pagination, 
    Radio, RadioGroup, 
    Table, TableBody, TableCell, TableColumn, TableHeader, TableRow 
} from "@heroui/react";
import dynamic from "next/dynamic";
import Script from "next/script";
import { useEffect, useState } from "react"
import { CalData, formatGold, getBreakpointGold, loadData, useClickPersons, useClickResetDatas, useClickSaveData } from "./calcFeat";
import { useMobileQuery } from "@/utiils/utils";
const LineAd = dynamic(() => import('../ad/LineAd'), { ssr: false });
const FixedLineAd = dynamic(() => import('../ad/FixedLineAd'), { ssr: false });

export default function CalcClient() {
    const [gold, setGold] = useState(0);
    const [inputPerson, setInputPerson] = useState(10);
    const [person, setPerson] = useState(4);
    const [type, setType] = useState('4');
    const [datas, setDatas] = useState<CalData[]>([]);
    const [page, setPage] = useState(1);
    const countByPage = 20;
    const isMobile = useMobileQuery();

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
            <section className="mb-5 overflow-hidden rounded-2xl border border-default-200/80 bg-gradient-to-br from-primary-50 via-content1 to-content1 px-5 py-5 shadow-sm dark:border-white/10 dark:from-primary-950/30 dark:via-[#18181b] dark:to-[#18181b] sm:px-6">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Auction Calculator</p>
                <h1 className="mt-1 text-2xl font-bold">경매 계산기</h1>
                <p className="mt-1 text-sm text-default-500">아이템 가격과 참여 인원을 입력하면 안전한 입찰 기준과 예상 분배금을 계산합니다.</p>
            </section>
            <div className="grid w-full gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
                <section className="rounded-2xl border border-default-200/80 bg-content1/95 p-4 shadow-sm dark:border-white/10 dark:bg-[#18181b]">
                    <div className="mb-3">
                        <h2 className="text-lg font-semibold">입찰 조건</h2>
                        <p className="text-xs text-default-500">가격과 인원을 선택하면 아래 결과가 즉시 갱신됩니다.</p>
                    </div>
                    <div className="flex w-full items-end gap-2">
                        <NumberInput
                            fullWidth
                            maxValue={999999999}
                            value={gold}
                            onValueChange={setGold}
                            labelPlacement="outside"
                            label="경매 아이템 가격"
                            placeholder="아이템 가격을 입력해주세요."
                            radius="lg"
                            className="grow"/>
                        <Button
                            color="primary"
                            radius="lg"
                            className="h-10 px-5 font-semibold"
                            isDisabled={gold <= 0 || isNaN(gold)}
                            onPress={onClickSaveData}>
                            저장
                        </Button>
                    </div>
                    <div className="mt-3 rounded-xl bg-default-50 p-2.5 dark:bg-white/[0.04]">
                        <p className="mb-2 text-xs font-medium text-default-500">참여 인원</p>
                    <RadioGroup 
                        orientation="horizontal" 
                        defaultValue="4" 
                        className="mb-0"
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
                                radius="md"
                                size="sm"
                                onValueChange={setInputPerson}
                                className="w-[80px]"/>
                            <span>인</span>
                        </div>
                    </RadioGroup>
                    </div>
                    <div className="mb-2 mt-4 flex items-center justify-between gap-2">
                        <div>
                            <h2 className="text-lg font-semibold">계산 결과</h2>
                            <p className="text-xs text-default-500">원하는 행을 누르면 입찰가가 복사됩니다.</p>
                        </div>
                        <span className="rounded-full bg-default-100 px-2.5 py-1 text-xs font-medium text-default-500">{person}인 기준</span>
                    </div>
                    <Table 
                        aria-label="item calc table"
                        selectionMode="single"
                        classNames={{
                            wrapper: "border border-default-200/70 bg-content1 p-0 shadow-none dark:border-white/10 dark:bg-transparent",
                            th: "bg-default-100 text-xs font-semibold text-default-500 dark:bg-white/[0.05]",
                            td: "py-2 text-sm",
                            tr: "transition-colors hover:bg-primary-50/70 dark:hover:bg-primary-500/10"
                        }}>
                        <TableHeader>
                            <TableColumn>구분</TableColumn>
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
                                        <img
                                            src="/icons/gold.png" 
                                            alt="goldicon"
                                            className="w-[16px] h-[16px] hidden sm:flex"/>
                                        <span>{formatGold(gold * (person - 1) / person)}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex gap-1 items-center">
                                        <img 
                                            src="/icons/gold.png" 
                                            alt="goldicon"
                                            className="w-[16px] h-[16px] hidden sm:flex"/>
                                        <span>{formatGold(gold - (gold * (person - 1) / person))}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex gap-1 items-center">
                                        <img 
                                            src="/icons/gold.png" 
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
                                        <img 
                                            src="/icons/gold.png" 
                                            alt="goldicon"
                                            className="w-[16px] h-[16px] hidden sm:flex"/>
                                        <span>{formatGold(getBreakpointGold(gold, person))}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex gap-1 items-center">
                                        <img 
                                            src="/icons/gold.png" 
                                            alt="goldicon"
                                            className="w-[16px] h-[16px] hidden sm:flex"/>
                                        <span>0</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex gap-1 items-center">
                                        <img 
                                            src="/icons/gold.png" 
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
                                        <img 
                                            src="/icons/gold.png" 
                                            alt="goldicon"
                                            className="w-[16px] h-[16px] hidden sm:flex"/>
                                        <span>{formatGold(getBreakpointGold(gold, person) / 1.1)}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex gap-1 items-center">
                                        <img 
                                            src="/icons/gold.png" 
                                            alt="goldicon"
                                            className="w-[16px] h-[16px] hidden sm:flex"/>
                                        <span>{formatGold(getBreakpointGold(gold, person) - (getBreakpointGold(gold, person) / 1.1))}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex gap-1 items-center">
                                        <img 
                                            src="/icons/gold.png" 
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
                                        <img 
                                            src="/icons/gold.png" 
                                            alt="goldicon"
                                            className="w-[16px] h-[16px] hidden sm:flex"/>
                                        <span>{formatGold(getBreakpointGold(gold, person) / 1.025)}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex gap-1 items-center">
                                        <img 
                                            src="/icons/gold.png" 
                                            alt="goldicon"
                                            className="w-[16px] h-[16px] hidden sm:flex"/>
                                        <span>{formatGold(getBreakpointGold(gold, person) - (getBreakpointGold(gold, person) / 1.025))}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex gap-1 items-center">
                                        <img 
                                            src="/icons/gold.png" 
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
                                        <img 
                                            src="/icons/gold.png" 
                                            alt="goldicon"
                                            className="w-[16px] h-[16px] hidden sm:flex"/>
                                        <span>{formatGold(getBreakpointGold(gold, person) / 1.05)}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex gap-1 items-center">
                                        <img 
                                            src="/icons/gold.png" 
                                            alt="goldicon"
                                            className="w-[16px] h-[16px] hidden sm:flex"/>
                                        <span>{formatGold(getBreakpointGold(gold, person) - (getBreakpointGold(gold, person) / 1.05))}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex gap-1 items-center">
                                        <img 
                                            src="/icons/gold.png" 
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
                                        <img 
                                            src="/icons/gold.png" 
                                            alt="goldicon"
                                            className="w-[16px] h-[16px] hidden sm:flex"/>
                                        <span>{formatGold(getBreakpointGold(gold, person) / 1.075)}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex gap-1 items-center">
                                        <img 
                                            src="/icons/gold.png" 
                                            alt="goldicon"
                                            className="w-[16px] h-[16px] hidden sm:flex"/>
                                        <span>{formatGold(getBreakpointGold(gold, person) - (getBreakpointGold(gold, person) / 1.075))}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex gap-1 items-center">
                                        <img 
                                            src="/icons/gold.png" 
                                            alt="goldicon"
                                            className="w-[16px] h-[16px] hidden sm:flex"/>
                                        <span>{formatGold((getBreakpointGold(gold, person) / 1.075) / (person - 1))}</span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </section>
                <Card radius="lg" className="h-[max-content] border border-default-200/80 bg-content1/95 shadow-sm dark:border-white/10 dark:bg-[#18181b]">
                    <CardHeader className="px-5 py-4">
                        <div>
                            <h2 className="text-lg font-semibold">계산 기준</h2>
                            <p className="text-xs text-default-500">각 입찰가가 계산되는 방식을 확인하세요.</p>
                        </div>
                    </CardHeader>
                    <Divider/>
                    <CardBody className="space-y-2 px-5 py-4">
                        <div className="w-full">
                            <h3 className="text-sm font-semibold">직접 이용 시</h3>
                            <div className="mt-1 rounded-lg bg-default-50 px-3 py-2 text-xs dark:bg-white/[0.04]">
                                <p>경매가 × (인원수 - 1) × 인원수<span className="hidden sm:inline"> :</span></p>
                                <p className="text-green-700 dark:text-green-400">{gold.toLocaleString()} × ({person} - 1) × {person}</p>
                            </div>
                            <h3 className="mt-3 text-sm font-semibold">순익 분기점</h3>
                            <div className="mt-1 rounded-lg bg-default-50 px-3 py-2 text-xs dark:bg-white/[0.04]">
                                <p>경매가 × 0.95 × (인원수 - 1) × 인원수<span className="hidden sm:inline"> :</span></p>
                                <p className="text-green-700 dark:text-green-400">{gold.toLocaleString()} * 0.95 × ({person} - 1) × {person}</p>
                            </div>
                            <h3 className="mt-3 text-sm font-semibold">선점 입찰가</h3>
                            <div className="mt-1 rounded-lg bg-default-50 px-3 py-2 text-xs dark:bg-white/[0.04]">
                                <p>순익 분기점 ÷ 1.1<span className="hidden sm:inline"> :</span></p>
                                <p className="text-green-700 dark:text-green-400">{getBreakpointGold(gold, person).toLocaleString()} ÷ 1.1</p>
                            </div>
                            <h3 className="mt-3 text-sm font-semibold">선점 25%</h3>
                            <div className="mt-1 rounded-lg bg-default-50 px-3 py-2 text-xs dark:bg-white/[0.04]">
                                <p>순익 분기점 ÷ 1.025<span className="hidden sm:inline"> :</span></p>
                                <p className="text-green-700 dark:text-green-400">{getBreakpointGold(gold, person).toLocaleString()} ÷ 1.025</p>
                            </div>
                            <h3 className="mt-3 text-sm font-semibold">선점 50%</h3>
                            <div className="mt-1 rounded-lg bg-default-50 px-3 py-2 text-xs dark:bg-white/[0.04]">
                                <p>순익 분기점 ÷ 1.05<span className="hidden sm:inline"> :</span></p>
                                <p className="text-green-700 dark:text-green-400">{getBreakpointGold(gold, person).toLocaleString()} ÷ 1.05</p>
                            </div>
                            <h3 className="mt-3 text-sm font-semibold">선점 75%</h3>
                            <div className="mt-1 rounded-lg bg-default-50 px-3 py-2 text-xs dark:bg-white/[0.04]">
                                <p>순익 분기점 ÷ 1.075<span className="hidden sm:inline"> :</span></p>
                                <p className="text-green-700 dark:text-green-400">{getBreakpointGold(gold, person).toLocaleString()} ÷ 1.075</p>
                            </div>
                        </div>
                    </CardBody>
                </Card>
            </div>
            {isMobile ? (
                <div className="w-full flex justify-center px-4 overflow-hidden mt-4">
                    <div className="w-full max-w-[970px] min-h-[60px] max-h-[80px]">
                        <LineAd isLoaded={true}/>
                    </div>
                </div>
            ) : (
                <div className="w-full flex justify-center mt-4 overflow-hidden">
                    <div className="w-full max-w-[1240px] flex justify-center rounded-2xl bg-[#eeeeee] dark:bg-[#222222] p-4 mx-4">
                        <FixedLineAd isLoaded={true}/>
                    </div>
                </div>
            )}
            <section className="mt-8 rounded-2xl border border-default-200/80 bg-content1/95 p-4 shadow-sm dark:border-white/10 dark:bg-[#18181b] sm:p-5">
            <div className="flex items-center gap-2">
                <div className="flex flex-row gap-3 items-end grow">
                    <div>
                        <p className="text-xl font-semibold">저장 기록</p>
                        <p className="text-xs text-default-500">자주 확인하는 경매 계산 결과를 다시 확인할 수 있습니다.</p>
                    </div>
                    <span className="rounded-full bg-default-100 px-2.5 py-1 text-xs text-default-500">{datas.length}개</span>
                </div>
                <Button
                    color="danger"
                    radius="lg"
                    variant="flat"
                    onPress={onClickResetDatas}>
                    데이터 초기화
                </Button>
            </div>
            <div className="w-full overflow-x-auto scrollbar-hide">
                <Table 
                    removeWrapper 
                    aria-label="table datas" 
                    className="mt-4 w-[1000px] min-[1001px]:w-full"
                    classNames={{
                        th: "bg-default-100 text-xs font-semibold text-default-500 dark:bg-white/[0.05]",
                        td: "py-2.5 text-sm",
                        tr: "transition-colors hover:bg-default-50 dark:hover:bg-white/[0.04]"
                    }}>
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
                                        <img 
                                            src="/icons/gold.png" 
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
                                        <img 
                                            src="/icons/gold.png" 
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
                                        <img 
                                            src="/icons/gold.png" 
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
                                        <img 
                                            src="/icons/gold.png" 
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
                                        <img 
                                            src="/icons/gold.png" 
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
                                        <img 
                                            src="/icons/gold.png"  
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
                                        <img 
                                            src="/icons/gold.png" 
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
            <p className="mt-3 text-xs text-default-500">항목을 클릭하면 해당 값이 클립보드에 복사됩니다.</p>
            </section>
            <Script
                async
                src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1236449818258742"
                crossOrigin="anonymous"/>
        </div>
    )
}
