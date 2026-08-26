import type { Metadata } from "next";

import FineCalculatorClient from "./ui/FineCalculatorClient";

export const metadata: Metadata = {
    title: "벌금 계산기 · 로츠고 도구",
    description: "레이드 벌금을 기록하고 참여자별 최종 골드 송금액을 간편하게 정산하세요."
};

export default function FineCalculatorPage() {
    return <FineCalculatorClient/>;
}
