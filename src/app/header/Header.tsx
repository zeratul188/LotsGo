'use client'
import { Navbar, NavbarBrand, NavbarContent } from "@heroui/react";
import { NavBrand, NavContents, NavToggle, ProfileContent, NavMenu } from "./navs";
import { useState } from "react";

export default function Header() {
    const [isMenuOpen, setMenuOpen] = useState<boolean>(false);

    return (
        <Navbar isBordered onMenuOpenChange={setMenuOpen}>
            <NavbarContent className="flex sm:hidden">
                <NavToggle isMenuOpen={isMenuOpen}/>
            </NavbarContent>
            <NavbarBrand className="absolute sm:static left-1/2 sm:left-0 -translate-x-1/2 sm:-translate-x-1">
                <NavBrand/>
            </NavbarBrand>
            <NavbarContent className="hidden sm:flex gap-10" justify="center">
                <NavContents/>
            </NavbarContent>
            <NavbarContent className="gap-5" justify="end">
                <ProfileContent/>
            </NavbarContent>
            <NavMenu/>
        </Navbar>
    )
}