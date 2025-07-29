import { Metadata } from "next";
import AddonsClient from "./AddonsClient";

export const metadata: Metadata = {
    title: '부가기능 · 로츠고 Lot\'s Go',
    description: '로스트아크의 경매가에 대한 입찰 가격을 계산하며, 유물 각인서 시세를 확인하고 기타 다른 기능들을 로츠고의 통하여 확인하실 수 있습니다.',
};

export default function AddonsLayout({ children }: { children: React.ReactNode }) {
    return <AddonsClient children={children}/>
}