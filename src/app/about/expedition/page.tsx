import { Metadata } from "next";

export const metadata: Metadata = {
    title: '원정대·대표 캐릭터 · 로츠고 가이드',
    description: '로츠고 계정 및 설정에서 원정대 정보를 최신화하고 대표 캐릭터를 설정하는 방법을 안내합니다.',
};

export default function ExpeditionGuide() {
    return (
        <div className="w-full [&_p]:text-base [&_h1]:text-2xl">
            <h1 className="mb-3 font-bold">원정대·대표 캐릭터</h1>
            <p>
                계정 및 설정의 원정대 관리에서는 로츠고에 등록된 캐릭터 목록과 대표 캐릭터를 확인하고 관리할 수 있습니다.
                원정대 정보를 최신화하면 게임의 원정대 캐릭터 목록을 다시 가져오며, 대표 캐릭터는 숙제·일정·파티 등 여러 화면에서 기본 기준으로 활용됩니다.
            </p>

            <figure className="mt-6 overflow-hidden rounded-2xl border border-default-200 bg-default-50 p-2 dark:border-white/10 dark:bg-white/[0.03]">
                <img src="/about/expedition-representative.png" alt="등록된 원정대 캐릭터 목록과 대표 캐릭터 설정을 보여주는 화면" className="h-auto w-full rounded-xl object-contain" />
                <figcaption className="px-2 pb-1 pt-2 text-sm text-default-500">원정대 캐릭터 목록과 대표 캐릭터를 관리하는 화면</figcaption>
            </figure>

            <h2 className="mt-10 mb-4 text-xl font-bold">원정대 정보 최신화</h2>
            <ol className="list-decimal space-y-2 pl-5 text-base">
                <li>상단 프로필 메뉴에서 <strong>계정 및 설정</strong>을 엽니다.</li>
                <li><strong>내 원정대</strong> 화면에서 현재 등록된 캐릭터 목록을 확인합니다.</li>
                <li>게임에서 캐릭터를 새로 만들었거나 레벨·서버 정보가 변경됐다면 <strong>원정대 갱신</strong>을 누릅니다.</li>
                <li>갱신이 완료되면 등록 캐릭터 수와 캐릭터 목록이 최신 정보로 표시되는지 확인합니다.</li>
            </ol>
            <p className="mt-4 rounded-xl border border-primary-200 bg-primary-50/60 p-4 dark:border-primary-500/20 dark:bg-primary-500/10">
                파티의 멤버 숙제나 파티 일정에서 사용하는 캐릭터 목록도 원정대 정보에서 가져옵니다. 캐릭터가 보이지 않거나 오래된 정보가 표시되면 전투정보실이 아니라 이 화면에서 먼저 원정대 정보를 최신화하세요.
            </p>

            <h2 className="mt-10 mb-4 text-xl font-bold">대표 캐릭터 설정</h2>
            <p>
                캐릭터 목록의 <strong>대표 설정</strong> 스위치를 켜면 해당 캐릭터가 대표 캐릭터로 지정됩니다.
                대표 캐릭터는 한 명만 선택할 수 있으며, 새로운 캐릭터를 대표로 설정하면 기존 대표 캐릭터는 자동으로 해제됩니다.
            </p>
            <div className="mt-4 space-y-3">
                <section className="rounded-xl border border-default-200 bg-content1 p-4 dark:border-white/10">
                    <h3 className="text-lg font-bold">대표 캐릭터가 사용되는 곳</h3>
                    <p className="mt-1">회원가입 이후 원정대 확인의 기준이 되며, 홈 화면과 일정·파티 화면에서 기본 캐릭터를 표시할 때 활용됩니다. 파티나 일정에 참여할 때 실제로 사용할 캐릭터와 맞춰두면 관리가 편리합니다.</p>
                </section>
                <section className="rounded-xl border border-default-200 bg-content1 p-4 dark:border-white/10">
                    <h3 className="text-lg font-bold">전투정보실 이동</h3>
                    <p className="mt-1">각 캐릭터 행의 전투정보실 버튼을 누르면 해당 캐릭터의 전투 정보를 확인할 수 있습니다. 원정대 목록 관리와 전투정보 확인은 서로 다른 기능이므로, 캐릭터 목록을 갱신할 때는 원정대 갱신 버튼을 사용하세요.</p>
                </section>
            </div>

            <h2 className="mt-10 mb-4 text-xl font-bold">관리할 때 알아둘 점</h2>
            <ul className="list-disc space-y-2 pl-5 text-base">
                <li>등록 캐릭터 수와 대표 서버는 현재 원정대 정보 기준으로 상단 요약 영역에 표시됩니다.</li>
                <li>대표 캐릭터는 한 명만 선택할 수 있습니다.</li>
                <li>게임 내 원정대 변경 사항은 자동으로 즉시 반영되지 않을 수 있으므로 필요할 때 원정대 갱신을 실행하세요.</li>
                <li>원정대 정보를 최신화한 뒤 숙제·파티·일정 화면에서 캐릭터 목록이 올바르게 보이는지 확인하세요.</li>
            </ul>

            <section className="mt-8 rounded-2xl border border-warning-200 bg-warning-50/70 p-5 dark:border-warning-500/20 dark:bg-warning-500/10">
                <h2 className="text-xl font-bold">주의사항</h2>
                <ul className="mt-3 list-disc space-y-2 pl-5 text-base">
                    <li>원정대 갱신은 게임의 원정대 정보를 다시 가져오는 기능이며, 로츠고에서 특정 캐릭터를 임의로 삭제하거나 다른 원정대로 이동하는 기능은 아닙니다.</li>
                    <li>갱신 중에는 페이지를 닫거나 반복해서 버튼을 누르지 말고 완료될 때까지 기다리세요.</li>
                    <li>대표 캐릭터를 바꾸면 다른 화면에서 기본으로 표시되는 캐릭터가 달라질 수 있으므로 변경 후 확인하세요.</li>
                </ul>
            </section>
        </div>
    );
}
