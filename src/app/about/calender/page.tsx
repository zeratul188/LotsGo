import { Metadata } from "next";

export const metadata: Metadata = {
    title: '일정 시작하기 · 로츠고 가이드',
    description: '로츠고에서 개인·길드·파티 일정을 추가하고 주간 일정과 전체 달력으로 관리하는 방법을 안내합니다.',
};

export default function CalendarGuide() {
    return (
        <div className="w-full [&_p]:text-base [&_h1]:text-2xl">
            <h1 className="font-bold mb-3">일정 시작하기</h1>
            <p>
                일정 관리는 로스트아크 레이드 약속이나 길드 활동, 개인적으로 기억할 일을 기록하고 확인하는 기능입니다.
                로그인하면 일정 관리 화면에서 이번 주 일정과 전체 달력을 확인하고, 일정 추가 버튼으로 새로운 일정을 등록할 수 있습니다.
            </p>

            <figure className="mt-6 overflow-hidden rounded-2xl border border-default-200 bg-default-50 p-2 dark:border-white/10 dark:bg-white/[0.03]">
                <img src="/about/calendar-week.png" alt="로츠고 일정 관리 화면과 이번 주 일정" className="h-auto w-full rounded-xl object-contain" />
                <figcaption className="px-2 pb-1 pt-2 text-sm text-default-500">개인·길드·파티 일정과 이번 주 일정 확인</figcaption>
            </figure>

            <h2 className="mt-10 mb-4 text-xl font-bold">일정 관리 화면 열기</h2>
            <ol className="list-decimal space-y-2 pl-5 text-base">
                <li>상단 메뉴에서 <strong>일정</strong>을 선택합니다.</li>
                <li>이번 주 일정 화면에서 요일별 등록 일정을 확인합니다.</li>
                <li>특정 날짜의 일정을 자세히 보려면 전체 달력에서 날짜를 선택합니다.</li>
                <li>로그인하지 않은 상태에서는 일정을 추가할 수 없으므로 먼저 로그인하세요.</li>
            </ol>

            <h2 className="mt-10 mb-4 text-xl font-bold">새 일정 추가하기</h2>
            <p>일정 관리 화면의 <strong>일정 추가</strong> 버튼을 눌러 등록 창을 엽니다. 아래 순서대로 입력한 뒤 일정 추가를 누르면 저장됩니다.</p>
            <figure className="mt-6 overflow-hidden rounded-2xl border border-default-200 bg-default-50 p-2 dark:border-white/10 dark:bg-white/[0.03]">
                <img src="/about/calendar-add-modal.png" alt="일정 추가 모달" className="mx-auto h-auto max-h-[760px] rounded-xl object-contain" />
                <figcaption className="px-2 pb-1 pt-2 text-sm text-default-500">제목·유형·콘텐츠·날짜·메모를 입력하는 일정 추가 모달</figcaption>
            </figure>
            <div className="mt-5 space-y-3">
                <section className="rounded-xl border border-default-200 bg-content1 p-4 dark:border-white/10">
                    <h3 className="text-lg font-bold">1. 제목 입력</h3>
                    <p className="mt-1">달력과 주간 일정에 표시할 이름을 입력합니다. 레이드 약속이라면 콘텐츠명이나 모임 목적을 알아보기 쉽게 작성하세요.</p>
                </section>
                <section className="rounded-xl border border-default-200 bg-content1 p-4 dark:border-white/10">
                    <h3 className="text-lg font-bold">2. 일정 유형 선택</h3>
                    <p className="mt-1"><strong>개인 일정</strong>은 본인만 확인할 수 있고, <strong>길드 일정</strong>은 대표 캐릭터가 가입한 길드원과 공유됩니다. 함께 진행할 약속인지 혼자 관리할 일정인지에 따라 선택하세요.</p>
                </section>
                <section className="rounded-xl border border-default-200 bg-content1 p-4 dark:border-white/10">
                    <h3 className="text-lg font-bold">3. 콘텐츠 선택</h3>
                    <p className="mt-1">레이드나 던전 일정이라면 콘텐츠를 선택해 일정에 연결합니다. 콘텐츠가 없는 약속이나 개인적인 할 일은 <strong>콘텐츠 없이 등록</strong>을 선택하면 콘텐츠 선택 없이 저장할 수 있습니다.</p>
                </section>
                <section className="rounded-xl border border-default-200 bg-content1 p-4 dark:border-white/10">
                    <h3 className="text-lg font-bold">4. 날짜와 시간 설정</h3>
                    <p className="mt-1">날짜 선택 창에서 약속 날짜와 시간을 지정합니다. 주간 일정과 전체 달력은 입력한 시간을 기준으로 일정을 배치하므로 실제 약속 시간을 정확하게 입력하세요.</p>
                </section>
                <section className="rounded-xl border border-default-200 bg-content1 p-4 dark:border-white/10">
                    <h3 className="text-lg font-bold">5. 메모 작성</h3>
                    <p className="mt-1">집결 장소, 모집 인원, 준비물처럼 약속에 필요한 내용을 메모로 남깁니다. 메모는 선택 항목이며 비워 둔 채로 저장할 수도 있습니다.</p>
                </section>
            </div>

            <h2 className="mt-10 mb-4 text-xl font-bold">일정 확인 방법</h2>
            <div className="space-y-3">
                <section className="rounded-xl border border-default-200 bg-content1 p-4 dark:border-white/10">
                    <h3 className="text-lg font-bold">이번 주 일정</h3>
                    <p className="mt-1">이번 주의 일정을 요일별로 모아 보여줍니다. 개인·길드·파티 일정은 색상과 유형으로 구분되며, 상단 필터에서 보고 싶은 일정 유형만 표시할 수 있습니다.</p>
                </section>
                <section className="rounded-xl border border-default-200 bg-content1 p-4 dark:border-white/10">
                    <h3 className="text-lg font-bold">전체 달력</h3>
                    <p className="mt-1">이번 주에 포함되지 않은 일정까지 월 단위로 확인합니다. 날짜를 선택하면 해당 날짜의 일정 목록을 볼 수 있고, 오늘 버튼으로 현재 날짜로 빠르게 돌아갈 수 있습니다.</p>
                    <img src="/about/calendar-month.png" alt="월별 전체 달력과 날짜별 일정" className="mt-4 h-auto w-full rounded-xl border border-default-200 dark:border-white/10" />
                </section>
                <section className="rounded-xl border border-default-200 bg-content1 p-4 dark:border-white/10">
                    <h3 className="text-lg font-bold">일정 상세</h3>
                    <p className="mt-1">일정을 선택하면 제목, 일정 유형, 연결된 콘텐츠, 날짜와 시간, 메모를 확인할 수 있습니다. 파티 일정은 파티 관리에서 등록한 일정으로 표시됩니다.</p>
                </section>
            </div>

            <h2 className="mt-10 mb-4 text-xl font-bold">일정 수정과 삭제</h2>
            <ol className="list-decimal space-y-2 pl-5 text-base">
                <li>주간 일정이나 전체 달력에서 수정할 일정을 선택합니다.</li>
                <li>상세 화면에서 메모를 수정하고 저장할 수 있습니다.</li>
                <li>더 이상 필요하지 않은 개인 일정은 삭제 버튼으로 제거합니다.</li>
                <li>길드 일정을 삭제하면 같은 길드원에게도 해당 일정이 더 이상 표시되지 않으므로 삭제 전에 확인하세요.</li>
            </ol>

            <section className="mt-8 rounded-2xl border border-primary-200 bg-primary-50/70 p-5 dark:border-primary-500/20 dark:bg-primary-500/10">
                <h2 className="text-xl font-bold">처음 사용할 때 추천하는 방법</h2>
                <ol className="mt-3 list-decimal space-y-2 pl-5 text-base">
                    <li>레이드 약속은 콘텐츠와 시간을 함께 입력해 주간 일정에서 바로 확인합니다.</li>
                    <li>길드원과 공유할 약속만 길드 일정으로 등록하고, 개인적인 메모나 알림은 개인 일정으로 남깁니다.</li>
                    <li>일정 필터로 필요한 유형만 켜 두면 주간 화면을 간결하게 볼 수 있습니다.</li>
                    <li>약속이 끝난 뒤 지난 일정과 메모를 정리해 다음 일정과 혼동하지 않도록 관리합니다.</li>
                </ol>
            </section>

            <section className="mt-8 rounded-2xl border border-warning-200 bg-warning-50/70 p-5 dark:border-warning-500/20 dark:bg-warning-500/10">
                <h2 className="text-xl font-bold">주의사항</h2>
                <ul className="mt-3 list-disc space-y-2 pl-5 text-base">
                    <li>개인 일정과 길드 일정은 공유 범위가 다르므로 등록 전에 유형을 확인하세요.</li>
                    <li>콘텐츠를 연결하지 않은 일정은 제목·날짜·메모를 기준으로 관리됩니다.</li>
                    <li>길드 일정은 길드원에게 공유되므로 테스트 일정이나 개인 메모를 길드 일정으로 등록하지 않도록 주의하세요.</li>
                </ul>
            </section>
        </div>
    );
}
