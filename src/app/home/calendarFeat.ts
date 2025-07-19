import { ContentData } from "./CalendarForm";
import dayjs, { Dayjs } from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

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
    startDate: string,
    endDate: string
}

dayjs.extend(utc)
dayjs.extend(timezone)

// 로스트아크 API로부터 이벤트 정보 가져오는 함수
export async function loadEvents(apikey: string | undefined): Promise<LostarkEvent[]> {
    let eventLostarkRes = null;
    if (apikey) {
        eventLostarkRes = await fetch(`https://www.lotsgo.kr/api/lostark?value=null&code=4&key=${apikey}`);
    } else {
        eventLostarkRes = await fetch(`https://www.lotsgo.kr/api/lostark?value=null&code=4`);
    }
    if (eventLostarkRes.ok) {
        const events: LostarkEvent[] = [];
        const data = await eventLostarkRes.json();
        for (const event of data) {
            const startKstDayjs = dayjs.tz(event.StartDate, 'YYYY-MM-DDTHH:mm:ss', 'Asia/Seoul');
            const endKstDayjs = dayjs.tz(event.EndDate, 'YYYY-MM-DDTHH:mm:ss', 'Asia/Seoul');
            const newEvent: LostarkEvent = {
                title: event.Title,
                thumbnail: event.Thumbnail,
                link: event.Link,
                startDate: startKstDayjs.format(),
                endDate: endKstDayjs.format()
            }
            events.push(newEvent);
        }
        return events;
    }
    return [];
}

export type CalendarData = {
    gate: ContentData | null,
    boss: ContentData | null,
    islands: Island[],
    islandTime: Dayjs | null,
    isInspection: boolean
}

// 로스트아크 API로부터 캘린더 정보 가져오는 함수
export async function loadCalendar(apikey: string | undefined): Promise<CalendarData> {
    const calendarData: CalendarData = {
        gate: null,
        boss: null,
        islands: [],
        islandTime: null,
        isInspection: false
    }

    let gamecontentLostarkRes = null;
    if (apikey) {
        gamecontentLostarkRes = await fetch(`https://www.lotsgo.kr/api/lostark?value=null&code=2&key=${apikey}`);
    } else {
        gamecontentLostarkRes = await fetch(`https://www.lotsgo.kr/api/lostark?value=null&code=2`);
    }
    if (gamecontentLostarkRes.ok) {
        const islands: Island[] = [];
        const data = await gamecontentLostarkRes.json();
        const islandsData = data.filter((item: any) => item.CategoryName === '모험 섬');
        const todayIslands = islandsData.filter(filterTodayIslands);
        const today = dayjs().tz('Asia/Seoul');
        if (todayIslands.length !== 0) {
            let minTimes = dayjs().tz('Asia/Seoul').year(9999);
            for (const island of todayIslands) {
                for (const time of island.StartTimes) {
                    const islandDate = dayjs.tz(time, 'YYYY-MM-DDTHH:mm:ss', 'Asia/Seoul');
                    if (islandDate.isBefore(minTimes) && isToday(today, islandDate)) {
                        minTimes = islandDate;
                    }
                }
            }
            for (const island of todayIslands) {
                let isPassed = false;
                for (const time of island.StartTimes) {
                    const islandDate = dayjs.tz(time, 'YYYY-MM-DDTHH:mm:ss', 'Asia/Seoul')  // time은 "2025-07-17T11:00:00" (KST로 해석됨)
                    if (isSameDate(minTimes, islandDate)) {
                        isPassed = true;
                    }
                }
                if (isPassed) {
                    const newIsland: Island = {
                        name: island.ContentsName,
                        icon: island.ContentsIcon,
                        items: getRewardItems(island.RewardItems)
                    }
                    islands.push(newIsland);
                }
            }
            calendarData.islandTime = minTimes;
            calendarData.islands = islands;
        }
        const bossContentData: ContentData | null = {
            date: null,
            imgSrc: ''
        }
        const bossData = data.find((item: any) => item.CategoryName === '필드보스');
        if (bossData) {
            const imgSrc = bossData.ContentsIcon;
            const nowDate = dayjs().tz('Asia/Seoul');
            let saveDate: Dayjs | null = null;
            for (const item of bossData.StartTimes) {
                const itemDate = dayjs.tz(item, 'YYYY-MM-DDTHH:mm:ss', 'Asia/Seoul')  // time은 "2025-07-17T11:00:00" (KST로 해석됨)
                const diffMs = Math.abs(itemDate.valueOf() - nowDate.valueOf());
                const isOver3Hours = diffMs >= 3 * 60 * 60 * 1000;
                if (nowDate.valueOf() < itemDate.valueOf() && !isOver3Hours) {
                    saveDate = itemDate;
                    break;
                }
            }
            bossContentData.date = saveDate ? saveDate.format() : null;
            bossContentData.imgSrc = imgSrc;
        }
        calendarData.boss = bossContentData;
        const gateContentData: ContentData | null = {
            date: null,
            imgSrc: ''
        }
        const gateData = data.find((item: any) => item.CategoryName === '카오스게이트');
        if (gateData) {
            const imgSrc = gateData.ContentsIcon;
            const nowDate = dayjs().tz('Asia/Seoul');
            let saveDate: Dayjs | null = null;
            for (const item of gateData.StartTimes) {
                const itemDate = dayjs.tz(item, 'YYYY-MM-DDTHH:mm:ss', 'Asia/Seoul').add(10, 'minute')
                const diffMs = Math.abs(itemDate.valueOf() - nowDate.valueOf());
                const isOver3Hours = diffMs >= 3 * 60 * 60 * 1000;
                if (nowDate.valueOf() < itemDate.valueOf() && !isOver3Hours) {
                    saveDate = itemDate;
                    break;
                }
            }
            gateContentData.date = saveDate ? saveDate.format() : null;
            gateContentData.imgSrc = imgSrc;
        }
        calendarData.gate = gateContentData;
    } else {
        if (gamecontentLostarkRes.status === 500) {
            calendarData.isInspection = true;
            console.error(`서버 점검 (Error Status : ${gamecontentLostarkRes.status})`);
        } else {
            console.error(`Unable to load calendars data. (Error Status : ${gamecontentLostarkRes.status})`);
        }
    }
    return calendarData;
}

//모험섬 시간 일치 여부
function isSameDate(aDate: Dayjs, bDate: Dayjs): boolean {
    return aDate.year() === bDate.year() &&
        aDate.month() === bDate.month() &&
        aDate.date() === bDate.date() &&
        aDate.hour() === bDate.hour();
}

export type Notice = {
    title: string,
    date: string,
    link: string
}

// 로스트아크 API로부터 공지사항 데이터를 가져오는 함수
export async function loadNotices(apikey: string | undefined): Promise<Notice[]> {
    let noticeLostarkRes = null;
    if (apikey) {
        noticeLostarkRes = await fetch(`https://www.lotsgo.kr/api/lostark?value=null&code=3&key=${apikey}`);
    } else {
        noticeLostarkRes = await fetch(`https://www.lotsgo.kr/api/lostark?value=null&code=3`);
    }
    if (noticeLostarkRes.ok) {
        const notices: Notice[] = [];
        const data = await noticeLostarkRes.json();
        const slicedData = data.slice(0, 20);
        for (const notice of slicedData) {
            const eventDate = dayjs.tz(notice.Date, 'YYYY-MM-DDTHH:mm:ss', 'Asia/Seoul');
            const newNotice: Notice = {
                title: notice.Title,
                date: eventDate.format(),
                link: notice.Link
            }
            notices.push(newNotice);
        }
        return notices;
    }
    return [];
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
        const today = dayjs().tz('Asia/Seoul');
        for (const time of rewardItem.StartTimes) {
            const itemTime = dayjs.tz(time, 'YYYY-MM-DDTHH:mm:ss', 'Asia/Seoul')  // time은 "2025-07-17T11:00:00" (KST로 해석됨)
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
    const today = dayjs().tz('Asia/Seoul');
    if (island.StartTimes) {
        for (const time of island.StartTimes) {
            const islandTime = dayjs.tz(time, 'YYYY-MM-DDTHH:mm:ss', 'Asia/Seoul');
            if (isToday(today, islandTime)) {
                isFinded = true;
            }
        }
    }
    return isFinded;
}

// 두 날짜를 비교하여 현재 시간 이후인 오늘의 날짜인지 여부 확인
function isToday(today: Dayjs, islandTime: Dayjs): boolean {
    if (today.year() === islandTime.year() && 
        today.month() === islandTime.month() &&
        today.date() === islandTime.date()) {
        const todayTimes = today.hour()*3600 + today.minute()*60 + today.second();
        const islandTimes = islandTime.hour()*3600 + islandTime.minute()*60 + islandTime.second();
        return islandTimes >= todayTimes;
    }
    return false;
}

// 다음 모험섬 시간 출력
export function getNextIslandTime(islandTime: Dayjs | null): string {
    if (!islandTime) return '일정 없음';
    const time = dayjs(islandTime);
    const hourStr = String(time.hour()).padStart(2, '0');
    const minuteStr = String(time.minute()).padStart(2, '0');
    const secondStr = String(time.second()).padStart(2, '0');
    return `${hourStr}:${minuteStr}:${secondStr}`;
}

// 남은 시간 문자열 출력 (00:00:00 형식)
export function formatTimeLeft(timeLeft: number): string {
    const totalSeconds = Math.max(0, Math.floor(timeLeft / 1000));
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

// 모험섬에서 골드 아이템이 있는지 여부 반환 함수
export function isHaveGold(island: Island): boolean {
    for (const item of island.items) {
        if (item.name === '골드') return true;
    }
    return false;
}