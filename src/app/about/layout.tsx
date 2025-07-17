'use client'
import MenuIcon from "@/Icons/MenuIcon";
import { SetStateFn } from "@/utiils/utils";
import { Divider, Drawer, DrawerBody, DrawerContent, DrawerHeader, useDisclosure } from "@heroui/react";
import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const useMenus = [
    { label: '회원가입', href: '/about/signup' },
    { label: '비밀번호 재설정', href: '/about/reset' },
]
const featMenus = [
    { label: '숙제', href: '/about/checklist' },
    { label: '일정', href: '/about/calender' },
    { label: '도구', href: '/about/addons' },
]
const memberMenus = [
    { label: '원정대 관리', href: '/about/expedition' },
    { label: '정보 변경 및 탈퇴', href: '/about/editmember' }
]

type NavsProps = {
    isMobile: boolean,
    onClose: () => void,
    setTitle: SetStateFn<string>
}
function Navs({ isMobile, onClose, setTitle }: NavsProps) {
    const pathname = usePathname();
    return (
        <>
            <nav className="flex flex-col gap-2">
                <Link href='/about' className={clsx(
                    "rounded-lg px-2 py-1 hover:bg-[#eeeeee] hover:dark:bg-[#333333]",
                    pathname === "/about" ? 'text-blue-700 dark:text-blue-400' : ''
                )} onClick={() => {
                    setTitle("사이트 소개");
                    if (isMobile) {
                        onClose();
                    }
                }}>사이트 소개</Link>
            </nav>
            <h2 className="text-sm fadedtext mt-6 mb-2 pl-2">로츠고 시작하기</h2>
            <nav className="flex flex-col gap-2">
                {useMenus.map((menu, index) => (
                    <Link key={index} href={menu.href} className={clsx(
                        "rounded-lg px-2 py-1 hover:bg-[#eeeeee] hover:dark:bg-[#333333]",
                        pathname === menu.href ? 'text-blue-700 dark:text-blue-400' : ''
                    )} onClick={() => {
                        setTitle(menu.label);
                        if (isMobile) {
                            onClose();
                        }
                    }}>{menu.label}</Link>
                ))}
            </nav>
            <h2 className="text-sm fadedtext mt-6 mb-2 pl-2">기능 가이드</h2>
            <nav className="flex flex-col gap-2">
                {featMenus.map((menu, index) => (
                    <Link key={index} href={menu.href} className={clsx(
                        "rounded-lg px-2 py-1 hover:bg-[#eeeeee] hover:dark:bg-[#333333]",
                        pathname === menu.href ? 'text-blue-700 dark:text-blue-400' : ''
                    )} onClick={() => {
                        setTitle(menu.label);
                        if (isMobile) {
                            onClose();
                        }
                    }}>{menu.label}</Link>
                ))}
            </nav>
            <h2 className="text-sm fadedtext mt-6 mb-2 pl-2">계정 관리</h2>
            <nav className="flex flex-col gap-2">
                {memberMenus.map((menu, index) => (
                    <Link key={index} href={menu.href} className={clsx(
                        "rounded-lg px-2 py-1 hover:bg-[#eeeeee] hover:dark:bg-[#333333]",
                        pathname === menu.href ? 'text-blue-700 dark:text-blue-400' : ''
                    )} onClick={() => {
                        setTitle(menu.label);
                        if (isMobile) {
                            onClose();
                        }
                    }}>{menu.label}</Link>
                ))}
            </nav>
        </>
    )
}

export default function AboutLayout({ children }: { children: React.ReactNode }) {
    const {isOpen, onOpen, onOpenChange} = useDisclosure();
    const [title, setTitle] = useState('사이트 소개');
    return (
        <div className="min-h-[calc(100vh-65px)] p-5 w-full max-w-[1280px] mx-auto flex flex-col sm:flex-row">
            <aside className="w-64 border-r border-[#dddddd] dark:border-[#444444] p-2 hidden sm:block">
                <Navs isMobile={false} onClose={() => {}} setTitle={setTitle}/>
            </aside>
            <div className="block sm:hidden w-full">
                <div className="w-full flex gap-2 items-center">
                    <div className="cursor-pointer rounded-xl" onClick={onOpen}>
                        <MenuIcon className="w-5 h-5"/>
                    </div>
                    <p>{title}</p>
                </div>
                <Divider className="mt-4"/>
                <Drawer radius="none" placement="left" isOpen={isOpen} size="xs" onOpenChange={onOpenChange}>
                    <DrawerContent>
                        {(onClose) => (
                            <>
                                <DrawerHeader>메뉴 선택</DrawerHeader>
                                <DrawerBody>
                                    <Navs isMobile={true} onClose={onClose} setTitle={setTitle}/>
                                </DrawerBody>
                            </>
                        )}
                    </DrawerContent>
                </Drawer>
            </div>
            <main className="flex-1 px-4 py-2">{children}</main>
        </div>
    )
}