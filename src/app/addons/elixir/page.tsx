import { Metadata } from "next";
import ElixirForm from "./ui/ElixirForm";

export const metadata: Metadata = {
    title: "엘릭서 시뮬레이션 · 로츠고 도구",
    description: "로스트아크 엘릭서 정제와 연성을 체험하고 완성된 엘릭서를 부위별로 관리합니다.",
};

export default function ElixirPage() {
    return <ElixirForm/>;
}
