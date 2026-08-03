import { Metadata } from "next";

export const metadata: Metadata = {
    title: '비밀번호 변경 · 로츠고 가이드',
    description: '로츠고 계정 설정에서 현재 비밀번호를 확인하고 새로운 비밀번호로 변경하는 방법을 안내합니다.',
};

export default function PasswordGuide() {
    return (
        <div className="w-full [&_p]:text-base [&_h1]:text-2xl">
            <h1 className="mb-3 font-bold">비밀번호 변경</h1>
            <p>
                비밀번호 변경은 계정 및 설정에서 현재 비밀번호를 확인한 뒤 새로운 비밀번호로 계정 비밀번호를 바꾸는 기능입니다.
                로그인 상태에서 직접 변경할 수 있으며, 현재 비밀번호를 모르는 경우에는 비밀번호 재설정 기능을 이용해야 합니다.
            </p>

            <h2 className="mt-10 mb-4 text-xl font-bold">비밀번호 변경 순서</h2>
            <div className="space-y-3">
                <section className="flex gap-4 rounded-xl border border-default-200 bg-content1 p-4 dark:border-white/10">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-100 text-sm font-bold text-primary-700 dark:bg-primary-500/20 dark:text-primary-300">01</span>
                    <div><h3 className="text-lg font-bold">계정 및 설정 열기</h3><p className="mt-1">상단 프로필 메뉴에서 <strong>계정 및 설정</strong>을 열고 <strong>비밀번호 변경</strong> 메뉴를 선택합니다.</p></div>
                </section>
                <section className="flex gap-4 rounded-xl border border-default-200 bg-content1 p-4 dark:border-white/10">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-100 text-sm font-bold text-primary-700 dark:bg-primary-500/20 dark:text-primary-300">02</span>
                    <div><h3 className="text-lg font-bold">현재 비밀번호 입력</h3><p className="mt-1">본인 확인을 위해 현재 사용 중인 비밀번호를 입력합니다. 현재 비밀번호가 일치하지 않으면 변경할 수 없습니다.</p></div>
                </section>
                <section className="flex gap-4 rounded-xl border border-default-200 bg-content1 p-4 dark:border-white/10">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-100 text-sm font-bold text-primary-700 dark:bg-primary-500/20 dark:text-primary-300">03</span>
                    <div><h3 className="text-lg font-bold">새 비밀번호 입력</h3><p className="mt-1">새로운 비밀번호를 6~18글자로 입력하고, 비밀번호 확인란에 같은 값을 한 번 더 입력합니다.</p></div>
                </section>
                <section className="flex gap-4 rounded-xl border border-default-200 bg-content1 p-4 dark:border-white/10">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-100 text-sm font-bold text-primary-700 dark:bg-primary-500/20 dark:text-primary-300">04</span>
                    <div><h3 className="text-lg font-bold">변경 완료</h3><p className="mt-1">세 입력값이 모두 올바르고 새 비밀번호가 일치하면 <strong>비밀번호 변경</strong> 버튼이 활성화됩니다. 버튼을 눌러 변경을 완료합니다.</p></div>
                </section>
            </div>

            <h2 className="mt-10 mb-4 text-xl font-bold">입력 항목 안내</h2>
            <div className="space-y-3">
                <section className="rounded-xl border border-default-200 bg-content1 p-4 dark:border-white/10"><h3 className="text-lg font-bold">현재 비밀번호</h3><p className="mt-1">현재 계정에 설정된 비밀번호를 입력합니다. 오입력하면 일치하지 않는다는 안내가 표시됩니다.</p></section>
                <section className="rounded-xl border border-default-200 bg-content1 p-4 dark:border-white/10"><h3 className="text-lg font-bold">새 비밀번호</h3><p className="mt-1">6~18글자 범위의 새로운 비밀번호를 입력합니다. 다른 서비스에서 사용하는 비밀번호와 다르게 설정하는 것이 안전합니다.</p></section>
                <section className="rounded-xl border border-default-200 bg-content1 p-4 dark:border-white/10"><h3 className="text-lg font-bold">비밀번호 확인</h3><p className="mt-1">새 비밀번호와 완전히 같은 값을 입력해야 합니다. 두 값이 다르면 변경 버튼을 사용할 수 없습니다.</p></section>
            </div>

            <section className="mt-8 rounded-2xl border border-warning-200 bg-warning-50/70 p-5 dark:border-warning-500/20 dark:bg-warning-500/10">
                <h2 className="text-xl font-bold">주의사항</h2>
                <ul className="mt-3 list-disc space-y-2 pl-5 text-base">
                    <li>현재 비밀번호를 잊어버렸다면 비밀번호 변경이 아니라 로그인 화면의 비밀번호 재설정을 이용하세요.</li>
                    <li>새 비밀번호는 6~18글자여야 하며, 확인란의 값과 정확히 일치해야 합니다.</li>
                    <li>변경한 비밀번호는 다음 로그인부터 사용합니다. 비밀번호 관리가 필요한 곳에는 변경한 값을 안전하게 보관하세요.</li>
                    <li>공용 PC에서 변경했다면 사용 후 로그아웃하고 비밀번호를 브라우저에 저장하지 마세요.</li>
                </ul>
            </section>
        </div>
    );
}
