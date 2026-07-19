'use client'
import { Tab, Tabs } from "@heroui/react";
import { useMobileQuery } from "@/utiils/utils";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const tabs = [
    {
        key: 'calc',
        label: '경매 계산기',
        description: '경매 입찰 금액 계산',
        path: '/addons'
    },
    {
        key: 'relics',
        label: '유물 각인서 시세',
        description: '유물 각인서 시세 확인',
        path: '/addons/relics'
    },
    {
        key: 'bus',
        label: '버스 계산기',
        description: '기사와 손님 정산 금액 계산',
        path: '/addons/bus'
    },
    {
        key: 'transcendence',
        label: '초월 시뮬레이터',
        description: '초월 결과와 보상 시뮬레이션',
        path: '/addons/transcendence'
    }
]

export default function AddonsClient({ children }: { children: React.ReactNode }) {
    const isMobile = useMobileQuery();
    const router = useRouter();
    const pathname = usePathname();
    const [selected, setSelected] = useState('calc');

    useEffect(() => {
        const tab = tabs.find(tab => pathname === tab.path);
        if (tab) {
            setSelected(tab.key);
        }
    }, [pathname]);

    return (
        <div className="min-h-[calc(100vh-65px)] p-5 w-full max-w-[1280px] mx-auto">
            <Tabs
                fullWidth={isMobile}
                color="primary"
                radius="lg"
                variant="light"
                selectedKey={selected}
                aria-label="addons tabs"
                classNames={{
                    base: "w-full",
                    tabList: "w-full gap-1 rounded-2xl border border-default-200 bg-white p-2 shadow-sm dark:border-white/10 dark:bg-[#171717]",
                    tab: "h-auto min-h-12 justify-center px-3 py-2 sm:px-4",
                    cursor: "bg-primary/10 shadow-none dark:bg-primary/20",
                    tabContent: "w-full text-center group-data-[selected=true]:text-primary",
                    panel: "w-full min-w-0 px-0 pt-4"
                }}
                onSelectionChange={(key: any) => {
                    const index = tabs.findIndex(tab => tab.key === key);
                    if (index >= 0) {
                        router.push(tabs[index].path);
                        setSelected(key);
                    }
                }}>
                {tabs.map((tab) => (
                    <Tab
                        key={tab.key}
                        title={
                            <div className="min-w-0 py-0.5 text-left">
                                <p className="truncate text-sm font-bold">{tab.label}</p>
                                <p className="mt-0.5 hidden truncate text-xs text-default-400 sm:block">{tab.description}</p>
                            </div>
                        }
                        className="min-w-[160px] flex-1"/>
                ))}
            </Tabs>
            <main className="mt-4">{children}</main>
        </div>
    )
}
