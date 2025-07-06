import { Metadata } from "next";
import ChecklistClient from "./ChecklistClient";

export const metadata: Metadata = {
    title: '숙제 · 로츠고 Lot\'s Go',
    description: '로스트아크 숙제 체크와 골드 수급을 한눈에! 캐릭터별 숙제, 레이드, 큐브 등 일일/주간 콘텐츠를 편리하게 관리하세요.',
};

export default function Checklist() {
    return <ChecklistClient/>
}

