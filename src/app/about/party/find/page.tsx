import { Metadata } from "next";

export const metadata: Metadata = {
    title: '파티 찾기·참가 · 로츠고 가이드',
    description: '로츠고에서 공개 파티를 검색하거나 초대 링크로 파티에 참가하는 방법을 안내합니다.',
};

export default function PartyFindGuide() {
    return (
        <div className="w-full [&_p]:text-base [&_h1]:text-2xl">
            <h1 className="mb-3 font-bold">파티 찾기·참가</h1>
            <p>
                파티 찾기에서는 함께 레이드를 진행할 공개 파티를 검색하거나, 파티장에게 받은 초대 링크로 비공개 파티에 참가할 수 있습니다.
                참가한 파티는 파티 관리 화면에서 멤버별 숙제와 레이드 모집, 주간 일정을 함께 확인할 수 있습니다.
            </p>

            <h2 className="mt-10 mb-4 text-xl font-bold">공개 파티 검색하기</h2>
            <p>
                공개 파티는 파티 찾기 목록에 표시되므로 파티명이나 파티장 이름으로 원하는 파티를 찾아 참가할 수 있습니다.
                검색 결과 카드에서 파티명, 파티장, 참여 인원과 평균 레벨, 공개 여부와 참가 상태를 확인한 뒤 참가할 파티를 선택하세요.
            </p>
            <figure className="mt-6 overflow-hidden rounded-2xl border border-default-200 bg-default-50 p-2 dark:border-white/10 dark:bg-white/[0.03]">
                <img src="/about/party-search-result.png" alt="공개 파티 검색 결과 카드에 파티명과 평균 레벨, 참여 인원이 표시된 화면" className="mx-auto h-auto max-h-[520px] rounded-xl object-contain" />
                <figcaption className="px-2 pb-1 pt-2 text-sm text-default-500">공개 파티 검색 결과에서 파티 정보와 참가 상태 확인</figcaption>
            </figure>
            <ol className="mt-4 list-decimal space-y-2 pl-5 text-base">
                <li>파티 메뉴의 검색창에 파티명 또는 파티장 이름을 입력합니다.</li>
                <li><strong>검색</strong>을 눌러 조건에 맞는 공개 파티 목록을 확인합니다.</li>
                <li>파티명, 평균 레벨, 참여 인원과 공개 상태를 비교해 원하는 파티를 선택합니다.</li>
                <li>참가 가능한 파티에서 참가 버튼을 눌러 파티에 들어갑니다.</li>
            </ol>

            <h2 className="mt-10 mb-4 text-xl font-bold">초대 링크로 참가하기</h2>
            <p>
                파티장에게 초대 링크를 받은 경우 공개 파티 목록을 검색하지 않고 바로 참가할 수 있습니다.
                비공개 파티이거나 검색 결과에 노출되지 않는 파티에 참여할 때 사용하는 방법입니다.
            </p>
            <figure className="mt-6 overflow-hidden rounded-2xl border border-default-200 bg-default-50 p-2 dark:border-white/10 dark:bg-white/[0.03]">
                <img src="/about/party-join-link.png" alt="초대 링크를 입력해 파티에 참가하는 모달 화면" className="mx-auto h-auto max-h-[560px] rounded-xl object-contain" />
                <figcaption className="px-2 pb-1 pt-2 text-sm text-default-500">파티장에게 받은 초대 링크를 입력하는 참가 화면</figcaption>
            </figure>
            <ol className="mt-4 list-decimal space-y-2 pl-5 text-base">
                <li>파티 메뉴에서 <strong>초대 링크 참가</strong>를 선택합니다.</li>
                <li>파티장에게 받은 초대 링크를 입력합니다.</li>
                <li>비밀번호가 설정된 파티라면 안내되는 비밀번호도 입력합니다.</li>
                <li>파티 정보를 확인한 뒤 <strong>참가하기</strong>를 눌러 참여를 완료합니다.</li>
            </ol>

            <h2 className="mt-10 mb-4 text-xl font-bold">참가 후 확인할 내용</h2>
            <div className="space-y-3">
                <section className="rounded-xl border border-default-200 bg-content1 p-4 dark:border-white/10">
                    <h3 className="text-lg font-bold">내 캐릭터 등록</h3>
                    <p className="mt-1">파티에 참가한 뒤 내 원정대 캐릭터가 올바르게 표시되는지 확인합니다. 캐릭터 정보가 없거나 오래된 경우 <strong>계정 및 설정의 원정대 정보 최신화</strong>에서 원정대 정보를 다시 가져온 뒤 확인하세요.</p>
                </section>
                <section className="rounded-xl border border-default-200 bg-content1 p-4 dark:border-white/10">
                    <h3 className="text-lg font-bold">숙제와 일정 확인</h3>
                    <p className="mt-1">숙제 탭에서 멤버별 진행 현황을 확인하고, 파티장이 공유한 레이드 모집과 일정표에서 함께 진행할 콘텐츠와 시간을 확인합니다.</p>
                </section>
            </div>

            <section className="mt-8 rounded-2xl border border-warning-200 bg-warning-50/70 p-5 dark:border-warning-500/20 dark:bg-warning-500/10">
                <h2 className="text-xl font-bold">주의사항</h2>
                <ul className="mt-3 list-disc space-y-2 pl-5 text-base">
                    <li>파티 찾기와 초대 링크 참가 기능은 로그인 후 이용할 수 있습니다.</li>
                    <li>초대 링크가 만료되었거나 파티가 삭제된 경우 참가할 수 없습니다. 파티장에게 새 링크를 요청하세요.</li>
                    <li>비밀번호가 있는 파티는 링크와 비밀번호가 모두 일치해야 참가할 수 있습니다.</li>
                    <li>파티에 참가한 뒤에는 해당 파티의 숙제와 일정이 실제 진행 상황과 맞는지 멤버들과 함께 확인하세요.</li>
                </ul>
            </section>
        </div>
    );
}
