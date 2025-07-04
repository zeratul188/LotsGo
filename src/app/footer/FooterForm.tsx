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
        <div className="mt-1">
            <p className="fadedtext text-[10pt]">
                LOTSGO는 로스트아크 유저를 위한 숙제 관리 및 정보 공유 사이트입니다.<br/>
                캐릭터별 주간 콘텐츠 정리, 길드 일정 공유 등 다양한 기능을 제공합니다.
            </p>
            <div className="flex flex-col sm:flex-row gap-1">
                <div className="sm:grow flex flex-col sm:flex-row">
                    <p className="fadedtext text-[9pt] mt-1">© 2025 LOT'S GO All rights reserved.</p>
                    <p className="fadedtext text-[9pt] mt-1">This site is not affiliated with Smilegate RPG or Smilegate Stove.</p>
                </div>
                <div className="flex gap-2 mt-1 items-center">
                    <a href="/policy" className="text-sm hover:underline">개인정보처리방침</a>
                    <p className="fadedtext">|</p>
                    <a href="/terms" className="text-sm hover:underline">이용약관</a>
                </div>
            </div>
        </div>
    )
}