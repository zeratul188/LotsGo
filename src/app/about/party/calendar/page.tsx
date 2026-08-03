import { Metadata } from "next";

export const metadata: Metadata = {
    title: '주간 일정표 · 로츠고 가이드',
    description: '로츠고 파티의 주간 일정표에서 요일별 레이드와 참여 캐릭터를 기록하고 여러 일정표를 관리하는 방법을 안내합니다.',
};

export default function PartyCalendarGuide() {
    return (
        <div className="w-full [&_p]:text-base [&_h1]:text-2xl">
            <h1 className="mb-3 font-bold">주간 일정표</h1>
            <p>
                주간 일정표는 고정 파티나 깐부처럼 함께 레이드를 진행하는 멤버들이 요일별 레이드 약속과 참여 캐릭터를 미리 기록하는 기능입니다.
                매주 반복되는 일정을 한곳에서 확인할 수 있어, 누구와 어떤 캐릭터로 어느 레이드를 갈지 정리하고 약속을 공유하기 좋습니다.
            </p>

            <figure className="mt-6 overflow-hidden rounded-2xl border border-default-200 bg-default-50 p-2 dark:border-white/10 dark:bg-white/[0.03]">
                <img src="/about/party-weekly-calendar.png" alt="요일별 레이드와 멤버별 참여 캐릭터를 기록한 주간 일정표 화면" className="h-auto w-full rounded-xl object-contain" />
                <figcaption className="px-2 pb-1 pt-2 text-sm text-default-500">요일별 레이드와 멤버별 참여 캐릭터를 관리하는 주간 일정표</figcaption>
            </figure>

            <h2 className="mt-10 mb-4 text-xl font-bold">주간 일정표 시작하기</h2>
            <ol className="list-decimal space-y-2 pl-5 text-base">
                <li>파티 화면에서 <strong>일정표</strong> 탭을 엽니다.</li>
                <li>일정표가 없다면 <strong>일정표 추가</strong>를 눌러 이름을 정하고 새 일정표를 만듭니다.</li>
                <li><strong>인원 추가</strong>로 일정에 참여할 파티 멤버를 등록합니다.</li>
                <li><strong>일정 추가</strong>를 눌러 레이드와 진행 요일을 설정하고, 각 멤버가 사용할 캐릭터를 선택합니다.</li>
                <li>저장된 일정표에서 요일별 레이드와 참여 캐릭터를 확인하며 약속을 조율합니다.</li>
            </ol>

            <h2 className="mt-10 mb-4 text-xl font-bold">일정표 여러 개 만들기</h2>
            <p>
                하나의 파티에서 일정표를 여러 개 만들 수 있습니다. 고정 파티의 주중 레이드 약속과 주말 약속을 나누거나,
                참여 멤버와 레이드 종류가 다른 일정들을 별도의 표로 관리해도 됩니다.
                상단의 일정표 선택 메뉴에서 확인할 표를 바꾸고, 필요하지 않은 일정표는 일정표 삭제로 정리할 수 있습니다.
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <section className="rounded-xl border border-primary-200 bg-primary-50/60 p-4 dark:border-primary-500/20 dark:bg-primary-500/10">
                    <h3 className="text-lg font-bold">고정 파티</h3>
                    <p className="mt-1">주마다 같은 멤버가 진행하는 레이드 약속을 기록합니다.</p>
                </section>
                <section className="rounded-xl border border-secondary-200 bg-secondary-50/60 p-4 dark:border-secondary-500/20 dark:bg-secondary-500/10">
                    <h3 className="text-lg font-bold">요일별 약속</h3>
                    <p className="mt-1">수요일부터 화요일까지 반복되는 주간 레이드 일정을 정리합니다.</p>
                </section>
                <section className="rounded-xl border border-success-200 bg-success-50/60 p-4 dark:border-success-500/20 dark:bg-success-500/10">
                    <h3 className="text-lg font-bold">멤버별 캐릭터</h3>
                    <p className="mt-1">같은 멤버가 어떤 캐릭터로 참여할지 미리 지정합니다.</p>
                </section>
            </div>

            <h2 className="mt-10 mb-4 text-xl font-bold">요일별 일정과 참여 캐릭터 관리</h2>
            <div className="space-y-3">
                <section className="rounded-xl border border-default-200 bg-content1 p-4 dark:border-white/10">
                    <h3 className="text-lg font-bold">레이드 일정 추가</h3>
                    <p className="mt-1">일정 추가에서 레이드 콘텐츠와 진행할 요일을 선택합니다. 한 요일에 여러 레이드를 등록할 수 있으므로, 실제 약속 순서나 함께 진행할 레이드를 모두 기록할 수 있습니다.</p>
                </section>
                <section className="rounded-xl border border-default-200 bg-content1 p-4 dark:border-white/10">
                    <h3 className="text-lg font-bold">인원 추가</h3>
                    <p className="mt-1">일정표에 표시할 파티 멤버를 선택합니다. 멤버를 추가하면 해당 멤버의 캐릭터가 일정표의 열에 표시되고, 각 요일의 빈 칸에서 참여 캐릭터를 지정할 수 있습니다.</p>
                </section>
                <section className="rounded-xl border border-default-200 bg-content1 p-4 dark:border-white/10">
                    <h3 className="text-lg font-bold">수정과 삭제</h3>
                    <p className="mt-1">각 요일의 레이드 일정은 수정·삭제할 수 있으며, 멤버 열의 삭제 버튼으로 일정표에서 특정 인원을 제외할 수 있습니다. 약속이 바뀌면 표를 바로 수정해 최신 상태로 유지하세요.</p>
                </section>
            </div>

            <h2 className="mt-10 mb-4 text-xl font-bold">추천 사용 순서</h2>
            <ol className="list-decimal space-y-2 pl-5 text-base">
                <li>고정 파티나 깐부 멤버를 일정표에 추가합니다.</li>
                <li>레이드를 진행할 요일을 정하고 콘텐츠를 등록합니다.</li>
                <li>멤버별 참여 캐릭터를 선택합니다.</li>
                <li>모든 멤버의 일정이 겹치지 않는지 확인하고 약속을 확정합니다.</li>
                <li>캐릭터나 시간이 변경되면 일정표를 수정해 파티원과 최신 내용을 공유합니다.</li>
            </ol>

            <section className="mt-8 rounded-2xl border border-warning-200 bg-warning-50/70 p-5 dark:border-warning-500/20 dark:bg-warning-500/10">
                <h2 className="text-xl font-bold">주의사항</h2>
                <ul className="mt-3 list-disc space-y-2 pl-5 text-base">
                    <li>주간 일정표는 레이드 약속을 기록하는 표이므로 실제 게임 입장이나 파티 자동 매칭을 대신하지 않습니다.</li>
                    <li>원정대 정보가 최신 상태가 아니면 참여 캐릭터 목록이 실제와 다를 수 있으므로 계정 및 설정에서 원정대 정보를 최신화하세요.</li>
                    <li>일정표를 여러 개 만들었다면 현재 선택된 일정표가 어떤 약속을 담고 있는지 확인한 뒤 내용을 수정하세요.</li>
                    <li>요일과 캐릭터를 변경한 뒤에는 모든 참여 멤버와 약속 시간이 맞는지 다시 확인하세요.</li>
                </ul>
            </section>
        </div>
    );
}
