import { Button, Chip, Progress } from "@heroui/react";
import { useEffect, useState } from "react";
import clsx from "clsx";
import JobAvatar from "@/Icons/JobAvatar";
import ParadiseIcon from "@/Icons/ParadiseIcon";
import { FixedWeeklyContentStatus as FixedWeeklyContentStatusData } from "../lib/checklistFeat";

type FixedWeeklyContentStatusProps = {
    status: FixedWeeklyContentStatusData
}

export default function FixedWeeklyContentStatus({ status }: FixedWeeklyContentStatusProps) {
    const pageSize = 6;
    const [page, setPage] = useState(1);
    const isComplete = status.total > 0 && status.completed === status.total;
    const color = status.type === 'hallsHourglass' ? 'primary' : 'warning';
    const completionLabel = status.type === 'hallsHourglass' ? '할의 모래시계를' : '낙원을';
    const progressValue = status.total > 0 ? status.completed / status.total * 100 : 0;
    const totalPages = Math.ceil(status.incompleteCharacters.length / pageSize);
    const pageCharacters = status.incompleteCharacters.slice((page - 1) * pageSize, page * pageSize);

    useEffect(() => {
        setPage((currentPage) => Math.min(currentPage, Math.max(totalPages, 1)));
    }, [totalPages]);

    return (
        <div className="min-w-0 rounded-xl border border-default-200/80 bg-default-50/40 p-4 dark:border-white/10 dark:bg-white/[0.025]">
            <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2.5">
                    <span className={clsx(
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                        status.type === 'hallsHourglass' ? "bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400" : "bg-yellow-100 text-yellow-600 dark:bg-yellow-500/10 dark:text-yellow-400"
                    )}>
                        {status.type === 'hallsHourglass' ? (
                            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M6 3h12M6 21h12M8 3v4a4 4 0 0 0 1.2 2.8L12 12l-2.8 2.2A4 4 0 0 0 8 17v4M16 3v4a4 4 0 0 1-1.2 2.8L12 12l2.8 2.2A4 4 0 0 1 16 17v4"/></svg>
                        ) : (
                            <ParadiseIcon className="h-4 w-4"/>
                        )}
                    </span>
                    <div className="min-w-0">
                        <p className="truncate font-semibold">{status.title}</p>
                        <p className="mt-0.5 text-xs fadedtext">아직 완료하지 않은 캐릭터</p>
                    </div>
                </div>
                <Chip
                    size="sm"
                    radius="sm"
                    variant="flat"
                    color={color}
                    className="shrink-0"
                    classNames={status.type === 'paradise' ? { base: "bg-yellow-100 dark:bg-yellow-500/15", content: "text-yellow-700 dark:text-yellow-300" } : undefined}>
                    {status.completed} / {status.total} 완료
                </Chip>
            </div>

            <Progress
                aria-label={`${status.title} 완료 진행률`}
                className="mt-3"
                color={color}
                maxValue={100}
                radius="sm"
                size="sm"
                classNames={status.type === 'paradise' ? { track: "bg-yellow-100 dark:bg-yellow-500/10", indicator: "bg-yellow-400 dark:bg-yellow-400" } : undefined}
                value={progressValue}/>

            {status.total === 0 ? (
                <div className="mt-3 rounded-lg border border-dashed border-gray-200/80 px-3 py-3 text-center text-sm fadedtext dark:border-white/10">
                    대상 캐릭터가 없습니다.
                </div>
            ) : isComplete ? (
                <div className="mt-3 rounded-lg border border-success-200/70 bg-success-50/70 px-3 py-3 text-center text-sm text-success-700 dark:border-success-900/60 dark:bg-success-950/20 dark:text-success-300">
                    모든 캐릭터가 {completionLabel} 완료했습니다.
                </div>
            ) : (
                <div className="mt-3 grid grid-cols-1 gap-2 min-[420px]:grid-cols-2">
                    {pageCharacters.map((character) => (
                        <div
                            key={character.nickname}
                            className="flex min-w-0 items-center gap-2 rounded-lg border border-gray-200/80 bg-white px-2.5 py-2 dark:border-white/10 dark:bg-white/[0.025]">
                            <JobAvatar size="sm" job={character.job}/>
                            <div className="min-w-0 grow">
                                <p className="truncate text-sm font-medium">{character.nickname}</p>
                                <p className="truncate text-xs fadedtext">{character.job} · Lv.{character.level.toLocaleString()}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            {!isComplete && status.total > 0 && totalPages > 1 ? (
                <div className="mt-3 flex items-center justify-center gap-2">
                    <Button
                        isIconOnly
                        aria-label={`${status.title} 이전 페이지`}
                        className="h-8 min-h-8 w-8 min-w-8 text-xl font-bold"
                        isDisabled={page <= 1}
                        radius="full"
                        size="sm"
                        variant="flat"
                        onPress={() => setPage((currentPage) => Math.max(currentPage - 1, 1))}>
                        ‹
                    </Button>
                    <p className="min-w-12 text-center text-xs tabular-nums fadedtext">{page} / {totalPages}</p>
                    <Button
                        isIconOnly
                        aria-label={`${status.title} 다음 페이지`}
                        className="h-8 min-h-8 w-8 min-w-8 text-xl font-bold"
                        isDisabled={page >= totalPages}
                        radius="full"
                        size="sm"
                        variant="flat"
                        onPress={() => setPage((currentPage) => Math.min(currentPage + 1, totalPages))}>
                        ›
                    </Button>
                </div>
            ) : null}
        </div>
    )
}
