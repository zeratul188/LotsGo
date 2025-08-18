import { Metadata } from "next";
import RaidsClient from "./RaidsClient";

export const metadata: Metadata = {
    title: '설정 · 로츠고 Lot\'s Go',
    description: '로츠고의 계정을 관리하세요.',
};

export default function Raids() {
    return <RaidsClient/>
}