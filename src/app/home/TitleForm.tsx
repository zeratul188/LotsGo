import { useState } from "react";
import { addToast, Button, Input, Image as UIImage } from "@heroui/react";
import Image from "next/image";
import { useRouter } from "next/navigation";

// 검색 아이콘
const SearchIcon = (props: any) => {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      focusable="false"
      height="1em"
      role="presentation"
      viewBox="0 0 24 24"
      width="1em"
      {...props}
    >
      <path
        d="M11.5 21C16.7467 21 21 16.7467 21 11.5C21 6.25329 16.7467 2 11.5 2C6.25329 2 2 6.25329 2 11.5C2 16.7467 6.25329 21 11.5 21Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
      <path
        d="M22 22L20 20"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
};

// 타이틀 컴포넌트
export default function TitleComponent() {
    const [value, setValue] = useState('');
    const router = useRouter();

    return (
        <div className="w-full flex justify-center items-center relative flex-col">
            <div className=" w-full lg1280:w-[1280px] h-[260px] sm:h-[340px] md960:h-[500px] [mask-image:linear-gradient(to_bottom,black,black,black,transparent)] lg1280:[mask-image:linear-gradient(to_right,transparent,black,black,transparent),linear-gradient(to_bottom,black,black,black,transparent)] [mask-composite:intersect]">
                <Image
                    src="/mainbg.jpg"
                    alt="주요 배경 이미지"
                    width={500}
                    height={500}
                    className="w-full lg1280:x-[1920px] h-full object-cover"/>
                <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-white/50 dark:bg-black/75 w-full lg1280:w-[1280px] h-[260px] sm:h-[340px] md960:h-[500px]"></div>
            </div>
            <div className="w-[300px] sm:w-[500px] absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                <LogoComponent/>
                <h1 className="text-lg sm:text-2xl mb-4 sm:mb-8">로스트아크 숙제 관리 및 정보 사이트</h1>
                <Input 
                    size="lg"
                    radius="sm"
                    placeholder="캐릭터명 입력 후 Enter"
                    value={value}
                    maxLength={12}
                    onValueChange={setValue}
                    startContent={<SearchIcon className="mb-0.5 dark:text-white/90 text-slate-400 pointer-events-none flex-shrink-0" />}
                    endContent={(
                        <Button
                            size="sm"
                            variant="faded"
                            onPress={() => {
                                if (value !== '') {
                                    router.push(`/character?nickname=${value}`);
                                } else {
                                    addToast({
                                        title: "비어있음",
                                        description: `입력한 값이 비어있습니다.`,
                                        color: "danger"
                                    });
                                }
                            }}>
                            검색
                        </Button>
                    )}
                    classNames={{
                        input: [
                            "bg-transparent",
                            "text-black/90 dark:text-white/90",
                            "placeholder:text-default-700/50 dark:placeholder:text-white/60",
                        ],
                        innerWrapper: "bg-transparent",
                        inputWrapper: [
                            "shadow-xl",
                            "bg-default-200/70",
                            "dark:bg-default/60",
                            "backdrop-blur-xl",
                            "backdrop-saturate-200",
                            "hover:bg-default-200/70",
                            "dark:hover:bg-default/70",
                            "group-data-[focus=true]:bg-default-200/70",
                            "dark:group-data-[focus=true]:bg-default/60",
                            "!cursor-text",
                        ],
                    }}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            if (value !== '') {
                                router.push(`/character?nickname=${value}`);
                            } else {
                                addToast({
                                    title: "비어있음",
                                    description: `입력한 값이 비어있습니다.`,
                                    color: "danger"
                                });
                            }
                        }
                    }}/>
            </div>
        </div>
    )
}

// 로고 이미지 컴포넌트
export function LogoComponent() {
    return (
        <>
            <UIImage 
                src="title(L).png" 
                width={500} 
                className="dark:hidden"/>
            <UIImage 
                src="title(D).png" 
                width={500} 
                className="hidden dark:block"/>
        </>
    )
}