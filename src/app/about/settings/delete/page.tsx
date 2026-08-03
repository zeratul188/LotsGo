import { Metadata } from "next";

export const metadata: Metadata = {
    title: '회원탈퇴 · 로츠고 가이드',
    description: '로츠고 계정을 탈퇴할 때 필요한 확인 사항과 회원탈퇴 절차를 안내합니다.',
};

export default function DeleteAccountGuide() {
    return (
        <div className="w-full [&_p]:text-base [&_h1]:text-2xl">
            <h1 className="mb-3 font-bold">회원탈퇴</h1>
            <p>
                회원탈퇴는 계정 및 설정의 위험 영역에서 진행할 수 있습니다.
                탈퇴하면 로츠고 계정과 함께 저장된 원정대·숙제·일정·파티 관련 데이터가 삭제되므로, 더 이상 서비스를 이용하지 않을 때 신중하게 진행하세요.
            </p>

            <section className="mt-6 rounded-2xl border border-danger-200 bg-danger-50/70 p-5 dark:border-danger-500/20 dark:bg-danger-500/10">
                <h2 className="text-xl font-bold text-danger-700 dark:text-danger-300">탈퇴 전 꼭 확인하세요</h2>
                <ul className="mt-3 list-disc space-y-2 pl-5 text-base text-danger-800 dark:text-danger-200">
                    <li>탈퇴한 계정의 데이터는 모두 삭제되며 복구할 수 없습니다.</li>
                    <li>원정대 정보, 숙제 기록, 일정, 파티 참여 정보 등 계정에 저장된 데이터가 함께 삭제됩니다.</li>
                    <li>탈퇴 후에는 로그아웃되므로 진행 중인 작업이 없는지 확인하세요.</li>
                    <li>탈퇴 이후 동일한 아이디와 이메일로 다시 가입할 수 있습니다.</li>
                </ul>
            </section>

            <h2 className="mt-10 mb-4 text-xl font-bold">회원탈퇴 순서</h2>
            <div className="space-y-3">
                <section className="flex gap-4 rounded-xl border border-default-200 bg-content1 p-4 dark:border-white/10">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-danger-100 text-sm font-bold text-danger-700 dark:bg-danger-500/20 dark:text-danger-300">01</span>
                    <div><h3 className="text-lg font-bold">계정 및 설정 열기</h3><p className="mt-1">상단 프로필 메뉴에서 <strong>계정 및 설정</strong>을 열고 <strong>회원탈퇴</strong> 메뉴로 이동합니다.</p></div>
                </section>
                <section className="flex gap-4 rounded-xl border border-default-200 bg-content1 p-4 dark:border-white/10">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-danger-100 text-sm font-bold text-danger-700 dark:bg-danger-500/20 dark:text-danger-300">02</span>
                    <div><h3 className="text-lg font-bold">유의사항 확인</h3><p className="mt-1">탈퇴 시 데이터가 삭제되고 복구할 수 없다는 내용을 읽은 뒤 <strong>위 유의사항을 확인하였습니다</strong>를 선택합니다.</p></div>
                </section>
                <section className="flex gap-4 rounded-xl border border-default-200 bg-content1 p-4 dark:border-white/10">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-danger-100 text-sm font-bold text-danger-700 dark:bg-danger-500/20 dark:text-danger-300">03</span>
                    <div><h3 className="text-lg font-bold">현재 비밀번호 입력</h3><p className="mt-1">본인 확인을 위해 현재 비밀번호를 입력합니다. 비밀번호가 일치하지 않으면 탈퇴를 진행할 수 없습니다.</p></div>
                </section>
                <section className="flex gap-4 rounded-xl border border-default-200 bg-content1 p-4 dark:border-white/10">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-danger-100 text-sm font-bold text-danger-700 dark:bg-danger-500/20 dark:text-danger-300">04</span>
                    <div><h3 className="text-lg font-bold">탈퇴 확인</h3><p className="mt-1"><strong>탈퇴하기</strong>를 누른 뒤 확인 창에서 탈퇴 의사를 한 번 더 확인하면 계정과 데이터가 삭제되고 로그아웃됩니다.</p></div>
                </section>
            </div>

            <h2 className="mt-10 mb-4 text-xl font-bold">탈퇴 전에 정리하면 좋은 내용</h2>
            <ul className="list-disc space-y-2 pl-5 text-base">
                <li>필요한 숙제 기록이나 일정 내용을 별도로 기록해 둡니다.</li>
                <li>참여 중인 파티가 있다면 파티원에게 탈퇴 사실을 알리고, 파티장이라면 먼저 다른 멤버에게 파티장을 위임합니다.</li>
                <li>나중에 다시 사용할 수 있는 파티 약속이나 메모가 있는지 확인합니다.</li>
                <li>탈퇴 후 같은 아이디와 이메일로 다시 가입할 수 있지만, 기존 데이터는 복구되지 않는다는 점을 기억하세요.</li>
            </ul>

            <section className="mt-8 rounded-2xl border border-warning-200 bg-warning-50/70 p-5 dark:border-warning-500/20 dark:bg-warning-500/10">
                <h2 className="text-xl font-bold">주의사항</h2>
                <ul className="mt-3 list-disc space-y-2 pl-5 text-base">
                    <li>탈퇴 확인란을 선택하지 않으면 탈퇴하기 버튼을 사용할 수 없습니다.</li>
                    <li>현재 비밀번호를 잊어버렸다면 먼저 비밀번호 재설정 또는 비밀번호 변경을 진행하세요.</li>
                    <li>탈퇴를 실행하면 계정 데이터가 완전히 삭제되므로 단순히 잠시 사용하지 않을 때는 로그아웃만 하는 것을 권장합니다.</li>
                    <li>파티장인 상태에서는 탈퇴할 수 없으므로, 반드시 파티장을 다른 멤버에게 위임한 뒤 탈퇴하세요.</li>
                </ul>
            </section>
        </div>
    );
}
