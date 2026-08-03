import { Metadata } from "next";

export const metadata: Metadata = {
    title: '큐브 관리 · 로츠고 가이드',
    description: '로츠고 숙제 페이지에서 캐릭터별 큐브 입장권과 전체 예상 보석 보상을 관리하는 방법을 안내합니다.',
};

export default function CubeGuide() {
    return (
        <div className="w-full [&_p]:text-base [&_h1]:text-2xl">
            <h1 className="font-bold mb-3">큐브 관리</h1>
            <p>
                큐브 관리에서는 캐릭터별로 보유한 큐브 입장권을 기록하고, 모든 캐릭터의 큐브를 합산해 예상 보석 보상을 확인할 수 있습니다.
                캐릭터 카드에서 개수를 관리한 뒤 전체 큐브 현황의 보상 탭을 확인하면 큐브를 모두 사용했을 때 얻을 수 있는 보석 수량을 미리 계산할 수 있습니다.
            </p>

            <h2 className="mt-10 mb-4 text-xl font-bold">캐릭터별 큐브 설정</h2>
            <p>
                각 캐릭터 카드의 <strong>큐브 - 총합</strong> 영역을 펼치면 해당 캐릭터가 보유한 큐브를 종류별로 관리할 수 있습니다.
                캐릭터 레벨에 맞는 큐브 목록이 표시되며, 큐브별 보유 수량을 확인하고 버튼으로 수량을 조정합니다.
            </p>
            <figure className="mt-6 overflow-hidden rounded-2xl border border-default-200 bg-default-50 p-2 dark:border-white/10 dark:bg-white/[0.03]">
                <img src="/about/checklist-cube-character.png" alt="캐릭터별 큐브 개수 설정 영역" className="mx-auto h-auto max-h-[720px] rounded-xl object-contain" />
                <figcaption className="px-2 pb-1 pt-2 text-sm text-default-500">캐릭터 카드에서 큐브 종류별 보유 개수를 조정하는 영역</figcaption>
            </figure>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-base">
                <li>큐브 이름과 현재 보유 수량을 확인합니다.</li>
                <li><strong>+</strong> 버튼으로 획득한 큐브를 추가하고, <strong>-</strong> 버튼으로 잘못 입력한 수량을 줄입니다.</li>
                <li>상단의 큐브 증감량을 사용하면 버튼을 누를 때 변경할 수량을 정할 수 있습니다.</li>
                <li><strong>개수</strong> 탭에서는 입장권 수량을, <strong>보상</strong> 탭에서는 해당 캐릭터의 예상 보석을 확인합니다.</li>
            </ul>

            <h2 className="mt-10 mb-4 text-xl font-bold">큐브 전체 현황 열기</h2>
            <p>
                숙제 조회 설정의 <strong>큐브 현황</strong> 버튼을 누르면 모든 캐릭터의 큐브를 한 화면에서 확인할 수 있습니다.
                전체 현황에는 <strong>개수</strong>와 <strong>보상</strong> 두 탭이 있으며, 캐릭터별 값과 하단의 전체 합계를 비교할 수 있습니다.
            </p>

            <h2 className="mt-10 mb-4 text-xl font-bold">전체 큐브 개수 확인</h2>
            <p>
                개수 탭은 행에 캐릭터, 열에 큐브 종류를 표시합니다. 특정 캐릭터가 어떤 큐브를 몇 장 보유했는지 확인하고, 표의 <strong>전체</strong> 행에서 모든 캐릭터의 큐브 종류별 합계를 확인할 수 있습니다.
            </p>
            <figure className="mt-6 overflow-hidden rounded-2xl border border-default-200 bg-default-50 p-2 dark:border-white/10 dark:bg-white/[0.03]">
                <img src="/about/checklist-cube-count.png" alt="전체 캐릭터의 큐브 보유 개수 현황" className="h-auto w-full rounded-xl object-contain" />
                <figcaption className="px-2 pb-1 pt-2 text-sm text-default-500">개수 탭에서 캐릭터별 큐브 보유량과 전체 합계 확인</figcaption>
            </figure>

            <h2 className="mt-10 mb-4 text-xl font-bold">전체 예상 보상 계산</h2>
            <p>
                보상 탭에서는 보석 티어를 선택해 현재 보유한 큐브를 모두 사용했을 때 예상되는 보석 수량을 계산합니다.
                캐릭터별 행에서는 각 캐릭터의 예상 보상을, 표 하단의 <strong>전체</strong> 행에서는 모든 캐릭터의 큐브를 전부 소모했을 때 받을 수 있는 최종 합계를 보여줍니다.
            </p>
            <figure className="mt-6 overflow-hidden rounded-2xl border border-default-200 bg-default-50 p-2 dark:border-white/10 dark:bg-white/[0.03]">
                <img src="/about/checklist-cube-reward.png" alt="모든 캐릭터의 큐브를 사용했을 때 예상되는 보석 보상 현황" className="h-auto w-full rounded-xl object-contain" />
                <figcaption className="px-2 pb-1 pt-2 text-sm text-default-500">보상 탭에서 확인하는 큐브 최종 예상 보석</figcaption>
            </figure>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-base">
                <li>상단의 보석 티어를 선택해 원하는 보석 단계의 결과를 확인합니다.</li>
                <li>각 열은 보석 레벨별 예상 개수이며, 파란색으로 표시된 값은 보유 큐브를 기준으로 계산된 보상이 있는 경우입니다.</li>
                <li>초록색으로 표시되는 전체 행은 모든 캐릭터의 예상 보상을 합산한 최종 결과입니다.</li>
                <li>큐브 수량을 변경하면 개수와 보상 계산 결과도 함께 갱신되므로, 실제 보유량을 먼저 정확하게 입력하세요.</li>
            </ul>

            <section className="mt-8 rounded-2xl border border-warning-200 bg-warning-50/70 p-5 dark:border-warning-500/20 dark:bg-warning-500/10">
                <h2 className="text-xl font-bold">주의사항</h2>
                <ul className="mt-3 list-disc space-y-2 pl-5 text-base">
                    <li>큐브 수량은 게임 내 보유 입장권을 직접 기록하는 값이며, 실제 큐브 보유량을 자동으로 불러오지는 않습니다.</li>
                    <li>큐브를 사용했거나 획득했다면 캐릭터별 설정 영역의 수량을 바로 수정해야 전체 현황과 예상 보상이 정확하게 유지됩니다.</li>
                    <li>예상 보상은 입력된 큐브 수량과 선택한 보석 티어를 기준으로 계산되므로 실제 결과와 차이가 날 수 있습니다.</li>
                </ul>
            </section>
        </div>
    );
}
