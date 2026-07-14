import { useEffect, useState } from "react";
import { 
    Calendar, 
    formatHours, 
    formatKoreanDate, 
    getCalendarByPartyWorks, 
    getCalendarByWeek, 
    Guild, 
    initialWeekData, 
    isTodayDate, 
    loadGuild, 
    loadWorks, 
    loadWorksByParty, 
    removeAutoCalendarsByGuild, 
    removeAutoCalendarsByWorks 
} from "../../calendar/calendarFeat";
import { isLogin } from "../lib/checklistFeat";
import { Button } from "@heroui/react";
import { WeekBox } from "../../calendar/CalendarForm";
import clsx from "clsx";
import { LoadingComponent } from "../../UtilsCompnents";
import { useRouter } from "next/navigation";
import { RaidWork } from "../../raids/model/types";

// state 관리
export function useTodoForm() {
    const [guild, setGuild] = useState<Guild | null>(null);
    const [works, setWorks] = useState<Calendar[]>([]);
    const [partyWorks, setPartyWorks] = useState<RaidWork[]>([]);
    const [isLoading, setLoading] = useState(true);
    const [isResetWorks, setResetWorks] = useState(false);
    const [isResetGuild, setResetGuild] = useState(false);
    const [isLogin, setLogin] = useState(false);

    return {
        guild, setGuild,
        works, setWorks,
        partyWorks, setPartyWorks,
        isLoading, setLoading,
        isResetWorks, setResetWorks,
        isResetGuild, setResetGuild,
        isLogin, setLogin
    }
}

// 일정 표시 컴포넌트
export function TodoComponent() {
    const todoForm = useTodoForm();
    const router = useRouter();
    const [weeks, setWeeks] = useState<WeekBox[]>([]);

    useEffect(() => {
        if (isLogin()) {
            todoForm.setLogin(isLogin());
        } else {
            todoForm.setLoading(false);
        }
    }, []);

    useEffect(() => {
        const loadData = async () => {
            const guildPromise = loadGuild(todoForm.setGuild);
            const workPromise = loadWorks(todoForm.setWorks);
            const partyWorksPromise = loadWorksByParty(todoForm.setPartyWorks);
            await Promise.all([guildPromise, workPromise, partyWorksPromise]);
            todoForm.setLoading(false);
        }
        if (todoForm.isLogin) {
            loadData();
        }
    }, [todoForm.isLogin]);

    useEffect(() => {
        const settingData = async () => {
            await removeAutoCalendarsByWorks(todoForm.works, todoForm.setWorks);
            todoForm.setResetWorks(true);
        }
        if (!todoForm.isResetWorks && todoForm.isLogin) {
            settingData();
        }
        if (todoForm.isLogin) {
            initialWeekData(todoForm.works, todoForm.guild, setWeeks);
        }
    }, [todoForm.works]);

    useEffect(() => {
        const settingData = async () => {
            await removeAutoCalendarsByGuild(todoForm.guild, todoForm.setGuild);
            todoForm.setResetGuild(true);
        }
        if (!todoForm.isResetGuild && todoForm.guild && todoForm.isLogin) {
            settingData();
        }
    }, [todoForm.guild]);

    if (!todoForm.isLogin) {
        return <></>;
    }
    
    if (todoForm.isLoading) {
        return <LoadingComponent heightStyle="min-h-[240px]"/>
    }

    return (
        <section className="w-full mb-6 overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.05)] dark:border-white/10 dark:bg-[#171717] dark:shadow-none">
            <div className="flex items-center gap-4 border-b border-gray-200/80 px-4 py-4 sm:px-5 dark:border-white/10">
                <div className="min-w-0 grow">
                    <div className="flex items-center gap-2">
                        <span className="h-5 w-1 rounded-full bg-primary"/>
                        <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">이번 주 일정</h2>
                    </div>
                    <p className="mt-1 pl-3 text-xs fadedtext sm:text-sm">개인·길드·파티 일정을 한눈에 확인해 보세요.</p>
                </div>
                <Button
                    radius="sm"
                    size="sm"
                    variant="bordered"
                    className="min-w-[88px] shrink-0 border-gray-300 bg-white font-medium shadow-sm dark:border-white/20 dark:bg-white/5"
                    onPress={() => router.push('/calendar')}>
                    전체 일정
                </Button>
            </div>

            <div className="overflow-x-auto p-3 scrollbar-hide sm:p-4">
                <div className="grid grid-flow-col auto-cols-[minmax(172px,1fr)] gap-2 lg1200:grid-flow-row lg1200:grid-cols-7 lg1200:auto-cols-auto">
                    {weeks.map((week) => {
                        const calendars = getCalendarByWeek(week, todoForm.works, todoForm.guild);
                        const partyWorks = getCalendarByPartyWorks(week, todoForm.partyWorks);
                        const scheduleCount = calendars.length + partyWorks.length;
                        const isToday = isTodayDate(week.date);

                        return (
                            <div
                                key={week.date.toISOString()}
                                className={clsx(
                                    "min-w-0 rounded-xl border p-2.5 transition-colors",
                                    isToday
                                        ? "border-primary/40 bg-primary/5 dark:border-primary/50 dark:bg-primary/10"
                                        : "border-gray-200/80 bg-gray-50/60 dark:border-white/10 dark:bg-white/[0.025]"
                                )}>
                                <div className={clsx(
                                    "flex h-8 items-center justify-between gap-2 rounded-lg px-2.5 text-sm font-semibold",
                                    isToday
                                        ? "bg-primary text-primary-foreground shadow-sm"
                                        : "bg-white text-gray-700 dark:bg-white/[0.07] dark:text-gray-200"
                                )}>
                                    <span>{formatKoreanDate(week.date).split(' ')[0]}</span>
                                    <span className={clsx(
                                        "shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-medium",
                                        isToday
                                            ? "bg-white/20 text-primary-foreground"
                                            : "bg-gray-100 text-gray-500 dark:bg-white/10 dark:text-gray-400"
                                    )}>
                                        {isToday ? '오늘' : scheduleCount}
                                    </span>
                                </div>

                                <div className="mt-2 h-[168px] space-y-2 overflow-y-auto scrollbar-hide lg1200:h-[136px]">
                                    {calendars.map((box, idx) => (
                                        <div
                                            key={`${box.calendar.date}-${box.calendar.name}-${idx}`}
                                            className={clsx(
                                                "rounded-lg border bg-white px-2.5 py-2 shadow-[0_2px_8px_rgba(15,23,42,0.04)] dark:bg-[#202020] dark:shadow-none",
                                                box.type === 'work'
                                                    ? "border-blue-200/90 dark:border-blue-500/40"
                                                    : "border-purple-200/90 dark:border-purple-500/40"
                                            )}>
                                            <div className="mb-1 flex items-center gap-1.5 text-[11px] fadedtext">
                                                <span className={clsx(
                                                    "h-1.5 w-1.5 shrink-0 rounded-full",
                                                    box.type === 'work' ? "bg-blue-500" : "bg-purple-500"
                                                )}/>
                                                <span className="grow">{box.type === 'work' ? '개인 일정' : '길드 일정'}</span>
                                                <time className="shrink-0 tabular-nums">{formatHours(box.calendar.date)}</time>
                                            </div>
                                            <p className="w-full truncate text-sm font-medium" title={box.calendar.name}>{box.calendar.name}</p>
                                        </div>
                                    ))}
                                    {partyWorks.map((work, idx) => (
                                        <div
                                            key={`${work.date}-${work.name}-${idx}`}
                                            className="rounded-lg border border-rose-200/90 bg-white px-2.5 py-2 shadow-[0_2px_8px_rgba(15,23,42,0.04)] dark:border-rose-500/40 dark:bg-[#202020] dark:shadow-none">
                                            <div className="mb-1 flex items-center gap-1.5 text-[11px] fadedtext">
                                                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-rose-500"/>
                                                <span className="grow">파티 일정</span>
                                                <time className="shrink-0 tabular-nums">{formatHours(work.date)}</time>
                                            </div>
                                            <p className="w-full truncate text-sm font-medium" title={work.name}>{work.name}</p>
                                        </div>
                                    ))}
                                    {scheduleCount === 0 && (
                                        <div className="flex h-full items-center justify-center pb-4">
                                            <p className="text-xs text-gray-400 dark:text-gray-500">등록된 일정이 없어요</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}
