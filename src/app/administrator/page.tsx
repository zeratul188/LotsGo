'use client'
import { Tabs, Tab } from "@heroui/react";
import { ReactNode } from "react";
import Checklist from "./Checklist";
import { useMobileQuery } from "@/utiils/utils";

type TabMenu = {
    key: string,
    title: string,
    component: ReactNode
}

export default function Administrator() {
    const isMobile = useMobileQuery();
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
                    <Tab key={menu.key} title={menu.title} className="min-w-[200px] flex-1">
                        <div className="w-full border-l-0 md:border-l border-gray-300 dark:border-gray-600 pl-0 md:pl-4 min-h-full overflow-y-auto max-h-[calc(100vh-105px)] scrollbar-none">
                            {menu.component}
                        </div>
                    </Tab>
                ))}
            </Tabs>
        </div>
    )
}