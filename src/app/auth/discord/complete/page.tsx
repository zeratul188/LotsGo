import { Metadata } from "next";
import DiscordLoginCompleteClient from "./DiscordLoginCompleteClient";

export const metadata: Metadata = {
    title: "Discord 로그인 · 로츠고 Lot's Go",
    description: "Discord 로그인을 완료하고 있습니다."
};

export default function DiscordLoginCompletePage() {
    return <DiscordLoginCompleteClient/>;
}
