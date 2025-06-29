import { Metadata } from "next";
import LoginClient from "./LoginClient";

export const metadata: Metadata = {
    title: '로그인 · 로츠고 Lot\'s Go',
    description: '로츠고에 로그인하세요.',
};

export default function Login() {
    return <LoginClient/>
}