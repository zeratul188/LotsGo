import { Image, NavbarItem, Link, NavbarMenuToggle, Tooltip, NavbarMenu, NavbarMenuItem, Button, Divider, Avatar, addToast } from "@heroui/react";
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
import { getImgByJob } from "../character/expeditionFeat";
import HomeworkIcon from "@/Icons/HomeworkIcon";
import { SettingIcon } from "../icons/SettingIcon";
import CalIcon from "@/Icons/CalIcon";
import CharacterIcon from "@/Icons/CharacterIcon";
import AddonIcon from "@/Icons/AddonIcon";
import RaidIcon from "@/Icons/RaidIcon";
import { useEffect, useState } from "react";
import { isAdministratorByToken } from "../administrator/administratorFeat";
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
        <NavbarMenu>
            {isLogined ? mainCharacter ? (
                (
                    <div className="w-full flex gap-4 items-center mt-1">
                        <Avatar isBordered size="md" src={getImgByJob(mainCharacter.job)}/>
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
            {menuItems.map((item, index) => (
                <NavbarMenuItem key={`${item.item}-${index}`}>
                    <Button
                        fullWidth
                        as={Link}
                        radius="sm"
                        href={item.link} 
                        variant="light"
                        startContent={item.icon}
                        className="justify-start text-md">
                        {item.item}
                    </Button>
                </NavbarMenuItem>
            ))}
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
                                variant="light"
                                startContent={<SettingIcon/>}
                                className="justify-start text-md">
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
                            variant="light"
                            startContent={<SettingIcon/>}
                            className="justify-start text-md">
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
                    width={180} 
                    alt="타이틀 이미지 (라이트 버전)"
                    className="dark:hidden"
                    onClick={() => location.href = '/'}/>
                <img 
                    src="/title(D).png" 
                    width={180} 
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
                const isActive = pathname === nav.href;

                return (
                    <NavbarItem key={nav.href}>
                        <Link
                            href={nav.href}
                            color="foreground"
                            className={clsx(
                                "relative px-1 py-1 font-medium transition-colors",
                                isActive
                                    ? "text-black dark:text-white font-semibold"
                                    : "text-default-500 hover:text-black hover:dark:text-white"
                            )}>
                            {nav.label}
                            <span
                                className={clsx(
                                    "absolute left-0 -bottom-0 h-[2px] w-full origin-left scale-x-0 bg-black/50 dark:bg-white/50 transition-transform duration-300",
                                    isActive && "scale-x-100"
                                )}
                            />
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
                variant="shadow"
                className="bg-gradient-to-tr from-blue-700 to-pink-500 text-white shadow-lg"
                href="/login">
                로그인
            </Button>
        )
    } else {
        return (
            <Dropdown>
                <DropdownTrigger>
                    {!mainCharacter ? (
                        <Button variant="light">{id}</Button>
                    ) : (
                        <div className="flex gap-2 items-center cursor-pointer" role="button" tabIndex={0}>
                            <Avatar isBordered size="md" src={getImgByJob(mainCharacter.job)}/>
                            <div className="h-[max-content]">
                                <p className="truncate overflow-hidden whitespace-nowrap leading-none">{id}</p>
                                <p className="fadedtext truncate overflow-hidden whitespace-nowrap text-[10pt] leading-none mt-1">{mainCharacter.nickname}</p>
                            </div>
                        </div>
                    )}
                </DropdownTrigger>
                <DropdownMenu aria-label="logined-profile" onAction={onActionProfile}>
                    <DropdownItem key="setting">설정</DropdownItem>
                    {isAdministrator ? <DropdownItem key="administrator" color="secondary">관리자 페이지</DropdownItem> : null}
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
                                "w-8 h-8",
                                "flex items-center justify-center",
                                "rounded-lg bg-default-100 hover:bg-default-200",
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