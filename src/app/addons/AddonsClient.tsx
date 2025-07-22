'use client'
import { Tab, Tabs } from "@heroui/react";
import CalcComponent from "./CalcComponent";
import { useMobileQuery } from "@/utiils/utils";
import RelicsComponent from "./RelicsComponent";
import BusComponent from "./BusComponent";

export default function AddonsClient() {
    const isMobile = useMobileQuery();
    const tabs = [
        {
            key: 'calc',
            title: '경매 계산기',
            component: <CalcComponent/>
        },
        {
            key: 'exotics',
            title: '유물 각인서 시세',
            component: <RelicsComponent/>
        },
        {
            key: 'bus',
            title: '버스 계산기',
            component: <BusComponent/>
        }
    ]

    return (
        <div className="min-h-[calc(100vh-65px)] p-5 w-full max-w-[1280px] mx-auto">
            <Tabs
                fullWidth={isMobile}
                color="primary"
                radius="sm"
                variant="solid"
                aria-label="addons tabs">
                {tabs.map((tab) => (
                    <Tab key={tab.key} title={tab.title} className="min-w-[160px] flex-1">
                        {tab.component}
                    </Tab>
                ))}
            </Tabs>
        </div>
    )
}