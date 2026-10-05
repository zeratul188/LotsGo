'use client'

import { useEffect, useLayoutEffect, useMemo, useRef, useState, type WheelEvent } from "react";
import {
    Chip,
    Checkbox,
    Divider,
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
    getBossesByHaveContent,
    getBossGoldByContent,
    getChecklistContentGoldSummary,
    getCompleteBoundGoldCharacter,
    getCompleteGoldCharacter,
    getDayName,
    getIndexByNickname,
    getSimpleBossName,
    getTextColorByDifficulty,
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
import ParadiseIcon from "@/Icons/ParadiseIcon";
import OtherGoldManager from "./OtherGoldManager";
import AnimatedNumber from "./AnimatedNumber";
import { SettingIcon } from "../../icons/SettingIcon";
import type { ReactNode } from "react";

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
    autoChecklistNickname: string;
    isAutoChecklistSharing: boolean;
    onSelectAutoChecklistCharacter: (nickname: string) => void;
    renderCharacterSettings: (characterIndex: number) => ReactNode;
};

function getStageButtonClass(difficulty: string, disabled: boolean, active: boolean, bonusMode: boolean) {
    if (disabled) return 'border-gray-200 bg-gray-100 text-gray-400 dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-500';
    if (bonusMode && active) return 'border-amber-400 bg-amber-200 text-amber-900 hover:bg-amber-300/80 dark:border-amber-400/70 dark:bg-amber-900/80 dark:text-amber-100 dark:hover:bg-amber-800/80';
    if (difficulty.includes('싱글') || difficulty.includes('매칭')) return active
        ? 'border-blue-400 bg-blue-200 text-blue-900 hover:bg-blue-300/80 dark:border-blue-400/70 dark:bg-blue-900/80 dark:text-blue-100 dark:hover:bg-blue-800/80'
        : 'border-slate-200 bg-white text-blue-600 hover:border-blue-300 hover:bg-blue-50 dark:border-slate-700 dark:bg-[#202025] dark:text-blue-300 dark:hover:border-blue-500/60 dark:hover:bg-blue-950/50';
    if (difficulty.includes('노말') || difficulty.includes('1단계')) return active
        ? 'border-green-400 bg-green-200 text-green-900 hover:bg-green-300/80 dark:border-green-400/70 dark:bg-green-900/80 dark:text-green-100 dark:hover:bg-green-800/80'
        : 'border-slate-200 bg-white text-green-700 hover:border-green-300 hover:bg-green-50 dark:border-slate-700 dark:bg-[#202025] dark:text-green-300 dark:hover:border-green-500/60 dark:hover:bg-green-950/50';
    if (difficulty.includes('하드') || difficulty.includes('2단계')) return active
        ? 'border-red-400 bg-red-200 text-red-900 hover:bg-red-300/80 dark:border-red-400/70 dark:bg-red-900/80 dark:text-red-100 dark:hover:bg-red-800/80'
        : 'border-slate-200 bg-white text-red-600 hover:border-red-300 hover:bg-red-50 dark:border-slate-700 dark:bg-[#202025] dark:text-red-300 dark:hover:border-red-500/60 dark:hover:bg-red-950/50';
    if (difficulty.includes('더퍼스트') || difficulty.includes('나이트메어') || difficulty.includes('3단계')) return active
        ? 'border-purple-400 bg-purple-200 text-purple-900 hover:bg-purple-300/80 dark:border-purple-400/70 dark:bg-purple-900/80 dark:text-purple-100 dark:hover:bg-purple-800/80'
        : 'border-slate-200 bg-white text-purple-600 hover:border-purple-300 hover:bg-purple-50 dark:border-slate-700 dark:bg-[#202025] dark:text-purple-300 dark:hover:border-purple-500/60 dark:hover:bg-purple-950/50';
    return active
        ? 'border-gray-400 bg-gray-200 text-gray-900 hover:bg-gray-300/80 dark:border-gray-400/70 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600'
        : 'border-gray-300 bg-gray-50 text-gray-700 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300';
}

function HourglassIcon() {
    return (
        <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 3h12M6 21h12M8 3c0 4 1.5 6 4 9-2.5 3-4 5-4 9M16 3c0 4-1.5 6-4 9 2.5 3 4 5 4 9"/>
        </svg>
    );
}

function DailyContentIcon({ type }: { type: '전선' | '가디언' }) {
    const image = type === '전선' ? '/icons/chaos-rift.png' : '/icons/guardian-daily.png';
    const size = type === '전선' ? 'contain' : '150%';
    return (
        <span
            aria-hidden="true"
            className="block h-6 w-6 bg-current"
            style={{
                maskImage: `url(${image})`,
                WebkitMaskImage: `url(${image})`,
                maskSize: size,
                WebkitMaskSize: size,
                maskPosition: 'center',
                WebkitMaskPosition: 'center',
                maskRepeat: 'no-repeat',
                WebkitMaskRepeat: 'no-repeat'
            }}/>
    );
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
    const isComplete = items.length > 0 && completedCount === items.length;
    return (
        <Popover showArrow placement="bottom">
            <PopoverTrigger>
                <button
                    type="button"
                    aria-label={`${label} ${completedCount}/${items.length} 완료`}
                    className={clsx(
                        "flex h-9 w-9 min-w-9 cursor-pointer items-center justify-center rounded-lg border-2 px-0.5 text-[10px] font-semibold tabular-nums transition-colors",
                        isComplete
                            ? "border-success-500 bg-success-200/50 text-success-800 hover:bg-success-200/70 dark:border-emerald-500 dark:bg-emerald-950/70 dark:text-emerald-100 dark:hover:bg-emerald-900/70"
                            : "border-default-400 bg-default-50 text-default-700 hover:bg-default-100 dark:border-slate-500 dark:bg-slate-800/60 dark:text-slate-100 dark:hover:bg-slate-700/60"
                    )}>
                    {completedCount}/{items.length}
                </button>
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
        <div className="flex h-full min-h-20 items-center justify-center gap-1.5 px-1.5">
            {(['전선', '가디언'] as const).map(type => {
                const dayValue = getTypeDayValue(character, type);
                const isChecked = dayValue.value > 0;
                const restStep = type === '전선' ? 40 : 20;
                const restDots = Math.min(5, Math.max(0, Math.floor(dayValue.restValue / restStep)));
                const label = getDayName(type, character.level);
                return (
                    <div key={type} className="flex w-9 shrink-0 flex-col items-center gap-1">
                        <Tooltip content={label}>
                            <button
                                type="button"
                                onClick={useOnClickDayCheck(checklist, character.nickname, type, character.day, dispatch)}
                                aria-label={`${character.nickname} ${label} ${isChecked ? '완료 해제' : '완료'} · 휴식 게이지 ${dayValue.restValue}`}
                                aria-pressed={isChecked}
                                className={clsx(
                                    "flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border-2 transition-colors",
                                    type === '전선'
                                        ? isChecked ? "border-purple-500 bg-purple-500 text-white" : "border-purple-500 bg-transparent text-purple-500 hover:bg-purple-50 dark:hover:bg-purple-950/30"
                                        : isChecked ? "border-red-500 bg-red-500 text-white" : "border-red-500 bg-transparent text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
                                )}>
                                <DailyContentIcon type={type}/>
                            </button>
                        </Tooltip>
                        <span aria-hidden="true" className="flex h-1.5 items-center justify-center gap-0.5">
                            {Array.from({ length: restDots }, (_, index) => <span key={index} className="h-1 w-1 rounded-full bg-green-500"/>)}
                        </span>
                    </div>
                );
            })}
            {character.daylist.length > 0 && (
                <div className="flex w-9 shrink-0 flex-col items-center gap-1">
                    <OtherTasksPopover label="일일 기타 숙제" items={character.daylist} onCheck={index => handleDayListCheck(checklist, characterIndex, index, dispatch)}/>
                    <span aria-hidden="true" className="h-1.5"/>
                </div>
            )}
            <button type="button" onClick={onOpenManager} className="flex h-8 w-6 shrink-0 cursor-pointer items-center justify-center rounded-md text-default-500 transition-colors hover:bg-default-100 dark:hover:bg-white/[0.06]" aria-label={`${character.nickname} 일일 콘텐츠 설정`}><SettingIcon size={16}/></button>
        </div>
    );
}

function DelayedStageTooltip({ children, content }: { children: ReactNode; content: ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);
    const openTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const close = () => {
        if (openTimer.current !== null) {
            clearTimeout(openTimer.current);
            openTimer.current = null;
        }
        setIsOpen(false);
    };

    useEffect(() => () => {
        if (openTimer.current !== null) clearTimeout(openTimer.current);
    }, []);

    return (
        <Tooltip showArrow placement="top" trigger="focus" isOpen={isOpen} content={content}>
            <span
                className="flex min-w-0 flex-1"
                onMouseEnter={() => {
                    if (openTimer.current !== null) clearTimeout(openTimer.current);
                    openTimer.current = setTimeout(() => {
                        openTimer.current = null;
                        setIsOpen(true);
                    }, 1500);
                }}
                onMouseLeave={close}
                onFocusCapture={event => {
                    if (event.target instanceof HTMLElement && event.target.matches(':focus-visible')) {
                        if (openTimer.current !== null) clearTimeout(openTimer.current);
                        openTimer.current = null;
                        setIsOpen(true);
                    }
                }}
                onBlurCapture={close}
                onKeyDownCapture={event => { if (event.key === 'Escape') close(); }}>
                {children}
            </span>
        </Tooltip>
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
    const hasSharedGold = summary.gold !== 0;
    const hasBoundGold = summary.boundGold !== 0;

    return (
        <div
            role="button"
            tabIndex={0}
            aria-label={`${content.name} ${isBonusModeEnabled ? '더보기' : '관문'} 전체 ${isComplete ? '해제' : '체크'}`}
            onClick={() => void handleWeekCheckAll(checklist, characterIndex, checklistIndex, dispatch, isBonusModeEnabled)}
            onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); void handleWeekCheckAll(checklist, characterIndex, checklistIndex, dispatch, isBonusModeEnabled); } }}
            className={clsx("flex h-full min-h-20 cursor-pointer flex-col justify-center gap-1.5 p-2.5 transition-colors", isComplete && "bg-emerald-100/80 dark:bg-emerald-900/55")}>
            <div className="flex min-w-0 items-center justify-start gap-1.5 text-left text-[10px]">
                {hasSharedGold || hasBoundGold ? (
                    <>
                        <img src="/icons/gold.png" alt="" className="h-3.5 w-3.5 shrink-0"/>
                        {hasSharedGold && hasBoundGold ? (
                            <div className="flex min-w-0 flex-col leading-tight">
                                <span className="whitespace-nowrap font-semibold text-blue-600 dark:text-blue-400">거래 가능 {summary.gold.toLocaleString()}</span>
                                <span className="whitespace-nowrap font-semibold text-amber-600 dark:text-amber-400">귀속 {summary.boundGold.toLocaleString()}</span>
                            </div>
                        ) : hasSharedGold ? (
                            <span className="whitespace-nowrap font-semibold text-blue-600 dark:text-blue-400">거래 가능 {summary.gold.toLocaleString()}</span>
                        ) : (
                            <span className="whitespace-nowrap font-semibold text-amber-600 dark:text-amber-400">귀속 {summary.boundGold.toLocaleString()}</span>
                        )}
                    </>
                ) : <span className="text-default-400">획득 가능한 골드 없음</span>}
            </div>
            <div className="flex w-full gap-1.5">
                {content.items.map((item, itemIndex) => {
                    const stageGold = getBossGoldByContent(bosses, content.name, item.stage, item.difficulty);
                    const isActive = isBonusModeEnabled ? item.isBonus : item.isCheck;
                    const showBonusDot = item.isBonus && stageGold.bonus > 0;
                    return (
                        <DelayedStageTooltip key={`${item.stage}-${itemIndex}`} content={
                            <div className="w-[280px] max-w-[calc(100vw-48px)] p-2">
                                <h3 className="mb-3 font-semibold">{content.name}</h3>
                                <div className="mb-1.5 flex w-full items-center gap-2">
                                    <Chip radius="sm" size="sm" color={getTextColorByDifficulty(item.difficulty)} variant="flat">
                                        {item.difficulty}
                                    </Chip>
                                    <div className="grow"/>
                                    <Chip radius="sm" size="sm" variant="flat">{item.stage}관문</Chip>
                                </div>
                                <Divider/>
                                <div className="my-2 w-full rounded-lg bg-gray-100/70 p-3 tabular-nums dark:bg-gray-900">
                                    <div className="mb-1 flex w-full items-center gap-2">
                                        <p className="fadedtext">골드</p>
                                        <div className="flex grow items-center justify-end gap-1">
                                            <img src="/icons/gold.png" alt="" className="h-4 w-4"/>
                                            <p>{stageGold.gold.toLocaleString()}</p>
                                        </div>
                                    </div>
                                    {stageGold.boundGold > 0 && (
                                        <div className="mb-1 flex w-full items-center gap-2">
                                            <p className="fadedtext">귀속 골드</p>
                                            <div className="flex grow items-center justify-end gap-1">
                                                <img src="/icons/gold.png" alt="" className="h-4 w-4"/>
                                                <p>{stageGold.boundGold.toLocaleString()}</p>
                                            </div>
                                        </div>
                                    )}
                                    {stageGold.bonus > 0 && (
                                        <div className="flex w-full items-center gap-2">
                                            <p className="fadedtext">더보기 골드</p>
                                            <div className="flex grow items-center justify-end gap-1">
                                                <img src="/icons/gold.png" alt="" className="h-4 w-4"/>
                                                <p>{stageGold.bonus.toLocaleString()}</p>
                                            </div>
                                        </div>
                                    )}
                                    {item.isBiweekly && (
                                        <>
                                            <Divider className="my-2"/>
                                            <p className="fadedtext text-sm">해당 관문은 2주에 1번씩 클리어를 하실 수 있습니다.</p>
                                            {item.isDisable && <p className="text-sm text-red-400 dark:text-red-700">저번 주에 이미 이 관문을 완료했었습니다.<br/>다음 주에 이 관문이 초기화됩니다.</p>}
                                        </>
                                    )}
                                </div>
                            </div>
                        }>
                            <button
                                type="button"
                                disabled={item.isDisable}
                                onClick={(event) => { event.stopPropagation(); return void (isBonusModeEnabled
                                    ? handleWeekBonusCheckStage(checklist, characterIndex, checklistIndex, dispatch, item.stage)
                                    : handleWeekCheckStage(checklist, characterIndex, checklistIndex, dispatch, item.stage, item.isDisable)); }}
                                className={clsx(
                                    "relative flex h-8 w-full min-w-0 cursor-pointer items-center justify-center gap-1 rounded-md border text-xs font-semibold tabular-nums shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 disabled:cursor-not-allowed dark:shadow-none",
                                    getStageButtonClass(item.difficulty, item.isDisable, isActive, isBonusModeEnabled)
                                )}
                                aria-pressed={isActive}
                                aria-label={`${content.name} ${item.stage} ${isBonusModeEnabled ? (item.isBonus ? '더보기 해제' : '더보기') : (item.isCheck ? '완료 해제' : '완료')}`}>
                                <span aria-hidden="true" className="flex h-3 w-3 shrink-0 items-center justify-center">
                                    {isActive ? <svg viewBox="0 0 16 16" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 8 3 3 7-7"/></svg> : <span className="h-1.5 w-1.5 rounded-full bg-current opacity-60"/>}
                                </span>
                                <span>{item.stage}</span>
                                {showBonusDot ? <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-amber-300 ring-1 ring-amber-600/60 dark:bg-amber-300 dark:ring-amber-100/30"/> : null}
                            </button>
                        </DelayedStageTooltip>
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
            {character.weeklist.length > 0 && <OtherTasksPopover label="주간 기타 숙제" items={character.weeklist} onCheck={index => handleWeekListCheck(checklist, characterIndex, index, dispatch)}/>}
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
    onOpenContentManager,
    autoChecklistNickname,
    isAutoChecklistSharing,
    onSelectAutoChecklistCharacter,
    renderCharacterSettings
}: ChecklistTableViewProps) {
    const [expandedGoldNickname, setExpandedGoldNickname] = useState<string | null>(null);
    const [scrollLeft, setScrollLeft] = useState(0);
    const [contentViewportWidth, setContentViewportWidth] = useState(0);
    const contentViewportRef = useRef<HTMLDivElement>(null);
    const sectionRef = useRef<HTMLElement>(null);
    const [sectionHeight, setSectionHeight] = useState<number | null>(null);

    useLayoutEffect(() => {
        let frame = 0;
        const measure = () => {
            const section = sectionRef.current;
            if (!section) return;
            const sectionTop = section.getBoundingClientRect().top + window.scrollY;
            const nextHeight = Math.max(220, Math.floor(window.innerHeight - sectionTop - 20));
            setSectionHeight(current => current === nextHeight ? current : nextHeight);
        };
        const scheduleMeasure = () => {
            cancelAnimationFrame(frame);
            frame = requestAnimationFrame(measure);
        };
        measure();
        const observer = new ResizeObserver(scheduleMeasure);
        observer.observe(document.body);
        window.addEventListener('resize', scheduleMeasure);
        return () => {
            observer.disconnect();
            window.removeEventListener('resize', scheduleMeasure);
            cancelAnimationFrame(frame);
        };
    }, []);

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

    const dailyColumnWidth = 172;
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
        <section ref={sectionRef} style={sectionHeight === null ? undefined : { height: sectionHeight }} className="mt-5 flex flex-col overflow-hidden rounded-2xl border border-default-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#171717]">
            <div className="checklist-table-scroll min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain">
                <div className="sticky top-0 z-40 grid grid-cols-[280px_minmax(0,1fr)_184px] border-b border-default-200 bg-default-50/95 shadow-sm backdrop-blur dark:border-white/10 dark:bg-[#202020]/95">
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
                    const isSharingCharacter = isAutoChecklistSharing && autoChecklistNickname === character.nickname;
                    return (
                        <div key={character.nickname} className="border-b border-default-200 dark:border-white/10">
                            <div className="grid grid-cols-[280px_minmax(0,1fr)_184px]">
                                <div className={clsx("flex min-h-20 w-[280px] items-stretch border-r border-default-200 dark:border-white/10", isSharingCharacter ? "bg-primary-50 dark:bg-primary-950/30" : "bg-white dark:bg-[#171717]")}>
                                <button
                                    type="button"
                                    onClick={() => setExpandedGoldNickname(isGoldExpanded ? null : character.nickname)}
                                    className={clsx("flex min-w-0 grow cursor-pointer items-center gap-2 px-3 py-3 text-left transition-colors hover:bg-default-50 dark:hover:bg-white/[0.04]", isSharingCharacter && "bg-primary-50 dark:bg-primary-950/30", isGoldExpanded && !isSharingCharacter && "bg-warning-50 dark:bg-warning-950/20")}
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
                                <div className="flex shrink-0 flex-col items-center justify-center gap-1 px-0.5">
                                    {renderCharacterSettings(characterIndex)}
                                    <button type="button" onClick={() => onSelectAutoChecklistCharacter(character.nickname)} disabled={!isAutoChecklistSharing || autoChecklistNickname === character.nickname} className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-default-500 hover:bg-default-100 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-white/[0.08]" aria-label={`${character.nickname} 자동 체크 전환`} title={isAutoChecklistSharing ? '자동 체크 캐릭터로 전환' : '화면 공유 중에만 전환할 수 있습니다.'}>
                                        <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 7h13l-3-3M20 17H7l3 3"/><path d="M17 4l3 3-3 3M7 14l-3 3 3 3"/></svg>
                                    </button>
                                </div>
                                </div>
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
            {maxScrollLeft > 0 ? <div className="grid grid-cols-[280px_minmax(0,1fr)_184px] border-t border-default-200 bg-white/95 shadow-[0_-4px_12px_rgba(0,0,0,0.05)] backdrop-blur dark:border-white/10 dark:bg-[#171717]/95">
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
