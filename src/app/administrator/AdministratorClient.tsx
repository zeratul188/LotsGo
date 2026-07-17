'use client'
import { Tabs, Tab, addToast } from "@heroui/react";
import { useRouter } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";
import Checklist from "./ui/Checklist";
import { useMobileQuery } from "@/utiils/utils";
import MembersComponent from "./ui/MembersForm";
import CryptoComponent from "./ui/CryptoForm";
import DonateComponent from "./ui/DonateForm";
import BadgeComponent from "./ui/BadgeForm";
import { isAdministratorByToken } from "./lib/administratorFeat";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../store/store";

type TabMenu = {
    key: string,
    title: string,
    description: string,
    component: ReactNode
}

export default function AdministratorClient() {
    const [isAdministrator, setAdministrator] = useState(false);
    const isMobile = useMobileQuery();
    const router = useRouter();
    const dispatch = useDispatch<AppDispatch>();
    const isCheckedToken = useSelector((state: RootState) => state.login.isCheckedToken);
    
    const menus: Array<TabMenu> = [
        {
            key: 'checklist',
            title: '숙제 관리',
            description: '콘텐츠와 보상 데이터',
            component: <Checklist/>
        },
        {
            key: 'members',
            title: '멤버 관리',
            description: '회원 정보와 권한',
            component: <MembersComponent/>
        },
        {
            key: 'crypto',
            title: '자동화 관리',
            description: '자동 체크 계정',
            component: <CryptoComponent/>
        },
        {
            key: 'donate',
            title: '후원 관리',
            description: '후원 내역과 상태',
            component: <DonateComponent/>
        },
        {
            key: 'badges',
            title: '후원 혜택 관리',
            description: '배지와 후원 혜택',
            component: <BadgeComponent/>
        }
    ]

    useEffect(() => {
        const run = async () => {
            const isAdmin = await isAdministratorByToken(dispatch, router);
            if (!isAdmin) {
                addToast({
                    title: "권한 없음",
                    description: `관리자 권한이 없습니다.`,
                    color: "danger"
                });
                router.push('/');
            }
            setAdministrator(isAdmin);
        }
        if (isCheckedToken) run();
    }, [isCheckedToken]);

    if (!isAdministrator) {
        return (
            <div className="w-full min-h-[calc(100vh-65px)]"/>
        )
    }
    return (
        <div className="min-h-[calc(100vh-65px)] w-full max-w-[1440px] mx-auto px-4 py-6 sm:px-6 sm:py-8">
            <div className="mb-6 rounded-2xl border border-default-200 bg-white px-5 py-5 shadow-sm dark:border-white/10 dark:bg-[#171717] sm:px-7">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Administrator</p>
                <h1 className="mt-1 text-2xl font-bold text-foreground">관리자 센터</h1>
                <p className="mt-1 text-sm text-default-500">서비스 운영에 필요한 콘텐츠와 회원 데이터를 관리합니다.</p>
            </div>
            <Tabs 
                variant="light"
                color="primary"
                aria-label="관리자 메뉴"
                isVertical={!isMobile}
                radius="lg"
                size="lg"
                className="flex"
                classNames={{
                    base: "w-full sm:w-auto sm:items-start",
                    tabList: "w-full gap-1 rounded-2xl border border-default-200 bg-white p-2 shadow-sm dark:border-white/10 dark:bg-[#171717] sm:w-[220px]",
                    tab: "h-auto min-h-14 justify-start px-4 py-3",
                    cursor: "bg-primary/10 shadow-none dark:bg-primary/20",
                    tabContent: "w-full text-left group-data-[selected=true]:text-primary",
                    panel: "w-full min-w-0 px-0 pt-4 sm:pl-5 sm:pt-0"
                }}>
                {menus.map((menu: TabMenu) => (
                    <Tab key={menu.key} title={
                        <div className="min-w-0 py-0.5">
                            <p className="text-sm font-bold">{menu.title}</p>
                            <p className="mt-0.5 hidden truncate text-xs text-default-400 sm:block">{menu.description}</p>
                        </div>
                    } className="flex-1">
                        <div className="w-full overflow-y-auto sm:max-h-[calc(100vh-105px)] scrollbar-none">
                            {menu.component}
                        </div>
                    </Tab>
                ))}
            </Tabs>
        </div>
    )
}
