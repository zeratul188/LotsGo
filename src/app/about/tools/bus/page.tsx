import { Metadata } from "next";

export const metadata: Metadata = {
    title: '버스 계산기 · 로츠고 가이드',
    description: '로츠고 버스 계산기에서 인원, 기사·손님 수, 미참·독식 버스비를 기준으로 거래 금액과 분배금을 계산하는 방법을 안내합니다.',
};

export default function BusCalculatorGuide() {
    return (
        <div className="w-full [&_p]:text-base [&_h1]:text-2xl">
            <h1 className="mb-3 font-bold">버스 계산기</h1>
            <p>
                버스 계산기는 기사와 손님의 인원, 미참·독식 버스비를 입력해 손님이 지불할 금액과 기사가 받을 금액을 계산하는 도구입니다.
                기사마다 손님 수가 다르거나, 버스비를 거래한 뒤 경매 입찰로 다시 분배해야 하는 상황에서도 복잡한 계산을 빠르게 정리할 수 있습니다.
            </p>

            <figure className="mt-6 overflow-hidden rounded-2xl border border-default-200 bg-default-50 p-2 dark:border-white/10 dark:bg-white/[0.03]">
                <img src="/about/bus-calculator.png" alt="인원 수와 기사 인원, 미참·독식 버스비를 입력하는 버스 계산기 화면" className="h-auto w-full rounded-xl object-contain" />
                <figcaption className="px-2 pb-1 pt-2 text-sm text-default-500">인원과 버스비를 입력해 미참 거래 금액과 독식 입찰 금액을 계산하는 화면</figcaption>
            </figure>

            <h2 className="mt-10 mb-4 text-xl font-bold">계산 시작하기</h2>
            <div className="space-y-3">
                <section className="flex gap-4 rounded-xl border border-default-200 bg-content1 p-4 dark:border-white/10">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-100 text-sm font-bold text-primary-700 dark:bg-primary-500/20 dark:text-primary-300">01</span>
                    <div><h3 className="text-lg font-bold">인원 수 입력</h3><p className="mt-1">전체 참여 인원을 4인·8인·16인 중에서 선택하거나 직접 입력합니다.</p></div>
                </section>
                <section className="flex gap-4 rounded-xl border border-default-200 bg-content1 p-4 dark:border-white/10">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-100 text-sm font-bold text-primary-700 dark:bg-primary-500/20 dark:text-primary-300">02</span>
                    <div><h3 className="text-lg font-bold">기사 인원과 버스비 입력</h3><p className="mt-1">기사 인원 수를 입력하고, 손님이 기사에게 지불하는 미참 가격과 독식 가격을 각각 입력합니다.</p></div>
                </section>
                <section className="flex gap-4 rounded-xl border border-default-200 bg-content1 p-4 dark:border-white/10">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-100 text-sm font-bold text-primary-700 dark:bg-primary-500/20 dark:text-primary-300">03</span>
                    <div><h3 className="text-lg font-bold">계산 방식 확인</h3><p className="mt-1">기사별 손님 수가 같은지에 따라 독식만 입찰 또는 기사 수와 손님 수 비율이 다른 경우의 결과를 확인합니다.</p></div>
                </section>
            </div>

            <h2 className="mt-10 mb-4 text-xl font-bold">독식만 입찰</h2>
            <p>
                모든 기사에게 배정된 손님 수가 같을 때 사용하는 방식입니다. 기사 1명당 손님 1명의 버스비를 받고,
                미참 거래 금액과 독식 입찰 금액을 계산해 기사가 최종적으로 수령할 골드를 확인합니다.
            </p>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-base">
                <li><strong>미참 거래 금액</strong>: 미참 가격에 독식 가격과 미참 가격의 차이를 인원수로 나눈 금액을 더해 계산합니다.</li>
                <li><strong>독식 입찰 금액</strong>: 독식 가격에서 버스비 차액의 1인 분배분을 뺀 금액입니다.</li>
                <li>계산 결과에서 기사 총 수령 골드와 각 거래 금액을 함께 확인할 수 있습니다.</li>
            </ul>

            <h2 className="mt-10 mb-4 text-xl font-bold">기사 수와 손님 수 비율이 다른 경우</h2>
            <p>
                기사마다 담당하는 손님 수가 다를 때 사용하는 방식입니다. 기사들이 손님과 1:1 또는 N:수씩 거래한 뒤,
                공대장이 나머지 손님에게 받은 골드를 입찰로 재분배하는 구조를 기준으로 계산합니다.
            </p>
            <div className="mt-4 space-y-3">
                <section className="rounded-xl border border-default-200 bg-content1 p-4 dark:border-white/10"><h3 className="text-lg font-bold">분배금</h3><p className="mt-1">공대장이 남은 손님에게 받은 금액에서 수수료를 반영한 뒤, 기사별 손님 수와 전체 인원에 맞춰 분배되는 금액입니다.</p></section>
                <section className="rounded-xl border border-default-200 bg-content1 p-4 dark:border-white/10"><h3 className="text-lg font-bold">공대장 입찰 금액</h3><p className="mt-1">계산된 분배금을 기준으로 공대장이 입찰에 사용할 금액을 보여줍니다. 나머지 손님은 기사와 손님의 거래 후 남은 인원을 의미합니다.</p></section>
            </div>

            <h2 className="mt-10 mb-4 text-xl font-bold">입찰 아이템 분배</h2>
            <p>
                버스를 진행한 뒤 유물 각인서처럼 값비싼 경매 아이템을 기사에게 분배해야 할 때 사용하는 계산입니다.
                기사 인원 수와 경매 아이템 가격을 입력하면 수수료를 반영한 분배 금액을 계산하고, 기사가 최종적으로 수령할 골드를 확인할 수 있습니다.
            </p>
            <figure className="mt-6 overflow-hidden rounded-2xl border border-default-200 bg-default-50 p-2 dark:border-white/10 dark:bg-white/[0.03]">
                <img src="/about/bus-item-split.png" alt="기사 인원과 경매 아이템 가격을 입력해 입찰 아이템 분배금을 계산하는 화면" className="h-auto w-full rounded-xl object-contain" />
                <figcaption className="px-2 pb-1 pt-2 text-sm text-default-500">기사에게 경매 아이템을 분배할 금액을 계산하는 화면</figcaption>
            </figure>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-base">
                <li>기사 인원 수를 입력합니다.</li>
                <li>경매 아이템 가격을 입력합니다.</li>
                <li>분배 금액과 기사 총 수령 골드를 확인합니다.</li>
                <li>계산 결과를 기준으로 기사 간 경매 아이템 분배를 정리합니다.</li>
            </ul>

            <section className="mt-8 rounded-2xl border border-warning-200 bg-warning-50/70 p-5 dark:border-warning-500/20 dark:bg-warning-500/10">
                <h2 className="text-xl font-bold">주의사항</h2>
                <ul className="mt-3 list-disc space-y-2 pl-5 text-base">
                    <li>전체 인원, 기사 인원과 버스비를 실제 거래 조건에 맞게 입력해야 정확한 결과를 확인할 수 있습니다.</li>
                    <li>기사마다 담당하는 손님 수가 다르면 반드시 해당 계산 방식을 사용하세요.</li>
                    <li>분배금은 게임 내 거래 방식과 수수료 기준을 반영한 참고값이므로, 참여자와 최종 금액을 함께 확인하세요.</li>
                    <li>경매 아이템 분배 시에는 실제 낙찰가와 기사 인원 수가 입력값과 일치하는지 확인하세요.</li>
                </ul>
            </section>
        </div>
    );
}
