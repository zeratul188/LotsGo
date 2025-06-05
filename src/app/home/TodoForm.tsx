import { useEffect, useState } from "react";
import { 
    Calendar, 
    formatHours, 
    formatKoreanDate, 
    getCalendarByWeek, 
    Guild, 
    initialWeekData, 
    isTodayDate, 
    loadGuild, 
    loadWorks, 
    removeAutoCalendarsByGuild, 
    removeAutoCalendarsByWorks 
} from "../calendar/calendarFeat";
import { isLogin } from "./checklistFeat";
import { Chip, Divider } from "@heroui/react";
import { WeekBox } from "../calendar/CalendarForm";
import clsx from "clsx";
import { LoadingComponent } from "../UtilsCompnents";

// state 관리
export function useTodoForm() {
    const [guild, setGuild] = useState<Guild | null>(null);
    const [works, setWorks] = useState<Calendar[]>([]);
    const [isLoading, setLoading] = useState(true);
    const [isResetWorks, setResetWorks] = useState(false);
    const [isResetGuild, setResetGuild] = useState(false);
    const [isLogin, setLogin] = useState(false);

    return {
        guild, setGuild,
        works, setWorks,
        isLoading, setLoading,
        isResetWorks, setResetWorks,
        isResetGuild, setResetGuild,
        isLogin, setLogin
    }
}

// 일정 표시 컴포넌트
export function TodoComponent() {
    const todoForm = useTodoForm();
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
            await Promise.all([guildPromise, workPromise]);
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
    
    if (todoForm.isLoading) {
        return <LoadingComponent heightStyle="min-h-[240px]"/>
    }

    if (!todoForm.isLogin) {
        return <></>;
    }

    return (
        <div className="w-full mb-4">
            <p className="text-2xl mb-2">이번 주 일정</p>
            <Divider className="mb-4 block sm:hidden"/>
            <div className="h-full hidden lg1200:grid grid-cols-7 gap-2">
                    {weeks.map((week, index) => (
                        <div key={index} className={clsx(
                            index > 0 ? 'border-l-1 border-gray-200 dark:border-[#2a2a2a] pl-3' : ''
                        )}>
                            <Chip
                                size="sm"
                                variant="flat"
                                radius="sm"
                                color={isTodayDate(week.date) ? "success" : "primary"}
                                className="min-w-full text-center">
                                {formatKoreanDate(week.date)}
                            </Chip>
                            <div className="w-full max-h-[200px] h-[200px] overflow-y-scroll scrollbar-hide mt-2">
                                {getCalendarByWeek(week, todoForm.works, todoForm.guild).map((box, idx) => (
                                    <div key={idx} className={clsx(
                                        "rounded-md border-2 pl-2 pr-2 pt-1 pb-1 mb-2",
                                        box.type === 'work' ? 'border-[#75a0d1] dark:border-[#298cfd]' : 'border-[#b575c2] dark:border-[#c129fd]'
                                    )}>
                                        <div className="w-full flex gap-2 items-center mb-1">
                                            <div className={clsx(
                                                "w-[12px] h-[12px] rounded-full",
                                                box.type === 'work' ? 'bg-[#0055b6] dark:bg-[#298cfd]' : 'bg-[#9800b6] dark:bg-[#c129fd]'
                                            )}/>
                                            <p className="text-[9pt] fadedtext grow">{box.type === 'work' ? '개인 일정' : '길드 일정'}</p>
                                            <p className="truncate text-[9pt] fadedtext">{formatHours(box.calendar.date)}</p>
                                        </div>
                                        <p className="w-full truncate text-sm">{box.calendar.name}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
                <div className="w-full h-full flex lg1200:hidden gap-2 overflow-x-scroll scrollbar-hide">
                    {weeks.map((week, index) => (
                        <div key={index} className={clsx(
                            "min-w-[180px]",
                            index > 0 ? 'border-l-1 border-gray-200 dark:border-[#2a2a2a] pl-3' : ''
                        )}>
                            <Chip
                                size="sm"
                                variant="flat"
                                radius="sm"
                                color={isTodayDate(week.date) ? "success" : "primary"}
                                className="min-w-full text-center">
                                {formatKoreanDate(week.date)}
                            </Chip>
                            <div className="w-full max-h-[200px] h-[200px] overflow-y-scroll scrollbar-hide mt-2">
                                {getCalendarByWeek(week, todoForm.works, todoForm.guild).map((box, idx) => (
                                    <div key={idx} className={clsx(
                                        "rounded-md border-2 pl-2 pr-2 pt-1 pb-1 mb-2",
                                        box.type === 'work' ? 'border-[#75a0d1] dark:border-[#298cfd]' : 'border-[#b575c2] dark:border-[#c129fd]'
                                    )}>
                                        <div className="w-full flex gap-2 items-center mb-1">
                                            <div className={clsx(
                                                "w-[12px] h-[12px] rounded-full",
                                                box.type === 'work' ? 'bg-[#0055b6] dark:bg-[#298cfd]' : 'bg-[#9800b6] dark:bg-[#c129fd]'
                                            )}/>
                                            <p className="text-[9pt] fadedtext grow">{box.type === 'work' ? '개인 일정' : '길드 일정'}</p>
                                            <p className="truncate text-[9pt] fadedtext">{formatHours(box.calendar.date)}</p>
                                        </div>
                                        <p className="w-full truncate text-sm">{box.calendar.name}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
        </div>
    )
}