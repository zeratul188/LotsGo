import { useEffect, useState } from "react";
import { CheckCharacter } from "../../store/checklistSlice";
import {
    getFixedWeeklyContentStatuses,
    getIncompleteHomeworkNames,
    getIncompleteRaidStatuses,
    groupByLevel10,
    isCompleteHomeworkByCharacter,
    isLogin,
    loadChecklist
} from "../lib/checklistFeat";
import { WeeklyChecklistSkeleton } from "./HomeDataSkeleton";
import { Boss } from "../../api/checklist/boss/route";
import {
    getAllBoundGold,
    getAllContentGold,
    getAllContentOtherGold,
    getAllCountChecklistByStage,
    getAllGolds,
    getBosses,
    getBackgroundByStage,
    getCompleteChecklistByStage,
    getHaveGolds
} from "../../checklist/lib/checklistFeat";
import {
    Card,
    CardBody,
    CardHeader,
    Chip,
    CircularProgress,
    Checkbox,
    Pagination,
    Progress,
    Select,
    SelectItem,
    Tab,
    Tabs,
    Tooltip
} from "@heroui/react";
import { ContentChip } from "../../raids/ui/PartyForm";
import { useMobileQuery } from "@/utiils/utils";
import PersonIcon from "@/Icons/PersonIcon";
import clsx from "clsx";
import JobAvatar from "@/Icons/JobAvatar";
import FixedWeeklyContentStatus from "./FixedWeeklyContentStatus";

// state 관리
function useChecklistForm() {
    const [checklist, setChecklist] = useState<CheckCharacter[]>([]);
    const [isLoading, setLoading] = useState(true);
    const [isLogin, setLogin] = useState(false);
    const [bosses, setBosses] = useState<Boss[]>([]);

    return {
        checklist, setChecklist,
        isLoading, setLoading,
        isLogin, setLogin,
        bosses, setBosses
    }
}

// 숙제 관리 컴포넌트
export default function ChecklistComponent() {
    const checklistForm = useChecklistForm();
    const [page, setPage] = useState(1);
    const [statusView, setStatusView] = useState<'overview' | 'incomplete'>('incomplete');
    const [selectedRaid, setSelectedRaid] = useState('all');
    const [goldOnly, setGoldOnly] = useState(false);
    const [remainingPage, setRemainingPage] = useState(1);
    const isMobile = useMobileQuery();
    const maxSize = isMobile ? 3 : 5;

    useEffect(() => {
        checklistForm.setLogin(isLogin());
    }, []);
    useEffect(() => {
        const loadData = async () => {
            if (checklistForm.isLogin) {
                const bossDatas = await getBosses();
                checklistForm.setBosses(bossDatas);
            }
        }
        loadData();
    }, [checklistForm.isLogin]);
    useEffect(() => {
        const loadData = async () => {
            if (checklistForm.isLogin) {
                await loadChecklist(checklistForm.setChecklist, checklistForm.setLoading, checklistForm.bosses);
            }
        }
        loadData();
    }, [checklistForm.bosses]);

    if (!checklistForm.isLogin || (checklistForm.checklist.length === 0 && !checklistForm.isLoading)) {
        return <></>;
    }
    if (checklistForm.isLoading) {
        return <WeeklyChecklistSkeleton/>
    }

    const activeChecklist = checklistForm.checklist.filter(character => character.checklist.length > 0);
    const weeklyGold = getHaveGolds(checklistForm.bosses, checklistForm.checklist);
    const totalGold = getAllGolds(checklistForm.bosses, checklistForm.checklist);
    const tradableGold = getAllContentGold(checklistForm.bosses, checklistForm.checklist);
    const boundGold = getAllBoundGold(checklistForm.bosses, checklistForm.checklist);
    const otherGold = getAllContentOtherGold(checklistForm.bosses, checklistForm.checklist);
    const completedHomework = getCompleteChecklistByStage(checklistForm.checklist);
    const totalHomework = getAllCountChecklistByStage(checklistForm.checklist);
    const goldProgress = totalGold > 0 ? Math.round(weeklyGold / totalGold * 100) : 0;
    const homeworkProgress = totalHomework > 0 ? Math.round(completedHomework / totalHomework * 100) : 0;
    const pageChecklist = activeChecklist.slice((page - 1) * maxSize, page * maxSize);
    const groupedChecklist = Array.from(groupByLevel10(activeChecklist).entries());
    const fixedWeeklyContentStatuses = getFixedWeeklyContentStatuses(checklistForm.checklist);
    const goldCharacters = activeChecklist.filter(character => character.isGold).length;
    const nonGoldCharacters = activeChecklist.length - goldCharacters;
    const incompleteCharacterEntries = activeChecklist
        .map(character => ({
            character,
            raids: getIncompleteRaidStatuses(character, checklistForm.bosses)
        }))
        .filter(entry => entry.raids.length > 0);
    const goldFilteredCharacterEntries = goldOnly
        ? incompleteCharacterEntries
            .filter(entry => entry.character.isGold)
            .map(entry => ({
                ...entry,
                raids: entry.raids.filter(raid => raid.isGold)
            }))
            .filter(entry => entry.raids.length > 0)
        : incompleteCharacterEntries;
    const incompleteRaidOptions = Array.from(new Set(
        goldFilteredCharacterEntries.flatMap(entry => entry.raids.map(raid => raid.name))
    )).map((name, index) => ({
        key: `raid-${index}`,
        name
    }));
    const raidSelectOptions = [
        { key: 'all', name: '모든 레이드' },
        ...incompleteRaidOptions
    ];
    const selectedRaidName = incompleteRaidOptions.find(raid => raid.key === selectedRaid)?.name;
    const filteredIncompleteEntries = goldFilteredCharacterEntries
        .map(entry => ({
            ...entry,
            raids: selectedRaid === 'all'
                ? entry.raids
                : entry.raids.filter(raid => raid.name === selectedRaidName)
        }))
        .filter(entry => entry.raids.length > 0);
    const remainingRaidCount = filteredIncompleteEntries.reduce((total, entry) => total + entry.raids.length, 0);
    const remainingPageCount = Math.ceil(filteredIncompleteEntries.length / maxSize);
    const pageIncompleteEntries = filteredIncompleteEntries.slice(
        (remainingPage - 1) * maxSize,
        remainingPage * maxSize
    );

    return (
        <div className="mb-6 w-full">
            <Card
                fullWidth
                radius="lg"
                shadow="none"
                className="overflow-hidden border border-default-200/80 bg-white shadow-sm dark:border-white/10 dark:bg-[#171717] dark:shadow-none">
                <CardHeader className="block p-0">
                    <div className="flex flex-col items-start gap-3 border-b border-default-200/80 px-4 py-3 sm:flex-row sm:items-center sm:px-5 dark:border-white/10">
                        <div className="min-w-0 grow">
                            <h2 className="text-lg font-semibold tracking-tight sm:text-xl">주간 숙제 현황</h2>
                            <p className="mt-0.5 text-xs text-default-500">이번 주 골드와 캐릭터별 숙제 진행 상황을 확인해 보세요.</p>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-default-500 sm:justify-end">
                            <span className="inline-flex items-center gap-1">
                                <img src="/icons/gold.png" alt="" className="h-3.5 w-3.5"/>
                                골드 획득 <strong className="font-semibold text-foreground">{goldCharacters}명</strong>
                            </span>
                            <span>비획득 <strong className="font-semibold text-foreground">{nonGoldCharacters}명</strong></span>
                        </div>
                    </div>

                    <div className="grid w-full grid-cols-1 divide-y divide-default-200/80 lg1200:grid-cols-[minmax(280px,1.15fr)_minmax(280px,1fr)_minmax(240px,0.82fr)] lg1200:divide-x lg1200:divide-y-0 dark:divide-white/10">
                        <div className="flex flex-col justify-center px-4 py-2 sm:px-5">
                            <div className="flex flex-1 items-center gap-3 py-2">
                                <CircularProgress
                                    aria-label="주간 골드 획득률"
                                    value={goldProgress}
                                    valueLabel={`${goldProgress}%`}
                                    showValueLabel
                                    color="warning"
                                    size="lg"
                                    className="shrink-0"
                                    classNames={{ svg: "h-[68px] w-[68px]", track: "stroke-default-100", value: "text-sm font-semibold tabular-nums" }}/>
                                <div className="min-w-0">
                                    <p className="flex items-center gap-1.5 text-xs text-default-500"><img src="/icons/gold.png" alt="" className="h-4 w-4"/>주간 골드량</p>
                                    <p className="mt-1 flex flex-wrap items-baseline gap-x-1.5 tabular-nums">
                                        <strong className="text-lg font-semibold text-foreground">{weeklyGold.toLocaleString()}</strong>
                                        <span className="text-xs text-default-500">/ {totalGold.toLocaleString()}</span>
                                    </p>
                                    <p className="mt-1 text-xs text-default-500">남은 골드 <span className="font-medium tabular-nums text-warning-600 dark:text-warning-400">{Math.max(0, totalGold - weeklyGold).toLocaleString()}</span></p>
                                </div>
                            </div>
                            <div className="flex flex-1 items-center gap-3 border-t border-default-200/80 py-2 dark:border-white/10">
                                <CircularProgress
                                    aria-label="숙제 관문 완료율"
                                    value={homeworkProgress}
                                    valueLabel={`${homeworkProgress}%`}
                                    showValueLabel
                                    color="secondary"
                                    size="lg"
                                    className="shrink-0"
                                    classNames={{ svg: "h-[68px] w-[68px]", track: "stroke-default-100", value: "text-sm font-semibold tabular-nums" }}/>
                                <div className="min-w-0">
                                    <p className="flex items-center gap-1.5 text-xs text-default-500"><svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4.5h6M9 11h6M9 15h4"/></svg>숙제 진행 상황</p>
                                    <p className="mt-1 flex flex-wrap items-baseline gap-x-1.5 tabular-nums">
                                        <strong className="text-lg font-semibold text-foreground">{completedHomework.toLocaleString()}</strong>
                                        <span className="text-xs text-default-500">/ {totalHomework.toLocaleString()}</span>
                                    </p>
                                    <p className="mt-1 text-xs text-default-500">남은 관문 <span className="font-medium tabular-nums text-secondary-600 dark:text-secondary-400">{Math.max(0, totalHomework - completedHomework).toLocaleString()}개</span></p>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 sm:p-5">
                            <div className="mb-3 flex items-center justify-between">
                                <p className="font-semibold">골드 상세</p>
                                <p className="flex items-center gap-1 text-sm font-semibold tabular-nums">
                                    <img src="/icons/gold.png" alt="goldicon" className="h-[14px] w-[14px]"/>
                                    {weeklyGold.toLocaleString()}
                                </p>
                            </div>
                            <div className="flex flex-col gap-3">
                                <Progress
                                    showValueLabel={weeklyGold > 0}
                                    radius="sm"
                                    size="sm"
                                    color="success"
                                    label={
                                        <span className="flex items-center gap-1.5 text-xs text-default-600 dark:text-default-300">
                                            <span className="h-2 w-2 rounded-full bg-success"/>
                                            거래 가능 골드
                                            <strong className="font-semibold tabular-nums text-foreground">{tradableGold.toLocaleString()}</strong>
                                        </span>
                                    }
                                    value={tradableGold}
                                    maxValue={weeklyGold || 1}
                                    classNames={{ track: "h-1 bg-default-100", indicator: "h-1", value: "text-xs tabular-nums" }}
                                    className="w-full"/>
                                <Progress
                                    showValueLabel={weeklyGold > 0}
                                    radius="sm"
                                    size="sm"
                                    color="warning"
                                    label={
                                        <span className="flex items-center gap-1.5 text-xs text-default-600 dark:text-default-300">
                                            <span className="h-2 w-2 rounded-full bg-warning"/>
                                            귀속 골드
                                            <strong className="font-semibold tabular-nums text-foreground">{boundGold.toLocaleString()}</strong>
                                        </span>
                                    }
                                    value={boundGold}
                                    maxValue={weeklyGold || 1}
                                    classNames={{ track: "h-1 bg-default-100", indicator: "h-1", value: "text-xs tabular-nums" }}
                                    className="w-full"/>
                                <Progress
                                    showValueLabel={weeklyGold > 0}
                                    radius="sm"
                                    size="sm"
                                    color="secondary"
                                    label={
                                        <span className="flex items-center gap-1.5 text-xs text-default-600 dark:text-default-300">
                                            <span className="h-2 w-2 rounded-full bg-secondary"/>
                                            부수입
                                            <strong className="font-semibold tabular-nums text-foreground">{otherGold.toLocaleString()}</strong>
                                        </span>
                                    }
                                    value={otherGold}
                                    maxValue={weeklyGold || 1}
                                    classNames={{ track: "h-1 bg-default-100", indicator: "h-1", value: "text-xs tabular-nums" }}
                                    className="w-full"/>
                                <div>
                                    <p className="text-xs fadedtext">골드 비율</p>
                                    {checklistForm.bosses.length && checklistForm.checklist.length ? (
                                        <div className="relative mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-white/10">
                                            <div className="absolute left-0 top-0 h-full bg-purple-600" style={{ width: '100%' }}></div>
                                            <div className="absolute left-0 top-0 h-full bg-yellow-500" style={{ width: `${weeklyGold !== 0 ? Math.round(tradableGold / weeklyGold * 1000) / 10 + Math.round(boundGold / weeklyGold * 1000) / 10 : 0}%` }}></div>
                                            <div className="absolute left-0 top-0 h-full bg-green-500" style={{ width: `${weeklyGold !== 0 ? Math.round(tradableGold / weeklyGold * 1000) / 10 : 0}%` }}></div>
                                        </div>
                                    ) : <></>}
                                </div>
                            </div>
                        </div>

                        <div className="p-4 sm:p-5">
                            <div className="mb-3 flex items-center justify-between">
                                <p className="font-semibold">레벨별 숙제 현황</p>
                                <p className="text-xs fadedtext">최대 10명 표시</p>
                            </div>
                            <div className="flex flex-col">
                                {groupedChecklist.map(([bucket, list], index) => (
                                    <div
                                        key={bucket.startLevel}
                                        className={clsx(
                                            "flex min-h-9 w-full items-center gap-2 py-1.5",
                                            index > 0 && "border-t border-gray-200/80 dark:border-white/10"
                                        )}>
                                        <Chip size="sm" variant="flat" radius="sm" className="shrink-0">
                                            {bucket.startLevel} ~ {bucket.endLevel !== 9999 && bucket.endLevel-1}
                                        </Chip>
                                        <div className="ml-auto flex items-center gap-1">
                                            {list.slice(0, 10).map((character) => (
                                                <Tooltip
                                                    showArrow
                                                    key={character.nickname}
                                                    content={
                                                        <div className="w-[230px] p-1">
                                                            <div className="flex items-center justify-between gap-2">
                                                                <div className="flex min-w-0 items-center gap-1.5">
                                                                    <JobAvatar size={24} job={character.job} className="shrink-0"/>
                                                                    <div className="min-w-0">
                                                                        <p className="truncate text-xs font-semibold">{character.nickname}</p>
                                                                        <p className="mt-0.5 truncate text-[10px] leading-tight fadedtext">
                                                                            Lv.{character.level.toLocaleString()} · {character.job}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                                {isCompleteHomeworkByCharacter(character) ? (
                                                                    <Chip size="sm" variant="flat" radius="sm" color="success" className="shrink-0">
                                                                        완료
                                                                    </Chip>
                                                                ) : (
                                                                    <Chip size="sm" variant="flat" radius="sm" color="danger" className="shrink-0">
                                                                        미완료
                                                                    </Chip>
                                                                )}
                                                            </div>
                                                            {!isCompleteHomeworkByCharacter(character) ? (
                                                                <div className="mt-2.5 rounded-lg bg-default-100/70 p-2 dark:bg-white/[0.055]">
                                                                    <div className="mb-1.5 flex items-center justify-between gap-2">
                                                                        <p className="text-[11px] font-medium text-default-500 dark:text-default-400">남은 레이드</p>
                                                                        <span className="text-[10px] font-semibold tabular-nums text-danger">
                                                                            {getIncompleteHomeworkNames(character).length}개
                                                                        </span>
                                                                    </div>
                                                                    <div className="space-y-1">
                                                                        {getIncompleteHomeworkNames(character).map((contentName) => (
                                                                            <div
                                                                                key={contentName}
                                                                                className="flex min-w-0 items-center gap-2 rounded-md border border-default-200/70 bg-content1 px-2 py-1.5 dark:border-white/10 dark:bg-white/[0.035]">
                                                                                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-danger"/>
                                                                                <span className="min-w-0 truncate text-xs font-medium">{contentName}</span>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            ) : null}
                                                        </div>
                                                    }>
                                                    <PersonIcon className={clsx(
                                                        "h-[25px] w-[15px] fill-current",
                                                        isCompleteHomeworkByCharacter(character) ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-gray-600'
                                                    )}/>
                                                </Tooltip>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </CardHeader>

                <div className="grid grid-cols-1 gap-3 border-t border-gray-200/80 p-3 sm:p-4 md:grid-cols-2 dark:border-white/10">
                    {fixedWeeklyContentStatuses.map((status) => (
                        <FixedWeeklyContentStatus key={status.type} status={status}/>
                    ))}
                </div>

                <CardBody className="border-t border-gray-200/80 p-0 dark:border-white/10">
                    <div className="flex flex-wrap items-center gap-2 px-4 py-3 sm:px-5">
                        <p className="font-semibold">캐릭터별 숙제 현황</p>
                        <Chip size="sm" radius="sm" variant="flat">{completedHomework} / {totalHomework}</Chip>
                        {statusView === 'overview' ? (
                            <div className="ml-auto flex items-center gap-2 text-xs fadedtext">
                                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-success"/>완료</span>
                                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-danger"/>미완료</span>
                            </div>
                        ) : null}
                    </div>
                    <div className="px-3 pb-3 sm:px-4">
                        <Tabs
                            aria-label="캐릭터별 숙제 현황 보기"
                            selectedKey={statusView}
                            onSelectionChange={(key) => {
                                setStatusView(String(key) as 'overview' | 'incomplete');
                            }}
                            radius="lg"
                            color="primary"
                            variant="light"
                            classNames={{
                                base: "w-full sm:w-[320px]",
                                tabList: "grid w-full grid-cols-2 gap-1 rounded-xl border border-gray-200/80 bg-gray-50/80 p-1 dark:border-white/10 dark:bg-white/[0.035]",
                                cursor: "rounded-lg bg-white shadow-sm dark:bg-primary-500/15 dark:shadow-none",
                                tab: "h-9 px-3",
                                tabContent: "text-sm font-medium text-gray-500 group-data-[selected=true]:text-primary dark:text-gray-400 dark:group-data-[selected=true]:text-primary-300"
                            }}>
                            <Tab key="incomplete" title="남은 레이드"/>
                            <Tab key="overview" title="전체 현황"/>
                        </Tabs>
                    </div>

                    {statusView === 'overview' ? (
                        <>
                            <div className="space-y-2 px-3 sm:px-4">
                                {pageChecklist.map((item) => (
                                    <div key={item.nickname} className="flex w-full flex-col items-center gap-3 rounded-xl border border-gray-200/80 bg-gray-50/60 px-3 py-3 sm:flex-row sm:gap-5 dark:border-white/10 dark:bg-white/[0.025]">
                                        <div className="flex min-w-full items-center gap-3 sm:min-w-[240px]">
                                            <JobAvatar size="sm" job={item.job}/>
                                            <div className="min-w-0 grow">
                                                <div className="flex items-center gap-1">
                                                    <p className="truncate text-sm font-medium">{item.nickname}</p>
                                                    {item.isGold ? (
                                                        <img src="/icons/gold.png" alt="goldicon" className="h-[12px] w-[12px]"/>
                                                    ) : null}
                                                </div>
                                                <p className="text-xs fadedtext">{item.job} · Lv.{item.level.toLocaleString()}</p>
                                            </div>
                                        </div>
                                        <div className="flex w-full grow flex-col gap-3 sm:flex-row sm:overflow-x-auto scrollbar-hide">
                                            {item.checklist.map((content, contentIndex) => (
                                                <ContentChip key={contentIndex} bosses={checklistForm.bosses} content={content} isMemberGold={item.isGold}/>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="flex w-full flex-col items-end justify-center gap-3 px-4 pb-4 pt-3 sm:flex-row sm:justify-start">
                                <Pagination
                                    showControls
                                    color="primary"
                                    page={page}
                                    onChange={setPage}
                                    total={Math.ceil(activeChecklist.length / maxSize)}/>
                                <p className="ml-auto hidden text-[10pt] fadedtext sm:block">좌우 스크롤은 Shift키를 누르며 마우스 휠로 조작하세요.</p>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="mx-3 mb-3 border-y border-default-200/80 py-2 dark:border-white/10 sm:mx-4">
                                <div className="flex w-full flex-col gap-2 lg1200:flex-row lg1200:items-center lg1200:gap-4">
                                    <div className="flex min-w-0 flex-1 items-center gap-2.5">
                                        <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-default-500" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 6h16M7 12h10M10 18h4"/></svg>
                                        <span className="shrink-0 text-sm font-medium">레이드 필터</span>
                                        <Select
                                            aria-label="남은 레이드 필터"
                                            size="sm"
                                            radius="md"
                                            variant="bordered"
                                            items={raidSelectOptions}
                                            selectedKeys={new Set([selectedRaid])}
                                            onChange={(event) => {
                                                setSelectedRaid(event.target.value || 'all');
                                                setRemainingPage(1);
                                            }}
                                            className="min-w-0 flex-1 sm:max-w-[220px]"
                                            classNames={{
                                                trigger: "h-8 min-h-8 border-default-200 bg-white shadow-none dark:border-white/10 dark:bg-white/[0.035]",
                                                value: "text-xs font-medium"
                                            }}>
                                            {(item) => (
                                                <SelectItem key={item.key}>{item.name}</SelectItem>
                                            )}
                                        </Select>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-default-200/80 pt-2 text-xs dark:border-white/10 lg1200:border-l lg1200:border-t-0 lg1200:py-1 lg1200:pl-4">
                                        <span className="inline-flex items-center gap-1.5 text-default-600 dark:text-default-300"><span className="h-1.5 w-1.5 rounded-full bg-danger"/>미완료 <strong className="font-semibold tabular-nums text-danger">{remainingRaidCount}건</strong></span>
                                        <span className="inline-flex items-center gap-1.5 text-default-600 dark:text-default-300"><svg aria-hidden="true" viewBox="0 0 24 24" className="h-3.5 w-3.5 text-default-500" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="8" r="3"/><path d="M3.5 20v-2a5.5 5.5 0 0 1 11 0v2M17 5a3 3 0 0 1 0 6M17 14a5 5 0 0 1 3.5 5v1"/></svg>대상 캐릭터 <strong className="font-semibold tabular-nums text-foreground">{filteredIncompleteEntries.length}명</strong></span>
                                    </div>
                                    <Checkbox
                                        size="sm"
                                        color="primary"
                                        className="w-full border-t border-default-200/80 pt-2 dark:border-white/10 lg1200:w-auto lg1200:shrink-0 lg1200:border-l lg1200:border-t-0 lg1200:py-1 lg1200:pl-4"
                                        classNames={{ label: "text-xs text-default-600 dark:text-default-300" }}
                                        isSelected={goldOnly}
                                        onValueChange={(isSelected) => {
                                            setGoldOnly(isSelected);
                                            setSelectedRaid('all');
                                            setRemainingPage(1);
                                        }}>
                                        골드 지정 캐릭터 또는 레이드만 보기
                                    </Checkbox>
                                </div>
                            </div>

                            {pageIncompleteEntries.length > 0 ? (
                                <div className="divide-y divide-default-200/80 px-3 dark:divide-white/10 sm:px-4">
                                    {pageIncompleteEntries.map(({ character, raids }) => (
                                        <div
                                            key={character.nickname}
                                            className="flex w-full flex-col gap-3 px-1 py-3 sm:flex-row sm:items-center sm:px-2">
                                            <div className="flex min-w-0 items-center gap-2.5 sm:w-[240px] sm:shrink-0">
                                                <JobAvatar size="sm" job={character.job}/>
                                                <div className="min-w-0 grow">
                                                    <div className="flex min-w-0 items-center gap-1">
                                                        <p className="truncate text-sm font-semibold">{character.nickname}</p>
                                                        {character.isGold ? (
                                                            <img src="/icons/gold.png" alt="goldicon" className="h-[12px] w-[12px] shrink-0"/>
                                                        ) : null}
                                                    </div>
                                                    <p className="truncate text-[11px] fadedtext">Lv.{character.level.toLocaleString()} · {character.job}</p>
                                                </div>
                                            </div>
                                            <div className="flex min-w-0 grow flex-wrap gap-1.5">
                                                {raids.map(raid => (
                                                    <Chip
                                                        key={raid.name}
                                                        size="sm"
                                                        radius="sm"
                                                        color="danger"
                                                        variant="flat"
                                                        classNames={{
                                                            base: "max-w-full border border-danger-100 bg-danger-50/80 dark:border-danger-500/20 dark:bg-danger-500/10",
                                                            content: "truncate text-xs font-medium text-danger-600 dark:text-danger-300"
                                                        }}>
                                                        <span className="flex min-w-0 items-center gap-1">
                                                            {raid.isGold ? <img src="/icons/gold.png" alt="골드 획득 가능" className="h-3 w-3 shrink-0"/> : null}
                                                            <span className="truncate">{raid.name}</span>
                                                            <span className="ml-1 flex shrink-0 items-center gap-1" aria-label={`${raid.stages.length}개 관문`}>
                                                                {raid.stages.map((stage, index) => (
                                                                    <span
                                                                        key={`${stage.stage}-${index}`}
                                                                        role="img"
                                                                        aria-label={`${stage.stage}관문 ${stage.difficulty}`}
                                                                        title={`${stage.stage}관문 · ${stage.difficulty}`}
                                                                        className={clsx("h-2 w-2 rounded-full", getBackgroundByStage(stage.difficulty, false))}/>
                                                                ))}
                                                            </span>
                                                        </span>
                                                    </Chip>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="mx-3 flex min-h-48 flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50/50 px-4 py-8 text-center sm:mx-4 dark:border-white/10 dark:bg-white/[0.02]">
                                    <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-success-50 text-xl font-semibold text-success-600 dark:bg-success-500/10 dark:text-success-300">✓</div>
                                    <p className="text-sm font-semibold">
                                        {selectedRaid === 'all'
                                            ? '이번 주 남은 레이드가 없습니다.'
                                            : '선택한 레이드가 남은 캐릭터가 없습니다.'}
                                    </p>
                                    <p className="mt-1 text-xs fadedtext">
                                        {selectedRaid === 'all'
                                            ? '모든 캐릭터의 레이드 숙제를 완료했어요.'
                                            : '다른 레이드를 선택하거나 전체 목록을 확인해 보세요.'}
                                    </p>
                                </div>
                            )}

                            <div className="flex w-full items-center px-4 pb-4 pt-3">
                                {remainingPageCount > 1 ? (
                                    <Pagination
                                        showControls
                                        color="primary"
                                        page={remainingPage}
                                        onChange={setRemainingPage}
                                        total={remainingPageCount}/>
                                ) : null}
                                <p className="ml-auto text-xs fadedtext">총 {filteredIncompleteEntries.length}명의 캐릭터</p>
                            </div>
                        </>
                    )}
                </CardBody>
            </Card>
        </div>
    )
}
