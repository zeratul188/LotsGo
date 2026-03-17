'use client'

import { Card, CardBody, CardHeader, Checkbox, Divider, Progress, Radio, RadioGroup, Spinner, Tooltip } from "@heroui/react";
import { ExpeditionCharacter } from "../characterlist/model/types";
import {
    getAverageGemLevel,
    getCountAttackBoundGem,
    getCountAttackGem,
    getCountCooldownBoundGem,
    getGemLevelChartData,
    getGemLevelChartRange,
    getExpeditionStatStatusMessage,
    getTier3BoundGem,
    getTier3Gem,
    getTier4BoundGem,
    getTier4Gem
} from "../lib/expeditionStatFeat";
import { useMobileQuery } from "@/utiils/utils";
import { ReactNode, useState } from "react";
import { Bar, BarChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip as RechartsTooltip, XAxis, YAxis } from "recharts";
import { useTheme } from "next-themes";

type ExpeditionStatComponentProps = {
    nickname: string | null,
    expeditionCharacters: ExpeditionCharacter[],
    isLoading: boolean
}

type BarLabelProps = {
    x?: number,
    y?: number,
    width?: number,
    height?: number,
    value?: number | string
}

export function ExpeditionStatComponent({
    nickname,
    expeditionCharacters,
    isLoading
}: ExpeditionStatComponentProps) {
    const statusMessage = getExpeditionStatStatusMessage(nickname, isLoading, expeditionCharacters.length);

    if (isLoading) {
        return (
            <div className="w-full min-h-[700px] py-2 flex justify-center">
                <Spinner label={statusMessage ?? ''} classNames={{ label: 'fadedtext mt-3' }}/>
            </div>
        );
    }

    if (statusMessage) {
        return (
            <div className="w-full min-h-[700px] py-2 flex justify-center">
                <p className="fadedtext">{statusMessage}</p>
            </div>
        );
    }

    return (
        <div className="w-full min-h-[700px]">
            <p className="fadedtext text-sm mb-3">
                이 원정대 정보는 최소 1번 이상 조회했던 캐릭터만 포함되며, 조회 또는 갱신했던 시점을 기준으로 계산된 값입니다.
            </p>
            <GemComponent expeditionCharacters={expeditionCharacters}/>
        </div>
    )
}

function GemComponent({ expeditionCharacters }: { expeditionCharacters: ExpeditionCharacter[] }) {
    const isMobile = useMobileQuery();
    const { resolvedTheme } = useTheme();
    const haveGemCharacters = expeditionCharacters.filter(character => character.gems.length > 0);
    const attackBarColor = resolvedTheme === 'dark' ? '#C20E4D' : '#F31260';
    const cooldownBarColor = resolvedTheme === 'dark' ? '#12A150' : '#17C964';

    const allGemsCount = haveGemCharacters.reduce((total, character) => {
        return total + character.gems.length;
    }, 0);
    const allBoundGemsCount = haveGemCharacters.reduce((total, character) => {
        return total + character.gems.filter(gem => gem.name.includes('귀속')).length;
    }, 0);
    const allAttackGemCount = haveGemCharacters.reduce((total, character) => {
        return total + getCountAttackGem(character);
    }, 0);
    const allAttackBoundGemCount = haveGemCharacters.reduce((total, character) => {
        return total + getCountAttackBoundGem(character);
    }, 0);
    const allCooldownGemCount = allGemsCount - allAttackGemCount;
    const allCooldownBoundGemCount = haveGemCharacters.reduce((total, character) => {
        return total + getCountCooldownBoundGem(character);
    }, 0);
    const tier4GemCount = haveGemCharacters.reduce((total, character) => {
        return total + getTier4Gem(character);
    }, 0);
    const tier4BoundGemCount = haveGemCharacters.reduce((total, character) => {
        return total + getTier4BoundGem(character);
    }, 0);
    const tier3GemCount = haveGemCharacters.reduce((total, character) => {
        return total + getTier3Gem(character);
    }, 0);
    const tier3BoundGemCount = haveGemCharacters.reduce((total, character) => {
        return total + getTier3BoundGem(character);
    }, 0);
    const tier12GemCount = allGemsCount - tier4GemCount - tier3GemCount;
    const tier12BoundGemCount = allBoundGemsCount - tier4BoundGemCount - tier3BoundGemCount;

    const isAttackGem = (gem: ExpeditionCharacter['gems'][number]) =>
        gem.skillStr.includes('피해') || gem.skillStr.includes('지원효과');
    const isCooldownGem = (gem: ExpeditionCharacter['gems'][number]) => !isAttackGem(gem);
    const isBoundGem = (gem: ExpeditionCharacter['gems'][number]) => gem.name.includes('귀속');
    const isTier4Gem = (gem: ExpeditionCharacter['gems'][number]) =>
        gem.name.includes('겁화') || gem.name.includes('작열') || gem.name.includes('광휘');
    const isTier3Gem = (gem: ExpeditionCharacter['gems'][number]) =>
        gem.name.includes('멸화') || gem.name.includes('홍염');
    const isTier12Gem = (gem: ExpeditionCharacter['gems'][number]) => !isTier4Gem(gem) && !isTier3Gem(gem);

    const avgGemLevel = getAverageGemLevel(haveGemCharacters);
    const avgTradeableGemLevel = getAverageGemLevel(haveGemCharacters, (gem) => !isBoundGem(gem));
    const avgBoundGemLevel = getAverageGemLevel(haveGemCharacters, isBoundGem);
    const avgAttackGemLevel = getAverageGemLevel(haveGemCharacters, isAttackGem);
    const avgAttackTradeableGemLevel = getAverageGemLevel(haveGemCharacters, (gem) => isAttackGem(gem) && !isBoundGem(gem));
    const avgAttackBoundGemLevel = getAverageGemLevel(haveGemCharacters, (gem) => isAttackGem(gem) && isBoundGem(gem));
    const avgCooldownGemLevel = getAverageGemLevel(haveGemCharacters, isCooldownGem);
    const avgCooldownTradeableGemLevel = getAverageGemLevel(haveGemCharacters, (gem) => isCooldownGem(gem) && !isBoundGem(gem));
    const avgCooldownBoundGemLevel = getAverageGemLevel(haveGemCharacters, (gem) => isCooldownGem(gem) && isBoundGem(gem));
    const avgTier4GemLevel = getAverageGemLevel(haveGemCharacters, isTier4Gem);
    const avgTier4TradeableGemLevel = getAverageGemLevel(haveGemCharacters, (gem) => isTier4Gem(gem) && !isBoundGem(gem));
    const avgTier4BoundGemLevel = getAverageGemLevel(haveGemCharacters, (gem) => isTier4Gem(gem) && isBoundGem(gem));
    const avgTier3GemLevel = getAverageGemLevel(haveGemCharacters, isTier3Gem);
    const avgTier3TradeableGemLevel = getAverageGemLevel(haveGemCharacters, (gem) => isTier3Gem(gem) && !isBoundGem(gem));
    const avgTier3BoundGemLevel = getAverageGemLevel(haveGemCharacters, (gem) => isTier3Gem(gem) && isBoundGem(gem));
    const avgTier12GemLevel = getAverageGemLevel(haveGemCharacters, isTier12Gem);
    const avgTier12TradeableGemLevel = getAverageGemLevel(haveGemCharacters, (gem) => isTier12Gem(gem) && !isBoundGem(gem));
    const avgTier12BoundGemLevel = getAverageGemLevel(haveGemCharacters, (gem) => isTier12Gem(gem) && isBoundGem(gem));

    const [tier, setTier] = useState('4');
    const [isBound, setBound] = useState(false);
    const gemLevelChartData = getGemLevelChartData(haveGemCharacters, tier, isBound);
    const gemLevelChartRange = getGemLevelChartRange(gemLevelChartData);

    return (
        <div>
            <Card fullWidth radius="sm" shadow="sm">
                <CardHeader>
                    <div className="w-full flex flex-col sm:flex-row gap-2 sm:items-center">
                        <h1 className="text-lg">보석 현황</h1>
                        <Progress
                            showValueLabel
                            size="sm"
                            color="primary"
                            label={`보석이 있는 캐릭터: ${haveGemCharacters.length} / ${expeditionCharacters.length}`}
                            value={haveGemCharacters.length}
                            maxValue={expeditionCharacters.length}
                            className="w-full sm:w-[280px] ml-auto"/>
                    </div>
                </CardHeader>
                <Divider/>
                <CardBody className="scrollbar-hide">
                    <div className="w-full flex gap-2 flex-col sm:flex-row items-center">
                        <div className="w-full sm:h-[240px] sm:w-[392px] flex gap-3 items-stretch">
                            <div className="grow h-full flex flex-col items-center p-1">
                                <p className="fadedtext text-xs">총 보석 개수</p>
                                <p className="text-3xl font-bold">{allGemsCount}</p>
                                <div className="w-full flex mt-4">
                                    <div className="flex flex-col">
                                        <p className="fadedtext text-[7pt]">거래가능</p>
                                        <p className="text-sm">{allGemsCount - allBoundGemsCount}</p>
                                    </div>
                                    <div className="ml-auto flex flex-col">
                                        <p className="fadedtext text-[7pt] text-right">귀속</p>
                                        <p className="text-sm">{allBoundGemsCount}</p>
                                    </div>
                                </div>
                                <Progress
                                    size="sm"
                                    color="warning"
                                    value={allGemsCount - allBoundGemsCount}
                                    maxValue={allGemsCount}
                                    className="mt-0.5"/>
                                <div className="w-full flex gap-2 items-center mt-2 text-xs">
                                    <p className="shrink-0">겁화</p>
                                    <div className="grow border-b border-dotted border-default-300" />
                                    <p className="shrink-0">
                                        <span className="font-semibold text-danger">{allAttackGemCount}</span>
                                        <Tooltip showArrow content="거래 가능 / 귀속" delay={1000}>
                                            <span className="fadedtext ml-0.5">({allAttackGemCount - allAttackBoundGemCount}/{allAttackBoundGemCount})</span>
                                        </Tooltip>
                                    </p>
                                </div>
                                <div className="w-full flex gap-2 items-center mt-2 text-xs">
                                    <p className="shrink-0">작열</p>
                                    <div className="grow border-b border-dotted border-default-300" />
                                    <p className="shrink-0">
                                        <span className="font-semibold text-success">{allCooldownGemCount}</span>
                                        <Tooltip showArrow content="거래 가능 / 귀속" delay={1000}>
                                            <span className="fadedtext ml-0.5">({allCooldownGemCount - allCooldownBoundGemCount}/{allCooldownBoundGemCount})</span>
                                        </Tooltip>
                                    </p>
                                </div>
                                <Divider className="mt-2"/>
                                <div className="w-full flex gap-2 items-center mt-2 text-xs">
                                    <p className="shrink-0">4티어</p>
                                    <div className="grow border-b border-dotted border-default-300" />
                                    <p className="shrink-0">
                                        <span className="font-semibold text-danger">{tier4GemCount}</span>
                                        <Tooltip showArrow content="거래 가능 / 귀속" delay={1000}>
                                            <span className="fadedtext ml-0.5">({tier4GemCount - tier4BoundGemCount}/{tier4BoundGemCount})</span>
                                        </Tooltip>
                                    </p>
                                </div>
                                <div className="w-full flex gap-2 items-center mt-2 text-xs">
                                    <p className="shrink-0">3티어</p>
                                    <div className="grow border-b border-dotted border-default-300" />
                                    <p className="shrink-0">
                                        <span className="font-semibold text-danger">{tier3GemCount}</span>
                                        <Tooltip showArrow content="거래 가능 / 귀속" delay={1000}>
                                            <span className="fadedtext ml-0.5">({tier3GemCount - tier3BoundGemCount}/{tier3BoundGemCount})</span>
                                        </Tooltip>
                                    </p>
                                </div>
                                <div className="w-full flex gap-2 items-center mt-2 text-xs">
                                    <p className="shrink-0">1~2티어</p>
                                    <div className="grow border-b border-dotted border-default-300" />
                                    <p className="shrink-0">
                                        <span className="font-semibold text-danger">{tier12GemCount}</span>
                                        <Tooltip showArrow content="거래 가능 / 귀속" delay={1000}>
                                            <span className="fadedtext ml-0.5">({tier12GemCount - tier12BoundGemCount}/{tier12BoundGemCount})</span>
                                        </Tooltip>
                                    </p>
                                </div>
                            </div>
                            <Divider orientation="vertical" className="self-stretch h-auto"/>
                            <div className="grow h-full flex flex-col items-center p-1">
                                <p className="fadedtext text-xs">총 보석 레벨 평균</p>
                                <p className="text-3xl font-bold">{avgGemLevel.toFixed(1)}</p>
                                <div className="w-full flex mt-4">
                                    <div className="flex flex-col">
                                        <p className="fadedtext text-[7pt]">거래가능</p>
                                        <p className="text-sm">{avgTradeableGemLevel.toFixed(1)}</p>
                                    </div>
                                    <div className="ml-auto flex flex-col">
                                        <p className="fadedtext text-[7pt] text-right">귀속</p>
                                        <p className="text-sm">{avgBoundGemLevel.toFixed(1)}</p>
                                    </div>
                                </div>
                                <Progress
                                    size="sm"
                                    color="warning"
                                    value={allGemsCount - allBoundGemsCount}
                                    maxValue={allGemsCount}
                                    className="mt-0.5"/>
                                <div className="w-full flex gap-2 items-center mt-2 text-xs">
                                    <p className="shrink-0">겁화</p>
                                    <div className="grow border-b border-dotted border-default-300" />
                                    <p className="shrink-0">
                                        <span className="font-semibold text-danger">{avgAttackGemLevel.toFixed(1)}</span>
                                        <Tooltip showArrow content="거래 가능 / 귀속" delay={1000}>
                                            <span className="fadedtext ml-0.5">({avgAttackTradeableGemLevel.toFixed(1)}/{avgAttackBoundGemLevel.toFixed(1)})</span>
                                        </Tooltip>
                                    </p>
                                </div>
                                <div className="w-full flex gap-2 items-center mt-2 text-xs">
                                    <p className="shrink-0">작열</p>
                                    <div className="grow border-b border-dotted border-default-300" />
                                    <p className="shrink-0">
                                        <span className="font-semibold text-success">{avgCooldownGemLevel.toFixed(1)}</span>
                                        <Tooltip showArrow content="거래 가능 / 귀속" delay={1000}>
                                            <span className="fadedtext ml-0.5">({avgCooldownTradeableGemLevel.toFixed(1)}/{avgCooldownBoundGemLevel.toFixed(1)})</span>
                                        </Tooltip>
                                    </p>
                                </div>
                                <Divider className="mt-2"/>
                                <div className="w-full flex gap-2 items-center mt-2 text-xs">
                                    <p className="shrink-0">4티어</p>
                                    <div className="grow border-b border-dotted border-default-300" />
                                    <p className="shrink-0">
                                        <span className="font-semibold text-danger">{avgTier4GemLevel.toFixed(1)}</span>
                                        <Tooltip showArrow content="거래 가능 / 귀속" delay={1000}>
                                            <span className="fadedtext ml-0.5">({avgTier4TradeableGemLevel.toFixed(1)}/{avgTier4BoundGemLevel.toFixed(1)})</span>
                                        </Tooltip>
                                    </p>
                                </div>
                                <div className="w-full flex gap-2 items-center mt-2 text-xs">
                                    <p className="shrink-0">3티어</p>
                                    <div className="grow border-b border-dotted border-default-300" />
                                    <p className="shrink-0">
                                        <span className="font-semibold text-danger">{avgTier3GemLevel.toFixed(1)}</span>
                                        <Tooltip showArrow content="거래 가능 / 귀속" delay={1000}>
                                            <span className="fadedtext ml-0.5">({avgTier3TradeableGemLevel.toFixed(1)}/{avgTier3BoundGemLevel.toFixed(1)})</span>
                                        </Tooltip>
                                    </p>
                                </div>
                                <div className="w-full flex gap-2 items-center mt-2 text-xs">
                                    <p className="shrink-0">1~2티어</p>
                                    <div className="grow border-b border-dotted border-default-300" />
                                    <p className="shrink-0">
                                        <span className="font-semibold text-danger">{avgTier12GemLevel.toFixed(1)}</span>
                                        <Tooltip showArrow content="거래 가능 / 귀속" delay={1000}>
                                            <span className="fadedtext ml-0.5">({avgTier12TradeableGemLevel.toFixed(1)}/{avgTier12BoundGemLevel.toFixed(1)})</span>
                                        </Tooltip>
                                    </p>
                                </div>
                            </div>
                        </div>
                        <Divider orientation={isMobile ? 'horizontal' : 'vertical'} className="sm:self-stretch sm:h-auto"/>
                        <div className="grow w-full h-[240px] flex flex-col min-h-0">
                            <div className="w-full flex gap-2 flex-col sm:flex-row">
                                <RadioGroup 
                                    size="sm" 
                                    orientation="horizontal"
                                    value={tier}
                                    onValueChange={setTier}>
                                    <Radio value="4">4티어</Radio>
                                    <Radio value="3">3티어</Radio>
                                    <Radio value="1~2">1~2티어</Radio>
                                </RadioGroup>
                                <Checkbox
                                    radius="sm"
                                    size="sm"
                                    isSelected={isBound}
                                    onValueChange={setBound}
                                    className="sm:ml-auto">
                                    귀속만 표시
                                </Checkbox>
                            </div>
                            <div className="w-full flex-1 min-h-0 mt-2">
                                <div className="w-full h-[400px] sm:h-[220px] max-h-[900px] sm:max-h-[700px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart
                                            data={gemLevelChartData}
                                            layout="vertical"
                                            stackOffset="sign"
                                            margin={{ top: 8, right: 16, left: 16, bottom: 8 }}
                                            barCategoryGap={12}
                                            barSize={24}>
                                            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                            <XAxis
                                                type="number"
                                                domain={[-gemLevelChartRange, gemLevelChartRange]}
                                                tickFormatter={(value) => `${Math.abs(value)}`}
                                                tick={{ fontSize: '9pt' }}
                                            />
                                            <YAxis
                                                type="category"
                                                dataKey="level"
                                                width={36}
                                                tick={{ fontSize: '9pt' }}
                                            />
                                            <RechartsTooltip
                                                formatter={(value: number, name: string) => [Math.abs(value), name === 'attack' ? '겁화' : '작열']}
                                            />
                                            <ReferenceLine x={0} stroke="#a1a1aa" />
                                            <Bar 
                                                dataKey="attack" 
                                                name="attack" 
                                                stackId="gem-count" 
                                                fill={attackBarColor} 
                                                radius={[0, 5, 5, 0]} 
                                                label={{ 
                                                    position: 'center', 
                                                    formatter: (label: ReactNode) => Math.abs(Number(label?.toString())),
                                                    fontSize: '9pt',
                                                    fill: '#ffffff'
                                                }}/>
                                            <Bar 
                                                dataKey="cooldown" 
                                                name="cooldown" 
                                                stackId="gem-count" 
                                                fill={cooldownBarColor} 
                                                radius={[0, 5, 5, 0]}
                                                label={{ 
                                                    position: 'center',
                                                    fontSize: '9pt',
                                                    fill: '#ffffff' 
                                                }} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardBody>
            </Card>
        </div>
    )
}
