'use client'
import { useMobileQuery } from "@/utiils/utils"
import { addToast, Spinner, Tab, Tabs } from "@heroui/react";
import { ExpeditionsComponent } from "./ui/ExpeditionForm";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { checkLogin } from "../checklist/lib/checklistFeat";
import ChangePasswordComponent from "./ui/ChangePasswordForm";
import DeleteComponent from "./ui/DeleteForm";
import APIComponent from "./ui/ApiForm";
import OptionComponent from "./ui/OptionForm";
import HistoryComponent from "./ui/HistoryForm";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";

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
        key: 'history',
        title: '로그인 기록',
        component: <HistoryComponent/>
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
    const isCheckedToken = useSelector((state: RootState) => state.login.isCheckedToken);

    useEffect(() => {
        if (!isCheckedToken) return;
        if (!checkLogin()) {
            addToast({
                title: "이용 불가",
                description: `로그인을 해야만 이용 가능합니다.`,
                color: "danger"
            });
            router.push('/login');
        }
    }, [isCheckedToken]);

    if (!isCheckedToken) {
        return (
            <div className="min-h-[calc(100vh-65px)] p-5 w-full flex justify-center items-center">
                <Spinner label="로그인 정보를 확인 중입니다..." variant="wave" classNames={{ label: 'fadedtext mt-4' }}/>
            </div>
        )
    }

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
