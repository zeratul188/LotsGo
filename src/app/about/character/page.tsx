import { Metadata } from "next";

export const metadata: Metadata = {
    title: '전투정보실 안내 · 로츠고 가이드',
    description: '로츠고 전투정보실에서 캐릭터의 장비, 악세서리, 전투력, 특성, 스킬과 원정대 정보를 확인하는 방법을 안내합니다.',
};

export default function CharacterGuide() {
    return (
        <div className="w-full [&_p]:text-base [&_h1]:text-2xl">
            <h1 className="font-bold mb-3">전투정보실 안내</h1>
            <p>
                전투정보실은 로스트아크 캐릭터의 전투 세팅과 원정대 정보를 한곳에서 확인하는 기능입니다.
                캐릭터명을 검색하면 장비와 악세서리, 전투력, 특성, 스킬, 아크그리드, 수집형 포인트와 원정대 정보를 탭별로 확인할 수 있습니다.
            </p>

            <figure className="mt-6 overflow-hidden rounded-2xl border border-default-200 bg-default-50 p-2 dark:border-white/10 dark:bg-white/[0.03]">
                <img src="/about/character-office.png" alt="로츠고 전투정보실 캐릭터 능력치 화면" className="h-auto w-full rounded-xl object-contain" />
                <figcaption className="px-2 pb-1 pt-2 text-sm text-default-500">캐릭터의 장비·악세서리·전투력·특성을 확인하는 전투정보실</figcaption>
            </figure>

            <h2 className="mt-10 mb-4 text-xl font-bold">캐릭터 정보 불러오기</h2>
            <ol className="list-decimal space-y-2 pl-5 text-base">
                <li>상단 메뉴에서 <strong>전투정보실</strong>을 엽니다.</li>
                <li>검색창에 확인할 캐릭터명을 입력합니다.</li>
                <li>검색 결과가 표시되면 캐릭터를 선택해 정보를 불러옵니다.</li>
                <li>정보가 오래되었다면 <strong>정보 갱신</strong> 버튼으로 최신 데이터를 다시 요청합니다.</li>
            </ol>

            <h2 className="mt-10 mb-4 text-xl font-bold">능력치 탭에서 확인하는 정보</h2>
            <div className="space-y-3">
                <section className="rounded-xl border border-default-200 bg-content1 p-4 dark:border-white/10">
                    <h3 className="text-lg font-bold">캐릭터 기본 정보</h3>
                    <p className="mt-1">서버와 클래스, 전투 태세, 캐릭터명, 전투 레벨, 원정대 레벨, 영지와 아이템 레벨을 확인합니다.</p>
                </section>
                <section className="rounded-xl border border-default-200 bg-content1 p-4 dark:border-white/10">
                    <h3 className="text-lg font-bold">장비</h3>
                    <p className="mt-1">무기와 방어구의 품질, 재련 단계와 재련 효과를 부위별로 확인합니다. 장비 세팅을 점검하거나 다른 캐릭터의 장비 수준을 비교할 때 활용하세요.</p>
                </section>
                <section className="rounded-xl border border-default-200 bg-content1 p-4 dark:border-white/10">
                    <h3 className="text-lg font-bold">악세서리</h3>
                    <p className="mt-1">목걸이·귀걸이·반지의 품질과 힘민지, 품질에 따른 효과, 각인과 전투 특성을 확인할 수 있습니다.</p>
                </section>
                <section className="rounded-xl border border-default-200 bg-content1 p-4 dark:border-white/10">
                    <h3 className="text-lg font-bold">전투력과 특성</h3>
                    <p className="mt-1">현재 전투력과 명예 포인트, 기본 공격력·최대 생명력, 특화·치명·제압·신속·숙련·인내 등의 전투 특성을 요약해서 보여줍니다.</p>
                </section>
            </div>

            <h2 className="mt-10 mb-4 text-xl font-bold">상세 정보 탭</h2>
            <ul className="list-disc space-y-2 pl-5 text-base">
                <li><strong>스킬</strong>: 캐릭터가 사용하는 스킬과 트라이포드, 스킬 레벨을 확인합니다.</li>
                <li><strong>아크그리드</strong>: 아크그리드 코어와 옵션 구성을 확인합니다.</li>
                <li><strong>수집형 포인트</strong>: 수집 콘텐츠의 포인트와 진행 정보를 확인합니다.</li>
                <li><strong>아바타</strong>: 캐릭터에 적용된 아바타 정보를 확인합니다.</li>
                <li><strong>원정대</strong>: 검색한 캐릭터가 속한 원정대 캐릭터 목록을 확인합니다.</li>
                <li><strong>원정대 정보</strong>: 원정대 단위의 레벨과 대표 정보를 확인합니다.</li>
            </ul>

            <h2 className="mt-10 mb-4 text-xl font-bold">전투정보실 활용 방법</h2>
            <div className="grid gap-3 sm:grid-cols-3">
                <section className="rounded-xl border border-primary-200 bg-primary-50/60 p-4 dark:border-primary-500/20 dark:bg-primary-500/10">
                    <h3 className="text-lg font-bold">내 캐릭터 점검</h3>
                    <p className="mt-1">장비 품질과 악세서리, 각인, 전투 특성을 한 화면에서 확인해 현재 세팅을 점검합니다.</p>
                </section>
                <section className="rounded-xl border border-secondary-200 bg-secondary-50/60 p-4 dark:border-secondary-500/20 dark:bg-secondary-500/10">
                    <h3 className="text-lg font-bold">다른 캐릭터 참고</h3>
                    <p className="mt-1">다른 캐릭터를 검색해 장비·악세서리·스킬·아크그리드 구성을 참고할 수 있습니다.</p>
                </section>
                <section className="rounded-xl border border-success-200 bg-success-50/60 p-4 dark:border-success-500/20 dark:bg-success-500/10">
                    <h3 className="text-lg font-bold">원정대 확인</h3>
                    <p className="mt-1">원정대 탭에서 같은 원정대의 다른 캐릭터와 레벨, 전투 정보를 함께 확인합니다.</p>
                </section>
            </div>

            <section className="mt-8 rounded-2xl border border-warning-200 bg-warning-50/70 p-5 dark:border-warning-500/20 dark:bg-warning-500/10">
                <h2 className="text-xl font-bold">주의사항</h2>
                <ul className="mt-3 list-disc space-y-2 pl-5 text-base">
                    <li>전투정보실에 표시되는 정보는 마지막 조회·갱신 시점의 데이터일 수 있으므로 최신 상태가 필요하면 정보 갱신을 실행하세요.</li>
                    <li>게임에서 장비나 스킬을 변경한 직후에는 외부 정보 갱신까지 시간이 걸릴 수 있습니다.</li>
                    <li>표시되는 정보는 캐릭터 공개 데이터와 API 응답 범위에 따라 달라질 수 있습니다.</li>
                </ul>
            </section>
        </div>
    );
}
