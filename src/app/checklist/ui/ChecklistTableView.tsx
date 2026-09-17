'use client'

import { useEffect, useMemo, useRef, useState, type WheelEvent } from "react";
import {
    Button,
    Checkbox,
    Popover,
    PopoverContent,
    PopoverTrigger,
    Tooltip,
    Slider
} from "@heroui/react";
import clsx from "clsx";
import type { Selection } from "@heroui/react";
import type { Boss } from "../../api/checklist/boss/route";
import type { AppDispatch } from "../../store/store";
import type { CheckCharacter, Checklist, OtherList } from "../../store/checklistSlice";
import {
    filterChecklist,
    getAllGoldCharacter,
    getBackgroundByStage,
    getBorderByStage,
    getBossesByHaveContent,
    getBossGoldByContent,
    getChecklistContentGoldSummary,
    getCompleteBoundGoldCharacter,
    getCompleteGoldCharacter,
    getDayName,
    getIndexByNickname,
    getSimpleBossName,
    getTypeDayValue,
    handleDayListCheck,
    handleHallsHourglassCheck,
    handleParadiseCheck,
    handleWeekBonusCheckStage,
    handleWeekCheckAll,
    handleWeekCheckStage,
    handleWeekListCheck,
    isCheckHomework,
    useOnClickDayCheck
} from "../lib/checklistFeat";
import { getOtherGoldTotal } from "../lib/otherGold";
import JobEmblemIcon from "@/Icons/JobEmblemIcon";
import OtherGoldManager from "./OtherGoldManager";
import AnimatedNumber from "./AnimatedNumber";
import { SettingIcon } from "../../icons/SettingIcon";

type ChecklistTableViewProps = {
    checklist: CheckCharacter[];
    bosses: Boss[];
    dispatch: AppDispatch;
    server: string;
    filterContent: Selection;
    filterAccount: Selection;
    isRemainHomework: boolean;
    isShowGoldCharacter: boolean;
    isHideCompleteContent: boolean;
    isHideDayContent: boolean;
    isBonusModeEnabled: boolean;
    onOpenContentManager: (characterIndex: number, type: 'day' | 'week') => void;
};

function getStageColor(difficulty: string, disabled: boolean) {
    if (disabled) return '#9ca3af';
    if (difficulty.includes('싱글') || difficulty.includes('매칭')) return '#60a5fa';
    if (difficulty.includes('노말') || difficulty.includes('1단계')) return '#16a34a';
    if (difficulty.includes('하드') || difficulty.includes('2단계')) return '#dc2626';
    if (difficulty.includes('더퍼스트') || difficulty.includes('나이트메어') || difficulty.includes('3단계')) return '#9333ea';
    return '#4b5563';
}

function HourglassIcon() {
    return (
        <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 3h12M6 21h12M8 3c0 4 1.5 6 4 9-2.5 3-4 5-4 9M16 3c0 4-1.5 6-4 9 2.5 3 4 5 4 9"/>
        </svg>
    );
}

function ParadiseIcon() {
    return (
        <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="4"/>
            <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>
        </svg>
    );
}

function MoreIcon() {
    return <span aria-hidden="true" className="text-lg font-bold leading-none">•••</span>;
}

function OtherTasksPopover({
    label,
    items,
    onCheck
}: {
    label: string;
    items: OtherList[];
    onCheck: (index: number) => Promise<void>;
}) {
    const completedCount = items.filter(item => item.isCheck).length;
    return (
        <Popover showArrow placement="bottom">
            <PopoverTrigger>
                <Button isIconOnly size="sm" variant="light" aria-label={label} className="h-9 w-9 min-w-9 cursor-pointer">
                    <MoreIcon/>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[280px] overflow-hidden border border-secondary-200 bg-white p-0 shadow-xl dark:border-secondary-900/60 dark:bg-[#181818]">
                <div className="w-full min-w-0 overflow-hidden">
                    <div className="flex items-center justify-between border-b border-secondary-100 bg-secondary-50/80 px-3 py-2.5 dark:border-secondary-900/40 dark:bg-secondary-950/25">
                        <div>
                            <p className="text-sm font-semibold text-secondary-800 dark:text-secondary-200">{label}</p>
                            <p className="mt-0.5 text-[10px] text-default-500">항목을 눌러 완료 상태를 변경하세요.</p>
                        </div>
                        <span className="shrink-0 rounded-full bg-secondary-100 px-2 py-1 text-[10px] font-semibold text-secondary-700 dark:bg-secondary-900/50 dark:text-secondary-200">{completedCount}/{items.length}</span>
                    </div>
                    {items.length > 0 ? (
                        <div className="max-h-64 min-w-0 space-y-1 overflow-x-hidden overflow-y-auto p-2">
                            {items.map((item, index) => (
                                <Checkbox
                                    key={`${item.name}-${index}`}
                                    size="sm"
                                    radius="full"
                                    isSelected={item.isCheck}
                                    onValueChange={() => void onCheck(index)}
                                    classNames={{ base: clsx("m-0 w-full min-w-0 max-w-none cursor-pointer overflow-hidden rounded-lg border px-2 py-2 transition-colors", item.isCheck ? "border-secondary-200 bg-secondary-50/70 dark:border-secondary-900/60 dark:bg-secondary-950/25" : "border-transparent hover:border-default-200 hover:bg-default-50 dark:hover:border-white/10 dark:hover:bg-white/[0.04]"), wrapper: "shrink-0", label: "min-w-0 truncate text-xs" }}>
                                    {item.name}
                                </Checkbox>
                            ))}
                        </div>
                    ) : <p className="px-3 py-6 text-center text-xs text-default-400">등록된 기타 숙제가 없습니다.</p>}
                </div>
            </PopoverContent>
        </Popover>
    );
}

function DailyContentCell({
    character,
    checklist,
    characterIndex,
    dispatch,
    onOpenManager
}: {
    character: CheckCharacter;
    checklist: CheckCharacter[];
    characterIndex: number;
    dispatch: AppDispatch;
    onOpenManager: () => void;
}) {
    return (
        <div className="grid h-full min-h-20 grid-cols-[minmax(0,1fr)_36px_36px] divide-x divide-default-200 dark:divide-white/10">
            <div className="flex min-w-0 flex-col justify-center gap-1 p-1.5">
                {(['전선', '가디언'] as const).map(type => {
                    const dayValue = getTypeDayValue(character, type);
                    const isChecked = dayValue.value > 0;
                    return (
                        <button
                            key={type}
                            type="button"
                            onClick={useOnClickDayCheck(checklist, character.nickname, type, character.day, dispatch)}
                            className={clsx(
                                "flex h-8 w-full cursor-pointer items-center justify-between rounded-md border px-2 text-left text-[11px] transition-colors",
                                isChecked ? "border-success-300 bg-success-100 text-success-800 dark:border-success-700 dark:bg-success-900/35 dark:text-success-200" : "border-default-200 hover:bg-default-100 dark:border-white/10 dark:hover:bg-white/[0.06]"
                            )}>
                            <span className="truncate">{getDayName(type, character.level)}</span>
                            <span className="ml-1 shrink-0 font-semibold">{isChecked ? '완료' : dayValue.restValue}</span>
                        </button>
                    );
                })}
            </div>
            <div className="flex items-center justify-center">
                <OtherTasksPopover label="일일 기타 숙제" items={character.daylist} onCheck={index => handleDayListCheck(checklist, characterIndex, index, dispatch)}/>
            </div>
            <button type="button" onClick={onOpenManager} className="flex cursor-pointer items-center justify-center text-default-500 transition-colors hover:bg-default-100 dark:hover:bg-white/[0.06]" aria-label={`${character.nickname} 일일 콘텐츠 설정`}><SettingIcon size={16}/></button>
        </div>
    );
}

function WeeklyContentCell({
    content,
    bosses,
    checklist,
    characterIndex,
    checklistIndex,
    dispatch,
    isBonusModeEnabled
}: {
    content?: Checklist;
    bosses: Boss[];
    checklist: CheckCharacter[];
    characterIndex: number;
    checklistIndex: number;
    dispatch: AppDispatch;
    isBonusModeEnabled: boolean;
}) {
    if (!content || checklistIndex < 0) {
        return <div className="flex h-full min-h-20 items-center justify-center px-2 text-center text-[11px] text-default-400">콘텐츠 없음</div>;
    }

    const character = checklist[characterIndex];
    const summary = getChecklistContentGoldSummary(bosses, content, character.isGold);
    const isComplete = isCheckHomework(content);
    const isGoldContent = content.isGold;

    return (
        <div
            role="button"
            tabIndex={0}
            aria-label={`${content.name} ${isBonusModeEnabled ? '더보기' : '관문'} 전체 ${isComplete ? '해제' : '체크'}`}
            onClick={() => void handleWeekCheckAll(checklist, characterIndex, checklistIndex, dispatch, isBonusModeEnabled)}
            onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); void handleWeekCheckAll(checklist, characterIndex, checklistIndex, dispatch, isBonusModeEnabled); } }}
            className={clsx("flex h-full min-h-20 cursor-pointer flex-col justify-center gap-2.5 p-2.5 transition-colors", isComplete && "bg-success-50/85 dark:bg-success-950/30")}>
            <div className="flex min-w-0 items-center justify-start gap-2 text-left text-[10px]">
                <span className="min-w-0 truncate font-semibold text-blue-600 dark:text-blue-400">일반 {summary.gold.toLocaleString()}</span>
                <span className="min-w-0 truncate font-semibold text-amber-600 dark:text-amber-400">귀속 {summary.boundGold.toLocaleString()}</span>
                {isGoldContent ? <img src="/icons/gold.png" alt="골드 획득 콘텐츠" className="ml-auto h-3.5 w-3.5 shrink-0" /> : null}
            </div>
            <div className="flex w-full gap-1.5 rounded-lg border border-default-200 bg-white/80 p-1 shadow-sm dark:border-white/10 dark:bg-black/10">
                {content.items.map((item, itemIndex) => {
                    const stageGold = getBossGoldByContent(bosses, content.name, item.stage, item.difficulty);
                    const isActive = isBonusModeEnabled ? item.isBonus : item.isCheck;
                    const showBonusDot = item.isBonus && stageGold.bonus > 0;
                    return (
                        <Popover key={`${item.stage}-${itemIndex}`} showArrow placement="bottom">
                            <PopoverTrigger>
                                <button
                                    type="button"
                                    disabled={item.isDisable}
                                    onClick={(event) => { event.stopPropagation(); return void (isBonusModeEnabled
                                        ? handleWeekBonusCheckStage(checklist, characterIndex, checklistIndex, dispatch, item.stage)
                                        : handleWeekCheckStage(checklist, characterIndex, checklistIndex, dispatch, item.stage, item.isDisable)); }}
                                    style={isActive ? {
                                        backgroundColor: isBonusModeEnabled ? '#fcd34d' : getStageColor(item.difficulty, item.isDisable),
                                        color: isBonusModeEnabled ? '#451a03' : '#ffffff',
                                        opacity: 0.82
                                    } : undefined}
                                    className={clsx(
                                        "relative flex h-7 min-w-0 flex-1 cursor-pointer items-center justify-center rounded-md border text-[10px] font-semibold shadow-sm transition-all hover:z-10 hover:-translate-y-px hover:shadow disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0",
                                        getBorderByStage(item.difficulty, item.isDisable),
                                        isActive ? `${isBonusModeEnabled ? "!border-amber-600 !bg-amber-300/75 !text-amber-950" : getBackgroundByStage(item.difficulty, item.isDisable)} bg-opacity-80 text-white` : "bg-white hover:bg-default-100 dark:bg-[#181818] dark:hover:bg-white/[0.06]"
                                    )}
                                    aria-label={`${content.name} ${item.stage} ${isBonusModeEnabled ? (item.isBonus ? '더보기 해제' : '더보기') : (item.isCheck ? '완료 해제' : '완료')}`}>
                                    <span>{item.stage}</span>
                                    {showBonusDot ? <span className={clsx(
                                        "absolute right-1 top-1 h-2 w-2 rounded-full",
                                        item.isBonus ? "bg-yellow-400 dark:bg-yellow-300" : "bg-yellow-600 dark:bg-yellow-300"
                                    )}/> : null}
                                </button>
                            </PopoverTrigger>
                            <PopoverContent className="border border-default-200 bg-white p-3 text-xs shadow-xl dark:border-white/10 dark:bg-[#181818]">
                                <div>
                                    <p className="font-semibold">{item.stage}관문 · {item.difficulty}</p>
                                    <p className="mt-1 text-default-500">일반 {stageGold.gold.toLocaleString()} · 귀속 {stageGold.boundGold.toLocaleString()}</p>
                                    <p className="mt-0.5 text-default-500">더보기 {stageGold.bonus.toLocaleString()}</p>
                                </div>
                            </PopoverContent>
                        </Popover>
                    );
                })}
            </div>
        </div>
    );
}

function FixedWeeklyCell({ character, checklist, characterIndex, dispatch }: { character: CheckCharacter; checklist: CheckCharacter[]; characterIndex: number; dispatch: AppDispatch }) {
    const showHourglass = character.level >= 1730 && character.hallsHourglassVisible !== false;
    const showParadise = character.level >= 1640 && character.paradiseVisible !== false;
    return (
        <div className="flex h-full min-h-20 items-center justify-center gap-1 p-1">
            <OtherTasksPopover label="주간 기타 숙제" items={character.weeklist} onCheck={index => handleWeekListCheck(checklist, characterIndex, index, dispatch)}/>
            {showHourglass ? (
                <Tooltip content="할의 모래시계">
                    <button
                        type="button"
                        onClick={() => void handleHallsHourglassCheck(checklist, character.nickname, !(character.hallsHourglassCheck ?? false), dispatch)}
                        className={clsx("flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border-2 transition-colors", character.hallsHourglassCheck ? "border-blue-500 bg-blue-500 text-white" : "border-blue-500 bg-transparent text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/30")}
                        aria-pressed={character.hallsHourglassCheck ?? false}
                        aria-label={`${character.nickname} 할의 모래시계`}><HourglassIcon/></button>
                </Tooltip>
            ) : null}
            {showParadise ? (
                <Tooltip content="낙원">
                    <button
                        type="button"
                        onClick={() => void handleParadiseCheck(checklist, character.nickname, !(character.paradiseCheck ?? false), dispatch)}
                        className={clsx("flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border-2 transition-colors", character.paradiseCheck ? "border-yellow-500 bg-yellow-500 text-white" : "border-yellow-500 bg-transparent text-yellow-600 hover:bg-yellow-50 dark:text-yellow-400 dark:hover:bg-yellow-950/30")}
                        aria-pressed={character.paradiseCheck ?? false}
                        aria-label={`${character.nickname} 낙원`}><ParadiseIcon/></button>
                </Tooltip>
            ) : null}
            {!showHourglass && !showParadise ? <span className="text-[10px] text-default-400">콘텐츠 없음</span> : null}
        </div>
    );
}

export default function ChecklistTableView({
    checklist,
    bosses,
    dispatch,
    server,
    filterContent,
    filterAccount,
    isRemainHomework,
    isShowGoldCharacter,
    isHideCompleteContent,
    isHideDayContent,
    isBonusModeEnabled,
    onOpenContentManager
}: ChecklistTableViewProps) {
    const [expandedGoldNickname, setExpandedGoldNickname] = useState<string | null>(null);
    const [scrollLeft, setScrollLeft] = useState(0);
    const [contentViewportWidth, setContentViewportWidth] = useState(0);
    const contentViewportRef = useRef<HTMLDivElement>(null);

    const visibleCharacters = useMemo(() => checklist.filter(character =>
        (character.server === server || server === '전체') &&
        filterChecklist(character, filterContent, bosses, checklist, isRemainHomework, isShowGoldCharacter, filterAccount)
    ), [bosses, checklist, filterAccount, filterContent, isRemainHomework, isShowGoldCharacter, server]);

    const contentNames = useMemo(() => getBossesByHaveContent(visibleCharacters, bosses).filter(name => {
        if (!isHideCompleteContent) return true;
        return visibleCharacters.some(character => {
            const content = character.checklist.find(item => item.name === name);
            return content && !isCheckHomework(content);
        });
    }), [bosses, isHideCompleteContent, visibleCharacters]);

    const dailyColumnWidth = 260;
    const weeklyColumnWidth = 168;
    const contentStripWidth = (isHideDayContent ? 0 : dailyColumnWidth) + contentNames.length * weeklyColumnWidth;
    const maxScrollLeft = Math.max(0, contentStripWidth - contentViewportWidth);
    const contentTransform = { width: contentStripWidth, transform: `translateX(-${scrollLeft}px)` };
    const handleContentWheel = (event: WheelEvent<HTMLDivElement>) => {
        if (!event.shiftKey || maxScrollLeft <= 0) return;
        event.preventDefault();
        const delta = Math.abs(event.deltaY) > Math.abs(event.deltaX) ? event.deltaY : event.deltaX;
        setScrollLeft(current => Math.max(0, Math.min(maxScrollLeft, current + delta)));
    };

    useEffect(() => {
        const element = contentViewportRef.current;
        if (!element) return;
        const updateWidth = () => {
            setContentViewportWidth(element.clientWidth);
            setScrollLeft(current => Math.min(current, Math.max(0, contentStripWidth - element.clientWidth)));
        };
        updateWidth();
        const observer = new ResizeObserver(updateWidth);
        observer.observe(element);
        return () => observer.disconnect();
    }, [contentStripWidth]);

    if (visibleCharacters.length === 0) {
        return <div className="mt-5 rounded-2xl border border-dashed border-default-300 bg-default-50/50 px-6 py-16 text-center text-sm text-default-500 dark:border-white/10 dark:bg-white/[0.02]">조건에 맞는 캐릭터가 없습니다.</div>;
    }

    return (
        <section className="mt-5 overflow-hidden rounded-2xl border border-default-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#171717]">
            <div className="checklist-table-scroll h-[calc(100vh-520px)] min-h-[300px] overflow-x-hidden overflow-y-auto overscroll-contain min-[1500px]:h-[calc(100vh-440px)] min-[1500px]:min-h-[360px]">
                <div className="sticky top-0 z-40 grid grid-cols-[260px_minmax(0,1fr)_184px] border-b border-default-200 bg-default-50/95 shadow-sm backdrop-blur dark:border-white/10 dark:bg-[#202020]/95">
                    <div className="h-16 border-r border-default-200 dark:border-white/10"><span className="sr-only">캐릭터 정보</span></div>
                    <div ref={contentViewportRef} className="min-w-0 overflow-hidden" onWheel={handleContentWheel}>
                        <div className="flex h-16 transition-transform duration-150" style={contentTransform}>
                            {!isHideDayContent ? <div className="flex shrink-0 items-center justify-center border-r border-default-200 bg-success-50/80 text-xs font-semibold text-success-700 dark:border-white/10 dark:bg-success-950/30 dark:text-success-300" style={{ width: dailyColumnWidth }}>일일 콘텐츠</div> : null}
                            {contentNames.map(name => <div key={name} className="flex shrink-0 items-center justify-center border-r border-default-200 px-3 text-center text-sm font-semibold dark:border-white/10" style={{ width: weeklyColumnWidth }}>{getSimpleBossName(bosses, name)}</div>)}
                        </div>
                    </div>
                    <div className="grid grid-cols-[132px_52px] divide-x divide-secondary-200 border-l border-secondary-200 bg-secondary-50/95 text-secondary-700 dark:divide-secondary-900/60 dark:border-secondary-900/60 dark:bg-secondary-950/25 dark:text-secondary-300">
                        <div className="flex h-16 items-center justify-center px-2 text-center text-xs font-semibold">기타 주간</div>
                        <div className="flex h-16 items-center justify-center"><SettingIcon size={18}/></div>
                    </div>
                </div>
                {visibleCharacters.map(character => {
                    const characterIndex = getIndexByNickname(checklist, character.nickname);
                    const isGoldExpanded = expandedGoldNickname === character.nickname;
                    return (
                        <div key={character.nickname} className="border-b border-default-200 last:border-b-0 dark:border-white/10">
                            <div className="grid grid-cols-[260px_minmax(0,1fr)_184px]">
                                <button
                                    type="button"
                                    onClick={() => setExpandedGoldNickname(isGoldExpanded ? null : character.nickname)}
                                    className={clsx("flex min-h-20 w-[260px] cursor-pointer items-center gap-3 border-r border-default-200 bg-white px-4 py-3 text-left transition-colors hover:bg-default-50 dark:border-white/10 dark:bg-[#171717] dark:hover:bg-white/[0.04]", isGoldExpanded && "bg-warning-50 dark:bg-warning-950/20")}
                                    aria-expanded={isGoldExpanded}>
                                    <JobEmblemIcon job={character.job} size={38} className="shrink-0"/>
                                    <div className="min-w-0 grow">
                                        <p className="truncate text-sm font-semibold">{character.nickname}</p>
                                        <p className="mt-0.5 truncate text-[11px] text-default-500">Lv.{character.level} · {character.job}</p>
                                        <div className="mt-1.5 flex items-center gap-1 text-[11px] font-semibold text-warning-700 dark:text-warning-400">
                                            <img src="/icons/gold.png" alt="" className="h-3.5 w-3.5"/>
                                            <AnimatedNumber value={getCompleteGoldCharacter(bosses, character) + getOtherGoldTotal(character)}/>
                                            <span>/</span>
                                            <AnimatedNumber value={getAllGoldCharacter(bosses, character) + getOtherGoldTotal(character)}/>
                                        </div>
                                    </div>
                                </button>
                                 <div className="min-w-0 overflow-hidden" onWheel={handleContentWheel}>
                                    <div className="flex h-full transition-transform duration-150" style={contentTransform}>
                                        {!isHideDayContent ? (
                                            <div className="shrink-0 border-r border-default-200 dark:border-white/10" style={{ width: dailyColumnWidth }}>
                                                <DailyContentCell
                                                    character={character}
                                                    checklist={checklist}
                                                    characterIndex={characterIndex}
                                                    dispatch={dispatch}
                                                    onOpenManager={() => onOpenContentManager(characterIndex, 'day')}/>
                                            </div>
                                        ) : null}
                                        {contentNames.map(name => {
                                            const checklistIndex = character.checklist.findIndex(item => item.name === name);
                                            return <div key={name} className="shrink-0 border-r border-default-200 dark:border-white/10" style={{ width: weeklyColumnWidth }}><WeeklyContentCell content={character.checklist[checklistIndex]} bosses={bosses} checklist={checklist} characterIndex={characterIndex} checklistIndex={checklistIndex} dispatch={dispatch} isBonusModeEnabled={isBonusModeEnabled}/></div>;
                                        })}
                                    </div>
                                </div>
                                <div className="grid grid-cols-[132px_52px] divide-x divide-secondary-100 border-l border-secondary-200 bg-secondary-50/15 dark:divide-secondary-900/40 dark:border-secondary-900/60 dark:bg-secondary-950/5">
                                    <FixedWeeklyCell character={character} checklist={checklist} characterIndex={characterIndex} dispatch={dispatch}/>
                                    <button type="button" onClick={() => onOpenContentManager(characterIndex, 'week')} className="flex min-h-20 cursor-pointer items-center justify-center text-secondary-600 transition-colors hover:bg-secondary-50 dark:text-secondary-300 dark:hover:bg-secondary-950/25" aria-label={`${character.nickname} 주간 콘텐츠 관리`}><SettingIcon size={19}/></button>
                                </div>
                            </div>
                            {isGoldExpanded ? (
                                <div className="w-full border-t border-warning-200 bg-gradient-to-r from-warning-50/80 to-white p-4 dark:border-warning-900/50 dark:from-warning-950/20 dark:to-[#171717]">
                                    <div className="grid grid-cols-3 gap-3">
                                        {[
                                            ['획득 콘텐츠 골드', getCompleteGoldCharacter(bosses, character)],
                                            ['획득 귀속 골드', getCompleteBoundGoldCharacter(bosses, character)],
                                            ['부수입', getOtherGoldTotal(character)]
                                        ].map(([label, value]) => (
                                            <div key={label} className="rounded-xl border border-warning-100 bg-white/80 px-3 py-2.5 dark:border-warning-900/30 dark:bg-white/[0.03]">
                                                <p className="text-[11px] text-default-500">{label}</p>
                                                <div className="mt-1 flex items-center gap-1.5 font-semibold text-warning-700 dark:text-warning-400">
                                                    <img src="/icons/gold.png" alt="" className="h-4 w-4 shrink-0"/>
                                                    <span>{Number(value).toLocaleString()}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-3 border-t border-warning-100 pt-3 dark:border-warning-900/30">
                                        <p className="mb-2 text-xs font-semibold text-default-600 dark:text-default-300">부수입 설정</p>
                                        <OtherGoldManager character={character} dispatch={dispatch} layout="inline"/>
                                    </div>
                                </div>
                            ) : null}
                        </div>
                    );
                })}
            </div>
            {maxScrollLeft > 0 ? <div className="grid grid-cols-[260px_minmax(0,1fr)_184px] border-t border-default-200 bg-white/95 shadow-[0_-4px_12px_rgba(0,0,0,0.05)] backdrop-blur dark:border-white/10 dark:bg-[#171717]/95">
                <div className="border-r border-default-200 dark:border-white/10"/>
                <div className="px-4 py-2">
                    <Slider
                        aria-label="콘텐츠 가로 스크롤"
                        size="sm"
                        minValue={0}
                        maxValue={maxScrollLeft}
                        step={1}
                        value={Math.min(scrollLeft, maxScrollLeft)}
                        onChange={(value) => setScrollLeft(Array.isArray(value) ? value[0] : value)}
                        classNames={{ track: "bg-default-200", filler: "bg-primary", thumb: "bg-primary" }}/>
                </div>
                <div className="border-l border-secondary-200 dark:border-secondary-900/60"/>
            </div> : null}
        </section>
    );
}
