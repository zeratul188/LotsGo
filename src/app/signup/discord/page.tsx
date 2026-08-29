import type { Metadata } from "next";
import DiscordSignupClient from "./DiscordSignupClient";

export const metadata: Metadata = {
    title: "Discord 회원가입 · 로츠고 Lot's Go",
    description: "인증된 Discord 계정으로 로츠고 회원가입을 완료합니다."
};

export default function DiscordSignupPage() {
    return <DiscordSignupClient/>;
}
