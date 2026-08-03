import { Metadata } from "next";

export const metadata: Metadata = {
    title: '파티 일정 · 로츠고 가이드',
    description: '로츠고 파티에서 레이드에 참여했을 때 일정에 표시되는 정보와 확인 방법을 안내합니다.',
};

export default function PartyCalendarGuide() {
    return (
        <div className="w-full [&_p]:text-base [&_h1]:text-2xl">
            <h1 className="font-bold mb-3">파티 일정</h1>
            <p>
                파티 일정은 파티에서 레이드 참여 일정이 등록되었을 때 일정 관리 화면에 함께 표시되는 약속입니다.
                개인·길드 일정과 달리 파티 구성원과 레이드 정보를 기준으로 만들어지며, 일정 화면에서 언제 어떤 파티의 레이드에 참여해야 하는지 확인할 수 있습니다.
            </p>

            <figure className="mt-6 overflow-hidden rounded-2xl border border-default-200 bg-default-50 p-2 dark:border-white/10 dark:bg-white/[0.03]">
                <img src="/about/calendar-party-schedule.png" alt="파티 레이드 참여 일정이 일정 관리 화면에 표시된 모습" className="h-auto w-full rounded-xl object-contain" />
                <figcaption className="px-2 pb-1 pt-2 text-sm text-default-500">파티 레이드 참여 일정과 상세 정보</figcaption>
            </figure>

            <h2 className="mt-10 mb-4 text-xl font-bold">파티 일정 확인하기</h2>
            <ol className="list-decimal space-y-2 pl-5 text-base">
                <li>파티에서 참여할 레이드와 관문, 일정을 확인합니다.</li>
                <li>일정 메뉴의 이번 주 일정에서 <strong>파티 일정</strong> 필터가 켜져 있는지 확인합니다.</li>
                <li>요일별 목록에서 파티 일정 항목을 선택합니다.</li>
                <li>상세 카드에서 파티명, 레이드 콘텐츠, 난이도·관문, 날짜와 시간을 확인합니다.</li>
            </ol>

            <h2 className="mt-10 mb-4 text-xl font-bold">상세 화면에서 확인하는 정보</h2>
            <div className="space-y-3">
                <section className="rounded-xl border border-warning-200 bg-warning-50/60 p-4 dark:border-warning-500/20 dark:bg-warning-500/10">
                    <h3 className="text-lg font-bold">파티 일정 표시</h3>
                    <p className="mt-1">일정 카드에 파티 일정 배지가 표시되어 개인·길드 일정과 구분됩니다.</p>
                </section>
                <section className="rounded-xl border border-default-200 bg-content1 p-4 dark:border-white/10">
                    <h3 className="text-lg font-bold">제목과 파티명</h3>
                    <p className="mt-1">제목은 참여할 일정의 이름이고, 파티명은 어떤 파티에서 진행하는지 알려줍니다. 파티명이 다르면 같은 레이드라도 다른 참여 일정일 수 있으므로 함께 확인하세요.</p>
                </section>
                <section className="rounded-xl border border-default-200 bg-content1 p-4 dark:border-white/10">
                    <h3 className="text-lg font-bold">콘텐츠와 관문</h3>
                    <p className="mt-1">레이드 콘텐츠와 난이도, 참여할 관문이 태그로 표시됩니다. 여러 관문이 등록된 경우 각 관문을 모두 확인해 입장 준비를 누락하지 않도록 합니다.</p>
                </section>
                <section className="rounded-xl border border-default-200 bg-content1 p-4 dark:border-white/10">
                    <h3 className="text-lg font-bold">날짜와 시간</h3>
                    <p className="mt-1">레이드에 참여할 약속 시간이 표시됩니다. 주간 일정에서는 남은 시간과 함께 확인할 수 있어 다음 파티 약속을 미리 준비하기 좋습니다.</p>
                </section>
            </div>

            <h2 className="mt-10 mb-4 text-xl font-bold">주간 일정과 전체 달력에서 보기</h2>
            <ul className="list-disc space-y-2 pl-5 text-base">
                <li><strong>이번 주 일정</strong>에서는 선택한 요일의 파티 일정과 남은 시간을 확인합니다.</li>
                <li><strong>전체 달력</strong>에서는 월별 날짜 칸에 표시된 파티 일정을 확인하고 날짜를 선택해 상세 목록을 볼 수 있습니다.</li>
                <li>개인·길드·파티 필터에서 파티 일정만 켜면 다른 일정은 숨기고 파티 약속만 모아볼 수 있습니다.</li>
            </ul>

            <section className="mt-8 rounded-2xl border border-primary-200 bg-primary-50/70 p-5 dark:border-primary-500/20 dark:bg-primary-500/10">
                <h2 className="text-xl font-bold">사용 예시</h2>
                <ol className="mt-3 list-decimal space-y-2 pl-5 text-base">
                    <li>파티에서 레이드 참여 일정과 관문을 확인합니다.</li>
                    <li>일정 메뉴에서 파티 일정 필터를 켜고 약속 날짜와 시간을 확인합니다.</li>
                    <li>일정 상세에서 파티명과 난이도·관문을 다시 확인한 뒤 레이드에 참여합니다.</li>
                    <li>파티 일정이 변경되었다면 파티 관리 화면의 일정 정보를 기준으로 최신 내용을 확인합니다.</li>
                </ol>
            </section>

            <section className="mt-8 rounded-2xl border border-warning-200 bg-warning-50/70 p-5 dark:border-warning-500/20 dark:bg-warning-500/10">
                <h2 className="text-xl font-bold">주의사항</h2>
                <ul className="mt-3 list-disc space-y-2 pl-5 text-base">
                    <li>파티 일정은 파티 레이드 참여 정보에서 만들어지므로 일반 개인·길드 일정 추가 창에서 직접 만드는 일정과 다릅니다.</li>
                    <li>파티 일정의 레이드·관문·참여 시간은 파티에서 설정한 내용을 기준으로 표시됩니다.</li>
                    <li>일정 화면에서 파티 일정이 보이지 않으면 파티 일정 필터가 꺼져 있거나 해당 주차에 일정이 없는지 확인하세요.</li>
                </ul>
            </section>
        </div>
    );
}
