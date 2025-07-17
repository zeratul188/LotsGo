import { useEffect, useState } from "react";
import { formatTimeLeft, getNextIslandTime, isHaveGold, Island, LostarkEvent, Notice } from "./calendarFeat";
import { 
    Button,
    Card, CardBody, CardFooter, CardHeader, 
    Chip, 
    Divider, 
    Image, 
    Popover, PopoverContent, PopoverTrigger, 
    ScrollShadow, 
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
        <div className="col-span-2">
            <div className="flex gap-1 items-center">
                <p className="grow text-2xl">로스트아크 이벤트</p>
                <Button
                    size="sm"
                    variant="flat"
                    onPress={() => {
                        const url = "https://lostark.game.onstove.com/News/Event/Now";
                        window.open(url, '_blank');
                    }}>
                    더보기
                </Button>
            </div>
            <Divider className="mt-4"/>
            <ScrollShadow className="w-full h-[600px] sm:h-[500px] pt-4">
                {events.length > 0 ? (
                    <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {events.map((event, index) => (
                            <Card 
                                key={index} 
                                isPressable
                                onPress={() => window.open(event.link, '_blank')}>
                                <CardBody className="overflow-visible p-0">
                                    <Image
                                        alt={event.title}
                                        className="w-full object-cover h-[180px]"
                                        radius="md"
                                        shadow="sm"
                                        src={event.thumbnail}
                                        width="100%"/>
                                </CardBody>
                                <CardFooter>
                                    <div className="w-full text-left">
                                        <p className="text-lg truncate">{event.title}</p>
                                        <p className="fadedtext text-sm truncate">{getStringByDate(dayjs(event.startDate))} ~ {getStringByDate(dayjs(event.endDate))}</p>
                                    </div>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="w-full h-[240px] flex flex-col items-center justify-center">
                        <p className="text-xl fadedtext">이벤트 정보가 없습니다.</p>
                        <p className="text-sm fadedtext mt-2">로스트아크 점검 시간에는 데이터를 확인할 수 없습니다.</p>
                    </div>
                )}
            </ScrollShadow>
        </div>
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
    return (
        <div>
            <div className="flex gap-1 items-center">
                <p className="grow text-2xl">로스트아크 공지사항</p>
                <Button
                    size="sm"
                    variant="flat"
                    onPress={() => {
                        const url = "https://lostark.game.onstove.com/News/Notice/List";
                        window.open(url, '_blank');
                    }}>
                    더보기
                </Button>
            </div>
            <Divider className="mt-4"/>
            {notices.length > 0 ? (
                <ScrollShadow className="w-full h-[500px]">
                    {notices.map((notice, index) => (
                        <a href={notice.link} key={index} target="_blank" rel="noopener noreferrer">
                            <div className={clsx(
                                "w-full pr-2 pl-2 pt-4 pb-4 hover:bg-gray-100 dark:hover:bg-[#222222]",
                                index !== 0 ? "border-t-1 border-[#dddddd] dark:border-[#222222]" : ""
                            )}>
                                <p className="text-md truncate">{notice.title}</p>
                                <p className="fadedtext text-sm truncate">{getStringByDate(dayjs(notice.date))}</p>
                            </div>
                        </a>
                    ))}
                </ScrollShadow>
            ) : (
                <div className="w-full h-[240px] flex flex-col items-center justify-center">
                    <p className="text-xl fadedtext">공지사항 정보가 없습니다.</p>
                    <p className="text-sm fadedtext mt-2">로스트아크 점검 시간에는 데이터를 확인할 수 없습니다.</p>
                </div>
            )}
        </div>
    )
}

// 모험섬 컴포넌트
type IslandComponentProps = {
    islands: Island[],
    islandTime: Dayjs | null
}
function IslandComponent({ islands, islandTime }: IslandComponentProps) {
    const now = dayjs().tz('Asia/Seoul');
    const [timeLeft, setTimeLeft] = useState(() => islandTime !== null ? islandTime?.valueOf() - now.valueOf() : 0);

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
        <div>
            <div className="flex gap-2 mb-3 flex-col sm:flex-row items-center">
                <p className="text-2xl grow w-full">오늘의 모험섬</p>
                <div className="w-full sm:w-[max-content] flex gap-10 items-center">
                    <div className="grow">
                        <p className="text-[8pt] fadedtext">다음 일정</p>
                        <p className="w-[max-content] text-lg">{getNextIslandTime(islandTime)}</p>
                    </div>
                    <div className="grow text-right sm:text-left flex flex-col items-end">
                        <p className="text-[8pt] fadedtext">남은 시간</p>
                        <p className={clsx(
                            "text-lg w-[max-content]",
                            timeLeft !== 0 ? '' : 'text-red-500'
                        )}>{timeLeft !== 0 ? formatTimeLeft(timeLeft) : "모험섬 출현"}</p>
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {islands.length !== 0 ? (
                    islands.map((island, index) => (
                        <Card key={index} radius="sm" className={clsx(
                            isHaveGold(island) ? "border-2 border-[#ccc923] dark:border-[#c0be2f] bg-[#f1f1d4] dark:bg-[#1d1c0b]" : ""
                        )}>
                            <CardHeader className="flex gap-3">
                                <Image 
                                    src={island.icon} 
                                    width={36}
                                    height={36} 
                                    alt={island.name} 
                                    radius="sm"/>
                                <p className="grow">{island.name}</p>
                                <Chip 
                                    color="warning" 
                                    size="sm" 
                                    className={clsx(
                                        "text-white dark:text-black",
                                        isHaveGold(island) ? 'flex' : 'hidden'
                                    )}>골드 쌀섬</Chip>
                            </CardHeader>
                            <Divider/>
                            <CardBody>
                                <>
                                    <p className="fadedtext text-sm mb-2">보상 아이템</p>
                                    <div className="grid grid-cols-7 sm:grid-cols-4 lg1200:grid-cols-7 gap-3">
                                        {island.items.map((item, idx) => (
                                            <div key={idx} className="flex items-center justify-center">
                                                <Tooltip
                                                    showArrow
                                                    content={<p className={getColorTextByGrade(item.grade)}>{item.name}</p>}>
                                                    <div className={`hidden sm:block w-[34px] h-[34px] aspect-square p-[3px] rounded-md ${getBackgroundByGrade(item.grade)}`}>
                                                        <Image 
                                                            src={item.icon} 
                                                            width={28}
                                                            height={28} 
                                                            alt={item.name} 
                                                            radius="sm"
                                                            className="w-full h-full object-cover"/>
                                                    </div>
                                                </Tooltip>
                                                <Popover 
                                                    showArrow>
                                                    <PopoverTrigger>
                                                        <div className={`block sm:hidden w-[34px] h-[34px] aspect-square p-[3px] rounded-md ${getBackgroundByGrade(item.grade)}`}>
                                                            <Image 
                                                                src={item.icon} 
                                                                width={28}
                                                                height={28} 
                                                                alt={item.name} 
                                                                radius="sm"
                                                                className="w-full h-full object-cover"/>
                                                        </div>
                                                    </PopoverTrigger>
                                                    <PopoverContent>
                                                        <p className={getColorTextByGrade(item.grade)}>{item.name}</p>
                                                    </PopoverContent>
                                                </Popover>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            </CardBody>
                        </Card>
                    ))
                ) : (
                    <div className="w-full h-[140px] col-span-3 fadedtext flex items-center justify-center text-xl">오늘의 모험섬 일정은 없습니다.</div>
                )}
            </div>
        </div>
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
    }, [gate]);

    useEffect(() => {
        const bossInterval = setInterval(() => {
            if (boss) {
                if (bossDate) {
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
    }, [boss]);

    return (
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4 mb-3">
            {gate ? (
                <Card radius="sm">
                    <CardBody>
                        <div className="w-full flex gap-2 items-center">
                            <Image 
                                src={gate.imgSrc} 
                                width={36}
                                height={36} 
                                alt="카오스게이트"
                                radius="sm"/>
                            <p className="grow">카오스 게이트</p>
                            <div className="w-[max-content] flex gap-5 sm:gap-10 items-center">
                                <div className="grow">
                                    <p className="text-[8pt] fadedtext">다음 일정</p>
                                    <p className={clsx(
                                        "w-[max-content] text-lg",
                                        getNextIslandTime(gateDate) === '일정 없음' ? 'fadedtext' : ''
                                    )}>{getNextIslandTime(gateDate)}</p>
                                </div>
                                <div className="grow text-left flex flex-col">
                                    <p className="text-[8pt] fadedtext">남은 시간</p>
                                    <p className={clsx(
                                        "text-lg w-[max-content]",
                                        gateTimeLeft !== 0 ? '' : gateDate ? 'text-red-500' : 'fadedtext'
                                    )}>{gateTimeLeft !== 0 ? formatTimeLeft(gateTimeLeft) : gateDate ? "출현" : '일정 없음'}</p>
                                </div>
                            </div>
                        </div>
                    </CardBody>
                </Card>
            ) : <></>}
            {boss ? (
                <Card radius="sm">
                    <CardBody>
                        <div className="w-full flex gap-2 items-center">
                            <Image 
                                src={boss.imgSrc} 
                                width={36}
                                height={36} 
                                alt="필드보스"
                                radius="sm"/>
                            <p className="grow">필드보스</p>
                            <div className="w-[max-content] flex gap-5 sm:gap-10 items-center">
                                <div className="grow">
                                    <p className="text-[8pt] fadedtext">다음 일정</p>
                                    <p className={clsx(
                                        "w-[max-content] text-lg",
                                        getNextIslandTime(bossDate) === '일정 없음' ? 'fadedtext' : ''
                                    )}>{getNextIslandTime(bossDate)}</p>
                                </div>
                                <div className="grow text-left flex flex-col">
                                    <p className="text-[8pt] fadedtext">남은 시간</p>
                                    <p className={clsx(
                                        "text-lg w-[max-content]",
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
    isInspection: boolean,
    notices: Notice[],
    events: LostarkEvent[],
    setLoaded: SetStateFn<boolean>,
    setShowAd: SetStateFn<boolean>
}
export default function CalendarComponent({ gate, boss, islands, islandTime, isInspection, notices, events, setLoaded, setShowAd }: CalendarComponentProps) {

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
            <IslandComponent islands={islands} islandTime={islandTime}/>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mt-8">
                <NoticeComponent notices={notices}/>
                <EventComponent events={events}/>
            </div>
        </div>
    )
}

