import { Metadata } from "next";

export const metadata: Metadata = {
    title: '유물 각인서 시세 · 로츠고 가이드',
    description: '로츠고에서 유물 각인서의 현재 가격과 이전 가격, 변동 폭, 기간별 가격 기록을 확인하는 방법을 안내합니다.',
};

export default function RelicMarketGuide() {
    return (
        <div className="w-full [&_p]:text-base [&_h1]:text-2xl">
            <h1 className="mb-3 font-bold">유물 각인서 시세</h1>
            <p>
                유물 각인서 시세에서는 거래소 기준으로 유물 등급 각인서의 현재 가격과 이전 가격, 가격 변동을 확인할 수 있습니다.
                각인서별 가격을 비교해 판매 시점이나 구매 여부를 판단하고, 기록 보기에서 최근 가격 흐름까지 살펴보세요.
            </p>

            <figure className="mt-6 overflow-hidden rounded-2xl border border-default-200 bg-default-50 p-2 dark:border-white/10 dark:bg-white/[0.03]">
                <img src="/about/relic-market.png" alt="유물 각인서별 현재 가격과 이전 가격, 가격 변동을 보여주는 시세 목록" className="h-auto w-full rounded-xl object-contain" />
                <figcaption className="px-2 pb-1 pt-2 text-sm text-default-500">유물 각인서별 현재 가격과 이전 가격, 가격 변동을 확인하는 시세 목록</figcaption>
            </figure>

            <h2 className="mt-10 mb-4 text-xl font-bold">시세 목록에서 확인하는 정보</h2>
            <div className="space-y-3">
                <section className="rounded-xl border border-default-200 bg-content1 p-4 dark:border-white/10">
                    <h3 className="text-lg font-bold">현재 가격</h3>
                    <p className="mt-1">현재 거래소 기준으로 확인되는 유물 각인서 가격입니다. 목록에서 각인서 이름과 등급을 함께 확인하고, 현재 가격이 높은 항목부터 비교할 수 있습니다.</p>
                </section>
                <section className="rounded-xl border border-default-200 bg-content1 p-4 dark:border-white/10">
                    <h3 className="text-lg font-bold">이전 가격과 가격 변동</h3>
                    <p className="mt-1">이전 가격과 비교해 얼마나 올랐거나 내려갔는지, 변동 금액과 비율을 보여줍니다. 상승은 초록색, 하락은 분홍색으로 구분되어 최근 흐름을 빠르게 파악할 수 있습니다.</p>
                </section>
                <section className="rounded-xl border border-default-200 bg-content1 p-4 dark:border-white/10">
                    <h3 className="text-lg font-bold">전체 요약</h3>
                    <p className="mt-1">상단 요약 영역에서는 현재 가장 높은 가격의 각인서와 가격이 상승·하락한 각인서 개수를 확인합니다. 전체 시장의 변동 분위기를 살펴볼 때 활용하세요.</p>
                </section>
            </div>

            <h2 className="mt-10 mb-4 text-xl font-bold">기록 보기</h2>
            <p>
                특정 각인서의 오른쪽에 있는 <strong>기록 보기</strong>를 누르면 해당 각인서의 날짜별 가격 변동 그래프가 열립니다.
                그래프의 날짜와 가격 축을 따라 시세가 언제 상승하거나 하락했는지 확인하고, 하단의 기간 최고·최저 가격으로 변동 범위를 비교할 수 있습니다.
            </p>
            <figure className="mt-6 overflow-hidden rounded-2xl border border-default-200 bg-default-50 p-2 dark:border-white/10 dark:bg-white/[0.03]">
                <img src="/about/relic-market-history.png" alt="특정 유물 각인서의 날짜별 가격 변동 그래프와 기간 최고 최저 가격" className="h-auto w-full rounded-xl object-contain" />
                <figcaption className="px-2 pb-1 pt-2 text-sm text-default-500">기록 보기에서 확인하는 각인서의 날짜별 가격 흐름</figcaption>
            </figure>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-base">
                <li>그래프의 각 날짜 지점에서 해당 시점의 가격을 확인합니다.</li>
                <li>최근 가격이 이전 구간보다 오르고 있는지 내려가고 있는지 흐름을 살펴봅니다.</li>
                <li>하단의 기간 최고 가격과 최저 가격을 비교해 변동 폭을 확인합니다.</li>
                <li>현재 가격만 보지 않고 기록과 함께 비교해 판매·구매 시점을 판단합니다.</li>
            </ul>

            <h2 className="mt-10 mb-4 text-xl font-bold">추천 활용 방법</h2>
            <ol className="list-decimal space-y-2 pl-5 text-base">
                <li>시세 목록에서 관심 있는 유물 각인서를 찾습니다.</li>
                <li>현재 가격과 이전 가격, 변동 금액과 비율을 비교합니다.</li>
                <li>가격 변동이 큰 각인서는 <strong>기록 보기</strong>를 눌러 날짜별 흐름을 확인합니다.</li>
                <li>최근 흐름과 기간 최고·최저 가격을 함께 보고 거래 시점을 결정합니다.</li>
            </ol>

            <section className="mt-8 rounded-2xl border border-warning-200 bg-warning-50/70 p-5 dark:border-warning-500/20 dark:bg-warning-500/10">
                <h2 className="text-xl font-bold">주의사항</h2>
                <ul className="mt-3 list-disc space-y-2 pl-5 text-base">
                    <li>표시되는 가격은 시세 조회 시점의 거래소 정보이므로 실제 거래 시점과 다를 수 있습니다.</li>
                    <li>가격 기록은 일정한 주기로 업데이트되며, 게임이나 거래소 상황에 따라 최신 값 반영에 시간이 걸릴 수 있습니다.</li>
                    <li>가격 변동이 곧바로 앞으로의 가격을 보장하지 않으므로 기간별 기록은 참고 자료로 활용하세요.</li>
                </ul>
            </section>
        </div>
    );
}
