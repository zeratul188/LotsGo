'use client'
import { useMobileQuery } from "@/utiils/utils";
import { LogoComponent, SiteInformation } from "./FooterForm";
import { Divider } from "@heroui/react";

export default function Footer() {
    const isMobile = useMobileQuery();
    return (
        <div className="w-full min-h-[160px] bg-[#eeeeee] dark:bg-[#1d1d1d]">
            <div className="w-full max-w-[1280px] p-5 flex gap-5 flex-col sm:flex-row m-auto">
                <div className="grow h-[max-content] sm:h-[120px] flex flex-col">
                    <LogoComponent/>
                    <div className="grow"/>
                    <SiteInformation/>
                </div>
                <div>
                    <Divider orientation={isMobile ? 'horizontal' : 'vertical'} className="w-full sm:w-[1px]"/>
                </div>
                <div className="w-full sm:w-[240px]">right components</div>
            </div>
        </div>
    )
}