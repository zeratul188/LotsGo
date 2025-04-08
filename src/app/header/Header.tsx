import { Provider } from "react-redux";
import { getStore } from "./headerStore";
import { useTheme } from "next-themes";

import {Navbar, NavbarBrand, NavbarContent, NavbarItem, Link, Button} from "@heroui/react";

export default function Header() {
    const store = getStore();
    const {theme, setTheme} = useTheme();
    return (
        <Provider store={store}>
            <Navbar isBordered>
                <NavbarBrand>

                </NavbarBrand>
                <NavbarContent className="hidden sm:flex gap-4" justify="center">
                    <NavbarItem>
                    <Link color="foreground" href="#">
                        숙제 관리
                    </Link>
                    </NavbarItem>
                    <NavbarItem isActive>
                    <Link aria-current="page" href="#">
                        파티 찾기
                    </Link>
                    </NavbarItem>
                    <NavbarItem>
                    <Link color="foreground" href="#">
                        추가 기능
                    </Link>
                    </NavbarItem>
                </NavbarContent>
                <NavbarContent justify="end">
                    <NavbarItem className="hidden lg:flex">
                    <Link href="#">Login</Link>
                    </NavbarItem>
                    <NavbarItem>
                    <Button color="primary" variant="flat" onPress={() => {
                        if (theme === 'light') setTheme('dark');
                        else setTheme('light');
                    }}>
                        Sign Up
                    </Button>
                    </NavbarItem>
                </NavbarContent>
            </Navbar>
        </Provider>
    )
}