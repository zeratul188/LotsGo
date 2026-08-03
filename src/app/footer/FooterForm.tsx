// 로고 이미지 컴포넌트
export function LogoComponent() {
    return (
        <>
            <img
                src="title(L).png" 
                className="w-[190px] cursor-pointer dark:hidden sm:w-[210px]"/>
            <img 
                src="title(D).png" 
                className="hidden w-[190px] cursor-pointer dark:block sm:w-[210px]"/>
        </>
    )
}

// 로고 하단 글
export function SiteInformation() {
    return (
        <div className="mt-4 w-full">
            <p className="text-sm leading-6 text-gray-500 dark:text-gray-400">
                LOTSGO는 로스트아크 유저를 위한 숙제 관리 및 정보 공유 사이트입니다.<br/>
                캐릭터별 주간 콘텐츠 정리, 길드 일정 공유 등 다양한 기능을 제공합니다.
            </p>
            <div className="mt-4 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                <div className="flex min-w-0 flex-col gap-1 text-xs text-gray-400 dark:text-gray-500">
                    <p>© 2025 LOT'S GO All rights reserved.</p>
                    <p>This site is not affiliated with Smilegate RPG or Smilegate Stove.</p>
                </div>
                <div className="flex shrink-0 items-center gap-2.5 text-xs font-semibold text-gray-600 dark:text-gray-300">
                    <a href="/policy" className="transition-colors hover:text-primary">개인정보처리방침</a>
                    <p className="text-gray-300 dark:text-gray-700">|</p>
                    <a href="/terms" className="transition-colors hover:text-primary">이용약관</a>
                </div>
            </div>
        </div>
    )
}
