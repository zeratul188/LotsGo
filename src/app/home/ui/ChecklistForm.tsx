import { useEffect, useState } from "react";
import { CheckCharacter } from "../../store/checklistSlice";
import { getFixedWeeklyContentStatuses, groupByLevel10, isCompleteHomeworkByCharacter, isLogin, loadChecklist } from "../lib/checklistFeat";
import { LoadingComponent } from "../../UtilsCompnents";
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
    Pagination,
    Progress,
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
        return <LoadingComponent heightStyle="min-h-[240px]"/>
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
                        <div className="flex items-center justify-center gap-4 rounded-xl border border-gray-200/80 bg-gray-50/60 px-2 py-3 sm:gap-6 dark:border-white/10 dark:bg-white/[0.025]">
                            <CutCircularProgress
                                label="주간 골드량"
                                size={isMobile ? 140 : 160}
                                strokeWidth={12}
                                isMobile={isMobile}
                                value={weeklyGold}
                                max={totalGold}
                                progressClassName="stroke-warning"/>
                            <CutCircularProgress
                                label="숙제 진행 상황"
                                size={isMobile ? 140 : 160}
                                strokeWidth={12}
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
                                                    key={character.nickname}
                                                    content={
                                                        <span className="flex items-center gap-1 py-1">
                                                            <p>{character.nickname}</p>
                                                            <p className="mr-2 text-[8pt] fadedtext">Lv.{character.level}</p>
                                                            <Chip size="sm" variant="flat" radius="sm" color={isCompleteHomeworkByCharacter(character) ? 'success' : 'danger'}>{isCompleteHomeworkByCharacter(character) ? '완료' : '미완료'}</Chip>
                                                        </span>
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
                        <div className="ml-auto flex items-center gap-2 text-xs fadedtext">
                            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-success"/>완료</span>
                            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-danger"/>미완료</span>
                        </div>
                    </div>
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
                </CardBody>
            </Card>
        </div>
    )
}
