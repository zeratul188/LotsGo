import { useEffect, useState } from "react";
import { formatTimeLeft, getNextIslandTime, Island, loadCalendar } from "./calendarFeat";
import { LoadingComponent } from "../UtilsCompnents";
import { 
    Card, CardBody, CardHeader, 
    Divider, 
    Image, 
    Popover, PopoverContent, PopoverTrigger, 
    Tooltip 
} from "@heroui/react";
import { getColorTextByGrade } from "@/utiils/utils";
import clsx from "clsx";

// state 관리
function useCalendarForm() {
    const [isLoading, setLoading] = useState(true);
    const [islands, setIslands] = useState<Island[]>([]);
    const [islandTime, setIslandTime] = useState<Date | null>(null);

    return {
        isLoading, setLoading,
        islands, setIslands,
        islandTime, setIslandTime
    }
}

// 모험섬 컴포넌트
type IslandComponentProps = {
    islands: Island[],
    islandTime: Date | null
}
function IslandComponent({ islands, islandTime }: IslandComponentProps) {
    const [timeLeft, setTimeLeft] = useState(() => islandTime !== null ? islandTime?.getTime() - Date.now() : 0);

    useEffect(() => {
        const interval = setInterval(() => {
            if (islandTime !== null) {
                const diff = islandTime?.getTime() - Date.now();
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
                        <p className="text-lg">{getNextIslandTime(islandTime)}</p>
                    </div>
                    <div className="grow text-right sm:text-left">
                        <p className="text-[8pt] fadedtext">남은 시간</p>
                        <p className={clsx(
                            "text-lg",
                            timeLeft !== 0 ? '' : 'text-red-500'
                        )}>{timeLeft !== 0 ? formatTimeLeft(timeLeft) : "모험섬 출현"}</p>
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {islands.map((island, index) => (
                    <Card key={index} radius="sm">
                        <CardHeader className="flex gap-3">
                            <Image 
                                src={island.icon} 
                                width={36}
                                height={36} 
                                alt={`island-${index}`} 
                                radius="sm"/>
                            <p>{island.name}</p>
                        </CardHeader>
                        <Divider/>
                        <CardBody>
                            <>
                                <p className="fadedtext text-sm mb-2">보상 아이템</p>
                                <div className="grid grid-cols-7 sm:grid-cols-4 lg1200:grid-cols-7 gap-3">
                                    {island.items.map((item, idx) => (
                                        <div key={idx}>
                                            <Tooltip
                                                showArrow
                                                content={<p className={getColorTextByGrade(item.grade)}>{item.name}</p>}>
                                                <Image 
                                                    src={item.icon} 
                                                    width={28}
                                                    height={28} 
                                                    alt={`item-${index}`} 
                                                    radius="sm"
                                                    className="hidden sm:block"/>
                                            </Tooltip>
                                            <Popover 
                                                showArrow>
                                                <PopoverTrigger>
                                                    <Image 
                                                        src={item.icon} 
                                                        width={28}
                                                        height={28} 
                                                        alt={`item-${index}`} 
                                                        radius="sm"
                                                        className="block sm:hidden"/>
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
                ))}
            </div>
        </div>
    )
}

// 일정 (모험섬, 필드보스 등) 컴포넌트
export default function CalendarComponent() {
    const calendarForm = useCalendarForm();

    useEffect(() => {
        const loadData = async () => {
            await loadCalendar(calendarForm.setIslands, calendarForm.setLoading, calendarForm.setIslandTime);
        }
        loadData();
    }, []);

    if (calendarForm.isLoading) {
        return <LoadingComponent heightStyle="min-h-[500px]"/>
    }
    return (
        <div className="w-full">
            <IslandComponent islands={calendarForm.islands} islandTime={calendarForm.islandTime}/>
        </div>
    )
}