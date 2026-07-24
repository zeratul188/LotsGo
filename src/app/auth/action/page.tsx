import type { Metadata } from "next";
import AuthActionClient from "./AuthActionClient";

export const metadata: Metadata = {
    title: "계정 인증 · 로츠고 Lot's Go",
    description: "로츠고 계정의 인증 작업을 완료하세요."
};

type AuthActionPageProps = {
    searchParams: Promise<{
        mode?: string,
        oobCode?: string
    }>
}

export default async function AuthActionPage({ searchParams }: AuthActionPageProps) {
    const { mode, oobCode } = await searchParams;

    return (
        <AuthActionClient
            mode={mode}
            oobCode={oobCode}
        />
    );
}
