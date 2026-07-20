import { Image, NavbarItem, Link, NavbarMenuToggle, Tooltip, NavbarMenu, NavbarMenuItem, Button, Divider, addToast } from "@heroui/react";
import {
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
import VegaIcon from "@/Icons/VegaIcon";
import { usePathname, useRouter } from "next/navigation";
import clsx from "clsx";
import "./profileEffects.css";

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
    const isSupporter = useSelector((state: RootState) => state.login.user.isSupporter);
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
                        <Button
                            radius="md"
                            variant="flat"
                            className={clsx(
                                "h-10 border border-default-200/80 bg-default-50/80 px-3 text-sm font-semibold shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:bg-primary-50/70 hover:shadow-md dark:border-white/10 dark:bg-white/[0.04] dark:hover:bg-primary-500/10",
                                isSupporter && "supporter-profile"
                            )}>
                            {isSupporter ? <VegaIcon className="h-4 w-4 shrink-0 text-amber-500 dark:text-amber-300"/> : null}
                            {id}
                        </Button>
                    ) : (
                        <div
                            className={clsx(
                                "group flex min-w-0 max-w-[230px] cursor-pointer items-center gap-2 rounded-xl border border-default-200/80 bg-default-50/80 px-2 py-1.5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:bg-primary-50/70 hover:shadow-md dark:border-white/10 dark:bg-white/[0.04] dark:hover:bg-primary-500/10",
                                isSupporter && "supporter-profile"
                            )}
                            role="button"
                            tabIndex={0}
                            aria-label={isSupporter ? "후원자 프로필 메뉴 열기" : "프로필 메뉴 열기"}>
                            <div className="relative shrink-0">
                                <JobAvatar size="md" job={mainCharacter.job}/>
                                <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-success dark:border-[#171717]"/>
                                {isSupporter ? (
                                    <span className="supporter-profile-badge" title="후원자">
                                        <VegaIcon className="h-3.5 w-3.5"/>
                                    </span>
                                ) : null}
                            </div>
                            <div className="min-w-0 text-left">
                                <p className={clsx(
                                    "truncate text-xs font-semibold leading-tight text-foreground",
                                    isSupporter && "supporter-profile-name"
                                )}>{id}</p>
                                <p className="mt-1 truncate text-[10pt] leading-tight fadedtext">{mainCharacter.nickname} · {mainCharacter.job}</p>
                            </div>
                            <svg aria-hidden="true" className="ml-0.5 h-4 w-4 shrink-0 text-default-400 transition-transform duration-200 group-hover:translate-y-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6"/>
                            </svg>
                        </div>
                    )}
                </DropdownTrigger>
                <DropdownMenu
                    aria-label="프로필 메뉴"
                    variant="flat"
                    onAction={onActionProfile}
                    className="min-w-[240px] p-2"
                    topContent={
                        <div className={clsx(
                            "mx-0 mb-1 rounded-xl border border-primary-100/80 bg-primary-50/60 p-3 dark:border-primary-900/40 dark:bg-primary-500/[0.08]",
                            isSupporter && "border-amber-300/70 bg-amber-50/70 dark:border-amber-500/30 dark:bg-amber-500/[0.08]"
                        )}>
                            <div className="flex items-center justify-between gap-3">
                                <p className="text-xs font-medium text-primary">내 계정</p>
                                {isSupporter ? (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-400/15 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-300">
                                        <VegaIcon className="h-3 w-3"/>
                                        후원자
                                    </span>
                                ) : null}
                            </div>
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
export function ProfileContent() {
    const { resolvedTheme, setTheme } = useTheme();
    const isDark = resolvedTheme === 'dark';

    const toggleTheme = () => {
        const nextTheme = isDark ? 'light' : 'dark';
        const root = document.documentElement;

        setTheme(nextTheme);
        localStorage.setItem('theme', nextTheme);
        root.classList.toggle('dark', nextTheme === 'dark');
    };
    return (
        <>
            <NavbarItem className="hidden sm:flex">
                <ProfileButton/>
            </NavbarItem>
            <NavbarItem className="shrink-0">
                <Tooltip showArrow content={isDark ? '라이트 모드로 전환' : '다크 모드로 전환'}>
                    <Button
                        radius="full"
                        variant="flat"
                        aria-label={isDark ? '라이트 모드로 전환' : '다크 모드로 전환'}
                        onPress={toggleTheme}
                        className="group h-10 min-w-10 gap-1.5 border border-default-200/80 bg-default-50/80 px-2.5 text-default-600 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:bg-primary-50/70 hover:text-primary hover:shadow-md dark:border-white/10 dark:bg-white/[0.04] dark:text-default-300 dark:hover:bg-primary-500/10 sm:min-w-[86px]">
                        <span className="flex h-5 w-5 items-center justify-center transition-transform duration-300 group-hover:rotate-12">
                            {isDark ? <MoonIcon /> : <SunIcon />}
                        </span>
                        <span className="hidden text-xs font-semibold sm:inline">{isDark ? '다크' : '라이트'}</span>
                    </Button>
                </Tooltip>
            </NavbarItem>
        </>
    )
}
