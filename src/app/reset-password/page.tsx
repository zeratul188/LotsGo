import type { Metadata } from "next";
import ResetPasswordClient from "./ResetPasswordClient";

export const metadata: Metadata = {
    title: "비밀번호 재설정 · 로츠고 Lot's Go",
    description: "로츠고 계정의 새로운 비밀번호를 설정하세요.",
};

type ResetPasswordPageProps = {
    searchParams: Promise<{
        mode?: string,
        oobCode?: string,
    }>
}

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
    const { mode, oobCode } = await searchParams;

    return <ResetPasswordClient mode={mode} oobCode={oobCode}/>;
}
