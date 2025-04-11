import { useSelector } from "react-redux";
import { headerState } from "./headerStore";
import { Image, NavbarItem, Link, NavbarMenuToggle, Tooltip, NavbarMenu, NavbarMenuItem } from "@heroui/react";
import { useSwitch, VisuallyHidden, SwitchProps } from "@heroui/react";
import { useTheme } from "next-themes";

import { MoonIcon, SunIcon } from "@/Icons/themeicons";

const menuItems: Array<{item: string, link: string}> = [
    {
        item: "숙제 관리",
        link: '/checklist'
    },
    {
        item: "파티 찾기",
        link: '#'
    },
    {
        item: "전투정보실실",
        link: '#'
    },
    {
        item: "로그인",
        link: '/login'
    }
];

export function NavMenu() {
    return (
        <NavbarMenu>
            {menuItems.map((item, index) => (
                <NavbarMenuItem key={`${item.item}-${index}`}>
                    <Link 
                        className="w-full" 
                        href={item.link} 
                        color={index === 3 ? 'primary' : 'foreground'}
                        size="lg">{item.item}</Link>
                </NavbarMenuItem>
            ))}
        </NavbarMenu>
    )
}

export function NavBrand() {
    return (
        <>
            <Image 
                src="title(L).png" 
                width={200} 
                className="dark:hidden cursor-pointer"
                onClick={() => location.href = '/'}/>
            <Image 
                src="title(D).png" 
                width={200} 
                className="hidden dark:block cursor-pointer"
                onClick={() => location.href = '/'}/>
        </>
    )
}

export function NavContents() {
    return (
        <>
            <NavbarItem>
                <Link color="foreground" href="/checklist">
                    숙제 관리
                </Link>
            </NavbarItem>
            <NavbarItem>
                <Link color="foreground" href="#">
                    파티 찾기
                </Link>
            </NavbarItem>
            <NavbarItem>
                <Link color="foreground" href="#">
                    전투정보실
                </Link>
            </NavbarItem>
        </>
    )
}

export function NavToggle() {
    const isMenuOpen = useSelector<headerState, boolean>((state) => state.isMenuOpen);
    return (
        <NavbarMenuToggle
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            className="sm:hidden"
        />
    )
}

export function ProfileContent(props: SwitchProps) {
    const {theme, setTheme} = useTheme();
    const {Component, slots, isSelected, getBaseProps, getInputProps, getWrapperProps } = useSwitch({
        ...props,
        defaultSelected: theme === 'light'
    });
    return (
        <>
            <NavbarItem className="hidden sm:flex">
                <Link color="foreground" href="/login">로그인</Link>
            </NavbarItem>
            <NavbarItem>
                <Tooltip showArrow content={theme === 'light' ? '다크 모드로 전환합니다.' : '라이트 모드로 전환합니다.'}>
                    <Component {...getBaseProps()}>
                        <VisuallyHidden>
                            <input {...getInputProps()}/>
                        </VisuallyHidden>
                        <div
                            {...getWrapperProps()}
                            className={slots.wrapper({
                                class: [
                                "w-8 h-8",
                                "flex items-center justify-center",
                                "rounded-lg bg-default-100 hover:bg-default-200",
                                ],
                            })}
                            onClick={() => {
                                if (isSelected) setTheme('dark');
                                else setTheme('light');
                            }}>
                            {isSelected ? <SunIcon /> : <MoonIcon />}
                        </div>
                    </Component>
                </Tooltip>
            </NavbarItem>
        </>
    )
}