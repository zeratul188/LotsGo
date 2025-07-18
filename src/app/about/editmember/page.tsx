import Image from "next/image";

export default function EditMember() {
    return (
        <div className="w-full [&_p]:text-lg [&_li]:text-lg [&_h3]:text-xl [&_h1]:text-3xl">
            <h1 className="font-bold mb-2">정보 변경 및 탈퇴</h1>
            <p>비밀번호를 변경하거나 로스트아크를 접거나 로츠고를 이용하지 않게 될 경우 회원을 탈퇴할 수 있습니다.</p>
            <h1 className="font-bold mt-10 mb-2">비밀번호 변경하기</h1>
            <Image src="/about/editmember1.webp" alt="로츠고 비밀번호 변경" width={800} height={0} className="w-full h-auto rounded-xl mt-2 mb-2"/>
            <p>설정 페이지에서 "비밀번호 변경" 메뉴를 선택한 다음 현재 비밀번호와 새로운 비밀번호를 입력하시면 즉시 비밀번호가 변경이 됩니다.</p>
            <h1 className="font-bold mt-10 mb-2">회원 탈퇴하기</h1>
            <Image src="/about/editmember2.webp" alt="로츠고 회원 탈퇴" width={800} height={0} className="w-full h-auto rounded-xl mt-2 mb-2"/>
            <p>설정 페이지에서 "회원탈퇴" 메뉴를 선택한 다음 현재 비밀번호를 입력하신 후 유의사항 확인 체크박스를 체크하시고 "탈퇴하기" 버튼을 누르시면 회원 데이터가 완전히 삭제됩니다.</p>
            <p>한번 탈퇴한 계정은 다시 복구가 불가능합니다. 그리고 탈퇴한 이메일과 아이디로 다시 계정을 생성이 가능합니다.</p>
        </div>
    )
}