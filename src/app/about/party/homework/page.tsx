import { Metadata } from "next";

export const metadata: Metadata = {
    title: '멤버 숙제·골드 · 로츠고 가이드',
    description: '로츠고 파티에서 멤버별 숙제 진행 상황과 골드, 콘텐츠별 남은 관문을 확인하는 방법을 안내합니다.',
};

export default function PartyHomeworkGuide() {
    return (
        <div className="w-full [&_p]:text-base [&_h1]:text-2xl">
            <h1 className="mb-3 font-bold">멤버 숙제·골드</h1>
            <p>
                멤버 숙제·골드 화면에서는 파티에 참여한 멤버의 원정대 캐릭터별 숙제 진행 상황과 골드 수익을 함께 확인할 수 있습니다.
                파티원 전체의 진행률을 한눈에 보고, 아직 완료하지 않은 콘텐츠와 캐릭터별 예상 골드를 파악할 때 활용하세요.
            </p>

            <h2 className="mt-10 mb-4 text-xl font-bold">멤버별 콘텐츠 진행 상황</h2>
            <p>
                멤버 카드 상단에는 해당 멤버의 숙제 완료 수와 전체 진행률, 남은 숙제 개수가 표시됩니다.
                아래 캐릭터 목록에서는 각 캐릭터가 진행하는 레이드와 관문별 완료 상태를 확인할 수 있으며, 완료된 콘텐츠와 아직 남은 콘텐츠를 구분해 볼 수 있습니다.
            </p>
            <figure className="mt-6 overflow-hidden rounded-2xl border border-default-200 bg-default-50 p-2 dark:border-white/10 dark:bg-white/[0.03]">
                <img src="/about/party-homework-content.png" alt="멤버별 숙제 완료율과 캐릭터별 레이드 관문 진행 상태를 보여주는 화면" className="h-auto w-full rounded-xl object-contain" />
                <figcaption className="px-2 pb-1 pt-2 text-sm text-default-500">멤버별 숙제 완료율과 캐릭터별 콘텐츠 진행 상태</figcaption>
            </figure>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-base">
                <li>상단의 숙제 완료 수와 진행률로 멤버의 전체 숙제 진행 상태를 확인합니다.</li>
                <li>캐릭터별 카드에서 레이드 이름과 관문별 체크 상태를 확인합니다.</li>
                <li>초록색으로 표시된 콘텐츠는 완료된 항목이며, 다른 색상으로 표시된 항목은 남은 진행이 있는 콘텐츠입니다.</li>
                <li>멤버의 캐릭터 레벨과 클래스도 함께 표시되므로 어떤 캐릭터로 남은 숙제를 진행해야 하는지 파악할 수 있습니다.</li>
            </ul>

            <h2 className="mt-10 mb-4 text-xl font-bold">멤버별 골드 확인</h2>
            <p>
                골드 화면에서는 캐릭터별로 거래 가능 골드, 귀속 골드, 부수입을 나누어 확인합니다.
                오른쪽의 진행률은 해당 캐릭터가 획득 가능한 골드 중 얼마를 기록했는지 보여주므로, 파티 전체의 골드 현황과 캐릭터별 수익 구성을 비교할 수 있습니다.
            </p>
            <figure className="mt-6 overflow-hidden rounded-2xl border border-default-200 bg-default-50 p-2 dark:border-white/10 dark:bg-white/[0.03]">
                <img src="/about/party-homework-gold.png" alt="멤버 캐릭터별 거래 가능 골드와 귀속 골드, 부수입을 보여주는 화면" className="h-auto w-full rounded-xl object-contain" />
                <figcaption className="px-2 pb-1 pt-2 text-sm text-default-500">캐릭터별 거래 가능 골드·귀속 골드·부수입과 골드 진행률</figcaption>
            </figure>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-base">
                <li><strong>거래 가능 골드</strong>: 주간 콘텐츠를 완료해 획득할 수 있는 거래 가능 골드입니다.</li>
                <li><strong>귀속 골드</strong>: 콘텐츠에서 얻는 귀속 골드로, 거래 가능 골드와 구분해 표시됩니다.</li>
                <li><strong>부수입</strong>: 편린, 판매 아이템, 경매 분배금처럼 직접 기록한 추가 수입입니다.</li>
                <li>골드 진행률을 확인해 아직 획득하지 않은 수익이 남아 있는 캐릭터를 찾을 수 있습니다.</li>
            </ul>

            <h2 className="mt-10 mb-4 text-xl font-bold">콘텐츠별 남은 콘텐츠 확인</h2>
            <p>
                멤버 숙제 화면에서 특정 콘텐츠를 선택하면 해당 콘텐츠를 진행하는 모든 캐릭터의 관문별 상태를 모아볼 수 있습니다.
                캐릭터마다 남은 관문과 완료 여부, 골드 획득 가능 여부를 비교할 수 있어 파티원이 어떤 숙제를 먼저 처리해야 하는지 정리하기 좋습니다.
            </p>
            <figure className="mt-6 overflow-hidden rounded-2xl border border-default-200 bg-default-50 p-2 dark:border-white/10 dark:bg-white/[0.03]">
                <img src="/about/party-homework-remaining.png" alt="선택한 콘텐츠의 캐릭터별 관문 진행 상태와 완료 여부를 보여주는 화면" className="h-auto w-full rounded-xl object-contain" />
                <figcaption className="px-2 pb-1 pt-2 text-sm text-default-500">선택한 콘텐츠의 캐릭터별 남은 관문과 완료 상태</figcaption>
            </figure>
            <ol className="mt-4 list-decimal space-y-2 pl-5 text-base">
                <li>콘텐츠 선택 메뉴에서 확인할 레이드를 선택합니다.</li>
                <li>캐릭터별 관문 상태와 완료 여부를 확인합니다.</li>
                <li><strong>획득 가능</strong>으로 표시된 캐릭터는 해당 콘텐츠의 골드를 아직 기록할 수 있는 상태입니다.</li>
                <li>관문 진행이 남은 캐릭터를 기준으로 파티 일정을 조정하거나 숙제 순서를 정합니다.</li>
            </ol>

            <section className="mt-8 rounded-2xl border border-warning-200 bg-warning-50/70 p-5 dark:border-warning-500/20 dark:bg-warning-500/10">
                <h2 className="text-xl font-bold">주의사항</h2>
                <ul className="mt-3 list-disc space-y-2 pl-5 text-base">
                    <li>화면에 표시되는 숙제와 골드는 각 멤버가 로츠고에 저장한 캐릭터와 진행 상태를 기준으로 합니다.</li>
                    <li>게임에서 콘텐츠를 완료한 뒤에는 각 멤버가 자신의 숙제 체크와 골드 기록을 최신 상태로 유지해야 합니다.</li>
                    <li>부수입은 자동으로 확인되는 값이 아니라 멤버가 직접 입력한 기록을 기준으로 표시됩니다.</li>
                    <li>콘텐츠별 남은 콘텐츠 화면의 관문 상태와 실제 게임 진행 상태가 다르면 파티원과 함께 기록을 확인하세요.</li>
                </ul>
            </section>
        </div>
    );
}
