import { Metadata } from "next";

export const metadata: Metadata = {
    title: '비밀번호 재설정 · 로츠고 가이드',
    description: '로츠고 로그인 화면에서 아이디와 등록 이메일로 비밀번호 재설정 메일을 요청하는 방법을 안내합니다.',
};

export default function ResetGuide() {
    return (
        <div className="w-full [&_p]:text-base [&_h1]:text-2xl">
            <h1 className="mb-3 font-bold">비밀번호 재설정</h1>
            <p>
                비밀번호를 잊어버렸다면 로그인 화면의 <strong>비밀번호 찾기</strong>를 통해 재설정 메일을 요청할 수 있습니다.
                가입할 때 등록한 아이디와 그 아이디에 저장된 이메일 주소를 입력해야 하며, 두 정보가 일치할 때만 메일이 발송됩니다.
            </p>

            <figure className="mt-6 overflow-hidden rounded-2xl border border-default-200 bg-default-50 p-2 dark:border-white/10 dark:bg-white/[0.03]">
                <img src="/about/password-reset-login.png" alt="로그인 화면 하단의 비밀번호 찾기 버튼" className="mx-auto h-auto max-h-[680px] rounded-xl object-contain" />
                <figcaption className="px-2 pb-1 pt-2 text-sm text-default-500">로그인 화면에서 비밀번호 찾기로 이동</figcaption>
            </figure>

            <h2 className="mt-10 mb-4 text-xl font-bold">재설정 메일 요청하기</h2>
            <div className="space-y-3">
                <section className="flex gap-4 rounded-xl border border-default-200 bg-content1 p-4 dark:border-white/10">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-100 text-sm font-bold text-primary-700 dark:bg-primary-500/20 dark:text-primary-300">01</span>
                    <div><h3 className="text-lg font-bold">비밀번호 찾기 열기</h3><p className="mt-1">로그인 화면에서 <strong>비밀번호 찾기</strong>를 눌러 재설정 화면을 엽니다.</p></div>
                </section>
                <section className="flex gap-4 rounded-xl border border-default-200 bg-content1 p-4 dark:border-white/10">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-100 text-sm font-bold text-primary-700 dark:bg-primary-500/20 dark:text-primary-300">02</span>
                    <div><h3 className="text-lg font-bold">가입 아이디 입력</h3><p className="mt-1">비밀번호 재설정 화면의 아이디 입력란에 가입한 아이디를 입력합니다.</p></div>
                </section>
                <section className="flex gap-4 rounded-xl border border-default-200 bg-content1 p-4 dark:border-white/10">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-100 text-sm font-bold text-primary-700 dark:bg-primary-500/20 dark:text-primary-300">03</span>
                    <div><h3 className="text-lg font-bold">등록 이메일 입력</h3><p className="mt-1">회원가입 당시 해당 아이디에 등록한 이메일 주소를 입력합니다.</p></div>
                </section>
                <section className="flex gap-4 rounded-xl border border-default-200 bg-content1 p-4 dark:border-white/10">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-100 text-sm font-bold text-primary-700 dark:bg-primary-500/20 dark:text-primary-300">04</span>
                    <div><h3 className="text-lg font-bold">재설정 요청 보내기</h3><p className="mt-1">아이디와 이메일이 정확히 일치하는지 확인한 뒤 <strong>전송</strong>을 누릅니다.</p></div>
                </section>
                <section className="flex gap-4 rounded-xl border border-default-200 bg-content1 p-4 dark:border-white/10">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-100 text-sm font-bold text-primary-700 dark:bg-primary-500/20 dark:text-primary-300">05</span>
                    <div><h3 className="text-lg font-bold">메일 확인하기</h3><p className="mt-1">등록된 이메일의 받은 편지함에서 비밀번호 재설정 메일을 확인합니다.</p></div>
                </section>
            </div>

            <figure className="mt-6 overflow-hidden rounded-2xl border border-default-200 bg-default-50 p-2 dark:border-white/10 dark:bg-white/[0.03]">
                <img src="/about/password-reset-form.png" alt="아이디와 이메일을 입력하는 비밀번호 재설정 화면" className="mx-auto h-auto max-h-[720px] rounded-xl object-contain" />
                <figcaption className="px-2 pb-1 pt-2 text-sm text-default-500">아이디와 등록 이메일을 입력해 재설정 메일을 요청하는 화면</figcaption>
            </figure>

            <h2 className="mt-10 mb-4 text-xl font-bold">메일을 받은 뒤 비밀번호 변경하기</h2>
            <div className="space-y-3">
                <section className="rounded-xl border border-default-200 bg-content1 p-4 dark:border-white/10"><h3 className="text-lg font-bold">메일의 재설정 링크 열기</h3><p className="mt-1">발송된 이메일에서 비밀번호 재설정 링크를 누릅니다. 링크를 통해 비밀번호를 변경할 수 있는 화면으로 이동합니다.</p></section>
                <section className="rounded-xl border border-default-200 bg-content1 p-4 dark:border-white/10"><h3 className="text-lg font-bold">새 비밀번호 설정</h3><p className="mt-1">새 비밀번호를 입력하고 변경을 완료합니다. 변경이 끝나면 로그인 화면에서 새 비밀번호로 다시 로그인하세요.</p></section>
            </div>

            <section className="mt-8 rounded-2xl border border-warning-200 bg-warning-50/70 p-5 dark:border-warning-500/20 dark:bg-warning-500/10">
                <h2 className="text-xl font-bold">중요한 확인 사항</h2>
                <ul className="mt-3 list-disc space-y-2 pl-5 text-base">
                    <li>아이디와 해당 아이디에 저장된 이메일이 일치하지 않으면 비밀번호 재설정 메일이 발송되지 않습니다.</li>
                    <li>다른 아이디의 이메일 주소나 회원가입 때 등록하지 않은 이메일을 입력하면 요청이 처리되지 않습니다.</li>
                    <li>이메일 주소의 철자와 아이디를 정확히 입력하고, 메일이 오지 않으면 스팸·프로모션함도 확인하세요.</li>
                    <li>메일 링크에서 변경을 완료하기 전까지는 기존 비밀번호로 로그인할 수 있습니다.</li>
                    <li>재설정 링크가 만료되었거나 사용할 수 없다면 로그인 화면에서 다시 요청하세요.</li>
                </ul>
            </section>
        </div>
    );
}
