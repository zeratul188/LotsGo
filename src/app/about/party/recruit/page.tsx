import { Metadata } from "next";

export const metadata: Metadata = {
    title: '파티 모집 · 로츠고 가이드',
    description: '로츠고 파티 모집에서 레이드 약속을 만들고 공대원 배치, 공대장, 파티 시너지를 관리하는 방법을 안내합니다.',
};

export default function PartyRecruitGuide() {
    return (
        <div className="w-full [&_p]:text-base [&_h1]:text-2xl">
            <h1 className="mb-3 font-bold">파티 모집</h1>
            <p>
                파티 모집은 파티에 참여한 공대원과 함께 진행할 레이드 약속을 만들고, 파티별 구성과 시너지를 관리하는 기능입니다.
                레이드 날짜와 콘텐츠, 관문별 난이도를 미리 정해두면 공대원들이 어떤 캐릭터로 어느 레이드에 참여할지 편리하게 조율할 수 있습니다.
            </p>

            <h2 className="mt-10 mb-4 text-xl font-bold">파티 모집 만들기</h2>
            <p>
                파티 화면에서 파티 모집을 추가하면 레이드 일정과 관문 난이도를 설정하는 모달이 열립니다.
                파티명과 진행 날짜를 입력하고 콘텐츠를 선택한 뒤 관문마다 실제로 진행할 난이도를 지정하세요.
            </p>
            <figure className="mt-6 overflow-hidden rounded-2xl border border-default-200 bg-default-50 p-2 dark:border-white/10 dark:bg-white/[0.03]">
                <img src="/about/party-recruit-create.png" alt="파티명과 일정, 레이드 콘텐츠, 관문별 난이도를 설정하는 파티 모집 생성 화면" className="mx-auto h-auto max-h-[720px] rounded-xl object-contain" />
                <figcaption className="px-2 pb-1 pt-2 text-sm text-default-500">레이드 일정과 콘텐츠, 관문별 난이도를 설정하는 파티 모집 화면</figcaption>
            </figure>
            <ol className="mt-4 list-decimal space-y-2 pl-5 text-base">
                <li>파티 모집에서 <strong>파티 추가</strong>를 선택합니다.</li>
                <li>모집 제목과 레이드를 진행할 날짜를 입력합니다.</li>
                <li>진행할 콘텐츠를 선택합니다.</li>
                <li>1관문부터 각 관문별로 매칭·노말·하드·나이트메어 등 진행할 난이도를 선택합니다.</li>
                <li>설정을 확인하고 <strong>파티 만들기</strong>를 눌러 모집을 생성합니다.</li>
            </ol>

            <h2 className="mt-10 mb-4 text-xl font-bold">생성된 파티 모집 관리</h2>
            <p>
                생성한 모집 카드는 레이드명, 진행 날짜, 콘텐츠와 관문 난이도를 보여줍니다.
                파티 탭을 전환해 여러 파티를 구분하고, 카드의 설정 버튼에서 모집 정보를 수정하거나 공대원 구성을 관리할 수 있습니다.
            </p>
            <figure className="mt-6 overflow-hidden rounded-2xl border border-default-200 bg-default-50 p-2 dark:border-white/10 dark:bg-white/[0.03]">
                <img src="/about/party-recruit-card.png" alt="공대원 배치와 파티 시너지가 표시된 레이드 파티 모집 카드" className="mx-auto h-auto max-h-[820px] rounded-xl object-contain" />
                <figcaption className="px-2 pb-1 pt-2 text-sm text-default-500">공대원 배치와 파티 시너지를 확인하는 레이드 모집 카드</figcaption>
            </figure>

            <h2 className="mt-10 mb-4 text-xl font-bold">공대원 위치와 파티 구성 변경</h2>
            <div className="space-y-3">
                <section className="rounded-xl border border-default-200 bg-content1 p-4 dark:border-white/10">
                    <h3 className="text-lg font-bold">파티별 위치 배치</h3>
                    <p className="mt-1">모집 카드의 1파티·2파티 탭을 전환해 공대원을 원하는 파티에 배치합니다. 빈 모집 칸을 선택해 캐릭터를 추가하고, 이미 참여한 캐릭터를 다른 파티로 옮겨 공대 구성을 정리할 수 있습니다.</p>
                </section>
                <section className="rounded-xl border border-default-200 bg-content1 p-4 dark:border-white/10">
                    <h3 className="text-lg font-bold">공대장 변경</h3>
                    <p className="mt-1">파티 카드에서 공대장으로 지정할 공대원의 캐릭터를 선택해 리더를 변경합니다. 공대장 표시를 확인한 뒤 진행을 담당할 캐릭터가 올바른 위치에 있는지 확인하세요.</p>
                </section>
                <section className="rounded-xl border border-default-200 bg-content1 p-4 dark:border-white/10">
                    <h3 className="text-lg font-bold">공대원 역할과 시너지</h3>
                    <p className="mt-1">각 캐릭터 카드에는 방어력 감소, 정화, 사멸 피해 증가, 피해 증가처럼 파티에 제공하는 시너지가 표시됩니다. 파티별 시너지 영역에서 현재 구성으로 적용되는 효과를 확인하고, 부족한 시너지가 있다면 캐릭터 위치나 참여 캐릭터를 조정하세요.</p>
                </section>
            </div>

            <h2 className="mt-10 mb-4 text-xl font-bold">레이드 약속과 일정 연동</h2>
            <p>
                파티 모집을 만든 목적은 공대원끼리 레이드 약속을 쉽게 잡고, 약속한 레이드를 파티 화면에서 계속 확인하기 위해서입니다.
                모집을 생성할 때 입력한 날짜와 레이드 정보는 파티 일정에 추가되어 일정 관리에서도 확인할 수 있습니다.
                따라서 모집 카드에서 공대원 구성과 시너지를 정리한 뒤 일정표에서 약속 시간을 다시 확인하면 됩니다.
            </p>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-base">
                <li>모집 생성 시 레이드 날짜와 콘텐츠를 정확하게 입력합니다.</li>
                <li>공대원들이 참여 캐릭터를 정하면 파티별 위치와 공대장을 배치합니다.</li>
                <li>파티 시너지 영역에서 역할이 겹치거나 부족하지 않은지 확인합니다.</li>
                <li>추가된 일정에서 공대원과 약속 시간을 확인하고 레이드 진행에 활용합니다.</li>
            </ul>

            <section className="mt-8 rounded-2xl border border-warning-200 bg-warning-50/70 p-5 dark:border-warning-500/20 dark:bg-warning-500/10">
                <h2 className="text-xl font-bold">주의사항</h2>
                <ul className="mt-3 list-disc space-y-2 pl-5 text-base">
                    <li>관문별 난이도는 모집 생성 후 실제 진행할 레이드와 일치하도록 설정하세요.</li>
                    <li>공대원 위치를 변경한 뒤에는 파티별 인원과 시너지 표시가 바뀌었는지 확인하세요.</li>
                    <li>캐릭터를 변경하거나 참여를 취소하면 기존 파티 구성과 시너지를 다시 점검해야 합니다.</li>
                    <li>일정에 추가된 레이드 약속의 날짜와 시간이 실제 약속과 다르지 않은지 공대원에게 공유하기 전에 확인하세요.</li>
                </ul>
            </section>
        </div>
    );
}
