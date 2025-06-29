import { Metadata } from "next";
import CharacterClient from "./CharacterClient";

export const metadata: Metadata = {
    title: '전투정보실 · 로츠고 Lot\'s Go',
    description: '로츠고에서 캐릭터 정보를 확인하세요.',
};

export default function Character() {
    return <CharacterClient/>
}