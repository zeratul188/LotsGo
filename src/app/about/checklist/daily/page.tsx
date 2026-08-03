import { Metadata } from "next";

export const metadata: Metadata = {
    title: '일일 콘텐츠 · 로츠고 가이드',
    description: '로츠고 숙제 페이지에서 일일 콘텐츠와 휴식 게이지를 확인하고 관리하는 방법을 안내합니다.',
};

export default function DailyChecklistGuide() {
    return (
        <div className="w-full [&_p]:text-base [&_h1]:text-2xl">
            <h1 className="font-bold mb-3">일일 콘텐츠</h1>
            <p>
                일일 콘텐츠는 매일 초기화되는 숙제를 캐릭터별로 확인하고 완료 여부를 기록하는 영역입니다.
                캐릭터의 레벨에 따라 진행할 콘텐츠가 달라질 수 있으며, 숙제 페이지에서 캐릭터 카드를 펼치면 오늘 진행할 콘텐츠와 휴식 게이지를 한눈에 확인할 수 있습니다.
            </p>

            <figure className="mt-6 overflow-hidden rounded-2xl border border-default-200 bg-default-50 p-2 dark:border-white/10 dark:bg-white/[0.03]">
                <img src="/about/checklist-daily.png" alt="칼란디르 캐릭터의 일일 콘텐츠와 휴식 게이지 화면" className="mx-auto h-auto max-h-[720px] w-full rounded-xl object-contain" />
                <figcaption className="px-2 pb-1 pt-2 text-sm text-default-500">칼란디르 캐릭터 카드에서 확인하는 일일 콘텐츠</figcaption>
            </figure>

            <h2 className="mt-10 mb-4 text-xl font-bold">일일 콘텐츠 확인하기</h2>
            <ol className="list-decimal space-y-2 pl-5 text-base">
                <li>숙제 메뉴에서 확인할 캐릭터를 찾습니다. 캐릭터가 많다면 조회 및 필터의 계정·서버·콘텐츠 필터를 함께 사용하세요.</li>
                <li>캐릭터 카드의 <strong>일일 콘텐츠</strong> 영역에서 오늘 진행할 항목을 확인합니다.</li>
                <li>콘텐츠를 완료한 뒤 해당 항목의 체크박스를 눌러 완료 상태로 기록합니다.</li>
                <li>아직 하지 않은 항목과 휴식 게이지를 확인해 다음 플레이 순서를 정합니다.</li>
            </ol>

            <h2 className="mt-10 mb-4 text-xl font-bold">화면에 표시되는 콘텐츠</h2>
            <div className="space-y-3">
                <section className="rounded-xl border border-default-200 bg-content1 p-4 dark:border-white/10">
                    <h3 className="text-lg font-bold">쿠르잔 전선·카오스 던전</h3>
                    <p className="mt-1">캐릭터 레벨에 따라 표시되는 일일 콘텐츠가 다릅니다. 1730 미만 캐릭터는 쿠르잔 전선, 1640 미만 캐릭터는 카오스 던전으로 확인하며, 각 항목의 진행 횟수와 체크 상태를 기록합니다. 화면에서는 현재 진행도와 함께 휴식 게이지를 확인할 수 있습니다.</p>
                </section>
                <section className="rounded-xl border border-default-200 bg-content1 p-4 dark:border-white/10">
                    <h3 className="text-lg font-bold">가디언 토벌</h3>
                    <p className="mt-1">가디언 토벌을 완료했다면 체크박스를 눌러 오늘의 진행 상태를 남깁니다. 휴식 게이지가 쌓여 있다면 게이지도 함께 확인하세요.</p>
                </section>
                <section className="rounded-xl border border-default-200 bg-content1 p-4 dark:border-white/10">
                    <h3 className="text-lg font-bold">기타 콘텐츠</h3>
                    <p className="mt-1">혼돈의 균열과 가디언 토벌 외에도 매일 해야 할 일이 있다면 캐릭터 카드의 <strong>추가 및 휴식 게이지 관리</strong>에서 직접 추가할 수 있습니다. 캐릭터별로 필요한 항목을 등록해 일일 숙제와 함께 체크하고 관리하세요.</p>
                </section>
            </div>

            <h2 className="mt-10 mb-4 text-xl font-bold">휴식 게이지 관리</h2>
            <p>
                휴식 게이지는 일일 콘텐츠를 쉬는 동안 쌓이는 값을 기록하는 기능입니다. 캐릭터 카드의 <strong>추가 및 휴식 게이지 관리</strong> 버튼에서 콘텐츠를 추가하거나 각 콘텐츠의 게이지를 조정할 수 있습니다.
                게임 안의 실제 게이지와 로츠고에 표시되는 값이 다를 때 이 설정을 사용해 맞춰 주세요.
            </p>

            <section className="mt-8 rounded-2xl border border-primary-200 bg-primary-50/70 p-5 dark:border-primary-500/20 dark:bg-primary-500/10">
                <h2 className="text-xl font-bold">추천 사용 순서</h2>
                <ol className="mt-3 list-decimal space-y-2 pl-5 text-base">
                    <li>접속 후 골드 캐릭터부터 일일 콘텐츠와 휴식 게이지를 확인합니다.</li>
                    <li>오늘 진행할 콘텐츠를 완료할 때마다 체크합니다.</li>
                    <li>여러 캐릭터를 마친 뒤 남은 체크 항목만 다시 확인합니다.</li>
                    <li>실제 게임 화면과 게이지가 다르면 휴식 게이지 관리 설정에서 값을 수정합니다.</li>
                </ol>
            </section>

            <section className="mt-8 rounded-2xl border border-warning-200 bg-warning-50/70 p-5 dark:border-warning-500/20 dark:bg-warning-500/10">
                <h2 className="text-xl font-bold">주의사항</h2>
                <ul className="mt-3 list-disc space-y-2 pl-5 text-base">
                    <li>체크박스는 로츠고에 진행 상태를 기록하는 기능이며, 게임 안의 콘텐츠를 자동으로 완료 처리하지 않습니다.</li>
                    <li>일일 콘텐츠를 숨기는 필터를 사용해도 콘텐츠가 삭제되거나 완료 처리되는 것은 아닙니다.</li>
                    <li>캐릭터를 새로 추가했거나 게임 내 설정을 변경했다면 일일 콘텐츠 목록과 휴식 게이지를 함께 확인하세요.</li>
                </ul>
            </section>
        </div>
    );
}
