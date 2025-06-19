import { Image, NavbarItem, Link, NavbarMenuToggle, Tooltip, NavbarMenu, NavbarMenuItem, Button, Divider, Avatar } from "@heroui/react";
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
import { useLogout, useOnActionProfile } from "./headerFeat";
import { Character } from "../store/loginSlice";
import { getImgByJob } from "../character/expeditionFeat";
import HomeworkIcon from "@/Icons/HomeworkIcon";
import { SettingIcon } from "../icons/SettingIcon";
import CalIcon from "@/Icons/CalIcon";
import CharacterIcon from "@/Icons/CharacterIcon";
import { useRouter } from "next/navigation";

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
    }
];
// 헤더 메뉴 - 로그인한 상태
const loginedMenuItems: Array<{item: string, link: string}> = [
    {
        item: "내 정보 수정",
        link: '#'
    },
    {
        item: "설정",
        link: '#'
    }
];

// 메뉴 카테고리 목록 요소 (모바일 전용)
export function NavMenu() {
    const id = useSelector((state: RootState) => state.login.user.id);
    const isAdministrator = useSelector((state: RootState) => state.login.isAdministrator);
    const nickname = useSelector((state: RootState) => state.login.user.character);
    const expedition: Character[] = useSelector((state: RootState) => state.login.user.expedition);
    const mainCharacter: Character | undefined = expedition.find(character => character.nickname === nickname);
    const onClickLogout = useLogout();
    const router = useRouter();
    return (
        <NavbarMenu>
            {isAdministrator ? (
                <div className="w-full flex flex-row gap-2 items-center">
                    <Button
                        radius="sm"
                        color="secondary"
                        className="grow"
                        onPress={() => router.push('/administrator')}>
                        관리자 페이지 이동
                    </Button>
                    <Button
                        radius="sm"
                        color="danger"
                        onPress={onClickLogout}>
                        로그아웃
                    </Button>
                </div>
            ) : id !== '' ? mainCharacter ? (
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
            {id !== '' ? (
                <>
                    <Divider className="mt-2 mb-2"/>
                    <NavbarMenuItem 
                        key="setting">
                        <Button
                            fullWidth
                            as={Link}
                            radius="sm"
                            href={'#'} 
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
                    숙제
                </Link>
            </NavbarItem>
            <NavbarItem>
                <Link color="foreground" href="/calendar">
                    일정
                </Link>
            </NavbarItem>
            <NavbarItem>
                <Link color="foreground" href="/character">
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
    const onActionProfile = useOnActionProfile();
    const id = useSelector((state: RootState) => state.login.user.id);
    const isAdministrator = useSelector((state: RootState) => state.login.isAdministrator);
    const nickname = useSelector((state: RootState) => state.login.user.character);
    const expedition: Character[] = useSelector((state: RootState) => state.login.user.expedition);
    const mainCharacter: Character | undefined = expedition.find(character => character.nickname === nickname);
    if (id === '') {
        return <Link color="foreground" href="/login">로그인</Link>
    } else {
        return (
            <Dropdown>
                <DropdownTrigger>
                    {isAdministrator || !mainCharacter ? (
                        <Button variant="light">{isAdministrator ? '관리자' : id}님</Button>
                    ) : (
                        <div className="flex gap-2 items-center cursor-pointer" role="button" tabIndex={0}>
                            <Avatar isBordered size="md" src={getImgByJob(mainCharacter.job)}/>
                            <div className="h-[max-content]">
                                <p className="truncate overflow-hidden whitespace-nowrap leading-none">{id}님</p>
                                <p className="fadedtext truncate overflow-hidden whitespace-nowrap text-[10pt] leading-none mt-1">{mainCharacter.nickname}</p>
                            </div>
                        </div>
                    )}
                </DropdownTrigger>
                <DropdownMenu aria-label="logined-profile" onAction={onActionProfile}>
                    {isAdministrator ? (
                        <DropdownItem key="administrator" color="secondary">관리자 페이지 이동</DropdownItem>
                    ) : (
                        <>
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