export type GuideMenuItem = {
    label: string;
    href: string;
};

export type GuideCategory = {
    id: string;
    label: string;
    description: string;
    icon: 'start' | 'home' | 'checklist' | 'calendar' | 'character' | 'party' | 'tools' | 'settings';
    items: GuideMenuItem[];
};

export const guideCategories: GuideCategory[] = [
    {
        id: 'start',
        label: '시작하기',
        description: '가입과 기본 준비',
        icon: 'start',
        items: [
            { label: '서비스 소개', href: '/about' },
            { label: '회원가입', href: '/about/signup' },
        ],
    },
    {
        id: 'home',
        label: '홈 화면',
        description: '한눈에 보는 로츠고',
        icon: 'home',
        items: [
            { label: '홈 화면 안내', href: '/about/home' },
        ],
    },
    {
        id: 'checklist',
        label: '숙제 관리',
        description: '캐릭터별 콘텐츠 관리',
        icon: 'checklist',
        items: [
            { label: '숙제 시작하기', href: '/about/checklist' },
            { label: '조회 및 필터', href: '/about/checklist/filter' },
            { label: '일일 콘텐츠', href: '/about/checklist/daily' },
            { label: '주간 콘텐츠', href: '/about/checklist/weekly' },
            { label: '레이드 자동 등록', href: '/about/checklist/auto-registration' },
            { label: '레이드 자동 체크', href: '/about/checklist/auto-check' },
            { label: '골드 및 부수입', href: '/about/checklist/gold' },
            { label: '큐브 관리', href: '/about/checklist/cube' },
        ],
    },
    {
        id: 'calendar',
        label: '일정 관리',
        description: '개인·길드·파티 일정',
        icon: 'calendar',
        items: [
            { label: '일정 시작하기', href: '/about/calender' },
            { label: '개인·길드 일정', href: '/about/calendar/personal-guild' },
            { label: '파티 일정', href: '/about/calendar/party' },
        ],
    },
    {
        id: 'character',
        label: '전투정보실',
        description: '캐릭터 정보와 비교',
        icon: 'character',
        items: [
            { label: '전투정보실 안내', href: '/about/character' },
            { label: '원정대 모아보기', href: '/about/character/roster' },
            { label: '캐릭터 비교', href: '/about/character/compare' },
        ],
    },
    {
        id: 'party',
        label: '파티 관리',
        description: '파티 구성과 일정 공유',
        icon: 'party',
        items: [
            { label: '파티 시작하기', href: '/about/party' },
            { label: '파티 찾기·참가', href: '/about/party/find' },
            { label: '멤버 숙제·골드', href: '/about/party/homework' },
            { label: '파티 모집', href: '/about/party/recruit' },
            { label: '주간 일정표', href: '/about/party/calendar' },
            { label: '파티 설정', href: '/about/party/settings' },
        ],
    },
    {
        id: 'tools',
        label: '도구',
        description: '계산기와 시뮬레이터',
        icon: 'tools',
        items: [
            { label: '경매 계산기', href: '/about/addons' },
            { label: '유물 각인서 시세', href: '/about/tools/relics' },
            { label: '버스 계산기', href: '/about/tools/bus' },
        ],
    },
    {
        id: 'settings',
        label: '계정 및 설정',
        description: '원정대와 계정 보안',
        icon: 'settings',
        items: [
            { label: '원정대·대표 캐릭터', href: '/about/expedition' },
            { label: '비밀번호 변경', href: '/about/settings/password' },
            { label: '비밀번호 재설정', href: '/about/reset' },
            { label: '회원탈퇴', href: '/about/settings/delete' },
        ],
    },
];

export function findGuideMenu(pathname: string) {
    for (const category of guideCategories) {
        const item = category.items.find((menu) => menu.href === pathname);
        if (item) return { category, item };
    }
    return null;
}
