import { Metadata } from "next";

export const metadata: Metadata = {
    title: '개인·길드 일정 · 로츠고 가이드',
    description: '로츠고 개인 일정과 길드 일정의 차이, 등록 방법과 공유 범위를 안내합니다.',
};

export default function PersonalGuildCalendarGuide() {
    return (
        <div className="w-full [&_p]:text-base [&_h1]:text-2xl">
            <h1 className="font-bold mb-3">개인·길드 일정</h1>
            <p>
                일정은 개인 일정과 길드 일정으로 나누어 관리할 수 있습니다.
                혼자 확인할 약속은 개인 일정으로, 대표 캐릭터가 가입한 길드원과 공유할 약속은 길드 일정으로 등록하세요.
            </p>

            <h2 className="mt-10 mb-4 text-xl font-bold">개인 일정과 길드 일정의 차이</h2>
            <div className="grid gap-3 sm:grid-cols-2">
                <section className="rounded-xl border border-primary-200 bg-primary-50/60 p-4 dark:border-primary-500/20 dark:bg-primary-500/10">
                    <h3 className="text-lg font-bold text-primary-700 dark:text-primary-300">개인 일정</h3>
                    <p className="mt-2">본인 계정에서만 확인할 수 있는 일정입니다. 개인적인 약속, 반복해서 기억할 일, 길드원과 공유할 필요가 없는 메모에 사용하세요.</p>
                </section>
                <section className="rounded-xl border border-secondary-200 bg-secondary-50/60 p-4 dark:border-secondary-500/20 dark:bg-secondary-500/10">
                    <h3 className="text-lg font-bold text-secondary-700 dark:text-secondary-300">길드 일정</h3>
                    <p className="mt-2">대표 캐릭터가 가입한 길드에 등록되어 같은 길드원과 공유되는 일정입니다. 길드 레이드나 길드 활동처럼 함께 확인해야 하는 약속에 사용하세요.</p>
                </section>
            </div>

            <h2 className="mt-10 mb-4 text-xl font-bold">개인 일정 등록하기</h2>
            <ol className="list-decimal space-y-2 pl-5 text-base">
                <li>일정 관리 화면에서 <strong>일정 추가</strong>를 누릅니다.</li>
                <li>제목과 날짜·시간을 입력하고 일정 유형에서 <strong>개인 일정</strong>을 선택합니다.</li>
                <li>레이드나 던전 약속이면 콘텐츠를 선택하고, 일반 약속이면 콘텐츠 없이 등록을 선택합니다.</li>
                <li>필요한 내용을 메모에 입력한 뒤 일정 추가를 눌러 저장합니다.</li>
            </ol>

            <h2 className="mt-10 mb-4 text-xl font-bold">길드 일정 등록하기</h2>
            <ol className="list-decimal space-y-2 pl-5 text-base">
                <li>일정 추가 창에서 제목, 콘텐츠, 날짜·시간을 입력합니다.</li>
                <li>일정 유형에서 <strong>길드 일정</strong>을 선택합니다.</li>
                <li>길드원에게 전달할 집결 시간, 준비물, 진행 방식 등을 메모에 작성합니다.</li>
                <li>일정 추가를 누르면 대표 캐릭터가 가입한 길드의 일정으로 저장됩니다.</li>
            </ol>
            <section className="mt-5 rounded-2xl border border-warning-200 bg-warning-50/70 p-5 dark:border-warning-500/20 dark:bg-warning-500/10">
                <h2 className="text-xl font-bold">길드 일정 등록 전 확인</h2>
                <ul className="mt-3 list-disc space-y-2 pl-5 text-base">
                    <li>대표 캐릭터가 길드에 가입되어 있어야 길드 일정을 등록할 수 있습니다.</li>
                    <li>가입된 길드가 없거나 길드 데이터를 불러오지 못하면 길드 일정 등록이 완료되지 않습니다.</li>
                    <li>길드 일정은 같은 길드원이 볼 수 있으므로 개인적인 내용은 개인 일정으로 등록하세요.</li>
                </ul>
            </section>

            <h2 className="mt-10 mb-4 text-xl font-bold">일정 화면에서 구분하기</h2>
            <p>
                주간 일정과 전체 달력에서는 일정 유형별 색상과 표시 필터를 사용합니다. 개인·길드·파티 필터를 각각 켜고 끌 수 있어 특정 유형만 모아서 확인할 수 있습니다.
                일정 상세를 열면 제목, 유형, 연결된 콘텐츠, 날짜와 시간, 메모를 확인할 수 있습니다.
            </p>

            <h2 className="mt-10 mb-4 text-xl font-bold">메모 수정과 일정 삭제</h2>
            <ol className="list-decimal space-y-2 pl-5 text-base">
                <li>주간 일정이나 전체 달력에서 관리할 일정을 선택합니다.</li>
                <li>상세 화면에서 메모를 수정하고 저장합니다.</li>
                <li>더 이상 필요하지 않은 일정은 삭제 버튼으로 제거합니다.</li>
                <li>길드 일정을 삭제하면 같은 길드원이 확인하던 일정도 함께 사라지므로 삭제 전에 공유 대상에게 알려주세요.</li>
            </ol>

            <section className="mt-8 rounded-2xl border border-primary-200 bg-primary-50/70 p-5 dark:border-primary-500/20 dark:bg-primary-500/10">
                <h2 className="text-xl font-bold">사용 예시</h2>
                <ul className="mt-3 list-disc space-y-2 pl-5 text-base">
                    <li>혼자 진행할 레이드 시간을 기록할 때는 개인 일정으로 등록합니다.</li>
                    <li>길드원과 함께할 레이드나 길드 이벤트는 길드 일정으로 등록하고 메모에 집결 정보를 남깁니다.</li>
                    <li>콘텐츠가 없는 개인 약속은 콘텐츠 없이 등록해 제목과 시간만 간단하게 관리합니다.</li>
                    <li>화면이 복잡할 때는 일정 유형 필터로 개인 또는 길드 일정만 표시합니다.</li>
                </ul>
            </section>
        </div>
    );
}
