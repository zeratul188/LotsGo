import dayjs, { Dayjs } from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import type { Island, IslandData, IslandItem, RewardItem } from '../model/types';

dayjs.extend(utc)
dayjs.extend(timezone)

export const islandNearbyRegions: Record<string, string> = {
    '고요한 안식의 섬': '로웬',
    '기회의 섬': '아르데타인',
    '라일라이 아일랜드': '볼다이크',
    '메데이아': '슈샤이어',
    '몬테 섬': '베른 남부',
    '블루홀 섬': '베른 남부',
    '볼라르 섬': '베른 북부',
    '수라도': '로웬',
    '스노우팡 아일랜드': '슈샤이어',
    '우거진 갈대의 섬': '아르데타인',
    '잔혹한 장난감 성': '슈샤이어',
    '죽음의 협곡': '아르데타인',
    '태초의 섬': '로헨델',
    '포르페': '애니츠',
    '하모니 섬': '로헨델',
    '환영 나비 섬': '로헨델',
    '쿵덕쿵 아일랜드': '베른 북부'
};

export function getIslandNearbyRegion(islandName: string): string | null {
    return islandNearbyRegions[islandName] ?? null;
}

export function getIslandNearbyParticle(region: string): '과' | '와' {
    const lastCharacterCode = region.charCodeAt(region.length - 1);
    const hasFinalConsonant = lastCharacterCode >= 0xAC00 && lastCharacterCode <= 0xD7A3
        ? (lastCharacterCode - 0xAC00) % 28 !== 0
        : false;

    return hasFinalConsonant ? '과' : '와';
}

export function formatIslandNearbyRegion(region: string): string {
    return `${region}${getIslandNearbyParticle(region)} 가까움`;
}

// 오늘의 모험섬인지 확인하는 필터
export function filterTodayIslands(island: any): boolean {
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

//모험섬 시간 일치 여부
export function isSameDate(aDate: Dayjs, bDate: Dayjs): boolean {
    return aDate.year() === bDate.year() &&
        aDate.month() === bDate.month() &&
        aDate.date() === bDate.date() &&
        aDate.hour() === bDate.hour();
}

// 획득 아이템 반환 함수
export function getRewardItems(rewardItems: any): IslandItem[] {
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

// 두 날짜를 비교하여 현재 시간 이후인 오늘의 날짜인지 여부 확인
export function isToday(today: Dayjs, islandTime: Dayjs): boolean {
    if (today.year() === islandTime.year() && 
        today.month() === islandTime.month() &&
        today.date() === islandTime.date()) {
        const todayTimes = today.hour()*3600 + today.minute()*60 + today.second();
        const islandTimes = islandTime.hour()*3600 + islandTime.minute()*60 + islandTime.second();
        return islandTimes >= todayTimes;
    }
    return false;
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
    }
    return isFinded;
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

// 1주일 날짜 반환 함수
export function initialWeek(): Dayjs[] {
    const result: Dayjs[] = [];
    const today = dayjs().tz('Asia/Seoul');
    const day = today.day();
    const diffToWednesday = ((day - 3 + 7) % 7);
    const wednesday = dayjs().tz('Asia/Seoul').date(today.date() - diffToWednesday);

    for (let i = 0; i < 7; i++) {
        const d = wednesday.clone().date(wednesday.date() + i);
        result.push(d);
    }

    return result;
}

// 날짜 문구 출력 함수
export function formatKoreanDate(date: Dayjs): string {
    const days = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
    const dayName = days[date.day()];

    const month = (date.month() + 1).toString().padStart(2, '0');
    const day = date.date().toString().padStart(2, '0');

    return `${dayName} (${month}월 ${day}일)`;
}

// 해당 날짜에서 골드 보상이 있는지 없는지 확인 여부
export function isGoldIslands(targetDate: Dayjs, islandDatas: IslandData[]): boolean {
    return islandDatas.some(data =>
        data.dates.some(d => {
            const dDate = dayjs(d);
            return dDate.isSame(targetDate, 'day')
        }) &&
        data.rewards.some(r =>
            r.name === '골드' &&
            r.times ? r.times.some(t => {
                const tDate = dayjs(t);
                return tDate.isSame(targetDate, 'day')
            }) : false
        )
    );
}

// 특정 날짜에 등장하는 모험섬 목록 필터 함수
export function filterIslandData(week: Dayjs) {
    return (data: IslandData) => data.dates.some(d => dayjs(d).isSame(week, 'day'));
}

// 토·일 모험섬의 오전/오후 시간대 반환
export function getIslandTimePeriod(week: Dayjs, islandData: IslandData): '오전' | '오후' | null {
    if (week.day() !== 0 && week.day() !== 6) return null;

    const islandDate = islandData.dates
        .map((date) => dayjs(date).tz('Asia/Seoul'))
        .find((date) => date.isSame(week, 'day'));
    if (!islandDate) return null;

    return islandDate.hour() < 12 ? '오전' : '오후';
}

// 토·일 모험섬을 오전 일정부터 표시하도록 정렬
export function sortIslandDataByTimePeriod(week: Dayjs, islandDatas: IslandData[]): IslandData[] {
    if (week.day() !== 0 && week.day() !== 6) return islandDatas;

    const periodOrder = (islandData: IslandData) => {
        const period = getIslandTimePeriod(week, islandData);
        if (period === '오전') return 0;
        if (period === '오후') return 1;
        return 2;
    };

    return [...islandDatas].sort((a, b) => periodOrder(a) - periodOrder(b));
}

// 해당 날짜의 모험섬이 골드섬인지 확인
export function isGoldIsland(targetDate: Dayjs, islandDaata: IslandData): boolean {
    return islandDaata.dates.some(d => {
            const dDate = dayjs(d);
            return dDate.isSame(targetDate, 'day')
        }) &&
        islandDaata.rewards.some(r =>
            r.name === '골드' &&
            r.times ? r.times.some(t => {
                const tDate = dayjs(t);
                return tDate.isSame(targetDate, 'day')
            }) : false
        )
}

// 특정 날짜의 모험섬 보상 필터
export function filterRewardItem(week: Dayjs) {
    return (item: RewardItem) => item.times ? item.times.some(d => dayjs(d).isSame(week, 'day')) : false;
}
