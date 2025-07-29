'use client'
import { addToast, Card, CardBody, CardHeader, Checkbox, Divider, NumberInput, Radio, RadioGroup } from "@heroui/react"
import { useEffect, useState } from "react";
import { formatGold, useClickPersons } from "../calcFeat";
import Image from "next/image";

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
            <div className="w-full grid sm:grid-cols-3 gap-4 mb-4">
                <div>
                    <p className="text-xl">인원 수</p>
                    <RadioGroup 
                        orientation="horizontal" 
                        defaultValue="4" 
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
                </div>
                <div>
                    <p className="text-xl mb-2">기사 인원 수</p>
                    <div className="w-full grid sm:grid-cols-3 gap-4">
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
                <div>
                    <div className="flex gap-2 items-center mb-2">
                        <p className="text-xl">버스비</p>
                        <Checkbox
                            size="sm"
                            isSelected={isDisableSingle}
                            onValueChange={setDisableSingle}>독식 없음 (올미참)</Checkbox>
                    </div>
                    <div className="w-full grid sm:grid-cols-2 gap-4">
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
            <div className="grid sm:grid-cols-2 gap-4">
                <Card radius="sm"> 
                    <CardHeader>
                        <div>
                            <h1 className="text-xl">독식만 입찰</h1>
                            <p className="fadedtext text-sm">기사당 손님의 수가 모든 기사가 일치할 경우 - 독식만 입찰</p>
                        </div>
                    </CardHeader>
                    <Divider/>
                    <CardBody>
                        {(person - article) % article === 0 && person > article ? (
                            <div>
                                <p>기사 1명 당 {(person - article) / article}명 손님의 버스비를 받음.</p>
                                <h3 className="mt-4 text-lg">계산 결과</h3>
                                <div className="w-full grid sm:grid-cols-2 gap-2 mt-2">
                                    <Card 
                                        isPressable
                                        radius="sm" 
                                        shadow="sm" 
                                        className="w-full"
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
                                        <CardBody>
                                            <div className="w-full flex items-center">
                                                <h3 className="fadedtext grow">미참 거래 금액</h3>
                                                <div className="flex gap-1 items-center">
                                                    <Image 
                                                        src="/icons/gold.png" 
                                                        width={14} 
                                                        height={14} 
                                                        alt="goldicon"
                                                        className="w-[16px] h-[16px] "/>
                                                    <span>{formatGold(person > 0 ? gold + (singleGold - gold) / person : 0)}</span>
                                                </div>
                                            </div>
                                        </CardBody>
                                    </Card>
                                    <Card 
                                        isPressable
                                        radius="sm" 
                                        shadow="sm" 
                                        className="w-full"
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
                                        <CardBody>
                                            <div className="w-full flex items-center">
                                                <h3 className="fadedtext grow">독식 입찰 금액</h3>
                                                <div className="flex gap-1 items-center">
                                                    <Image 
                                                        src="/icons/gold.png" 
                                                        width={14} 
                                                        height={14} 
                                                        alt="goldicon"
                                                        className="w-[16px] h-[16px] "/>
                                                    <span>{formatGold((singleGold - gold) - ((singleGold - gold) / person))}</span>
                                                </div>
                                            </div>
                                        </CardBody>
                                    </Card>
                                </div>
                                <div className="mt-2 flex items-center gap-1">
                                    <p>기사는 총</p>
                                    <div className="flex items-center gap-1">
                                        <Image 
                                            src="/icons/gold.png" 
                                            width={14} 
                                            height={14} 
                                            alt="goldicon"
                                            className="w-[16px] h-[16px] "/>
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
                <Card radius="sm"> 
                    <CardHeader>
                        <div>
                            <h1 className="text-xl">기사 수와 손님 수 비율이 다를 경우</h1>
                            <p className="fadedtext text-sm">기사 1명당 손님수 비율이 다를 경우</p>
                        </div>
                    </CardHeader>
                    <Divider/>
                    <CardBody>
                        <p>기사 1명당 손님의 수가 기사마다 다를 경우에 포함됩니다.</p>
                        <p>기사들이 1수 또는 N수씩 거래를 한 후 공대장이 나머지 손님에게 골드를 받고 입찰로 재분배하는 방법입니다.</p>
                        <p className="mt-2">기사 1명당 {Math.floor((person - article) / article)}명의 손님과 거래 후, 공대장이 나머지 {(person - article) % article}명의 손님에게 골드를 받고 입찰로 재분배</p>
                        <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
                            <Card 
                                isPressable
                                radius="sm" 
                                shadow="sm" 
                                className="w-full"
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
                                <CardBody className="py-1.5">
                                    <h3 className="fadedtext text-sm">미참 거래 금액</h3>
                                    <div className="flex gap-1 items-center">
                                        <Image 
                                            src="/icons/gold.png" 
                                            width={14} 
                                            height={14} 
                                            alt="goldicon"
                                            className="w-[16px] h-[16px] "/>
                                        <span>{formatGold(person > 1 ? gold + (singleGold - gold) / person + (gold + ((singleGold - gold) - ((singleGold - gold) / person)) / (person - 1)) * ((person - article) % article) * 0.95 / person / (1 - ((person - article) % article) * 0.95 / person) : 0)}</span>
                                    </div>
                                </CardBody>
                            </Card>
                            <Card 
                                isPressable
                                radius="sm" 
                                shadow="sm" 
                                className="w-full"
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
                                <CardBody className="py-1.5">
                                    <h3 className="fadedtext text-sm">독식 입찰 금액</h3>
                                    <div className="flex gap-1 items-center">
                                        <Image 
                                            src="/icons/gold.png" 
                                            width={14} 
                                            height={14} 
                                            alt="goldicon"
                                            className="w-[16px] h-[16px] "/>
                                        <span>{formatGold((singleGold - gold) - ((singleGold - gold) / person))}</span>
                                    </div>
                                </CardBody>
                            </Card>
                            <Card 
                                isPressable
                                radius="sm" 
                                shadow="sm" 
                                className="w-full"
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
                                <CardBody className="py-1.5">
                                    <h3 className="fadedtext text-sm">공대장 입찰 금액</h3>
                                    <div className="flex gap-1 items-center">
                                        <Image 
                                            src="/icons/gold.png" 
                                            width={14} 
                                            height={14} 
                                            alt="goldicon"
                                            className="w-[16px] h-[16px] "/>
                                        <span>{formatGold(person > 1 ? (gold + ((singleGold - gold) - ((singleGold - gold) / person)) / (person - 1)) * ((person - article) % article) * 0.95 / person / (1 - ((person - article) % article) * 0.95 / person) * (person - 1) : 0)}</span>
                                    </div>
                                </CardBody>
                            </Card>
                            <Card 
                                isPressable
                                radius="sm" 
                                shadow="sm" 
                                className="w-full"
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
                                <CardBody className="py-1.5">
                                    <h3 className="fadedtext text-sm">분배금</h3>
                                    <div className="flex gap-1 items-center">
                                        <Image 
                                            src="/icons/gold.png" 
                                            width={14} 
                                            height={14} 
                                            alt="goldicon"
                                            className="w-[16px] h-[16px] "/>
                                        <span>{formatGold(person > 1 ? (gold + ((singleGold - gold) - ((singleGold - gold) / person)) / (person - 1)) * ((person - article) % article) * 0.95 / person / (1 - ((person - article) % article) * 0.95 / person) : 0)}</span>
                                    </div>
                                </CardBody>
                            </Card>
                        </div>
                        <div className="mt-2 flex items-center gap-1">
                            <p>기사는 총</p>
                            <div className="flex items-center gap-1">
                                <Image 
                                    src="/icons/gold.png" 
                                    width={14} 
                                    height={14} 
                                    alt="goldicon"
                                    className="w-[16px] h-[16px] "/>
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
            <p className="fadedtext text-sm mt-2">금액 부분을 클릭하시면 해당 금액이 클립보드에 복사됩니다.</p>
        </div>
    )
}

function RelicComponent() {
    const [gold, setGold] = useState(0);
    const [person, setPerson] = useState(0);

    return (
        <div className="w-full">
            <Card radius="sm">
                <CardBody>
                    <div className="w-full grid sm:grid-cols-4 gap-4 items-center">
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
                            radius="sm" 
                            shadow="sm" 
                            className="w-full"
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
                            <CardBody className="py-1.5">
                                <h3 className="fadedtext text-sm">분배 금액</h3>
                                <div className="flex gap-1 items-center">
                                    <Image 
                                        src="/icons/gold.png" 
                                        width={14} 
                                        height={14} 
                                        alt="goldicon"
                                        className="w-[16px] h-[16px] "/>
                                    <span>{formatGold(person > 0 ? gold * 0.95 / (person - 0.05) : 0)}</span>
                                </div>
                            </CardBody>
                        </Card>
                    </div>
                </CardBody>
            </Card>
            <div className="mt-2 flex items-center gap-1">
                <p>기사는 총</p>
                <div className="flex items-center gap-1">
                    <Image 
                        src="/icons/gold.png" 
                        width={14} 
                        height={14} 
                        alt="goldicon"
                        className="w-[16px] h-[16px] "/>
                    <p><strong className="text-yellow-700 dark:text-yellow-400">{formatGold(person > 0 ? gold * 0.95 / (person - 0.05) * 0.95 : 0)}</strong></p>
                </div>
                <p>골드를 수령합니다.</p>
            </div>
            <h3 className="mt-4 text-lg">분배 금액</h3>
            <p className="fadedtext">경매 아이템 가격 * 0.95 / (기사 인원 수 - 0.05)</p>
            <p className="text-green-700 dark:text-green-400">{gold} * 0.95 / ({person} - 0.05)</p>
        </div>
    )
}

export default function BusComponent() {
    return (
        <div className="w-full">
            <CalcComponent/>
            <Divider className="mt-8 mb-8"/>
            <RelicComponent/>
            <p className="mt-2">위 계산들은 최초 입찰 금액(50골드), 신뢰도로 인한 수수료를 제외하고 계산되었습니다.</p>
        </div>
    )
}