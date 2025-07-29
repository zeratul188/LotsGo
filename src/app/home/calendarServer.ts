import redis from "@/lib/redis";
import { ContentData } from "./CalendarForm";
import dayjs, { Dayjs } from "dayjs";
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { CalendarData, filterTodayIslands, getRewardItems, Island, IslandData, isSameDate, isToday, LostarkEvent, Notice, RewardItem } from "./calendarFeat";

dayjs.extend(utc)
dayjs.extend(timezone)

// 로스트아크 API로부터 캘린더 정보 가져오는 함수
export async function loadCalendar(apikey: string | undefined): Promise<CalendarData> {
    const calendarData: CalendarData = {
        gate: null,
        boss: null,
        islands: [],
        islandTime: null,
        islandDatas: [],
        isInspection: false
    }
    const cached = await redis.get('calendar');
    if (cached) {
        const data = JSON.parse(cached);
        const result: CalendarData = {
            gate: null,
            boss: null,
            islands: [],
            islandTime: null,
            islandDatas: data.islandDatas,
            isInspection: false
        }
        const islandData = data.islandData;
        if (islandData) {
            const todayIslands = islandData.filter(filterTodayIslands);
            const today = dayjs().tz('Asia/Seoul');
            const islands: Island[] = [];
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
                result.islandTime = minTimes;
                result.islands = islands;
            }
        }
        const bossData = data.bossData;
        const bossContentData: ContentData | null = {
            date: null,
            imgSrc: ''
        }
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
        result.boss = bossContentData;
        const gateData = data.gateData;
        const gateContentData: ContentData | null = {
            date: null,
            imgSrc: ''
        }
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
        result.gate = gateContentData;
        return result;
    }

    let gamecontentLostarkRes = null;
    if (apikey) {
        gamecontentLostarkRes = await fetch(`https://www.lotsgo.kr/api/lostark?value=null&code=2&key=${apikey}`);
    } else {
        gamecontentLostarkRes = await fetch(`https://www.lotsgo.kr/api/lostark?value=null&code=2`);
    }
    if (gamecontentLostarkRes.ok) {
        const islands: Island[] = [];
        const islandDatas: IslandData[] = [];
        const data = await gamecontentLostarkRes.json();
        const islandsData = data.filter((item: any) => item.CategoryName === '모험 섬');
        for (const item of islandsData) {
            const dates: string[] = [];
            if (item.StartTimes) {
                for (const time of item.StartTimes) {
                    const newTime: Dayjs = dayjs.tz(time, 'YYYY-MM-DDTHH:mm:ss', 'Asia/Seoul');
                    dates.push(newTime.format());
                }
            }
            const newData: IslandData = {
                name: item.ContentsName,
                icon: item.ContentsIcon,
                dates: dates,
                rewards: getRewardAllItems(item.RewardItems)
            }
            islandDatas.push(newData);
        }
        calendarData.islandDatas = islandDatas;
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

        const TTL_TIME = 24 * 60 * 60; // 24시간 유효시간
        const newData = {
            islandDatas: calendarData.islandDatas,
            islandData: islandsData,
            bossData: bossData,
            gateData: gateData
        }
        await redis.set('calendar', JSON.stringify(newData), "EX", TTL_TIME);
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

// 로스트아크 API로부터 이벤트 정보 가져오는 함수
export async function loadEvents(apikey: string | undefined): Promise<LostarkEvent[]> {
    const cached = await redis.get('events');
    if (cached) {
        const data: LostarkEvent[] = JSON.parse(cached);
        return data;
    }

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

        const TTL_TIME = 24 * 60 * 60; // 24시간 유효시간
        await redis.set('events', JSON.stringify(events), "EX", TTL_TIME);
        return events;
    }
    return [];
}

// 로스트아크 API로부터 공지사항 데이터를 가져오는 함수
export async function loadNotices(apikey: string | undefined): Promise<Notice[]> {
    const cached = await redis.get('notices');
    if (cached) {
        const data: Notice[] = JSON.parse(cached);
        return data;
    }

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

        const TTL_TIME = 24 * 60 * 60; // 24시간 유효시간
        await redis.set('notices', JSON.stringify(notices), "EX", TTL_TIME);
        return notices;
    }
    return [];
}

// 전체 모험섬 정보 가져올 경우 획득 아이템 반환 함수
function getRewardAllItems(rewardItems: any): RewardItem[] {
    const items: RewardItem[] = [];
    for (const reward of rewardItems) {
        for (const item of reward.Items) {
            const dates: string[] = [];
            if (item.StartTimes) {
                for (const time of item.StartTimes) {
                    const newTime: Dayjs = dayjs.tz(time, 'YYYY-MM-DDTHH:mm:ss', 'Asia/Seoul');
                    dates.push(newTime.format());
                }
            }
            const newItem: RewardItem = {
                name: item.Name,
                icon: item.Icon,
                grade: item.Grade,
                times: dates
            }
            items.push(newItem);
        }
    }
    return items;
}