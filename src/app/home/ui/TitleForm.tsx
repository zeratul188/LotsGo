// 로고 이미지 컴포넌트
export function LogoComponent() {
    return (
        <>
            <img 
                src="title(L).png" 
                className="w-[500px] dark:hidden"/>
            <img 
                src="title(D).png" 
                className="w-[500px] hidden dark:block"/>
        </>
    )
}