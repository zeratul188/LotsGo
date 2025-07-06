import { Metadata } from "next";
import CalendarClient from "./CalendarClient";

export const metadata: Metadata = {
    title: '일정 · 로츠고 Lot\'s Go',
    description: '캐릭터별 숙제뿐 아니라 길드 일정도 함께 관리하세요. 로스트아크 플레이를 더 효율적으로 도와주는 일정 관리 기능입니다.',
};

export default function Calendar() {
    return <CalendarClient/>
}