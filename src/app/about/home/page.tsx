import { Metadata } from "next";

export const metadata: Metadata = {
    title: '홈 화면 안내 · 로츠고 가이드',
    description: '로츠고 홈 화면에서 숙제 현황과 일정, 로스트아크 주요 정보를 확인하는 방법을 안내합니다.',
};

export default function HomeGuide() {
    return (
        <div className="w-full [&_p]:text-base [&_h1]:text-2xl">
            <h1 className="font-bold mb-3">홈 화면 안내</h1>
            <p>
                로츠고 홈 화면은 게임을 시작하기 전에 오늘 확인해야 할 정보를 한곳에서 보여주는 공간입니다.
                로그인하면 원정대의 숙제와 일정을 중심으로 확인할 수 있고, 로그인하지 않아도 로스트아크의 일정과 공지, 이벤트 정보를 볼 수 있습니다.
            </p>

            <h2 className="mt-10 mb-4 text-xl font-bold">로그인 후 확인하는 정보</h2>
            <div className="space-y-3">
                <section className="rounded-xl border border-default-200 bg-content1 p-4 dark:border-white/10">
                    <h3 className="text-lg font-bold">주간 숙제 현황</h3>
                    <p className="mt-1">
                        이번 주 골드 획득량과 숙제 진행률을 요약해서 보여줍니다. 골드 상세, 레벨 구간별 캐릭터 수, 완료하지 않은 캐릭터와 레이드도 함께 확인할 수 있습니다.
                    </p>
                    <img src="/about/home-weekly.png" alt="로츠고 주간 숙제 현황 화면" className="mt-4 h-auto w-full rounded-xl border border-default-200 dark:border-white/10" />
                </section>
                <section className="rounded-xl border border-default-200 bg-content1 p-4 dark:border-white/10">
                    <h3 className="text-lg font-bold">이번 주 일정</h3>
                    <p className="mt-1">
                        개인·길드·파티 일정을 요일별로 확인합니다. 일정이 등록되어 있다면 약속 시간과 일정 종류를 홈에서 바로 확인할 수 있으며, 전체 일정 버튼으로 일정 관리 화면으로 이동할 수 있습니다.
                    </p>
                    <img src="/about/home-schedule.png" alt="로츠고 이번 주 일정 화면" className="mt-4 h-auto w-full rounded-xl border border-default-200 dark:border-white/10" />
                </section>
            </div>

            <h2 className="mt-10 mb-4 text-xl font-bold">홈에서 확인할 수 있는 로스트아크 정보</h2>
            <ul className="list-disc space-y-2 pl-5 text-base">
                <li><strong>카오스 게이트·필드보스</strong>의 다음 일정과 남은 시간을 확인할 수 있습니다.</li>
                <li><strong>오늘의 모험섬</strong>에서 출현 예정 시간, 남은 시간, 골드 보상 여부와 주요 보상을 확인할 수 있습니다.</li>
                <li><strong>요일별 모험섬 일정</strong>을 선택해 다른 요일의 출현 섬과 보상도 미리 볼 수 있습니다.</li>
                <li><strong>공지사항</strong>에서 점검, 업데이트, 상점 소식을 확인하고 더보기로 원문을 열 수 있습니다.</li>
                <li><strong>이벤트</strong> 영역에서 현재 진행 중인 이벤트와 기간을 확인할 수 있습니다.</li>
            </ul>
            <figure className="mt-5 overflow-hidden rounded-2xl border border-default-200 bg-default-50 p-2 dark:border-white/10 dark:bg-white/[0.03]">
                <img src="/about/home-info.png" alt="로츠고 홈 화면의 카오스 게이트, 필드보스, 모험섬, 공지사항과 이벤트" className="h-auto w-full rounded-xl object-contain" />
                <figcaption className="px-2 pb-1 pt-2 text-sm text-default-500">홈 화면에서 확인할 수 있는 주요 로스트아크 정보</figcaption>
            </figure>

            <section className="mt-8 rounded-2xl border border-primary-200 bg-primary-50/70 p-5 dark:border-primary-500/20 dark:bg-primary-500/10">
                <h2 className="text-xl font-bold">홈 화면을 활용하는 순서</h2>
                <ol className="mt-3 list-decimal space-y-2 pl-5 text-base">
                    <li>로그인 후 주간 숙제 현황에서 오늘 남은 숙제와 골드 진행 상황을 확인합니다.</li>
                    <li>이번 주 일정에서 고정 파티나 길드 일정의 시간과 내용을 확인합니다.</li>
                    <li>카오스 게이트, 필드보스, 모험섬의 출현 시간을 확인하고 플레이 일정을 정합니다.</li>
                    <li>공지사항과 이벤트에서 점검이나 놓치면 안 되는 기간 한정 소식을 확인합니다.</li>
                </ol>
            </section>

            <p className="mt-8">
                화면에 표시되는 숙제·일정·공지·이벤트 정보는 계정 상태와 데이터 갱신 시점에 따라 달라질 수 있습니다.
                숙제 상세 수정은 숙제 메뉴에서, 일정 추가와 변경은 일정 메뉴에서 진행하세요.
            </p>
        </div>
    );
}
