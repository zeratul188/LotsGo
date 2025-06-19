'use client'
import { Tabs, Tab, addToast } from "@heroui/react";
import { useRouter } from "next/navigation";
import { ReactNode, useEffect } from "react";
import Checklist from "./Checklist";
import { useMobileQuery } from "@/utiils/utils";
import type { RootState } from "../store/store";
import { useSelector } from "react-redux";

type TabMenu = {
    key: string,
    title: string,
    component: ReactNode
}

export default function Administrator() {
    const isMobile = useMobileQuery();
    const router = useRouter();
    const isAdministrator = useSelector((state: RootState) => state.login.isAdministrator);
    const menus: Array<TabMenu> = [
        {
            key: 'checklist',
            title: '숙제 관리',
            component: <Checklist/>
        },
        {
            key: 'party',
            title: '파티 찾기',
            component: null
        },
    ]

    useEffect(() => {
        if (!isAdministrator) {
            addToast({
                title: "권한 없음",
                description: `관리자 권한이 없습니다.`,
                color: "danger"
            });
            router.push('/');
        }
    }, []);

    return (
        <div className="min-h-[calc(100vh-65px)] p-5 w-full max-w-[1280px] mx-auto">
            <Tabs 
                variant="light" 
                color="primary"
                aria-label="Options" 
                isVertical={!isMobile}
                radius="sm" 
                size="lg"
                className="flex">
                {menus.map((menu: TabMenu) => (
                    <Tab key={menu.key} title={menu.title} className="sm:min-w-[160px] flex-1">
                        <div className="w-full border-l-0 md:border-l border-gray-300 dark:border-gray-600 pl-0 md:pl-4 min-h-full overflow-y-auto max-h-[calc(100vh-105px)] scrollbar-none">
                            {menu.component}
                        </div>
                    </Tab>
                ))}
            </Tabs>
        </div>
    )
}