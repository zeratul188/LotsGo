import { Metadata } from "next";

export const metadata: Metadata = {
    title: '조회 및 필터 · 로츠고 가이드',
    description: '로츠고 숙제 화면에서 계정, 서버, 콘텐츠별로 캐릭터를 조회하고 표시 조건을 설정하는 방법을 안내합니다.',
};

export default function ChecklistFilterGuide() {
    return (
        <div className="w-full [&_p]:text-base [&_h1]:text-2xl">
            <h1 className="font-bold mb-3">조회 및 필터</h1>
            <p>
                숙제 캐릭터가 많아지면 모든 캐릭터를 한 번에 확인하기보다 계정, 서버, 콘텐츠 조건을 조합해 필요한 대상만 보는 것이 편리합니다.
                숙제 화면의 검색 필터는 목록을 정리해서 보여주는 기능이며, 캐릭터나 콘텐츠를 삭제하지 않습니다.
            </p>

            <figure className="mt-6 overflow-hidden rounded-2xl border border-default-200 bg-default-50 p-2 dark:border-white/10 dark:bg-white/[0.03]">
                <img src="/about/checklist-filter.png" alt="로츠고 숙제 조회 설정과 검색 필터 화면" className="h-auto w-full rounded-xl object-contain" />
                <figcaption className="px-2 pb-1 pt-2 text-sm text-default-500">숙제 조회 설정과 검색 필터 영역</figcaption>
            </figure>

            <h2 className="mt-10 mb-4 text-xl font-bold">기본 필터 사용 순서</h2>
            <ol className="list-decimal space-y-2 pl-5 text-base">
                <li>숙제 화면의 <strong>숙제 조회 설정</strong> 영역에서 검색 필터를 확인합니다.</li>
                <li><strong>계정</strong>을 선택하면 해당 계정으로 지정된 캐릭터만 표시합니다.</li>
                <li><strong>서버</strong>를 선택하면 선택한 서버의 캐릭터만 확인할 수 있습니다.</li>
                <li><strong>콘텐츠</strong>를 선택하면 해당 레이드나 콘텐츠가 남아 있는 캐릭터만 좁혀서 볼 수 있습니다.</li>
                <li>필터를 여러 개 적용한 상태에서 필요한 캐릭터와 숙제만 확인합니다.</li>
            </ol>

            <h2 className="mt-10 mb-4 text-xl font-bold">추가 옵션</h2>
            <div className="space-y-3">
                <section className="rounded-xl border border-default-200 bg-content1 p-4 dark:border-white/10">
                    <h3 className="text-lg font-bold">일일 콘텐츠 숨기기</h3>
                    <p className="mt-1">캐릭터 목록에서 일일 콘텐츠를 숨기고 주간 콘텐츠 중심으로 확인합니다. 일일 숙제 자체가 삭제되거나 체크 상태가 변경되는 것은 아닙니다.</p>
                </section>
                <section className="rounded-xl border border-default-200 bg-content1 p-4 dark:border-white/10">
                    <h3 className="text-lg font-bold">주간 숙제를 완료한 캐릭터 숨기기</h3>
                    <p className="mt-1">이번 주 주간 숙제를 모두 완료한 캐릭터를 목록에서 제외해 아직 확인할 대상만 볼 수 있습니다.</p>
                </section>
                <section className="rounded-xl border border-default-200 bg-content1 p-4 dark:border-white/10">
                    <h3 className="text-lg font-bold">골드 지정 캐릭터만 표시하기</h3>
                    <p className="mt-1">주간 골드를 받도록 지정한 캐릭터만 표시합니다. 골드 캐릭터의 진행 상황을 우선 확인할 때 유용합니다.</p>
                </section>
                <section className="rounded-xl border border-default-200 bg-content1 p-4 dark:border-white/10">
                    <h3 className="text-lg font-bold">숙제 완료한 콘텐츠 숨기기</h3>
                    <p className="mt-1">완료한 콘텐츠를 감추고 아직 남은 콘텐츠만 캐릭터 카드에 표시합니다.</p>
                </section>
            </div>

            <h2 className="mt-10 mb-4 text-xl font-bold">상황별 활용 예시</h2>
            <ul className="list-disc space-y-2 pl-5 text-base">
                <li>다계정으로 플레이한다면 계정 필터를 선택해 특정 계정의 숙제만 확인합니다.</li>
                <li>특정 서버 캐릭터만 관리하려면 서버 필터를 적용합니다.</li>
                <li>특정 레이드가 남은 캐릭터를 찾고 싶다면 콘텐츠 필터를 선택합니다.</li>
                <li>오늘 할 일을 빠르게 찾으려면 일일 콘텐츠를 표시하고 완료 콘텐츠 숨기기 옵션을 함께 사용합니다.</li>
                <li>골드 수급 캐릭터부터 확인하려면 골드 지정 캐릭터만 표시하기를 켭니다.</li>
            </ul>

            <section className="mt-8 rounded-2xl border border-warning-200 bg-warning-50/70 p-5 dark:border-warning-500/20 dark:bg-warning-500/10">
                <h2 className="text-xl font-bold">필터 사용 시 주의사항</h2>
                <ul className="mt-3 list-disc space-y-2 pl-5 text-base">
                    <li>필터는 화면에 표시되는 목록만 바꾸며, 숙제 완료 상태나 캐릭터 데이터를 수정하지 않습니다.</li>
                    <li>원하는 캐릭터가 보이지 않으면 계정·서버·콘텐츠 필터와 추가 옵션이 함께 적용되어 있는지 확인하세요.</li>
                    <li>모든 캐릭터를 다시 보려면 선택한 계정·서버·콘텐츠를 해제하고 추가 옵션도 필요한 상태로 되돌립니다.</li>
                    <li>숙제를 실제로 체크하거나 콘텐츠를 수정하려면 필터 결과에서 해당 캐릭터 카드를 확인한 뒤 진행하세요.</li>
                </ul>
            </section>

            <p className="mt-8">
                검색 필터 옆의 콘텐츠 정보, 남은 숙제, 큐브 현황 버튼을 사용하면 필터 결과와 별도로 필요한 현황을 빠르게 확인할 수 있습니다.
                필터는 숙제 목록을 줄여 보는 기능이고, 상세 현황 버튼은 전체 진행 상태를 요약해서 보는 기능이라는 차이를 기억해 두세요.
            </p>
        </div>
    );
}
