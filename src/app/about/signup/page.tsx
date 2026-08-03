import { Metadata } from "next";

export const metadata: Metadata = {
    title: '회원가입 · 로츠고 가이드',
    description: '로츠고 회원가입 절차와 입력 항목, 가입 전 주의사항을 안내합니다.',
};

const steps = [
    {
        number: '01',
        title: '아이디 입력 및 중복 확인',
        description: '영어와 숫자로 4~20글자의 아이디를 입력한 뒤 중복 확인을 눌러 사용 가능 여부를 확인합니다.',
    },
    {
        number: '02',
        title: '대표 캐릭터로 원정대 확인',
        description: '본인의 로스트아크 대표 캐릭터 이름을 입력하고 원정대 확인을 누릅니다. 확인된 원정대 정보가 가입 계정에 저장됩니다.',
    },
    {
        number: '03',
        title: '이메일과 비밀번호 입력',
        description: '사용 중인 이메일과 6~18글자의 비밀번호를 입력하고, 비밀번호 확인란에 같은 값을 한 번 더 입력합니다.',
    },
    {
        number: '04',
        title: '개인정보 동의 후 가입',
        description: '개인정보 수집 및 이용에 동의한 뒤 회원가입 버튼을 누르면 가입이 완료됩니다.',
    },
];

export default function Signup() {
    return (
        <div className="w-full [&_p]:text-base [&_h1]:text-2xl">
            <h1 className="font-bold mb-3">로츠고 회원가입</h1>
            <p>
                로츠고의 숙제 관리와 일정 관리 기능을 이용하려면 계정이 필요합니다.
                회원가입은 아이디와 대표 캐릭터, 이메일, 비밀번호를 입력한 뒤 약관에 동의하는 순서로 진행됩니다.
            </p>

            <figure className="mt-6 overflow-hidden rounded-2xl border border-default-200 bg-default-50 p-2 dark:border-white/10 dark:bg-white/[0.03]">
                <img src="/about/signup-current.png" alt="현재 로츠고 회원가입 화면" className="mx-auto h-auto max-h-[760px] w-full rounded-xl object-contain" />
                <figcaption className="px-2 pb-1 pt-2 text-sm text-default-500">현재 로츠고 회원가입 화면</figcaption>
            </figure>

            <h2 className="mt-10 mb-4 text-xl font-bold">회원가입 순서</h2>
            <div className="space-y-3">
                {steps.map((step) => (
                    <article key={step.number} className="flex gap-3 rounded-xl border border-default-200 bg-content1 p-4 dark:border-white/10">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                            {step.number}
                        </span>
                        <div>
                            <h3 className="font-bold">{step.title}</h3>
                            <p className="mt-1 text-base leading-7 text-default-600 dark:text-default-400">{step.description}</p>
                        </div>
                    </article>
                ))}
            </div>

            <h2 className="mt-10 mb-4 text-xl font-bold">입력 항목별 안내</h2>
            <ul className="list-disc space-y-2 pl-5 text-base">
                <li><strong>아이디</strong>는 영어와 숫자만 사용할 수 있으며, 4~20글자로 입력해야 합니다.</li>
                <li><strong>대표 캐릭터</strong>는 실제 로스트아크에 존재하는 캐릭터를 입력해야 원정대 정보를 불러올 수 있습니다.</li>
                <li><strong>이메일</strong>은 비밀번호 재설정에 사용되므로 실제로 확인할 수 있는 주소를 입력해야 합니다.</li>
                <li><strong>비밀번호</strong>는 6~18글자이며, 비밀번호 확인 값과 정확히 일치해야 합니다.</li>
                <li><strong>개인정보 수집 및 이용 동의</strong>를 완료해야 회원가입 버튼을 사용할 수 있습니다.</li>
            </ul>

            <section className="mt-8 rounded-2xl border border-warning-200 bg-warning-50/70 p-5 dark:border-warning-500/20 dark:bg-warning-500/10">
                <h2 className="text-xl font-bold">가입 전 주의사항</h2>
                <ul className="mt-3 list-disc space-y-2 pl-5 text-base">
                    <li>아이디와 이메일의 중복 확인을 각각 완료해야 합니다. 입력값을 바꾸면 다시 확인해야 할 수 있습니다.</li>
                    <li>대표 캐릭터 확인은 로스트아크 캐릭터 정보를 조회합니다. 캐릭터명 오타나 점검 시간에는 원정대 확인이 실패할 수 있습니다.</li>
                    <li>가입 후 비밀번호를 잊으면 가입할 때 입력한 아이디와 이메일이 필요하므로 정확하게 기억해 두세요.</li>
                    <li>다른 사람의 캐릭터가 아닌 본인의 대표 캐릭터를 입력해야 원정대와 숙제 데이터가 올바르게 연결됩니다.</li>
                </ul>
            </section>

            <p className="mt-8">
                회원가입을 완료한 뒤 로그인하면 숙제 페이지에서 원정대 기준의 초기 설정을 확인할 수 있습니다.
                로스트아크 API 키 등록과 계정 설정은 가입 후 계정 및 설정 가이드에서 이어서 확인할 수 있습니다.
            </p>
        </div>
    );
}
