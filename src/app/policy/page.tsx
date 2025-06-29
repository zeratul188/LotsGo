import { Metadata } from "next";
import PolicyClient from "./PolicyClient";

export const metadata: Metadata = {
    title: '개인정보 처리방침 · 로츠고 Lot\'s Go',
    description: '로츠고의 개인정보 처리방침에 대해서 확인하세요.',
};

export default function Poiicy() {
    return <PolicyClient/>
}