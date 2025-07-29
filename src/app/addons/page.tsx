
import { Metadata } from "next";
import CalcClient from "./CalcClient";

export const metadata: Metadata = {
    title: '경매 계산기 · 로츠고 도구',
    description: '로스트아크에서 콘텐츠 이후 경매 아이템 가격을 로츠고에서 계산해드립니다.',
};

export default function CalcComponent() {
    return (
        <CalcClient/>
    )
}