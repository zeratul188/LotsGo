import { Metadata } from "next";

export const metadata: Metadata = {
    title: '회원가입 · 로츠고 가이드',
    description: '로츠고 사이트에 회원 가입을 하는 방법을 알려드립니다.',
};

export default function Signup() {
    return (
        <div className="w-full [&_p]:text-lg [&_li]:text-lg [&_h3]:text-xl [&_h1]:text-3xl">
            <h1 className="font-bold mb-2">로츠고 회원가입</h1>
            <p>로츠고의 숙제기능과 일정기능을 이용하기 위해서 로츠고에 회원가입을 해야만 이용이 가능합니다.</p>
            <div className="w-full grid sm:grid-cols-2 gap-2 mt-2 mb-2">
                <img src="/about/signup1.webp" alt="로츠고 로그인 화면" className="w-full h-auto rounded-xl"/>
                <img src="/about/signup2.webp" alt="로츠고 회원가입 화면" className="w-full h-auto rounded-xl"/>
            </div>
            <p>회원가입을 하기 위해서 올바른 값을 입력해야만 합니다.</p>
            <ul className="list-disc pl-4">
                <li><strong>아이디</strong> : 본인이 사용할 아이디를 입력하신 후 "중복 확인"을 통해 중복된 아이디가 없는지 확인합니다.</li>
                <li>
                    <strong>대표 캐릭터 이름</strong> : 로츠고에 등록할 본인의 대표 캐릭터 명을 입력하시면 원정대 정보가 저장됩니다.
                    본인이 플레이하는 원정대를 입력해야 길드 일정, 후원 시 뱃지 부착 등을 문제없이 이용하실 수 있습니다.
                </li>
                <li>
                    <strong>이메일</strong> : 본인이 사용하시는 이메일을 입력하세요. 비밀번호 재설정을 이용하실 때 사용됩니다.
                    올바른 이메일을 입력하지 않으면 비밀번호 재설정하시는데 문제가 생길 수 있습니다.
                    이메일을 입력하시고 "중복 확인"을 통해 중복된 이메일이 없는지 확인합니다.
                </li>
            </ul>
            <h1 className="font-bold mt-10 mb-2">로스트아크 API 키 입력하기</h1>
            <p>로츠고를 이용하실 떄 로스트아크로부터 본인의 API 키를 입력하시면 일부 기능이 활성화되며, 로츠고를 더 원할하게 이용하실 수 있습니다.</p>
            <img src="/about/signup3.webp" alt="로츠고 설정 위치" className="w-full h-auto rounded-xl mt-2 mb-2"/>
            <p>회원가입 하시고 로그인을 하시면 우측 상단의 프로필을 누르면 "설정"으로 이동하실 수 있습니다.</p>
            <img src="/about/signup4.webp" alt="로츠고 설정 페이지" className="w-full h-auto rounded-xl mt-2 mb-2"/>
            <p>설정 페이지로 이동하시고 좌측의 메뉴에서 "로스트아크 API 키"를 눌러 이동하신 후 화면에 나오는 설명대로 API 키를 발급받거나 키가 이미 있다면 해당 키를 입력하신 후 "등록하기" 버튼을 누르면 바로 적용됩니다.</p>
        </div>
    )
}