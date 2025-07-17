import { ContentData } from "./CalendarForm";
import { LoginUser } from "../store/loginSlice";
import { decrypt } from "@/utiils/crypto";

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

const secretKey = process.env.NEXT_PUBLIC_SECRET_KEY ? process.env.NEXT_PUBLIC_SECRET_KEY : 'null';

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
            const newEvent: LostarkEvent = {
                title: event.Title,
                thumbnail: event.Thumbnail,
                link: event.Link,
                startDate: new Date(event.StartDate),
                endDate: new Date(event.EndDate)
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
    islandTime: Date | null,
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
        const today = new Date();
        if (todayIslands.length !== 0) {
            let minTimes = new Date();
            minTimes.setFullYear(9999);
            for (const island of todayIslands) {
                for (const time of island.StartTimes) {
                    const islandDate = new Date(time);
                    if (minTimes.getTime() > islandDate.getTime() && isToday(today, islandDate)) {
                        minTimes = islandDate;
                    }
                }
            }
            for (const island of todayIslands) {
                let isPassed = false;
                for (const time of island.StartTimes) {
                    const islandDate = new Date(time);
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
            const nowDate = new Date();
            let saveDate: Date | null = null;
            for (const item of bossData.StartTimes) {
                const itemDate = new Date(item);
                const diffMs = Math.abs(itemDate.getTime() - nowDate.getTime());
                const isOver3Hours = diffMs >= 3 * 60 * 60 * 1000;
                if (nowDate.getTime() < itemDate.getTime() && !isOver3Hours) {
                    saveDate = itemDate;
                    break;
                }
            }
            bossContentData.date = saveDate;
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
            const nowDate = new Date();
            let saveDate: Date | null = null;
            for (const item of gateData.StartTimes) {
                const itemDate = new Date(item);
                itemDate.setMinutes(itemDate.getMinutes() + 10);
                const diffMs = Math.abs(itemDate.getTime() - nowDate.getTime());
                const isOver3Hours = diffMs >= 3 * 60 * 60 * 1000;
                if (nowDate.getTime() < itemDate.getTime() && !isOver3Hours) {
                    saveDate = itemDate;
                    break;
                }
            }
            gateContentData.date = saveDate;
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
function isSameDate(aDate: Date, bDate: Date): boolean {
    return aDate.getFullYear() === bDate.getFullYear() &&
        aDate.getMonth() === bDate.getMonth() &&
        aDate.getDate() === bDate.getDate() &&
        aDate.getHours() === bDate.getHours();
}

export type Notice = {
    title: string,
    date: Date,
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
            const newNotice: Notice = {
                title: notice.Title,
                date: new Date(notice.Date),
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
    if (island.StartTimes) {
        for (const time of island.StartTimes) {
            const islandTime = new Date(time);
            if (isToday(today, islandTime)) {
                isFinded = true;
            }
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
    if (islandTime) {
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

// 모험섬에서 골드 아이템이 있는지 여부 반환 함수
export function isHaveGold(island: Island): boolean {
    for (const item of island.items) {
        if (item.name === '골드') return true;
    }
    return false;
}