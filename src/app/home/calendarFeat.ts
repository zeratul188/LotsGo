import { SetStateFn } from "@/utiils/utils";

export type IslandItem = {
    name: string,
    icon: string,
    grade: string
}
export type Island = {
    name: string,
    icon: string,
    items: IslandItem[]
}

export type LostarkEvent = {
    title: string,
    thumbnail: string,
    link: string,
    startDate: Date,
    endDate: Date
}

// 로스트아크 API로부터 이벤트 정보 가져오는 함수
export async function loadEvents(setEvents: SetStateFn<LostarkEvent[]>) {
    const eventLostarkRes = await fetch(`/api/lostark?value=null&code=4`);
    if (eventLostarkRes.ok) {
        const events: LostarkEvent[] = [];
        const data = await eventLostarkRes.json();
        for (const event of data) {
            const newEvent: LostarkEvent = {
                title: event.Title,
                thumbnail: event.Thumbnail,
                link: event.Link,
                startDate: new Date(event.StartDate),
                endDate: new Date(event.EndDate)
            }
            events.push(newEvent);
        }
        setEvents(events);
    } else {
        console.error(`Unable to load events data. (Error Status : ${eventLostarkRes.status})`);
    }
}

// 로스트아크 API로부터 캘린더 정보 가져오는 함수
export async function loadCalendar(
    setIslands: SetStateFn<Island[]>,
    setIslandTime: SetStateFn<Date | null>
) {
    const gamecontentLostarkRes = await fetch(`/api/lostark?value=null&code=2`);
    if (gamecontentLostarkRes.ok) {
        const islands: Island[] = [];
        const data = await gamecontentLostarkRes.json();
        const islandsData = data.filter((item: any) => item.CategoryName === '모험 섬');
        const todayIslands = islandsData.filter(filterTodayIslands);
        const today = new Date();
        for (const time of todayIslands[0].StartTimes) {
            const startTime = new Date(time);
            if (isToday(today, startTime)) {
                setIslandTime(startTime);
                break;
            }
        }
        for (const island of todayIslands) {
            const newIsland: Island = {
                name: island.ContentsName,
                icon: island.ContentsIcon,
                items: getRewardItems(island.RewardItems)
            }
            islands.push(newIsland);
        }
        setIslands(islands);
    } else {
        console.error(`Unable to load calendars data. (Error Status : ${gamecontentLostarkRes.status})`);
    }
}

export type Notice = {
    title: string,
    date: Date,
    link: string
}

// 로스트아크 API로부터 공지사항 데이터를 가져오는 함수
export async function loadNotices(setNotices: SetStateFn<Notice[]>) {
    const noticeLostarkRes = await fetch(`/api/lostark?value=null&code=3`);
    if (noticeLostarkRes.ok) {
        const notices: Notice[] = [];
        const data = await noticeLostarkRes.json();
        const slicedData = data.slice(0, 20);
        for (const notice of slicedData) {
            const newNotice: Notice = {
                title: notice.Title,
                date: new Date(notice.Date),
                link: notice.Link
            }
            notices.push(newNotice);
        }
        setNotices(notices);
    } else {
        console.error(`Unable to load notices data. (Error Status : ${noticeLostarkRes.status})`);
    }
}

// 획득 아이템 반환 함수
function getRewardItems(rewardItems: any): IslandItem[] {
    const items: IslandItem[] = [];
    for (const reward of rewardItems) {
        const newItems = reward.Items.filter(filterTodayItems)
        for (const item of newItems) {
            const newItem: IslandItem = {
                name: item.Name,
                icon: item.Icon,
                grade: item.Grade
            }
            items.push(newItem);
        }
    }
    return items;
}

// 모험섬 보상 아이템 중 오늘의 아이템인지 확인 여부
function filterTodayItems(rewardItem: any): boolean {
    let isFinded = false;
    if (rewardItem.StartTimes !== null) {
        const today = new Date();
        for (const time of rewardItem.StartTimes) {
            const itemTime = new Date(time);
            if (isToday(today, itemTime)) {
                isFinded = true;
            }
        }
    } else {
        isFinded = true;
    }
    return isFinded;
}

// 오늘의 모험섬인지 확인하는 필터
function filterTodayIslands(island: any): boolean {
    let isFinded = false;
    const today = new Date();
    for (const time of island.StartTimes) {
        const islandTime = new Date(time);
        if (isToday(today, islandTime)) {
            isFinded = true;
        }
    }
    return isFinded;
}

// 두 날짜를 비교하여 현재 시간 이후인 오늘의 날짜인지 여부 확인
function isToday(today: Date, islandTime: Date): boolean {
    if (today.getFullYear() === islandTime.getFullYear() && 
        today.getMonth() === islandTime.getMonth() &&
        today.getDate() === islandTime.getDate()) {
        const todayTimes = today.getHours()*3600 + today.getMinutes()*60 + today.getSeconds();
        const islandTimes = islandTime.getHours()*3600 + islandTime.getMinutes()*60 + islandTime.getSeconds();
        return islandTimes >= todayTimes;
    }
    return false;
}

// 다음 모험섬 시간 출력
export function getNextIslandTime(islandTime: Date | null): string {
    if (islandTime !== null) {
        const hourStr = String(islandTime.getHours()).padStart(2, '0');
        const minuteStr = String(islandTime.getMinutes()).padStart(2, '0');
        const secondStr = String(islandTime.getSeconds()).padStart(2, '0');
        return `${hourStr}:${minuteStr}:${secondStr}`;
    }
    return '일정 없음';
}

// 남은 시간 문자열 출력 (00:00:00 형식)
export function formatTimeLeft(timeLeft: number): string {
    const totalSeconds = Math.max(0, Math.floor(timeLeft / 1000));
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}