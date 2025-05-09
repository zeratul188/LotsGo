import { Image, NavbarItem, Link, NavbarMenuToggle, Tooltip, NavbarMenu, NavbarMenuItem, Button } from "@heroui/react";
import { 
    useSwitch, 
    VisuallyHidden, 
    SwitchProps,
    Dropdown,
    DropdownTrigger,
    DropdownMenu,
    DropdownItem
} from "@heroui/react";
import { useTheme } from "next-themes";
import { MoonIcon, SunIcon } from "@/Icons/themeicons";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";
import { useOnActionProfile } from "./headerFeat";

// 헤더 메뉴뉴
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
        item: "전투정보실",
        link: '#'
    },
    {
        item: "로그인",
        link: '/login'
    }
];

// 메뉴 카테고리 목록 요소 (모바일 전용)
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

// 헤더 로고 요소
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

// 헤더 카테고리 메뉴 요소
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

// 헤더 메뉴 버튼 요소 (모바일 전용)
type NavToggleProps = {
    isMenuOpen: boolean
}
export function NavToggle({ isMenuOpen }: NavToggleProps) {
    return (
        <NavbarMenuToggle
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            className="sm:hidden"
        />
    )
}

// 로그인 버튼 혹은 프로필 버튼 요소
function ProfileButton() {
    const id = useSelector((state: RootState) => state.login.user.id);
    const isAdministrator = useSelector((state: RootState) => state.login.isAdministrator);
    const onActionProfile = useOnActionProfile();

    if (id === '') {
        return <Link color="foreground" href="/login">로그인</Link>
    } else {
        return (
            <Dropdown>
                <DropdownTrigger>
                    <Button variant="light">{isAdministrator ? '관리자' : id}님</Button>
                </DropdownTrigger>
                <DropdownMenu aria-label="logined-profile" onAction={onActionProfile}>
                    {isAdministrator ? (
                        <DropdownItem key="administrator" color="secondary">관리자 페이지 이동</DropdownItem>
                    ) : (
                        <>
                            <DropdownItem key="profile">내 정보 수정</DropdownItem>
                            <DropdownItem key="setting">설정</DropdownItem>
                        </>
                    )}
                    <DropdownItem key="logout" color="danger" className="text-danger">로그아웃</DropdownItem>
                </DropdownMenu>
            </Dropdown>
        )
    }
}

// 헤더의 프로필 관련 요소
export function ProfileContent(props: SwitchProps) {
    const {theme, setTheme} = useTheme();
    const {Component, slots, isSelected, getBaseProps, getInputProps, getWrapperProps } = useSwitch({
        ...props,
        defaultSelected: theme === 'light'
    });
    return (
        <>
            <NavbarItem className="hidden sm:flex">
                <ProfileButton/>
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