import { Metadata } from "next";
import SignupClient from "./SignupClient";

export const metadata: Metadata = {
    title: '회원가입 · 로츠고 Lot\'s Go',
    description: '로츠고에 가입하세요.',
};

export default function Signup() {
    return <SignupClient/>
}