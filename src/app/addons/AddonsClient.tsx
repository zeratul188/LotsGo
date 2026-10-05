'use client'
import Link from "next/link";
import { usePathname } from "next/navigation";

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
        key: 'gems',
        label: '보석 시세',
        path: '/addons/gems'
    },
    {
        key: 'honing',
        label: '재련 최적화',
        path: '/addons/honing'
    },
    {
        key: 'bus',
        label: '버스 계산기',
        path: '/addons/bus'
    },
    {
        key: 'fine-calculator',
        label: '벌금 계산기',
        path: '/addons/fine-calculator'
    },
    {
        key: 'transcendence',
        label: '초월 시뮬레이터',
        path: '/addons/transcendence'
    },
    {
        key: 'elixir',
        label: '엘릭서 시뮬레이션',
        path: '/addons/elixir'
    }
]

export default function AddonsClient({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    return (
        <div className="min-h-[calc(100vh-65px)] p-5 w-full max-w-[1280px] mx-auto">
            <div className="rounded-2xl border border-default-200 bg-white p-2 shadow-sm dark:border-white/10 dark:bg-[#171717]">
                <nav aria-label="도구 메뉴" className="min-w-0 overflow-x-auto rounded-xl bg-gradient-to-r from-default-100 via-primary-50/80 to-default-100 scrollbar-hide dark:from-white/[0.05] dark:via-primary/10 dark:to-white/[0.05]">
                    <div className="flex w-max min-w-full gap-1 p-1">
                        {tabs.map((tab) => {
                            const isSelected = pathname === tab.path;
                            return (
                                <Link
                                    key={tab.key}
                                    href={tab.path}
                                    aria-current={isSelected ? 'page' : undefined}
                                    className={isSelected
                                        ? "flex h-10 shrink-0 items-center justify-center whitespace-nowrap rounded-lg border border-primary/15 bg-white px-4 text-sm font-bold text-primary shadow-[0_3px_12px_rgba(0,111,238,0.14)] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary dark:border-primary/30 dark:bg-primary/20 dark:shadow-[0_3px_14px_rgba(0,111,238,0.16)]"
                                        : "flex h-10 shrink-0 items-center justify-center whitespace-nowrap rounded-lg border border-transparent px-4 text-sm font-semibold text-default-500 transition-colors hover:bg-white/50 hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary dark:hover:bg-white/[0.06]"}>
                                    {tab.label}
                                </Link>
                            );
                        })}
                    </div>
                </nav>
            </div>
            <main className="mt-4">{children}</main>
        </div>
    )
}
