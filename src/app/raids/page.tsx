import { Metadata } from "next";
import RaidsClient from "./RaidsClient";

export const metadata: Metadata = {
    title: '파티 · 로츠고 Lot\'s Go',
    description: '로츠고에서 파티를 꾸려보세요.',
};

export default function Raids() {
    return <RaidsClient/>
}