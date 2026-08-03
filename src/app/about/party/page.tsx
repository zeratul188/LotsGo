import { Metadata } from "next";

export const metadata: Metadata = {
    title: '파티 시작하기 · 로츠고 가이드',
    description: '로츠고 파티 관리에서 파티를 만들고 멤버와 레이드 숙제 및 일정을 공유하는 방법을 안내합니다.',
};

export default function PartyGuide() {
    return (
        <div className="w-full [&_p]:text-base [&_h1]:text-2xl">
            <h1 className="mb-3 font-bold">파티 시작하기</h1>
            <p>
                파티 관리는 함께 레이드를 진행하는 멤버를 한곳에 모아 숙제 진행 상황과 골드, 레이드 모집, 일정을 공유하는 기능입니다.
                파티를 만든 뒤 초대 링크를 전달하면 멤버가 참여할 수 있고, 파티 화면에서 멤버별 캐릭터와 진행 상태를 함께 확인할 수 있습니다.
            </p>

            <h2 className="mt-10 mb-4 text-xl font-bold">파티 만들기</h2>
            <figure className="mb-6 overflow-hidden rounded-2xl border border-default-200 bg-default-50 p-2 dark:border-white/10 dark:bg-white/[0.03]">
                <img src="/about/party-create.png" alt="파티명과 공개 범위, 입장 방식을 설정하는 새 파티 만들기 화면" className="mx-auto h-auto max-h-[640px] rounded-xl object-contain" />
                <figcaption className="px-2 pb-1 pt-2 text-sm text-default-500">파티명과 공개 범위, 입장 방식을 설정하는 새 파티 만들기 화면</figcaption>
            </figure>
            <ol className="list-decimal space-y-2 pl-5 text-base">
                <li>상단 메뉴에서 <strong>파티</strong>를 열고 공개 파티 목록의 <strong>파티 만들기</strong>를 선택합니다.</li>
                <li>파티명을 입력합니다. 함께 진행할 레이드나 목적이 드러나는 이름을 사용하면 멤버가 쉽게 찾을 수 있습니다.</li>
                <li><strong>공개 파티</strong> 또는 <strong>비공개 파티</strong>를 선택합니다.</li>
                <li>입장 방식을 정합니다. 누구나 참가하도록 하거나, 비밀번호를 설정해 초대받은 멤버만 참여하도록 만들 수 있습니다.</li>
                <li>입력한 내용을 확인하고 <strong>파티 만들기</strong>를 누르면 파티가 생성됩니다.</li>
            </ol>

            <h2 className="mt-10 mb-4 text-xl font-bold">멤버 초대하기</h2>
            <div className="space-y-3">
                <section className="rounded-xl border border-default-200 bg-content1 p-4 dark:border-white/10">
                    <h3 className="text-lg font-bold">초대 링크 공유</h3>
                    <p className="mt-1">파티가 생성되면 파티 설정에서 초대 링크를 확인하고 복사할 수 있습니다. 링크를 함께 플레이할 멤버에게 전달하면 멤버가 <strong>초대 링크 참가</strong>에서 링크를 입력해 파티에 들어올 수 있습니다.</p>
                </section>
                <section className="rounded-xl border border-default-200 bg-content1 p-4 dark:border-white/10">
                    <h3 className="text-lg font-bold">공개·비공개 파티</h3>
                    <p className="mt-1">공개 파티는 파티 찾기 목록에 노출되어 다른 사용자가 확인할 수 있습니다. 비공개 파티는 초대 링크와 비밀번호를 아는 멤버만 참여할 수 있으므로 고정 멤버와 진행할 때 활용하세요.</p>
                </section>
            </div>

            <h2 className="mt-10 mb-4 text-xl font-bold">파티 화면에서 할 수 있는 일</h2>
            <div className="grid gap-3 sm:grid-cols-2">
                <section className="rounded-xl border border-primary-200 bg-primary-50/60 p-4 dark:border-primary-500/20 dark:bg-primary-500/10">
                    <h3 className="text-lg font-bold">숙제</h3>
                    <p className="mt-1">파티 멤버와 원정대 캐릭터를 확인하고, 멤버별 일일·주간 콘텐츠의 남은 수량과 완료 상태를 함께 확인합니다. 캐릭터명으로 검색해 원하는 멤버를 빠르게 찾을 수도 있습니다.</p>
                </section>
                <section className="rounded-xl border border-secondary-200 bg-secondary-50/60 p-4 dark:border-secondary-500/20 dark:bg-secondary-500/10">
                    <h3 className="text-lg font-bold">파티 모집</h3>
                    <p className="mt-1">레이드와 관문, 난이도에 맞춰 모집 현황을 관리합니다. 함께 진행할 파티 구성을 정리하고 참여할 멤버를 확인할 수 있습니다.</p>
                </section>
                <section className="rounded-xl border border-success-200 bg-success-50/60 p-4 dark:border-success-500/20 dark:bg-success-500/10">
                    <h3 className="text-lg font-bold">일정표</h3>
                    <p className="mt-1">주간 레이드 일정을 일정표에 표시하고, 멤버의 캐릭터 일정을 공유합니다. 언제 어떤 레이드를 진행할지 파티원과 한눈에 맞춰볼 수 있습니다.</p>
                </section>
                <section className="rounded-xl border border-warning-200 bg-warning-50/60 p-4 dark:border-warning-500/20 dark:bg-warning-500/10">
                    <h3 className="text-lg font-bold">설정</h3>
                    <p className="mt-1">파티명, 파티장, 초대 링크, 비밀번호와 공개 여부를 관리합니다. 필요하면 초대 링크를 재발급하거나 파티 운영 권한을 변경할 수 있습니다.</p>
                </section>
            </div>

            <h2 className="mt-10 mb-4 text-xl font-bold">추천 사용 순서</h2>
            <ol className="list-decimal space-y-2 pl-5 text-base">
                <li>파티장이 파티를 만들고 공개 범위와 입장 방식을 설정합니다.</li>
                <li>초대 링크를 멤버에게 공유하고, 멤버는 링크로 파티에 참가합니다.</li>
                <li>멤버가 자신의 원정대 캐릭터를 불러온 뒤 숙제 화면에서 진행 상황을 확인합니다.</li>
                <li>파티 모집에서 레이드 구성을 정하고 일정표에서 진행 시간을 공유합니다.</li>
                <li>파티 운영에 변경이 생기면 설정에서 파티 정보와 접근 권한을 관리합니다.</li>
            </ol>

            <section className="mt-8 rounded-2xl border border-warning-200 bg-warning-50/70 p-5 dark:border-warning-500/20 dark:bg-warning-500/10">
                <h2 className="text-xl font-bold">주의사항</h2>
                <ul className="mt-3 list-disc space-y-2 pl-5 text-base">
                    <li>파티 생성과 참가 기능은 로그인 후 이용할 수 있습니다.</li>
                    <li>초대 링크나 비밀번호를 공개 채널에 공유하면 원하지 않는 사용자가 파티에 참여할 수 있으니 주의하세요.</li>
                    <li>숙제와 골드 정보는 멤버가 로츠고에 저장한 캐릭터 및 진행 상태를 기준으로 표시됩니다.</li>
                    <li>파티장만 파티명, 파티장, 초대 링크와 공개 설정을 변경할 수 있는 항목이 있으므로 운영 권한을 확인하세요.</li>
                </ul>
            </section>
        </div>
    );
}
