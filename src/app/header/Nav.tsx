import { Navbar, NavbarBrand, NavbarContent } from "@heroui/react";
import { NavBrand, NavContents, NavToggle, ProfileContent } from "./navs";
import { useDispatch } from "react-redux";

export default function Nav() {
    const dispatch = useDispatch();

    return (
        <Navbar isBordered onMenuOpenChange={(isOpen) => {
            dispatch({type: "toggle-menu", isMenuOpen: isOpen});
        }}>
            <NavbarContent className="flex sm:hidden">
                <NavToggle/>
            </NavbarContent>
            <NavbarBrand>
                <NavBrand/>
            </NavbarBrand>
            <NavbarContent className="hidden sm:flex gap-10" justify="center">
                <NavContents/>
            </NavbarContent>
            <NavbarContent className="gap-5" justify="end">
                <ProfileContent/>
            </NavbarContent>
        </Navbar>
    )
}