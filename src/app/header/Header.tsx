'use client'
import { Navbar, NavbarContent } from "@heroui/react";
import { NavBrand, NavContents, NavToggle, ProfileContent, NavMenu } from "./navs";
import { useState } from "react";
import { useMobileQuery, useBigSizeQuery } from "@/utiils/utils";

export default function Header() {
    const [isMenuOpen, setMenuOpen] = useState<boolean>(false);
    const isMobile = useMobileQuery();
    const isLargeSize = useBigSizeQuery();

    return (
        <Navbar maxWidth={isLargeSize ? "full" : "2xl"} isBordered onMenuOpenChange={setMenuOpen}>
            <NavbarContent className="flex sm:hidden">
                <NavToggle isMenuOpen={isMenuOpen}/>
            </NavbarContent>
            <NavbarContent justify={isMobile ? 'center' : 'start'}>
                <div className="shrink-0 min-w-fit">
                    <NavBrand/>
                </div>
                <div className="hidden sm:flex shrink-0 gap-7 rounded-lg bg-[#cccccc]/25 dark:bg-[#4a4a4a]/25 px-5 py-2">
                    <NavContents/>
                </div>
            </NavbarContent>
            <NavbarContent className="gap-5" justify="end">
                <ProfileContent/>
            </NavbarContent>
            <NavMenu/>
        </Navbar>
    )
}