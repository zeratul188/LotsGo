import { Metadata } from "next";

export const metadata: Metadata = {
    title: '경매 계산기 · 로츠고 가이드',
    description: '로츠고 경매 계산기에서 입찰가와 참여 인원에 따른 분배금, 순익 분기점과 선점 입찰가를 계산하는 방법을 안내합니다.',
};

export default function AuctionCalculatorGuide() {
    return (
        <div className="w-full [&_p]:text-base [&_h1]:text-2xl">
            <h1 className="mb-3 font-bold">경매 계산기</h1>
            <p>
                경매 계산기는 레이드 경매에서 아이템 가격과 참여 인원을 기준으로 적절한 입찰가와 예상 분배금을 계산하는 도구입니다.
                직접 아이템을 이용하는 경우, 순익 분기점, 선점 입찰가와 선점 비율별 금액을 한 번에 비교할 수 있어 경매 중 빠르게 판단할 수 있습니다.
            </p>

            <figure className="mt-6 overflow-hidden rounded-2xl border border-default-200 bg-default-50 p-2 dark:border-white/10 dark:bg-white/[0.03]">
                <img src="/about/auction-calculator.png" alt="경매 아이템 가격과 참여 인원을 입력해 입찰가와 분배금을 계산하는 화면" className="h-auto w-full rounded-xl object-contain" />
                <figcaption className="px-2 pb-1 pt-2 text-sm text-default-500">아이템 가격과 참여 인원에 따른 경매 계산 결과</figcaption>
            </figure>

            <h2 className="mt-10 mb-4 text-xl font-bold">계산 시작하기</h2>
            <div className="space-y-3">
                <section className="flex gap-4 rounded-xl border border-default-200 bg-content1 p-4 dark:border-white/10">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-100 text-sm font-bold text-primary-700 dark:bg-primary-500/20 dark:text-primary-300">01</span>
                    <div>
                        <h3 className="text-lg font-bold">경매 계산기 열기</h3>
                        <p className="mt-1">도구 메뉴에서 <strong>경매 계산기</strong>를 엽니다. 경매 아이템의 가격과 참여 인원을 입력할 수 있는 계산 화면이 표시됩니다.</p>
                    </div>
                </section>
                <section className="flex gap-4 rounded-xl border border-default-200 bg-content1 p-4 dark:border-white/10">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-100 text-sm font-bold text-primary-700 dark:bg-primary-500/20 dark:text-primary-300">02</span>
                    <div>
                        <h3 className="text-lg font-bold">아이템 가격 입력</h3>
                        <p className="mt-1"><strong>경매 아이템 가격</strong>에 경매에 올라온 아이템의 가격을 입력합니다. 가격을 저장하면 다음에 같은 금액을 다시 확인할 때 편리합니다.</p>
                    </div>
                </section>
                <section className="flex gap-4 rounded-xl border border-default-200 bg-content1 p-4 dark:border-white/10">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-100 text-sm font-bold text-primary-700 dark:bg-primary-500/20 dark:text-primary-300">03</span>
                    <div>
                        <h3 className="text-lg font-bold">참여 인원 선택</h3>
                        <p className="mt-1">참여 인원을 4인·8인·16인 중에서 선택하거나 직접 인원 수를 입력합니다. 실제 분배에 참여하는 인원과 맞춰야 정확한 결과를 확인할 수 있습니다.</p>
                    </div>
                </section>
                <section className="flex gap-4 rounded-xl border border-default-200 bg-content1 p-4 dark:border-white/10">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-100 text-sm font-bold text-primary-700 dark:bg-primary-500/20 dark:text-primary-300">04</span>
                    <div>
                        <h3 className="text-lg font-bold">계산 결과 확인 및 복사</h3>
                        <p className="mt-1">입력과 동시에 계산 결과를 확인하고, 필요한 결과 행을 누르면 입찰가가 클립보드에 복사됩니다. 자주 사용하는 가격이라면 <strong>저장</strong>을 눌러 브라우저에 계산 기록을 남깁니다.</p>
                    </div>
                </section>
            </div>

            <h2 className="mt-10 mb-4 text-xl font-bold">계산 결과 읽기</h2>
            <div className="space-y-3">
                <section className="rounded-xl border border-default-200 bg-content1 p-4 dark:border-white/10">
                    <h3 className="text-lg font-bold">직접 이용 시</h3>
                    <p className="mt-1">아이템을 낙찰받아 직접 사용하는 경우를 기준으로 한 값입니다. 경매가와 참여 인원을 기준으로 계산한 입찰 골드, 이익 골드와 인원별 분배금을 확인할 수 있습니다.</p>
                </section>
                <section className="rounded-xl border border-default-200 bg-content1 p-4 dark:border-white/10">
                    <h3 className="text-lg font-bold">순익 분기점</h3>
                    <p className="mt-1">경매 수수료를 반영한 뒤, 아이템을 직접 구매하는 것과 다른 방식의 손익이 같아지는 기준값입니다. 경매가의 95%를 기준으로 참여 인원에 따른 분배 구조를 계산합니다.</p>
                </section>
                <section className="rounded-xl border border-default-200 bg-content1 p-4 dark:border-white/10">
                    <h3 className="text-lg font-bold">선점 입찰가</h3>
                    <p className="mt-1">순익 분기점을 기준으로 계산한 선점 입찰 기준입니다. 선점 25%·50%·75% 결과도 함께 제공되어, 아이템을 우선 확보하면서 어느 정도까지 입찰할지 비교할 수 있습니다.</p>
                </section>
            </div>

            <h2 className="mt-10 mb-4 text-xl font-bold">계산 기준 확인하기</h2>
            <p>
                화면 오른쪽의 계산 기준 영역에서는 각 결과가 어떤 식으로 계산되는지 확인할 수 있습니다.
                직접 이용 시에는 경매가 × (인원수 - 1) × 인원수를 기준으로 하고, 순익 분기점은 여기에 경매 수수료 0.95를 반영합니다.
                선점 입찰가는 순익 분기점을 1.1로 나누며, 선점 비율에 따라 1.025·1.05·1.075를 적용합니다.
            </p>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-base">
                <li>참여 인원이 많아지면 전체 분배 구조와 기준 입찰가가 함께 달라집니다.</li>
                <li>계산 결과의 행을 클릭하면 해당 입찰가가 복사되어 경매 입력에 바로 사용할 수 있습니다.</li>
                <li>저장 기록에서는 이전에 계산한 인원 수와 경매가, 주요 결과를 다시 확인할 수 있습니다.</li>
            </ul>

            <section className="mt-8 rounded-2xl border border-warning-200 bg-warning-50/70 p-5 dark:border-warning-500/20 dark:bg-warning-500/10">
                <h2 className="text-xl font-bold">주의사항</h2>
                <ul className="mt-3 list-disc space-y-2 pl-5 text-base">
                    <li>경매 아이템 가격은 실제 경매 화면의 가격을 정확하게 입력해야 합니다.</li>
                    <li>참여 인원에는 실제 분배에 참여하는 인원을 입력하세요. 인원 수가 달라지면 모든 계산 결과가 달라집니다.</li>
                    <li>계산 결과는 로츠고에 표시된 기준과 수수료를 적용한 참고값이므로, 게임 내 최종 정산 방식과 차이가 있을 수 있습니다.</li>
                    <li>저장 기록은 현재 사용 중인 브라우저에 저장되므로 다른 기기나 브라우저에서는 보이지 않을 수 있습니다.</li>
                </ul>
            </section>
        </div>
    );
}
