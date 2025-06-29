import { Metadata } from "next";
import ChecklistClient from "./ChecklistClient";

export const metadata: Metadata = {
    title: '숙제 · 로츠고 Lot\'s Go',
    description: '로츠고에서 로스트아크의 캐릭터 숙제를 관리하세요.',
};

export default function Checklist() {
    return <ChecklistClient/>
}

