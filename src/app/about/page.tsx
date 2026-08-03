import { Metadata } from "next";

export const metadata: Metadata = {
    title: '사이트 소개 · 로츠고 가이드',
    description: '로스트아크의 반복되는 숙제를 간편하게 관리하는 로츠고를 소개합니다.',
};

const features = [
    {
        icon: '🗂️',
        title: '캐릭터별 숙제 관리',
        description: '원정대의 캐릭터별로 일일·주간 콘텐츠와 개인 숙제를 한곳에서 확인하고 체크할 수 있습니다.',
    },
    {
        icon: '🔄',
        title: '자동 초기화와 진행 현황',
        description: '초기화 일정에 맞춰 숙제가 갱신되며, 남은 콘텐츠와 휴식 게이지를 빠르게 확인할 수 있습니다.',
    },
    {
        icon: '📅',
        title: '일정 관리',
        description: '고정 파티, 지인, 길드원과 함께할 레이드 약속을 기록하고 공유할 수 있습니다.',
    },
    {
        icon: '🔎',
        title: '전투정보실',
        description: '캐릭터의 장비와 전투 관련 정보를 조회하고 여러 캐릭터를 비교할 수 있습니다.',
    },
    {
        icon: '🧮',
        title: '플레이 보조 도구',
        description: '경매 계산기, 유물 각인서 시세, 버스 계산기 등 플레이에 필요한 도구를 제공합니다.',
    },
    {
        icon: '👥',
        title: '파티 관리',
        description: '파티를 모집하거나 참여하고, 파티원과 숙제 및 일정을 함께 관리할 수 있습니다.',
    },
];

export default function About() {
    return (
        <div className="w-full [&_p]:text-base [&_h3]:text-lg [&_h1]:text-2xl">
            <h1 className="font-bold mb-3">로츠고(Lot&apos;s Go)</h1>
            <p>
                로츠고는 로스트아크를 즐기는 모험가를 위한 숙제 관리 서비스입니다.
                캐릭터가 늘어날수록 함께 늘어나는 일일·주간 콘텐츠를 잊지 않고 관리할 수 있도록 도와줍니다.
            </p>
            <p>
                어떤 캐릭터의 레이드가 남아 있는지, 오늘 해야 할 콘텐츠가 무엇인지 매번 기억하거나 따로 기록하지 않아도 됩니다.
                로츠고에 원정대와 캐릭터를 등록하면 필요한 숙제를 한눈에 확인하고, 완료한 콘텐츠를 간단하게 체크할 수 있습니다.
            </p>

            <section className="mt-8 rounded-2xl border border-primary-200 bg-primary-50/70 p-5 dark:border-primary-500/20 dark:bg-primary-500/10">
                <h2 className="text-xl font-bold">로츠고의 가장 중요한 역할</h2>
                <p className="mt-2">
                    로츠고는 숙제를 대신 해주는 서비스가 아니라, 내가 해야 할 숙제를 놓치지 않도록 정리하고 기록해주는 서비스입니다.
                    오늘의 숙제와 이번 주의 숙제를 구분하고, 캐릭터별 진행 상황을 모아 보여주어 게임을 시작하기 전에 필요한 내용을 빠르게 파악할 수 있습니다.
                </p>
            </section>

            <h2 className="mt-10 mb-4 text-xl font-bold">주요 기능</h2>
            <div className="grid gap-3 sm:grid-cols-2">
                {features.map((feature) => (
                    <article key={feature.title} className="rounded-xl border border-default-200 bg-content1 p-4 dark:border-white/10">
                        <h3 className="font-bold">
                            <span className="mr-2" aria-hidden="true">{feature.icon}</span>
                            {feature.title}
                        </h3>
                        <p className="mt-2 text-base leading-7 text-default-600 dark:text-default-400">{feature.description}</p>
                    </article>
                ))}
            </div>

            <p className="mt-8">
                로츠고는 숙제 관리에서 시작해 일정, 전투정보, 파티, 플레이 보조 도구까지 로스트아크를 즐기는 데 필요한 기능을 한곳에 모으고 있습니다.
                먼저 숙제 관리 기능으로 나만의 원정대를 정리하고, 필요한 기능을 가이드 메뉴에서 차례로 확인해 보세요.
            </p>
        </div>
    );
}
