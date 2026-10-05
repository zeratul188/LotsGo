'use client'
import { useMobileQuery } from "@/utiils/utils"
import { addToast, Tab, Tabs } from "@heroui/react";
import { ExpeditionsComponent } from "./ui/ExpeditionForm";
import { useEffect, useState, type ReactNode } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { checkLogin } from "../checklist/lib/checklistFeat";
import ChangePasswordComponent from "./ui/ChangePasswordForm";
import DeleteComponent from "./ui/DeleteForm";
import APIComponent from "./ui/ApiForm";
import OptionComponent from "./ui/OptionForm";
import HistoryComponent from "./ui/HistoryForm";
import DiscordComponent from "./ui/DiscordForm";
import DiscordGuildComponent from "./ui/DiscordGuildForm";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";
import { LoadingComponent } from "../UtilsCompnents";
import { SettingMenuIcon, SettingMenuIconName } from "./ui/SettingMenuIcon";

const tabs: { key: SettingMenuIconName; title: string; description: string; component: ReactNode }[] = [
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
        key: 'discord',
        title: 'Discord 연동',
        description: 'Discord 계정 연결 및 관리',
        component: <DiscordComponent/>
    },
    {
        key: 'discord-guilds',
        title: 'Discord 길드 서버 관리',
        description: 'Discord 서버 기능 및 권한 관리',
        component: <DiscordGuildComponent/>
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

function getValidTab(value: string | null): string {
    return value && tabs.some((item) => item.key === value) ? value : 'expeditions';
}

export default function SettingClient() {
    const isMobile = useMobileQuery();
    const router = useRouter();
    const searchParams = useSearchParams();
    const isCheckedToken = useSelector((state: RootState) => state.login.isCheckedToken);
    const authProvider = useSelector((state: RootState) => state.login.user.authProvider);
    const [selectedTab, setSelectedTab] = useState(() => getValidTab(searchParams.get('tab')));

    useEffect(() => {
        const tab = searchParams.get('tab');
        setSelectedTab(getValidTab(tab));
    }, [searchParams]);

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
            <LoadingComponent
                heightStyle="min-h-[calc(100vh-65px)]"
                message="계정 설정을 준비하고 있어요"
                detail="로그인 상태와 저장된 설정을 확인하고 있습니다."/>
        )
    }

    return (
        <div className="min-h-[calc(100vh-65px)] w-full max-w-[1280px] mx-auto relative p-3 sm:p-5">
            <Tabs
                color="primary"
                radius="sm"
                variant="light"
                aria-label="계정 및 설정 메뉴"
                placement={isMobile ? 'top' : 'start'}
                selectedKey={selectedTab}
                onSelectionChange={(key) => setSelectedTab(String(key))}
                className="flex min-w-0"
                classNames={{
                    base: "w-full min-w-0 md:w-[220px] md:shrink-0 md:items-start",
                    tabList: "!grid w-full grid-cols-2 gap-1 rounded-xl border border-default-200 bg-default-50/50 p-2 shadow-none dark:border-white/10 dark:bg-[#171717] md:!flex md:w-[220px] md:flex-col",
                    tab: "h-9 min-h-9 justify-start rounded-lg px-2.5 text-default-600 dark:text-default-300",
                    cursor: "bg-primary-50 shadow-none dark:bg-primary-500/15",
                    tabContent: "w-full text-left group-data-[selected=true]:font-semibold group-data-[selected=true]:text-primary-700 dark:group-data-[selected=true]:text-primary-300",
                    panel: "w-full min-w-0 px-0 pt-3 md:w-0 md:flex-1 md:pl-4 md:pt-0"
                }}>
                {tabs.filter(tab => tab.key !== 'change-password' || authProvider !== 'google').map((tab) => (
                    <Tab
                        key={tab.key}
                        title={
                            <span className="flex min-w-0 items-center gap-2.5 text-left">
                                <SettingMenuIcon name={tab.key}/>
                                <span className="truncate text-xs font-medium">{tab.title}<span className="sr-only"> — {tab.description}</span></span>
                            </span>
                        }
                        className={`relative !w-full min-w-0 whitespace-nowrap ${tab.key === 'discord' || tab.key === 'history' ? "md:mt-3 md:before:absolute md:before:-top-2 md:before:left-0 md:before:right-0 md:before:h-px md:before:bg-default-200 dark:md:before:bg-white/10" : ""}`}>
                        <div className="w-full rounded-2xl border border-default-200/80 bg-content1 p-3 dark:border-white/10 dark:bg-[#18181b] md:pl-4">
                            {tab.key === selectedTab ? tab.component : null}
                        </div>
                    </Tab>
                ))}
            </Tabs>
        </div>
    )
}
