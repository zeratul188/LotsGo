import { Metadata } from "next";
import SettingClient from "./SettingClient";

export const metadata: Metadata = {
    title: '설정 · 로츠고 Lot\'s Go',
    description: '로츠고의 계정을 관리하세요.',
};

export default function Setting() {
    return <SettingClient/>
}