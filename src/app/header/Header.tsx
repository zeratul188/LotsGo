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
        <Navbar
            maxWidth={isLargeSize ? "full" : "2xl"}
            isBordered
            onMenuOpenChange={setMenuOpen}
            classNames={{
                base: "border-b border-gray-200/80 bg-white/90 backdrop-blur-xl dark:border-white/10 dark:bg-[#171717]/90",
                wrapper: "px-3 sm:px-5"
            }}>
            <NavbarContent className="flex sm:hidden">
                <NavToggle isMenuOpen={isMenuOpen}/>
            </NavbarContent>
            <NavbarContent className="gap-3 sm:gap-5" justify={isMobile ? 'center' : 'start'}>
                <div className="min-w-fit shrink-0">
                    <NavBrand/>
                </div>
                <div className="hidden shrink-0 items-center gap-1 sm:flex">
                    <NavContents/>
                </div>
            </NavbarContent>
            <NavbarContent className="gap-2" justify="end">
                <ProfileContent/>
            </NavbarContent>
            <NavMenu/>
        </Navbar>
    )
}
