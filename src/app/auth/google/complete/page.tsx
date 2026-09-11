import type { Metadata } from "next";
import GoogleLoginCompleteClient from "./GoogleLoginCompleteClient";

export const metadata: Metadata = {
    title: "Google 로그인 · 로츠고 Lot's Go",
    description: "Google 로그인을 완료하고 있습니다."
};

export default function GoogleLoginCompletePage() {
    return <GoogleLoginCompleteClient/>;
}
