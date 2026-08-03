'use client'

import AddonIcon from "@/Icons/AddonIcon";
import CalendarIcon from "@/Icons/CalendarIcon";
import CharacterIcon from "@/Icons/CharacterIcon";
import GuideBookIcon from "@/Icons/GuidIcon";
import HomeworkIcon from "@/Icons/HomeworkIcon";
import MenuIcon from "@/Icons/MenuIcon";
import RaidIcon from "@/Icons/RaidIcon";
import { ShieldSecurityIcon } from "@/Icons/ShieldSecurityIcon";
import { Divider, Drawer, DrawerBody, DrawerContent, DrawerHeader, useDisclosure } from "@heroui/react";
import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { findGuideMenu, GuideCategory, guideCategories } from "./guideMenus";

function HomeIcon({ className = "" }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="m3 10 9-7 9 7"/>
            <path d="M5 9v11h14V9"/>
            <path d="M9 20v-6h6v6"/>
        </svg>
    );
}

function CategoryIcon({ category }: { category: GuideCategory }) {
    const className = "h-[18px] w-[18px]";
    switch (category.icon) {
        case 'start': return <GuideBookIcon className={className}/>;
        case 'home': return <HomeIcon className={className}/>;
        case 'checklist': return <HomeworkIcon size={18}/>;
        case 'calendar': return <CalendarIcon className={className}/>;
        case 'character': return <CharacterIcon size={18}/>;
        case 'party': return <RaidIcon size={18}/>;
        case 'tools': return <AddonIcon className={className}/>;
        case 'settings': return <ShieldSecurityIcon className={className}/>;
    }
}

function ChevronIcon({ isOpen }: { isOpen: boolean }) {
    return (
        <svg
            className={clsx("h-4 w-4 transition-transform duration-200", isOpen && "rotate-180")}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true">
            <path d="m6 9 6 6 6-6"/>
        </svg>
    );
}

type NavsProps = {
    isMobile: boolean;
    onClose: () => void;
};

function Navs({ isMobile, onClose }: NavsProps) {
    const pathname = usePathname();
    const activeMenu = findGuideMenu(pathname) ?? findGuideMenu('/about');
    const [openCategory, setOpenCategory] = useState(activeMenu?.category.id ?? 'start');

    useEffect(() => {
        if (activeMenu) setOpenCategory(activeMenu.category.id);
    }, [pathname]);

    return (
        <nav aria-label="로츠고 가이드 카테고리" className="space-y-1.5">
            {guideCategories.map((category) => {
                const isOpen = openCategory === category.id;
                const isCurrentCategory = activeMenu?.category.id === category.id;
                const panelId = `guide-category-${category.id}`;

                return (
                    <div
                        key={category.id}
                        className={clsx(
                            "overflow-hidden rounded-xl border transition-colors",
                            isCurrentCategory
                                ? "border-primary-200 bg-primary-50/40 dark:border-primary-500/25 dark:bg-primary-500/[0.06]"
                                : "border-transparent bg-transparent"
                        )}>
                        <button
                            type="button"
                            aria-expanded={isOpen}
                            aria-controls={panelId}
                            className={clsx(
                                "flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors",
                                "hover:bg-default-100 dark:hover:bg-white/[0.06]",
                                isCurrentCategory && "text-primary"
                            )}
                            onClick={() => setOpenCategory(isOpen ? '' : category.id)}>
                            <span className={clsx(
                                "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors",
                                isCurrentCategory
                                    ? "bg-primary text-white shadow-sm shadow-primary/20"
                                    : "bg-default-100 text-default-500 dark:bg-white/[0.06] dark:text-default-400"
                            )}>
                                <CategoryIcon category={category}/>
                            </span>
                            <span className="min-w-0 grow">
                                <span className="block truncate text-sm font-bold">{category.label}</span>
                                <span className="mt-0.5 block truncate text-[11px] font-normal text-default-400">{category.description}</span>
                            </span>
                            <span className="shrink-0 text-default-400">
                                <ChevronIcon isOpen={isOpen}/>
                            </span>
                        </button>

                        {isOpen ? (
                            <div id={panelId} className="px-2 pb-2">
                                <div className="ml-4 space-y-0.5 border-l border-default-200 pl-3 dark:border-white/10">
                                    {category.items.map((menu) => {
                                        const isSelected = pathname === menu.href;
                                        return (
                                            <Link
                                                key={menu.href}
                                                href={menu.href}
                                                aria-current={isSelected ? 'page' : undefined}
                                                className={clsx(
                                                    "group flex min-h-9 items-center gap-2 rounded-lg px-2.5 py-2 text-[13px] transition-colors",
                                                    isSelected
                                                        ? "bg-primary-100/80 font-semibold text-primary-700 dark:bg-primary-500/15 dark:text-primary-300"
                                                        : "text-default-600 hover:bg-default-100 hover:text-foreground dark:text-default-400 dark:hover:bg-white/[0.06]"
                                                )}
                                                onClick={() => {
                                                    if (isMobile) onClose();
                                                }}>
                                                <span className={clsx(
                                                    "h-1.5 w-1.5 shrink-0 rounded-full transition-colors",
                                                    isSelected ? "bg-primary" : "bg-default-300 group-hover:bg-default-500 dark:bg-default-600"
                                                )}/>
                                                <span>{menu.label}</span>
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>
                        ) : null}
                    </div>
                );
            })}
        </nav>
    );
}

export default function AboutLayout({ children }: { children: React.ReactNode }) {
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const pathname = usePathname();
    const activeMenu = findGuideMenu(pathname) ?? findGuideMenu('/about');
    const currentTitle = activeMenu?.item.label ?? '서비스 소개';

    return (
        <div className="mx-auto flex min-h-[calc(100vh-65px)] w-full max-w-[1280px] flex-col p-5 sm:flex-row sm:gap-5">
            <aside className="sticky top-20 hidden h-[calc(100vh-100px)] w-72 shrink-0 sm:block">
                <div className="h-full overflow-y-auto rounded-2xl border border-default-200/80 bg-content1 p-2 shadow-sm scrollbar-hide dark:border-white/10 dark:bg-[#171717]">
                    <div className="px-3 pb-3 pt-2">
                        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary">Lot&apos;s Go Guide</p>
                        <h2 className="mt-1 text-lg font-bold">로츠고 가이드</h2>
                        <p className="mt-1 text-xs text-default-400">원하는 기능을 빠르게 찾아보세요.</p>
                    </div>
                    <Divider className="mb-2"/>
                    <Navs isMobile={false} onClose={() => {}}/>
                </div>
            </aside>

            <div className="block w-full sm:hidden">
                <button
                    type="button"
                    className="flex w-full cursor-pointer items-center gap-3 rounded-xl border border-default-200/80 bg-content1 px-3 py-3 text-left shadow-sm dark:border-white/10 dark:bg-[#171717]"
                    onClick={onOpen}>
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <MenuIcon className="h-5 w-5"/>
                    </span>
                    <span className="min-w-0 grow">
                        <span className="block text-[11px] text-default-400">현재 가이드</span>
                        <span className="block truncate text-sm font-bold text-primary">{currentTitle}</span>
                    </span>
                    <span className="text-xs font-semibold text-default-400">메뉴</span>
                </button>

                <Drawer radius="none" placement="left" isOpen={isOpen} size="xs" onOpenChange={onOpenChange}>
                    <DrawerContent>
                        {(onClose) => (
                            <>
                                <DrawerHeader className="flex flex-col items-start gap-1 border-b border-default-200 px-5 py-4 dark:border-white/10">
                                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary">Lot&apos;s Go Guide</p>
                                    <p className="text-lg font-bold">로츠고 가이드</p>
                                </DrawerHeader>
                                <DrawerBody className="px-3 py-3">
                                    <Navs isMobile onClose={onClose}/>
                                </DrawerBody>
                            </>
                        )}
                    </DrawerContent>
                </Drawer>
            </div>

            <main className="mt-4 min-w-0 flex-1 py-2 sm:mt-0">{children}</main>
        </div>
    );
}
