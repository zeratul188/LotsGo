import { Metadata } from "next";

export const metadata: Metadata = {
    title: '숙제 시작하기 · 로츠고 가이드',
    description: '로츠고 숙제 페이지의 초기 설정과 캐릭터 등록, 숙제 체크 방법을 안내합니다.',
};

const firstSteps = [
    {
        number: '01',
        title: '숙제 페이지 열기',
        description: '로그인한 뒤 상단 메뉴의 숙제로 이동합니다. 처음 방문하면 회원가입 때 등록한 대표 캐릭터를 기준으로 원정대 정보를 불러옵니다.',
    },
    {
        number: '02',
        title: '캐릭터와 골드 지정 확인',
        description: '불러온 캐릭터 목록과 골드 지정 상태를 확인합니다. 골드 지정은 주간 골드 현황을 계산하는 기준이므로 실제 플레이 계획에 맞게 조정하세요.',
    },
    {
        number: '03',
        title: '주간 콘텐츠 확인',
        description: '캐릭터별 레벨에 맞는 주간 콘텐츠가 기본으로 구성됩니다. 레이드와 관문, 난이도가 내 플레이 계획과 맞는지 확인합니다.',
    },
    {
        number: '04',
        title: '완료한 숙제 체크하기',
        description: '콘텐츠를 완료할 때마다 해당 항목을 체크하면 캐릭터별 남은 숙제와 전체 진행 현황에 반영됩니다.',
    },
];

export default function ChecklistGuide() {
    return (
        <div className="w-full [&_p]:text-base [&_h1]:text-2xl">
            <h1 className="font-bold mb-3">숙제 시작하기</h1>
            <p>
                숙제 메뉴는 여러 캐릭터의 일일·주간 콘텐츠를 한곳에서 기록하고 완료 여부를 관리하는 로츠고의 핵심 기능입니다.
                처음에는 원정대와 캐릭터를 등록하고, 이후 게임에서 콘텐츠를 완료할 때마다 체크하는 방식으로 사용합니다.
            </p>

            <section className="mt-6 rounded-2xl border border-primary-200 bg-primary-50/70 p-5 dark:border-primary-500/20 dark:bg-primary-500/10">
                <h2 className="text-xl font-bold">처음 시작할 때 알아둘 점</h2>
                <p className="mt-2">
                    회원가입 때 대표 캐릭터를 확인했다면 숙제 페이지에서 해당 원정대의 캐릭터 정보를 바탕으로 초기 목록을 만들 수 있습니다.
                    초기 설정은 시작을 돕기 위한 기본값이므로, 캐릭터별 골드 지정과 콘텐츠 목록은 내 플레이 방식에 맞게 다시 확인하는 것이 좋습니다.
                </p>
            </section>

            <h2 className="mt-10 mb-4 text-xl font-bold">숙제 시작 순서</h2>
            <div className="space-y-3">
                {firstSteps.map((step) => (
                    <article key={step.number} className="flex gap-3 rounded-xl border border-default-200 bg-content1 p-4 dark:border-white/10">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                            {step.number}
                        </span>
                        <div>
                            <h3 className="text-lg font-bold">{step.title}</h3>
                            <p className="mt-1 text-base leading-7 text-default-600 dark:text-default-400">{step.description}</p>
                        </div>
                    </article>
                ))}
            </div>

            <h2 className="mt-10 mb-4 text-xl font-bold">캐릭터 추가하기</h2>
            <ol className="list-decimal space-y-2 pl-5 text-base">
                <li>숙제 페이지 상단의 <strong>캐릭터 추가</strong> 버튼을 누릅니다.</li>
                <li>추가하려는 캐릭터 이름 또는 같은 원정대의 대표 캐릭터 이름을 입력하고 조회합니다.</li>
                <li>조회된 원정대에서 추가할 캐릭터를 선택합니다.</li>
                <li>주간 골드를 받을 캐릭터라면 <strong>골드 지정</strong>을 선택합니다.</li>
                <li>추가를 완료하면 캐릭터 정보와 기본 주간 콘텐츠가 숙제 목록에 표시됩니다.</li>
            </ol>
            <p className="mt-3 text-default-600 dark:text-default-400">
                캐릭터 정보가 보이지 않으면 이름을 다시 확인하고, 로스트아크 점검 시간이나 API 응답 지연 여부도 확인해 주세요.
            </p>

            <h2 className="mt-10 mb-4 text-xl font-bold">골드 지정과 콘텐츠 확인</h2>
            <div className="space-y-3">
                <section className="rounded-xl border border-default-200 bg-content1 p-4 dark:border-white/10">
                    <h3 className="text-lg font-bold">골드 지정</h3>
                    <p className="mt-1">
                        골드 지정 캐릭터와 콘텐츠를 기준으로 주간 골드 현황이 계산됩니다. 실제로 골드를 받을 캐릭터가 바뀌었다면 캐릭터 설정에서 지정 상태를 함께 변경하세요.
                    </p>
                </section>
                <section className="rounded-xl border border-default-200 bg-content1 p-4 dark:border-white/10">
                    <h3 className="text-lg font-bold">주간 콘텐츠</h3>
                    <p className="mt-1">
                        캐릭터 하단의 주간 콘텐츠 영역에서 레이드와 관문별 진행 상태를 확인합니다. 기본으로 등록된 콘텐츠가 실제 플레이 목록과 다르면 추가·삭제 또는 골드 지정 상태를 수정할 수 있습니다.
                    </p>
                </section>
                <section className="rounded-xl border border-default-200 bg-content1 p-4 dark:border-white/10">
                    <h3 className="text-lg font-bold">일일·기타 콘텐츠</h3>
                    <p className="mt-1">
                        일일 콘텐츠와 기타 탭에서는 레이드 외에 매일 해야 하는 일이나 개인적으로 관리할 항목을 기록할 수 있습니다. 필요한 항목은 직접 추가해 나만의 체크리스트로 사용할 수 있습니다.
                    </p>
                </section>
            </div>

            <h2 className="mt-10 mb-4 text-xl font-bold">숙제 체크 방법</h2>
            <ul className="list-disc space-y-2 pl-5 text-base">
                <li>콘텐츠를 완료한 뒤 해당 콘텐츠의 체크 영역을 누르면 완료 상태가 저장됩니다.</li>
                <li>레이드의 관문은 각각 진행 상태를 관리할 수 있어 일부 관문만 완료한 경우에도 남은 관문을 확인할 수 있습니다.</li>
                <li>숙제 페이지 상단의 남은 숙제 현황에서 아직 완료하지 않은 콘텐츠만 모아볼 수 있습니다.</li>
                <li>캐릭터가 많다면 검색 필터를 사용해 특정 계정이나 캐릭터의 숙제만 좁혀서 확인할 수 있습니다.</li>
            </ul>

            <section className="mt-8 rounded-2xl border border-warning-200 bg-warning-50/70 p-5 dark:border-warning-500/20 dark:bg-warning-500/10">
                <h2 className="text-xl font-bold">사용할 때 주의할 점</h2>
                <ul className="mt-3 list-disc space-y-2 pl-5 text-base">
                    <li>캐릭터를 삭제하거나 골드 지정 상태를 변경하면 주간 골드 현황이 달라질 수 있으니 실제 플레이 계획을 확인한 뒤 수정하세요.</li>
                    <li>캐릭터 정보가 갱신되면 레벨과 클래스 정보가 최신화됩니다. 체크리스트 자체를 바꾸는 작업과는 구분해서 사용하세요.</li>
                    <li>콘텐츠를 완료한 뒤 바로 체크하는 습관을 들이면 다른 캐릭터의 숙제와 혼동하는 일을 줄일 수 있습니다.</li>
                    <li>일일·주간 초기화 이후에는 새로운 숙제 상태로 갱신되므로, 이전 주의 체크 상태와 비교할 때 초기화 시점을 확인하세요.</li>
                </ul>
            </section>

            <p className="mt-8">
                기본 설정을 마친 뒤에는 숙제 페이지를 오늘의 플레이 목록처럼 사용하면 됩니다.
                숙제의 세부 콘텐츠를 추가하거나 자동 체크, 골드, 큐브 같은 기능을 더 알아보려면 기능 가이드의 하위 메뉴를 이어서 확인해 보세요.
            </p>
        </div>
    );
}
