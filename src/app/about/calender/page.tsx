import { Metadata } from "next";

export const metadata: Metadata = {
    title: '일정 · 로츠고 가이드',
    description: '로츠고 사이트에서 일정 기능을 어떻게 이용하는 방법에 대해서 알려드립니다.',
};

export default function Calender() {
    return (
        <div className="w-full [&_p]:text-lg [&_li]:text-lg [&_h3]:text-xl [&_h1]:text-3xl">
            <h1 className="font-bold mb-2">일정</h1>
            <p>지인 또는 길드원들의 레이드 일정 또는 기타 일정을 기록하고 일정을 관리할 수 있는 기능입니다.</p>
            <img src="/about/calendar1.webp" alt="로츠고 이번주 일정" className="w-full h-auto rounded-xl mt-2 mb-2"/>
            <img src="/about/calendar2.webp" alt="로츠고 전체 달력" className="w-full h-auto rounded-xl mt-2 mb-2"/>
            <p>
                등록한 일정이 위 사진처럼 이번주 일정으로 한 주의 일정을 한눈에 확인이 가능하며,
                이번주 일정에 표시되지 않은 다른 일정은 전체 달력을 통해 일정을 확인할 수 있습니다.
            </p>
            <ul className="list-disc pl-4">
                <li>
                    <span className="text-[#0055b6] dark:text-[#298cfd]">개인 일정 (파란색)</span> : 
                    다른 사람이 확인할 수 없는 나만 볼 수 있는 일정입니다.
                </li>
                <li>
                    <span className="text-[#9800b6] dark:text-[#c129fd]">길드 일정 (보라색)</span> : 
                    내 대표 캐릭터가 가입된 길드원끼리 공유되는 일정입니다. 길드 일정을 추가하면 같은 길드원이 확인할 수 있는 일정입니다.
                </li>
            </ul>
            <h1 className="font-bold mt-10 mb-2">일정 추가하기</h1>
            <div className="w-full grid sm:grid-cols-2 gap-2 mb-2">
                <img src="/about/calendar3.webp" alt="로츠고 일정 추가" className="w-full h-auto rounded-xl mt-2 mb-2"/>
                <img src="/about/calendar4.webp" alt="로츠고 달력 선택" className="w-full h-auto rounded-xl mt-2 mb-2"/>
            </div>
            <ul className="list-decimal pl-4">
                <li>우측 상단의 "일정 추가" 버튼을 누르면 위 첫번째 사진처럼 창이 나오게 됩니다.</li>
                <li><strong>제목</strong> : 일정의 제목을 입력합니다. 달력에 표시되는 이름입니다.</li>
                <li><strong>길드 일정</strong> : 만들고자 하는 일정을 길드일정으로 생성합니다.</li>
                <li><strong>콘텐츠 없음</strong> : 콘텐츠를 입력하지 않을 경우 선택합니다.</li>
                <li><strong>콘텐츠, 난이도</strong> : 일정에 저장할 콘텐츠를 선택합니다.</li>
                <li>
                    <strong>일정 날짜</strong> : 일정의 날짜와 시간을 입력합니다. 
                    우측 달력 아이콘을 누르면 위 두번째 사진처럼 달력이 나오며 달력에서 선택하고 시간대도 설정하시면 됩니다.
                </li>
                <li><strong>메모</strong> : 일정에 대한 메모를 입력합니다. 필수 항목은 아니기 때문에 빈 공간으로 추가하셔도 됩니다.</li>
            </ul>
            <h1 className="font-bold mt-10 mb-2">일정 관리하기</h1>
            <div className="w-full grid sm:grid-cols-[1fr_2fr] gap-2 mb-2">
                <img src="/about/calendar5.webp" alt="로츠고 일정 관리" className="w-full h-auto rounded-xl mt-2 mb-2"/>
                <div>
                    <p>추가된 일정을 클릭하시면 제목, 콘텐츠, 메모를 확인할 수 있습니다.</p>
                    <p className="mb-3">
                        제목, 콘텐츠, 날짜의 내용은 현재 수정이 불가능합니다. 단, 메모는 수정이 가능합니다. 
                        이후 업데이트로 일정의 날짜, 제목 등을 수정할 수 있는 기능을 업데이트할 예정입니다.
                    </p>
                    <p>일정을 삭제할 수 있는 기능도 있습니다. 길드 일정을 지우면 같은 길드원이 보던 해당 일정도 같이 지워집니다.</p>
                </div>
            </div>
        </div>
    )
}