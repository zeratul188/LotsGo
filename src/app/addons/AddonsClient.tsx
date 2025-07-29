'use client'
import { Tab, Tabs } from "@heroui/react";
import { useMobileQuery } from "@/utiils/utils";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const tabs = [
    {
        key: 'calc',
        label: '경매 계산기',
        path: '/addons'
    },
    {
        key: 'relics',
        label: '유물 각인서 시세',
        path: '/addons/relics'
    },
    {
        key: 'bus',
        label: '버스 계산기',
        path: '/addons/bus'
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
                radius="sm"
                variant="solid"
                selectedKey={selected}
                aria-label="addons tabs"
                onSelectionChange={(key: any) => {
                    const index = tabs.findIndex(tab => tab.key === key);
                    if (index >= 0) {
                        router.push(tabs[index].path);
                        setSelected(key);
                    }
                }}>
                {tabs.map((tab) => (
                    <Tab key={tab.key} title={tab.label} className="min-w-[160px] flex-1"/>
                ))}
            </Tabs>
            <main className="mt-4">{children}</main>
        </div>
    )
}