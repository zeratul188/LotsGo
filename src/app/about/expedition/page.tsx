import { Metadata } from "next";

export const metadata: Metadata = {
    title: '원정대 관리 · 로츠고 가이드',
    description: '로츠고 사이트에서 개인 계정의 원정대 관리를 하는 방법에 대해서 알려드립니다.',
};


export default function Expedition() {
    return (
        <div className="w-full [&_p]:text-lg [&_li]:text-lg [&_h3]:text-xl [&_h1]:text-3xl">
            <h1 className="font-bold mb-2">내 원정대 관리</h1>
            <p>로츠고에 회원가입했을 떄 등록한 원정대 정보를 확인할 수 있습니다.</p>
            <img src="/about/signup3.webp" alt="로츠고 설정 위치" className="w-full h-auto rounded-xl mt-2 mb-2"/>
            <p>내 원정대 정보를 확인하기 위해서 위 이미지처럼 상단바의 프로필을 누르면 설정 페이지로 이동할 수 있습니다.</p>
            <img src="/about/expedition1.webp" alt="로츠고 내 원정대 정보" className="w-full h-auto rounded-xl mt-2 mb-2"/>
            <p>
                내가 가입된 원정대 정보를 확인할 수 있습니다. 
                원정대 정보는 수동으로 갱신해야 하며 상단의 "갱신하기" 버튼을 통해 원정대 정보를 최신화를 할 수 있습니다.
                단, 원정대 정보는 갱신은 가능하지만 특정 캐릭터 삭제, 원정대 변경 등은 불가능합니다.
            </p>
            <h3 className="font-bold mb-2 mt-6">대표 캐릭터 변경하기</h3>
            <p className="mb-3">
                대표 캐릭터를 변경할려면 원정대 정보 표에 있는 대표 캐릭터의 스위치를 누르시면 대표 캐릭터가 변경됩니다.
            </p>
        </div>
    )
}