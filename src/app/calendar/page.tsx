import { Metadata } from "next";
import CalendarClient from "./CalendarClient";

export const metadata: Metadata = {
    title: '일정 · 로츠고 Lot\'s Go',
    description: '로스트아크의 일정을 관리하세요.',
};

export default function Calendar() {
    return <CalendarClient/>
}