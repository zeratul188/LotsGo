import { Metadata } from "next";
import CharacterClient from "./CharacterClient";

export const metadata: Metadata = {
    title: '전투정보실 · 로츠고 Lot\'s Go',
    description: '로스트아크의 캐릭터 장비, 보석, 트라이포드, 카드 세팅 등 상세 정보를 확인할 수 있어요.',
};

export default function Character() {
    return <CharacterClient/>
}