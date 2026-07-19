'use client'
import { addToast, Card, CardBody, CardHeader, Checkbox, NumberInput, Radio, RadioGroup } from "@heroui/react"
import Script from "next/script";
import { useEffect, useState } from "react";
import { formatGold, useClickPersons } from "../calcFeat";
import { useMobileQuery } from "@/utiils/utils";
import dynamic from "next/dynamic";
const LineAd = dynamic(() => import("@/app/ad/LineAd"), { ssr: false });
const FixedLineAd = dynamic(() => import("@/app/ad/FixedLineAd"), { ssr: false });
const BoxAd = dynamic(() => import("@/app/ad/BoxAd"), { ssr: false });

function CalcComponent() {
    const [person, setPerson] = useState(4);
    const [inputPerson, setInputPerson] = useState(10);
    const [type, setType] = useState('4');
    const [article, setArticle] = useState(0);
    const [gold, setGold] = useState(0);
    const [singleGold, setSingleGold] = useState(0);
    const [isDisableSingle, setDisableSingle] = useState(false);
    
    const onClickPersons = useClickPersons(inputPerson, setPerson, setType);

    useEffect(() => {
        if (type === 'custom') {
            setPerson(inputPerson);
        }
    }, [inputPerson]);

    useEffect(() => {
        setArticle(Math.floor(person/2));
    }, [person]);

    useEffect(() => {
        if (isDisableSingle) {
            setSingleGold(gold);
        }
    }, [gold, isDisableSingle])
    
    return (
        <div className="w-full">
            <section className="mb-5 overflow-hidden rounded-2xl border border-default-200/80 bg-gradient-to-br from-primary-50 via-content1 to-content1 px-5 py-5 shadow-sm dark:border-white/10 dark:from-primary-950/30 dark:via-[#18181b] dark:to-[#18181b] sm:px-6">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Bus Calculator</p>
                <h1 className="mt-1 text-2xl font-bold">버스 계산기</h1>
                <p className="mt-1 text-sm text-default-500">인원 구성과 버스비를 입력하면 거래 금액과 기사별 수령 골드를 한눈에 계산합니다.</p>
            </section>
            <section className="mb-4 rounded-2xl border border-default-200/80 bg-content1/95 p-4 shadow-sm dark:border-white/10 dark:bg-[#18181b] sm:p-5">
                <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
                    <div>
                        <h2 className="text-lg font-semibold">버스 조건</h2>
                        <p className="mt-0.5 text-xs text-default-500">인원과 가격을 변경하면 아래 계산 결과가 즉시 갱신됩니다.</p>
                    </div>
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">총 {person}명 기준</span>
                </div>
                <div className="grid w-full gap-3 lg:grid-cols-[1.35fr_0.9fr_0.9fr]">
                <div className="rounded-xl border border-default-200/70 bg-default-50/70 p-3.5 dark:border-white/10 dark:bg-white/[0.04]">
                    <p className="mb-2 text-sm font-semibold">인원 수</p>
                    <RadioGroup 
                        className="flex-nowrap gap-0"
                        orientation="horizontal" 
                        defaultValue="4" 
                        onValueChange={onClickPersons}>
                        <Radio className="shrink-0" value="4"><span className="px-1.5">4인</span></Radio>
                        <Radio className="shrink-0" value="8"><span className="px-1.5">8인</span></Radio>
                        <Radio className="shrink-0" value="16"><span className="px-1.5">16인</span></Radio>
                        <div className="flex shrink-0 items-center gap-1">
                            <Radio value="custom" />
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
                </div>
                <div className="rounded-xl border border-default-200/70 bg-default-50/70 p-3.5 dark:border-white/10 dark:bg-white/[0.04]">
                    <p className="mb-2 text-sm font-semibold">기사 인원 수</p>
                    <div className="grid w-full grid-cols-3 gap-2">
                        <NumberInput
                            maxLength={2}
                            value={article}
                            radius="sm"
                            size="sm"
                            label="기사 인원"
                            placeholder="0 ~ 99명"
                            onValueChange={setArticle}/>
                        <NumberInput
                            isReadOnly
                            maxLength={2}
                            value={person - article - 1 > 0 ? person - article - 1 : 0}
                            radius="sm"
                            size="sm"
                            isDisabled
                            label="미참 인원"
                            placeholder="0 ~ 99명"/>
                        <NumberInput
                            isReadOnly
                            maxLength={2}
                            value={person > 1 && person > article ? 1 : 0}
                            radius="sm"
                            size="sm"
                            isDisabled
                            label="독식 인원"
                            placeholder="0 ~ 99명"/>
                    </div>
                </div>
                <div className="rounded-xl border border-default-200/70 bg-default-50/70 p-3.5 dark:border-white/10 dark:bg-white/[0.04]">
                    <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                        <p className="text-sm font-semibold">버스비</p>
                        <Checkbox
                            size="sm"
                            isSelected={isDisableSingle}
                            onValueChange={setDisableSingle}>독식 없음 (올미참)</Checkbox>
                    </div>
                    <div className="grid w-full grid-cols-2 gap-2">
                        <NumberInput
                            maxLength={10}
                            value={gold}
                            radius="sm"
                            size="sm"
                            label="미참 가격"
                            placeholder="0 ~ 9999999999"
                            onValueChange={setGold}/>
                        <NumberInput
                            maxLength={10}
                            value={singleGold}
                            radius="sm"
                            size="sm"
                            label="독식 가격"
                            isDisabled={isDisableSingle}
                            placeholder="0 ~ 9999999999"
                            onValueChange={setSingleGold}/>
                    </div>
                </div>
                </div>
            </section>
            <div className="grid gap-4 xl:grid-cols-2">
                <Card radius="lg" shadow="none" className="overflow-hidden border border-default-200/80 bg-content1/95 shadow-sm dark:border-white/10 dark:bg-[#18181b]">
                    <CardHeader className="border-b border-default-200/70 bg-default-50/60 px-4 py-4 dark:border-white/10 dark:bg-white/[0.03] sm:px-5">
                        <div>
                            <h1 className="text-xl">독식만 입찰</h1>
                            <p className="fadedtext text-sm">기사당 손님의 수가 모든 기사가 일치할 경우 - 독식만 입찰</p>
                        </div>
                    </CardHeader>
                    <CardBody className="p-4 sm:p-5">
                        {(person - article) % article === 0 && person > article ? (
                            <div>
                                <p>기사 1명 당 {(person - article) / article}명 손님의 버스비를 받음.</p>
                                <h3 className="mt-4 text-lg">계산 결과</h3>
                                <div className="w-full grid sm:grid-cols-2 gap-2 mt-2">
                                    <Card 
                                        isPressable
                                        radius="lg"
                                        shadow="none"
                                        className="w-full border border-default-200/80 bg-content1 text-left transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:bg-primary-50/60 hover:shadow-md dark:border-white/10 dark:bg-white/[0.03] dark:hover:bg-primary-500/10"
                                        onClick={async () => {
                                            const value = Math.floor(person > 0 ? gold + (singleGold - gold) / person : 0);
                                            try {
                                                await navigator.clipboard.writeText(value.toString());
                                                addToast({
                                                    title: "복사 완료",
                                                    description: `미참 거래 가격을 복사하였습니다.`,
                                                    color: "success"
                                                });
                                            } catch(err) {
                                                console.error(err);
                                            }
                                        }}>
                                        <CardBody className="p-3">
                                            <div className="w-full flex items-center">
                                                <h3 className="fadedtext grow">미참 거래 금액</h3>
                                                <div className="flex gap-1 items-center">
                                                    <img 
                                                        src="/icons/gold.png" 
                                                        alt="goldicon"
                                                        className="w-[16px] h-[16px] "/>
                                                    <span>{formatGold(person > 0 ? gold + (singleGold - gold) / person : 0)}</span>
                                                </div>
                                            </div>
                                        </CardBody>
                                    </Card>
                                    <Card 
                                        isPressable
                                        radius="lg"
                                        shadow="none"
                                        className="w-full border border-default-200/80 bg-content1 text-left transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:bg-primary-50/60 hover:shadow-md dark:border-white/10 dark:bg-white/[0.03] dark:hover:bg-primary-500/10"
                                        onClick={async () => {
                                            const value = Math.floor((singleGold - gold) - ((singleGold - gold) / person));
                                            try {
                                                await navigator.clipboard.writeText(value.toString());
                                                addToast({
                                                    title: "복사 완료",
                                                    description: `독식 입찰 가격을 복사하였습니다.`,
                                                    color: "success"
                                                });
                                            } catch(err) {
                                                console.error(err);
                                            }
                                        }}>
                                        <CardBody className="p-3">
                                            <div className="w-full flex items-center">
                                                <h3 className="fadedtext grow">독식 입찰 금액</h3>
                                                <div className="flex gap-1 items-center">
                                                    <img 
                                                        src="/icons/gold.png" 
                                                        alt="goldicon"
                                                        className="w-[16px] h-[16px] "/>
                                                    <span>{formatGold((singleGold - gold) - ((singleGold - gold) / person))}</span>
                                                </div>
                                            </div>
                                        </CardBody>
                                    </Card>
                                </div>
                                <div className="mt-3 flex items-center gap-1 rounded-xl bg-warning-50/70 px-3 py-2 text-sm dark:bg-warning-500/10">
                                    <p>기사는 총</p>
                                    <div className="flex items-center gap-1">
                                        <img 
                                            src="/icons/gold.png" 
                                            alt="goldicon"
                                            className="w-[16px] h-[16px]"/>
                                        <p><strong className="text-yellow-700 dark:text-yellow-400">{formatGold((person > 1 ? (gold + (singleGold - gold) / person) * 0.95 * ((person - article) / article) + (singleGold - gold) / person : 0))}</strong></p>
                                    </div>
                                    <p>골드를 수령합니다.</p>
                                </div>
                                <h3 className="mt-4 text-lg">미참 거래 금액</h3>
                                <p className="fadedtext">미참가격 + (독식가격 - 미참가격) / 인원수</p>
                                <p className="text-green-700 dark:text-green-400">{gold} + ({singleGold} - {gold}) / {person}</p>
                                <h3 className="mt-2 text-lg">독식 입찰 금액</h3>
                                <p className="fadedtext">(독식가격 - 미참가격) - (독식가격 - 미참가격) / 인원수</p>
                                <p className="text-green-700 dark:text-green-400">({singleGold} - {gold}) - ({singleGold} - {gold}) / {person}</p>
                            </div>
                        ) : (
                            <div className="w-full min-h-[300px] h-full flex flex-col gap-2 justify-center items-center">
                                <p className="text-red-400 dark:text-red-700 text-center">기사 1명당 손님의 수가 모든 기사가 일치해야만 합니다. (1:N)</p>
                                <p className="fadedtext text-sm text-center">ex) 기사 4명 손님 4명 : (1:1), 기사 2명 손님 6명 : (1:3)</p>
                            </div>
                        )}
                    </CardBody>
                </Card>
                <Card radius="lg" shadow="none" className="overflow-hidden border border-default-200/80 bg-content1/95 shadow-sm dark:border-white/10 dark:bg-[#18181b]">
                    <CardHeader className="border-b border-default-200/70 bg-default-50/60 px-4 py-4 dark:border-white/10 dark:bg-white/[0.03] sm:px-5">
                        <div>
                            <h1 className="text-xl">기사 수와 손님 수 비율이 다를 경우</h1>
                            <p className="fadedtext text-sm">기사 1명당 손님수 비율이 다를 경우</p>
                        </div>
                    </CardHeader>
                    <CardBody className="p-4 sm:p-5">
                        <p>기사 1명당 손님의 수가 기사마다 다를 경우에 포함됩니다.</p>
                        <p>기사들이 1수 또는 N수씩 거래를 한 후 공대장이 나머지 손님에게 골드를 받고 입찰로 재분배하는 방법입니다.</p>
                        <p className="mt-2">기사 1명당 {Math.floor((person - article) / article)}명의 손님과 거래 후, 공대장이 나머지 {(person - article) % article}명의 손님에게 골드를 받고 입찰로 재분배</p>
                        <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
                            <Card 
                                isPressable
                                radius="lg"
                                shadow="none"
                                className="w-full border border-default-200/80 bg-content1 text-left transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:bg-primary-50/60 hover:shadow-md dark:border-white/10 dark:bg-white/[0.03] dark:hover:bg-primary-500/10"
                                onClick={async () => {
                                    const value = Math.floor(person > 1 ? gold + (singleGold - gold) / person + (gold + ((singleGold - gold) - ((singleGold - gold) / person)) / (person - 1)) * ((person - article) % article) * 0.95 / person / (1 - ((person - article) % article) * 0.95 / person) : 0);
                                    try {
                                        await navigator.clipboard.writeText(value.toString());
                                        addToast({
                                            title: "복사 완료",
                                            description: `미참 거래 가격을 복사하였습니다.`,
                                            color: "success"
                                        });
                                    } catch(err) {
                                        console.error(err);
                                    }
                                }}>
                                <CardBody className="p-3">
                                    <h3 className="fadedtext text-sm">미참 거래 금액</h3>
                                    <div className="flex gap-1 items-center">
                                        <img 
                                            src="/icons/gold.png" 
                                            alt="goldicon"
                                            className="w-[16px] h-[16px]"/>
                                        <span>{formatGold(person > 1 ? gold + (singleGold - gold) / person + (gold + ((singleGold - gold) - ((singleGold - gold) / person)) / (person - 1)) * ((person - article) % article) * 0.95 / person / (1 - ((person - article) % article) * 0.95 / person) : 0)}</span>
                                    </div>
                                </CardBody>
                            </Card>
                            <Card 
                                isPressable
                                radius="lg"
                                shadow="none"
                                className="w-full border border-default-200/80 bg-content1 text-left transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:bg-primary-50/60 hover:shadow-md dark:border-white/10 dark:bg-white/[0.03] dark:hover:bg-primary-500/10"
                                onClick={async () => {
                                    const value = Math.floor((singleGold - gold) - ((singleGold - gold) / person));
                                    try {
                                        await navigator.clipboard.writeText(value.toString());
                                        addToast({
                                            title: "복사 완료",
                                            description: `독식 입찰 가격을 복사하였습니다.`,
                                            color: "success"
                                        });
                                    } catch(err) {
                                        console.error(err);
                                    }
                                }}>
                                <CardBody className="p-3">
                                    <h3 className="fadedtext text-sm">독식 입찰 금액</h3>
                                    <div className="flex gap-1 items-center">
                                        <img
                                            src="/icons/gold.png" 
                                            alt="goldicon"
                                            className="w-[16px] h-[16px]"/>
                                        <span>{formatGold((singleGold - gold) - ((singleGold - gold) / person))}</span>
                                    </div>
                                </CardBody>
                            </Card>
                            <Card 
                                isPressable
                                radius="lg"
                                shadow="none"
                                className="w-full border border-default-200/80 bg-content1 text-left transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:bg-primary-50/60 hover:shadow-md dark:border-white/10 dark:bg-white/[0.03] dark:hover:bg-primary-500/10"
                                onClick={async () => {
                                    const value = Math.floor(person > 1 ? (gold + ((singleGold - gold) - ((singleGold - gold) / person)) / (person - 1)) * ((person - article) % article) * 0.95 / person / (1 - ((person - article) % article) * 0.95 / person) * (person - 1) : 0);
                                    try {
                                        await navigator.clipboard.writeText(value.toString());
                                        addToast({
                                            title: "복사 완료",
                                            description: `공대장 입찰 금액을 복사하였습니다.`,
                                            color: "success"
                                        });
                                    } catch(err) {
                                        console.error(err);
                                    }
                                }}>
                                <CardBody className="p-3">
                                    <h3 className="fadedtext text-sm">공대장 입찰 금액</h3>
                                    <div className="flex gap-1 items-center">
                                        <img
                                            src="/icons/gold.png"
                                            alt="goldicon"
                                            className="w-[16px] h-[16px]"/>
                                        <span>{formatGold(person > 1 ? (gold + ((singleGold - gold) - ((singleGold - gold) / person)) / (person - 1)) * ((person - article) % article) * 0.95 / person / (1 - ((person - article) % article) * 0.95 / person) * (person - 1) : 0)}</span>
                                    </div>
                                </CardBody>
                            </Card>
                            <Card 
                                isPressable
                                radius="lg"
                                shadow="none"
                                className="w-full border border-default-200/80 bg-content1 text-left transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:bg-primary-50/60 hover:shadow-md dark:border-white/10 dark:bg-white/[0.03] dark:hover:bg-primary-500/10"
                                onClick={async () => {
                                    const value = Math.floor(person > 1 ? (gold + ((singleGold - gold) - ((singleGold - gold) / person)) / (person - 1)) * ((person - article) % article) * 0.95 / person / (1 - ((person - article) % article) * 0.95 / person) : 0);
                                    try {
                                        await navigator.clipboard.writeText(value.toString());
                                        addToast({
                                            title: "복사 완료",
                                            description: `분배금을 복사하였습니다.`,
                                            color: "success"
                                        });
                                    } catch(err) {
                                        console.error(err);
                                    }
                                }}>
                                <CardBody className="p-3">
                                    <h3 className="fadedtext text-sm">분배금</h3>
                                    <div className="flex gap-1 items-center">
                                        <img
                                            src="/icons/gold.png" 
                                            alt="goldicon"
                                            className="w-[16px] h-[16px]"/>
                                        <span>{formatGold(person > 1 ? (gold + ((singleGold - gold) - ((singleGold - gold) / person)) / (person - 1)) * ((person - article) % article) * 0.95 / person / (1 - ((person - article) % article) * 0.95 / person) : 0)}</span>
                                    </div>
                                </CardBody>
                            </Card>
                        </div>
                        <div className="mt-3 flex items-center gap-1 rounded-xl bg-warning-50/70 px-3 py-2 text-sm dark:bg-warning-500/10">
                            <p>기사는 총</p>
                            <div className="flex items-center gap-1">
                                <img
                                    src="/icons/gold.png" 
                                    alt="goldicon"
                                    className="w-[16px] h-[16px]"/>
                                <p><strong className="text-yellow-700 dark:text-yellow-400">{formatGold((person > 1 ? gold + (singleGold - gold) / person + (gold + ((singleGold - gold) - ((singleGold - gold) / person)) / (person - 1)) * ((person - article) % article) * 0.95 / person / (1 - ((person - article) % article) * 0.95 / person) : 0) * 0.95 * (Math.floor((person - article) / article)) + (person > 1 ? (gold + ((singleGold - gold) - ((singleGold - gold) / person)) / (person - 1)) * ((person - article) % article) * 0.95 / person / (1 - ((person - article) % article) * 0.95 / person) : 0))}</strong></p>
                            </div>
                            <p>골드를 수령합니다.</p>
                        </div>
                        <h3 className="mt-4 text-lg">분배금</h3>
                        <p className="fadedtext">(미참가격 + 독식입찰 분배금) * 나머지 손님 - 0.95 / 인원수 / (1 - 나머지 손님 * 0.95 / 인원수)</p>
                        <p className="text-green-700 dark:text-green-400">({gold} + {((singleGold - gold) - ((singleGold - gold) / person)) / (person - 1)}) * {(person - article) % article} * 0.95 / {person} / (1 - {(person - article) % article} * 0.95 / {person})</p>
                        <h3 className="mt-2 text-lg">미참 거래 금액</h3>
                        <p className="fadedtext">미참가격 + (독식가격 - 미참가격) / 인원수 + 분배금</p>
                        <p className="text-green-700 dark:text-green-400">{gold} + ({singleGold} - {gold}) / {person} + {person > 1 ? Math.floor((gold + ((singleGold - gold) - ((singleGold - gold) / person)) / (person - 1)) * ((person - article) % article) * 0.95 / person / (1 - ((person - article) % article) * 0.95 / person)) : 0}</p>
                        <h3 className="mt-2 text-lg">독식 입찰 금액</h3>
                        <p className="fadedtext">(독식가격 - 미참가격) - (독식가격 - 미참가격) / 인원수</p>
                        <p className="text-green-700 dark:text-green-400">({singleGold} - {gold}) - ({singleGold} - {gold}) / {person}</p>
                        <h3 className="mt-2 text-lg">공대장 입찰 금액</h3>
                        <p className="fadedtext">분배금 * (인원수 - 1)</p>
                        <p className="text-green-700 dark:text-green-400">{person > 1 ? Math.floor((gold + ((singleGold - gold) - ((singleGold - gold) / person)) / (person - 1)) * ((person - article) % article) * 0.95 / person / (1 - ((person - article) % article) * 0.95 / person)) : 0} * ({person} - 1)</p>
                        <p className="fadedtext text-sm mt-2"><strong>나머지 손님</strong>은 기사와 손님의 거래를 1:1 또는 1:N으로 거래한 후 남은 인원을 뜻합니다.</p>
                    </CardBody>
                </Card>
            </div>
            <p className="mt-3 rounded-xl border border-primary-200/60 bg-primary-50/60 px-4 py-3 text-center text-sm text-primary-700 dark:border-primary-800/40 dark:bg-primary-500/10 dark:text-primary-300">금액 카드를 클릭하면 해당 금액이 클립보드에 복사됩니다.</p>
        </div>
    )
}

function RelicComponent() {
    const [gold, setGold] = useState(0);
    const [person, setPerson] = useState(0);

    return (
        <section className="w-full rounded-2xl border border-default-200/80 bg-content1/95 p-4 shadow-sm dark:border-white/10 dark:bg-[#18181b] sm:p-5">
                    <div className="grid w-full items-start gap-4 sm:grid-cols-4">
                        <div>
                            <h1 className="text-xl">입찰 아이템 분배</h1>
                            <p className="fadedtext text-sm">유물 각인서 등 값비싼 경매 아이템을 분배할 경우</p>
                        </div>
                        <NumberInput
                            maxLength={2}
                            value={person}
                            radius="sm"
                            label="기사 인원 수"
                            placeholder="0 ~ 99"
                            onValueChange={setPerson}/>
                        <NumberInput
                            maxLength={10}
                            value={gold}
                            radius="sm"
                            label="경매 아이템 가격"
                            placeholder="0 ~ 9999999999"
                            onValueChange={setGold}/>
                        <Card 
                            isPressable
                            radius="lg"
                            shadow="none"
                            className="w-full border border-primary-200/70 bg-primary-50/60 text-left transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md dark:border-primary-800/40 dark:bg-primary-500/10"
                            onClick={async () => {
                                const value = Math.floor(person > 0 ? gold * 0.95 / (person - 0.05) : 0);
                                try {
                                    await navigator.clipboard.writeText(value.toString());
                                    addToast({
                                        title: "복사 완료",
                                        description: `분배 금액을 복사하였습니다.`,
                                        color: "success"
                                    });
                                } catch(err) {
                                    console.error(err);
                                }
                            }}>
                            <CardBody className="p-3">
                                <h3 className="fadedtext text-sm">분배 금액</h3>
                                <div className="flex gap-1 items-center">
                                    <img 
                                        src="/icons/gold.png" 
                                        alt="goldicon"
                                        className="w-[16px] h-[16px]"/>
                                    <span>{formatGold(person > 0 ? gold * 0.95 / (person - 0.05) : 0)}</span>
                                </div>
                            </CardBody>
                        </Card>
                    </div>
            <div className="mt-4 flex items-center gap-1 rounded-xl bg-warning-50/70 px-3 py-2 text-sm dark:bg-warning-500/10">
                <p>기사는 총</p>
                <div className="flex items-center gap-1">
                    <img
                        src="/icons/gold.png" 
                        alt="goldicon"
                        className="w-[16px] h-[16px]"/>
                    <p><strong className="text-yellow-700 dark:text-yellow-400">{formatGold(person > 0 ? gold * 0.95 / (person - 0.05) * 0.95 : 0)}</strong></p>
                </div>
                <p>골드를 수령합니다.</p>
            </div>
            <div className="mt-4 rounded-xl bg-default-50 p-3 dark:bg-white/[0.04]">
                <h3 className="text-sm font-semibold">분배 금액 계산식</h3>
                <p className="mt-1 text-xs text-default-500">경매 아이템 가격 * 0.95 / (기사 인원 수 - 0.05)</p>
                <p className="mt-2 break-all font-mono text-sm text-success-700 dark:text-success-400">{gold} * 0.95 / ({person} - 0.05)</p>
            </div>
        </section>
    )
}

export default function BusClient() {
    const isMobile = useMobileQuery();
    return (
        <div className="w-full">
            <CalcComponent/>
            {isMobile ? (
                <div className="w-full flex justify-center px-4 overflow-hidden mt-8 mb-8">
                    <div className="w-full max-w-[970px] min-h-[60px] max-h-[80px]">
                        <LineAd isLoaded={true}/>
                    </div>
                </div>
            ) : (
                <div className="w-full flex justify-center mt-8 overflow-hidden mb-8">
                    <div className="mx-4 flex w-full max-w-[1240px] justify-center rounded-2xl border border-default-200/70 bg-default-50 p-4 dark:border-white/10 dark:bg-white/[0.04]">
                        <FixedLineAd isLoaded={true}/>
                    </div>
                </div>
            )}
            <RelicComponent/>
            <p className="mt-3 rounded-xl border border-warning-200/70 bg-warning-50/60 px-4 py-3 text-sm text-warning-800 dark:border-warning-800/40 dark:bg-warning-500/10 dark:text-warning-300">위 계산은 최초 입찰 금액(50골드)과 신뢰도로 인한 수수료를 제외한 결과입니다.</p>
            {isMobile ? (
                <div className="w-full flex justify-center px-4">
                    <div className="w-full max-w-[360px] min-h-[100px] mt-4">
                        <BoxAd isLoaded={true}/>
                    </div>
                </div>
            ) : (
                <div className="w-full flex justify-center px-4 overflow-hidden mt-8">
                    <div className="flex w-full max-w-[1240px] justify-center rounded-2xl border border-default-200/70 bg-default-50 p-8 dark:border-white/10 dark:bg-white/[0.04]">
                        <div className="w-full max-w-[970px] min-h-[60px] max-h-[80px]">
                            <LineAd isLoaded={true}/>
                        </div>
                    </div>
                </div>
            )}
            <Script
                async
                src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1236449818258742"
                crossOrigin="anonymous"/>
        </div>
    )
}
