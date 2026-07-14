import { useEffect, useState } from "react";
import type { Island, IslandData, LostarkEvent, Notice } from "../model/types";
import { filterIslandData, filterRewardItem, formatKoreanDate, formatTimeLeft, getNextIslandTime, initialWeek, isGoldIsland, isGoldIslands, isHaveGold } from "../lib/calendarFeat";
import { 
    Accordion,
    AccordionItem,
    Button,
    Card, CardBody,
    Chip, 
    Link, 
    Popover, PopoverContent, PopoverTrigger, 
    ScrollShadow, 
    Tab,
    Tabs,
    Tooltip 
} from "@heroui/react";
import { getBackgroundByGrade, getColorTextByGrade, SetStateFn } from "@/utiils/utils";
import clsx from "clsx";
import dayjs, { Dayjs, isDayjs } from "dayjs";

export type ContentData = {
    date: string | null,
    imgSrc: string
}

// 이벤트 컴포넌트
type EventComponentProps = {
    events: LostarkEvent[]
}
function EventComponent({ events }: EventComponentProps) {
    const getStringByDate = (date: Dayjs) => {
        if (!isDayjs(date)) return '';
        return `${date.year()}년 ${date.month()+1}월 ${date.date()}일`;
    };
    return (
        <section className="col-span-2 overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.05)] dark:border-white/10 dark:bg-[#171717] dark:shadow-none">
            <div className="flex items-center gap-3 border-b border-gray-200/80 px-4 py-4 dark:border-white/10">
                <div className="min-w-0 grow">
                    <div className="flex items-center gap-2">
                        <span className="h-5 w-1 rounded-full bg-primary"/>
                        <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">로스트아크 이벤트</h2>
                        <Chip size="sm" radius="sm" variant="flat" color="primary" className="shrink-0">
                            총 {events.length}개
                        </Chip>
                    </div>
                    <p className="mt-1 pl-3 text-xs fadedtext">현재 진행 중인 이벤트를 확인해 보세요.</p>
                </div>
                <Button
                    size="sm"
                    radius="sm"
                    variant="bordered"
                    className="shrink-0 border-gray-300 bg-white font-medium shadow-sm dark:border-white/20 dark:bg-white/5"
                    onPress={() => {
                        const url = "https://lostark.game.onstove.com/News/Event/Now";
                        window.open(url, '_blank');
                    }}>
                    더보기
                </Button>
            </div>
            <ScrollShadow className="h-[600px] w-full p-4 sm:h-[500px]">
                {events.length > 0 ? (
                    <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
                        {events.map((event, index) => (
                            <Card 
                                key={index} 
                                isPressable
                                as={Link}
                                shadow="none"
                                radius="lg"
                                className="group border border-gray-200/80 bg-gray-50/60 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-white/10 dark:bg-white/[0.025]"
                                href={event.link}>
                                <CardBody className="relative h-[180px] overflow-hidden p-0">
                                    <img
                                        alt={event.title}
                                        className="h-[180px] w-full rounded-md object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                                        src={event.thumbnail}/>
                                    <Chip
                                        size="sm"
                                        radius="sm"
                                        color="primary"
                                        variant="flat"
                                        className="absolute left-3 top-3 bg-white/90 font-medium dark:bg-black/70">
                                        진행 중
                                    </Chip>
                                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/55 to-transparent px-3 pb-3 pt-10 text-left text-white">
                                        <p className="truncate font-medium drop-shadow-sm">{event.title}</p>
                                        <p className="mt-0.5 truncate text-xs text-white/80">{getStringByDate(dayjs(event.startDate))} ~ {getStringByDate(dayjs(event.endDate))}</p>
                                    </div>
                                </CardBody>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="flex h-[240px] w-full flex-col items-center justify-center">
                        <p className="text-xl fadedtext">이벤트 정보가 없습니다.</p>
                        <p className="mt-2 text-sm fadedtext">로스트아크 점검 시간에는 데이터를 확인할 수 없습니다.</p>
                    </div>
                )}
            </ScrollShadow>
        </section>
    )
}

// 공지사항 컴포넌트
type NoticeComponentProps = {
    notices: Notice[]
}
function NoticeComponent({ notices }: NoticeComponentProps) {
    const getStringByDate = (date: Dayjs) => {
        if (!isDayjs(date)) return '';
        return `${date.year()}년 ${date.month()+1}월 ${date.date()}일`;
    };
    const getNoticeChipColor = (type?: string): "default" | "primary" | "secondary" | "success" | "warning" | "danger" => {
        if (type?.includes('점검')) return 'danger';
        if (type?.includes('이벤트')) return 'success';
        if (type?.includes('상점')) return 'warning';
        if (type?.includes('공지')) return 'primary';
        return 'secondary';
    };
    return (
        <section className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.05)] dark:border-white/10 dark:bg-[#171717] dark:shadow-none">
            <div className="flex items-center gap-3 border-b border-gray-200/80 px-4 py-4 dark:border-white/10">
                <div className="min-w-0 grow">
                    <div className="flex items-center gap-2">
                        <span className="h-5 w-1 rounded-full bg-primary"/>
                        <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">로스트아크 공지사항</h2>
                    </div>
                    <p className="mt-1 pl-3 text-xs fadedtext">중요한 소식과 점검 일정을 확인해 보세요.</p>
                </div>
                <Button
                    size="sm"
                    radius="sm"
                    variant="bordered"
                    className="shrink-0 border-gray-300 bg-white font-medium shadow-sm dark:border-white/20 dark:bg-white/5"
                    onPress={() => {
                        const url = "https://lostark.game.onstove.com/News/Notice/List";
                        window.open(url, '_blank');
                    }}>
                    더보기
                </Button>
            </div>
            {notices.length > 0 ? (
                <ScrollShadow className="h-[500px] w-full p-3">
                    {notices.map((notice, index) => (
                        <a href={notice.link} key={index} target="_blank" rel="noopener noreferrer">
                            <div className={clsx(
                                "flex w-full items-center gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-gray-100 dark:hover:bg-white/[0.05]",
                                index !== 0 ? "border-t border-gray-200/80 dark:border-white/10" : ""
                            )}>
                                <Chip
                                    size="sm"
                                    radius="sm"
                                    variant="flat"
                                    color={getNoticeChipColor(notice.type)}
                                    classNames={{
                                        base: "min-w-[52px] shrink-0",
                                        content: "w-full text-center"
                                    }}>
                                    {notice.type ?? '공지'}
                                </Chip>
                                <div className="min-w-0 grow">
                                    <p className="truncate text-[11px] fadedtext">{getStringByDate(dayjs(notice.date))}</p>
                                    <p className="mt-0.5 truncate text-sm font-medium">{notice.title}</p>
                                </div>
                            </div>
                        </a>
                    ))}
                </ScrollShadow>
            ) : (
                <div className="flex h-[240px] w-full flex-col items-center justify-center">
                    <p className="text-xl fadedtext">공지사항 정보가 없습니다.</p>
                    <p className="mt-2 text-sm fadedtext">로스트아크 점검 시간에는 데이터를 확인할 수 없습니다.</p>
                </div>
            )}
        </section>
    )
}

// 모험섬 컴포넌트
type IslandComponentProps = {
    islands: Island[],
    islandTime: Dayjs | null,
    islandDatas: IslandData[]
}
function IslandComponent({ islands, islandTime, islandDatas }: IslandComponentProps) {
    const now = dayjs().tz('Asia/Seoul');
    const [timeLeft, setTimeLeft] = useState(() => islandTime !== null ? islandTime?.valueOf() - now.valueOf() : 0);
    const weeks: Dayjs[] = initialWeek();

    useEffect(() => {
        const interval = setInterval(() => {
            if (islandTime !== null) {
                const now = dayjs().tz('Asia/Seoul');
                const diff = islandTime?.valueOf() - now.valueOf();
                if (diff <= 0) {
                    setTimeLeft(0);
                    clearInterval(interval);
                } else {
                    setTimeLeft(diff);
                }
            } else {
                clearInterval(interval);
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [islandTime]);

    return (
        <section className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.05)] dark:border-white/10 dark:bg-[#171717] dark:shadow-none">
            <div className="flex flex-col gap-4 border-b border-gray-200/80 px-4 py-4 sm:flex-row sm:items-center sm:px-5 dark:border-white/10">
                <div className="min-w-0 grow">
                    <div className="flex items-center gap-2">
                        <span className="h-5 w-1 rounded-full bg-primary"/>
                        <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">오늘의 모험섬</h2>
                    </div>
                    <p className="mt-1 pl-3 text-xs fadedtext sm:text-sm">오늘 등장하는 섬과 주요 보상을 확인해 보세요.</p>
                </div>
                <div className="grid w-full grid-cols-2 gap-2 sm:w-auto sm:min-w-[280px]">
                    <div className="rounded-lg bg-gray-50 px-3 py-2 dark:bg-white/[0.05]">
                        <p className="text-[11px] fadedtext">다음 일정</p>
                        <p className={clsx(
                            "mt-0.5 text-base font-semibold tabular-nums sm:text-lg",
                            islands.length > 0 ? "" : 'fadedtext'
                        )}>{islands.length > 0 ? getNextIslandTime(islandTime) : '일정 없음'}</p>
                    </div>
                    <div className="rounded-lg bg-gray-50 px-3 py-2 dark:bg-white/[0.05]">
                        <p className="text-[11px] fadedtext">남은 시간</p>
                        <p className={clsx(
                            "mt-0.5 text-base font-semibold tabular-nums sm:text-lg",
                            timeLeft > 0 ? '' : islands.length > 0 ? 'text-red-500' : 'fadedtext'
                        )}>{timeLeft > 0 ? formatTimeLeft(timeLeft) : islands.length > 0 ? "모험섬 출현" : '일정 없음'}</p>
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-1 gap-3 p-3 sm:grid-cols-3 sm:p-4">
                {islands.length !== 0 ? (
                    islands.map((island, index) => (
                        <Card key={index} radius="lg" shadow="none" className={clsx(
                            "border border-gray-200/80 bg-gray-50/60 dark:border-white/10 dark:bg-white/[0.025]",
                            isHaveGold(island) ? "border-amber-300 bg-amber-50/80 dark:border-amber-500/50 dark:bg-amber-500/10" : ""
                        )}>
                            <CardBody className="p-3">
                                <div className="w-full flex gap-2 items-center">
                                    <img 
                                        src={island.icon} 
                                        alt={island.name} 
                                        className="h-10 w-10 shrink-0 rounded-lg"/>
                                    <div className="min-w-0 grow">
                                        <p className="truncate font-medium">{island.name}</p>
                                        <Chip 
                                            size="sm"
                                            radius="sm"
                                            variant="flat"
                                            color="warning"
                                            className={clsx(
                                                "mt-1 h-5",
                                                isHaveGold(island) ? 'flex' : 'hidden'
                                            )}>
                                            골드 보상
                                        </Chip>
                                    </div>
                                    <div className="flex shrink-0 items-center gap-1">
                                        {island.items.map((item, idx) => (
                                            <div key={idx} className="flex items-center justify-center">
                                            <Tooltip
                                                showArrow
                                                content={<p className={getColorTextByGrade(item.grade)}>{item.name}</p>}>
                                                <div className={clsx(
                                                    "hidden h-9 w-9 aspect-square rounded-md p-[3px] sm:block",
                                                    getBackgroundByGrade(item.grade)
                                                )}>
                                                    <img
                                                        src={item.icon} 
                                                        alt={item.name} 
                                                        className="w-full h-full object-cover rounded-md"/>
                                                </div>
                                            </Tooltip>
                                            <Popover 
                                                showArrow>
                                            <PopoverTrigger>
                                                    <div className={`block h-9 w-9 aspect-square rounded-md p-[3px] sm:hidden ${getBackgroundByGrade(item.grade)}`}>
                                                        <img 
                                                            src={item.icon} 
                                                            alt={item.name} 
                                                            className="w-full h-full object-cover rounded-md"/>
                                                    </div>
                                                </PopoverTrigger>
                                                <PopoverContent>
                                                    <p className={getColorTextByGrade(item.grade)}>{item.name}</p>
                                                </PopoverContent>
                                            </Popover>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                    ))
                ) : (
                    <div className="col-span-3 flex h-[140px] w-full items-center justify-center text-lg fadedtext">오늘의 모험섬 일정은 없습니다.</div>
                )}
            </div>
            <div className="border-t border-gray-200/80 px-3 pt-3 sm:px-4 dark:border-white/10">
                <Tabs
                    aria-label="요일별 모험섬 일정"
                    defaultSelectedKey={now.format('YYYY-MM-DD')}
                    color="primary"
                    variant="solid"
                    radius="sm"
                    classNames={{
                        base: "w-full",
                        tabList: "w-full gap-1 overflow-x-auto bg-transparent p-1 scrollbar-hide",
                        tab: "h-12 min-w-[82px] px-2",
                        cursor: "rounded-lg shadow-sm",
                        tabContent: "group-data-[selected=true]:text-primary-foreground",
                        panel: "px-0 pb-1 pt-3"
                    }}>
                    {weeks.map((week) => {
                        const dayIslands = islandDatas.filter(filterIslandData(week));
                        const isToday = week.isSame(now, 'day');
                        const hasGoldIsland = isGoldIslands(week, islandDatas);

                        return (
                            <Tab
                                key={week.format('YYYY-MM-DD')}
                                title={
                                    <div className="flex items-center gap-1.5">
                                        <div className="text-center">
                                            <p className="text-sm font-medium">{formatKoreanDate(week).split(' ')[0]}</p>
                                            <p className="text-[10px] opacity-70">{week.format('MM.DD')}</p>
                                        </div>
                                        {isToday && <span className="h-1.5 w-1.5 rounded-full bg-primary group-data-[selected=true]:bg-primary-foreground"/>}
                                        {hasGoldIsland && <span className="h-1.5 w-1.5 rounded-full bg-amber-400"/>}
                                    </div>
                                }>
                                {dayIslands.length > 0 ? (
                                    <Accordion fullWidth variant="splitted" className="grid grid-cols-1 items-start gap-2 px-0 sm:grid-cols-3">
                                        {dayIslands.map((data, idx) => (
                                            <AccordionItem
                                                key={`${week.format('YYYY-MM-DD')}-${data.name}-${idx}`}
                                                aria-label={`${data.name} 보상 정보`}
                                                title={
                                                    <div className="flex min-w-0 items-center gap-2.5">
                                                        <img src={data.icon} alt={data.name} className="h-8 w-8 shrink-0 rounded-lg"/>
                                                        <p className={clsx(
                                                            "truncate text-sm font-medium",
                                                            isGoldIsland(week, data) ? 'text-[#C4841D] dark:text-[#F7B750]' : ''
                                                        )}>{data.name}</p>
                                                        {isGoldIsland(week, data) && (
                                                            <Chip size="sm" radius="sm" color="warning" variant="flat" className="h-5 shrink-0">골드</Chip>
                                                        )}
                                                    </div>
                                                }
                                                classNames={{
                                                    base: "border border-gray-200/80 bg-gray-50/60 shadow-none dark:border-white/10 dark:bg-white/[0.025]",
                                                    trigger: "py-2.5",
                                                    content: "pb-3"
                                                }}>
                                                <div className="flex flex-wrap items-center gap-2 pl-10">
                                                    {data.rewards.filter(filterRewardItem(week)).map((reward, rewardIdx) => (
                                                        <div key={rewardIdx} className="flex items-center justify-center">
                                                            <div className="hidden sm:block">
                                                                <Tooltip showArrow content={<p className={clsx(getColorTextByGrade(reward.grade))}>{reward.name}</p>}>
                                                                    <img src={reward.icon} alt={reward.name} className="h-7 w-7 rounded-md"/>
                                                                </Tooltip>
                                                            </div>
                                                            <div className="block sm:hidden">
                                                                <Popover showArrow>
                                                                    <PopoverTrigger>
                                                                        <img src={reward.icon} alt={reward.name} className="h-7 w-7 rounded-md"/>
                                                                    </PopoverTrigger>
                                                                    <PopoverContent>
                                                                        <p className={clsx(getColorTextByGrade(reward.grade))}>{reward.name}</p>
                                                                    </PopoverContent>
                                                                </Popover>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </AccordionItem>
                                        ))}
                                    </Accordion>
                                ) : (
                                    <div className="flex h-[96px] items-center justify-center rounded-xl bg-gray-50/60 text-sm fadedtext dark:bg-white/[0.025]">
                                        해당 요일의 모험섬 일정이 없습니다.
                                    </div>
                                )}
                            </Tab>
                        )
                    })}
                </Tabs>
            </div>
            <p className="px-4 pb-4 pt-1 text-xs fadedtext">노란색 점과 골드 표시는 골드 보상이 있는 모험섬을 의미합니다.</p>
        </section>
    )
}

// 카오스게이트, 필드보스 컴포넌트
type ContentComponentProps = {
    gate: ContentData | null,
    boss: ContentData | null,
    gateDate: Dayjs | null,
    bossDate: Dayjs | null
}
function ContentComponent({ gate, boss, gateDate, bossDate }: ContentComponentProps) {
    const now = dayjs().tz('Asia/Seoul');
    const [gateTimeLeft, setGateTimeLeft] = useState(() => gate ? gateDate ? gateDate.valueOf() - now.valueOf() : 0 : 0);
    const [bossTimeLeft, setBossTimeLeft] = useState(() => boss ? bossDate ? bossDate.valueOf() - now.valueOf() : 0 : 0);

    useEffect(() => {
        const gateInterval = setInterval(() => {
            if (gate) {
                if (gateDate) {
                    const now = dayjs().tz('Asia/Seoul');
                    const diff = gateDate.valueOf() - now.valueOf();
                    if (diff <= 0) {
                        setGateTimeLeft(0);
                        clearInterval(gateInterval);
                    } else {
                        setGateTimeLeft(diff);
                    }
                } else {
                    clearInterval(gateInterval);    
                }
            } else {
                clearInterval(gateInterval);
            }
        }, 1000);
        return () => clearInterval(gateInterval)
    }, [gateDate]);

    useEffect(() => {
        const bossInterval = setInterval(() => {
            if (boss) {
                if (bossDate) {
                    const now = dayjs().tz('Asia/Seoul');
                    const diff = bossDate.valueOf() - now.valueOf();
                    if (diff <= 0) {
                        setBossTimeLeft(0);
                        clearInterval(bossInterval);
                    } else {
                        setBossTimeLeft(diff);
                    }
                } else {
                    clearInterval(bossInterval);    
                }
            } else {
                clearInterval(bossInterval);
            }
        }, 1000);
        return () => clearInterval(bossInterval)
    }, [bossDate]);

    return (
        <div className="mb-4 grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
            {gate ? (
                <Card shadow="none" radius="lg" className="border border-gray-200/80 bg-white shadow-[0_6px_20px_rgba(15,23,42,0.04)] dark:border-white/10 dark:bg-[#171717] dark:shadow-none">
                    <CardBody className="p-3">
                        <div className="flex items-center gap-2 sm:gap-3">
                            <div className="shrink-0 rounded-lg bg-blue-50 p-1.5 dark:bg-blue-500/10">
                                <img src={gate.imgSrc} alt="카오스게이트" className="h-8 w-8 rounded-md"/>
                            </div>
                            <div className="min-w-0 grow">
                                <p className="truncate text-base font-semibold">카오스 게이트</p>
                            </div>
                            <div className="flex shrink-0 items-center gap-3 border-l border-gray-200/80 pl-3 sm:gap-5 dark:border-white/10">
                                <div className="min-w-[58px]">
                                    <p className="text-[11px] fadedtext">다음 일정</p>
                                    <p className={clsx(
                                        "text-base font-semibold tabular-nums",
                                        getNextIslandTime(gateDate) === '일정 없음' ? 'fadedtext' : ''
                                    )}>{getNextIslandTime(gateDate)}</p>
                                </div>
                                <div className="min-w-[58px]">
                                    <p className="text-[11px] fadedtext">남은 시간</p>
                                    <p className={clsx(
                                        "text-base font-semibold tabular-nums",
                                        gateTimeLeft !== 0 ? '' : gateDate ? 'text-red-500' : 'fadedtext'
                                    )}>{gateTimeLeft !== 0 ? formatTimeLeft(gateTimeLeft) : gateDate ? "출현" : '일정 없음'}</p>
                                </div>
                            </div>
                        </div>
                    </CardBody>
                </Card>
            ) : <></>}
            {boss ? (
                <Card shadow="none" radius="lg" className="border border-gray-200/80 bg-white shadow-[0_6px_20px_rgba(15,23,42,0.04)] dark:border-white/10 dark:bg-[#171717] dark:shadow-none">
                    <CardBody className="p-3">
                        <div className="flex items-center gap-2 sm:gap-3">
                            <div className="shrink-0 rounded-lg bg-emerald-50 p-1.5 dark:bg-emerald-500/10">
                                <img src={boss.imgSrc} alt="필드보스" className="h-8 w-8 rounded-md"/>
                            </div>
                            <div className="min-w-0 grow">
                                <p className="truncate text-base font-semibold">필드보스</p>
                            </div>
                            <div className="flex shrink-0 items-center gap-3 border-l border-gray-200/80 pl-3 sm:gap-5 dark:border-white/10">
                                <div className="min-w-[58px]">
                                    <p className="text-[11px] fadedtext">다음 일정</p>
                                    <p className={clsx(
                                        "text-base font-semibold tabular-nums",
                                        getNextIslandTime(bossDate) === '일정 없음' ? 'fadedtext' : ''
                                    )}>{getNextIslandTime(bossDate)}</p>
                                </div>
                                <div className="min-w-[58px]">
                                    <p className="text-[11px] fadedtext">남은 시간</p>
                                    <p className={clsx(
                                        "text-base font-semibold tabular-nums",
                                        bossTimeLeft !== 0 ? '' : bossDate ? 'text-red-500' : 'fadedtext'
                                    )}>{bossTimeLeft !== 0 ? formatTimeLeft(bossTimeLeft) : bossDate ? "출현" : "일정 없음"}</p>
                                </div>
                            </div>
                        </div>
                    </CardBody>
                </Card>
            ) : <></>}
        </div>
    )
}

// 일정 (모험섬, 필드보스 등) 컴포넌트
type CalendarComponentProps = {
    gate: ContentData | null,
    boss: ContentData | null,
    islands: Island[],
    islandTime: Dayjs | null,
    islandDatas: IslandData[],
    isInspection: boolean,
    notices: Notice[],
    events: LostarkEvent[],
    setLoaded: SetStateFn<boolean>,
    setShowAd: SetStateFn<boolean>
}
export default function CalendarComponent({ gate, boss, islands, islandTime, islandDatas, isInspection, notices, events, setLoaded, setShowAd }: CalendarComponentProps) {

    useEffect(() => {
        if (events.length > 0 && notices.length > 0 && gate && boss) {
            setShowAd(true);
            setLoaded(true);
        }
    }, [])
    
    return (
        <div className="w-full mt-10">
            <ContentComponent 
                gate={gate} 
                boss={boss} 
                gateDate={gate ? gate.date ? dayjs(gate.date) : null : null}
                bossDate={boss ? boss.date ? dayjs(boss.date) : null : null}/>
            <IslandComponent islands={islands} islandTime={islandTime} islandDatas={islandDatas}/>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mt-8">
                <NoticeComponent notices={notices}/>
                <EventComponent events={events}/>
            </div>
        </div>
    )
}
