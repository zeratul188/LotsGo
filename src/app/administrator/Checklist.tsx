'use client'
import { Tabs, Tab } from "@heroui/react";
import { ReactNode, useState } from "react";
import { LoadingComponent } from "../UtilsCompnents";

type TabMenu = {
    key: string,
    title: string,
    component: ReactNode
}

function BossComponent() {
    const [isLoading, setLoading] = useState(false);

    return (
        <div className="w-full">
            <LoadingComponent/>
        </div>
    )
}

export default function Checklist() {
    const menus: Array<TabMenu> = [
        {
            key: 'boss',
            title: '콘텐츠 관리',
            component: <BossComponent/>
        },
        {
            key: 'gold',
            title: '골드 관리',
            component: null
        }
    ]

    return (
        <div className="w-full">
            <Tabs 
                variant="underlined" 
                color="primary"
                aria-label="Checklist Options" 
                radius="sm">
                {menus.map((menu: TabMenu) => (
                    <Tab key={menu.key} title={menu.title}>
                        {menu.component}
                    </Tab>
                ))}
            </Tabs>
        </div>
    )
}