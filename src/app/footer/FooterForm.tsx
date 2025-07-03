import { Image } from "@heroui/react";

// 로고 이미지 컴포넌트
export function LogoComponent() {
    return (
        <>
            <Image
                src="title(L).png" 
                width={220} 
                className="dark:hidden cursor-pointer"/>
            <Image 
                src="title(D).png" 
                width={220} 
                className="hidden dark:block cursor-pointer"/>
        </>
    )
}

// 로고 하단 글
export function SiteInformation() {
    return (
        <div className="mt-3">
            <p className="fadedtext text-[9pt]">© 2025 LOT'S GO All rights reserved.</p>
            <p className="fadedtext text-[9pt]">This site is not affiliated with Smilegate RPG or Smilegate Stove.</p>
            <div className="flex gap-2 mt-2 items-center">
                <a href="/policy" className="text-sm hover:underline">개인정보처리방침</a>
                <p className="fadedtext">|</p>
                <a href="/terms" className="text-sm hover:underline">이용약관</a>
            </div>
        </div>
    )
}