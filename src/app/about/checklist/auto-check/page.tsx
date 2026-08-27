import { Metadata } from "next";

export const metadata: Metadata = {
    title: '레이드 자동 체크 · 로츠고 가이드',
    description: '로츠고 레이드 자동 체크 기능의 화면 공유 설정과 사용 방법, 인식 조건 및 주의사항을 안내합니다.',
};

export default function RaidAutoCheckGuide() {
    return (
        <div className="w-full [&_p]:text-base [&_h1]:text-2xl">
            <h1 className="font-bold mb-3">레이드 자동 체크</h1>
            <p>
                레이드 자동 체크는 게임 화면을 분석해 현재 레이드와 관문 진행도를 확인하고, 레이드가 완료되면 로츠고의 체크 상태를 자동으로 갱신하는 기능입니다.
                화면 공유 중인 캐릭터를 기준으로 작동하므로 먼저 플레이할 캐릭터와 공유할 게임 화면을 정확하게 선택해야 합니다.
            </p>

            <figure className="mt-6 overflow-hidden rounded-2xl border border-default-200 bg-default-50 p-2 dark:border-white/10 dark:bg-white/[0.03]">
                <img src="/about/checklist-auto-check-guide.png" alt="레이드 자동 체크 설정과 사용 방법 안내 화면" className="h-auto w-full rounded-xl object-contain" />
                <figcaption className="px-2 pb-1 pt-2 text-sm text-default-500">레이드 자동 체크 창에서 확인하는 사용 방법과 주의사항</figcaption>
            </figure>

            <h2 className="mt-10 mb-4 text-xl font-bold">사용 전 준비</h2>
            <ul className="list-disc space-y-2 pl-5 text-base">
                <li>PC의 Chrome 또는 Edge 브라우저에서 사용하세요.</li>
                <li>로스트아크를 실행하고, 자동 체크할 캐릭터로 게임에 접속합니다.</li>
                <li>레이드명, 관문 진행도, 파티원 체력바가 게임 화면에 표시되는 상태인지 확인합니다.</li>
                <li>게임 해상도와 화면 비율은 레이드에 입장했을 때와 동일하게 유지하세요.</li>
            </ul>

            <h2 className="mt-10 mb-4 text-xl font-bold">화면 공유 시작하기</h2>
            <ol className="list-decimal space-y-2 pl-5 text-base">
                <li>숙제 페이지에서 <strong>자동 체크 기능 켜기</strong>를 눌러 자동 체크 창을 엽니다.</li>
                <li>플레이할 캐릭터 목록에서 현재 게임으로 플레이할 캐릭터를 선택합니다.</li>
                <li><strong>화면 공유 시작</strong>을 누르면 브라우저의 화면 공유 선택 창이 열립니다.</li>
                <li>Chrome 또는 Edge의 공유 목록에서 로스트아크 게임 창을 선택하고 공유를 시작합니다.</li>
                <li>공유가 시작되면 자동 체크가 화면을 분석하고, 선택한 캐릭터 카드의 상태를 갱신합니다.</li>
            </ol>

            <figure className="mt-6 overflow-hidden rounded-2xl border border-default-200 bg-default-50 p-2 dark:border-white/10 dark:bg-white/[0.03]">
                <img src="/about/checklist-auto-check-character-switch.png" alt="캐릭터 카드에서 자동 체크 대상 캐릭터를 전환하는 아이콘" className="mx-auto h-auto max-h-[260px] rounded-xl object-contain" />
                <figcaption className="px-2 pb-1 pt-2 text-sm text-default-500">화면 공유 중 캐릭터 카드의 전환 아이콘으로 자동 체크 대상 변경</figcaption>
            </figure>
            <p className="mt-4">
                레이드 중 다른 캐릭터로 전환할 때는 해당 캐릭터 카드의 <strong>전환 아이콘</strong>을 누르세요. 화면 공유를 다시 시작하지 않아도 자동 체크 대상 캐릭터를 바꿀 수 있습니다.
                단, 실제 게임에서도 전환한 캐릭터의 화면을 공유하고 있는지 확인해야 합니다.
            </p>
            <p className="mt-3">
                게임에서 강제 21:9 모드를 사용하는 경우 자동 체크 창의 <strong>강제 21:9 모드 사용</strong>을 체크하세요. 강제 21:9 영역이 적용된 화면 비율에 맞춰 인식할 수 있습니다.
            </p>

            <figure className="mt-6 overflow-hidden rounded-2xl border border-default-200 bg-default-50 p-2 dark:border-white/10 dark:bg-white/[0.03]">
                <img src="/about/checklist-auto-check-share.png" alt="브라우저 화면 공유 선택 창에서 로스트아크를 선택하는 화면" className="h-auto w-full rounded-xl object-contain" />
                <figcaption className="px-2 pb-1 pt-2 text-sm text-default-500">화면 공유 선택 창에서 로스트아크 게임 화면 선택</figcaption>
            </figure>

            <h2 className="mt-10 mb-4 text-xl font-bold">레이드 안에서 자동 체크하기</h2>
            <ol className="list-decimal space-y-2 pl-5 text-base">
                <li>레이드에 입장한 뒤 레이드명과 관문 진행도가 화면 왼쪽 상단에 표시되는지 확인합니다.</li>
                <li>관문 진행도 영역은 펼쳐진 상태로 유지합니다. 진행도가 접혀 있으면 완료 관문을 인식하지 못할 수 있습니다.</li>
                <li>레이드를 플레이하면 자동 체크가 완료 문구와 관문 진행도 변화를 분석합니다.</li>
                <li>레이드가 완료된 뒤 숙제 카드에서 해당 관문이 체크되었는지 직접 확인합니다.</li>
                <li>레이드나 캐릭터를 바꿀 때는 자동 체크 대상 캐릭터와 화면 공유 대상을 함께 변경합니다.</li>
            </ol>

            <figure className="mt-6 overflow-hidden rounded-2xl border border-default-200 bg-default-50 p-2 dark:border-white/10 dark:bg-white/[0.03]">
                <img src="/about/checklist-auto-check-running.png" alt="레이드 자동 체크가 실행 중인 숙제 페이지 화면" className="h-auto w-full rounded-xl object-contain" />
                <figcaption className="px-2 pb-1 pt-2 text-sm text-default-500">화면 공유 중 자동 체크가 작동하는 상태</figcaption>
            </figure>
            <figure className="mt-6 overflow-hidden rounded-2xl border border-default-200 bg-default-50 p-2 dark:border-white/10 dark:bg-white/[0.03]">
                <img src="/about/checklist-auto-check-active.png" alt="자동 체크 작동 중 상태에서 레이드에 진입한 화면" className="h-auto w-full rounded-xl object-contain" />
                <figcaption className="px-2 pb-1 pt-2 text-sm text-default-500">화면 공유 중 자동 체크 작동을 확인한 뒤 레이드에 진입한 상태</figcaption>
            </figure>

            <h2 className="mt-10 mb-4 text-xl font-bold">인식이 잘 되도록 화면 유지하기</h2>
            <div className="space-y-3">
                <section className="rounded-xl border border-default-200 bg-content1 p-4 dark:border-white/10">
                    <h3 className="text-lg font-bold">레이드명과 관문 진행도</h3>
                    <p className="mt-1">레이드명과 관문 진행도가 보이는 화면을 유지하세요. 레이드명 아래의 화살표를 눌러 관문 진행도를 접으면 완료 표시를 읽지 못해 자동 체크가 작동하지 않을 수 있습니다.</p>
                </section>
                <section className="rounded-xl border border-default-200 bg-content1 p-4 dark:border-white/10">
                    <h3 className="text-lg font-bold">파티원 체력바와 완료 문구</h3>
                    <p className="mt-1">파티원 체력바, 레이드명, 관문 진행도, 레이드 완료 문구가 알림·채팅·오버레이에 가려지지 않도록 합니다. 브라우저나 다른 창이 게임 화면을 덮어도 인식이 방해될 수 있습니다.</p>
                </section>
                <section className="rounded-xl border border-default-200 bg-content1 p-4 dark:border-white/10">
                    <h3 className="text-lg font-bold">해상도와 화면 비율</h3>
                    <p className="mt-1">게임 해상도와 비율은 플레이할 때와 동일하게 유지하세요. 해상도 변경이나 강제 21:9 설정, 컷신·로딩 화면에서는 인식 속도가 느려지거나 일부 관문이 누락될 수 있습니다.</p>
                </section>
            </div>

            <section className="mt-8 rounded-2xl border border-warning-200 bg-warning-50/70 p-5 dark:border-warning-500/20 dark:bg-warning-500/10">
                <h2 className="text-xl font-bold">주의사항</h2>
                <ul className="mt-3 list-disc space-y-2 pl-5 text-base">
                    <li>자동 체크는 화면을 읽어 추정하는 기능이므로 모든 상황에서 정확하게 작동하지 않을 수 있습니다.</li>
                    <li>인식 결과와 숙제 체크 상태를 직접 확인하고, 누락된 관문은 숙제 카드에서 수동으로 체크하세요.</li>
                    <li>브라우저 최소화, 게임 창 이동, 화면 공유 중단, 다른 창으로 가리기 등의 상황에서는 분석이 멈추거나 인식이 늦어질 수 있습니다.</li>
                    <li>화면은 서버에 전송하거나 저장하지 않고 현재 브라우저에서만 분석합니다. 화면 공유를 종료하면 자동 체크도 함께 중지됩니다.</li>
                </ul>
            </section>
        </div>
    );
}
