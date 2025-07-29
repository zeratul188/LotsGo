import BusClient from "./BusClient";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: '버스 계산기 · 로츠고 도구',
    description: '로스트아크에서 콘텐츠 버스할 때 버스비 또는 입찰 금액을 로츠고에서 계산해드립니다.',
};

export default function BusComponent() {
    return <BusClient/>
}