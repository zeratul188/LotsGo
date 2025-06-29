import { Metadata } from "next";
import TermsClient from "./TermsClient";

export const metadata: Metadata = {
    title: '이용약관 · 로츠고 Lot\'s Go',
    description: '로츠고의 이용약관을 확인하세요.',
};

export default function Terms() {
    return <TermsClient/>
}