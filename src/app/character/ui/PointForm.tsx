import { useState } from "react";
import { getColorByProgress, getCompleteMaxPoint, getCompletePoint, getProgressData } from "../lib/pointFeat";
import { Card, CardBody, CardFooter, CardHeader, Checkbox, Divider, Popover, PopoverContent, PopoverTrigger, Progress, Switch, Tooltip } from "@heroui/react";
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
    const progressValue = getProgressData(collects);
    const progressMax = collects.length * 100;
    const progressPercent = progressMax > 0 ? Math.round(progressValue / progressMax * 100) : 0;

    return (
        <div className="w-full">
            <Card fullWidth radius="lg" className="mb-8 border border-default-200/80 bg-content1/95 shadow-sm dark:border-white/10 dark:bg-[#18181b]">
                <CardHeader className="px-5 py-4">
                    <div>
                        <p className="text-lg font-semibold">수집형 포인트</p>
                        <p className="text-xs text-default-500">전체 수집 진행도와 현재 적용 중인 보상을 확인하세요.</p>
                    </div>
                </CardHeader>
                <Divider/>
                <CardBody className="p-4 sm:p-5">
                    <div className="grid w-full grid-cols-1 gap-4 md960:grid-cols-[280px_minmax(0,1fr)_220px] md960:items-stretch">
                        <div className="flex w-full flex-col justify-between rounded-xl bg-default-50 p-4 dark:bg-white/[0.04]">
                            <div className="mb-3 flex items-end justify-between gap-2">
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
                            />
                            <Switch
                                isSelected={isSelected}
                                onValueChange={setSelected}
                                size="sm"
                                className="mt-4 min-w-full"
                            >
                                미달성 항목만 보기
                            </Switch>
                        </div>
                        <div className="grid w-full grid-cols-2 gap-2 rounded-xl bg-default-50 p-3 dark:bg-white/[0.04]">
                            {hobbys.map((hobby, index) => (
                                <div key={index} className="rounded-lg bg-white/80 px-3 py-2 dark:bg-white/[0.04]">
                                    <div className="mb-1.5 flex w-full gap-1 text-xs">
                                        <p className="grow font-medium">{hobby.type}</p>
                                        <p className="font-semibold tabular-nums">{hobby.point}<span className="font-normal text-default-400">/{hobby.maxPoint}</span></p>
                                    </div>
                                    <Progress
                                        size="sm"
                                        color="warning"
                                        value={hobby.point}
                                        maxValue={hobby.maxPoint}
                                    />
                                </div>
                            ))}
                        </div>
                        <div className="w-full rounded-xl bg-default-50 p-3 dark:bg-white/[0.04]">
                            <p className="mb-2 text-xs font-semibold text-default-500">수집 보상 장비</p>
                            <Popover showArrow disableAnimation>
                                <PopoverTrigger>
                                    <div className="w-full flex items-center gap-2 cursor-pointer">
                                        <div className={`w-[32px] h-[32px] p-[1px] aspect-square rounded-md ${getBackgroundByGrade(collectEquipments.length > 0 ? collectEquipments[0].grade : "")}`}>
                                            {collectEquipments.length > 0 ? (
                                                <img
                                                    src={collectEquipments[0].icon}
                                                    alt="수집품 장비 1"
                                                    className="w-[26px] h-[26px]"
                                                />
                                            ) : null}
                                        </div>
                                        <div>
                                            <p className={`w-full text-[11pt] truncate ${getColorTextByGrade(collectEquipments.length > 0 ? collectEquipments[0].grade : "")}`}>
                                                {collectEquipments.length > 0 ? `${collectEquipments[0].grade} ${collectEquipments[0].type}` : "-"}
                                            </p>
                                            <p className="fadedtext text-[9pt]">{getTextAttack(collectEquipments.length > 0 ? collectEquipments[0].grade : "")}</p>
                                        </div>
                                    </div>
                                </PopoverTrigger>
                                <PopoverContent className="backdrop-blur-lg bg-white/70 dark:bg-[#141414]/70">
                                    <div className="max-w-[240px] pt-2 pl-1 pr-1 pb-2">
                                        <ul className="list-disc pl-4">
                                            {collectEquipments.length > 0 ? collectEquipments[0].descriptions.map((line, idx) => (
                                                <li key={idx}>{line}</li>
                                            )) : null}
                                        </ul>
                                    </div>
                                </PopoverContent>
                            </Popover>
                            <Popover showArrow disableAnimation>
                                <PopoverTrigger>
                                    <div className="w-full flex items-center gap-2 cursor-pointer mt-1">
                                        <div className={`w-[32px] h-[32px] p-[1px] aspect-square rounded-md ${getBackgroundByGrade(collectEquipments.length > 1 ? collectEquipments[1].grade : "-")}`}>
                                            {collectEquipments.length > 1 ? (
                                                <img
                                                    src={collectEquipments[1].icon}
                                                    alt="수집품 장비 2"
                                                    className="w-[26px] h-[26px]"
                                                />
                                            ) : null}
                                        </div>
                                        <div>
                                            <p className={`w-full text-[11pt] truncate ${getColorTextByGrade(collectEquipments.length > 1 ? collectEquipments[1].grade : "")}`}>
                                                {collectEquipments.length > 1 ? `${collectEquipments[1].grade} ${collectEquipments[1].type}` : "-"}
                                            </p>
                                            <p className="fadedtext text-[9pt]">{getTextAttack(collectEquipments.length > 1 ? collectEquipments[1].grade : "-")}</p>
                                        </div>
                                    </div>
                                </PopoverTrigger>
                                <PopoverContent className="backdrop-blur-lg bg-white/70 dark:bg-[#141414]/70">
                                    <div className="max-w-[240px] pt-2 pl-1 pr-1 pb-2">
                                        <ul className="list-disc pl-4">
                                            {collectEquipments.length > 1 ? collectEquipments[1].descriptions.map((line, idx) => (
                                                <li key={idx}>{line}</li>
                                            )) : null}
                                        </ul>
                                    </div>
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>
                </CardBody>
            </Card>
            <DetailComponent collects={collects} isSelected={isSelected} />
        </div>
    );
}

type DetailComponentProps = {
    collects: Collect[];
    isSelected: boolean;
};

export function DetailComponent({ collects, isSelected }: DetailComponentProps) {
    return (
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 md960:grid-cols-4 gap-4">
            {collects.map((collect, index) => (
                <CollectDetailCard key={index} collect={collect} isSelected={isSelected} />
            ))}
        </div>
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
        <Card
            radius="sm"
            className={clsx(
                isSelected && completePoint === maxPoint ? "hidden" : "flex"
            )}
        >
            <CardHeader>
                <div className="w-full">
                    <div className="w-full flex gap-2 items-center">
                        <img src={collect.icon} alt={collect.type} className="w-6 h-6" />
                        <p className="grow text-md">{collect.type}</p>
                        <p className="fadedtext text-sm">{completePoint} / {maxPoint}</p>
                    </div>
                    <Progress
                        size="sm"
                        color={getColorByProgress(completePoint, maxPoint)}
                        value={completePoint}
                        maxValue={maxPoint}
                        className="mt-2"
                    />
                </div>
            </CardHeader>
            <Divider />
            <CardBody>
                <div className="w-full max-h-[500px] overflow-y-auto scrollbar-hide">
                    {!isShowMethod ? collect.items.map((item, idx) => {
                        const method = getCollectMethod(collect.type, item.name);
                        return (
                            <div
                                key={idx}
                                className={clsx(
                                    "w-full flex gap-2 mb-2 items-center",
                                    isSelected && item.point >= item.maxPoint ? "hidden" : "block"
                                )}
                            >
                                <div className="grow min-w-0">
                                    <p
                                        className={clsx(
                                            "text-sm",
                                            item.point >= item.maxPoint ? "opacity-50" : ""
                                        )}
                                    >
                                        {item.name}
                                    </p>
                                    {method ? (
                                        <p
                                            className={clsx(
                                                "block w-full text-[8pt] fadedtext truncate whitespace-nowrap overflow-hidden text-ellipsis",
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
                                            "text-sm",
                                            item.point >= item.maxPoint ? "fadedtext" : ""
                                        )}
                                    >
                                        {item.point} / {item.maxPoint}
                                    </p>
                                )}
                                {item.point >= item.maxPoint ? <div className="w-4 h-4"><CheckIcon /></div> : null}
                            </div>
                        );
                    }) : methodSummaries.map((summary, idx) => (
                        <div
                            key={idx}
                            className={clsx(
                                "w-full flex gap-2 mb-2 items-center",
                                isSelected && summary.completed >= summary.total ? "hidden" : "block"
                            )}
                        >
                            <Tooltip showArrow content={summary.name}>
                                <p
                                    className={clsx(
                                        "min-w-0 truncate text-sm",
                                        summary.completed >= summary.total ? "opacity-50" : ""
                                    )}>
                                    {summary.method}
                                </p>
                            </Tooltip>
                            <div className="grow"/>
                            <p
                                className={clsx(
                                    "shrink-0 whitespace-nowrap text-sm",
                                    summary.completed >= summary.total ? "fadedtext" : ""
                                )}
                            >
                                {summary.completed} / {summary.total}
                            </p>
                        </div>
                    ))}
                </div>
            </CardBody>
            <Divider />
            <CardFooter>
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
            </CardFooter>
        </Card>
    );
}
