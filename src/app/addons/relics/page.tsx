import RelicsClient from "./RelicsClient";
import { Metadata } from "next";
import { loadRelicBooks } from "./relicsServer";

export const metadata: Metadata = {
    title: '유물 각인서 시세 · 로츠고 도구',
    description: '로스트아크 경매장에 등록된 유물 각인서의 시세를 로츠고에서 확인하세요.',
};

export default async function RelicsComponent() {
    const relics = await loadRelicBooks();
    return <RelicsClient relics={relics}/>
}
