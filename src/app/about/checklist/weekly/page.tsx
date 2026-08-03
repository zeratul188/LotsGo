import { Metadata } from "next";

export const metadata: Metadata = {
    title: '주간 콘텐츠 · 로츠고 가이드',
    description: '로츠고 숙제 페이지에서 주간 콘텐츠를 확인하고 완료 상태를 관리하는 방법을 안내합니다.',
};

export default function WeeklyChecklistGuide() {
    return (
        <div className="w-full [&_p]:text-base [&_h1]:text-2xl">
            <h1 className="font-bold mb-3">주간 콘텐츠</h1>
            <p>
                주간 콘텐츠는 매주 초기화되는 레이드와 던전, 교환 콘텐츠 등을 캐릭터별로 확인하고 완료 여부를 기록하는 영역입니다.
                숙제 페이지에서 캐릭터 카드의 주간 콘텐츠 목록을 확인하면 이번 주에 남은 콘텐츠를 빠르게 파악할 수 있습니다.
            </p>

            <figure className="mt-6 overflow-hidden rounded-2xl border border-default-200 bg-default-50 p-2 dark:border-white/10 dark:bg-white/[0.03]">
                <img src="/about/checklist-daily.png" alt="칼란디르 캐릭터의 주간 콘텐츠 목록 화면" className="mx-auto h-auto max-h-[720px] w-full rounded-xl object-contain" />
                <figcaption className="px-2 pb-1 pt-2 text-sm text-default-500">칼란디르 캐릭터 카드에서 확인하는 주간 콘텐츠</figcaption>
            </figure>

            <h2 className="mt-10 mb-4 text-xl font-bold">주간 콘텐츠 확인하기</h2>
            <ol className="list-decimal space-y-2 pl-5 text-base">
                <li>숙제 메뉴에서 확인할 캐릭터를 찾습니다. 캐릭터가 많다면 조회 및 필터를 사용해 목록을 줄여 보세요.</li>
                <li>캐릭터 카드의 <strong>주간 콘텐츠</strong> 영역에서 이번 주에 진행할 항목을 확인합니다.</li>
                <li>레이드나 던전의 난이도와 관문을 확인한 뒤, 완료한 콘텐츠의 체크박스를 눌러 진행 상태를 기록합니다.</li>
                <li>아직 체크하지 않은 항목을 확인해 이번 주 플레이 순서를 정합니다.</li>
            </ol>

            <h2 className="mt-10 mb-4 text-xl font-bold">화면에 표시되는 콘텐츠</h2>
            <div className="space-y-3">
                <section className="rounded-xl border border-default-200 bg-content1 p-4 dark:border-white/10">
                    <h3 className="text-lg font-bold">레이드·던전</h3>
                    <p className="mt-1">현재 캐릭터에 등록된 레이드와 던전을 확인할 수 있습니다. 콘텐츠명, 난이도, 관문별 진행 상태를 확인하고 관문을 완료할 때마다 체크하세요.</p>
                </section>
                <section className="rounded-xl border border-default-200 bg-content1 p-4 dark:border-white/10">
                    <h3 className="text-lg font-bold">버스비와 골드 기록</h3>
                    <p className="mt-1">버스를 이용한 콘텐츠는 콘텐츠별 <strong>버스비 설정</strong>을 통해 비용을 기록할 수 있습니다. 주간 콘텐츠를 완료한 뒤 체크하면 숙제 진행 상황과 골드 계산을 함께 관리할 수 있습니다.</p>
                </section>
                <section className="rounded-xl border border-default-200 bg-content1 p-4 dark:border-white/10">
                    <h3 className="text-lg font-bold">기타 주간 콘텐츠</h3>
                    <p className="mt-1"><strong>싱글 코인 교환</strong>처럼 기본 목록에 없는 주간 숙제는 기타 콘텐츠로 직접 추가해 관리할 수 있습니다. 캐릭터별로 필요한 항목을 등록하면 다른 주간 콘텐츠와 함께 체크할 수 있습니다.</p>
                </section>
                <section className="rounded-xl border border-default-200 bg-content1 p-4 dark:border-white/10">
                    <h3 className="text-lg font-bold">고정 주간 콘텐츠</h3>
                    <p className="mt-1"><strong>할의 모래시계</strong>는 1730 이상, <strong>낙원</strong>은 1640 이상 캐릭터에게 표시되는 고정 콘텐츠입니다. 캐릭터 레벨에 따라 목록에 표시되며, 필요하지 않은 경우 주간 콘텐츠 관리의 <strong>추가 콘텐츠</strong> 영역에서 숨길 수 있습니다.</p>
                </section>
            </div>

            <h2 className="mt-10 mb-4 text-xl font-bold">주간 콘텐츠 관리</h2>
            <p>
                캐릭터 카드 하단의 <strong>주간 콘텐츠 관리</strong> 버튼에서 해당 캐릭터가 진행할 콘텐츠를 선택하거나 목록을 편집할 수 있습니다.
                관리 화면의 <strong>추가 콘텐츠</strong> 영역에서 직접 추가한 기타 콘텐츠와 고정 콘텐츠를 표시하거나 숨길 수 있습니다. 필요하지 않은 항목을 숨기면 숙제 목록에는 실제로 진행할 콘텐츠만 남길 수 있습니다.
            </p>
            <figure className="mt-6 overflow-hidden rounded-2xl border border-default-200 bg-default-50 p-2 dark:border-white/10 dark:bg-white/[0.03]">
                <img src="/about/checklist-weekly-manage.png" alt="칼란디르 주간 콘텐츠 관리 화면" className="mx-auto h-auto max-h-[720px] w-full rounded-xl object-contain" />
                <figcaption className="px-2 pb-1 pt-2 text-sm text-default-500">주간 콘텐츠 관리 화면</figcaption>
            </figure>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-base">
                <li><strong>콘텐츠 순서</strong>: 목록 왼쪽의 점 모양 핸들을 드래그한 뒤 순서 저장을 눌러 표시 순서를 변경합니다.</li>
                <li><strong>골드 지정</strong>: 골드 아이콘 버튼으로 골드 획득 대상 콘텐츠를 지정하거나 해제합니다.</li>
                <li><strong>난이도 수정</strong>: 연필 버튼에서 콘텐츠의 난이도와 관문을 수정합니다.</li>
                <li><strong>삭제</strong>: 휴지통 버튼으로 해당 콘텐츠를 캐릭터의 주간 목록에서 제거합니다. 다시 필요하면 콘텐츠 추가 영역에서 등록할 수 있습니다.</li>
            </ul>

            <section className="mt-8 rounded-2xl border border-primary-200 bg-primary-50/70 p-5 dark:border-primary-500/20 dark:bg-primary-500/10">
                <h2 className="text-xl font-bold">추천 사용 순서</h2>
                <ol className="mt-3 list-decimal space-y-2 pl-5 text-base">
                    <li>주 초에 골드 캐릭터의 주간 콘텐츠 목록과 난이도를 확인합니다.</li>
                    <li>완료한 관문과 콘텐츠를 바로 체크해 남은 숙제를 구분합니다.</li>
                    <li>버스를 이용했다면 버스비를 기록하고, 필요하면 골드 계산 결과를 함께 확인합니다.</li>
                    <li>주말에 미완료 항목을 다시 확인해 남은 주간 숙제를 정리합니다.</li>
                </ol>
            </section>

            <section className="mt-8 rounded-2xl border border-warning-200 bg-warning-50/70 p-5 dark:border-warning-500/20 dark:bg-warning-500/10">
                <h2 className="text-xl font-bold">주의사항</h2>
                <ul className="mt-3 list-disc space-y-2 pl-5 text-base">
                    <li>체크박스는 로츠고에 진행 상태를 기록하는 기능이며, 게임 안의 콘텐츠를 자동으로 완료 처리하지 않습니다.</li>
                    <li>주간 초기화 시점은 콘텐츠마다 다를 수 있으므로 게임 내 초기화 일정도 함께 확인하세요.</li>
                    <li>캐릭터의 콘텐츠나 난이도를 변경했다면 주간 콘텐츠 관리에서 등록 목록을 다시 확인하세요.</li>
                </ul>
            </section>
        </div>
    );
}
