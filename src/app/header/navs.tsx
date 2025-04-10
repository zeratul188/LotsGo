import { useSelector } from "react-redux";
import { headerState } from "./headerStore";
import { Image, NavbarItem, Link, NavbarMenuToggle, Tooltip } from "@heroui/react";
import { useSwitch, VisuallyHidden, SwitchProps } from "@heroui/react";
import { useTheme } from "next-themes";

import { MoonIcon, SunIcon } from "@/Icons/themeicons";

export function NavBrand() {
    return (
        <>
            <Image 
                src="title(L).png" 
                width={200} 
                className="dark:hidden"
                onClick={() => location.href = '/'}/>
            <Image 
                src="title(D).png" 
                width={200} 
                className="hidden dark:block"
                onClick={() => location.href = '/'}/>
        </>
    )
}

export function NavContents() {
    return (
        <>
            <NavbarItem>
                <Link color="foreground" href="#">
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
            <NavbarItem className="hidden lg:flex">
                <Link color="foreground" href="#">로그인</Link>
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