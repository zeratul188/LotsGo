import type { Dayjs } from "dayjs";
import type { ContentData } from "../ui/CalendarForm";

export type ContentLevels = {
    startLevel: number,
    endLevel: number
}

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

export type CalendarData = {
    gate: ContentData | null,
    boss: ContentData | null,
    islands: Island[],
    islandTime: Dayjs | null,
    islandDatas: IslandData[],
    isInspection: boolean
}

export type IslandData = {
    name: string,
    icon: string,
    dates: string[],
    rewards: RewardItem[]
}

export type RewardItem = {
    name: string,
    icon: string,
    grade: string,
    times: string[] | null
}

export type Notice = {
    title: string,
    date: string,
    link: string
}

export type LostarkEvent = {
    title: string,
    thumbnail: string,
    link: string,
    startDate: string,
    endDate: string
}
