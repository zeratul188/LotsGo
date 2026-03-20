'use client'
import { Card, CardBody, CardHeader, Checkbox, Chip, Divider, Progress, Radio, RadioGroup, Spinner, Tooltip } from "@heroui/react";
import { ExpeditionCharacter } from "../characterlist/model/types";
import {
    getCharacterStatUsageSummary,
    getAverageGemLevel,
    getCountAttackBoundGem,
    getCountAttackGem,
    getCountCooldownBoundGem,
    getGemLevelChartData,
    getGemLevelChartRange,
    getExpeditionStatStatusMessage,
    getStatChipColor,
    getStatComboSummary,
    getTier3BoundGem,
    getTier3Gem,
    getTier4BoundGem,
    getTier4Gem,
    getStatTextColor
} from "../lib/expeditionStatFeat";
import { getBackgroundByGrade, getColorTextByGrade, useMobileQuery } from "@/utiils/utils";
import { useState } from "react";
import { Bar, BarChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip as RechartsTooltip, XAxis, YAxis } from "recharts";
import { useTheme } from "next-themes";
import clsx from "clsx";
import { getEngravingSrcByName } from "../lib/characterFeat";

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

function renderBarLabel({ x = 0, y = 0, width = 0, height = 0, value }: BarLabelProps) {
    const numericValue = Number(value);
    if (!numericValue) {
        return <g />;
    }

    return (
        <text
            x={x + width / 2}
            y={y + height / 2}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="9pt"
            fill="#ffffff">
            {Math.abs(numericValue)}
        </text>
    );
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
            <div className="w-full grid sm:grid-cols-3 mt-4 gap-4">
                <StatSummaryCard expeditionCharacters={expeditionCharacters}/>
                <EngravingCard expeditionCharacters={expeditionCharacters}/>
                <ArkGridCard expeditionCharacters={expeditionCharacters}/>
            </div>
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
    const gemLevelSummary = Array.from({ length: 10 }, (_, index) => {
        const level = 10 - index;
        const chartItem = gemLevelChartData.find((item) => item.level === `${level}레벨`);
        const attackCount = Math.abs(chartItem?.attack ?? 0);
        const cooldownCount = chartItem?.cooldown ?? 0;

        return {
            level,
            totalCount: attackCount + cooldownCount,
            attackCount,
            cooldownCount
        };
    });

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
                <CardBody className="overflow-hidden scrollbar-hide">
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
                                    value={avgTradeableGemLevel}
                                    maxValue={avgTradeableGemLevel + avgBoundGemLevel}
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
                        <div className="grow w-full h-auto sm:h-[240px] flex flex-col min-h-0">
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
                                    귀속 제외
                                </Checkbox>
                            </div>
                            <div className="w-full sm:h-[240px] mt-2 overflow-hidden flex flex-col sm:flex-row">
                                <div className="w-full sm:w-[200px] h-full flex gap-1 flex-col sm:mr-2 mb-2 sm:mb-0">
                                    <div className="w-full flex gap-1 items-center">
                                        <div className="grow border-b border-dotted border-default-800" />
                                        <h3 className="text-xs font-semibold">레벨 별 보석 개수</h3>
                                        <div className="grow border-b border-dotted border-default-800" />
                                    </div>
                                    {gemLevelSummary.map((item) => (
                                        <div
                                            key={item.level}
                                            className="flex-1 min-h-0 flex items-center sm:justify-between text-xs gap-1">
                                            <p>{item.level}레벨</p>
                                            <div className="grow border-b border-dotted border-default-300" />
                                            <p>
                                                <span className="font-semibold">{item.totalCount} </span>
                                                <span className="fadedtext">
                                                    (<span className="text-danger">{item.attackCount}</span> / <span className="text-success">{item.cooldownCount}</span>)
                                                </span>
                                            </p>
                                        </div>
                                    ))}
                                </div>  
                                <Divider orientation={isMobile ? 'horizontal' : 'vertical'} className="sm:h-full"/>
                                <div className="w-full h-[240px] sm:h-full overflow-hidden">
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
                                                label={renderBarLabel}/>
                                            <Bar 
                                                dataKey="cooldown" 
                                                name="cooldown" 
                                                stackId="gem-count" 
                                                fill={cooldownBarColor} 
                                                radius={[0, 5, 5, 0]}
                                                label={renderBarLabel} />
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

// 특성 Card
function StatCard({ expeditionCharacters }: { expeditionCharacters: ExpeditionCharacter[] }) {
    
    return (
        <Card fullWidth radius="sm" shadow="sm">
            <CardHeader>특성</CardHeader>
            <Divider/>
            <CardBody>
                <div className="w-full sm:h-[240px]">
                    
                </div>
            </CardBody>
        </Card>
    )
}

// 원정대 캐릭터들의 300 이상 특성 조합과 사용 캐릭터 수를 요약해서 표시한다.
function StatSummaryCard({ expeditionCharacters }: { expeditionCharacters: ExpeditionCharacter[] }) {
    const statComboSummary = getStatComboSummary(expeditionCharacters);
    const characterStatUsageSummary = getCharacterStatUsageSummary(expeditionCharacters);

    return (
        <Card fullWidth radius="sm" shadow="sm">
            <CardHeader>특성</CardHeader>
            <Divider/>
            <CardBody>
                <div className="w-full h-[240px] grid grid-cols-[2fr_1px_3fr] gap-3">
                    <div className="h-full grow overflow-y-auto scrollbar-hide flex flex-col gap-2">
                        <div className="w-full flex gap-1 items-center">
                            <div className="grow border-b border-dotted border-default-800" />
                            <h3 className="text-xs font-semibold">특성 조합 비율</h3>
                            <div className="grow border-b border-dotted border-default-800" />
                        </div>
                        {statComboSummary.length > 0 ? (
                            statComboSummary.map((item) => (
                                <div
                                    key={item.label}
                                    className="w-full flex gap-1 items-center text-sm">
                                    {item.label.split(' / ').map((stat, index) => (
                                        <Chip 
                                            key={index}
                                            size="sm"
                                            variant={index === 0 ? 'solid' : 'flat'}
                                            color={getStatChipColor(stat)}
                                            radius="sm">{stat}</Chip>
                                    ))}
                                    <div className="grow border-b border-dotted border-default-300" />
                                    <p className="shrink-0 font-semibold">{item.count}</p>
                                </div>
                            ))
                        ) : (
                            <p className="fadedtext text-xs">300 이상 특성 조합이 있는 캐릭터가 없습니다.</p>
                        )}
                    </div>
                    <Divider orientation="vertical" className="h-full"/>
                    <div className="h-full grow overflow-y-auto scrollbar-hide flex flex-col gap-2">
                        <div className="w-full flex gap-1 items-center">
                            <div className="grow border-b border-dotted border-default-800" />
                            <h3 className="text-xs font-semibold">캐릭터들의 특성 조합</h3>
                            <div className="grow border-b border-dotted border-default-800" />
                        </div>
                        {characterStatUsageSummary.length > 0 ? (
                            characterStatUsageSummary.map((character) => (
                                <div
                                    key={character.nickname}
                                    className="w-full flex gap-2 items-center text-xs">
                                    <p className="shrink-0 font-medium">{character.nickname}</p>
                                    <div className="grow border-b border-dotted border-default-300" />
                                    {character.label.split(' / ').map((stat, index) => (
                                        <span key={index} className={clsx(
                                            getStatTextColor(stat),
                                            index === 0 ? 'font-semibold' : ''
                                        )}>{stat}</span>
                                    ))}
                                </div>
                            ))
                        ) : (
                            <p className="fadedtext text-xs">300 이상 특성을 사용하는 캐릭터가 없습니다.</p>
                        )}
                    </div>
                </div>
            </CardBody>
        </Card>
    )
}

function EngravingCard({ expeditionCharacters }: { expeditionCharacters: ExpeditionCharacter[] }) {
    const engravingSummary = Array.from(
        expeditionCharacters.reduce((map, character) => {
            character.engravings.forEach((engraving) => {
                if (!engraving?.name) {
                    return;
                }

                const current = map.get(engraving.name);

                if (current) {
                    current.count += 1;
                    current.totalLevel += engraving.level;
                    current.maxLevel = Math.max(current.maxLevel, engraving.level);
                    return;
                }

                map.set(engraving.name, {
                    name: engraving.name,
                    grade: engraving.grade,
                    count: 1,
                    totalLevel: engraving.level,
                    maxLevel: engraving.level
                });
            });

            return map;
        }, new Map<string, {
            name: string,
            grade: string,
            count: number,
            totalLevel: number,
            maxLevel: number
        }>())
            .values()
    ).sort((a, b) => {
        if (b.maxLevel !== a.maxLevel) return b.maxLevel - a.maxLevel;
        if (b.count !== a.count) return b.count - a.count;
        if (b.totalLevel !== a.totalLevel) return b.totalLevel - a.totalLevel;
        return (a.name ?? '').localeCompare(b.name ?? '');
    });

    const relicEngravingSummary = Array.from(
        expeditionCharacters.reduce((map, character) => {
            character.engravings.forEach((engraving) => {
                if (!engraving?.name || engraving.grade !== '유물' || engraving.level < 1) {
                    return;
                }

                const current = map.get(engraving.name);

                if (current) {
                    current.count += 1;
                    current.totalLevel += engraving.level;
                    current.maxLevel = Math.max(current.maxLevel, engraving.level);
                    return;
                }

                map.set(engraving.name, {
                    name: engraving.name,
                    grade: engraving.grade,
                    count: 1,
                    totalLevel: engraving.level,
                    maxLevel: engraving.level
                });
            });

            return map;
        }, new Map<string, {
            name: string,
            grade: string,
            count: number,
            totalLevel: number,
            maxLevel: number
        }>())
            .values()
    ).sort((a, b) => {
        if (b.maxLevel !== a.maxLevel) return b.maxLevel - a.maxLevel;
        if (b.count !== a.count) return b.count - a.count;
        if (b.totalLevel !== a.totalLevel) return b.totalLevel - a.totalLevel;
        return (a.name ?? '').localeCompare(b.name ?? '');
    });
    const sumEngraving = relicEngravingSummary.reduce((total, engraving) => {
        return total + engraving.maxLevel;
    }, 0);

    return (
        <Card fullWidth radius="sm" shadow="sm">
            <CardHeader>
                <div className="w-full flex gap-1 items-center">
                    <h1>각인</h1>
                    <div className="flex gap-1 items-end ml-auto text-sm">
                        <p className="fadedtext">총 각인 레벨 합 :</p>
                        <p className="text-md text-orange-600 dark:text-orange-400">{sumEngraving.toLocaleString()}</p>
                    </div>
                </div>
            </CardHeader>
            <Divider/>
            <CardBody>
                <div className="w-full h-[240px] grid grid-cols-[1fr_1px_1fr] gap-3">
                    <div className="h-full overflow-y-auto scrollbar-hide flex flex-col gap-2 pr-1">
                        <div className="w-full flex gap-1 items-center">
                            <div className="grow border-b border-dotted border-default-800" />
                            <h3 className="text-xs font-semibold">자주 사용하는 각인</h3>
                            <div className="grow border-b border-dotted border-default-800" />
                        </div>
                        {engravingSummary.length > 0 ? (
                            engravingSummary.map((engraving) => (
                                <div
                                    key={engraving.name}
                                    className="w-full flex items-center gap-2 text-sm">
                                    <img
                                        src={getEngravingSrcByName(engraving.name)}
                                        alt={engraving.name}
                                        className="w-6 h-6 rounded-md shrink-0"/>
                                    <p className="truncate">
                                        {engraving.name}
                                    </p>
                                    <div className="grow border-b border-dotted border-default-300" />
                                    <p className="shrink-0 font-semibold">{engraving.count}</p>
                                </div>
                            ))
                        ) : (
                            <p className="fadedtext text-xs">사용 중인 각인이 있는 캐릭터가 없습니다.</p>
                        )}
                    </div>
                    <Divider orientation="vertical" className="h-full"/>
                    <div className="h-full overflow-y-auto scrollbar-hide flex flex-col gap-2 pr-1">
                        <div className="w-full flex gap-1 items-center">
                            <div className="grow border-b border-dotted border-default-800" />
                            <h3 className="text-xs font-semibold">유물 각인서</h3>
                            <div className="grow border-b border-dotted border-default-800" />
                        </div>
                        {relicEngravingSummary.length > 0 ? (
                            relicEngravingSummary.map((engraving) => (
                                <div
                                    key={`relic-${engraving.name}`}
                                    className="w-full flex items-center gap-2 text-sm">
                                    <img
                                        src={getEngravingSrcByName(engraving.name)}
                                        alt={engraving.name}
                                        className="w-6 h-6 rounded-md shrink-0"/>
                                    <p className={clsx("truncate", getColorTextByGrade(engraving.grade))}>
                                        {engraving.name}
                                    </p>
                                    <div className="grow border-b border-dotted border-default-300" />
                                    <p className="shrink-0 font-semibold text-orange-600 dark:text-orange-400">{engraving.maxLevel}</p>
                                </div>
                            ))
                        ) : (
                            <p className="fadedtext text-xs">유물 등급 각인을 1칸 이상 사용하는 캐릭터가 없습니다.</p>
                        )}
                    </div>
                </div>
            </CardBody>
        </Card>
    )
}

// 아크그리드 Card
function ArkGridCard({ expeditionCharacters }: { expeditionCharacters: ExpeditionCharacter[] }) {
    const coreGradeOrder = ['고대', '유물', '전설', '영웅'] as const;
    const highCoreGradeOrder = ['고대', '유물'] as const;
    const coreGradeSummary = coreGradeOrder.map((grade) => ({
        grade,
        count: expeditionCharacters.reduce((total, character) => {
            return total + character.arkgrid.cores.filter((core) => core.grade === grade).length;
        }, 0),
        orderCount: expeditionCharacters.reduce((total, character) => {
            return total + character.arkgrid.cores.filter((core) =>
                core.grade === grade && (core.name ?? '').includes('질서')
            ).length;
        }, 0),
        chaosCount: expeditionCharacters.reduce((total, character) => {
            return total + character.arkgrid.cores.filter((core) =>
                core.grade === grade && (core.name ?? '').includes('혼돈')
            ).length;
        }, 0)
    }));
    const gemGradeSummary = coreGradeOrder.map((grade) => ({
        grade,
        count: expeditionCharacters.reduce((total, character) => {
            return total + character.arkgrid.cores.reduce((coreTotal, core) => {
                return coreTotal + core.gems.filter((gem) => gem.grade === grade).length;
            }, 0);
        }, 0),
        orderCount: expeditionCharacters.reduce((total, character) => {
            return total + character.arkgrid.cores.reduce((coreTotal, core) => {
                return coreTotal + core.gems.filter((gem) =>
                    gem.grade === grade && (gem.name ?? '').includes('질서')
                ).length;
            }, 0);
        }, 0),
        chaosCount: expeditionCharacters.reduce((total, character) => {
            return total + character.arkgrid.cores.reduce((coreTotal, core) => {
                return coreTotal + core.gems.filter((gem) =>
                    gem.grade === grade && (gem.name ?? '').includes('혼돈')
                ).length;
            }, 0);
        }, 0)
    }));
    const highGradeCores = expeditionCharacters
        .flatMap((character) =>
            character.arkgrid.cores
                .filter((core) => highCoreGradeOrder.includes(core.grade as typeof highCoreGradeOrder[number]))
                .map((core) => ({
                    icon: core.icon,
                    name: core.name,
                    grade: core.grade,
                    nickname: character.nickname
                }))
        )
        .sort((a, b) => {
            const gradeDiff =
                highCoreGradeOrder.indexOf(a.grade as typeof highCoreGradeOrder[number]) -
                highCoreGradeOrder.indexOf(b.grade as typeof highCoreGradeOrder[number]);

            if (gradeDiff !== 0) return gradeDiff;
            const nameDiff = (a.name ?? '').localeCompare(b.name ?? '');
            if (nameDiff !== 0) return nameDiff;
            return (a.nickname ?? '').localeCompare(b.nickname ?? '');
        });

    return (
        <Card fullWidth radius="sm" shadow="sm">
            <CardHeader>아크그리드</CardHeader>
            <Divider/>
            <CardBody>
                <div className="w-full h-[240px] grid grid-cols-[2fr_1px_3fr] gap-3">
                    <div className="h-full flex flex-col gap-2 pr-1">
                        <div className="flex-1 h-full flex flex-col gap-1.5">
                            <div className="w-full flex gap-1 items-center">
                                <div className="grow border-b border-dotted border-default-800" />
                                <h3 className="text-xs font-semibold">코어 개수</h3>
                                <div className="grow border-b border-dotted border-default-800" />
                            </div>
                            {coreGradeSummary.map((item) => (
                                <div
                                    key={item.grade}
                                    className="w-full flex items-center gap-2 text-xs">
                                    <p className={clsx("shrink-0 font-medium", getColorTextByGrade(item.grade))}>
                                        {item.grade}
                                    </p>
                                    <div className="grow border-b border-dotted border-default-300" />
                                    <p className="shrink-0 font-semibold">
                                        {item.count} 
                                        <span className="font-normal ml-0.5">
                                            (
                                            <span className="text-danger">{item.orderCount}</span>
                                            /
                                            <span className="text-primary">{item.chaosCount}</span>
                                            )
                                        </span>
                                    </p>
                                </div>
                            ))}
                        </div>
                        <Divider/>
                        <div className="flex-1 flex flex-col gap-1.5">
                            <div className="w-full flex gap-1 items-center">
                                <div className="grow border-b border-dotted border-default-800" />
                                <h3 className="text-xs font-semibold">젬 개수</h3>
                                <div className="grow border-b border-dotted border-default-800" />
                            </div>
                            {gemGradeSummary.map((item) => (
                                <div
                                    key={`gem-${item.grade}`}
                                    className="w-full flex items-center gap-2 text-xs">
                                    <p className={clsx("shrink-0 font-medium", getColorTextByGrade(item.grade))}>
                                        {item.grade}
                                    </p>
                                    <div className="grow border-b border-dotted border-default-300" />
                                    <p className="shrink-0 font-semibold">
                                        {item.count}
                                        <span className="font-normal ml-0.5">
                                            (
                                            <span className="text-danger">{item.orderCount}</span>
                                            /
                                            <span className="text-primary">{item.chaosCount}</span>
                                            )
                                        </span>
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                    <Divider orientation="vertical" className="h-full"/>
                    <div className="h-full overflow-y-auto scrollbar-hide flex flex-col gap-2 pr-1">
                        {highGradeCores.length > 0 ? (
                            highGradeCores.map((core, index) => (
                                <div
                                    key={`${core.nickname}-${core.name}-${index}`}
                                    className="w-full flex items-center gap-2 text-xs">
                                    <div className={clsx(
                                        "w-9 h-9 shrink-0 rounded-md p-[2px]",
                                        getBackgroundByGrade(core.grade)
                                    )}>
                                        <img
                                            src={core.icon}
                                            alt={core.name}
                                            className="w-full h-full rounded-md"/>
                                    </div>
                                    <div className="min-w-0 grow leading-tight">
                                        <p className={clsx("truncate font-medium", getColorTextByGrade(core.grade))}>
                                            {core.name}
                                        </p>
                                        <p>{core.nickname}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="fadedtext text-xs">유물 이상 코어를 장착한 캐릭터가 없습니다.</p>
                        )}
                    </div>
                </div>
            </CardBody>
        </Card>
    )
}
