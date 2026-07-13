import { Metadata } from "next";
import TranscendenceForm from "./ui/TranscendenceForm";

export const metadata: Metadata = {
    title: "초월 시뮬레이터 · 로츠고 도구",
    description: "사라진 로스트아크 장비 초월을 다시 즐길 수 있는 시뮬레이터입니다.",
};

export default function TranscendencePage() {
    return <TranscendenceForm/>;
}
