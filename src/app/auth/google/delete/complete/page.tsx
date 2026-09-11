import type { Metadata } from "next";
import GoogleDeleteCompleteClient from "./GoogleDeleteCompleteClient";

export const metadata: Metadata = {
    title: "회원 탈퇴 완료 · 로츠고 Lot's Go",
    description: "Google 계정 회원 탈퇴를 완료하고 있습니다."
};

export default function GoogleDeleteCompletePage() {
    return <GoogleDeleteCompleteClient/>;
}
