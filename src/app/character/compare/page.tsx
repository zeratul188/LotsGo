import { Metadata } from "next";
import CompareClient from "./CompareClient";

export const metadata: Metadata = {
    title: '캐릭터 비교 · 로츠고 Lot\'s Go',
    description: '캐릭터의 장비, 각인, 보석, 카드, 아바타, 원정대 등 다양한 전투 세팅들이 저장된 원정대 캐릭터들을 확인할 수 있습니다. 다른 유저의 세팅도 검색하고 비교할 수 있어 효율적인 세팅 구성이 가능합니다.',
};

export default function CompareCharacters() {
    return <CompareClient/>
}
