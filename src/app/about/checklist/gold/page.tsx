import { Metadata } from "next";

export const metadata: Metadata = {
    title: '골드 및 부수입 · 로츠고 가이드',
    description: '로츠고 숙제 페이지에서 주간 골드와 캐릭터별 부수입을 기록하고 확인하는 방법을 안내합니다.',
};

export default function GoldGuide() {
    return (
        <div className="w-full [&_p]:text-base [&_h1]:text-2xl">
            <h1 className="font-bold mb-3">골드 및 부수입</h1>
            <p>
                골드 및 부수입 기능에서는 캐릭터별 주간 골드 획득 현황과 숙제 외에 얻은 부수입을 함께 관리할 수 있습니다.
                주간 골드 상세에서 캐릭터별 콘텐츠 골드와 귀속 골드를 비교하고, 부수입 내역에서 별도로 기록한 골드를 확인하세요.
            </p>

            <h2 className="mt-10 mb-4 text-xl font-bold">캐릭터별 부수입 내역</h2>
            <p>
                각 캐릭터 카드의 부수입 영역에서 기록을 추가하면 해당 캐릭터가 얻은 부수입만 따로 확인할 수 있습니다.
                기록에는 아이콘, 경로, 날짜, 골드량이 표시되며 선택한 기록의 주간 기여도와 전체 부수입 중 비율도 함께 확인할 수 있습니다.
            </p>
            <figure className="mt-6 overflow-hidden rounded-2xl border border-default-200 bg-default-50 p-2 dark:border-white/10 dark:bg-white/[0.03]">
                <img src="/about/checklist-gold-character-income.png" alt="칼란디르 캐릭터별 부수입 내역 화면" className="h-auto w-full rounded-xl object-contain" />
                <figcaption className="px-2 pb-1 pt-2 text-sm text-default-500">캐릭터별 부수입 내역과 선택 기록의 주간 기여도</figcaption>
            </figure>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-base">
                <li>부수입 기록을 선택하면 선택한 기록의 합계와 전체 부수입 대비 구성 비율을 확인할 수 있습니다.</li>
                <li>경매 분배금, 편린 획득처럼 숙제 골드와 별도로 얻은 금액을 기록할 수 있습니다.</li>
                <li>기록이 잘못되었다면 목록의 수정 버튼으로 내용을 고치고, 휴지통 버튼으로 삭제합니다.</li>
            </ul>

            <h2 className="mt-10 mb-4 text-xl font-bold">전체 부수입 내역</h2>
            <p>
                주간 골드 상세의 <strong>부수입 내역</strong> 탭에서는 모든 캐릭터의 부수입을 한 번에 확인할 수 있습니다.
                캐릭터명, 부수입 경로, 기록 날짜, 골드량을 비교해 이번 주에 어떤 캐릭터가 어떤 경로로 부수입을 얻었는지 확인할 수 있습니다.
            </p>
            <figure className="mt-6 overflow-hidden rounded-2xl border border-default-200 bg-default-50 p-2 dark:border-white/10 dark:bg-white/[0.03]">
                <img src="/about/checklist-gold-income-all.png" alt="전체 캐릭터의 주간 부수입 내역 화면" className="h-auto w-full rounded-xl object-contain" />
                <figcaption className="px-2 pb-1 pt-2 text-sm text-default-500">주간 골드 상세의 전체 부수입 내역</figcaption>
            </figure>
            <p className="mt-4">
                여러 캐릭터의 기록을 함께 확인할 때는 경로별 합계와 날짜를 비교해 중복 입력이나 누락을 점검하세요. 부수입은 콘텐츠 골드와 별도로 집계되므로 주간 골드 상세의 총 부수입에 반영됩니다.
            </p>

            <h2 className="mt-10 mb-4 text-xl font-bold">주간 골드 상세</h2>
            <p>
                숙제 조회 설정의 <strong>남은 숙제</strong> 또는 골드 현황에서 주간 골드 상세를 열면 선택한 주차의 골드 현황을 확인할 수 있습니다.
                골드 상세 탭에서는 캐릭터별 콘텐츠 골드, 귀속 골드, 부수입을 나누어 보여주고 전체 합계와 비율을 요약합니다.
            </p>
            <figure className="mt-6 overflow-hidden rounded-2xl border border-default-200 bg-default-50 p-2 dark:border-white/10 dark:bg-white/[0.03]">
                <img src="/about/checklist-gold-detail.png" alt="캐릭터별 주간 골드 상세 화면" className="h-auto w-full rounded-xl object-contain" />
                <figcaption className="px-2 pb-1 pt-2 text-sm text-default-500">캐릭터별 콘텐츠 골드·귀속 골드·부수입 상세</figcaption>
            </figure>
            <div className="mt-4 space-y-3">
                <section className="rounded-xl border border-default-200 bg-content1 p-4 dark:border-white/10">
                    <h3 className="text-lg font-bold">콘텐츠</h3>
                    <p className="mt-1">주간 레이드와 던전 등 숙제 콘텐츠에서 얻는 골드입니다. 주간 콘텐츠의 골드 지정과 완료 상태를 기준으로 집계됩니다.</p>
                </section>
                <section className="rounded-xl border border-default-200 bg-content1 p-4 dark:border-white/10">
                    <h3 className="text-lg font-bold">귀속 골드</h3>
                    <p className="mt-1">콘텐츠에서 얻은 귀속 골드를 별도로 보여줍니다. 캐릭터별 귀속 골드와 전체 귀속 골드 비율을 비교할 수 있습니다.</p>
                </section>
                <section className="rounded-xl border border-default-200 bg-content1 p-4 dark:border-white/10">
                    <h3 className="text-lg font-bold">부수입</h3>
                    <p className="mt-1">경매 분배금, 편린, 기타 기록처럼 숙제 콘텐츠 골드 외에 직접 입력한 금액입니다. 부수입 기록을 추가하면 캐릭터별·전체 내역과 총합에 반영됩니다.</p>
                </section>
                <section className="rounded-xl border border-default-200 bg-content1 p-4 dark:border-white/10">
                    <h3 className="text-lg font-bold">더보기로 빠진 골드</h3>
                    <p className="mt-1">주간 콘텐츠의 더보기 비용을 반영해 실제 순수익을 계산할 때 참고하는 값입니다. 해당 레이드에서 더보기로 사용한 골드는 귀속 골드에서 우선 차감되며, 총 콘텐츠 골드와 귀속 골드, 부수입을 볼 때 더보기로 사용한 골드가 별도로 표시될 수 있습니다.</p>
                </section>
            </div>

            <h2 className="mt-10 mb-4 text-xl font-bold">부수입 기록 추가하기</h2>
            <p>
                캐릭터 카드 하단의 부수입 입력 영역에서 아이콘과 경로, 골드량을 입력한 뒤 기록을 추가합니다.
                경로를 입력하지 않으면 알 수 없음으로 표시되므로 나중에 확인하기 쉽도록 경매 분배금, 편린 획득처럼 구체적으로 입력하세요.
            </p>
            <figure className="mt-6 overflow-hidden rounded-2xl border border-default-200 bg-default-50 p-2 dark:border-white/10 dark:bg-white/[0.03]">
                <img src="/about/checklist-income-add.png" alt="캐릭터 카드에서 부수입 기록을 추가하는 화면" className="mx-auto h-auto max-h-[360px] rounded-xl object-contain" />
                <figcaption className="px-2 pb-1 pt-2 text-sm text-default-500">아이콘·경로·골드량을 입력하는 부수입 기록 영역</figcaption>
            </figure>
            <h3 className="mt-8 mb-4 text-lg font-bold">부수입 설정 종류</h3>
            <p>
                부수입 아이콘을 선택할 때 자주 사용하는 항목은 기본 설정으로 제공됩니다. 기본 항목에 없는 수입은 <strong>기타</strong>를 선택해 직접 경로를 입력하면 됩니다.
            </p>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2 text-base">
                <li className="rounded-xl border border-default-200 bg-content1 p-4 dark:border-white/10"><strong>편린</strong><span className="mt-1 block text-default-500">편린 획득으로 얻은 부수입</span></li>
                <li className="rounded-xl border border-default-200 bg-content1 p-4 dark:border-white/10"><strong>유물 각인서</strong><span className="mt-1 block text-default-500">유물 각인서 판매 수입</span></li>
                <li className="rounded-xl border border-default-200 bg-content1 p-4 dark:border-white/10"><strong>팔찌 판매</strong><span className="mt-1 block text-default-500">팔찌를 판매해 얻은 수입</span></li>
                <li className="rounded-xl border border-default-200 bg-content1 p-4 dark:border-white/10"><strong>악세 판매</strong><span className="mt-1 block text-default-500">악세서리 판매 수입</span></li>
                <li className="rounded-xl border border-default-200 bg-content1 p-4 dark:border-white/10"><strong>경매 분배금</strong><span className="mt-1 block text-default-500">경매 결과로 분배받은 골드</span></li>
                <li className="rounded-xl border border-primary-200 bg-primary-50/60 p-4 dark:border-primary-500/20 dark:bg-primary-500/10"><strong>기타</strong><span className="mt-1 block text-default-500">위 항목 외 수입의 이름을 직접 입력</span></li>
            </ul>
            <ol className="mt-4 list-decimal space-y-2 pl-5 text-base">
                <li>부수입 아이콘을 눌러 기록에 사용할 아이콘을 선택합니다.</li>
                <li>경로 입력란에 부수입의 이름이나 획득 경로를 입력합니다.</li>
                <li>골드량에 획득한 금액을 입력하고 <strong>기록 추가</strong>를 누릅니다.</li>
                <li><strong>내역 보기</strong>를 눌러 저장된 기록을 확인하고 필요한 경우 수정·삭제합니다.</li>
            </ol>

            <section className="mt-8 rounded-2xl border border-warning-200 bg-warning-50/70 p-5 dark:border-warning-500/20 dark:bg-warning-500/10">
                <h2 className="text-xl font-bold">주의사항</h2>
                <ul className="mt-3 list-disc space-y-2 pl-5 text-base">
                    <li>부수입은 자동으로 감지되지 않으므로 획득 직후 직접 기록해야 정확한 합계를 유지할 수 있습니다.</li>
                    <li>콘텐츠 골드와 부수입을 중복해서 입력하지 않도록 경로와 금액을 확인하세요.</li>
                    <li>주차를 변경해 조회할 때는 선택한 주차의 골드와 부수입 기록이 표시되는지 확인하세요.</li>
                </ul>
            </section>
        </div>
    );
}
