'use client'
import { Card, CardBody, CardHeader, Checkbox, Chip, Divider, NumberInput, Progress, Radio, RadioGroup, Spinner, Tooltip } from "@heroui/react";
import { ExpeditionCharacter } from "../characterlist/model/types";
import {
    formatCombatPower,
    getAverageCombatPower,
    getAverageItemLevel,
    getCharacterStatUsageSummary,
    getAverageGemLevel,
    getCountAttackBoundGem,
    getCountAttackGem,
    getCountCooldownBoundGem,
    getGemLevelChartData,
    getExpeditionStatStatusMessage,
    getMaxCombatPower,
    getMaxItemLevel,
    getMinCombatPower,
    getMinItemLevel,
    getStatChipColor,
    getStatComboSummary,
    getTier3BoundGem,
    getTier3Gem,
    getTier4BoundGem,
    getTier4Gem,
    getStatTextColor
} from "../lib/expeditionStatFeat";
import { getBackgroundByGrade, getColorTextByGrade } from "@/utiils/utils";
import homeData from "@/data/home/data.json";
import classData from "@/data/classimgs/data.json";
import { useEffect, useState } from "react";
import clsx from "clsx";
import { getEngravingSrcByName } from "../lib/characterFeat";
import { ClassCount } from "../model/types";
import JobEmblemIcon from "@/Icons/JobEmblemIcon";

const expeditionCardClass = "overflow-hidden border border-default-200/80 bg-content1/95 shadow-sm dark:border-white/10 dark:bg-[#18181b]";
const expeditionCardHeaderClass = "border-b border-default-200/70 px-5 py-4 dark:border-white/10";
const expeditionInsetClass = "rounded-2xl border border-default-200/70 bg-default-50/80 shadow-sm dark:border-white/10 dark:bg-white/[0.035]";

type ExpeditionStatComponentProps = {
    nickname: string | null,
    expeditionCharacters: ExpeditionCharacter[],
    isLoading: boolean
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
            <div className="mb-4 rounded-xl border border-primary-200/70 bg-primary-50/70 px-4 py-3 text-xs leading-5 text-primary-700 dark:border-primary-500/20 dark:bg-primary-500/10 dark:text-primary-300">
                이 원정대 정보는 최소 1번 이상 조회했던 캐릭터만 포함되며, 조회 또는 갱신했던 시점을 기준으로 계산된 값입니다.
            </div>
            <Characters expeditionCharacters={expeditionCharacters}/>
            <GemComponent expeditionCharacters={expeditionCharacters}/>
            <div className="mt-4 grid w-full grid-cols-1 gap-4 lg:grid-cols-3">
                <StatSummaryCard expeditionCharacters={expeditionCharacters}/>
                <EngravingCard expeditionCharacters={expeditionCharacters}/>
                <ArkGridCard expeditionCharacters={expeditionCharacters}/>
            </div>
            <CharacterImages expeditionCharacters={expeditionCharacters}/>
        </div>
    )
}

function GemComponent({ expeditionCharacters }: { expeditionCharacters: ExpeditionCharacter[] }) {
    const haveGemCharacters = expeditionCharacters.filter(character => character.gems.length > 0);

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
    const gemLevelChartRange = Math.max(
        ...gemLevelChartData.flatMap((item) => [Math.abs(item.attack), item.cooldown]),
        1
    );

    return (
        <div className="mt-4">
            <Card fullWidth radius="lg" className={expeditionCardClass}>
                <CardHeader className={expeditionCardHeaderClass}>
                    <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center">
                        <div>
                            <h1 className="text-lg font-semibold">보석 현황</h1>
                            <p className="mt-0.5 text-xs text-default-500">원정대 보석 구성과 레벨 분포를 확인합니다.</p>
                        </div>
                        <Progress
                            showValueLabel
                            size="sm"
                            color="primary"
                            label={`보석이 있는 캐릭터: ${haveGemCharacters.length} / ${expeditionCharacters.length}`}
                            value={haveGemCharacters.length}
                            maxValue={expeditionCharacters.length}
                            className="w-full sm:ml-auto sm:w-[300px]"
                            classNames={{
                                label: "text-xs font-medium text-default-600 dark:text-default-300",
                                value: "text-xs font-semibold",
                                track: "h-2 bg-default-200/80 dark:bg-white/10"
                            }}/>
                    </div>
                </CardHeader>
                <CardBody className="overflow-hidden p-4 scrollbar-hide sm:p-5">
                    <div className="flex w-full flex-col items-stretch gap-4 xl:flex-row">
                        <div className={clsx(expeditionInsetClass, "flex w-full items-stretch gap-4 p-4 xl:h-[300px] xl:w-[420px]")}>
                            <div className="flex h-full min-w-0 grow flex-col items-center">
                                <p className="text-xs font-medium text-default-500">총 보석 개수</p>
                                <p className="mt-1 text-3xl font-bold tracking-tight">{allGemsCount}</p>
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
                            <div className="flex h-full min-w-0 grow flex-col items-center">
                                <p className="text-xs font-medium text-default-500">총 보석 레벨 평균</p>
                                <p className="mt-1 text-3xl font-bold tracking-tight">{avgGemLevel.toFixed(1)}</p>
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
                        <div className={clsx(expeditionInsetClass, "flex min-h-0 w-full grow flex-col p-4 xl:h-[300px]")}>
                            <div className="flex w-full flex-col gap-3 rounded-xl border border-default-200/70 bg-content1/70 px-3 py-2.5 sm:flex-row sm:items-center dark:border-white/10 dark:bg-white/[0.03]">
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
                            <div className="mt-3 flex min-h-[220px] w-full grow flex-col rounded-xl bg-content1/60 p-3 dark:bg-white/[0.025]">
                                <div className="grid grid-cols-[48px_minmax(0,1fr)] items-center gap-2 px-1">
                                    <span className="text-[10px] font-medium text-default-400">레벨</span>
                                    <div className="grid grid-cols-2 text-[10px] font-semibold">
                                        <span className="pr-3 text-right text-danger">겁화</span>
                                        <span className="pl-3 text-success">작열</span>
                                    </div>
                                </div>

                                {gemLevelChartData.length > 0 ? (
                                    <div className="mt-2 flex min-h-0 grow flex-col justify-center gap-2">
                                        {gemLevelChartData.map((item) => {
                                            const attackCount = Math.abs(item.attack);
                                            const cooldownCount = item.cooldown;

                                            return (
                                                <div key={item.level} className="grid grid-cols-[48px_minmax(0,1fr)] items-center gap-2">
                                                    <span className="text-right text-xs font-medium text-default-500">{item.level}</span>
                                                    <div className="relative grid h-7 grid-cols-2 overflow-visible">
                                                        <span className="pointer-events-none absolute inset-y-[-3px] left-1/4 border-l border-dashed border-default-200 dark:border-white/[0.07]"/>
                                                        <span className="pointer-events-none absolute inset-y-[-3px] left-1/2 z-10 border-l border-default-400 dark:border-white/25"/>
                                                        <span className="pointer-events-none absolute inset-y-[-3px] left-3/4 border-l border-dashed border-default-200 dark:border-white/[0.07]"/>

                                                        <div className="flex h-full items-center justify-end">
                                                            {attackCount > 0 ? (
                                                                <Tooltip showArrow content={`겁화 ${attackCount}개`}>
                                                                    <div
                                                                        role="img"
                                                                        aria-label={`${item.level} 겁화 ${attackCount}개`}
                                                                        className="flex h-6 min-w-7 items-center justify-center rounded-l-lg bg-danger px-1.5 text-[10px] font-bold text-white shadow-sm"
                                                                        style={{ width: `${attackCount / gemLevelChartRange * 100}%` }}
                                                                    >
                                                                        {attackCount}
                                                                    </div>
                                                                </Tooltip>
                                                            ) : null}
                                                        </div>
                                                        <div className="flex h-full items-center justify-start">
                                                            {cooldownCount > 0 ? (
                                                                <Tooltip showArrow content={`작열 ${cooldownCount}개`}>
                                                                    <div
                                                                        role="img"
                                                                        aria-label={`${item.level} 작열 ${cooldownCount}개`}
                                                                        className="flex h-6 min-w-7 items-center justify-center rounded-r-lg bg-success px-1.5 text-[10px] font-bold text-white shadow-sm"
                                                                        style={{ width: `${cooldownCount / gemLevelChartRange * 100}%` }}
                                                                    >
                                                                        {cooldownCount}
                                                                    </div>
                                                                </Tooltip>
                                                            ) : null}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="flex grow items-center justify-center text-xs text-default-400">
                                        선택한 조건에 해당하는 보석이 없습니다.
                                    </div>
                                )}

                                <div className="mt-2 grid grid-cols-[48px_minmax(0,1fr)] items-center gap-2">
                                    <span/>
                                    <div className="flex justify-between px-0.5 text-[10px] tabular-nums text-default-400">
                                        <span>{gemLevelChartRange}</span>
                                        <span>0</span>
                                        <span>{gemLevelChartRange}</span>
                                    </div>
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
    const maxStatComboCount = Math.max(...statComboSummary.map((item) => item.count), 1);

    return (
        <Card fullWidth radius="lg" className={expeditionCardClass}>
            <CardHeader className={expeditionCardHeaderClass}>
                <div>
                    <p className="font-semibold">특성</p>
                    <p className="mt-0.5 text-xs text-default-500">주요 특성 조합과 캐릭터별 구성을 확인합니다.</p>
                </div>
            </CardHeader>
            <CardBody className="p-4">
                <div className="grid h-[270px] w-full grid-cols-[1fr_1px_1.2fr] gap-3">
                    <div className="flex h-full grow flex-col gap-1.5 overflow-y-auto pr-1 scrollbar-hide">
                        <div className="sticky top-0 z-10 flex w-full items-center gap-1 rounded-lg bg-default-100/95 px-2 py-1.5 backdrop-blur dark:bg-[#242427]/95">
                            <div className="grow border-b border-dotted border-default-800" />
                                <h3 className="text-xs font-semibold">특성 조합 분포</h3>
                            <div className="grow border-b border-dotted border-default-800" />
                        </div>
                        {statComboSummary.length > 0 ? (
                            statComboSummary.map((item) => (
                                <div
                                    key={item.label}
                                    className="rounded-xl border border-default-200/70 bg-content1/70 px-2 py-2 transition-colors hover:border-default-300 dark:border-white/10 dark:bg-white/[0.025] dark:hover:border-white/20">
                                    <div className="flex w-full items-center gap-1.5">
                                        <div className="flex min-w-0 grow items-center gap-1">
                                            {item.label.split(' / ').map((stat, index) => (
                                                <div key={`${stat}-${index}`} className="flex min-w-0 items-center gap-1">
                                                    {index > 0 ? <span className="text-[10px] text-default-400">+</span> : null}
                                                    <Chip
                                                        size="sm"
                                                        variant="flat"
                                                        color={getStatChipColor(stat)}
                                                        radius="md"
                                                        className="h-6 px-1 text-[10px] font-semibold">
                                                        {stat}
                                                    </Chip>
                                                </div>
                                            ))}
                                        </div>
                                        <span className="shrink-0 text-xs font-semibold tabular-nums">{item.count}명</span>
                                    </div>
                                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-default-200/80 dark:bg-white/10">
                                        <div
                                            className="h-full rounded-full bg-gradient-to-r from-primary-400 to-primary-600"
                                            style={{ width: `${item.count / maxStatComboCount * 100}%` }}
                                        />
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="fadedtext text-xs">300 이상 특성 조합이 있는 캐릭터가 없습니다.</p>
                        )}
                    </div>
                    <Divider orientation="vertical" className="h-full"/>
                    <div className="flex h-full grow flex-col gap-1.5 overflow-y-auto pr-1 scrollbar-hide">
                        <div className="sticky top-0 z-10 flex w-full items-center gap-1 rounded-lg bg-default-100/95 px-2 py-1.5 backdrop-blur dark:bg-[#242427]/95">
                            <div className="grow border-b border-dotted border-default-800" />
                            <h3 className="text-xs font-semibold">캐릭터들의 특성 조합</h3>
                            <div className="grow border-b border-dotted border-default-800" />
                        </div>
                        {characterStatUsageSummary.length > 0 ? (
                            characterStatUsageSummary.map((character) => (
                                <div
                                    key={character.nickname}
                                    className="flex w-full items-center gap-2 rounded-lg px-1.5 py-1.5 text-xs transition-colors hover:bg-default-100 dark:hover:bg-white/[0.05]">
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
        <Card fullWidth radius="lg" className={expeditionCardClass}>
            <CardHeader className={expeditionCardHeaderClass}>
                <div className="w-full flex gap-1 items-center">
                    <div>
                        <h1 className="font-semibold">각인</h1>
                        <p className="mt-0.5 text-xs text-default-500">원정대에서 사용하는 각인을 집계합니다.</p>
                    </div>
                    <div className="flex gap-1 items-end ml-auto text-sm">
                        <p className="fadedtext">총 각인 레벨 합 :</p>
                        <p className="text-md text-orange-600 dark:text-orange-400">{sumEngraving.toLocaleString()}</p>
                    </div>
                </div>
            </CardHeader>
            <CardBody className="p-4">
                <div className="grid h-[270px] w-full grid-cols-[1fr_1px_1fr] gap-3">
                    <div className="flex h-full flex-col gap-1.5 overflow-y-auto pr-1 scrollbar-hide">
                        <div className="sticky top-0 z-10 flex w-full items-center gap-1 rounded-lg bg-default-100/95 px-2 py-1.5 backdrop-blur dark:bg-[#242427]/95">
                            <div className="grow border-b border-dotted border-default-800" />
                            <h3 className="text-xs font-semibold">자주 사용하는 각인</h3>
                            <div className="grow border-b border-dotted border-default-800" />
                        </div>
                        {engravingSummary.length > 0 ? (
                            engravingSummary.map((engraving) => (
                                <div
                                    key={engraving.name}
                                    className="flex w-full items-center gap-2 rounded-lg px-1.5 py-1 transition-colors hover:bg-default-100 dark:hover:bg-white/[0.05]">
                                    <img
                                        src={getEngravingSrcByName(engraving.name)}
                                        alt={engraving.name}
                                        className="h-7 w-7 shrink-0 rounded-lg"/>
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
                    <div className="flex h-full flex-col gap-1.5 overflow-y-auto pr-1 scrollbar-hide">
                        <div className="sticky top-0 z-10 flex w-full items-center gap-1 rounded-lg bg-default-100/95 px-2 py-1.5 backdrop-blur dark:bg-[#242427]/95">
                            <div className="grow border-b border-dotted border-default-800" />
                            <h3 className="text-xs font-semibold">유물 각인서</h3>
                            <div className="grow border-b border-dotted border-default-800" />
                        </div>
                        {relicEngravingSummary.length > 0 ? (
                            relicEngravingSummary.map((engraving) => (
                                <div
                                    key={`relic-${engraving.name}`}
                                    className="flex w-full items-center gap-2 rounded-lg px-1.5 py-1 transition-colors hover:bg-default-100 dark:hover:bg-white/[0.05]">
                                    <img
                                        src={getEngravingSrcByName(engraving.name)}
                                        alt={engraving.name}
                                        className="h-7 w-7 shrink-0 rounded-lg"/>
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
        <Card fullWidth radius="lg" className={expeditionCardClass}>
            <CardHeader className={expeditionCardHeaderClass}>
                <div>
                    <p className="font-semibold">아크그리드</p>
                    <p className="mt-0.5 text-xs text-default-500">코어·젬 등급과 주요 코어를 집계합니다.</p>
                </div>
            </CardHeader>
            <CardBody className="p-4">
                <div className="grid h-[270px] w-full grid-cols-[2fr_1px_3fr] gap-3">
                    <div className="h-full flex flex-col gap-2 pr-1">
                        <div className="flex-1 h-full flex flex-col gap-1.5">
                                <div className="flex w-full items-center gap-1 rounded-lg bg-default-100/80 px-2 py-1.5 dark:bg-white/[0.045]">
                                <div className="grow border-b border-dotted border-default-800" />
                                <h3 className="text-xs font-semibold">코어 개수</h3>
                                <div className="grow border-b border-dotted border-default-800" />
                            </div>
                            {coreGradeSummary.map((item) => (
                                <div
                                    key={item.grade}
                                    className="flex w-full items-center gap-2 rounded-lg px-1.5 py-1 text-xs transition-colors hover:bg-default-100 dark:hover:bg-white/[0.05]">
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
                            <div className="flex w-full items-center gap-1 rounded-lg bg-default-100/80 px-2 py-1.5 dark:bg-white/[0.045]">
                                <div className="grow border-b border-dotted border-default-800" />
                                <h3 className="text-xs font-semibold">젬 개수</h3>
                                <div className="grow border-b border-dotted border-default-800" />
                            </div>
                            {gemGradeSummary.map((item) => (
                                <div
                                    key={`gem-${item.grade}`}
                                    className="flex w-full items-center gap-2 rounded-lg px-1.5 py-1 text-xs transition-colors hover:bg-default-100 dark:hover:bg-white/[0.05]">
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
                    <div className="flex h-full flex-col gap-1.5 overflow-y-auto pr-1 scrollbar-hide">
                        {highGradeCores.length > 0 ? (
                            highGradeCores.map((core, index) => (
                                <div
                                    key={`${core.nickname}-${core.name}-${index}`}
                                    className="flex w-full items-center gap-2 rounded-xl border border-transparent p-1.5 text-xs transition-colors hover:border-default-200 hover:bg-default-100 dark:hover:border-white/10 dark:hover:bg-white/[0.05]">
                                    <div className={clsx(
                                        "h-10 w-10 shrink-0 rounded-xl p-[2px]",
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

// 캐릭터 통계
function Characters({ expeditionCharacters }: { expeditionCharacters: ExpeditionCharacter[] }) {
    const [level, setLevel] = useState(1640);
    const [characters, setCharacters] = useState<ExpeditionCharacter[]>([]);
    const contentLevels = [...homeData.contentLevels]
        .filter((contentLevel) => contentLevel >= 1580)
        .sort((a, b) => b - a);
    const dealerCharacters = characters.filter(character => character.profile.characterType === 'attack');
    const supportCharacters = characters.filter(character => character.profile.characterType === 'supportor');
    const averageCombatPower = getAverageCombatPower(characters);
    const averageDealerCombatPower = getAverageCombatPower(dealerCharacters);
    const averageSupportCombatPower = getAverageCombatPower(supportCharacters);
    const maxCombatPower = getMaxCombatPower(characters);
    const minCombatPower = getMinCombatPower(characters);
    const averageItemLevel = getAverageItemLevel(characters);
    const averageDealerItemLevel = getAverageItemLevel(dealerCharacters);
    const averageSupportItemLevel = getAverageItemLevel(supportCharacters);
    const maxItemLevel = getMaxItemLevel(characters);
    const minItemLevel = getMinItemLevel(characters);
    const combatPowerByLevelRange = contentLevels.map((currentLevel, index) => {
        const upperLevel = index === 0 ? null : contentLevels[index - 1];
        const targetCharacters = expeditionCharacters.filter(character => {
            const itemLevel = character.profile.itemLevel;

            if (upperLevel === null) {
                return itemLevel >= currentLevel;
            }

            return itemLevel >= currentLevel && itemLevel < upperLevel;
        });

        return {
            label: upperLevel === null
                ? `${currentLevel} ~`
                : `${currentLevel} ~ ${upperLevel-1}`,
            averageCombatPower: getAverageCombatPower(targetCharacters)
        };
    });
    const createInitialClassCounts = () => classData.classImgs.map(data => {
        return { className: data.job, count: 0 };
    });
    const [classCounts, setClassCount] = useState<ClassCount[]>(createInitialClassCounts);

    useEffect(() => {
        setCharacters(expeditionCharacters.filter(character => character.profile.itemLevel >= level));
    }, [expeditionCharacters, level]);

    useEffect(() => {
        const nextClassCounts = createInitialClassCounts();
        characters.forEach(character => {
            const findIndex = nextClassCounts.findIndex(c => c.className === character.profile.className);
            if (findIndex > -1) {
                nextClassCounts[findIndex].count++;
            }
        });
        nextClassCounts.sort((a, b) => b.count - a.count);
        setClassCount(nextClassCounts);
    }, [characters]);

    return (
        <Card fullWidth radius="lg" className={expeditionCardClass}>
            <CardHeader className={expeditionCardHeaderClass}>
                <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center">
                    <div>
                        <h1 className="text-lg font-semibold">캐릭터 통계</h1>
                        <p className="mt-0.5 text-xs text-default-500">설정한 레벨 이상 캐릭터 {characters.length}명을 집계합니다.</p>
                    </div>
                    <NumberInput
                        hideStepper
                        size="sm"
                        radius="sm"
                        label="집계 대상 최소 레벨"
                        placeholder="0 ~ 9999"
                        value={level}
                        onValueChange={setLevel}
                        maxLength={4}
                        className="w-full sm:ml-auto sm:w-[180px]"
                        classNames={{
                            inputWrapper: "h-11 border border-default-200 bg-default-100/80 shadow-none dark:border-white/10 dark:bg-white/[0.05]"
                        }}/>
                </div>
            </CardHeader>
            <CardBody className="p-4 sm:p-5">
                <div className="flex w-full flex-col gap-4 xl:flex-row xl:items-stretch">
                    <div className={clsx(expeditionInsetClass, "grid min-h-[240px] w-full grid-cols-[1fr_1px_1fr] gap-4 p-4 xl:w-[480px]")}>
                        <div className="flex min-w-0 flex-col items-center">
                            <p className="text-xs font-medium text-default-500">전투력 평균</p>
                            <p className="mt-1 text-3xl font-bold tracking-tight">{formatCombatPower(averageCombatPower)}</p>
                            <div className="w-full flex gap-2 items-center mt-auto text-xs">
                                <p className="shrink-0">딜러 평균</p>
                                <div className="grow border-b border-dotted border-default-300" />
                                <p className="shrink-0 text-danger">{formatCombatPower(averageDealerCombatPower)}</p>
                            </div>
                            <div className="w-full flex gap-2 items-center mt-2 text-xs">
                                <p className="shrink-0">서폿 평균</p>
                                <div className="grow border-b border-dotted border-default-300" />
                                <p className="shrink-0 text-success">{formatCombatPower(averageSupportCombatPower)}</p>
                            </div>
                            <div className="w-full flex gap-2 items-center mt-2 text-xs">
                                <p className="shrink-0">최고 전투력</p>
                                <div className="grow border-b border-dotted border-default-300" />
                                <p className="shrink-0">{formatCombatPower(maxCombatPower)}</p>
                            </div>
                            <div className="w-full flex gap-2 items-center mt-2 text-xs">
                                <p className="shrink-0">최저 전투력</p>
                                <div className="grow border-b border-dotted border-default-300" />
                                <p className="shrink-0">{formatCombatPower(minCombatPower)}</p>
                            </div>
                        </div>
                        <Divider orientation="vertical" className="min-h-full"/>
                        <div className="flex w-full min-w-0 flex-col items-center">
                            <div className="w-full flex gap-1 items-center">
                                <div className="grow border-b border-dotted border-default-800" />
                                <h3 className="whitespace-nowrap text-xs font-semibold">레벨대 전투력 평균</h3>
                                <div className="grow border-b border-dotted border-default-800" />
                            </div>
                            <div className="w-full flex flex-col gap-1 mt-2 text-xs">
                                {combatPowerByLevelRange.map((item) => (
                                    <div
                                        key={item.label}
                                        className="w-full flex gap-2 items-center">
                                        <p className="shrink-0">{item.label}</p>
                                        <div className="grow border-b border-dotted border-default-300" />
                                        <p className="shrink-0 font-semibold">{formatCombatPower(item.averageCombatPower)}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className={clsx(expeditionInsetClass, "flex min-h-[240px] w-full self-stretch p-4 xl:w-[210px]")}>
                        <div className="flex w-full flex-col items-center">
                            <p className="text-xs font-medium text-default-500">아이템 레벨 평균</p>
                            <p className="mt-1 text-3xl font-bold tracking-tight">{formatCombatPower(averageItemLevel)}</p>
                            <div className="w-full flex gap-2 items-center mt-auto text-xs">
                                <p className="shrink-0">딜러 평균</p>
                                <div className="grow border-b border-dotted border-default-300" />
                                <p className="shrink-0 text-danger">{formatCombatPower(averageDealerItemLevel)}</p>
                            </div>
                            <div className="w-full flex gap-2 items-center mt-2 text-xs">
                                <p className="shrink-0">서폿 평균</p>
                                <div className="grow border-b border-dotted border-default-300" />
                                <p className="shrink-0 text-success">{formatCombatPower(averageSupportItemLevel)}</p>
                            </div>
                            <div className="w-full flex gap-2 items-center mt-2 text-xs">
                                <p className="shrink-0">최고 레벨</p>
                                <div className="grow border-b border-dotted border-default-300" />
                                <p className="shrink-0">{formatCombatPower(maxItemLevel)}</p>
                            </div>
                            <div className="w-full flex gap-2 items-center mt-2 text-xs">
                                <p className="shrink-0">최저 레벨</p>
                                <div className="grow border-b border-dotted border-default-300" />
                                <p className="shrink-0">{formatCombatPower(minItemLevel)}</p>
                            </div>
                        </div>
                    </div>
                    <div className={clsx(expeditionInsetClass, "h-fit grow p-4")}>
                        <div className="mb-3 flex items-center justify-between">
                            <p className="text-xs font-semibold text-default-600 dark:text-default-300">직업 구성</p>
                            <span className="text-[10px] text-default-400">{classCounts.filter((count) => count.count > 0).length}개 직업</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-5">
                            {classCounts.filter(count => count.count > 0).map((count, index) => (
                                <Chip
                                    key={index}
                                    size="sm"
                                    variant="flat"
                                    radius="md"
                                    startContent={<JobEmblemIcon job={count.className} size={16}/>}
                                    className="min-w-full border border-default-200/80 bg-content1/80 dark:border-white/10 dark:bg-white/[0.05]">
                                    <div className="flex w-full items-center text-xs">
                                        <p>{count.className}</p>
                                        <p className="ml-auto font-semibold">{count.count}</p>
                                    </div>
                                </Chip>
                            ))}
                        </div>
                    </div>
                </div>
            </CardBody>
        </Card>
    )
}

// 캐릭터 이미지 출력
function CharacterImages({ expeditionCharacters }: { expeditionCharacters: ExpeditionCharacter[] }) {
    const visibleCharacters = expeditionCharacters.filter((character) => character.profile.characterImageUrl !== '-');

    return (
        <Card fullWidth radius="lg" className={clsx(expeditionCardClass, "mt-4")}>
            <CardHeader className={expeditionCardHeaderClass}>
                <div className="flex w-full items-center justify-between gap-3">
                    <div>
                        <p className="font-semibold">캐릭터 아바타</p>
                        <p className="mt-0.5 text-xs text-default-500">원정대 캐릭터의 현재 모습을 모아봅니다.</p>
                    </div>
                    <Chip size="sm" radius="full" variant="flat" color="primary">{visibleCharacters.length}명</Chip>
                </div>
            </CardHeader>
            <CardBody className="p-4 sm:p-5">
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md960:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7">
                    {visibleCharacters.map((character) => (
                            <div
                                key={character.nickname}
                                className="group relative w-full overflow-hidden rounded-2xl border border-default-200/80 bg-[#11151b] shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary-300 hover:shadow-lg dark:border-white/10 dark:hover:border-primary-500/40">
                                <div className="relative aspect-[3/5] w-full overflow-hidden">
                                    <img
                                        src={character.profile.characterImageUrl}
                                        alt={character.nickname}
                                        loading="lazy"
                                        className="h-full w-full object-cover object-top transition-transform duration-300 group-hover:scale-[1.025]"/>
                                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/90 via-black/55 to-transparent"/>
                                    <div className="absolute inset-x-0 bottom-0 p-2.5 text-white">
                                        <p className="truncate text-xs font-semibold">{character.nickname}</p>
                                        <div className="mt-1 flex items-center justify-between gap-1 text-[10px] text-white/65">
                                            <span className="truncate">{character.profile.className}</span>
                                            <span className="shrink-0 font-medium text-white/85">Lv.{character.profile.itemLevel.toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                </div>
            </CardBody>
        </Card>
    )
}
