import { Metadata } from "next";

export const metadata: Metadata = {
    title: '비밀번호 재설정 · 로츠고 가이드',
    description: '로츠고 사이트의 비밀번호를 잊어버렸을 경우 비밀번호 재설정하는 방법을 알려드립니다.',
};


export default function Reset() {
    return (
        <div className="w-full [&_p]:text-lg [&_li]:text-lg [&_h3]:text-xl [&_h1]:text-3xl">
            <h1 className="font-bold mb-2">비밀번호 재설정</h1>
            <p>로츠고 이용 중 비밀번호를 잊어버렸을 경우 비밀번호를 다시 설정하실 수 있습니다.</p>
            <div className="w-full grid sm:grid-cols-2 gap-2 mb-2">
                <img src="/about/reset1.webp" alt="로츠고 로그인 화면" className="w-full h-auto rounded-xl mt-2"/>
                <img src="/about/reset2.webp" alt="로츠고 비밀번호 재설정 팝업" className="w-full h-auto rounded-xl mt-2"/>
            </div>
            <ul className="list-decimal pl-4">
                <li>
                    <p>비밀번호를 다시 설정하기 위해서 아이디와 회원가입 시 등록했던 이메일을 입력하신 후 "전송" 버튼을 통해 비밀번호 재설정 요청을 보내시면 됩니다.</p>
                    <p>아이디와 이메일이 일치하지 않으면 요청이 불가능하므로 등록된 이메일과 아이디를 정확히 입력해주시기 바랍니다.</p>
                </li>
                <li>비밀번호 재설정 요청을 보내면 입력했던 이메일로 비밀번호 재설정 관련 메일이 발송됩니다.</li>
                <li>받으신 메일에서 비밀번호 변경 관련 링크를 누르시면 비밀번호를 변경할 수 있는 화면이 나오게 됩니다.</li>
                <li>비밀번호 변경을 완료하면 다시 변경한 비밀번호로 로그인하시면 정상적으로 로그인이 가능합니다.</li>
            </ul>
        </div>
    )
}