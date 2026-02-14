'use client'
import { useMobileQuery } from "@/utiils/utils"
import { addToast, Tab, Tabs } from "@heroui/react";
import { ExpeditionsComponent } from "./ExpeditionForm";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { checkLogin } from "../checklist/checklistFeat";
import ChangePasswordComponent from "./ChangePasswordForm";
import DeleteComponent from "./DeleteForm";
import APIComponent from "./ApiForm";
import OptionComponent from "./OptionForm";

const tabs = [
    {
        key: 'expeditions',
        title: '내 원정대',
        component: <ExpeditionsComponent/>
    },
    {
        key: 'setting',
        title: '기능 설정',
        component: <OptionComponent/>
    },
    {
        key: 'apikey',
        title: '로스트아크 API 키',
        component: <APIComponent/>
    },
    {
        key: 'change-password',
        title: '비밀번호 변경',
        component: <ChangePasswordComponent/>
    },
    {
        key: 'exit-site',
        title: '회원탈퇴',
        component: <DeleteComponent/>
    }
]

export default function SettingClient() {
    const isMobile = useMobileQuery();
    const router = useRouter();

    useEffect(() => {
        if (!checkLogin()) {
            addToast({
                title: "이용 불가",
                description: `로그인을 해야만 이용 가능합니다.`,
                color: "danger"
            });
            router.push('/login');
        }
    }, []);

    return (
        <div className="min-h-[calc(100vh-65px)] p-5 w-full max-w-[1280px] mx-auto relative">
            <Tabs 
                fullWidth={isMobile} 
                color="primary"
                radius="sm"
                variant="light"
                aria-label="settings tabs" 
                placement={isMobile ? 'top' : 'start'}>
                {tabs.map((tab) => (
                    <Tab key={tab.key} title={tab.title} className="min-w-[200px] flex-1">
                        <div className="w-full sm:min-h-[calc(100vh-105px)] border-l-0 md:border-l border-gray-300 dark:border-gray-600 pl-0 md:pl-4 overflow-y-auto max-h-[calc(100vh-105px)] scrollbar-none">
                            {tab.component}
                        </div>
                    </Tab>
                ))}
            </Tabs>
        </div>
    )
}