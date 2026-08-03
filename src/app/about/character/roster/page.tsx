import { Metadata } from "next";

export const metadata: Metadata = {
    title: '원정대 모아보기 · 로츠고 가이드',
    description: '로츠고 원정대 모아보기에서 여러 캐릭터의 장비, 전투 정보, 각인, 보석과 카드 세트를 비교하는 방법을 안내합니다.',
};

export default function RosterGuide() {
    return (
        <div className="w-full [&_p]:text-base [&_h1]:text-2xl">
            <h1 className="mb-3 font-bold">원정대 모아보기</h1>
            <p>
                원정대 모아보기는 한 원정대에 속한 여러 캐릭터의 성장 상태와 전투 세팅을 한 화면에서 비교하는 기능입니다.
                캐릭터 카드를 나란히 확인하면서 장비 강화 단계, 전투 특성, 각인·보석과 카드 세트까지 빠르게 점검할 수 있습니다.
            </p>

            <figure className="mt-6 overflow-hidden rounded-2xl border border-default-200 bg-default-50 p-2 dark:border-white/10 dark:bg-white/[0.03]">
                <img src="/about/character-roster.png" alt="원정대 캐릭터 세 장의 정보를 비교하는 모아보기 화면" className="h-auto w-full rounded-xl object-contain" />
                <figcaption className="px-2 pb-1 pt-2 text-sm text-default-500">원정대 캐릭터를 카드 형태로 한 화면에서 비교하는 예시</figcaption>
            </figure>

            <h2 className="mt-10 mb-4 text-xl font-bold">원정대 모아보기 사용하기</h2>
            <ol className="list-decimal space-y-2 pl-5 text-base">
                <li>상단 메뉴에서 <strong>전투정보실</strong>을 열고 원정대 모아보기 화면으로 이동합니다.</li>
                <li>필요하면 검색창에 캐릭터명을 입력해 원하는 캐릭터만 빠르게 찾습니다.</li>
                <li>각 캐릭터 카드를 위에서 아래로 살펴보며 성장 상태와 세팅을 비교합니다.</li>
                <li>정보가 오래된 캐릭터는 전투정보실에서 먼저 조회하거나 <strong>정보 갱신</strong>을 실행한 뒤 다시 확인합니다.</li>
            </ol>

            <h2 className="mt-10 mb-4 text-xl font-bold">캐릭터 카드에서 확인하는 정보</h2>
            <div className="space-y-3">
                <section className="rounded-xl border border-default-200 bg-content1 p-4 dark:border-white/10">
                    <h3 className="text-lg font-bold">기본 정보와 아크 패시브</h3>
                    <p className="mt-1">카드 상단에서 캐릭터명, 클래스, 아이템 레벨을 확인하고 아크 패시브 이름과 전투력을 함께 살펴볼 수 있습니다. 여러 캐릭터의 현재 육성 우선순위를 비교할 때 기준으로 활용하세요.</p>
                </section>
                <section className="rounded-xl border border-default-200 bg-content1 p-4 dark:border-white/10">
                    <h3 className="text-lg font-bold">장비 강화</h3>
                    <p className="mt-1">무기·투구·어깨·상의·하의·장갑의 강화 단계와 품질을 부위별로 확인합니다. 장비 단계 아래에는 해당 캐릭터가 진행하는 레이드나 세트 관련 정보가 표시되어 캐릭터별 성장 격차를 파악하기 쉽습니다.</p>
                </section>
                <section className="rounded-xl border border-default-200 bg-content1 p-4 dark:border-white/10">
                    <h3 className="text-lg font-bold">전투 특성과 아크 패시브</h3>
                    <p className="mt-1">공격력과 최대 생명력, 치명·신속·특화·제압·숙련·인내 등의 전투 특성을 확인하고, 아크 패시브의 진행 단계와 포인트를 비교할 수 있습니다.</p>
                </section>
                <section className="rounded-xl border border-default-200 bg-content1 p-4 dark:border-white/10">
                    <h3 className="text-lg font-bold">각인과 보석</h3>
                    <p className="mt-1">적용 중인 각인의 종류와 단계, 보석의 개수·레벨·효과를 확인합니다. 같은 클래스 캐릭터의 세팅을 비교하거나 보석 투자가 필요한 캐릭터를 찾을 때 유용합니다.</p>
                </section>
                <section className="rounded-xl border border-default-200 bg-content1 p-4 dark:border-white/10">
                    <h3 className="text-lg font-bold">카드 세트</h3>
                    <p className="mt-1">장착한 카드 세트 이름과 완성 진행도를 확인합니다. 카드 세트가 캐릭터별로 다르게 적용되어 있는지 확인하고, 세트 완성까지 남은 수량을 점검할 수 있습니다.</p>
                </section>
            </div>

            <h2 className="mt-10 mb-4 text-xl font-bold">이렇게 활용해 보세요</h2>
            <ul className="list-disc space-y-2 pl-5 text-base">
                <li>레이드에 데려갈 캐릭터를 고를 때 아이템 레벨과 장비 강화 상태를 한 번에 비교합니다.</li>
                <li>부캐릭터의 장비·각인·보석 중 먼저 보완할 부분을 찾습니다.</li>
                <li>같은 클래스 캐릭터의 전투 특성과 보석 구성을 비교해 세팅을 점검합니다.</li>
                <li>원정대 전체의 카드 세트와 아크 패시브 진행도를 확인해 장기적인 성장 계획을 세웁니다.</li>
            </ul>

            <section className="mt-8 rounded-2xl border border-warning-200 bg-warning-50/70 p-5 dark:border-warning-500/20 dark:bg-warning-500/10">
                <h2 className="text-xl font-bold">주의사항</h2>
                <ul className="mt-3 list-disc space-y-2 pl-5 text-base">
                    <li>모아보기에는 전투정보실에서 한 번 이상 조회해 저장된 캐릭터 정보가 기준으로 표시됩니다.</li>
                    <li>게임에서 장비나 세팅을 변경한 직후에는 저장된 정보와 실제 게임 화면이 다를 수 있으므로 전투정보실에서 정보를 갱신하세요.</li>
                    <li>표시되는 항목과 값은 공개된 캐릭터 정보와 API 응답 범위에 따라 달라질 수 있습니다.</li>
                </ul>
            </section>
        </div>
    );
}
