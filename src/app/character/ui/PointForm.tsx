import { useState } from "react";
import { getColorByProgress, getCompleteMaxPoint, getCompletePoint, getProgressData } from "../lib/pointFeat";
import { Card, CardBody, CardHeader, Checkbox, Divider, Popover, PopoverContent, PopoverTrigger, Progress, Switch, Tooltip } from "@heroui/react";
import CheckIcon from "@/Icons/CheckIcon";
import clsx from "clsx";
import { getBackgroundByGrade, getColorTextByGrade } from "@/utiils/utils";
import { getTextAttack } from "../lib/skillFeat";
import { CharacterInfo, Collect } from "../model/types";
import collectData from "@/data/characters/collect/data.json";

function getCollectMethod(type: string, name: string): string | null {
    const findType = collectData.find((item) => item.type === type);
    const findCollection = findType?.collections.find((item) => item.name === name);

    return findCollection?.method ?? null;
}

type CollectMethodSummary = {
    name: string;
    method: string;
    total: number;
    completed: number;
};

function getCollectMethodSummaries(collect: Collect): CollectMethodSummary[] {
    const methodMap = new Map<string, CollectMethodSummary>();

    for (const item of collect.items) {
        const method = getCollectMethod(collect.type, item.name);
        if (!method) {
            continue;
        }

        const completed = item.point >= item.maxPoint ? 1 : 0;
        const summary = methodMap.get(method);

        if (summary) {
            summary.total += 1;
            summary.completed += completed;
            continue;
        }

        methodMap.set(method, {
            name: item.name,
            method,
            total: 1,
            completed
        });
    }

    return Array.from(methodMap.values());
}

export function PointComponent({ info }: { info: CharacterInfo }) {
    const collects = info.collection.collects;
    const hobbys = info.collection.hobbys;
    const collectEquipments = info.collection.collectEquipments;
    const [isSelected, setSelected] = useState(false);
    const [selectedCollectType, setSelectedCollectType] = useState(collects[0]?.type ?? '');
    const progressValue = getProgressData(collects);
    const progressMax = collects.length * 100;
    const progressPercent = progressMax > 0 ? Math.round(progressValue / progressMax * 100) : 0;

    return (
        <div className="w-full">
            <Card fullWidth radius="lg" className="mb-4 border border-default-200/80 bg-content1/95 shadow-sm dark:border-white/10 dark:bg-[#18181b]">
                <CardHeader className="px-4 py-3 sm:px-5">
                    <div>
                        <p className="text-lg font-semibold">수집형 포인트</p>
                        <p className="text-xs text-default-500">전체 수집 진행도와 현재 적용 중인 보상을 확인하세요.</p>
                    </div>
                </CardHeader>
                <Divider />
                <CardBody className="grid p-0 md960:grid-cols-[220px_minmax(0,1fr)_200px]">
                    <section className="min-w-0 border-b border-default-200/70 px-4 py-4 dark:border-white/10 md960:border-b-0 md960:border-r">
                        <div className="mb-2 flex items-end justify-between gap-2">
                            <div>
                                <p className="text-xs font-medium text-default-500">전체 진행도</p>
                                <p className="mt-1 text-3xl font-bold tabular-nums">{progressPercent}<span className="ml-0.5 text-base font-semibold text-default-400">%</span></p>
                            </div>
                            <p className="text-xs tabular-nums text-default-500">{progressValue} / {progressMax}</p>
                        </div>
                        <Progress
                            radius="sm"
                            value={progressValue}
                            maxValue={progressMax}
                            color={getColorByProgress(progressValue, progressMax)}
                            classNames={{ track: "h-1.5" }}
                        />
                        <div className="mt-4 border-t border-default-200/70 pt-3 dark:border-white/10">
                            <Switch isSelected={isSelected} onValueChange={setSelected} size="sm">
                                <span className="text-xs">미달성 항목만 보기</span>
                            </Switch>
                        </div>
                    </section>
                    <section className="min-w-0 border-b border-default-200/70 px-4 py-3 dark:border-white/10 md960:border-b-0 md960:border-r">
                        <h3 className="mb-1 text-xs font-semibold text-default-500">성향</h3>
                        <div className="grid grid-cols-1 gap-x-4 min-[460px]:grid-cols-2">
                            {hobbys.map((hobby, index) => (
                                <div key={index} className="border-b border-default-200/70 py-2.5 dark:border-white/10">
                                    <div className="mb-1 flex w-full gap-1 text-xs">
                                        <p className="grow font-medium">{hobby.type}</p>
                                        <p className="font-semibold tabular-nums">{hobby.point}<span className="font-normal text-default-400">/{hobby.maxPoint}</span></p>
                                    </div>
                                    <Progress
                                        size="sm"
                                        color="warning"
                                        value={hobby.point}
                                        maxValue={hobby.maxPoint}
                                        classNames={{ track: "h-1" }}
                                    />
                                </div>
                            ))}
                        </div>
                    </section>
                    <section className="min-w-0 px-4 py-3">
                        <h3 className="mb-1 text-xs font-semibold text-default-500">수집 보상 장비</h3>
                        {Array.from({ length: 2 }, (_, index) => {
                            const equipment = collectEquipments[index];

                            return (
                                <Popover key={index} showArrow disableAnimation>
                                    <PopoverTrigger>
                                        <button type="button" className="flex w-full min-w-0 items-center gap-2 border-b border-default-200/70 py-2 text-left transition-colors hover:bg-default-50 dark:border-white/10 dark:hover:bg-white/[0.04]">
                                            <div className={`h-8 w-8 shrink-0 rounded-md p-[1px] ${getBackgroundByGrade(equipment?.grade ?? "")}`}>
                                                {equipment ? <img src={equipment.icon} alt={`수집품 장비 ${index + 1}`} className="h-full w-full rounded-[5px] object-cover" /> : null}
                                            </div>
                                            <div className="min-w-0">
                                                <p className={`truncate text-xs font-semibold ${getColorTextByGrade(equipment?.grade ?? "")}`}>
                                                    {equipment ? `${equipment.grade} ${equipment.type}` : "-"}
                                                </p>
                                                <p className="text-[11px] text-default-500">{getTextAttack(equipment?.grade ?? "")}</p>
                                            </div>
                                        </button>
                                    </PopoverTrigger>
                                    <PopoverContent className="border border-default-200 bg-content1/95 shadow-xl dark:border-white/10 dark:bg-[#18181b]/95">
                                        <div className="max-w-[280px] p-4">
                                            <ul className="list-disc space-y-1 pl-4 text-xs leading-5 text-default-600 dark:text-default-300">
                                                {equipment?.descriptions.map((line, idx) => <li key={idx}>{line}</li>)}
                                            </ul>
                                        </div>
                                    </PopoverContent>
                                </Popover>
                            );
                        })}
                    </section>
                </CardBody>
            </Card>
            <DetailComponent
                collects={collects}
                isSelected={isSelected}
                selectedCollectType={selectedCollectType}
                onSelectCollect={setSelectedCollectType}
            />
        </div>
    );
}

type DetailComponentProps = {
    collects: Collect[];
    isSelected: boolean;
    selectedCollectType: string;
    onSelectCollect: (type: string) => void;
};

export function DetailComponent({ collects, isSelected, selectedCollectType, onSelectCollect }: DetailComponentProps) {
    const visibleCollects = isSelected
        ? collects.filter((collect) => getCompletePoint(collect) < getCompleteMaxPoint(collect))
        : collects;
    const selectedCollect = visibleCollects.find((collect) => collect.type === selectedCollectType) ?? visibleCollects[0] ?? null;

    return (
        <Card fullWidth radius="lg" className="overflow-hidden border border-default-200/80 bg-content1/95 shadow-sm dark:border-white/10 dark:bg-[#18181b]">
            <CardBody className="grid p-0 md960:grid-cols-[240px_minmax(0,1fr)]">
                <section className="min-w-0 border-b border-default-200/80 bg-default-50/30 dark:border-white/10 dark:bg-white/[0.015] md960:border-b-0 md960:border-r">
                    <div className="border-b border-default-200/70 px-4 py-3 dark:border-white/10">
                        <h3 className="text-sm font-semibold">수집 종류</h3>
                        <p className="mt-0.5 text-xs text-default-500">종류별 수집 현황</p>
                    </div>
                    {visibleCollects.length > 0 ? (
                        <div role="tablist" aria-label="수집형 포인트 종류" className="grid grid-cols-2 gap-1 p-2 sm:grid-cols-3 md960:grid-cols-1">
                            {visibleCollects.map((collect) => {
                                const completePoint = getCompletePoint(collect);
                                const maxPoint = getCompleteMaxPoint(collect);
                                const isActive = selectedCollect?.type === collect.type;

                                return (
                                    <button
                                        key={collect.type}
                                        type="button"
                                        role="tab"
                                        aria-selected={isActive}
                                        onClick={() => onSelectCollect(collect.type)}
                                        className={clsx(
                                            "min-w-0 cursor-pointer rounded-lg px-2.5 py-2 text-left transition-colors",
                                            isActive
                                                ? "bg-primary-50 text-primary dark:bg-primary-500/10"
                                                : "hover:bg-default-100 dark:hover:bg-white/[0.06]"
                                        )}
                                    >
                                        <div className="flex min-w-0 items-center gap-2">
                                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-default-100 p-1.5 dark:bg-white/[0.08]">
                                                <img src={collect.icon} alt="" className="h-full w-full object-contain" />
                                            </div>
                                            <div className="min-w-0 grow">
                                                <p className="truncate text-xs font-semibold">{collect.type}</p>
                                                <p className="text-[11px] tabular-nums text-default-500">{completePoint} / {maxPoint}</p>
                                            </div>
                                        </div>
                                        <Progress
                                            aria-label={`${collect.type} 진행도`}
                                            size="sm"
                                            color={getColorByProgress(completePoint, maxPoint)}
                                            value={completePoint}
                                            maxValue={maxPoint}
                                            className="mt-1.5"
                                            classNames={{ track: "h-1" }}
                                        />
                                    </button>
                                );
                            })}
                        </div>
                    ) : (
                        <p className="px-4 py-6 text-xs text-default-500">모든 수집 종류를 완료했습니다.</p>
                    )}
                </section>
                {selectedCollect ? (
                    <CollectDetailCard collect={selectedCollect} isSelected={isSelected} />
                ) : (
                    <div className="flex min-h-40 items-center justify-center px-4 text-center text-xs text-default-500">
                        전체 항목을 보려면 미달성 항목만 보기를 해제하세요.
                    </div>
                )}
            </CardBody>
        </Card>
    );
}

type CollectDetailCardProps = {
    collect: Collect;
    isSelected: boolean;
};

function CollectDetailCard({ collect, isSelected }: CollectDetailCardProps) {
    const [isShowMethod, setShowMethod] = useState(false);
    const completePoint = getCompletePoint(collect);
    const maxPoint = getCompleteMaxPoint(collect);
    const methodSummaries = getCollectMethodSummaries(collect);
    const canShowMethod = methodSummaries.length > 0;

    return (
        <section role="tabpanel" aria-label={`${collect.type} 수집 현황`} className="@container flex min-w-0 flex-col">
            <div className="border-b border-default-200/70 px-4 py-3 dark:border-white/10 sm:px-5">
                <div className="w-full">
                    <div className="flex w-full items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-default-100 p-1.5 dark:bg-white/[0.08]">
                            <img src={collect.icon} alt={collect.type} className="h-full w-full object-contain" />
                        </div>
                        <div className="min-w-0 grow">
                            <p className="truncate text-sm font-semibold">{collect.type}</p>
                            <p className="mt-0.5 text-xs text-default-500">보상 획득 현황</p>
                        </div>
                        <div className="shrink-0 text-right">
                            <p className="text-sm font-semibold tabular-nums">{completePoint}<span className="font-normal text-default-400"> / {maxPoint}</span></p>
                            <p className="mt-0.5 text-[11px] text-default-500">{maxPoint - completePoint}개 남음</p>
                        </div>
                    </div>
                    <Progress
                        size="sm"
                        color={getColorByProgress(completePoint, maxPoint)}
                        value={completePoint}
                        maxValue={maxPoint}
                        className="mt-2.5"
                        classNames={{ track: "h-1" }}
                    />
                </div>
            </div>
            <div className="grow px-4 py-2 sm:px-5">
                <div className="grid w-full grid-cols-1 gap-x-4 @min-[440px]:grid-cols-2 @min-[760px]:grid-cols-3">
                    {!isShowMethod ? collect.items.map((item, idx) => {
                        const method = getCollectMethod(collect.type, item.name);
                        return (
                            <div
                                key={idx}
                                className={clsx(
                                    "flex min-h-11 w-full items-center gap-2 border-b border-default-200/70 py-2 dark:border-white/10",
                                    isSelected && item.point >= item.maxPoint ? "hidden" : ""
                                )}
                            >
                                <div className="grow min-w-0">
                                    <p
                                        className={clsx(
                                            "text-sm font-medium",
                                            item.point >= item.maxPoint ? "opacity-50" : ""
                                        )}
                                    >
                                        {item.name}
                                    </p>
                                    {method ? (
                                        <p
                                            className={clsx(
                                                "block w-full truncate whitespace-nowrap text-[8pt] text-default-500",
                                                item.point >= item.maxPoint ? "opacity-50" : ""
                                            )}
                                        >
                                            {method}
                                        </p>
                                    ) : null}
                                </div>
                                {item.maxPoint === 1 ? null : (
                                    <p
                                        className={clsx(
                                            "text-xs font-medium tabular-nums",
                                            item.point >= item.maxPoint ? "fadedtext" : ""
                                        )}
                                    >
                                        {item.point} / {item.maxPoint}
                                    </p>
                                )}
                                {item.point >= item.maxPoint ? <div className="h-4 w-4 shrink-0 text-success"><CheckIcon /></div> : null}
                            </div>
                        );
                    }) : methodSummaries.map((summary, idx) => (
                        <div
                            key={idx}
                            className={clsx(
                                "flex min-h-11 w-full items-center gap-2 border-b border-default-200/70 py-2 dark:border-white/10",
                                isSelected && summary.completed >= summary.total ? "hidden" : ""
                            )}
                        >
                            <Tooltip showArrow content={summary.name}>
                                <p
                                    className={clsx(
                                        "min-w-0 truncate text-sm font-medium",
                                        summary.completed >= summary.total ? "opacity-50" : ""
                                    )}>
                                    {summary.method}
                                </p>
                            </Tooltip>
                            <div className="grow"/>
                            <p
                                className={clsx(
                                    "shrink-0 whitespace-nowrap text-xs font-medium tabular-nums",
                                    summary.completed >= summary.total ? "fadedtext" : ""
                                )}
                            >
                                {summary.completed} / {summary.total}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
            <div className="border-t border-default-200/70 bg-default-50/30 px-4 py-3 dark:border-white/10 dark:bg-white/[0.02] sm:px-5">
                <div className="w-full flex gap-1 items-center">
                    {completePoint === maxPoint ? (
                        <p className="text-xs text-green-600 dark:text-green-400">모든 수집품을 획득하였습니다.</p>
                    ) : (
                        <p className="text-xs fadedtext">{maxPoint - completePoint}개 남음</p>
                    )}
                    {canShowMethod ? (
                        <Checkbox
                            radius="full"
                            size="sm"
                            isSelected={isShowMethod}
                            onValueChange={setShowMethod}
                            className="ml-auto"
                        >
                            <p className="text-xs">획득처 표시</p>
                        </Checkbox>
                    ) : null}
                </div>
            </div>
        </section>
    );
}
