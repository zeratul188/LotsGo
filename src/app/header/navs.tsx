import { Image, NavbarItem, Link, NavbarMenuToggle, Tooltip, NavbarMenu, NavbarMenuItem, Button, Divider, addToast } from "@heroui/react";
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
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../store/store";
import { useLogout, useOnActionProfile } from "./headerFeat";
import { Character } from "../store/loginSlice";
import HomeworkIcon from "@/Icons/HomeworkIcon";
import { SettingIcon } from "../icons/SettingIcon";
import CalIcon from "@/Icons/CalIcon";
import CharacterIcon from "@/Icons/CharacterIcon";
import AddonIcon from "@/Icons/AddonIcon";
import RaidIcon from "@/Icons/RaidIcon";
import { useEffect, useState } from "react";
import { isAdministratorByToken } from "../administrator/lib/administratorFeat";
import JobAvatar from "@/Icons/JobAvatar";
import { usePathname, useRouter } from "next/navigation";
import clsx from "clsx";

// 헤더 메뉴
const menuItems = [
    {
        item: "숙제",
        link: '/checklist',
        icon: <HomeworkIcon/>
    },
    {
        item: "일정",
        link: '/calendar',
        icon: <CalIcon/>
    },
    {
        item: "전투정보실",
        link: '/character',
        icon: <CharacterIcon/>
    },
    {
        item: "도구",
        link: '/addons',
        icon: <AddonIcon className="w-6 h-6"/>
    },
    {
        item: "파티",
        link: '/raids',
        icon: <RaidIcon size={24}/>
    }
];

// 메뉴 카테고리 목록 요소 (모바일 전용)
export function NavMenu() {
    const dispatch = useDispatch<AppDispatch>();
    const router = useRouter();
    const pathname = usePathname();
    const nickname = useSelector((state: RootState) => state.login.user.character);
    const expedition: Character[] = useSelector((state: RootState) => state.login.user.expedition);
    const mainCharacter: Character | undefined = expedition.find(character => character.nickname === nickname);
    const [isAdministrator, setAdministrator] = useState(false);
    const isLogined = useSelector((state: RootState) => state.login.isLogined);
    const onClickLogout = useLogout();

    useEffect(() => {
        const run = async () => {
            const isAdmin = await isAdministratorByToken(dispatch, router);
            setAdministrator(isAdmin);
        }
        run();
    }, [isLogined]);

    return (
        <NavbarMenu className="gap-1 border-t border-gray-200/80 pt-4 dark:border-white/10">
            {isLogined ? mainCharacter ? (
                (
                    <div className="mb-2 mt-1 flex w-full items-center gap-3 rounded-xl bg-default-100/70 p-3">
                        <JobAvatar size="md" job={mainCharacter.job}/>
                        <div className="grow">
                            <p className="truncate overflow-hidden whitespace-nowrap">{mainCharacter.nickname}</p>
                            <p className="fadedtext truncate overflow-hidden whitespace-nowrap text-[10pt]">Lv.{mainCharacter.level} · {mainCharacter.job}</p>
                        </div>
                        <Button
                            radius="sm"
                            color="danger"
                            onPress={onClickLogout}>
                            로그아웃
                        </Button>
                    </div>
                )
            ) : (
                <Button
                    fullWidth
                    radius="sm"
                    color="danger"
                    onPress={onClickLogout}>
                    로그아웃
                </Button>
            ) : (
                <Button 
                    fullWidth
                    as={Link}
                    href="/login"
                    radius="sm"
                    color="primary"
                    size="lg"
                    className="mt-4 mb-2">
                    로그인
                </Button>
            )}
            <Divider className="mt-2 mb-2"/>
            {menuItems.map((item, index) => {
                const isActive = pathname === item.link || pathname.startsWith(`${item.link}/`);

                return (
                    <NavbarMenuItem key={`${item.item}-${index}`}>
                        <Button
                            fullWidth
                            as={Link}
                            radius="sm"
                            href={item.link}
                            color={isActive ? "primary" : "default"}
                            variant={isActive ? "flat" : "light"}
                            startContent={item.icon}
                            className={clsx(
                                "h-11 justify-start px-3 text-md font-medium",
                                isActive && "font-semibold"
                            )}>
                            {item.item}
                        </Button>
                    </NavbarMenuItem>
                )
            })}
            {isLogined ? (
                <>
                    <Divider className="mt-2 mb-2"/>
                    {isAdministrator ? (
                        <NavbarMenuItem 
                            key="administrator">
                            <Button
                                fullWidth
                                as={Link}
                                radius="sm"
                                href="/administrator"
                                color={pathname.startsWith('/administrator') ? "primary" : "default"}
                                variant={pathname.startsWith('/administrator') ? "flat" : "light"}
                                startContent={<SettingIcon/>}
                                className="h-11 justify-start px-3 text-md font-medium">
                                관리자 페이지
                            </Button>
                        </NavbarMenuItem>
                    ) : null}
                    <NavbarMenuItem
                        key="setting">
                        <Button
                            fullWidth
                            as={Link}
                            radius="sm"
                            href="/setting"
                            color={pathname.startsWith('/setting') ? "primary" : "default"}
                            variant={pathname.startsWith('/setting') ? "flat" : "light"}
                            startContent={<SettingIcon/>}
                            className="h-11 justify-start px-3 text-md font-medium">
                            설정
                        </Button>
                    </NavbarMenuItem>
                </>
            ) : <></>}
        </NavbarMenu>
    )
}

// 헤더 로고 요소
export function NavBrand() {
    return (
        <>
            <a href="/" className="block sm:hidden">
                <img 
                    src="/icon(L).png" 
                    width={40} 
                    className="block dark:hidden"
                    alt="타이틀 이미지 (라이트 버전)"/>
                <img 
                    src="/icon(D).png" 
                    width={40} 
                    alt="타이틀 이미지 (어두운 버전)"
                    className="hidden dark:block"/>
            </a>
            <a href="/" className="hidden sm:block">
                <img 
                    src="/title(L).png" 
                    width={160}
                    alt="타이틀 이미지 (라이트 버전)"
                    className="dark:hidden"
                    onClick={() => location.href = '/'}/>
                <img 
                    src="/title(D).png" 
                    width={160}
                    alt="타이틀 이미지 (어두운 버전)"
                    className="hidden dark:block"/>
            </a>
        </>
    )
}

// 헤더 카테고리 메뉴 요소
export function NavContents() {
    const pathname = usePathname();

    const navs = [
        { href: "/checklist", label: "숙제" },
        { href: "/calendar", label: "일정" },
        { href: "/character", label: "전투정보실" },
        { href: "/addons", label: "도구" },
        { href: "/raids", label: "파티" },
    ];

    return (
        <>
            {navs.map((nav) => {
                const isActive = pathname === nav.href || pathname.startsWith(`${nav.href}/`);

                return (
                    <NavbarItem key={nav.href}>
                        <Link
                            href={nav.href}
                            color={isActive ? "primary" : "foreground"}
                            className={clsx(
                                "rounded-lg px-3 py-2 text-base font-medium transition-colors duration-200",
                                isActive
                                    ? "bg-primary/10 font-semibold text-primary"
                                    : "text-default-500 hover:bg-default-100 hover:text-foreground"
                            )}>
                            {nav.label}
                        </Link>
                    </NavbarItem>
                )
            })}
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
    const dispatch = useDispatch<AppDispatch>();
    const router = useRouter();
    const onActionProfile = useOnActionProfile();
    const isCheckedToken = useSelector((state: RootState) => state.login.isCheckedToken);
    const isLogined = useSelector((state: RootState) => state.login.isLogined);
    const id = useSelector((state: RootState) => state.login.user.id);
    const nickname = useSelector((state: RootState) => state.login.user.character);
    const expedition: Character[] = useSelector((state: RootState) => state.login.user.expedition);
    const mainCharacter: Character | undefined = expedition.find(character => character.nickname === nickname);
    const [isAdministrator, setAdministrator] = useState(false);

    useEffect(() => {
        const run = async () => {
            const isAdmin = await isAdministratorByToken(dispatch, router);
            setAdministrator(isAdmin);
        }
        run();
    }, [isLogined]);

    if (!isCheckedToken) return null;
    if (!isLogined) {
        return (
            <Button
                as={Link}
                radius="sm"
                color="primary"
                variant="flat"
                className="font-semibold"
                href="/login">
                로그인
            </Button>
        )
    } else {
        return (
            <Dropdown placement="bottom-end">
                <DropdownTrigger>
                    {!mainCharacter ? (
                        <Button radius="sm" variant="flat" className="font-medium">{id}</Button>
                    ) : (
                        <div
                            className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-default-100"
                            role="button"
                            tabIndex={0}>
                            <JobAvatar size="md" job={mainCharacter.job}/>
                            <div className="h-[max-content]">
                                <p className="truncate overflow-hidden whitespace-nowrap leading-none">{id}</p>
                                <p className="fadedtext truncate overflow-hidden whitespace-nowrap text-[10pt] leading-none mt-1">{mainCharacter.nickname}</p>
                            </div>
                        </div>
                    )}
                </DropdownTrigger>
                <DropdownMenu
                    aria-label="프로필 메뉴"
                    variant="flat"
                    onAction={onActionProfile}
                    className="min-w-[220px]"
                    topContent={
                        <div className="mx-1 mb-1 border-b border-gray-200/80 px-2 pb-3 pt-2 dark:border-white/10">
                            <p className="text-xs font-medium text-primary">내 계정</p>
                            <p className="mt-1 truncate text-sm font-semibold">{id}</p>
                            {mainCharacter ? (
                                <p className="mt-1 truncate text-xs fadedtext">{mainCharacter.nickname} · {mainCharacter.job}</p>
                            ) : null}
                        </div>
                    }>
                    <DropdownItem
                        key="setting"
                        startContent={<SettingIcon/>}
                        className="min-h-10 px-3 font-medium">
                        설정
                    </DropdownItem>
                    {isAdministrator ? (
                        <DropdownItem
                            key="administrator"
                            color="secondary"
                            startContent={<SettingIcon/>}
                            className="min-h-10 px-3 font-medium">
                            관리자 페이지
                        </DropdownItem>
                    ) : null}
                    <DropdownItem
                        key="logout"
                        color="danger"
                        className="mt-1 min-h-10 border-t border-gray-200/80 px-3 font-medium text-danger dark:border-white/10">
                        로그아웃
                    </DropdownItem>
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
        defaultSelected: theme !== 'dark'
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
                                "h-9 w-9",
                                "flex items-center justify-center",
                                "rounded-lg bg-default-100 transition-colors hover:bg-default-200",
                                ],
                            })}
                            onClick={() => {
                                const root = document.documentElement;
                                if (isSelected) {
                                    root.classList.add('dark');
                                    setTheme('dark');
                                    localStorage.setItem('theme', 'dark');
                                } else {
                                    setTheme('light');
                                    root.classList.remove('dark');
                                    localStorage.setItem('theme', 'light');
                                }
                            }}>
                            {isSelected ? <SunIcon /> : <MoonIcon />}
                        </div>
                    </Component>
                </Tooltip>
            </NavbarItem>
        </>
    )
}
