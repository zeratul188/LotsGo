import { Metadata } from "next";
import CalendarClient from "./CalendarClient";

export const metadata: Metadata = {
    title: '일정 · 로츠고 Lot\'s Go',
    description: '로스트아크의 숙제를 체크하고 관리할 수 있으며, 개인 일정, 길드 일정을 관리하고 전투정보실을 통해 캐릭터들의 정보를 확인할 수 있습니다. 로츠고에서 매주 반복되는 숙제를 쉽고 간편하게 관리하세요.',
};

export default function Calendar() {
    return <CalendarClient/>
}