import { Metadata } from "next";

export const metadata: Metadata = {
    title: '레이드 자동 등록 · 로츠고 가이드',
    description: '로츠고 숙제 페이지에서 캐릭터 레벨과 골드 지정 상태를 기준으로 레이드를 자동 등록하는 방법을 안내합니다.',
};

export default function RaidAutoRegistrationGuide() {
    return (
        <div className="w-full [&_p]:text-base [&_h1]:text-2xl">
            <h1 className="font-bold mb-3">레이드 자동 등록</h1>
            <p>
                레이드 자동 등록은 저장된 캐릭터의 레벨과 콘텐츠 입장 조건을 기준으로 진행 가능한 레이드를 찾아 숙제 목록에 등록하는 기능입니다.
                캐릭터마다 레이드를 하나씩 선택하지 않아도 되기 때문에, 캐릭터를 새로 추가했거나 레이드 구성이 바뀌었을 때 유용합니다.
            </p>

            <figure className="mt-6 overflow-hidden rounded-2xl border border-default-200 bg-default-50 p-2 dark:border-white/10 dark:bg-white/[0.03]">
                <img src="/about/checklist-auto-registration-overview.png" alt="숙제 조회 설정의 전체 자동 등록 버튼 위치" className="h-auto w-full rounded-xl object-contain" />
                <figcaption className="px-2 pb-1 pt-2 text-sm text-default-500">숙제 조회 설정 상단의 전체 자동 등록 버튼</figcaption>
            </figure>

            <div className="mt-6 grid gap-6 lg:grid-cols-2 lg:items-start">
                <div className="space-y-4">
                    <figure className="overflow-hidden rounded-2xl border border-default-200 bg-default-50 p-2 dark:border-white/10 dark:bg-white/[0.03]">
                        <img src="/about/checklist-auto-registration-character.png" alt="캐릭터 설정 메뉴의 레이드 자동 등록 위치" className="mx-auto h-auto max-h-[420px] rounded-xl object-contain" />
                        <figcaption className="px-2 pb-1 pt-2 text-sm text-default-500">캐릭터 설정 메뉴의 레이드 자동 등록 항목</figcaption>
                    </figure>
                </div>

                <section>
                    <h2 className="mb-4 text-xl font-bold">자동 등록 실행하기</h2>
                    <ol className="list-decimal space-y-2 pl-5 text-base">
                        <li>숙제 메뉴에서 캐릭터와 레이드 데이터가 모두 불러와졌는지 확인합니다.</li>
                        <li>전체 캐릭터를 갱신하려면 숙제 조회 설정의 <strong>전체 자동 등록</strong>을 누릅니다.</li>
                        <li>특정 캐릭터만 갱신하려면 해당 캐릭터 카드의 설정 버튼을 누른 뒤 <strong>레이드 자동 등록</strong>을 선택합니다.</li>
                        <li>확인 창에서 대상 캐릭터와 기존 레이드 처리 방식을 확인한 뒤 실행합니다.</li>
                        <li>처리가 끝나면 캐릭터 카드에서 레이드 목록과 골드 지정 상태를 확인합니다.</li>
                    </ol>
                </section>
            </div>

            <h2 className="mt-10 mb-4 text-xl font-bold">어떤 레이드가 등록되나요?</h2>
            <div className="space-y-3">
                <section className="rounded-xl border border-default-200 bg-content1 p-4 dark:border-white/10">
                    <h3 className="text-lg font-bold">캐릭터 레벨에 맞는 난이도</h3>
                    <p className="mt-1">캐릭터가 입장할 수 있는 난이도만 확인하고, 각 관문별로 입장 가능한 난이도 중 가장 높은 조건을 우선 선택합니다. 캐릭터 레벨이 부족한 난이도는 자동으로 등록되지 않습니다.</p>
                </section>
                <section className="rounded-xl border border-default-200 bg-content1 p-4 dark:border-white/10">
                    <h3 className="text-lg font-bold">골드 지정 캐릭터 기준</h3>
                    <p className="mt-1">자동 등록으로 선택된 레이드는 골드 획득 대상으로 등록됩니다. 골드 획득 레이드는 예상 골드가 높은 순서를 우선 고려하며, 일반 레이드는 캐릭터당 최대 3개까지 선택됩니다.</p>
                </section>
                <section className="rounded-xl border border-default-200 bg-content1 p-4 dark:border-white/10">
                    <h3 className="text-lg font-bold">계정 단위 콘텐츠 배분</h3>
                    <p className="mt-1">계정에서 한 번만 보상을 받을 수 있는 관문은 같은 계정의 여러 골드 캐릭터에 중복 배정하지 않습니다. 입장 가능한 골드 캐릭터 중 레벨과 캐릭터 순서를 기준으로 한 캐릭터에 우선 배정합니다.</p>
                </section>
            </div>

            <h2 className="mt-10 mb-4 text-xl font-bold">기존 레이드 처리</h2>
            <p>
                자동 등록을 실행하면 현재 목록을 기준으로 새 레이드 구성을 계산합니다. 기존 레이드가 새 조건에 맞으면 완료 체크와 보너스 상태를 최대한 유지하면서 난이도 정보를 갱신합니다.
                새 구성에서 선택되지 않은 기존 레이드는 확인 창에 표시되는 설정에 따라 목록에서 삭제하거나, 목록에 남겨두고 골드 지정만 해제할 수 있습니다.
            </p>
            <section className="mt-5 rounded-2xl border border-warning-200 bg-warning-50/70 p-5 dark:border-warning-500/20 dark:bg-warning-500/10">
                <h2 className="text-xl font-bold">실행 전 확인</h2>
                <ul className="mt-3 list-disc space-y-2 pl-5 text-base">
                    <li>기존 레이드를 목록에서 삭제하는 방식으로 설정했다면, 자동 등록 전에 직접 추가한 레이드가 사라질 수 있습니다.</li>
                    <li>기존 레이드를 유지하는 방식에서는 선택되지 않은 레이드가 남지만 골드 지정은 해제됩니다.</li>
                    <li>싱글 난이도는 자동 등록 대상에 포함되지 않으므로 필요하면 주간 콘텐츠 관리에서 직접 등록하세요.</li>
                </ul>
            </section>

            <h2 className="mt-10 mb-4 text-xl font-bold">자동 등록 후 관리</h2>
            <ol className="list-decimal space-y-2 pl-5 text-base">
                <li>자동 등록 후 캐릭터별 레이드 목록과 골드 지정 여부를 확인합니다.</li>
                <li>자동 선택과 다르게 운영할 레이드는 주간 콘텐츠 관리에서 순서, 난이도, 관문을 수정합니다.</li>
                <li>직접 관리할 레이드는 골드 지정 버튼으로 대상 여부를 조정합니다.</li>
                <li>레이드가 변경되거나 캐릭터 레벨이 올랐다면 자동 등록을 다시 실행해 목록을 갱신합니다.</li>
            </ol>

            <section className="mt-8 rounded-2xl border border-primary-200 bg-primary-50/70 p-5 dark:border-primary-500/20 dark:bg-primary-500/10">
                <h2 className="text-xl font-bold">자동 등록과 수동 등록의 차이</h2>
                <p className="mt-3">
                    자동 등록은 캐릭터 레벨과 골드 효율을 기준으로 빠르게 기본 목록을 구성하는 기능입니다. 특정 레이드만 진행하거나 싱글 난이도·기타 콘텐츠를 추가하려면 자동 등록 후 주간 콘텐츠 관리에서 직접 조정하세요.
                </p>
            </section>
        </div>
    );
}
