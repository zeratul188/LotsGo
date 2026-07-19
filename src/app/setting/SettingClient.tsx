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
        description: '캐릭터와 대표 캐릭터 관리',
        component: <ExpeditionsComponent/>
    },
    {
        key: 'setting',
        title: '기능 설정',
        description: '숙제 화면 표시 방식 설정',
        component: <OptionComponent/>
    },
    {
        key: 'apikey',
        title: '로스트아크 API 키',
        description: '게임 데이터 연동 키 관리',
        component: <APIComponent/>
    },
    {
        key: 'history',
        title: '로그인 기록',
        description: '최근 접속 기록 확인',
        component: <HistoryComponent/>
    },
    {
        key: 'change-password',
        title: '비밀번호 변경',
        description: '계정 비밀번호 변경',
        component: <ChangePasswordComponent/>
    },
    {
        key: 'exit-site',
        title: '회원탈퇴',
        description: '계정 및 데이터 삭제',
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
                radius="lg"
                variant="light"
                aria-label="settings tabs" 
                placement={isMobile ? 'top' : 'start'}
                className="flex"
                classNames={{
                    base: "w-full sm:w-auto sm:items-start",
                    tabList: "w-full gap-1 rounded-2xl border border-default-200 bg-white p-2 shadow-sm dark:border-white/10 dark:bg-[#171717] sm:w-[220px]",
                    tab: "h-auto min-h-14 justify-start px-4 py-3",
                    cursor: "bg-primary/10 shadow-none dark:bg-primary/20",
                    tabContent: "w-full text-left group-data-[selected=true]:text-primary",
                    panel: "w-full min-w-0 px-0 pt-4 sm:pl-5 sm:pt-0"
                }}>
                {tabs.map((tab) => (
                    <Tab
                        key={tab.key}
                        title={
                            <div className="min-w-0 py-0.5 text-left">
                                <p className="truncate text-sm font-bold">{tab.title}</p>
                                <p className="mt-0.5 hidden truncate text-xs text-default-400 sm:block">{tab.description}</p>
                            </div>
                        }
                        className="min-w-[200px] flex-1">
                        <div className="w-full sm:min-h-[calc(100vh-105px)] rounded-2xl border border-default-200/80 bg-content1 p-3 dark:border-white/10 dark:bg-[#18181b] md:pl-4 overflow-y-auto max-h-[calc(100vh-105px)] scrollbar-none">
                            {tab.component}
                        </div>
                    </Tab>
                ))}
            </Tabs>
        </div>
    )
}
