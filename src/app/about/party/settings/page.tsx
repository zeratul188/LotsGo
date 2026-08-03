import { Metadata } from "next";

export const metadata: Metadata = {
    title: '파티 설정 · 로츠고 가이드',
    description: '로츠고 파티 설정에서 파티 정보와 접근 권한을 관리하고 파티장 권한을 위임하는 방법을 안내합니다.',
};

export default function PartySettingsGuide() {
    return (
        <div className="w-full [&_p]:text-base [&_h1]:text-2xl">
            <h1 className="mb-3 font-bold">파티 설정</h1>
            <p>
                파티 설정에서는 파티명, 파티장, 초대 링크, 비밀번호와 공개 여부를 관리합니다.
                대부분의 설정은 파티장만 수정할 수 있으며, 일반 멤버는 현재 설정을 확인하거나 파티를 탈퇴할 수 있습니다.
            </p>

            <h2 className="mt-10 mb-4 text-xl font-bold">기본 설정</h2>
            <div className="space-y-3">
                <section className="rounded-xl border border-default-200 bg-content1 p-4 dark:border-white/10">
                    <h3 className="text-lg font-bold">파티명 변경</h3>
                    <p className="mt-1">파티의 목적이나 진행 레이드가 바뀌었을 때 파티명을 변경합니다. 파티 찾기에 노출되는 공개 파티라면 멤버가 쉽게 알아볼 수 있는 이름을 사용하세요.</p>
                </section>
                <section className="rounded-xl border border-default-200 bg-content1 p-4 dark:border-white/10">
                    <h3 className="text-lg font-bold">초대 링크 관리</h3>
                    <p className="mt-1">파티장은 초대 링크를 복사해 멤버에게 전달하거나 링크를 재발급할 수 있습니다. 링크를 재발급하면 이전 링크로는 참가할 수 없으므로, 새 링크를 필요한 멤버에게 다시 공유해야 합니다.</p>
                </section>
                <section className="rounded-xl border border-default-200 bg-content1 p-4 dark:border-white/10">
                    <h3 className="text-lg font-bold">비밀번호와 공개 여부</h3>
                    <p className="mt-1">비밀번호를 사용하면 초대 링크와 비밀번호를 모두 아는 사람만 참가할 수 있습니다. 공개 파티는 파티 찾기에 노출되고, 비공개 파티는 초대 코드로만 참가할 수 있습니다.</p>
                </section>
            </div>

            <h2 className="mt-10 mb-4 text-xl font-bold">파티장 위임</h2>
            <p>
                파티장은 설정의 <strong>파티장 변경</strong>에서 파티에 참여한 다른 멤버를 선택해 파티 관리 권한을 위임할 수 있습니다.
                파티장을 변경하면 새 파티장이 파티명, 접근 설정, 초대 링크와 파티 해산 등 관리 기능을 담당하게 됩니다.
            </p>
            <ol className="mt-4 list-decimal space-y-2 pl-5 text-base">
                <li>파티 설정에서 <strong>파티장 변경</strong>을 선택합니다.</li>
                <li>권한을 넘겨받을 파티원을 선택합니다.</li>
                <li>대상 멤버의 캐릭터와 닉네임을 확인한 뒤 <strong>위임하기</strong>를 누릅니다.</li>
                <li>새 파티장에게 관리 권한이 넘어갔는지 확인합니다.</li>
            </ol>

            <section className="mt-8 rounded-2xl border border-primary-200 bg-primary-50/60 p-5 dark:border-primary-500/20 dark:bg-primary-500/10">
                <h2 className="text-xl font-bold">파티장이 탈퇴하려면</h2>
                <p className="mt-2">파티장은 권한을 가진 상태로 바로 파티를 탈퇴할 수 없습니다. 먼저 다른 파티원에게 파티장을 위임한 뒤 탈퇴해야 합니다. 탈퇴 전에 위임할 멤버를 정하고, 파티장 변경이 완료된 것을 확인한 다음 <strong>파티 탈퇴</strong>를 진행하세요.</p>
            </section>

            <h2 className="mt-10 mb-4 text-xl font-bold">파티 탈퇴와 파티 해산</h2>
            <div className="space-y-3">
                <section className="rounded-xl border border-default-200 bg-content1 p-4 dark:border-white/10">
                    <h3 className="text-lg font-bold">일반 멤버의 탈퇴</h3>
                    <p className="mt-1">일반 멤버는 파티 설정에서 파티 탈퇴를 선택해 현재 파티에서 나갈 수 있습니다. 탈퇴하면 해당 멤버의 숙제와 일정 공유 대상에서도 빠질 수 있으므로 파티원에게 미리 알려주세요.</p>
                </section>
                <section className="rounded-xl border border-danger-200 bg-danger-50/60 p-4 dark:border-danger-500/20 dark:bg-danger-500/10">
                    <h3 className="text-lg font-bold">파티장의 해산</h3>
                    <p className="mt-1">파티장은 파티 해산을 실행할 수 있습니다. 해산하면 참여 중인 모든 멤버가 자동으로 파티에서 나가므로, 단순히 본인만 나가려는 경우에는 반드시 먼저 파티장을 위임하세요.</p>
                </section>
            </div>

            <section className="mt-8 rounded-2xl border border-warning-200 bg-warning-50/70 p-5 dark:border-warning-500/20 dark:bg-warning-500/10">
                <h2 className="text-xl font-bold">주의사항</h2>
                <ul className="mt-3 list-disc space-y-2 pl-5 text-base">
                    <li>파티명, 파티장 위임, 초대 링크, 비밀번호와 공개 여부 등 대부분의 설정은 파티장만 변경할 수 있습니다.</li>
                    <li>파티장이 탈퇴하려면 예외 없이 먼저 다른 멤버에게 파티장을 위임해야 합니다.</li>
                    <li>초대 링크 재발급과 공개 범위 변경은 현재 참가 중인 멤버의 추가 참가 방식에 영향을 줍니다.</li>
                    <li>파티 해산은 모든 멤버에게 영향을 주는 기능이므로 탈퇴와 혼동하지 않도록 실행 전에 확인하세요.</li>
                </ul>
            </section>
        </div>
    );
}
