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
    getCompleteChecklistByStage,
    getHaveGolds
} from "../../checklist/lib/checklistFeat";
import {
    Card,
    CardBody,
    CardHeader,
    Chip,
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
import CutCircularProgress from "../../components/ui/CutCircularProgress";
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
                className="overflow-hidden border border-gray-200/80 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.05)] dark:border-white/10 dark:bg-[#171717] dark:shadow-none">
                <CardHeader className="block p-0">
                    <div className="flex flex-col items-start gap-3 border-b border-gray-200/80 px-4 py-4 sm:flex-row sm:items-center sm:px-5 dark:border-white/10">
                        <div className="min-w-0 grow">
                            <div className="flex items-center gap-2">
                                <span className="h-5 w-1 rounded-full bg-primary"/>
                                <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">주간 숙제 현황</h2>
                            </div>
                            <p className="mt-1 pl-3 text-xs fadedtext sm:text-sm">이번 주 골드와 캐릭터별 숙제 진행 상황을 확인해 보세요.</p>
                        </div>
                        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:justify-end">
                            <Chip size="sm" radius="sm" variant="flat" color="warning" className="shrink-0">
                                <span className="flex items-center gap-1">
                                    <img src="/icons/gold.png" alt="goldicon" className="h-[12px] w-[12px]"/>
                                    골드 획득 {goldCharacters}명
                                </span>
                            </Chip>
                            <Chip size="sm" radius="sm" variant="flat" className="shrink-0">
                                비획득 {nonGoldCharacters}명
                            </Chip>
                        </div>
                    </div>

                    <div className="grid w-full grid-cols-1 gap-3 p-3 sm:p-4 lg1200:grid-cols-[minmax(330px,1.15fr)_minmax(300px,1fr)_minmax(250px,0.82fr)]">
                        <div className="grid h-full grid-rows-2 gap-2 rounded-xl border border-gray-200/80 bg-gray-50/60 p-2 dark:border-white/10 dark:bg-white/[0.025]">
                            <CutCircularProgress
                                label="주간 골드량"
                                size={isMobile ? 70 : 76}
                                strokeWidth={8}
                                isMobile={isMobile}
                                value={weeklyGold}
                                max={totalGold}
                                progressClassName="stroke-warning"/>
                            <CutCircularProgress
                                label="숙제 진행 상황"
                                size={isMobile ? 70 : 76}
                                strokeWidth={8}
                                isMobile={isMobile}
                                value={completedHomework}
                                max={totalHomework}
                                progressClassName="stroke-secondary"/>
                        </div>

                        <div className="rounded-xl border border-gray-200/80 bg-gray-50/60 p-3 dark:border-white/10 dark:bg-white/[0.025]">
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
                                        <div className="flex items-center gap-1">
                                            <Chip size="sm" color="success" variant="flat" radius="sm" className="mr-1">거래 가능 골드</Chip>
                                            <img src="/icons/gold.png" alt="goldicon" className="h-[14px] w-[14px]"/>
                                            <p>{tradableGold.toLocaleString()}</p>
                                        </div>
                                    }
                                    value={tradableGold}
                                    maxValue={weeklyGold}
                                    className="w-full"/>
                                <Progress
                                    showValueLabel={weeklyGold > 0}
                                    radius="sm"
                                    size="sm"
                                    color="warning"
                                    label={
                                        <div className="flex items-center gap-1">
                                            <Chip size="sm" color="warning" variant="flat" radius="sm" className="mr-1">귀속 골드</Chip>
                                            <img src="/icons/gold.png" alt="goldicon" className="h-[14px] w-[14px]"/>
                                            <p>{boundGold.toLocaleString()}</p>
                                        </div>
                                    }
                                    value={boundGold}
                                    maxValue={weeklyGold}
                                    className="w-full"/>
                                <Progress
                                    showValueLabel={weeklyGold > 0}
                                    radius="sm"
                                    size="sm"
                                    color="secondary"
                                    label={
                                        <div className="flex items-center gap-1">
                                            <Chip size="sm" color="secondary" variant="flat" radius="sm" className="mr-1">부수입</Chip>
                                            <img src="/icons/gold.png" alt="goldicon" className="h-[14px] w-[14px]"/>
                                            <p>{otherGold.toLocaleString()}</p>
                                        </div>
                                    }
                                    value={otherGold}
                                    maxValue={weeklyGold}
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

                        <div className="rounded-xl border border-gray-200/80 bg-gray-50/60 p-4 dark:border-white/10 dark:bg-white/[0.025]">
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
                            <div className="mx-3 mb-3 rounded-xl border border-gray-200/80 bg-gray-50/70 p-3 dark:border-white/10 dark:bg-white/[0.025] sm:mx-4">
                                <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-start">
                                    <Select
                                        aria-label="남은 레이드 필터"
                                        label="레이드 필터"
                                        size="sm"
                                        radius="lg"
                                        variant="bordered"
                                        items={raidSelectOptions}
                                        selectedKeys={new Set([selectedRaid])}
                                        onChange={(event) => {
                                            setSelectedRaid(event.target.value || 'all');
                                            setRemainingPage(1);
                                        }}
                                        className="w-full sm:w-[280px] sm:shrink-0"
                                        classNames={{
                                            trigger: "border-gray-200 bg-white shadow-none dark:border-white/10 dark:bg-white/[0.035]",
                                            label: "fadedtext"
                                        }}>
                                        {(item) => (
                                            <SelectItem key={item.key}>{item.name}</SelectItem>
                                        )}
                                    </Select>
                                    <div className="hidden flex-1 sm:block" />
                                    <div className="flex flex-col items-end gap-1 text-xs sm:shrink-0">
                                    <div className="flex flex-wrap items-center justify-end gap-2">
                                        <Chip size="sm" radius="sm" color="danger" variant="flat">미완료 {remainingRaidCount}건</Chip>
                                        <span className="fadedtext">대상 캐릭터 {filteredIncompleteEntries.length}명</span>
                                    </div>
                                    <Checkbox
                                        size="sm"
                                        color="warning"
                                        className="self-end pb-0"
                                        classNames={{ label: "whitespace-nowrap text-right" }}
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
                            </div>

                            {pageIncompleteEntries.length > 0 ? (
                                <div className="space-y-2 px-3 sm:px-4">
                                    {pageIncompleteEntries.map(({ character, raids }) => (
                                        <div
                                            key={character.nickname}
                                            className="flex w-full flex-col gap-3 rounded-xl border border-gray-200/80 bg-white px-3 py-3 shadow-[0_2px_10px_rgba(15,23,42,0.03)] sm:flex-row sm:items-center sm:px-4 dark:border-white/10 dark:bg-white/[0.025] dark:shadow-none">
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
                                                <Chip
                                                    size="sm"
                                                    radius="sm"
                                                    color="danger"
                                                    variant="flat"
                                                    className="shrink-0 sm:hidden">
                                                    {raids.length}개
                                                </Chip>
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
                                                        </span>
                                                    </Chip>
                                                ))}
                                            </div>
                                            <Chip
                                                size="sm"
                                                radius="sm"
                                                color="danger"
                                                variant="flat"
                                                className="hidden shrink-0 sm:flex">
                                                미완료 {raids.length}개
                                            </Chip>
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
