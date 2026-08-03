import { Metadata } from "next";

export const metadata: Metadata = {
    title: '캐릭터 비교 · 로츠고 가이드',
    description: '로츠고 캐릭터 비교에서 두 캐릭터의 장비와 전투 정보를 나란히 비교하는 방법을 안내합니다.',
};

export default function CharacterCompareGuide() {
    return (
        <div className="w-full [&_p]:text-base [&_h1]:text-2xl">
            <h1 className="mb-3 font-bold">캐릭터 비교</h1>
            <p>
                캐릭터 비교는 두 캐릭터를 선택해 전투력과 장비 강화 상태를 나란히 확인하는 기능입니다.
                같은 원정대의 캐릭터를 비교하거나 다른 캐릭터의 세팅을 참고할 때, 어떤 장비 부위와 전투 요소에서 차이가 나는지 빠르게 파악할 수 있습니다.
            </p>

            <figure className="mt-6 overflow-hidden rounded-2xl border border-default-200 bg-default-50 p-2 dark:border-white/10 dark:bg-white/[0.03]">
                <img src="/about/character-compare.png" alt="두 캐릭터의 프로필과 장비 강화 상태를 비교하는 화면" className="h-auto w-full rounded-xl object-contain" />
                <figcaption className="px-2 pb-1 pt-2 text-sm text-default-500">두 캐릭터의 장비 강화 단계와 품질을 부위별로 비교하는 예시</figcaption>
            </figure>

            <h2 className="mt-10 mb-4 text-xl font-bold">비교 시작하기</h2>
            <ol className="list-decimal space-y-2 pl-5 text-base">
                <li>상단 메뉴에서 <strong>전투정보실</strong>을 열고 <strong>캐릭터 비교</strong>로 이동합니다.</li>
                <li>비교할 첫 번째 캐릭터와 두 번째 캐릭터를 검색해 선택합니다.</li>
                <li>두 캐릭터가 선택되면 프로필과 주요 전투 정보가 좌우에 표시됩니다.</li>
                <li>가운데 비교 영역에서 장비 부위별 차이를 확인하고, 필요한 경우 캐릭터를 다시 검색해 비교 대상을 바꿉니다.</li>
            </ol>

            <h2 className="mt-10 mb-4 text-xl font-bold">화면에서 비교하는 정보</h2>
            <div className="space-y-3">
                <section className="rounded-xl border border-default-200 bg-content1 p-4 dark:border-white/10">
                    <h3 className="text-lg font-bold">프로필과 전투력</h3>
                    <p className="mt-1">각 프로필에서 서버·클래스·아크 패시브, 캐릭터명과 아이템 레벨, 전투 레벨, 원정대 레벨, 명예 포인트를 확인합니다. 전투력 수치를 함께 보면 장비 수준뿐 아니라 현재 전투 세팅의 차이도 파악할 수 있습니다.</p>
                </section>
                <section className="rounded-xl border border-default-200 bg-content1 p-4 dark:border-white/10">
                    <h3 className="text-lg font-bold">장비 강화와 품질</h3>
                    <p className="mt-1">무기·투구·어깨·상의·하의·장갑을 같은 행에 배치해 강화 단계와 품질을 비교합니다. 양쪽 카드의 숫자를 확인하고 가운데 표시되는 차이로 어느 부위가 더 높거나 낮은지 살펴보세요.</p>
                </section>
                <section className="rounded-xl border border-default-200 bg-content1 p-4 dark:border-white/10">
                    <h3 className="text-lg font-bold">성장 우선순위 찾기</h3>
                    <p className="mt-1">한 캐릭터의 특정 부위만 강화 단계나 품질이 크게 다르다면 다음 성장 목표로 삼을 수 있습니다. 같은 클래스의 캐릭터를 비교할 때는 장비뿐 아니라 전투력과 아크 패시브도 함께 확인하세요.</p>
                </section>
            </div>

            <h2 className="mt-10 mb-4 text-xl font-bold">비교 기능 활용 방법</h2>
            <ul className="list-disc space-y-2 pl-5 text-base">
                <li>부캐릭터끼리 비교해 레이드에 참여할 캐릭터와 추가 육성이 필요한 캐릭터를 구분합니다.</li>
                <li>비슷한 아이템 레벨의 캐릭터를 비교해 재련 단계, 품질, 전투력 차이의 원인을 확인합니다.</li>
                <li>다른 유저의 공개 캐릭터와 비교해 장비 구성이나 성장 방향을 참고합니다.</li>
                <li>장비를 변경한 뒤 다시 조회해 강화 전후의 전투력과 부위별 변화를 확인합니다.</li>
            </ul>

            <section className="mt-8 rounded-2xl border border-warning-200 bg-warning-50/70 p-5 dark:border-warning-500/20 dark:bg-warning-500/10">
                <h2 className="text-xl font-bold">주의사항</h2>
                <ul className="mt-3 list-disc space-y-2 pl-5 text-base">
                    <li>비교 결과는 각 캐릭터의 마지막 조회 시점에 저장된 공개 정보를 기준으로 표시됩니다.</li>
                    <li>게임에서 장비나 세팅을 변경했다면 두 캐릭터 모두 전투정보실에서 정보를 갱신한 뒤 비교하세요.</li>
                    <li>클래스와 역할이 다른 캐릭터는 전투력만으로 우열을 판단하기보다 장비·특성·세팅을 목적에 맞게 비교해야 합니다.</li>
                    <li>비공개 상태이거나 API에서 제공되지 않는 정보는 비교 화면에 표시되지 않을 수 있습니다.</li>
                </ul>
            </section>
        </div>
    );
}
