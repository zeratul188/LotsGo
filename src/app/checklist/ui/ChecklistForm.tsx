'use client'
import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Boss } from "../../api/checklist/boss/route";
import { CheckCharacter, Checklist, ChecklistItem, FixedContentType, OtherList } from "../../store/checklistSlice";
import { 
    Button, 
    Card, CardBody, CardHeader,
    Divider, 
    Progress, 
    RadioProps, RadioGroup, Radio, cn,
    Tooltip,
    Chip,
    Checkbox,
    useDisclosure,
    Modal, ModalContent,
    ModalHeader,
    ModalBody,
    Table, TableHeader, TableColumn, TableBody, TableRow, TableCell,
    Select, SelectItem, Selection,
    Tabs,
    Tab,
    Input,
    Textarea,
    CardFooter,
    Accordion, AccordionItem,
    Dropdown, DropdownTrigger, DropdownMenu, DropdownItem,
    Popover,
    PopoverTrigger,
    PopoverContent,
    NumberInput,
    ModalFooter,
    Switch,
    Link,
    Pagination,
    addToast
} from "@heroui/react";
import { 
    DayValue, 
    filterChecklist, 
    getAccounts, 
    getAllBoundGold, 
    getAllContentGold, 
    getAllContentOtherGold, 
    getAllCountChecklist, 
    getAllCountChecklistByGold, 
    getAllCountChecklistByStage, 
    getAllCubeCount, 
    getAllGoldCharacter, 
    getAllGolds, 
    buildWeekChecklistItems,
    createDefaultWeekStages,
    createWeekStagesFromChecklist,
    EMPTY_STAGE_DIFFICULTY,
    getBackground50ByStage, 
    getBackgroundByStage, 
    getBorderByStage, 
    getBossesByHaveContent, 
    getBossesById, 
    getBossGoldByContent, 
    getChecklistContentGoldSummary,
    getCheckedResult, 
    getCompleteBoundGoldCharacter, 
    getCompleteChecklist, 
    getCompleteChecklistByGold, 
    getCompleteChecklistByStage, 
    getCompleteGoldCharacter, 
    getCompleteSharedGoldCharacter, 
    getDayName, 
    getDifficultyByStage, 
    getHaveBoundGolds, 
    getHaveGolds, 
    getHaveSharedGolds, 
    getIndexByNickname, 
    getMaxRestValue, 
    getMissedBonusGoldByGoldCharacter,
    getServerList, 
    getSimpleBossName, 
    getTakeGold, 
    getTextColorByDifficulty, 
    getTypeDayValue, 
    getWeekContents, 
    getWeekStages, 
    handleAddCharacter, 
    handleApplyPositions, 
    handleCheckGold, 
    handleCheckGolds, 
    handleDayListCheck, 
    handleEditBusGold, 
    handleOnDragEnd, 
    handleRemoveCharacter, 
    handleRemoveDayList, 
    handleRemoveWeekList, 
    handleResetCube, 
    handleReorderContent,
    handleSelectAccount, 
    handleUpdateMemo,
    handleUpdateParadisePower,
    handleHallsHourglassCheck,
    handleParadiseCheck,
    handleFixedContentVisibility,
    handleSelectCharacter, 
    handleWeekBonusCheckStage, 
    handleWeekCheckStage, 
    handleWeekListCheck, 
    isBiweeklyContent, 
    isCheckBiweeklyContent, 
    isCheckHomework, 
    isHaveCharacter, 
    loadDatas, 
    printDifficulty, 
    SearchCharacter, 
    useChangeBlessing, 
    useClickAddAccount, 
    useClickLife, 
    useClickLoadCharacters, 
    useClickUpdatedCharacters, 
    useCloseModal, 
    useOnClickAddDayList, 
    useOnClickAddItem, 
    useOnClickEditItem,
    useOnClickAddWeekList, 
    useOnClickDayCheck, 
    useOnClickRemoveItem, 
    useOnClickSaveRestValue, 
    useOnClickWeekCheck 
} from "../lib/checklistFeat";
import { SetStateFn, useMobileQuery } from "@/utiils/utils";
import { useLoadingTask } from "../../components/loading/LoadingProgress";
import { SettingIcon } from "../../icons/SettingIcon";
import clsx from "clsx";
import { AppDispatch } from "../../store/store";
import AddIcon from "../../icons/AddIcon";
import DeleteIcon from "../../icons/DeleteIcon";
import { Cube } from "../../api/checklist/cube/route";
import { MAX_CHARACTER_COUNT } from "@/utiils/constants";
import {
  DragDropContext,
  Droppable,
  Draggable
} from '@hello-pangea/dnd';
import { ChecklistData } from "../../home/lib/checklistFeat";
import { ControlStage } from "../model/types";
import CheckIcon from "@/Icons/CheckIcon";
import CharacterIcon from "@/Icons/CharacterIcon";
import BusIcon from "@/Icons/BusIcon";
import JobEmblemIcon from "@/Icons/JobEmblemIcon";
import RaidIcon from "@/Icons/RaidIcon";
import JobAvatar from "@/Icons/JobAvatar";
import { EditIcon } from "@/Icons/EditIcon";
import SwitchCharacterIcon from "@/Icons/SwitchCharacterIcon";
import AnimatedNumber from "./AnimatedNumber";
import OtherGoldManager from "./OtherGoldManager";
import OtherGoldOverviewTable from "./OtherGoldOverviewTable";
import {
    getOtherGoldTotal
} from "../lib/otherGold";
import {
    CubeCountComponent,
    CubeStatueComponent
} from "./CubeComponents";

type ReorderEntry<T> = {
    id: string,
    value: T
}

type ChecklistAnimationColor = 'primary' | 'secondary' | 'secondary-muted' | 'warning' | 'warning-muted';

type AnimatedChecklistCheckIconProps = {
    isSelected: boolean,
    className?: string
}

const checklistAnimationColors: Record<ChecklistAnimationColor, { background: string, stroke: string, hover: string }> = {
    primary: {
        background: 'bg-primary-50/70 dark:bg-primary-500/10',
        stroke: 'text-primary-200 dark:text-primary-700/60',
        hover: 'hover:bg-gray-100/70 dark:hover:bg-white/[0.04]'
    },
    secondary: {
        background: 'bg-secondary-50/70 dark:bg-secondary-400/[0.06]',
        stroke: 'text-secondary-200 dark:text-[#3a3342]',
        hover: 'hover:bg-gray-100/70 dark:hover:bg-white/[0.04]'
    },
    'secondary-muted': {
        background: 'bg-secondary-50/70 dark:bg-secondary-950/20',
        stroke: 'text-secondary-200 dark:text-secondary-900',
        hover: 'hover:bg-gray-100/70 dark:hover:bg-gray-900/70'
    },
    warning: {
        background: 'bg-warning-50/70 dark:bg-warning-500/10',
        stroke: 'text-warning-200 dark:text-warning-700/60',
        hover: 'hover:bg-warning-50/40 dark:hover:bg-warning-950/20'
    },
    'warning-muted': {
        background: 'bg-warning-50/70 dark:bg-warning-950/20',
        stroke: 'text-warning-200 dark:text-warning-900',
        hover: 'hover:bg-gray-100/70 dark:hover:bg-gray-900/70'
    }
};

function AnimatedChecklistCheckIcon({ isSelected, className }: AnimatedChecklistCheckIconProps) {
    return (
        <svg
            aria-hidden="true"
            className={clsx(className, "!opacity-100 motion-reduce:transition-none")}
            fill="none"
            role="presentation"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2.25"
            viewBox="0 0 17 18">
            <polyline
                points="1 9 7 14 15 4"
                pathLength="1"
                strokeDasharray="1"
                strokeDashoffset={isSelected ? 0 : 1}
                style={{ transition: 'stroke-dashoffset 0.4s ease-out' }}/>
        </svg>
    );
}

type AnimatedChecklistStrikeProps = {
    children: React.ReactNode,
    className?: string,
    isSelected: boolean
}

function AnimatedChecklistStrike({ children, className, isSelected }: AnimatedChecklistStrikeProps) {
    return (
        <span className={clsx("relative inline-block whitespace-nowrap", className)}>
            {children}
            <span
                aria-hidden="true"
                className={clsx(
                    "pointer-events-none absolute inset-x-0 top-1/2 z-10 h-[1px] -translate-y-1/2 origin-left bg-current transition-transform duration-[400ms] ease-out motion-reduce:transition-none",
                    isSelected ? 'scale-x-100' : 'scale-x-0'
                )}/>
        </span>
    );
}

type AnimatedChecklistFrameProps = {
    children: React.ReactNode,
    className?: string,
    color: ChecklistAnimationColor,
    isSelected: boolean
}

function AnimatedChecklistFrame({ children, className, color, isSelected }: AnimatedChecklistFrameProps) {
    const colors = checklistAnimationColors[color];

    return (
        <div className={clsx(
            "relative isolate overflow-hidden rounded-lg border border-transparent",
            !isSelected && colors.hover,
            className
        )}>
            <span
                aria-hidden="true"
                className={clsx(
                    "pointer-events-none absolute inset-0 z-0 transition-opacity duration-[400ms] ease-out motion-reduce:transition-none",
                    colors.background,
                    isSelected ? 'opacity-100' : 'opacity-0'
                )}/>
            <svg
                aria-hidden="true"
                className={clsx("pointer-events-none absolute inset-0 z-20 h-full w-full", colors.stroke)}
                preserveAspectRatio="none">
                <rect
                    x="1"
                    y="1"
                    width="calc(100% - 2px)"
                    height="calc(100% - 2px)"
                    rx="8"
                    fill="none"
                    pathLength="1"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeDasharray="1"
                    strokeDashoffset={isSelected ? 0 : 1}
                    style={{ transition: 'stroke-dashoffset 0.4s ease-out' }}/>
            </svg>
            {children}
        </div>
    );
}

function createReorderEntries<T>(items: T[], prefix: string): ReorderEntry<T>[] {
    return items.map((value, index) => ({
        id: `${prefix}-${index}-${Math.random().toString(36).slice(2)}`,
        value
    }));
}

const AutoChecklistControl = dynamic(() => import("./AutoChecklistControl"), {
    ssr: false,
    loading: () => (
        <Button
            fullWidth
            radius="sm"
            color="primary"
            variant="flat"
            size="sm"
            className="hidden h-9 border border-primary/30 px-2 text-xs font-medium md960:flex sm:text-sm"
            isDisabled>
            자동 체크 기능 켜기
        </Button>
    )
});

// state 관리
export type ModalData = {
    characterIndex: number,
    type: string
}
export function useChecklistForm(initialBosses: Boss[] = [], initialCubes: Cube[] = []) {
    const [isLoading, setLoading] = useState(true);
    const [bosses, setBosses] = useState<Boss[]>(initialBosses);
    const [server, setServer] = useState('전체');
    const {isOpen, onOpen, onOpenChange} = useDisclosure();
    const [modalData, setModalData] = useState<ModalData>({
        characterIndex: -1,
        type: 'null'
    });
    const [cubes, setCubes] = useState<Cube[]>(initialCubes);
    const [life, setLife] = useState(0);
    const [max, setMax] = useState(0);
    const [isBlessing, setBlessing] = useState(false);
    const [isShowCubeDetail, setShowCubeDetail] = useState(false);
    const [isShowList, setShowList] = useState(false);
    const [isLogined, setLogined] = useState(false);
    const [biweekly, setBiweekly] = useState(0);
    const [filterContent, setFilterContent] = useState<Selection>(new Set([]));
    const [accounts, setAccounts] = useState<string[]>(['본계정']);
    const [filterAccount, setFilterAccount] = useState<Selection>(new Set([]));

    // 설정
    const [isHideDayContent, setHideDayContent] = useState(false);
    const [isHideBonusMode, setHideBonusMode] = useState(false);
    const [isAutoDeleteUnselectedRaids, setAutoDeleteUnselectedRaids] = useState(false);
    const [isHideParadisePower, setHideParadisePower] = useState(false);
    const [isHideCharacterMemo, setHideCharacterMemo] = useState(false);

    // 필터 설정값
    const [isRemainHomework, setRemainHomework] = useState(false);
    const [isShowGoldCharacter, setShowGoldCharacter] = useState(false);
    const [isHideCompleteContent, setHideCompleteContent] = useState(false);

    return {
        isLoading, setLoading,
        bosses, setBosses,
        server, setServer,
        isOpen, onOpen, onOpenChange,
        modalData, setModalData,
        cubes, setCubes,
        life, setLife,
        isBlessing, setBlessing,
        max, setMax,
        isShowCubeDetail, setShowCubeDetail,
        isLogined, setLogined,
        isShowList, setShowList,
        biweekly, setBiweekly,
        isHideDayContent, setHideDayContent,
        filterContent, setFilterContent,
        isRemainHomework, setRemainHomework,
        isShowGoldCharacter, setShowGoldCharacter,
        accounts, setAccounts,
        filterAccount, setFilterAccount,
        isHideCompleteContent, setHideCompleteContent,
        isHideBonusMode, setHideBonusMode,
        isAutoDeleteUnselectedRaids, setAutoDeleteUnselectedRaids,
        isHideParadisePower, setHideParadisePower,
        isHideCharacterMemo, setHideCharacterMemo
    }
}

// 순서 변경 Modal
type PositionModalProps = {
    isOpenModalPosition: boolean
    onOpenChangePosition: (isOpen: boolean) => void,
    checklist: CheckCharacter[],
    dispatch: AppDispatch
}
function PositionModal({ isOpenModalPosition, onOpenChangePosition, checklist, dispatch }: PositionModalProps) {
    const [positions, setPositions] = useState<CheckCharacter[]>([]);
    const [isLoading, setLoading] = useState(false);
    const onDragEnd = handleOnDragEnd(positions, setPositions);

    useEffect(() => {
        const newChecklist = checklist.map(item => ({ ...item }));
        setPositions(newChecklist);
    }, [checklist])

    return (
        <Modal
            radius="lg"
            size="md"
            scrollBehavior="inside"
            isDismissable={false}
            isOpen={isOpenModalPosition}
            onOpenChange={onOpenChangePosition}>
            <ModalContent className="border border-gray-200/80 dark:border-white/10">
                {(onClose) => (
                    <>
                        <ModalHeader className="flex flex-col gap-1 border-b border-gray-200/80 px-6 py-5 dark:border-white/10">
                            <div className="flex items-center gap-2">
                                <span className="h-5 w-1 rounded-full bg-primary"/>
                                <p className="text-xl font-semibold">캐릭터 순서 변경</p>
                            </div>
                            <p className="pl-3 text-sm font-normal fadedtext">캐릭터를 끌어서 원하는 순서로 이동하세요.</p>
                        </ModalHeader>
                        <ModalBody className="px-5 py-5">
                            <div className="max-h-[60vh] overflow-y-auto pr-1">
                                <DragDropContext onDragEnd={onDragEnd}>
                                    <Droppable droppableId="positions">
                                        {(provided) => (
                                            <ul {...provided.droppableProps} ref={provided.innerRef}>
                                                {positions.map((char, index) => (
                                                <Draggable key={char.nickname} draggableId={char.nickname} index={index}>
                                                    {(prov) => (
                                                    <li
                                                        ref={prov.innerRef}
                                                        {...prov.draggableProps}
                                                        {...prov.dragHandleProps}
                                                        className="mb-2 cursor-move rounded-xl border border-gray-200/80 bg-gray-50/80 p-3 transition-colors hover:border-primary/60 hover:bg-primary/[0.04] dark:border-white/10 dark:bg-white/[0.035]"
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <JobEmblemIcon job={char.job} size={32}/>
                                                            <div className="flex flex-col gap-0.5">
                                                                <span className="fadedtext text-sm">@{char.server} · {char.job} · Lv.{char.level}</span>
                                                                <span className="text-md leading-tight">{char.nickname}</span>
                                                            </div>
                                                        </div>
                                                    </li>
                                                    )}
                                                </Draggable>
                                                ))}
                                                {provided.placeholder}
                                            </ul>
                                        )}
                                    </Droppable>
                                </DragDropContext>
                            </div>
                        </ModalBody>
                        <ModalFooter className="border-t border-gray-200/80 px-6 py-4 dark:border-white/10">
                            <Button
                                fullWidth
                                color="primary"
                                radius="sm"
                                size="lg"
                                className="font-semibold"
                                isLoading={isLoading}
                                onPress={async () => {
                                    await handleApplyPositions(positions, onClose, setLoading, dispatch);
                                }}>변경</Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    )
}

// 체크리스트 현황 컴포넌트
type ChecklistStatueProps = {
    server: string,
    filterContent: Selection,
    filterAccount: Selection,
    isRemainHomework: boolean,
    isShowGoldCharacter: boolean,
    checklist: CheckCharacter[],
    bosses: Boss[],
    dispatch: AppDispatch,
    life: number,
    isBlessing: boolean,
    setLife: SetStateFn<number>,
    setBlessing: SetStateFn<boolean>,
    max: number,
    setMax: SetStateFn<number>,
    accounts: string[],
    setAccounts: SetStateFn<string[]>,
    isLoadingData: boolean,
    autoChecklistNickname: string,
    setAutoChecklistNickname: (nickname: string) => void,
    setAutoChecklistSharing: (isSharing: boolean) => void
}
export function ChecklistStatue({ 
    server,
    filterContent,
    filterAccount,
    isRemainHomework,
    isShowGoldCharacter,
    checklist, 
    bosses, 
    dispatch, 
    life, 
    isBlessing, 
    setLife, 
    setBlessing, 
    max, 
    setMax,
    accounts,
    setAccounts,
    isLoadingData,
    autoChecklistNickname,
    setAutoChecklistNickname,
    setAutoChecklistSharing
 }: ChecklistStatueProps) {
    const [isLoading, setLoading] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [result, setResult] = useState<SearchCharacter[]>([]);
    const [isLoadingSearch, setLoadingSearch] = useState(false);
    const [isLoadingAdd, setLoadingAdd] = useState(false);
    const {isOpen, onOpen, onOpenChange} = useDisclosure();
    const [isGold, setGold] = useState(false);
    const [newLife, setNewLife] = useState(0);
    const [newMax, setNewMax] = useState(0);
    const [isDisableUpdate, setDisableUpdate] = useState(true);
    const [remainingTime, setRemainingTime] = useState(0);

    useEffect(() => {
        setNewMax(max);
    }, [max]);

    useEffect(() => {
        if (!isDisableUpdate) return;

        const interval = setInterval(() => {
            const saved = localStorage.getItem("button_unlock_time");
            if (!saved) {
                setDisableUpdate(false);
                clearInterval(interval);
                return;
            }

            const lastTime = parseInt(saved);
            const diff = Date.now() - lastTime;
            const timeLeft = 60 * 1000 - diff;

            if (timeLeft <= 0) {
                setDisableUpdate(false);
                clearInterval(interval);
                localStorage.removeItem('button_unlock_time');
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [isDisableUpdate])

    useEffect(() => {
        if (remainingTime > 0) {
            localStorage.setItem("button_unlock_time", (remainingTime).toString());
        }
    }, [remainingTime]);

    const [isOpenModalPosition, setOpenModalPosition] = useState(false);
    const onOpenChangePosition = (isOpen: boolean) => setOpenModalPosition(isOpen);

    const onClickUpdatedCharacters = useClickUpdatedCharacters(checklist, dispatch, setLoading, setDisableUpdate);
    const onClickLoadCharacters = useClickLoadCharacters(inputValue, setResult, setLoadingSearch);
    const onCloseModal = useCloseModal(setResult, setInputValue);
    const onChangeBlessing = useChangeBlessing(life, max, setBlessing);
    const onClickLife = useClickLife(newLife, isBlessing, setLife, setNewLife, newMax, setMax, setNewMax);

    const [inputAccount, setInputAccount] = useState('');
    const [selected, setSelected] = useState(accounts.length > 0 ? accounts[0] : '본계정');
    const onClickAddAccount = useClickAddAccount(inputAccount, setInputAccount, accounts, setAccounts);

    useLoadingTask("캐릭터 정보를 갱신하고 있어요", isLoading);

    const filteredChecklist = checklist.filter((character) => (character.server === server || server === '전체') && filterChecklist(character, filterContent, bosses, checklist, isRemainHomework, isShowGoldCharacter, filterAccount));

    return (
        <>
            <Card 
                fullWidth 
                radius="lg"
                shadow="none"
                className="overflow-hidden border border-gray-200/80 bg-white/95 shadow-[0_10px_35px_rgba(15,23,42,0.08)] md960:fixed md960:left-1/2 md960:top-[80px] md960:z-50 md960:w-[calc(100vw-40px)] md960:-translate-x-1/2 lg1280:w-[1240px] dark:border-white/10 dark:bg-[#171717]/95 dark:shadow-none">
                <CardBody className="p-3">
                    <div className="grid w-full grid-cols-1 gap-2 md960:grid-cols-[1.2fr_1fr_1fr]">
                        <div className="flex w-full flex-col gap-2 rounded-xl border border-warning/20 bg-warning/[0.045] p-3 dark:bg-warning/[0.06]">
                             <div className="w-full min-w-0 grow">
                                <Progress 
                                    aria-label="all-gold"
                                    size="sm"
                                    color="warning"
                                    label={(
                                        <div className="flex items-center">
                                            <img 
                                                src="/icons/gold.png" 
                                                alt="goldicon"
                                                className="w-[19px] h-[19px]"/>
                                            <span className="ml-1 text-md">주간 골드량 : <AnimatedNumber value={getHaveGolds(bosses, filteredChecklist)}/> / <AnimatedNumber value={getAllGolds(bosses, filteredChecklist)}/></span>
                                        </div>
                                    )}
                                    showValueLabel={true}
                                    radius="sm"
                                    value={getHaveGolds(bosses, filteredChecklist)}
                                    maxValue={getAllGolds(bosses, filteredChecklist)}/>
                             </div>
                            <div className="flex w-full items-center gap-2">
                                <p className="min-w-0 grow text-[10pt] leading-5 fadedtext">
                                    이번 주에 <img src="/icons/gold.png" alt="goldicon" className="mx-0.5 inline-block h-[14px] w-[14px]"/>
                                    <strong className="text-black dark:text-white"><AnimatedNumber value={getAllGolds(bosses, filteredChecklist) - getHaveGolds(bosses, filteredChecklist)}/></strong>를 더 획득하실 수 있습니다.
                                </p>
                                <Popover showArrow disableAnimation placement="bottom-end">
                                    <PopoverTrigger>
                                        <Button
                                            size="sm"
                                            variant="flat"
                                            color="warning"
                                            radius="sm"
                                            className="h-8 min-w-[84px] shrink-0 font-medium">
                                            자세히
                                        </Button>
                                    </PopoverTrigger>
                                <PopoverContent className="border border-gray-200/80 bg-white/95 p-0 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-[#171717]/95">
                                    <div className="w-[calc(100vw-40px)] p-4 min-[701px]:max-w-[760px]">
                                        <div className="mb-3 flex items-start justify-between gap-3 border-b border-gray-200/80 pb-3 dark:border-white/10">
                                            <div>
                                                <p className="font-semibold">주간 골드 상세</p>
                                                <p className="mt-1 text-xs fadedtext">캐릭터별 획득 골드와 부수입을 확인하세요.</p>
                                            </div>
                                            <Chip size="sm" radius="sm" color="warning" variant="flat">{filteredChecklist.length}명</Chip>
                                        </div>
                                        <Tabs
                                            aria-label="주간 골드 상세 탭"
                                            variant="underlined"
                                            color="warning"
                                            classNames={{
                                                tabList: "gap-5 p-0",
                                                cursor: "w-full",
                                                tab: "h-9 px-0",
                                                panel: "px-0 pb-0"
                                            }}>
                                            <Tab key="gold-detail" title="골드 상세">
                                        <div className="w-full overflow-x-auto rounded-xl border border-gray-200/80 dark:border-white/10 scrollbar-hide">
                                            <div className="max-h-[360px] w-[440px] overflow-y-auto min-[501px]:w-full">
                                                <Table removeWrapper>
                                                    <TableHeader>
                                                        <TableColumn>캐릭터명</TableColumn>
                                                        <TableColumn>콘텐츠</TableColumn>
                                                        <TableColumn>귀속 골드</TableColumn>
                                                        <TableColumn>부수입</TableColumn>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {filteredChecklist.map((character, index) => (
                                                            <TableRow key={index}>
                                                                <TableCell>{character.nickname}</TableCell>
                                                                <TableCell>{getCompleteSharedGoldCharacter(bosses, character).toLocaleString()}</TableCell>
                                                                <TableCell>{getCompleteBoundGoldCharacter(bosses, character).toLocaleString()}</TableCell>
                                                                <TableCell>{getOtherGoldTotal(character).toLocaleString()}</TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </div>
                                        </div>
                                        <div className="mb-2 mt-3 flex items-center text-[10pt] fadedtext">
                                            <p>더보기로 빠진 골드는</p>
                                            <img 
                                                src="/icons/gold.png" 
                                                alt="goldicon"
                                                className="w-[16px] h-[16px] ml-1"/>
                                            <p className="font-bold text-black dark:text-white ml-0.5 mr-0.5">
                                                {getMissedBonusGoldByGoldCharacter(bosses, checklist).toLocaleString()}
                                            </p>
                                            <p>입니다.</p>
                                        </div>
                                        <div className="grid w-full grid-cols-1 items-center gap-x-3 gap-y-2 rounded-xl bg-gray-50/80 p-3 min-[501px]:grid-cols-3 dark:bg-white/[0.04]">
                                            <div className="w-full flex items-center gap-1">
                                                <p className="grow text-[9pt] fadedtext">총 콘텐츠</p>
                                                <img
                                                    src="/icons/gold.png" 
                                                    alt="goldicon"
                                                    className="w-[14px] h-[14px]"/>
                                                <p className="test-sm">{getAllContentGold(bosses, filteredChecklist).toLocaleString()}</p>
                                            </div>
                                            <div className="w-full flex items-center gap-1">
                                                <p className="grow text-[9pt] fadedtext">총 귀속 골드</p>
                                                <img 
                                                    src="/icons/gold.png" 
                                                    alt="goldicon"
                                                    className="w-[14px] h-[14px]"/>
                                                <p className="test-sm">{getAllBoundGold(bosses, filteredChecklist).toLocaleString()}</p>
                                            </div>
                                            <div className="w-full flex items-center gap-1">
                                                <p className="grow text-[9pt] fadedtext">총 부수입</p>
                                                <img 
                                                    src="/icons/gold.png" 
                                                    alt="goldicon"
                                                    className="w-[14px] h-[14px]"/>
                                                <p className="test-sm">{getAllContentOtherGold(bosses, filteredChecklist).toLocaleString()}</p>
                                            </div>
                                            <div className="w-full flex items-center gap-1.5">
                                                <p className="grow text-[9pt] fadedtext">콘텐츠 비율</p>
                                                <div className="w-[9px] h-[9px] rounded-full bg-green-500"/>
                                                <p className="test-sm">{getHaveSharedGolds(bosses, filteredChecklist) !== 0 ? Math.round(getAllContentGold(bosses, filteredChecklist) / getHaveGolds(bosses, filteredChecklist) * 1000) / 10 : 0}%</p>
                                            </div>
                                            <div className="w-full flex items-center gap-1.5">
                                                <p className="grow text-[9pt] fadedtext">귀속 골드 비율</p>
                                                <div className="w-[9px] h-[9px] rounded-full bg-yellow-500"/>
                                                <p className="test-sm">{getHaveBoundGolds(bosses, filteredChecklist) !== 0 ? Math.round(getAllBoundGold(bosses, filteredChecklist) / getHaveGolds(bosses, filteredChecklist) * 1000) / 10 : 0}%</p>
                                            </div>
                                            <div className="w-full flex items-center gap-1.5">
                                                <p className="grow text-[9pt] fadedtext">부수입 비율</p>
                                                <div className="w-[9px] h-[9px] rounded-full bg-purple-600"/>
                                                <p className="test-sm">{getHaveGolds(bosses, filteredChecklist) !== 0 ? Math.round(getAllContentOtherGold(bosses, filteredChecklist) / getHaveGolds(bosses, filteredChecklist) * 1000) / 10 : 0}%</p>
                                            </div>
                                        </div>
                                        {bosses.length && filteredChecklist.length ? (
                                            <div className="relative mt-3 h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-white/10">
                                                <div className="absolute top-0 left-0 h-full bg-purple-600" style={{ width: '100%' }}></div>
                                                <div className="absolute top-0 left-0 h-full bg-yellow-500" style={{ width: `${getHaveGolds(bosses, filteredChecklist) !== 0 ? Math.round(getAllContentGold(bosses, filteredChecklist) / getHaveGolds(bosses, filteredChecklist) * 1000) / 10 + Math.round(getAllBoundGold(bosses, filteredChecklist) / getHaveGolds(bosses, filteredChecklist) * 1000) / 10 : 0}%` }}></div>
                                                <div className="absolute top-0 left-0 h-full bg-green-500" style={{ width: `${getHaveGolds(bosses, filteredChecklist) !== 0 ? Math.round(getAllContentGold(bosses, filteredChecklist) / getHaveGolds(bosses, filteredChecklist) * 1000) / 10 : 0}%` }}></div>
                                            </div>
                                        ) : <></>}
                                            </Tab>
                                            <Tab key="other-gold-records" title="부수입 내역">
                                                <OtherGoldOverviewTable checklist={checklist}/>
                                            </Tab>
                                        </Tabs>
                                    </div>
                                </PopoverContent>
                                </Popover>
                            </div>
                        </div>
                        <div className="flex w-full flex-col rounded-xl border border-secondary/20 bg-secondary/[0.04] p-3 dark:bg-secondary/[0.06]">
                            <Progress 
                                aria-label="all-gold"
                                size="sm"
                                color="secondary"
                                label={
                                    <div className="flex gap-1 items-center">
                                        <p>📃 숙제 진행 상황 : {getCompleteChecklist(checklist)} / {getAllCountChecklist(checklist)}</p>
                                        <p className="fadedtext text-[9pt]">({getCompleteChecklistByStage(checklist)}/{getAllCountChecklistByStage(checklist)})</p>
                                    </div>
                                }
                                showValueLabel={true}
                                radius="sm"
                                value={getCompleteChecklistByStage(checklist)}
                                maxValue={getAllCountChecklistByStage(checklist)}
                                className="w-full"/>
                            <div className="flex items-center fadedtext text-[10pt] mt-1">
                                <p>골드 받는 숙제는 </p>
                                <p className="font-bold text-black dark:text-white ml-1 mr-0.5"> {(getAllCountChecklistByGold(checklist) - getCompleteChecklistByGold(checklist)).toLocaleString()}</p>
                                <p>개 남았습니다.</p>
                            </div>
                        </div>
                        <div className="flex w-full flex-shrink-0 flex-col items-stretch gap-2 rounded-xl border border-success/20 bg-success/[0.04] p-3 md960:flex-row md960:items-start dark:bg-success/[0.06]">
                            <div className="w-full min-w-0 grow sm:w-fit">
                                <Tooltip showArrow content="생명의 기운이 인게임보다 약간의 오차가 발생할 수 있습니다.">
                                    <Progress 
                                        aria-label="all-gold"
                                        size="sm"
                                        color="success"
                                        label={`🍃 생명의 기운 : ${Math.floor(life).toLocaleString()} / ${max.toLocaleString()}`}
                                        radius="sm"
                                        value={life}
                                        maxValue={max}
                                        className="w-full"/>
                                </Tooltip>
                                <div className="flex items-center fadedtext text-[10pt] mt-1">
                                    <p>10분마다 생명의 기운 {isBlessing && '접속 시'}</p>
                                    <p className="font-bold text-green-700 dark:text-green-300 ml-1 mr-0.5"> {isBlessing ? '33' : '30'}</p>
                                    <p>증가</p>
                                </div>
                            </div>
                            <p className="block md960:hidden fadedtext text-[9pt] w-full text-left">생명의 기운이 인게임보다 약간의 오차가 발생할 수 있습니다.</p>
                            <div className="flex w-full min-w-fit shrink-0 flex-row items-center gap-2 md960:w-auto md960:flex-col md960:gap-1">
                                <Tooltip showArrow content={<div className="w-[240px]">
                                    <h3 className="text-lg font-bold">베아트리스의 축복</h3>
                                    <Divider className="mb-1 mt-0.5"/>
                                    <p>
                                        베아트리스의 축복은 로스트아크에 접속할 경우에만 10% 적용됩니다.<br/>
                                        로스트아크를 하루 평균 3시간을 플레이하는 가정하에 계산되므로 실제 회복량과 로츠고의 회복량은 실제 플레이 시간에 따라 다를 수 있음을 참고하시기 바랍니다.
                                    </p>
                                    <p className="text-green-700 dark:text-green-400 mt-2">적용 시 10분마다 생명의 기운 33 증가</p>
                                </div>}>
                                    <Checkbox 
                                        size="sm" 
                                        color="primary" 
                                        isSelected={isBlessing}
                                        onValueChange={onChangeBlessing}
                                        className="mb-0">축복</Checkbox>
                                </Tooltip>
                                <div className="grow flex justify-end">
                                    <Popover showArrow disableAnimation placement="bottom">
                                        <PopoverTrigger>
                                            <Button
                                                size="sm"
                                                color="primary"
                                                variant="flat"
                                                radius="sm"
                                                className="w-[100px] font-medium md960:w-auto">
                                                수정
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="border border-gray-200/80 bg-white/95 p-0 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-[#171717]/95">
                                            <div className="w-[280px] p-4">
                                                <div className="mb-4 border-b border-gray-200/80 pb-3 dark:border-white/10">
                                                    <p className="font-semibold">생명의 기운 수정</p>
                                                    <p className="mt-1 text-xs fadedtext">현재 수치와 최대치를 직접 조정합니다.</p>
                                                </div>
                                                <p className="mb-2 text-sm font-medium">생명의 기운</p>
                                                <NumberInput
                                                    fullWidth
                                                    radius="sm"
                                                    size="md"
                                                    variant="bordered"
                                                    placeholder={`0 ~ ${newMax}`}
                                                    maxValue={newMax}
                                                    value={newLife}
                                                    onValueChange={setNewLife}/>
                                                <p className="mb-2 mt-4 text-sm font-medium">최대치</p>
                                                <NumberInput
                                                    fullWidth
                                                    radius="sm"
                                                    size="md"
                                                    variant="bordered"
                                                    placeholder="0 ~ 99999"
                                                    maxValue={99999}
                                                    value={newMax}
                                                    onValueChange={setNewMax}/>
                                                <Button
                                                    fullWidth
                                                    radius="sm"
                                                    color="primary"
                                                    className="mt-5 font-semibold"
                                                    isDisabled={isLoadingData}
                                                    onPress={onClickLife}>
                                                    저장
                                                </Button>
                                            </div>
                                        </PopoverContent>
                                    </Popover>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardBody>
                <CardFooter className="border-t border-gray-200/80 bg-gray-50/70 p-2.5 dark:border-white/10 dark:bg-white/[0.025]">
                    <div className="grid w-full grid-cols-3 gap-2 md960:grid-cols-4">
                        <Button
                            fullWidth
                            radius="sm"
                            color="default"
                            size="sm"
                            variant="flat"
                            className="h-9 border border-gray-200/80 bg-white px-2 text-xs font-medium sm:text-sm dark:border-white/10 dark:bg-white/[0.04]"
                            isDisabled={isLoadingData}
                            onPress={() => onOpenChangePosition(true)}>순서 변경</Button>
                        <Button
                            fullWidth
                            radius="sm"
                            color="default"
                            variant="flat"
                            size="sm"
                            className="h-9 border border-gray-200/80 bg-white px-2 text-xs font-medium text-success sm:text-sm dark:border-white/10 dark:bg-white/[0.04]"
                            isDisabled={isLoadingData}
                            onPress={onOpen}>캐릭터 추가</Button>
                        <Tooltip 
                            showArrow
                            placement="bottom"
                            content="캐릭터 정보만 수정되며, 체크리스트는 영향을 주지 않습니다.">
                            <Button
                                fullWidth
                                radius="sm"
                                color="default"
                                variant="flat"
                                size="sm"
                                className="h-9 border border-gray-200/80 bg-white px-2 text-xs font-medium text-primary sm:text-sm dark:border-white/10 dark:bg-white/[0.04]"
                                isDisabled={isDisableUpdate || isLoadingData}
                                isLoading={isLoading}
                                onPress={onClickUpdatedCharacters}>캐릭터 갱신하기</Button>
                        </Tooltip>
                        <AutoChecklistControl
                            checklist={checklist}
                            bosses={bosses}
                            dispatch={dispatch}
                            isDisabled={isLoadingData}
                            selectedNickname={autoChecklistNickname}
                            setSelectedNickname={setAutoChecklistNickname}
                            onSharingStateChange={setAutoChecklistSharing}/>
                    </div>
                </CardFooter>
            </Card>
            <PositionModal
                isOpenModalPosition={isOpenModalPosition}
                onOpenChangePosition={onOpenChangePosition}
                checklist={checklist}
                dispatch={dispatch}/>
            <Modal
                radius="lg"
                size="lg"
                scrollBehavior="inside"
                isDismissable={false}
                isOpen={isOpen}
                onOpenChange={onOpenChange}
                onClose={onCloseModal}>
                <ModalContent className="border border-gray-200/80 dark:border-white/10">
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1 border-b border-gray-200/80 px-6 py-5 dark:border-white/10">
                                <div className="flex items-center gap-2">
                                    <span className="h-5 w-1 rounded-full bg-success"/>
                                    <p className="text-xl font-semibold">캐릭터 추가</p>
                                </div>
                                <p className="pl-3 text-sm font-normal fadedtext">대표 캐릭터를 조회하고 추가할 캐릭터를 선택하세요.</p>
                            </ModalHeader>
                            <ModalBody className="px-6 py-5">
                                <div className="w-full">
                                    <div className="mb-5 flex flex-col items-start gap-2 sm:flex-row">
                                        <Input
                                            label="대표 캐릭터 이름"
                                            labelPlacement="outside"
                                            placeholder="2~12 글자"
                                            maxLength={12}
                                            size="lg"
                                            radius="sm"
                                            variant="bordered"
                                            value={inputValue}
                                            onValueChange={setInputValue}
                                            className="grow"/>
                                        <Button
                                            size="lg"
                                            radius="sm"
                                            isLoading={isLoadingSearch}
                                            color="primary"
                                            variant="flat"
                                            className="w-full shrink-0 font-semibold sm:w-[96px] sm:self-end"
                                            onPress={onClickLoadCharacters}>조회</Button>
                                    </div>
                                    <div className="mb-4 max-h-[360px] space-y-2 overflow-y-auto overflow-x-hidden pr-1">
                                        {result.map((item, index) => (
                                            <div key={`${item.server}-${item.nickname}`} className="min-h-[64px] w-full">
                                                <Checkbox
                                                    aria-label={item.nickname}
                                                    isDisabled={((MAX_CHARACTER_COUNT <= checklist.length + getCheckedResult(result)) && !item.isCheck) || isHaveCharacter(checklist, item.nickname)}
                                                    classNames={{
                                                        base: cn(
                                                            "w-full max-w-full bg-gray-50/80 dark:bg-white/[0.035]",
                                                            "hover:bg-primary/[0.04]",
                                                            "cursor-pointer rounded-xl gap-2 border border-gray-200/80 dark:border-white/10 m-auto box-border p-3",
                                                            "data-[selected=true]:border-primary"
                                                        ),
                                                        label: "w-full",
                                                    }}
                                                    isSelected={item.isCheck}
                                                    onValueChange={(isSelected) => {
                                                        handleSelectCharacter(isSelected, index, result, setResult);
                                                    }}>
                                                    <div className="w-full flex flex-col">
                                                        <span className="fadedtext text-sm">@{item.server} · {item.job} · Lv.{item.level}</span>
                                                        <span className="text-md">{item.nickname}</span>
                                                    </div>
                                                </Checkbox>
                                            </div>
                                        ))}
                                    </div>
                                    <div className={clsx(
                                        "mb-4 items-center gap-2 rounded-xl bg-gray-50/80 p-3 dark:bg-white/[0.035]",
                                        result.length !== 0 ? 'flex' : 'hidden'
                                    )}>
                                        <div className="grow">
                                            <Tooltip showArrow content="선택된 캐릭터들이 생성될 때 골드 지정 캐릭터로 지정할 것인지 확인합니다.">
                                                <Checkbox
                                                    color="warning"
                                                    isSelected={isGold}
                                                    onValueChange={setGold}>골드 지정</Checkbox>
                                            </Tooltip>
                                        </div>
                                        <Tooltip showArrow content="기존에 등록된 캐릭터 수 + 체크한 캐릭터 갯수">
                                            <span>({getCheckedResult(result)+checklist.length}/{MAX_CHARACTER_COUNT})</span>
                                        </Tooltip>
                                    </div>
                                    <div className={clsx(
                                        "mb-4 rounded-xl border border-gray-200/80 bg-gray-50/80 p-4 dark:border-white/10 dark:bg-white/[0.035]",
                                        result.length !== 0 ? 'block' : 'hidden'
                                    )}>
                                        <RadioGroup label="계정 선택" value={selected} onValueChange={setSelected} className="mb-6">
                                            {accounts.length > 0 ? accounts.map((account, index) => (
                                                <Radio key={index} value={account}>{account}</Radio>
                                            )) : <Radio value="본계정">본계정</Radio>}
                                        </RadioGroup>
                                        <Input
                                            label="추가할 계정 이름"
                                            radius="sm"
                                            labelPlacement="outside"
                                            placeholder="2~12글자"
                                            variant="bordered"
                                            value={inputAccount}
                                            onValueChange={setInputAccount}/>
                                        <Button
                                            fullWidth
                                            size="sm"
                                            radius="sm"
                                            variant="flat"
                                            color="success"
                                            isDisabled={inputAccount === ''}
                                            className="mt-3 font-medium"
                                            onPress={onClickAddAccount}>
                                            계정 추가
                                        </Button>
                                    </div>
                                    <Button
                                        fullWidth
                                        radius="sm"
                                        isDisabled={getCheckedResult(result) === 0}
                                        isLoading={isLoadingAdd}
                                        color="primary"
                                        size="lg"
                                        className={clsx(
                                            "mb-1 font-semibold",
                                            result.length !== 0 ? 'block' : 'hidden'
                                        )}
                                        onPress={async () => {
                                            await handleAddCharacter(checklist, result, dispatch, onClose, setLoadingAdd, isGold, bosses, selected);
                                        }}>추가</Button>
                                </div>
                            </ModalBody>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </>
    )
}

// 서버 선택 컴포넌트
type SelectServerProps = {
    checklist: CheckCharacter[],
    server: string,
    setServer: SetStateFn<string>,
    compact?: boolean
}
function LegacySelectServer({ checklist, server, setServer }: SelectServerProps) {
    return (
        <RadioGroup
            description="서버를 선택하면 해당 서버인 캐릭터만 조회됩니다." 
            label="서버 선택"
            orientation="horizontal"
            value={server}
            onValueChange={setServer}
            classNames={{
                label: "text-sm font-medium text-foreground",
                description: "text-xs",
                wrapper: "mt-1 flex-wrap gap-2",
            }}>
            <CustomRadio key={0} value="전체">전체</CustomRadio>
            {getServerList(checklist).map((server, index) => (
                <CustomRadio key={index+1} value={server}>{server}</CustomRadio>
            ))}
        </RadioGroup>
    )
}

// 커스텀 라디오 요소
export function SelectServer({ checklist, server, setServer, compact = false }: SelectServerProps) {
    return (
        <Select
            aria-label="서버 선택"
            label={compact ? undefined : "서버 선택"}
            placeholder="서버를 선택하세요"
            selectedKeys={new Set([server])}
            radius="md"
            variant="bordered"
            size={compact ? "sm" : "md"}
            startContent={compact ? (
                <span className="shrink-0 border-r border-gray-200/80 pr-2 text-[10px] font-semibold text-gray-500 dark:border-white/10 dark:text-gray-400">서버</span>
            ) : undefined}
            disallowEmptySelection
            onSelectionChange={(keys) => {
                const selectedServer = Array.from(keys)[0];
                if (selectedServer !== undefined) {
                    setServer(String(selectedServer));
                }
            }}
            className="w-full"
            classNames={compact ? {
                trigger: "h-10 min-h-10 cursor-pointer rounded-lg border-gray-200/80 bg-white px-3 shadow-sm transition-colors data-[hover=true]:border-gray-300 data-[hover=true]:bg-gray-50/80 dark:border-white/10 dark:bg-[#171717] dark:data-[hover=true]:border-white/20 dark:data-[hover=true]:bg-white/[0.06]",
                value: "text-xs font-semibold text-gray-700 dark:text-gray-200",
                selectorIcon: "text-gray-400 dark:text-gray-500",
                popoverContent: "rounded-xl border border-gray-200/80 shadow-xl dark:border-white/10"
            } : undefined}
        >
            {['전체', ...getServerList(checklist)].map((serverName) => (
                <SelectItem key={serverName}>{serverName}</SelectItem>
            ))}
        </Select>
    );
}

function CustomRadio(props: RadioProps) {
    const { children, ...otherProps } = props;
    return (
        <Radio
            {...otherProps}
            classNames={{
                base: cn(
                    "inline-flex m-0 items-center justify-between bg-gray-100/80 hover:bg-gray-200/70 dark:bg-white/[0.04] dark:hover:bg-white/[0.08]",
                    "flex-row-reverse max-w-none cursor-pointer rounded-lg gap-3 border border-transparent px-3 py-2",
                    "data-[selected=true]:border-primary data-[selected=true]:bg-primary-50 dark:data-[selected=true]:bg-white/[0.08]",
                ),
            }}>
            {children}
        </Radio>
    )
}

// 체크리스트 컴포넌트
type ChecklistProps = {
    checklist: CheckCharacter[],
    server: string,
    bosses: Boss[],
    cubes: Cube[],
    dispatch: AppDispatch,
    onOpen: () => void,
    setModalData: SetStateFn<ModalData>,
    biweekly: number,
    isHideDayContent: boolean,
    filterContent: Selection,
    isRemainHomework: boolean,
    isShowGoldCharacter: boolean,
    accounts: string[],
    setAccounts: SetStateFn<string[]>,
    filterAccount: Selection,
    isHideCompleteContent: boolean,
    isHideBonusMode: boolean,
    isHideParadisePower: boolean,
    isHideCharacterMemo: boolean,
    autoChecklistNickname: string,
    isAutoChecklistSharing: boolean,
    setAutoChecklistNickname: (nickname: string) => void,
    isAutoRegisteringRaids: boolean,
    onRaidAutoRegistration: (nickname?: string) => Promise<void>
}
export function ChecklistComponent({ 
    checklist, 
    server, 
    bosses, 
    cubes, 
    dispatch, 
    onOpen, 
    setModalData, 
    biweekly, 
    isHideDayContent, 
    filterContent,
    isRemainHomework,
    isShowGoldCharacter,
    accounts,
    setAccounts,
    filterAccount,
    isHideCompleteContent,
    isHideBonusMode,
    isHideParadisePower,
    isHideCharacterMemo,
    autoChecklistNickname,
    isAutoChecklistSharing,
    setAutoChecklistNickname,
    isAutoRegisteringRaids,
    onRaidAutoRegistration
}: ChecklistProps) {
    const [inputCubeControl, setInputCubeControl] = useState<{ [nickname: string]: number }>({});
    const [isBonusMode, setBonusMode] = useState<{ [nickname: string]: boolean }>({});
    const isMobile = useMobileQuery();

    return (
        <div className={clsx(
            "w-full min-[541px]:w-[max-content] mt-5 grid gap-4 mx-auto",
            checklist.filter((character) => (character.server === server || server === '전체') && filterChecklist(character, filterContent, bosses, checklist, isRemainHomework, isShowGoldCharacter, filterAccount)).length > 0 ? isHideDayContent ? "grid-cols-1 min-[709]:grid-cols-2 min-[1055px]:grid-cols-3 min-[1401px]:grid-cols-4 min-[1747px]:grid-cols-5 min-[2093px]:grid-cols-6 min-[2439px]:grid-cols-7 min-[2785px]:grid-cols-8 min-[3131px]:grid-cols-9 min-[3477px]:grid-cols-10" : "grid-cols-1 min-[1137px]:grid-cols-2 min-[1713px]:grid-cols-3 min-[2289px]:grid-cols-4 min-[2865px]:grid-cols-5 min-[3441px]:grid-cols-6" : ''
        )}>
            {checklist
                .filter((character) => (character.server === server || server === '전체') && filterChecklist(character, filterContent, bosses, checklist, isRemainHomework, isShowGoldCharacter, filterAccount)).length > 0 ? checklist
                .filter((character) => (character.server === server || server === '전체') && filterChecklist(character, filterContent, bosses, checklist, isRemainHomework, isShowGoldCharacter, filterAccount))
                .map((character, index) => (
                    <Card key={index} fullWidth radius="lg" shadow="none" className={clsx(
                        "w-full overflow-hidden border border-gray-200/80 bg-white shadow-sm dark:border-white/10 dark:bg-[#171717]",
                        isHideDayContent ? isMobile ? "" : "min-[331px]:w-[330px]" : "min-[561px]:w-[560px]"
                    )}>
                        <CardHeader className="flex-col items-stretch p-4 pb-3">
                            <div className={clsx(
                                "w-full flex items-center gap-1",
                                isHideDayContent ? "flex-col" : "flex-col md960:flex-row"
                            )}>
                                <Chip
                                    radius="md"
                                    color="default"
                                    variant="flat"
                                    className={clsx(
                                        "my-1 min-w-full py-1 bg-gray-100/80 dark:bg-white/[0.05]",
                                        isHideDayContent ? '' : 'hidden'
                                    )}>
                                    <div className="grid grid-cols-[4fr_1px_10fr_1px_5fr] gap-1 text-center text-xs">
                                        <p className={clsx(
                                            character.isGold ? 'text-yellow-600 dark:text-yellow-400' : 'fadedtext'
                                        )}>골드 지정</p>
                                        <Divider orientation="vertical" className="min-h-full"/>
                                        <p>{character.account}</p>
                                        <Divider orientation="vertical" className="min-h-full"/>
                                        <p>{character.server}</p>
                                    </div>
                                </Chip>
                                <div className="w-full grow flex flex-col gap-1">
                                    <div className="w-full flex gap-2 items-center">
                                    <JobEmblemIcon job={character.job} size={38}/>
                                    <div className="flex grow flex-row md960:flex-col items-center">
                                        <div className="grow-1 w-full">
                                            <div className="mt-1 flex min-w-0 items-center gap-1.5 text-xs dark:[&>span]:text-sky-300">
                                                <p className="min-w-0 truncate fadedtext">{character.job} · Lv.{character.level}</p>
                                                {isAutoChecklistSharing && autoChecklistNickname === character.nickname ? (
                                                    <span className="shrink-0 font-medium text-primary">자동 체크 중...</span>
                                                ) : null}
                                            </div>
                                            <div className="flex min-w-0 gap-1 items-center">
                                                <span className={clsx(
                                                    isHideDayContent ? isMobile ? "text-xl" : "text-lg" : "text-xl",
                                                    character.nickname.length >= 12 && "md960:whitespace-nowrap md960:text-[15px] md960:tracking-tight"
                                                )}>{character.nickname}</span>
                                                <div className="hidden items-center md960:flex">
                                                    <SettingButton 
                                                        size={14}
                                                        compact
                                                        checklist={checklist} 
                                                        characterIndex={getIndexByNickname(checklist, character.nickname)}
                                                        dispatch={dispatch}
                                                        accounts={accounts}
                                                        setAccounts={setAccounts}
                                                        isAutoRegisteringRaids={isAutoRegisteringRaids}
                                                        onRaidAutoRegistration={onRaidAutoRegistration}/>
                                                    <AutoChecklistCharacterButton
                                                        size={14}
                                                        nickname={character.nickname}
                                                        selectedNickname={autoChecklistNickname}
                                                        isSharing={isAutoChecklistSharing}
                                                        onSelect={setAutoChecklistNickname}/>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="block md960:hidden">
                                            <SettingButton 
                                                size={24} 
                                                checklist={checklist} 
                                                characterIndex={getIndexByNickname(checklist, character.nickname)}
                                                dispatch={dispatch}
                                                accounts={accounts}
                                                setAccounts={setAccounts}
                                                isAutoRegisteringRaids={isAutoRegisteringRaids}
                                                onRaidAutoRegistration={onRaidAutoRegistration}/>
                                        </div>
                                    </div>
                                    </div>
                                    {isHideDayContent && !isHideCharacterMemo && (
                                        <div className="w-full min-w-0">
                                            <CharacterMemo
                                                checklist={checklist}
                                                nickname={character.nickname}
                                                dispatch={dispatch}
                                            />
                                        </div>
                                    )}
                                </div>
                                <div className={clsx(
                                    "w-full h-full md960:w-[330px] flex",
                                    isHideDayContent ? 'px-0 sm:px-4 items-start' : 'flex-col items-end gap-1'
                                )}>
                                    <div className={clsx(
                                        "flex gap-2",
                                        isHideDayContent ? 'hidden' : ''
                                    )}>
                                        <Chip size="sm" variant="flat" radius="sm" color="warning" className={clsx(
                                            "text-[8pt] p-0.5",
                                            character.isGold ? 'hidden sm:flex' : 'hidden'
                                        )}>
                                            골드 지정
                                        </Chip>
                                        <Chip 
                                            size="sm"
                                            variant="flat"
                                            radius="sm"
                                            className="text-[8pt]">
                                            {character.account}
                                        </Chip>
                                        <Chip 
                                            size="sm"
                                            variant="flat"
                                            radius="sm"
                                            color="primary"
                                            className="text-[8pt]">
                                            {character.server}
                                        </Chip>
                                    </div>
                                    <Popover showArrow disableAnimation radius="md">
                                        <PopoverTrigger>
                                            <Progress 
                                                aria-label="all-gold"
                                                size="sm"
                                                color="warning"
                                                label={(
                                                    <div className="flex items-center">
                                                        <img 
                                                            src="/icons/gold.png" 
                                                            alt="goldicon"
                                                            className="w-[16px] h-[16px]"/>
                                                        <span className="ml-1 text-md"><AnimatedNumber value={getCompleteGoldCharacter(bosses, character) + getOtherGoldTotal(character)}/> / <AnimatedNumber value={getAllGoldCharacter(bosses, character) + getOtherGoldTotal(character)}/></span>
                                                    </div>
                                                )}
                                                showValueLabel={getAllGoldCharacter(bosses, character)+getOtherGoldTotal(character) > 0}
                                                radius="md"
                                                value={Math.max(0, getCompleteGoldCharacter(bosses, character)+getOtherGoldTotal(character))}
                                                maxValue={Math.max(1, getAllGoldCharacter(bosses, character)+getOtherGoldTotal(character))}
                                                className="w-full cursor-pointer [&_[data-slot=label]]:mb-1"/>
                                        </PopoverTrigger>
                                        <PopoverContent className="border border-gray-200/80 bg-white/95 p-0 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-[#171717]/95">
                                            <div className="w-[250px] p-4">
                                                <div className="mb-3">
                                                    <p className="font-semibold">골드 획득 상세</p>
                                                    <p className="mt-0.5 text-xs fadedtext">완료한 콘텐츠 기준 획득량입니다.</p>
                                                </div>
                                                <div className="flex w-full items-center gap-2 rounded-lg bg-gray-100/70 px-3 py-2 dark:bg-white/[0.05]">
                                                    <div className="w-[9px] h-[9px] rounded-full bg-green-500"/>
                                                    <p className="grow">콘텐츠</p>
                                                    <div className="flex items-center">
                                                        <img 
                                                            src="/icons/gold.png" 
                                                            alt="goldicon"
                                                            className="w-[16px] h-[16px]"/>
                                                        <span className="ml-1 text-md">{getCompleteSharedGoldCharacter(bosses, character).toLocaleString()}</span>
                                                    </div>
                                                </div>
                                                <div className="mt-2 flex w-full items-center gap-2 rounded-lg bg-gray-100/70 px-3 py-2 dark:bg-white/[0.05]">
                                                    <div className="w-[9px] h-[9px] rounded-full bg-yellow-500"/>
                                                    <p className="grow">귀속 골드</p>
                                                    <div className="flex items-center">
                                                        <img 
                                                            src="/icons/gold.png" 
                                                            alt="goldicon"
                                                            className="w-[16px] h-[16px]"/>
                                                        <span className="ml-1 text-md">{getCompleteBoundGoldCharacter(bosses, character).toLocaleString()}</span>
                                                    </div>
                                                </div>
                                                <div className="mt-2 flex w-full items-center gap-2 rounded-lg bg-gray-100/70 px-3 py-2 dark:bg-white/[0.05]">
                                                    <div className="w-[9px] h-[9px] rounded-full bg-purple-600"/>
                                                    <p className="grow">부수입</p>
                                                    <div className="flex items-center">
                                                        <img
                                                            src="/icons/gold.png"  
                                                            alt="goldicon"
                                                            className="w-[16px] h-[16px]"/>
                                                        <span className="ml-1 text-md">{getOtherGoldTotal(character).toLocaleString()}</span>
                                                    </div>
                                                </div>
                                                <div className="relative mt-3 h-2 w-full overflow-hidden rounded-full bg-gray-200">
                                                    <div className="absolute top-0 left-0 h-full bg-[#dddddd] dark:bg-[#444444]" style={{ width: '100%' }}></div>
                                                    <div className="absolute top-0 left-0 h-full bg-purple-600" style={{ width: `${getAllGoldCharacter(bosses, character)+getOtherGoldTotal(character) > 0 ? Math.max(0, Math.min(100, Math.round((getCompleteSharedGoldCharacter(bosses, character) + getCompleteBoundGoldCharacter(bosses, character) + getOtherGoldTotal(character)) / (getAllGoldCharacter(bosses, character)+getOtherGoldTotal(character)) * 1000) / 10)) : 0}%` }}></div>
                                                    <div className="absolute top-0 left-0 h-full bg-yellow-500" style={{ width: `${getAllGoldCharacter(bosses, character)+getOtherGoldTotal(character) > 0 ? Math.max(0, Math.min(100, Math.round((getCompleteSharedGoldCharacter(bosses, character) + getCompleteBoundGoldCharacter(bosses, character)) / (getAllGoldCharacter(bosses, character)+getOtherGoldTotal(character)) * 1000) / 10)) : 0}%` }}></div>
                                                    <div className="absolute top-0 left-0 h-full bg-green-500" style={{ width: `${getAllGoldCharacter(bosses, character)+getOtherGoldTotal(character) > 0 ? Math.max(0, Math.min(100, Math.round(getCompleteSharedGoldCharacter(bosses, character) / (getAllGoldCharacter(bosses, character)+getOtherGoldTotal(character)) * 1000) / 10)) : 0}%` }}></div>
                                                </div>
                                            </div>
                                        </PopoverContent>
                                    </Popover>
                                </div>
                            </div>
                            {!isHideDayContent && !isHideCharacterMemo && (
                                <div className="mt-2 w-full border-t border-gray-200/70 pt-2 dark:border-white/10">
                                    <CharacterMemo
                                        checklist={checklist}
                                        nickname={character.nickname}
                                        dispatch={dispatch}
                                    />
                                </div>
                            )}
                        </CardHeader>
                        <Divider/>
                        <CardBody className="p-4 pt-3">
                            <div className="flex w-full flex-col gap-3 md960:flex-row">
                                <div className={clsx(
                                    "min-w-0 grow",
                                    isHideDayContent ? 'hidden' : 'block'
                                )}>
                                    <div className="mb-2 flex items-center justify-between gap-2 border-b border-success-200/70 pb-2 dark:border-success-900/50">
                                        <div>
                                            <p className="text-sm font-semibold text-success-700 dark:text-success-400">일일 콘텐츠</p>
                                            <p className="text-[11px] fadedtext">매일 초기화되는 숙제</p>
                                        </div>
                                        <Chip color="success" size="sm" variant="flat" radius="md">{character.daylist.length + 2}개</Chip>
                                    </div>
                                    <RestCheckButton checklist={checklist} character={character} type="전선" dispatch={dispatch}/>
                                    <RestCheckButton checklist={checklist} character={character} type="가디언" dispatch={dispatch}/>
                                    <div className="w-full">
                                        {character.daylist.map((item, idx) => (
                                            <AnimatedChecklistFrame
                                                key={idx}
                                                color="secondary-muted"
                                                isSelected={item.isCheck}
                                                className="mt-2 w-full">
                                                 <Checkbox
                                                    aria-label={`checklist-${item.name}-${idx}`}
                                                    size="sm"
                                                    color="secondary"
                                                    radius="full"
                                                    isSelected={item.isCheck}
                                                    icon={AnimatedChecklistCheckIcon}
                                                    className="relative z-10 box-border w-full max-w-full px-2 py-1.5"
                                                    onChange={async () => await handleDayListCheck(checklist, getIndexByNickname(checklist, character.nickname), idx, dispatch)}>
                                                    {item.name}</Checkbox>
                                            </AnimatedChecklistFrame>
                                        ))}
                                    </div>
                                    <Button 
                                        color="success"
                                        variant="light"
                                        fullWidth 
                                        size="sm" 
                                        radius="lg"
                                        className="group mt-3 h-10 justify-start border border-success-200/80 bg-gradient-to-r from-success-50/90 to-emerald-50/60 px-2.5 font-semibold text-success-700 shadow-sm transition-all hover:border-success-300 hover:shadow-md dark:border-success-800/70 dark:from-success-950/40 dark:to-emerald-950/20 dark:text-success-300 dark:hover:border-success-700"
                                        onPress={() => {
                                            setModalData({
                                                characterIndex: getIndexByNickname(checklist, character.nickname),
                                                type: 'day'
                                            });
                                            onOpen();
                                        }}>
                                        <span className="flex w-full items-center gap-2">
                                            <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-success-100 text-success-700 transition-transform group-hover:scale-105 dark:bg-success-900/60 dark:text-success-300">
                                                <AddIcon size={14}/>
                                            </span>
                                            <span className="min-w-0 grow truncate text-left">추가 및 휴식 게이지 관리</span>
                                            <span className="shrink-0 text-[10px] font-medium text-success-600/70 dark:text-success-400/70">설정</span>
                                        </span>
                                    </Button>
                                </div>
                                <div className={clsx(
                                    "min-w-0 grow-2",
                                    isHideDayContent ? "" : "border-t border-gray-200/80 pt-3 dark:border-white/10 md960:border-l md960:border-t-0 md960:pl-4 md960:pt-0"
                                )}>
                                    <div className="flex w-full items-center gap-2 border-b border-secondary-200/70 pb-2 dark:border-secondary-700/70">
                                        <div className="grow">
                                            <p className="text-sm font-semibold text-secondary-700 dark:text-secondary-700">주간 콘텐츠</p>
                                            <p className="text-[11px] text-gray-500 dark:text-gray-400">주간 초기화되는 숙제</p>
                                        </div>
                                        <Tooltip
                                            showArrow
                                            content={(isBonusMode[character.nickname] ?? false) ? "더보기 관리 모드를 종료합니다." : "관문별 더보기를 설정합니다."}>
                                            <Button
                                                size="sm"
                                                radius="full"
                                                variant="bordered"
                                                disableRipple
                                                disableAnimation
                                                aria-pressed={isBonusMode[character.nickname] ?? false}
                                                className={clsx(
                                                    "group h-8 min-w-fit shrink-0 gap-1.5 overflow-visible px-2.5 text-xs font-semibold",
                                                    (isBonusMode[character.nickname] ?? false)
                                                        ? "!border-secondary-400 !bg-white !text-secondary-800 dark:!border-secondary-500 dark:!bg-[#18181b] dark:!text-secondary-200"
                                                        : "!border-secondary-200 !bg-white !text-secondary-700 hover:!border-secondary-400 hover:!bg-gray-50 dark:!border-secondary-700 dark:!bg-[#18181b] dark:!text-secondary-200 dark:hover:!border-secondary-500 dark:hover:!bg-[#222225]",
                                                    isHideBonusMode ? 'hidden' : ''
                                                )}
                                                onPress={() => {
                                                    setBonusMode(prev => ({
                                                        ...prev,
                                                        [character.nickname]: !(prev[character.nickname] ?? false)
                                                    }));
                                                }}>
                                                <span className={clsx(
                                                    "flex h-5 w-5 items-center justify-center rounded-full transition-colors",
                                                    (isBonusMode[character.nickname] ?? false)
                                                        ? "bg-default-100 text-secondary-700 dark:bg-white/10 dark:text-secondary-200"
                                                        : "bg-default-100 text-secondary-700 group-hover:bg-default-200 dark:bg-white/10 dark:text-secondary-200 dark:group-hover:bg-white/15"
                                                )}>
                                                    {(isBonusMode[character.nickname] ?? false) ? <CheckIcon size={12}/> : <AddIcon size={12}/>}
                                                </span>
                                                <span className={(isBonusMode[character.nickname] ?? false) ? "!text-secondary-800 dark:!text-white" : "!text-secondary-700 dark:!text-[#f5e9ff]"}>
                                                    {(isBonusMode[character.nickname] ?? false) ? "편집 중" : "더보기 편집"}
                                                </span>
                                                {(isBonusMode[character.nickname] ?? false) ? (
                                                    <span className="h-1.5 w-1.5 rounded-full bg-secondary-500 shadow-[0_0_0_3px_rgba(168,85,247,0.12)] dark:bg-secondary-300"/>
                                                ) : null}
                                            </Button>
                                        </Tooltip>
                                     </div>
                                    <div className="px-0 py-0">
                                        {character.checklist.length === 0 ? (
                                            <div className="w-full h-[140px] flex items-center justify-center">
                                                <p className="fadedtext">등록된 숙제가 없습니다.</p>
                                            </div>
                                        ) : null}
                                        {character.checklist.filter(item => {
                                            if (isHideCompleteContent) {
                                                if (!isCheckHomework(item)) {
                                                    return true;
                                                } else {
                                                    return false;
                                                }
                                            } else {
                                                return true;
                                            }
                                        }).length + character.weeklist.filter(item => isHideCompleteContent ? !item.isCheck ? true : false : false).length === 0 && character.checklist.length > 0 ? (
                                            <div className="w-full h-[140px] flex items-center justify-center gap-2">
                                                <CheckIcon size={16}/>
                                                <p className="fadedtext">숙제를 모두 완료했습니다.</p>
                                            </div>
                                        ) : null}
                                        {character.checklist.map((item, idx) => (
                                            <AnimatedChecklistFrame key={idx}
                                                color="primary"
                                                isSelected={isCheckHomework(item)}
                                                className={clsx(
                                                "mt-2 w-full py-1",
                                                isHideCompleteContent ? isCheckHomework(item) ? 'hidden' : '' : ''
                                            )}>
                                                <Checkbox
                                                    aria-label={`checklist-${item.name}-${idx}`}
                                                    size="sm"
                                                    radius="full"
                                                    isSelected={isCheckHomework(item)}
                                                    icon={AnimatedChecklistCheckIcon}
                                                     classNames={{base: "box-border m-0 w-full max-w-none p-0 pl-2", label: "flex min-w-0 flex-1 items-center justify-start text-left"}}
                                                     className="relative z-10 py-0.5 pr-2"
                                                    onValueChange={async () => await useOnClickWeekCheck(checklist, getIndexByNickname(checklist, character.nickname), idx, dispatch)}>
                                                    <div className="w-full flex items-center gap-1">
                                                        <div className="min-w-0">
                                                            <div className="flex gap-1 items-center">
                                                                 <AnimatedChecklistStrike
                                                                     isSelected={isCheckHomework(item)}
                                                                     className={isCheckHomework(item) ? 'fadedtext' : ''}>
                                                                     {getSimpleBossName(bosses, item.name)}
                                                                 </AnimatedChecklistStrike>
                                                                {item.isGold ? <img 
                                                                    src="/icons/gold.png" 
                                                                    alt="goldicon"
                                                                    className="w-[14px] h-[14px]"/> : <></>}
                                                                <Popover showArrow placement="bottom-start">
                                                                    <PopoverTrigger>
                                                                        <button 
                                                                            type="button"
                                                                            onPointerDown={(e) => e.stopPropagation()}
                                                                            onClick={(e) => e.stopPropagation()}
                                                                            onKeyDown={(e) => e.stopPropagation()}
                                                                            aria-label="버스비 설정"
                                                                            className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-md hover:bg-gray-200/70 dark:hover:bg-gray-800">
                                                                            <BusIcon size={16} className={clsx(
                                                                                item.busGold > 0 ? 'text-green-600 dark:text-green-400' : item.busGold < 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-500/70'
                                                                            )}/>
                                                                        </button>
                                                                    </PopoverTrigger>
                                                                    <PopoverContent className="border border-gray-200/80 p-0 shadow-xl dark:border-gray-800">
                                                                        <div className="w-[250px] p-4">
                                                                            <div className="mb-3">
                                                                                <p className="font-semibold">버스비 설정</p>
                                                                                <p className="mt-0.5 text-xs fadedtext">수익은 양수, 지출은 음수로 입력하세요.</p>
                                                                            </div>
                                                                            <NumberInput
                                                                                label="금액"
                                                                                placeholder="0~99999999"
                                                                                radius="md"
                                                                                variant="bordered"
                                                                                hideStepper
                                                                                color={item.busGold > 0 ? 'success' : item.busGold < 0 ? 'danger' : 'default'}
                                                                                value={item.busGold}
                                                                                maxLength={8}
                                                                                onKeyDownCapture={(e) => e.stopPropagation()}
                                                                                onValueChange={async (value: number) => {
                                                                                    await handleEditBusGold(checklist, getIndexByNickname(checklist, character.nickname), idx, dispatch, value);
                                                                                }}/>
                                                                            <div className="mt-3 rounded-lg bg-gray-100/70 px-3 py-2 text-xs fadedtext dark:bg-gray-900">예: 손님으로 10,000 골드를 지출했다면 -10000</div>
                                                                        </div>
                                                                    </PopoverContent>
                                                                </Popover>
                                                            </div>
                                                             {(() => {
                                                                 const goldSummary = getChecklistContentGoldSummary(bosses, item, character.isGold);
                                                                 return (
                                                                     <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[9pt]">
                                                                         <AnimatedChecklistStrike
                                                                             isSelected={isCheckHomework(item)}
                                                                             className={clsx(
                                                                                 "flex items-center gap-1",
                                                                                 isCheckHomework(item) ? "fadedtext" : "text-amber-600 dark:text-amber-400"
                                                                             )}>
                                                                             <span>일반 {goldSummary.gold.toLocaleString()}</span>
                                                                         </AnimatedChecklistStrike>
                                                                         <AnimatedChecklistStrike
                                                                             isSelected={isCheckHomework(item)}
                                                                             className={clsx(
                                                                                 "flex items-center gap-1",
                                                                                 isCheckHomework(item) ? "fadedtext" : "text-blue-600 dark:text-blue-400"
                                                                             )}>
                                                                             <span>귀속 {goldSummary.boundGold.toLocaleString()}</span>
                                                                         </AnimatedChecklistStrike>
                                                                     </div>
                                                                 );
                                                             })()}
                                                        </div>
                                                        <div className="grow"/>
                                                        <div className="z-9">
                                                            <div className={clsx(
                                                                "flex items-center z-9",
                                                                isBonusMode[character.nickname] ?? false ? 'gap-2' : ''
                                                            )}>
                                                                {isBonusMode[character.nickname] ?? false ? item.items.map((diff, ix) => (
                                                                    <Tooltip key={ix} showArrow delay={500} content={
                                                                        <div className="min-w-[200px] p-2">
                                                                            <p className="mb-2 text-sm font-semibold">{diff.stage}관문 더보기</p>
                                                                            <div className="flex gap-1 items-center">
                                                                                <p className="grow fadedtext">더보기 골드</p>
                                                                                <img 
                                                                                    src="/icons/gold.png" 
                                                                                    alt="goldicon"
                                                                                    className="w-[16px] h-[16px]"/>
                                                                                <p>{getBossGoldByContent(bosses, item.name, diff.stage, diff.difficulty).bonus.toLocaleString()}</p>
                                                                            </div>
                                                                            <p className={clsx(
                                                                                "mt-2 rounded-md bg-danger-50 px-2 py-1 text-xs dark:bg-danger-950/30",
                                                                                !diff.isDisable ? "hidden" : "text-red-400 dark:text-red-600"
                                                                            )}>더보기 불가능</p>
                                                                        </div>
                                                                    }>
                                                                        <div className={clsx(
                                                                            'h-7 w-7 flex justify-center items-center p-0.5 rounded-md border-2 leading-none',
                                                                            diff.isDisable ? 'bg-gray-300/30 dark:bg-gray-600/30 fadedtext' : 'cursor-pointer',
                                                                            diff.isBonus ? 'border-yellow-600 dark:border-yellow-400 bg-yellow-600/50 dark:bg-yellow-400/50 text-white' : 'border-gray-400 dark:border-gray-600'
                                                                        )} onClick={async (e) => {
                                                                            e.preventDefault();
                                                                            e.stopPropagation();
                                                                            await handleWeekBonusCheckStage(checklist, getIndexByNickname(checklist, character.nickname), idx, dispatch, diff.stage);
                                                                        }}>
                                                                            {diff.stage}
                                                                        </div>
                                                                    </Tooltip>
                                                                ))
                                                                : (
                                                                    <div className="flex items-stretch">
                                                                        {item.items.map((diff, ix) => (
                                                                            <React.Fragment key={ix}>
                                                                                {ix > 0 && (
                                                                                    <div className={clsx(
                                                                                        "w-[2px] shrink-0 self-stretch",
                                                                                        getBackgroundByStage(diff.difficulty, diff.isDisable)
                                                                                    )}/>
                                                                                )}
                                                                                <Tooltip showArrow delay={500} content={
                                                                            <div className="w-full min-[281px]:w-[280px] p-2">
                                                                                <h3 className="mb-3 font-semibold">{item.name}</h3>
                                                                                <div className="w-full flex gap-2 items-center mb-1.5">
                                                                                    <Chip
                                                                                        radius="sm"
                                                                                        size="sm"
                                                                                        color={getTextColorByDifficulty(diff.difficulty)}
                                                                                        variant="flat">
                                                                                        {diff.difficulty}
                                                                                    </Chip>
                                                                                    <div className="grow"/>
                                                                                    <Chip
                                                                                        radius="sm"
                                                                                        size="sm"
                                                                                        variant="flat">
                                                                                        {diff.stage}관문
                                                                                    </Chip>
                                                                                </div>
                                                                                <Divider/>
                                                                                <div className="my-2 w-full rounded-lg bg-gray-100/70 p-3 dark:bg-gray-900">
                                                                                    <div className="w-full flex gap-2 mb-1 items-center">
                                                                                        <p className="fadedtext">골드</p>
                                                                                        <div className="grow flex gap-1 items-center justify-end">
                                                                                            <img 
                                                                                                src="/icons/gold.png" 
                                                                                                alt="goldicon"
                                                                                                className="w-[16px] h-[16px]"/>
                                                                                            <p>{getBossGoldByContent(bosses, item.name, diff.stage, diff.difficulty).gold.toLocaleString()}</p>
                                                                                        </div>
                                                                                    </div>
                                                                                    <div className={clsx(
                                                                                        "w-full gap-2 mb-1 items-center",
                                                                                        getBossGoldByContent(bosses, item.name, diff.stage, diff.difficulty).boundGold > 0 ? 'flex' : 'hidden'
                                                                                    )}>
                                                                                        <p className="fadedtext">귀속 골드</p>
                                                                                        <div className="grow flex gap-1 items-center justify-end">
                                                                                            <img 
                                                                                                src="/icons/gold.png" 
                                                                                                alt="goldicon"
                                                                                                className="w-[16px] h-[16px]"/>
                                                                                            <p>{getBossGoldByContent(bosses, item.name, diff.stage, diff.difficulty).boundGold.toLocaleString()}</p>
                                                                                        </div>
                                                                                    </div>
                                                                                    <div className={clsx(
                                                                                        "w-full gap-2 items-center",
                                                                                        getBossGoldByContent(bosses, item.name, diff.stage, diff.difficulty).bonus > 0 ? 'flex' : 'hidden'
                                                                                    )}>
                                                                                        <p className="fadedtext">더보기 골드</p>
                                                                                        <div className="grow flex gap-1 items-center justify-end">
                                                                                            <img 
                                                                                                src="/icons/gold.png" 
                                                                                                alt="goldicon"
                                                                                                className="w-[16px] h-[16px]"/>
                                                                                            <p>{getBossGoldByContent(bosses, item.name, diff.stage, diff.difficulty).bonus.toLocaleString()}</p>
                                                                                        </div>
                                                                                    </div>
                                                                                    {diff.isBiweekly ? (
                                                                                        <>
                                                                                            <Divider className="mt-2 mb-2"/>
                                                                                            <p className="fadedtext text-sm">해당 관문은 2주에 1번씩 클리어를 하실 수 있습니다.</p>
                                                                                            <p className="fadedtext text-sm">현재 {biweekly%2+1}주차입니다.</p>
                                                                                            {diff.isDisable ? (
                                                                                                <p className="text-red-400 dark:text-red-700 text-sm">저번 주에 이미 이 관문을 완료했었습니다.<br/>다음 주에 이 관문이 초기화됩니다.</p>
                                                                                            ) : null}
                                                                                        </>
                                                                                    ) : null}
                                                                                </div>
                                                                            </div>
                                                                                }>
                                                                                    <div
                                                                                        aria-label={`${diff.stage}관문${diff.isBonus ? ' 더보기 사용 중' : ''}`}
                                                                                        className={clsx(
                                                                                            "relative flex h-7 w-7 cursor-pointer items-center justify-center border-y-2 leading-none first:rounded-l-[4px] first:border-l-2 last:rounded-r-[4px] last:border-r-2",
                                                                                            getBorderByStage(diff.difficulty, diff.isDisable),
                                                                                            diff.isDisable ? 'bg-gray-300/30 dark:bg-gray-600/30 fadedtext' : '',
                                                                                            diff.isCheck ? getBackground50ByStage(diff.difficulty, diff.isDisable) : ''
                                                                                        )}
                                                                                        onClick={async (e) => {
                                                                                            e.preventDefault();
                                                                                            e.stopPropagation();
                                                                                            await handleWeekCheckStage(checklist, getIndexByNickname(checklist, character.nickname), idx, dispatch, diff.stage, diff.isDisable)
                                                                                        }}>
                                                                                        <span>{diff.stage}</span>
                                                                                        {diff.isBonus ? (
                                                                                            <span
                                                                                                aria-hidden="true"
                                                                                                className={clsx(
                                                                                                    "absolute -right-1.5 -top-1.5 z-10 flex h-3.5 w-3.5 items-center justify-center rounded-full border-2 text-[10px] font-black leading-[10px] text-center text-white shadow-sm",
                                                                                                    getBorderByStage(diff.difficulty, diff.isDisable),
                                                                                                    getBackgroundByStage(diff.difficulty, diff.isDisable)
                                                                                                )}>
                                                                                                +
                                                                                            </span>
                                                                                        ) : null}
                                                                                    </div>
                                                                                </Tooltip>
                                                                            </React.Fragment>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </Checkbox>
                                            </AnimatedChecklistFrame>
                                        ))}
                                        {character.weeklist.map((item, idx) => (
                                            <AnimatedChecklistFrame key={idx}
                                                color="secondary"
                                                isSelected={item.isCheck}
                                                className={clsx(
                                                "mt-2 w-full cursor-pointer",
                                                isHideCompleteContent ? item.isCheck ? 'hidden' : '' : ''
                                            )}>
                                                <button
                                                    type="button"
                                                    role="checkbox"
                                                    aria-checked={item.isCheck}
                                                    aria-label={`checklist-${item.name}-${idx}`}
                                                    className="relative z-10 flex w-full cursor-pointer items-center gap-2 px-2.5 py-1.5 text-left text-sm"
                                                     onClick={async () => await handleWeekListCheck(checklist, getIndexByNickname(checklist, character.nickname), idx, dispatch)}>
                                                    <span className={clsx(
                                                        "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border",
                                                        item.isCheck ? "border-secondary bg-secondary text-white" : "border-gray-400 dark:border-gray-600"
                                                    )}>
                                                        <AnimatedChecklistCheckIcon isSelected={item.isCheck} className="h-2.5 w-2.5"/>
                                                    </span>
                                                    <span className={item.isCheck ? "line-through fadedtext" : ""}>{item.name}</span>
                                                </button>
                                            </AnimatedChecklistFrame>
                                         ))}
                                         {character.level >= 1730 && character.hallsHourglassVisible !== false ? (
                                             <AnimatedChecklistFrame
                                                 color="warning"
                                                 isSelected={character.hallsHourglassCheck ?? false}
                                                 className={clsx(
                                                 "mt-2 w-full py-1",
                                                 isHideCompleteContent && character.hallsHourglassCheck ? 'hidden' : ''
                                             )}>
                                                 <Checkbox
                                                     aria-label="할의 모래시계"
                                                     color="warning"
                                                     size="sm"
                                                     radius="full"
                                                     isSelected={character.hallsHourglassCheck ?? false}
                                                     icon={AnimatedChecklistCheckIcon}
                                                     classNames={{base: "w-full max-w-none", label: "flex min-w-0 flex-1 items-center justify-start text-left"}}
                                                     className="relative z-10 box-border w-full max-w-none py-1.5 pl-4 pr-2.5"
                                                     onValueChange={async (isCheck) => {
                                                         await handleHallsHourglassCheck(checklist, character.nickname, isCheck, dispatch);
                                                     }}>
                                                     <span className={character.hallsHourglassCheck ? 'line-through fadedtext' : ''}>할의 모래시계</span>
                                                 </Checkbox>
                                             </AnimatedChecklistFrame>
                                         ) : null}
                                          {character.level >= 1640 && character.paradiseVisible !== false ? (
                                              <AnimatedChecklistFrame
                                                  color="warning"
                                                  isSelected={character.paradiseCheck ?? false}
                                                  className={clsx(
                                                  "mt-2 w-full py-1",
                                                  isHideCompleteContent && character.paradiseCheck ? 'hidden' : ''
                                              )}>
                                                  <Checkbox
                                                      aria-label="낙원"
                                                      color="warning"
                                                      size="sm"
                                                      radius="full"
                                                      isSelected={character.paradiseCheck ?? false}
                                                      icon={AnimatedChecklistCheckIcon}
                                                      classNames={{base: "w-full max-w-none", label: "flex min-w-0 flex-1 items-center justify-start text-left"}}
                                                      className="relative z-10 box-border w-full max-w-none py-1.5 pl-4 pr-2.5"
                                                      onValueChange={async (isCheck) => {
                                                          await handleParadiseCheck(checklist, character.nickname, isCheck, dispatch);
                                                      }}>
                                                      <span className={character.paradiseCheck ? 'line-through fadedtext' : ''}>낙원</span>
                                                  </Checkbox>
                                              </AnimatedChecklistFrame>
                                          ) : null}
                                      </div>
                                     <Button
                                        color="secondary"
                                        variant="light"
                                        fullWidth 
                                        size="sm" 
                                        radius="lg"
                                        className="group mt-3 h-10 justify-start border border-secondary-200/80 bg-gradient-to-r from-secondary-50/90 to-violet-50/60 px-2.5 font-semibold text-secondary-700 shadow-sm transition-all hover:border-secondary-300 hover:shadow-md dark:border-secondary-800/70 dark:from-secondary-950/40 dark:to-violet-950/20 dark:text-secondary-300 dark:hover:border-secondary-700"
                                        onPress={() => {
                                            setModalData({
                                                characterIndex: getIndexByNickname(checklist, character.nickname),
                                                type: 'week'
                                            });
                                            onOpen();
                                        }}>
                                        <span className="flex w-full items-center gap-2">
                                            <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-secondary-100 text-secondary-700 transition-transform group-hover:scale-105 dark:bg-secondary-900/60 dark:text-secondary-300">
                                                <AddIcon size={14}/>
                                            </span>
                                            <span className="min-w-0 grow truncate text-left">주간 콘텐츠 관리</span>
                                            <span className="shrink-0 text-[10px] font-medium text-secondary-600/70 dark:text-secondary-400/70">편집</span>
                                        </span>
                                    </Button>
                                </div>
                            </div>
                        </CardBody>
                        <Divider/>
                        <CardFooter className="pt-0 pb-0">
                            <div className="w-full pt-3">
                                <div className="mb-3">
                                    <OtherGoldManager character={character} dispatch={dispatch}/>
                                </div>
                                {!isHideParadisePower && (
                                    <>
                                        <CharacterParadisePower checklist={checklist} nickname={character.nickname} dispatch={dispatch}/>
                                        <Divider/>
                                    </>
                                )}
                                <Accordion>
                                    <AccordionItem key="0" title={<span className="flex gap-2 items-center cursor-pointer">
                                        <img 
                                            src="/icons/cube.png" 
                                            alt="cubeicon"
                                            className="w-[18px] h-[18px]"/>
                                        <span>큐브 - 총합 {getAllCubeCount(character)}장</span>
                                    </span>}>
                                    <div>
                                        <NumberInput
                                            fullWidth
                                            label="큐브 증감량"
                                            labelPlacement="outside"
                                            placeholder="0 ~ 999"
                                            maxValue={999}
                                            size="sm"
                                            value={inputCubeControl[character.nickname] ?? 0}
                                            onValueChange={(value: number) => {
                                                setInputCubeControl(prev => ({...prev, [character.nickname]: value}));
                                            }}/>
                                        <Tabs fullWidth aria-label="cube-tabs" className="mt-2">
                                            <Tab key="setting" title="개수">
                                                <CubeCountComponent 
                                                    checklist={checklist} 
                                                    character={character} 
                                                    cubes={cubes} 
                                                    dispatch={dispatch}
                                                    count={inputCubeControl[character.nickname]}/>
                                            </Tab>
                                            <Tab key="statue" title="보상">
                                                <CubeStatueComponent character={character} cubes={cubes}/>
                                            </Tab>
                                        </Tabs>
                                    </div>
                                    </AccordionItem>
                                </Accordion>
                            </div>
                        </CardFooter>
                    </Card>
                )) : (
                    <div className="w-full h-[300px] flex justify-center items-center">
                        <p className="fadedtext">선택한 필터에 해당하는 캐릭터를 찾을 수 없습니다.</p>
                    </div>
                )}
        </div>
    )
}

// 계정 선택 Modal
type SelectAccountModalProps = {
    isOpenAccount: boolean,
    onOpenAccount: (isOpen: boolean) => void,
    dispatch: AppDispatch,
    accounts: string[],
    setAccounts: SetStateFn<string[]>,
    characterIndex: number,
    checklist: CheckCharacter[]
}
function SelectAccountModal({ 
    isOpenAccount, 
    onOpenAccount, 
    dispatch, 
    accounts, 
    setAccounts,
    characterIndex,
    checklist
}: SelectAccountModalProps) {
    const [isLoadingButton, setLoadingButton] = useState(false);
    const [selected, setSelected] = useState(checklist[characterIndex].account);
    const [inputName, setInputName] = useState("");

    const onClickAddAccount = useClickAddAccount(inputName, setInputName, accounts, setAccounts);

    return (
        <Modal
            radius="lg"
            size="md"
            scrollBehavior="inside"
            isDismissable={false}
            isOpen={isOpenAccount}
            onOpenChange={onOpenAccount}>
            <ModalContent className="border border-gray-200/80 bg-white dark:border-gray-800 dark:bg-gray-950">
                {(onClose) => (
                    <>
                        <ModalHeader className="flex flex-col gap-1 border-b border-gray-200/80 px-6 py-5 dark:border-gray-800">
                            <div className="flex items-center gap-2">
                                <span className="h-5 w-1 rounded-full bg-primary"/>
                                <p className="text-xl font-semibold">계정 선택</p>
                            </div>
                            <p className="pl-3 text-sm font-normal fadedtext">{checklist[characterIndex].nickname} 캐릭터를 분류할 계정을 선택하세요.</p>
                        </ModalHeader>
                        <ModalBody className="gap-5 px-6 py-5">
                            <div>
                                <RadioGroup
                                    label="등록된 계정"
                                    value={selected}
                                    onValueChange={setSelected}
                                    classNames={{label: "text-sm font-semibold", wrapper: "mt-2 gap-2"}}>
                                    {accounts.length > 0 ? accounts.map((account, index) => (
                                        <Radio key={index} value={account} classNames={{base: "m-0 max-w-full rounded-xl border border-gray-200/80 px-3 py-2.5 hover:bg-gray-100/70 data-[selected=true]:border-primary data-[selected=true]:bg-primary-50/70 dark:border-gray-800 dark:hover:bg-gray-900 dark:data-[selected=true]:bg-primary-950/20"}}>{account}</Radio>
                                    )) : <Radio value="본계정" classNames={{base: "m-0 max-w-full rounded-xl border border-gray-200/80 px-3 py-2.5 data-[selected=true]:border-primary dark:border-gray-800"}}>본계정</Radio>}
                                </RadioGroup>
                            </div>
                            <div className="rounded-xl border border-gray-200/80 bg-gray-50/60 p-4 dark:border-gray-800 dark:bg-gray-900/50">
                                <p className="mb-3 text-sm font-semibold">새 계정 추가</p>
                                <Input
                                    label="추가할 계정 이름"
                                    radius="md"
                                    variant="bordered"
                                    placeholder="2~10글자"
                                    maxLength={10}
                                    value={inputName}
                                    onValueChange={setInputName}/>
                                <Button
                                    fullWidth
                                    size="sm"
                                    radius="md"
                                    variant="flat"
                                    color="success"
                                    isDisabled={inputName === ''}
                                    className="mt-2 font-medium"
                                    onPress={onClickAddAccount}>
                                    계정 추가
                                </Button>
                                <p className="mt-2 text-xs fadedtext">목록에 없는 계정 이름을 먼저 추가할 수 있습니다.</p>
                            </div>
                        </ModalBody>
                        <ModalFooter className="border-t border-gray-200/80 px-6 py-4 dark:border-gray-800">
                            <Button radius="md" variant="light" onPress={onClose}>취소</Button>
                            <Button
                                radius="md"
                                color="primary"
                                isLoading={isLoadingButton}
                                onPress={async () => {
                                    await handleSelectAccount(selected, characterIndex, dispatch, onClose, setLoadingButton, checklist);
                                }}>
                                선택 완료
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    )
}

type CharacterMemoProps = {
    checklist: CheckCharacter[],
    nickname: string,
    dispatch: AppDispatch
}

function CharacterMemo({ checklist, nickname, dispatch }: CharacterMemoProps) {
    const character = checklist.find(item => item.nickname === nickname);
    const [draft, setDraft] = useState(character?.memo ?? '');
    const [isSaving, setSaving] = useState(false);
    const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure();
    const memo = character?.memo ?? '';

    const openEditor = () => {
        setDraft(memo);
        onOpen();
    };

    const saveMemo = async () => {
        setSaving(true);
        const saved = await handleUpdateMemo(checklist, nickname, draft, dispatch);
        setSaving(false);
        if (saved) onClose();
    };

    return (
        <>
            <button
                type="button"
                className="group flex min-h-6 min-w-0 w-full max-w-[520px] cursor-pointer items-start justify-start px-1 text-left hover:text-foreground hover:underline"
                aria-label={memo ? `${nickname} 메모 수정` : `${nickname} 메모 추가`}
                onClick={openEditor}
            >
                <span aria-hidden="true" className="mr-2 shrink-0 text-sm">📝</span>
                <span className={clsx(
                    "max-h-[4.5rem] overflow-hidden whitespace-pre-wrap break-words leading-6",
                    memo ? "line-clamp-3 text-sm text-foreground" : "text-xs fadedtext"
                )}>{memo || "ex) 97돌 없음, 1750레벨 올리기"}</span>
            </button>
            <Modal
                isOpen={isOpen}
                onOpenChange={onOpenChange}
                placement="center"
                size="sm"
            >
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">
                                {nickname} 메모
                            </ModalHeader>
                            <ModalBody>
                                <Textarea
                                    autoFocus
                                    minRows={3}
                                    maxRows={6}
                                    maxLength={300}
                                    value={draft}
                                    placeholder="캐릭터 상태나 임시 메모를 입력하세요."
                                    description={`${draft.length}/300자`}
                                    onValueChange={setDraft}
                                />
                            </ModalBody>
                            <ModalFooter>
                                <Button variant="light" onPress={onClose}>
                                    취소
                                </Button>
                                <Button color="primary" isLoading={isSaving} onPress={saveMemo}>
                                    저장
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </>
    );
}

type CharacterParadisePowerProps = CharacterMemoProps

function CharacterParadisePower({ checklist, nickname, dispatch }: CharacterParadisePowerProps) {
    const character = checklist.find(item => item.nickname === nickname);
    const currentPower = character?.paradisePower ?? 0;
    const [draft, setDraft] = useState(currentPower);
    const [isSaving, setSaving] = useState(false);
    const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure();

    const openEditor = () => {
        setDraft(currentPower);
        onOpen();
    };

    const savePower = async () => {
        if (!Number.isInteger(draft) || draft < 0 || draft > 999999999) {
            addToast({ title: '낙원력 입력 확인', description: '0 이상 999,999,999 이하의 정수를 입력해주세요.', color: 'warning' });
            return;
        }
        setSaving(true);
        const saved = await handleUpdateParadisePower(checklist, nickname, draft, dispatch);
        setSaving(false);
        if (saved) onClose();
    };

    return (
        <>
            <button
                type="button"
                className="flex min-h-7 w-full cursor-pointer items-center gap-2 rounded-md px-1 text-left text-sm hover:bg-gray-100/70 dark:hover:bg-white/[0.04]"
                aria-label={`${nickname} 낙원력 수정`}
                onClick={openEditor}
            >
                <span aria-hidden="true" className="shrink-0 text-sm">⚔️</span>
                <span className="shrink-0 font-medium">낙원력</span>
                <span className={currentPower > 0 ? "font-semibold text-foreground" : "fadedtext"}>
                    {currentPower > 0 ? currentPower.toLocaleString() : '미설정'}
                </span>
                <span className="ml-auto text-xs fadedtext">수정</span>
            </button>
            <Modal isOpen={isOpen} onOpenChange={onOpenChange} placement="center" size="sm">
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader>{nickname} 낙원력</ModalHeader>
                            <ModalBody>
                                <NumberInput
                                    autoFocus
                                    label="낙원력"
                                    labelPlacement="outside"
                                    placeholder="0 ~ 999999999"
                                    minValue={0}
                                    maxValue={999999999}
                                    value={draft}
                                    onValueChange={setDraft}
                                />
                            </ModalBody>
                            <ModalFooter>
                                <Button variant="light" onPress={onClose}>취소</Button>
                                <Button color="primary" isLoading={isSaving} onPress={savePower}>저장</Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </>
    );
}

type AutoChecklistCharacterButtonProps = {
    size: number,
    nickname: string,
    selectedNickname: string,
    isSharing: boolean,
    onSelect: (nickname: string) => void
}

function AutoChecklistCharacterButton({
    size,
    nickname,
    selectedNickname,
    isSharing,
    onSelect
}: AutoChecklistCharacterButtonProps) {
    const isSelected = selectedNickname === nickname;
    const isDisabled = !isSharing || isSelected;
    const ariaLabel = !isSharing
        ? '화면 공유 중에만 자동 체크 캐릭터를 변경할 수 있습니다.'
        : isSelected
            ? `${nickname} 캐릭터가 현재 자동 체크 대상으로 선택되어 있습니다.`
            : `${nickname} 캐릭터로 자동 체크 대상을 변경`;

    return (
        <span className="hidden md960:inline-flex">
            <Tooltip
                showArrow
                placement="top"
                content={isSharing
                    ? isSelected
                        ? '현재 자동 체크 중인 캐릭터입니다.'
                        : '화면 공유 중 자동 체크할 캐릭터로 전환합니다.'
                    : '화면 공유를 켜면 자동 체크 캐릭터를 전환할 수 있습니다.'}>
                <span className="inline-flex">
                    <Button
                        isIconOnly
                        variant="light"
                        size="sm"
                        radius="full"
                        className="h-6 min-w-6 w-6"
                        aria-label={ariaLabel}
                        isDisabled={isDisabled}
                        onPress={() => onSelect(nickname)}>
                        <SwitchCharacterIcon
                            size={size}
                            className={isDisabled ? 'text-gray-300 dark:text-gray-600' : 'text-black dark:text-white'}/>
                    </Button>
                </span>
            </Tooltip>
        </span>
    );
}

// 설정 버튼 요소
type SettingButtonProps = {
    size: number,
    checklist: CheckCharacter[],
    characterIndex: number,
    dispatch: AppDispatch,
    accounts: string[],
    setAccounts: SetStateFn<string[]>,
    compact?: boolean,
    isAutoRegisteringRaids: boolean,
    onRaidAutoRegistration: (nickname?: string) => Promise<void>
}
function SettingButton({
    size,
    checklist,
    characterIndex,
    dispatch,
    accounts,
    setAccounts,
    compact = false,
    isAutoRegisteringRaids,
    onRaidAutoRegistration
}: SettingButtonProps) {
    const [isOpenAccount, setOpenAccount] = useState(false);
    const onOpenChangeAccount = (isOpen: boolean) => setOpenAccount(isOpen);
    return (
        <>
            <Dropdown placement="bottom-end">
                <DropdownTrigger>
                    <Button
                        isIconOnly
                        variant="light"
                        size="sm"
                        radius="full"
                        className={compact ? "h-6 min-w-6 w-6" : undefined}
                        aria-label="캐릭터 설정">
                        <SettingIcon size={size} className="cursor-pointer text-gray-500" />
                    </Button>
                </DropdownTrigger>
                <DropdownMenu aria-label="캐릭터 설정 메뉴" variant="flat" className="min-w-[190px] p-1">
                    <DropdownItem 
                        key="gold"
                        startContent={
                            <img
                                src="/icons/gold.png" 
                                alt="goldicon"
                                className="w-[16px] h-[16px]"/>
                        }
                        onPress={async () => {
                            await handleCheckGold(checklist, characterIndex, !checklist[characterIndex].isGold, dispatch);
                        }}>{checklist[characterIndex].isGold ? "골드 지정 해제" : "골드 지정"}</DropdownItem>
                    <DropdownItem 
                        key="account"
                        startContent={
                            <CharacterIcon className="w-4 h-4"/>
                        }
                        onPress={async () => {
                            setOpenAccount(true);
                        }}>계정 선택</DropdownItem>
                    <DropdownItem
                        key="auto-register-raids"
                        isDisabled={isAutoRegisteringRaids}
                        startContent={<RaidIcon size={16}/>}
                        onPress={async () => {
                            await onRaidAutoRegistration(checklist[characterIndex].nickname);
                        }}>레이드 자동 등록</DropdownItem>
                    <DropdownItem 
                        key="reset-cube"
                        startContent={
                            <img 
                                src="/icons/cube.png" 
                                alt="cubeicon"
                                className="w-[16px] h-[16px]"/>
                        }
                        onPress={async () => {
                            if (confirm('큐브 데이터를 삭제하시겠습니까? 한번 삭제한 데이터를 복구하실 수 없습니다.')) {
                                await handleResetCube(checklist, characterIndex, dispatch);
                            }
                        }}>큐브 초기화</DropdownItem>
                    <DropdownItem 
                        key="delete"
                        color="danger"
                        className="text-danger"
                        startContent={
                            <DeleteIcon/>
                        }
                        onPress={async () => {
                            if (confirm(`\"${checklist[characterIndex].nickname}\"의 캐릭터를 삭제하시겠습니까? 삭제하시면 다시 복구하실 수 없습니다.`)) {
                                await handleRemoveCharacter(checklist, characterIndex, dispatch);
                            }
                        }}>캐릭터 삭제</DropdownItem>
                </DropdownMenu>
            </Dropdown>
            <SelectAccountModal
                accounts={accounts}
                setAccounts={setAccounts}
                dispatch={dispatch}
                isOpenAccount={isOpenAccount}
                onOpenAccount={onOpenChangeAccount}
                characterIndex={characterIndex}
                checklist={checklist}/>
        </>
    );
}

// 휴식 전용 체크 버튼 요소 (쿠르잔 전선, 가디언 토벌, 에포나 의뢰)
type RestCheckButtonProps = {
    checklist: CheckCharacter[],
    character: CheckCharacter,
    type: string,
    dispatch: AppDispatch
}
function RestCheckButton({ checklist, character, type, dispatch }: RestCheckButtonProps) {
    const dayValue: DayValue = getTypeDayValue(character, type);
    const onClickDayCheck = useOnClickDayCheck(checklist, character.nickname, type, character.day, dispatch);
    const isSelected = type === '에포나' ? dayValue.value === 3 : dayValue.value === 1;
    return (
        <AnimatedChecklistFrame
            color="warning-muted"
            isSelected={isSelected}
            className="mt-2 box-border w-full max-w-full">
            <Checkbox
                aria-label={`${character.nickname}'s ${type}`}
                size="sm"
                color="warning"
                lineThrough
                radius="full"
                isSelected={isSelected}
                icon={AnimatedChecklistCheckIcon}
                className="relative z-10 w-full p-0 px-2 py-1.5"
                onChange={onClickDayCheck}>
                {getDayName(type, character.level)} ({dayValue.value}/{type === '에포나' ? 3 : 1})
            </Checkbox>
            <div className={clsx(
                "w-full h-[8px] mt-1 px-2",
                type === '에포나' ? 'hidden' : 'block'
            )}>
                <RestComponent restValue={dayValue.restValue} type={type}/>
            </div>
            <div className="w-full flex gap-1 text-[10pt] mt-0.5 px-2">
                <p className="fadedtext">휴식 게이지</p>
                <p className="ml-auto">{dayValue.restValue}</p>
            </div>
        </AnimatedChecklistFrame>
    )
}

// 휴식 게이지 요소
type RestComponentProps = {
    restValue: number,
    type: string
}
function RestComponent({ restValue, type }: RestComponentProps) {
    const maxRestValue = getMaxRestValue(type);
    const countBlocks = restValue / (maxRestValue/10);

    return (
        <div className="flex w-full h-full gap-1">
            {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="grow h-full flex">
                    <div className={clsx(
                        "grow border-1 border-r-0 border-gray-300 dark:border-gray-700",
                        countBlocks >= (2*index + 1) ? 'bg-green-400 dark:bg-green-600' : "bg-[#111111]/15 dark:bg-[#111111]/30"
                    )}/>
                    <div className={clsx(
                        "grow border-1 border-l-0 border-gray-300 dark:border-gray-700",
                        countBlocks >= (2*index + 2) ? 'bg-green-400 dark:bg-green-600' : "bg-[#111111]/15 dark:bg-[#111111]/30"
                    )}/>
                </div>
            ))}
        </div>
    )
}

// 숙제 추가 및 삭제 Modal
type ChecklistModalProps = {
    isOpen: boolean,
    modalData: ModalData,
    onOpenChange: (isOpen: boolean) => void,
    checklist: CheckCharacter[],
    dispatch: AppDispatch,
    bosses: Boss[]
}

type WeekCharacterSelectorProps = {
    checklist: CheckCharacter[],
    selectedNickname: string,
    isDisabled: boolean,
    onSelect: (nickname: string) => void,
    children: React.ReactNode
}

function WeekCharacterSelector({ checklist, selectedNickname, isDisabled, onSelect, children }: WeekCharacterSelectorProps) {
    const selectedCharacter = checklist.find(character => character.nickname === selectedNickname) ?? checklist[0] ?? null;

    return (
        <div className="w-full">
            <div className="mb-4 lg:hidden">
                <Select
                    label="관리할 캐릭터"
                    placeholder="캐릭터를 선택해 주세요"
                    selectedKeys={selectedCharacter ? new Set([selectedCharacter.nickname]) : new Set()}
                    onSelectionChange={keys => {
                        if (isDisabled) return;
                        const nickname = Array.from(keys)[0];
                        if (nickname) onSelect(String(nickname));
                    }}
                    isDisabled={isDisabled}
                    radius="lg"
                    classNames={{
                        trigger: "min-h-14 border-gray-200/80 bg-white dark:border-gray-800 dark:bg-gray-950",
                        value: "text-sm"
                    }}>
                    {checklist.map(character => (
                        <SelectItem
                            key={character.nickname}
                            textValue={`${character.nickname} ${character.job} ${character.level}`}>
                            <div className="flex items-center gap-2">
                                <JobEmblemIcon job={character.job} size={28}/>
                                <div className="min-w-0">
                                    <p className="truncate text-sm font-semibold">{character.nickname}</p>
                                    <p className="truncate text-xs fadedtext">@{character.server} · {character.job} · Lv.{character.level}</p>
                                </div>
                            </div>
                        </SelectItem>
                    ))}
                </Select>
            </div>

            <div className="grid min-w-0 gap-5 lg:grid-cols-[250px_minmax(0,1fr)]">
                <aside className="hidden min-h-0 lg:block">
                    <div className="sticky top-0 max-h-[min(640px,calc(100vh-220px))] overflow-y-auto rounded-2xl border border-gray-200/80 bg-gray-50/70 p-2 dark:border-gray-800 dark:bg-gray-900/40">
                        <div className="px-2 pb-2 pt-1">
                            <p className="text-sm font-semibold">캐릭터 선택</p>
                            <p className="mt-0.5 text-xs fadedtext">숙제 정렬 순서</p>
                        </div>
                        <div className="space-y-2">
                            {checklist.map(character => {
                                const isSelected = character.nickname === selectedCharacter?.nickname;
                                return (
                                    <Button
                                        key={character.nickname}
                                        fullWidth
                                        variant="light"
                                        radius="lg"
                                        isDisabled={isDisabled}
                                        aria-label={`${character.nickname} 주간 콘텐츠 관리`}
                                        onPress={() => onSelect(character.nickname)}
                                        className={clsx(
                                            "h-auto min-h-[68px] justify-start border px-2.5 py-2 text-left transition-all",
                                            isSelected
                                                ? "border-secondary-400 bg-secondary-50 shadow-sm ring-1 ring-secondary-300/50 dark:border-secondary-500/70 dark:bg-secondary-950/40 dark:ring-secondary-500/30"
                                                : "border-gray-200/80 bg-white hover:border-secondary-300 hover:bg-secondary-50/60 dark:border-gray-800 dark:bg-gray-950 dark:hover:border-secondary-700 dark:hover:bg-secondary-950/30",
                                            isDisabled && "cursor-not-allowed opacity-60"
                                        )}>
                                        <div className="flex min-w-0 w-full items-center gap-2">
                                            <JobEmblemIcon job={character.job} size={34} className="shrink-0"/>
                                            <div className="min-w-0 grow">
                                                <p className="truncate text-[11px] leading-4 fadedtext">
                                                    @{character.server} · {character.job} · Lv.{character.level}
                                                </p>
                                                <div className="flex min-w-0 items-center gap-1.5">
                                                    <p className="min-w-0 grow truncate text-sm font-semibold text-gray-800 dark:text-gray-100">
                                                        {character.nickname}
                                                    </p>
                                                    {character.isGold ? (
                                                        <img src="/icons/gold.png" alt="골드 지정" className="h-4 w-4 shrink-0"/>
                                                    ) : null}
                                                </div>
                                            </div>
                                        </div>
                                    </Button>
                                );
                            })}
                        </div>
                    </div>
                </aside>
                <div className="min-w-0">
                    {children}
                </div>
            </div>
        </div>
    );
}

export function ChecklistModal({ isOpen, modalData, onOpenChange, checklist, dispatch, bosses }: ChecklistModalProps) {
    const [hasUnsavedOrder, setHasUnsavedOrder] = useState(false);
    const [selectedWeekTab, setSelectedWeekTab] = useState("content");
    const [selectedWeekNickname, setSelectedWeekNickname] = useState(
        checklist[modalData.characterIndex]?.nickname ?? ""
    );

    useEffect(() => {
        if (!isOpen) {
            setHasUnsavedOrder(false);
            setSelectedWeekTab("content");
        }
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) return;
        const target = checklist[modalData.characterIndex];
        if (target) setSelectedWeekNickname(target.nickname);
    }, [isOpen, modalData.characterIndex]);

    const requestClose = () => {
        if (hasUnsavedOrder) {
            addToast({
                title: "저장되지 않은 순서 변경",
                description: "순서 저장 또는 취소를 먼저 눌러주세요.",
                color: "warning"
            });
            return;
        }
        onOpenChange(false);
    };

    if (modalData.characterIndex !== -1 && checklist[modalData.characterIndex]) {
        const selectedWeekIndex = checklist.findIndex(character => character.nickname === selectedWeekNickname);
        const weekIndex = selectedWeekIndex >= 0 ? selectedWeekIndex : modalData.characterIndex;
        const selectedWeekCharacter = checklist[weekIndex];
        const headerCharacter = modalData.type === 'week'
            ? selectedWeekCharacter
            : checklist[modalData.characterIndex];
        return (
            <Modal
                radius="lg"
                size={modalData.type === 'week' ? "5xl" : "2xl"}
                scrollBehavior="inside"
                isDismissable={false}
                isOpen={isOpen}
                onOpenChange={(open) => {
                    if (open) onOpenChange(true);
                    else requestClose();
                }}>
                <ModalContent className="border border-gray-200/80 bg-white dark:border-gray-800 dark:bg-gray-950">
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1 border-b border-gray-200/80 px-6 py-5 dark:border-gray-800">
                                <div className="flex items-center gap-2">
                                    <span className={clsx("h-5 w-1 rounded-full", modalData.type === 'day' ? "bg-success" : "bg-secondary")}/>
                                    <p className="text-xl font-semibold">{headerCharacter.nickname} 콘텐츠 관리</p>
                                </div>
                                <p className="pl-3 text-sm font-normal fadedtext">{modalData.type === 'day' ? '휴식 게이지와 일일 기타 숙제를 관리합니다.' : '레이드 및 주간 기타 숙제를 관리합니다.'}</p>
                            </ModalHeader>
                            <ModalBody className="px-6 py-5">
                                <div className="w-full">
                                    {modalData.type === 'day' ?
                                        <DayModalContent
                                            checklist={checklist}
                                            index={modalData.characterIndex}
                                            dispatch={dispatch}
                                            onClose={requestClose}
                                            onOrderDirtyChange={setHasUnsavedOrder}/> :
                                        <WeekCharacterSelector
                                            checklist={checklist}
                                            selectedNickname={selectedWeekCharacter.nickname}
                                            isDisabled={hasUnsavedOrder}
                                            onSelect={nickname => {
                                                if (hasUnsavedOrder) {
                                                    addToast({
                                                        title: "저장되지 않은 순서 변경",
                                                        description: "순서 저장 또는 취소를 먼저 눌러주세요.",
                                                        color: "warning"
                                                    });
                                                    return;
                                                }
                                                setSelectedWeekNickname(nickname);
                                            }}>
                                            <WeekModalContent
                                                key={selectedWeekCharacter.nickname}
                                                checklist={checklist}
                                                index={weekIndex}
                                                dispatch={dispatch}
                                                bosses={bosses}
                                                onClose={requestClose}
                                                selectedKey={selectedWeekTab}
                                                setSelectedKey={setSelectedWeekTab}
                                                onOrderDirtyChange={setHasUnsavedOrder}/>
                                        </WeekCharacterSelector>}
                                </div>
                            </ModalBody>
                        </>
                    )}
                </ModalContent>
            </Modal>
        )
    } else {
        return <></>;
    }
}

// 일일 콘텐츠 추가 및 삭제 컴포넌트
type DayModalContentProps = {
    checklist: CheckCharacter[],
    index: number,
    dispatch: AppDispatch,
    onClose: () => void,
    onOrderDirtyChange: (isDirty: boolean) => void
}
function DayModalContent({ checklist, index, dispatch, onClose, onOrderDirtyChange }: DayModalContentProps) {
    const [selectedKey, setSelectedKey] = useState('rest');
    const [isOrderDirty, setOrderDirty] = useState(false);

    useEffect(() => {
        onOrderDirtyChange(isOrderDirty);
    }, [isOrderDirty, onOrderDirtyChange]);

    const handleTabChange = (key: React.Key) => {
        const nextKey = String(key);
        if (nextKey !== selectedKey && isOrderDirty) {
            addToast({
                title: "저장되지 않은 순서 변경",
                description: "순서 저장 또는 취소를 먼저 눌러주세요.",
                color: "warning"
            });
            return;
        }
        setSelectedKey(nextKey);
    };

    return (
        <div className="w-full">
            <Tabs aria-label="day-tab" fullWidth color="success" variant="underlined" selectedKey={selectedKey} onSelectionChange={handleTabChange} classNames={{tabList: "gap-5", panel: "px-0 pb-1 pt-5"}}>
                <Tab key="rest" title="휴식 게이지">
                    <RestStatueComponent
                        checklist={checklist}
                        dispatch={dispatch}
                        index={index}
                        onClose={onClose}/>
                </Tab>
                <Tab key="other" title="기타">
                    <DayListComponent
                        checklist={checklist}
                        dispatch={dispatch}
                        index={index}
                        onClose={onClose}
                        onOrderDirtyChange={setOrderDirty}/>
                </Tab>
            </Tabs>
        </div>
    )
}

// 일일 기타 숙제 관리 컴포넌트
type DayListComponentProps = {
    checklist: CheckCharacter[],
    index: number,
    dispatch: AppDispatch,
    onClose: () => void,
    onOrderDirtyChange: (isDirty: boolean) => void
}
function DayListComponent({ checklist, index, dispatch, onClose, onOrderDirtyChange }: DayListComponentProps) {
    const [isLoadingAdd, setLoadingAdd] = useState(false);
    const [isSavingOrder, setSavingOrder] = useState(false);
    const [isOrderDirty, setOrderDirty] = useState(false);
    const [entries, setEntries] = useState<ReorderEntry<OtherList>[]>([]);
    const [originalEntries, setOriginalEntries] = useState<ReorderEntry<OtherList>[]>([]);
    const [inputValue, setInputValue] = useState('');
    const isOrderLocked = isOrderDirty || isSavingOrder;

    useEffect(() => {
        onOrderDirtyChange(isOrderDirty);
    }, [isOrderDirty, onOrderDirtyChange]);
    const otherItem: OtherList = {
        name: inputValue,
        isCheck: false
    }
    const onClickAddDayList = useOnClickAddDayList(checklist, index, dispatch, otherItem, setLoadingAdd, setInputValue);

    useEffect(() => {
        if (!isOrderLocked) {
            const nextEntries = createReorderEntries(checklist[index]?.daylist ?? [], 'daylist');
            setEntries(nextEntries);
            setOriginalEntries(nextEntries);
        }
    }, [checklist, index, isOrderLocked]);

    const handleDragEnd = (result: { source: { index: number }, destination?: { index: number } | null }) => {
        if (!result.destination || result.source.index === result.destination.index) return;
        const nextEntries = [...entries];
        const [movedEntry] = nextEntries.splice(result.source.index, 1);
        nextEntries.splice(result.destination.index, 0, movedEntry);
        if (!isOrderDirty) setOriginalEntries(entries);
        setEntries(nextEntries);
        setOrderDirty(true);
    };

    const handleSaveOrder = async () => {
        if (!isOrderDirty || isSavingOrder) return;
        setSavingOrder(true);
        const isSuccess = await handleReorderContent(checklist, index, 'daylist', entries.map((entry) => entry.value), dispatch);
        if (isSuccess) {
            setOrderDirty(false);
        } else {
            setEntries(originalEntries);
            setOrderDirty(false);
        }
        setSavingOrder(false);
    };

    const handleCancelOrder = () => {
        if (!isOrderDirty || isSavingOrder) return;
        setEntries(originalEntries);
        setOrderDirty(false);
    };
    return (
        <div className="space-y-4">
            <div className="rounded-xl border border-gray-200/80 bg-gray-50/60 p-4 dark:border-gray-800 dark:bg-gray-900/50">
                <p className="mb-3 text-sm font-semibold">기타 일일 숙제 추가</p>
            <Input
                fullWidth
                isRequired
                radius="md"
                variant="bordered"
                label="숙제"
                placeholder="2~15자 안으로 작성하세요."
                maxLength={15}
                value={inputValue}
                onValueChange={setInputValue}
                isDisabled={isOrderLocked}/>
            <Button
                fullWidth
                isLoading={isLoadingAdd}
                isDisabled={isOrderLocked || inputValue.trim() === ''}
                color="primary"
                radius="md"
                className="mt-3 font-medium"
                onPress={onClickAddDayList}>추가</Button>
            </div>
            <div className="flex items-center justify-between gap-3 rounded-xl border border-primary-200/70 bg-primary-50/50 px-4 py-3 dark:border-primary-900/60 dark:bg-primary-950/20">
                <div className="min-w-0">
                    <p className="text-sm font-semibold">숙제 순서</p>
                    <p className="mt-0.5 text-xs fadedtext">왼쪽 그립을 끌어서 순서를 변경하세요.</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                    {isOrderDirty ? (
                        <Button
                            size="sm"
                            radius="md"
                            variant="light"
                            className="text-danger underline underline-offset-2"
                            isDisabled={isSavingOrder}
                            onPress={handleCancelOrder}>
                            취소
                        </Button>
                    ) : null}
                    <Button
                        size="sm"
                        color="primary"
                        radius="md"
                        isLoading={isSavingOrder}
                        isDisabled={!isOrderDirty || isSavingOrder}
                        onPress={handleSaveOrder}>
                        순서 저장
                    </Button>
                </div>
            </div>
            <div className="mt-3 overflow-hidden rounded-xl border border-gray-200/80 dark:border-gray-800">
                <div className="grid grid-cols-[3rem_1fr_auto] items-center gap-2 border-b border-gray-200/80 px-4 py-3 text-xs font-semibold fadedtext dark:border-gray-800">
                    <span>이동</span>
                    <span>숙제명</span>
                    <span>삭제</span>
                </div>
                <DragDropContext onDragEnd={handleDragEnd}>
                    <Droppable droppableId="daylist-order">
                        {(provided) => (
                            <div {...provided.droppableProps} ref={provided.innerRef}>
                                {entries.map((entry, entryIndex) => (
                                    <Draggable key={entry.id} draggableId={entry.id} index={entryIndex} isDragDisabled={isSavingOrder}>
                                        {(providedDraggable) => (
                                            <div ref={providedDraggable.innerRef} {...providedDraggable.draggableProps} className="grid grid-cols-[3rem_1fr_auto] items-center gap-2 border-b border-gray-200/80 px-4 py-3 last:border-b-0 dark:border-gray-800">
                                                <span
                                                    aria-label={`${entry.value.name} 순서 이동`}
                                                    role="button"
                                                    tabIndex={isSavingOrder ? -1 : 0}
                                                    className={clsx(
                                                        "inline-flex h-8 w-8 shrink-0 select-none items-center justify-center text-lg leading-none text-gray-500 dark:text-gray-400",
                                                        isSavingOrder ? "cursor-default opacity-50" : "cursor-grab touch-none active:cursor-grabbing"
                                                    )}
                                                    {...providedDraggable.dragHandleProps}>
                                                    ⠿
                                                </span>
                                                <span className="min-w-0 truncate text-sm">{entry.value.name}</span>
                                                <Tooltip showArrow color="danger" content="삭제">
                                                    <Button
                                                        isIconOnly
                                                        size="sm"
                                                        variant="flat"
                                                        radius="full"
                                                        color="danger"
                                                        aria-label={`${entry.value.name} 삭제`}
                                                        className="h-8 min-h-8 w-8 min-w-8"
                                                        isDisabled={isOrderLocked}
                                                        onPress={async () => {
                                                            if (confirm('해당 숙제를 삭제하시겠습니까? 삭제 후 되돌릴 수 없습니다.')) {
                                                                await handleRemoveDayList(checklist, index, entryIndex, dispatch);
                                                            }
                                                        }}>
                                                        <DeleteIcon className="h-4 w-4"/>
                                                    </Button>
                                                </Tooltip>
                                            </div>
                                        )}
                                    </Draggable>
                                ))}
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                </DragDropContext>
            </div>
        </div>
    )
}

// 휴식 게이지 관리 컴포넌트
type RestStatueComponentProps = {
    checklist: CheckCharacter[],
    dispatch: AppDispatch,
    index: number,
    onClose: () => void
}
function RestStatueComponent({ checklist, dispatch, index, onClose }: RestStatueComponentProps) {
    const initialRestValue = {
        dungeon: checklist[index].day.dungeonBouus,
        boss: checklist[index].day.bossBonus,
        quest: checklist[index].day.questBonus
    }
    const [dungeon, setDungeon] = useState(initialRestValue.dungeon);
    const [boss, setBoss] = useState(initialRestValue.boss);
    const [isLoadingSave, setLoadingSave] = useState(false);
    const onClickSaveRest = useOnClickSaveRestValue(checklist, index, dispatch, setLoadingSave, dungeon, boss, onClose);
    return (
        <div className="w-full space-y-4">
            <div className="rounded-xl border border-success-200/70 bg-success-50/30 p-4 dark:border-success-900/50 dark:bg-success-950/10">
            <Progress
                color="success"
                radius="md"
                value={dungeon}
                maxValue={getMaxRestValue('전선')}
                label={<RestLabel value={dungeon} maxValue={getMaxRestValue('전선')} title={getDayName('전선', checklist[index].level)}/>}/>
            <div className="mt-3 flex w-full gap-2">
                <Button
                    color="danger"
                    variant="flat"
                    radius="md"
                    size="sm"
                    isDisabled={dungeon <= 0}
                    className="grow"
                    onPress={() => {
                        const max = getMaxRestValue('전선')
                        let value = dungeon - max/10;
                        if (value < 0) value = 0;
                        setDungeon(value);
                    }}>감소</Button>
                <Button
                    color="success"
                    variant="flat"
                    radius="md"
                    size="sm"
                    isDisabled={dungeon >= getMaxRestValue('전선')}
                    className="grow"
                    onPress={() => {
                        const max = getMaxRestValue('전선')
                        let value = dungeon + max/10;
                        if (value > max) value = max;
                        setDungeon(value);
                    }}>증가</Button>
            </div></div>
            <div className="rounded-xl border border-success-200/70 bg-success-50/30 p-4 dark:border-success-900/50 dark:bg-success-950/10">
            <Progress
                color="success"
                radius="md"
                value={boss}
                maxValue={getMaxRestValue('가디언')}
                label={<RestLabel value={boss} maxValue={getMaxRestValue('가디언')} title="가디언 토벌"/>}/>
            <div className="mt-3 flex w-full gap-2">
                <Button
                    color="danger"
                    variant="flat"
                    radius="md"
                    size="sm"
                    isDisabled={boss <= 0}
                    className="grow"
                    onPress={() => {
                        const max = getMaxRestValue('가디언')
                        let value = boss - max/10;
                        if (value < 0) value = 0;
                        setBoss(value);
                    }}>감소</Button>
                <Button
                    color="success"
                    variant="flat"
                    radius="md"
                    size="sm"
                    isDisabled={boss >= getMaxRestValue('가디언')}
                    className="grow"
                    onPress={() => {
                        const max = getMaxRestValue('가디언')
                        let value = boss + max/10;
                        if (value > max) value = max;
                        setBoss(value);
                    }}>증가</Button>
            </div></div>
            <div className="rounded-xl border border-warning-200/70 bg-warning-50/50 p-4 text-sm dark:border-warning-900/50 dark:bg-warning-950/20">
                <p className="font-semibold text-warning-700 dark:text-warning-400">저장 전 확인</p>
                <p className="mt-1 fadedtext">휴식 게이지를 저장하면 사용된 게이지가 초기화됩니다. 체크를 해제한 경우에는 사용된 게이지를 환급받지 못합니다.</p>
            </div>
            <Button
                fullWidth
                color="primary"
                radius="md"
                isLoading={isLoadingSave}
                className="font-medium"
                onPress={onClickSaveRest}>저장</Button>
        </div>
    )
}

// 휴식 게이지 프로그레스바 라벨
type RestLabelProps = {
    value: number,
    maxValue : number,
    title: string
}
function RestLabel({ value, maxValue, title }: RestLabelProps) {
    return <span className="w-full">{title} : {value} / {maxValue}</span>;
}

// 주간 콘텐츠 추가 및 삭제 컴포넌트
type WeekModalContentProps = {
    checklist: CheckCharacter[],
    index: number,
    dispatch: AppDispatch,
    bosses: Boss[],
    onClose: () => void,
    selectedKey: string,
    setSelectedKey: SetStateFn<string>,
    onOrderDirtyChange: (isDirty: boolean) => void
}
function WeekModalContent({ checklist, index, dispatch, bosses, onClose, selectedKey, setSelectedKey, onOrderDirtyChange }: WeekModalContentProps) {
    const [content, setContent] = useState<Selection>(new Set([]));
    const [difficulty, setDifficulty] = useState<Selection>(new Set([]));
    const [isGold, setGold] = useState(false);
    const [isOrderDirty, setOrderDirty] = useState(false);

    useEffect(() => {
        onOrderDirtyChange(isOrderDirty);
    }, [isOrderDirty, onOrderDirtyChange]);

    const handleTabChange = (key: React.Key) => {
        const nextKey = String(key);
        if (nextKey !== selectedKey && isOrderDirty) {
            addToast({
                title: "저장되지 않은 순서 변경",
                description: "순서 저장 또는 취소를 먼저 눌러주세요.",
                color: "warning"
            });
            return;
        }
        setSelectedKey(nextKey);
    };

    useEffect(() => {
        if (getTakeGold(checklist[index].checklist) >= 3) {
            if (Array.from(content)[0] && Array.from(difficulty)[0]) {
                if (isBiweeklyContent(
                        checklist[index].checklist, 
                        Array.from(content)[0].toString(), 
                        Number(Array.from(difficulty)[0].toString()), 
                        bosses)
                ) {
                    setGold(true);
                } else {
                    setGold(false);
                }
            } else {
                setGold(false);
            }
        } else {
            if (Array.from(content)[0] && Array.from(difficulty)[0]) {
                if (isCheckBiweeklyContent(
                        checklist[index].checklist, 
                        Array.from(content)[0].toString(), 
                        Number(Array.from(difficulty)[0].toString()), 
                        bosses)
                ) {
                    setGold(false);
                } else {
                    setGold(true);
                }
            } else {
                setGold(true);
            }
        }
    }, [difficulty]);

    return (
        <div className="w-full">
            <Tabs
                fullWidth
                aria-label="week-modal"
                color="secondary"
                variant="light"
                radius="lg"
                selectedKey={selectedKey}
                onSelectionChange={handleTabChange}
                classNames={{
                    base: "w-full",
                    tabList: "w-full gap-1 rounded-xl border border-gray-200/80 bg-gray-100/80 p-1 dark:border-white/10 dark:bg-white/[0.05]",
                    cursor: "rounded-lg bg-white shadow-sm ring-1 ring-black/[0.04] dark:bg-white/10 dark:ring-white/10",
                    tab: "h-9 px-2 text-xs font-semibold sm:text-sm",
                    tabContent: "text-gray-500 transition-colors group-data-[selected=true]:text-secondary-700 dark:text-gray-400 dark:group-data-[selected=true]:text-secondary-300",
                    panel: "px-0 pb-1 pt-3"
                }}>
                <Tab key="content" title="콘텐츠">
                    <WeekContentComponent
                        checklist={checklist}
                        index={index}
                        dispatch={dispatch}
                        bosses={bosses}
                        onClose={onClose}
                        content={content}
                        difficulty={difficulty}
                        setContent={setContent}
                        setDifficulty={setDifficulty}
                        isGold={isGold}
                        setGold={setGold}
                        onOrderDirtyChange={setOrderDirty}/>
                </Tab>
                <Tab key="list" title="기타">
                    <WeekListComponent
                        checklist={checklist}
                        index={index}
                        dispatch={dispatch}
                        onClose={onClose}
                        onOrderDirtyChange={setOrderDirty}/>
                </Tab>
                <Tab key="fixed-content" title="추가 콘텐츠">
                    <FixedContentSettings
                        checklist={checklist}
                        index={index}
                        dispatch={dispatch}/>
                </Tab>
            </Tabs>
        </div>
    )
}

type FixedContentSettingsProps = {
    checklist: CheckCharacter[],
    index: number,
    dispatch: AppDispatch
}
function FixedContentSettings({ checklist, index, dispatch }: FixedContentSettingsProps) {
    const [savingContent, setSavingContent] = useState<FixedContentType | null>(null);
    const character = checklist[index];

    const updateVisibility = async (content: FixedContentType, isVisible: boolean) => {
        if (savingContent) return;

        setSavingContent(content);
        try {
            await handleFixedContentVisibility(checklist, character.nickname, content, isVisible, dispatch);
        } finally {
            setSavingContent(null);
        }
    }

    const settings: Array<{
        content: FixedContentType,
        title: string,
        description: string,
        minimumLevel: number,
        isVisible: boolean
    }> = [
        {
            content: 'hallsHourglass',
            title: '할의 모래시계',
            description: '주간 숙제 목록에 할의 모래시계 체크 항목을 표시합니다.',
            minimumLevel: 1730,
            isVisible: character.hallsHourglassVisible !== false
        },
        {
            content: 'paradise',
            title: '낙원',
            description: '주간 숙제 목록에 낙원 체크 항목을 표시합니다.',
            minimumLevel: 1640,
            isVisible: character.paradiseVisible !== false
        }
    ];

    return (
        <div className="space-y-4">
            <div className="rounded-xl border border-secondary-200/70 bg-secondary-50/50 p-4 dark:border-secondary-900/70 dark:bg-secondary-950/20">
                <p className="text-sm font-semibold">고정 추가 콘텐츠 표시</p>
                <p className="mt-1 text-xs fadedtext">캐릭터 레벨 조건을 충족했을 때 주간 숙제에 표시할 콘텐츠를 설정합니다.</p>
            </div>
            <div className="space-y-3">
                {settings.map((setting) => (
                    <div
                        key={setting.content}
                        className="flex items-center justify-between gap-4 rounded-xl border border-gray-200/80 bg-white p-4 dark:border-gray-800 dark:bg-gray-950">
                        <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                                <p className="text-sm font-semibold">{setting.title}</p>
                                <Chip size="sm" variant="flat" color="secondary">Lv. {setting.minimumLevel} 이상</Chip>
                            </div>
                            <p className="mt-1 text-xs fadedtext">{setting.description}</p>
                            {savingContent === setting.content ? (
                                <p className="mt-1 text-xs text-secondary">설정 저장 중...</p>
                            ) : null}
                        </div>
                        <Switch
                            aria-label={`${setting.title} 표시`}
                            color="secondary"
                            size="sm"
                            isSelected={setting.isVisible}
                            isDisabled={savingContent !== null}
                            onValueChange={(isVisible) => updateVisibility(setting.content, isVisible)}>
                            <span className="text-xs">표시</span>
                        </Switch>
                    </div>
                ))}
            </div>
        </div>
    )
}

// 주간 숙제 관리 컴포넌트
type WeekListComponentProps = {
    checklist: CheckCharacter[],
    index: number,
    dispatch: AppDispatch,
    onClose: () => void,
    onOrderDirtyChange: (isDirty: boolean) => void
}
function WeekListComponent({ checklist, index, dispatch, onClose, onOrderDirtyChange }: WeekListComponentProps) {
    const [isLoadingAdd, setLoadingAdd] = useState(false);
    const [isSavingOrder, setSavingOrder] = useState(false);
    const [isOrderDirty, setOrderDirty] = useState(false);
    const [entries, setEntries] = useState<ReorderEntry<OtherList>[]>([]);
    const [originalEntries, setOriginalEntries] = useState<ReorderEntry<OtherList>[]>([]);
    const [inputValue, setInputValue] = useState('');
    const isOrderLocked = isOrderDirty || isSavingOrder;

    useEffect(() => {
        onOrderDirtyChange(isOrderDirty);
    }, [isOrderDirty, onOrderDirtyChange]);
    const otherItem: OtherList = {
        name: inputValue,
        isCheck: false
    }
    const onClickAddItem = useOnClickAddWeekList(checklist, index, dispatch, otherItem, setLoadingAdd, setInputValue);

    useEffect(() => {
        if (!isOrderLocked) {
            const nextEntries = createReorderEntries(checklist[index]?.weeklist ?? [], 'weeklist');
            setEntries(nextEntries);
            setOriginalEntries(nextEntries);
        }
    }, [checklist, index, isOrderLocked]);

    const handleDragEnd = (result: { source: { index: number }, destination?: { index: number } | null }) => {
        if (!result.destination || result.source.index === result.destination.index) return;
        const nextEntries = [...entries];
        const [movedEntry] = nextEntries.splice(result.source.index, 1);
        nextEntries.splice(result.destination.index, 0, movedEntry);
        if (!isOrderDirty) setOriginalEntries(entries);
        setEntries(nextEntries);
        setOrderDirty(true);
    };

    const handleSaveOrder = async () => {
        if (!isOrderDirty || isSavingOrder) return;
        setSavingOrder(true);
        const isSuccess = await handleReorderContent(checklist, index, 'weeklist', entries.map((entry) => entry.value), dispatch);
        if (isSuccess) {
            setOrderDirty(false);
        } else {
            setEntries(originalEntries);
            setOrderDirty(false);
        }
        setSavingOrder(false);
    };

    const handleCancelOrder = () => {
        if (!isOrderDirty || isSavingOrder) return;
        setEntries(originalEntries);
        setOrderDirty(false);
    };
    return (
        <div className="space-y-4">
            <div className="rounded-xl border border-gray-200/80 bg-gray-50/60 p-4 dark:border-gray-800 dark:bg-gray-900/50">
                <p className="mb-3 text-sm font-semibold">기타 주간 숙제 추가</p>
            <Input
                fullWidth
                isRequired
                radius="md"
                variant="bordered"
                label="숙제"
                placeholder="2~15자 안으로 작성하세요."
                maxLength={15}
                value={inputValue}
                onValueChange={setInputValue}
                isDisabled={isOrderLocked}/>
            <Button
                fullWidth
                radius="md"
                isLoading={isLoadingAdd}
                isDisabled={isOrderLocked || inputValue.trim() === ''}
                color="primary"
                className="mt-3 font-medium"
                onPress={onClickAddItem}>추가</Button>
            </div>
            <div className="flex items-center justify-between gap-3 rounded-xl border border-primary-200/70 bg-primary-50/50 px-4 py-3 dark:border-primary-900/60 dark:bg-primary-950/20">
                <div className="min-w-0">
                    <p className="text-sm font-semibold">숙제 순서</p>
                    <p className="mt-0.5 text-xs fadedtext">왼쪽 그립을 끌어서 순서를 변경하세요.</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                    {isOrderDirty ? (
                        <Button size="sm" radius="md" variant="light" className="text-danger underline underline-offset-2" isDisabled={isSavingOrder} onPress={handleCancelOrder}>
                            취소
                        </Button>
                    ) : null}
                    <Button size="sm" color="primary" radius="md" isLoading={isSavingOrder} isDisabled={!isOrderDirty || isSavingOrder} onPress={handleSaveOrder}>
                        순서 저장
                    </Button>
                </div>
            </div>
            <div className="mt-3 overflow-hidden rounded-xl border border-gray-200/80 dark:border-gray-800">
                <div className="grid grid-cols-[3rem_1fr_auto] items-center gap-2 border-b border-gray-200/80 px-4 py-3 text-xs font-semibold fadedtext dark:border-gray-800">
                    <span>이동</span>
                    <span>숙제명</span>
                    <span>삭제</span>
                </div>
                <DragDropContext onDragEnd={handleDragEnd}>
                    <Droppable droppableId="weeklist-order">
                        {(provided) => (
                            <div {...provided.droppableProps} ref={provided.innerRef}>
                                {entries.map((entry, entryIndex) => (
                                    <Draggable key={entry.id} draggableId={entry.id} index={entryIndex} isDragDisabled={isSavingOrder}>
                                        {(providedDraggable) => (
                                            <div ref={providedDraggable.innerRef} {...providedDraggable.draggableProps} className="grid grid-cols-[3rem_1fr_auto] items-center gap-2 border-b border-gray-200/80 px-4 py-3 last:border-b-0 dark:border-gray-800">
                                                <span
                                                    aria-label={`${entry.value.name} 순서 이동`}
                                                    role="button"
                                                    tabIndex={isSavingOrder ? -1 : 0}
                                                    className={clsx(
                                                        "inline-flex h-8 w-8 shrink-0 select-none items-center justify-center text-lg leading-none text-gray-500 dark:text-gray-400",
                                                        isSavingOrder ? "cursor-default opacity-50" : "cursor-grab touch-none active:cursor-grabbing"
                                                    )}
                                                    {...providedDraggable.dragHandleProps}>
                                                    ⠿
                                                </span>
                                                <span className="min-w-0 truncate text-sm">{entry.value.name}</span>
                                                <Tooltip showArrow color="danger" content="삭제">
                                                    <Button
                                                        isIconOnly
                                                        size="sm"
                                                        variant="flat"
                                                        radius="full"
                                                        color="danger"
                                                        aria-label={`${entry.value.name} 삭제`}
                                                        className="h-8 min-h-8 w-8 min-w-8"
                                                        isDisabled={isOrderLocked}
                                                        onPress={async () => {
                                                            if (confirm('해당 숙제를 삭제하시겠습니까? 삭제 후 되돌릴 수 없습니다.')) {
                                                                await handleRemoveWeekList(checklist, index, entryIndex, dispatch);
                                                            }
                                                        }}>
                                                        <DeleteIcon className="h-4 w-4"/>
                                                    </Button>
                                                </Tooltip>
                                            </div>
                                        )}
                                    </Draggable>
                                ))}
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                </DragDropContext>
            </div>
        </div>
    )
}

// 주간 콘텐츠 관리 컴포넌트
type WeekContentComponentProps = {
    checklist: CheckCharacter[],
    index: number,
    dispatch: AppDispatch,
    bosses: Boss[],
    onClose: () => void,
    content: Selection,
    difficulty: Selection,
    setContent: SetStateFn<Selection>,
    setDifficulty : SetStateFn<Selection>,
    isGold: boolean,
    setGold: SetStateFn<boolean>,
    onOrderDirtyChange: (isDirty: boolean) => void
}

type WeekStageEditorProps = {
    bosses: Boss[],
    contentKey: string,
    stages: ControlStage[],
    setStages: SetStateFn<ControlStage[]>
}
function WeekStageEditor({ bosses, contentKey, stages, setStages }: WeekStageEditorProps) {
    if (!contentKey) return <></>;

    return (
        <>
            {getWeekStages(bosses, contentKey).map((level, idx) => (
                <div key={idx} className="mt-3 rounded-xl border border-gray-200/80 bg-gray-50/60 p-3 dark:border-gray-800 dark:bg-gray-900/50">
                    <h3 className="mb-2 text-sm font-semibold">{level}관문 난이도</h3>
                    <Tabs
                        fullWidth
                        radius="md"
                        size="sm"
                        color="primary"
                        variant="light"
                        selectedKey={stages.length > idx ? stages[idx].difficulty : EMPTY_STAGE_DIFFICULTY}
                        onSelectionChange={(key) => {
                            const diff = key.toString();
                            if (stages.length > idx) {
                                const cloneStages = structuredClone(stages);
                                if (idx > 0 && cloneStages[idx - 1].difficulty === EMPTY_STAGE_DIFFICULTY) {
                                    return;
                                }
                                cloneStages[idx].difficulty = diff;
                                if (diff === EMPTY_STAGE_DIFFICULTY) {
                                    for (let i = idx; i < cloneStages.length; i++) {
                                        cloneStages[i].difficulty = EMPTY_STAGE_DIFFICULTY;
                                    }
                                }
                                setStages(cloneStages);
                            }
                        }}>
                        {getDifficultyByStage(bosses, contentKey, level).map((diff) => (
                            <Tab key={diff} title={diff}/>
                        ))}
                    </Tabs>
                </div>
            ))}
        </>
    );
}

function WeekContentComponent({
    checklist,
    index,
    dispatch,
    bosses,
    onClose,
    content, setContent,
    difficulty, setDifficulty,
    isGold, setGold,
    onOrderDirtyChange
}: WeekContentComponentProps) {
    const [isLoadingAdd, setLoadingAdd] = useState(false);
    const [isLoadingEdit, setLoadingEdit] = useState(false);
    const [isSavingOrder, setSavingOrder] = useState(false);
    const [isOrderDirty, setOrderDirty] = useState(false);
    const [entries, setEntries] = useState<ReorderEntry<Checklist>[]>([]);
    const [originalEntries, setOriginalEntries] = useState<ReorderEntry<Checklist>[]>([]);
    const [stages, setStages] = useState<ControlStage[]>([]);
    const [isEditOpen, setEditOpen] = useState(false);
    const [editingIndex, setEditingIndex] = useState(-1);
    const [editStages, setEditStages] = useState<ControlStage[]>([]);
    const isOrderLocked = isOrderDirty || isSavingOrder;

    useEffect(() => {
        onOrderDirtyChange(isOrderDirty);
    }, [isOrderDirty, onOrderDirtyChange]);

    useEffect(() => {
        if (!isOrderLocked) {
            const nextEntries = createReorderEntries(checklist[index]?.checklist ?? [], 'checklist');
            setEntries(nextEntries);
            setOriginalEntries(nextEntries);
        }
    }, [checklist, index, isOrderLocked]);

    const handleDragEnd = (result: { source: { index: number }, destination?: { index: number } | null }) => {
        if (!result.destination || result.source.index === result.destination.index) return;
        const nextEntries = [...entries];
        const [movedEntry] = nextEntries.splice(result.source.index, 1);
        nextEntries.splice(result.destination.index, 0, movedEntry);
        if (!isOrderDirty) setOriginalEntries(entries);
        setEntries(nextEntries);
        setOrderDirty(true);
    };

    const handleSaveOrder = async () => {
        if (!isOrderDirty || isSavingOrder) return;
        setSavingOrder(true);
        const isSuccess = await handleReorderContent(checklist, index, 'checklist', entries.map((entry) => entry.value), dispatch);
        if (isSuccess) {
            setOrderDirty(false);
        } else {
            setEntries(originalEntries);
            setOrderDirty(false);
        }
        setSavingOrder(false);
    };

    const handleCancelOrder = () => {
        if (!isOrderDirty || isSavingOrder) return;
        setEntries(originalEntries);
        setOrderDirty(false);
    };

    useEffect(() => {
        if (!Array.from(content)[0]) setStages([]);
        else {
            const findBoss = getBossesById(bosses, Array.from(content)[0].toString());
            if (findBoss) {
                setStages(createDefaultWeekStages(bosses, Array.from(content)[0].toString()));
            }
        }
    }, [content]);

    const closeEditModal = () => {
        setEditOpen(false);
        setEditingIndex(-1);
        setEditStages([]);
    };

    const handleOpenEdit = (checklistIndex: number) => {
        const targetChecklist = entries[checklistIndex]?.value ?? checklist[index].checklist[checklistIndex];
        const findBoss = bosses.find((boss) => boss.name === targetChecklist.name);
        if (!findBoss) {
            addToast({
                title: "콘텐츠 정보 오류",
                description: "해당 콘텐츠의 기준 데이터를 찾을 수 없습니다.",
                color: "danger"
            });
            return;
        }

        setEditingIndex(checklistIndex);
        setEditStages(createWeekStagesFromChecklist(bosses, findBoss.id, targetChecklist.items));
        setEditOpen(true);
    };

    return (
        <>
            <div className="flex items-center justify-between gap-3 rounded-xl border border-primary-200/70 bg-primary-50/50 px-4 py-3 dark:border-primary-900/60 dark:bg-primary-950/20">
                <div className="min-w-0">
                    <p className="text-sm font-semibold">콘텐츠 순서</p>
                    <p className="mt-0.5 text-xs fadedtext">왼쪽 그립을 끌어서 순서를 변경하세요.</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                    {isOrderDirty ? (
                        <Button size="sm" radius="md" variant="light" className="text-danger underline underline-offset-2" isDisabled={isSavingOrder} onPress={handleCancelOrder}>
                            취소
                        </Button>
                    ) : null}
                    <Button size="sm" color="primary" radius="md" isLoading={isSavingOrder} isDisabled={!isOrderDirty || isSavingOrder} onPress={handleSaveOrder}>
                        순서 저장
                    </Button>
                </div>
            </div>
            <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="checklist-order">
                    {(provided) => (
                        <div className="mt-3 flex w-full flex-col gap-2" {...provided.droppableProps} ref={provided.innerRef}>
                {entries.map((entry, idx) => {
                    const item = entry.value;
                    return (
                    <Draggable key={entry.id} draggableId={entry.id} index={idx} isDragDisabled={isSavingOrder}>
                        {(providedDraggable) => (
                    <div ref={providedDraggable.innerRef} {...providedDraggable.draggableProps} className="flex w-full items-center gap-2 rounded-xl border border-gray-200/80 bg-gray-50/60 p-3 dark:border-gray-800 dark:bg-gray-900/50">
                        <span
                            aria-label={`${item.name} 순서 이동`}
                            role="button"
                            tabIndex={isSavingOrder ? -1 : 0}
                            className={clsx(
                                "inline-flex h-8 w-8 shrink-0 select-none items-center justify-center text-lg leading-none text-gray-500 dark:text-gray-400",
                                isSavingOrder ? "cursor-default opacity-50" : "cursor-grab touch-none active:cursor-grabbing"
                            )}
                            {...providedDraggable.dragHandleProps}>
                            ⠿
                        </span>
                        <div className="grow">
                            <p className="text-sm font-medium">{item.name}</p>
                            <p className="mt-0.5 text-xs fadedtext">{printDifficulty(item.items)}</p>
                        </div>
                        <Switch
                            size="sm"
                            color="primary"
                            isSelected={item.isGold}
                            thumbIcon={({isSelected, className}) => isSelected ? 
                                <img 
                                    src="/icons/gold.png" 
                                    alt="goldicon"
                                    className={className}/>
                                : null}
                            onValueChange={async (isSelected) => {
                                await handleCheckGolds(checklist, index, idx, dispatch, isSelected, bosses);
                            }}
                            isDisabled={isOrderLocked}/>
                        <div className="flex items-center gap-1">
                            <Tooltip showArrow content="콘텐츠 수정">
                                <Button
                                    isIconOnly
                                    size="sm"
                                    variant="flat"
                                    radius="full"
                                    aria-label={`${item.name} 수정`}
                                    className="h-8 min-h-8 w-8 min-w-8"
                                    isDisabled={isOrderLocked}
                                    onPress={() => handleOpenEdit(idx)}>
                                    <EditIcon title="수정" className="h-4 w-4"/>
                                </Button>
                            </Tooltip>
                            <Tooltip showArrow color="danger" content="콘텐츠 삭제">
                                <Button
                                    isIconOnly
                                    size="sm"
                                    variant="flat"
                                    radius="full"
                                    color="danger"
                                     aria-label={`${item.name} 삭제`}
                                     className="h-8 min-h-8 w-8 min-w-8"
                                     isDisabled={isOrderLocked}
                                     onPress={async () => {
                                        if (confirm('해당 콘텐츠를 삭제하시겠습니까? 삭제 후 되돌릴 수 없습니다.')) {
                                            await useOnClickRemoveItem(checklist, index, idx, dispatch);
                                        }
                                    }}>
                                    <DeleteIcon className="h-4 w-4"/>
                                </Button>
                            </Tooltip>
                        </div>
                    </div>
                        )}
                    </Draggable>
                    );
                })}
                {provided.placeholder}
                        </div>
                    )}
                </Droppable>
            </DragDropContext>
            <Modal
                radius="lg"
                size="lg"
                scrollBehavior="inside"
                isOpen={isEditOpen}
                onOpenChange={(open) => {
                    if (!open) {
                        closeEditModal();
                    }
                }}>
                <ModalContent className="border border-gray-200/80 bg-white dark:border-gray-800 dark:bg-gray-950">
                    {() => {
                        const editingChecklist = editingIndex > -1 ? checklist[index].checklist[editingIndex] : null;
                        const editingBoss = editingChecklist ? bosses.find((boss) => boss.name === editingChecklist.name) : null;

                        return (
                            <>
                                <ModalHeader className="flex flex-col gap-1 border-b border-gray-200/80 px-6 py-5 dark:border-gray-800">
                                    <div className="flex items-center gap-2">
                                        <span className="h-5 w-1 rounded-full bg-secondary"/>
                                        <p className="text-xl font-semibold">{editingChecklist ? `${editingChecklist.name} 수정` : '주간 콘텐츠 수정'}</p>
                                    </div>
                                    <p className="pl-3 text-sm font-normal fadedtext">관문별 난이도 설정을 변경합니다.</p>
                                </ModalHeader>
                                <ModalBody className="px-6 py-5">
                                    {editingChecklist && editingBoss ? (
                                        <div className="pb-2">
                                            <WeekStageEditor
                                                bosses={bosses}
                                                contentKey={editingBoss.id}
                                                stages={editStages}
                                                setStages={setEditStages}/>
                                        </div>
                                    ) : (
                                        <p className="text-sm fadedtext">수정할 콘텐츠 정보를 불러올 수 없습니다.</p>
                                    )}
                                </ModalBody>
                                <ModalFooter className="border-t border-gray-200/80 px-6 py-4 dark:border-gray-800">
                                    <Button
                                        variant="light"
                                        radius="md"
                                        onPress={closeEditModal}>
                                        취소
                                    </Button>
                                    <Button
                                        color="primary"
                                        isLoading={isLoadingEdit}
                                        radius="md"
                                        isDisabled={editStages.length === 0 || editStages[0]?.difficulty === EMPTY_STAGE_DIFFICULTY}
                                        onPress={async () => {
                                            if (editingIndex < 0) {
                                                return;
                                            }

                                            const prevChecklist = checklist[index].checklist[editingIndex];
                                            const findBoss = bosses.find((boss) => boss.name === prevChecklist.name);
                                            if (!findBoss) {
                                                return;
                                            }

                                            setLoadingEdit(true);
                                            const editChecklist: Checklist = {
                                                ...prevChecklist,
                                                items: buildWeekChecklistItems(findBoss, editStages, prevChecklist.items)
                                            };

                                            const isSuccess = await useOnClickEditItem(
                                                checklist,
                                                index,
                                                editingIndex,
                                                editChecklist,
                                                dispatch
                                            );
                                            setLoadingEdit(false);

                                            if (isSuccess) {
                                                closeEditModal();
                                            }
                                        }}>
                                        저장
                                    </Button>
                                </ModalFooter>
                            </>
                        );
                    }}
                </ModalContent>
            </Modal>
            <div className="mt-5 rounded-xl border border-gray-200/80 bg-gray-50/60 p-4 dark:border-gray-800 dark:bg-gray-900/50">
                <div className="flex gap-1 items-center">
                    <div className="grow">
                        <p className="font-semibold">레이드 콘텐츠 추가</p>
                        <p className="mt-0.5 text-xs fadedtext">콘텐츠와 관문별 난이도를 선택하세요.</p>
                    </div>
                    <Tooltip showArrow content={<div className="w-[240px] p-2"><p className="font-semibold">골드 획득 횟수</p><p className="mt-1 text-xs">골드 콘텐츠는 기본 3회까지 인정되며, 격주 관문은 별도로 반영됩니다.</p></div>}>
                        <div className="flex items-center gap-1 rounded-lg bg-warning-50 px-2.5 py-1.5 text-sm font-medium text-warning-700 dark:bg-warning-950/30 dark:text-warning-400">
                            <img src="/icons/gold.png" alt="goldicon" className="h-4 w-4"/>
                            {getTakeGold(checklist[index].checklist)}/3
                        </div>
                    </Tooltip>
                </div>
                <Select
                    placeholder="주간 콘텐츠 선택"
                    label="주간 콘텐츠"
                    variant="bordered"
                    radius="md"
                    selectedKeys={content}
                    onSelectionChange={setContent}
                    isDisabled={isOrderLocked}
                    className="mt-4">
                    {getWeekContents(bosses, checklist, index).map((item) => (
                        <SelectItem key={item.key}>{item.name}</SelectItem>
                    ))}
                </Select>
                <WeekStageEditor
                    bosses={bosses}
                    contentKey={Array.from(content)[0]?.toString() ?? ''}
                    stages={stages}
                    setStages={setStages}/>
                <div className={clsx(
                    "mt-3",
                    Array.from(content)[0] ? 'block' : "hidden"
                )}>
                    <Checkbox
                        color="warning"
                        className="rounded-lg bg-warning-50/70 px-2 py-1.5 dark:bg-warning-950/20"
                        isSelected={isGold}
                        isDisabled={isOrderLocked}
                        onValueChange={setGold}>골드 체크</Checkbox>
                </div>
                <Button 
                    fullWidth
                    radius="md"
                    color="primary"
                    isLoading={isLoadingAdd}
                    isDisabled={isOrderLocked || (stages.length > 0 ? stages[0].difficulty === EMPTY_STAGE_DIFFICULTY : true)}
                    onPress={async () => {
                        if (Array.from(content)[0]) {
                            setLoadingAdd(true);
                            const findBoss = getBossesById(bosses, Array.from(content)[0].toString());
                            const name: string = findBoss?.name ?? '';
                            const items = buildWeekChecklistItems(findBoss, stages);
                            const addItem: Checklist = {
                                name: name,
                                isGold: isGold,
                                items: items,
                                busGold: 0
                            }
                            setContent(new Set());
                            await useOnClickAddItem(checklist, index, addItem, dispatch, setLoadingAdd, bosses);
                        }
                    }}
                    className={clsx(
                        "mt-4 font-medium",
                        Array.from(content)[0] ? 'block' : "hidden"
                    )}>추가</Button>
            </div>
        </>
    )
}

// 비 로그인 시 표시되는 컴포넌트
type Sample = {
    name: string,
    isSelected: boolean
}
export function NotLoginedComponent() {
    const datas: Sample[] = [
        {
            name: '카제로스 레이드 - 3막 모르둠 하드',
            isSelected: false
        },
        {
            name: '카제로스 레이드 - 2막 아브렐슈드 하드',
            isSelected: true
        },
        {
            name: '카제로스 레이드 - 1막 에기르 하드',
            isSelected: false
        },
        {
            name: '군단장 레이드 - 카멘 하드 1~3관',
            isSelected: false
        }
    ]
    const [samples, setSamples] = useState<Sample[]>(datas);
    const [isA, setA] = useState(false);
    const [isB, setB] = useState(true);
    return (
        <div className="min-h-[calc(100vh-65px)] p-5 w-full max-w-[1280px] mx-auto">
            <div className="w-full sm:w-[max-content] mt-8 sm:mt-30 flex flex-col items-center mx-auto">
                <h2 className="w-full sm:w-[max-content] text-xl sm:text-4xl font-bold text-center">숙제 기능은 로그인 이후 이용 가능합니다.</h2>
                <p className="mt-4 sm:mt-8 text-center">
                    이 페이지는 로스트아크 캐릭터의 숙제 진행 상황을 시각화하여 확인할 수 있는 기능을 제공합니다.<br/>
                    로그인하시면 직접 사용하는 캐릭터 정보를 기반으로 자동으로 데이터를 조회하고,<br/>
                    주간 골드 수급, 큐브, 레이드, 생활 등 콘텐츠를 편리하게 확인할 수 있습니다.<br/>
                    로스트아크의 반복 콘텐츠를 효율적으로 정리하고 싶다면 지금 로그인해보세요.
                </p>
                <Button
                    as={Link}
                    showAnchorIcon
                    href="/login"
                    color="primary"
                    radius="sm"
                    size="lg"
                    variant="shadow"
                    className="mt-10">
                    로그인 이동
                </Button>
            </div>
            <Divider className="mt-10 mb-10"/>
            <div className="w-full sm:w-[640px] mx-auto">
                <h3 className="mb-4 text-xl">숙제 기능에서의 캐릭터 예시</h3>
                <Card fullWidth radius="sm">
                    <CardHeader>
                        <div className="w-full flex flex-col md960:flex-row items-center gap-2">
                            <div className="w-full flex grow-1 flex-row md960:flex-col items-center">
                                <div className="grow-1 w-full">
                                    <div className="flex gap-2 items-center">
                                        <Chip size="sm" color="warning" className={clsx(
                                            "h-auto pt-0.5 pb-0.5 text-white dark:text-black"
                                        )}>골드 지정</Chip>
                                        <span className="fadedtext text-sm">@카단 · 창술사 · Lv.1740</span>
                                    </div>
                                    <div className="flex gap-2 items-center">
                                        <span className="text-xl">홍길동</span>
                                    </div>
                                </div>
                            </div>
                            <Popover showArrow>
                                <PopoverTrigger>
                                    <div className="w-full md960:w-[330px]">
                                        <Tooltip showArrow content="클릭하면 부수입을 설정하실 수 있습니다.">
                                            <Progress 
                                                aria-label="all-gold"
                                                size="sm"
                                                color="warning"
                                                label={(
                                                    <div className="flex items-center">
                                                        <img 
                                                            src="/icons/gold.png" 
                                                            alt="goldicon"
                                                            className="w-[16px] h-[16px]"/>
                                                        <span className="ml-1 text-md">74000 / 90800</span>
                                                    </div>
                                                )}
                                                showValueLabel
                                                radius="sm"
                                                value={74000}
                                                maxValue={90800}
                                                className="w-full cursor-pointer"/>
                                        </Tooltip>
                                    </div>
                                </PopoverTrigger>
                                <PopoverContent>
                                    <div className="w-full sm300:w-[300px] pt-2">
                                        <span className="text-sm fadedtext">콘텐츠 골드 획득량</span>
                                        <Progress 
                                            aria-label="all-gold"
                                            size="sm"
                                            color="primary"
                                            label={(
                                                <div className="flex items-center">
                                                    <img 
                                                        src="/icons/gold.png" 
                                                        alt="goldicon"
                                                        className="w-[16px] h-[16px]"/>
                                                    <span className="ml-1 text-md">40000 / 90800</span>
                                                </div>
                                            )}
                                            showValueLabel
                                            radius="sm"
                                            value={40000}
                                            maxValue={90800}
                                            className="w-full mb-2"/>
                                        <span className="text-sm fadedtext">귀속 골드 획득량</span>
                                        <Progress 
                                            aria-label="all-gold"
                                            size="sm"
                                            color="warning"
                                            label={(
                                                <div className="flex items-center">
                                                    <img
                                                        src="/icons/gold.png" 
                                                        alt="goldicon"
                                                        className="w-[16px] h-[16px]"/>
                                                    <span className="ml-1 text-md">10800 / 90800</span>
                                                </div>
                                            )}
                                            showValueLabel
                                            radius="sm"
                                            value={10800}
                                            maxValue={90800}
                                            className="w-full mb-2"/>
                                        <span className="text-sm fadedtext">부수입</span>
                                        <Progress 
                                            aria-label="all-gold"
                                            size="sm"
                                            color="secondary"
                                            label={(
                                                <div className="flex items-center">
                                                    <img 
                                                        src="/icons/gold.png" 
                                                        alt="goldicon"
                                                        className="w-[16px] h-[16px]"/>
                                                    <span className="ml-1 text-md">20000 / 90800</span>
                                                </div>
                                            )}
                                            showValueLabel
                                            radius="sm"
                                            value={20000}
                                            maxValue={90800}
                                            className="w-full mb-4"/>
                                    </div>
                                </PopoverContent>
                            </Popover>
                        </div>
                    </CardHeader>
                    <Divider/>
                    <CardBody>
                        <div className="w-full flex flex-col md960:flex-row gap-2">
                            <div className="grow">
                                <Chip 
                                    color="success" 
                                    size="sm" 
                                    variant="flat" 
                                    radius="sm"
                                    className="min-w-full text-center">일일 콘텐츠</Chip>
                                <div 
                                    className={clsx(
                                        "max-w-full w-full mt-2 box-border p-1.5 pt-0.5",
                                        isA ? "outline-2 outline-yellow-400 dark:outline-yellow-700 rounded-md bg-yellow-400/20 dark:bg-yellow-700/20" : ''
                                    )}>
                                    <Checkbox
                                        size="sm"
                                        color="warning"
                                        lineThrough
                                        radius="full"
                                        isSelected={isA}
                                        onValueChange={setA}
                                        className="p-0 pl-2">
                                        쿠르잔 전선
                                    </Checkbox>
                                    <div className={clsx(
                                        "w-full h-[18px] relative mt-1",
                                    )}>
                                        <span className="w-full text-center text-[#444444] dark:text-[#aaaaaa] text-sm absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">휴식 게이지</span>
                                            <div className="flex w-full h-full gap-1">
                                            {Array.from({ length: 5 }).map((_, index) => (
                                                <div key={index} className="grow h-full flex">
                                                    <div className={clsx(
                                                        "grow border-1 border-r-0 border-gray-300 dark:border-gray-700",
                                                        index === 0 ? 'rounded-l-full' : '',
                                                        4 >= (2*index + 1) ? 'bg-green-300 dark:bg-green-700' : "bg-[#111111]/15 dark:bg-[#111111]/30"
                                                    )}/>
                                                    <div className={clsx(
                                                        "grow border-1 border-l-0 border-gray-300 dark:border-gray-700",
                                                        index === 4 ? 'rounded-r-full' : '',
                                                        4 >= (2*index + 2) ? 'bg-green-300 dark:bg-green-700' : "bg-[#111111]/15 dark:bg-[#111111]/30"
                                                    )}/>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div 
                                    className={clsx(
                                        "max-w-full w-full mt-2 box-border p-1.5 pt-0.5",
                                        isB ? "outline-2 outline-yellow-400 dark:outline-yellow-700 rounded-md bg-yellow-400/20 dark:bg-yellow-700/20" : ""
                                    )}>
                                    <Checkbox
                                        size="sm"
                                        color="warning"
                                        lineThrough
                                        radius="full"
                                        isSelected={isB}
                                        onValueChange={setB}
                                        className="p-0 pl-2">
                                        가디언 토벌
                                    </Checkbox>
                                    <div className={clsx(
                                        "w-full h-[18px] relative mt-1",
                                    )}>
                                        <span className="w-full text-center text-[#444444] dark:text-[#aaaaaa] text-sm absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">휴식 게이지</span>
                                            <div className="flex w-full h-full gap-1">
                                            {Array.from({ length: 5 }).map((_, index) => (
                                                <div key={index} className="grow h-full flex">
                                                    <div className={clsx(
                                                        "grow border-1 border-r-0 border-gray-300 dark:border-gray-700",
                                                        index === 0 ? 'rounded-l-full' : '',
                                                        5 >= (2*index + 1) ? 'bg-green-300 dark:bg-green-700' : "bg-[#111111]/15 dark:bg-[#111111]/30"
                                                    )}/>
                                                    <div className={clsx(
                                                        "grow border-1 border-l-0 border-gray-300 dark:border-gray-700",
                                                        index === 4 ? 'rounded-r-full' : '',
                                                        5 >= (2*index + 2) ? 'bg-green-300 dark:bg-green-700' : "bg-[#111111]/15 dark:bg-[#111111]/30"
                                                    )}/>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <Button 
                                    color="primary" 
                                    variant="light" 
                                    fullWidth 
                                    size="sm" 
                                    startContent={<AddIcon size={16}/>}
                                    className="mt-4">추가</Button>
                            </div>
                            <Divider className="block md960:hidden"/>
                            <Divider orientation="vertical" className="hidden md960:block"/>
                            <div className="grow-2">
                                <Chip 
                                    color="secondary" 
                                    size="sm" 
                                    variant="flat" 
                                    radius="sm"
                                    className="min-w-full text-center">주간 콘텐츠</Chip>
                                <div className="pl-2.5">
                                    {samples.map((item, idx) => (
                                        <div key={idx} className={clsx(
                                            "mt-2 w-full cursor-pointer rounded-lg border",
                                            item.isSelected ? "border-primary-200 bg-primary-50/70 dark:border-primary-700/60 dark:bg-primary-500/10" : "border-transparent"
                                        )}>
                                            <button
                                                type="button"
                                                role="checkbox"
                                                aria-checked={item.isSelected}
                                                className="flex w-full cursor-pointer items-center gap-2 px-2.5 py-1.5 text-left text-sm"
                                                onClick={() => {
                                                    const copyArray = structuredClone(samples);
                                                    copyArray[idx].isSelected = !copyArray[idx].isSelected;
                                                    setSamples(copyArray);
                                                }}>
                                                <span className={clsx("flex h-4 w-4 shrink-0 items-center justify-center rounded-full border", item.isSelected ? "border-primary bg-primary text-white" : "border-gray-400 dark:border-gray-600")}>
                                                    {item.isSelected ? <CheckIcon size={10}/> : null}
                                                </span>
                                                <span className={item.isSelected ? "line-through fadedtext" : ""}>{item.name}</span>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                <Button 
                                    color="primary" 
                                    variant="light" 
                                    fullWidth 
                                    size="sm" 
                                    startContent={<AddIcon size={16}/>}
                                    className="mt-4">추가</Button>
                            </div>
                        </div>
                    </CardBody>
                </Card>
                <div className="mt-8">
                    <h3 className="text-xl">숙제 주요 기능</h3>
                    <ul className="list-disc pl-4">
                        <li className="font-bold">⚔️ 일일 & 주간 숙제 기록</li>
                        <p>각 캐릭터의 카오스 던전, 가디언 토벌, 에포나, 레이드 등 주요 콘텐츠 진행 상황을 기록할 수 있습니다.</p>
                        <li className="font-bold">📊 캐릭터별 숙제 진행률 시각화</li>
                        <p>각 캐릭터의 숙제 완료 비율을 퍼센트로 확인할 수 있어, 숙제 누락 방지에 도움이 됩니다.</p>
                        <li className="font-bold">🧙 서버별 캐릭터 정렬</li>
                        <p>선택한 서버 기준으로 캐릭터들을 구분하고 한눈에 볼 수 있는 인터페이스를 제공합니다.</p>
                        <li className="font-bold">💰 골드 수급량 추적 기능</li>
                        <p>주간 골드 수급 목표 대비 현재 달성률을 자동 계산하여 보여줍니다.</p>
                        <li className="font-bold">💎 큐브 관리</li>
                        <p>단순 콘텐츠 외에도 큐브의 개수를 기록할 수 있으며, 가지고 있는 큐브가 몇개의 보석을 얻을 수 있는지 확인할 수 있습니다.</p>
                    </ul>
                </div>
            </div>
        </div>
    )
}

// 캐릭터 필터 컴포넌트
type FilterComponentProps = {
    server: string,
    setServer: SetStateFn<string>,
    filterContent: Selection,
    setFilterContent: SetStateFn<Selection>,
    bosses: Boss[],
    checklist: CheckCharacter[],
    isRemainHomework: boolean,
    setRemainHomework: SetStateFn<boolean>,
    isShowGoldCharacter: boolean,
    setShowGoldCharacter: SetStateFn<boolean>,
    filterAccount: Selection,
    setFilterAccount: SetStateFn<Selection>,
    isHideCompleteContent: boolean,
    setHideCompleteContent: SetStateFn<boolean>,
    isHideDayContent: boolean,
    setHideDayContent: SetStateFn<boolean>
}
export function FilterComponent({ 
    server,
    setServer,
    filterContent, 
    setFilterContent, 
    bosses, 
    checklist,
    isRemainHomework,
    setRemainHomework,
    isShowGoldCharacter,
    setShowGoldCharacter,
    filterAccount,
    setFilterAccount,
    isHideCompleteContent,
    setHideCompleteContent,
    isHideDayContent,
    setHideDayContent
}: FilterComponentProps) {

    return (
        <div className="w-full pt-3 sm:pt-4">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h3 className="font-semibold">검색 필터</h3>
                    <p className="mt-1 text-xs fadedtext">계정, 서버, 콘텐츠를 조합해 필요한 캐릭터만 확인하세요.</p>
                </div>
                <div className="flex items-center justify-between gap-4 rounded-xl border border-gray-200/80 bg-white px-3.5 py-2.5 shadow-sm dark:border-white/10 dark:bg-white/[0.04] sm:min-w-[260px]">
                    <div className="min-w-0">
                        <p className="text-sm font-medium">일일 콘텐츠</p>
                        <p className="mt-0.5 text-xs fadedtext">
                            {isHideDayContent ? '캐릭터 목록에서 숨김' : '캐릭터 목록에 함께 표시'}
                        </p>
                    </div>
                    <Tooltip showArrow content="설정값을 유지하려면 프로필 설정에서 설정하세요.">
                        <Switch
                            aria-label="일일 콘텐츠 숨기기"
                            color="primary"
                            size="sm"
                            isSelected={isHideDayContent}
                            onValueChange={setHideDayContent}
                            className="shrink-0"/>
                    </Tooltip>
                </div>
            </div>
            <div className="grid w-full gap-3 sm:grid-cols-2 md960:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto] md960:items-end">
                <Select
                    aria-label="계정 검색"
                    placeholder="계정을 선택하세요."
                    selectedKeys={filterAccount}
                    radius="md"
                    variant="bordered"
                    size="sm"
                    startContent={(
                        <span className="shrink-0 border-r border-gray-200/80 pr-2 text-[10px] font-semibold text-gray-500 dark:border-white/10 dark:text-gray-400">계정</span>
                    )}
                    onSelectionChange={setFilterAccount}
                    className="w-full"
                    classNames={{
                        trigger: "h-10 min-h-10 cursor-pointer rounded-lg border-gray-200/80 bg-white px-3 shadow-sm transition-colors data-[hover=true]:border-gray-300 data-[hover=true]:bg-gray-50/80 dark:border-white/10 dark:bg-[#171717] dark:data-[hover=true]:border-white/20 dark:data-[hover=true]:bg-white/[0.06]",
                        value: "text-xs font-semibold text-gray-700 dark:text-gray-200",
                        selectorIcon: "text-gray-400 dark:text-gray-500",
                        popoverContent: "rounded-xl border border-gray-200/80 shadow-xl dark:border-white/10"
                    }}>
                    {getAccounts(checklist).map((account, index) => (
                        <SelectItem key={index}>{account}</SelectItem>
                    ))}
                </Select>
                <SelectServer
                    checklist={checklist}
                    server={server}
                    setServer={setServer}
                    compact/>
                <Select
                    aria-label="콘텐츠로 검색"
                    placeholder="콘텐츠를 선택하세요."
                    selectedKeys={filterContent}
                    radius="md"
                    variant="bordered"
                    size="sm"
                    startContent={(
                        <span className="shrink-0 border-r border-gray-200/80 pr-2 text-[10px] font-semibold text-gray-500 dark:border-white/10 dark:text-gray-400">콘텐츠</span>
                    )}
                    onSelectionChange={setFilterContent}
                    className="w-full"
                    classNames={{
                        trigger: "h-10 min-h-10 cursor-pointer rounded-lg border-gray-200/80 bg-white px-3 shadow-sm transition-colors data-[hover=true]:border-gray-300 data-[hover=true]:bg-gray-50/80 dark:border-white/10 dark:bg-[#171717] dark:data-[hover=true]:border-white/20 dark:data-[hover=true]:bg-white/[0.06]",
                        value: "text-xs font-semibold text-gray-700 dark:text-gray-200",
                        selectorIcon: "text-gray-400 dark:text-gray-500",
                        popoverContent: "rounded-xl border border-gray-200/80 shadow-xl dark:border-white/10"
                    }}>
                    {getBossesByHaveContent(checklist, bosses).map((boss, index) => (
                        <SelectItem key={index}>{boss}</SelectItem>
                    ))}
                </Select>
                <div className="flex gap-2 sm:col-span-2 md960:col-span-1">
                    <Popover showArrow placement="bottom-end">
                        <PopoverTrigger>
                            <Button
                                radius="lg"
                                color="primary"
                                variant="bordered"
                                startContent={<AddIcon size={14}/>}
                                className="h-10 min-w-0 flex-1 whitespace-nowrap border-primary-200/90 bg-white px-3 text-xs font-semibold text-primary-700 shadow-sm transition-colors hover:border-primary-300 hover:bg-primary-50/70 dark:border-white/10 dark:bg-[#171717] dark:text-primary-300 dark:hover:border-white/20 dark:hover:bg-white/[0.06] dark:hover:text-primary-200">
                                추가 옵션
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="border border-gray-200/80 p-0 shadow-lg dark:border-gray-800">
                            <div className="w-full min-[301px]:w-[330px] p-4">
                                <div className="mb-3">
                                    <p className="font-semibold">추가 필터</p>
                                    <p className="mt-0.5 text-xs fadedtext">캐릭터와 콘텐츠 표시 조건을 설정합니다.</p>
                                </div>
                                <div className="flex w-full flex-col gap-2">
                                    <div className="flex items-center justify-between gap-4 rounded-lg bg-gray-100/70 px-3 py-2.5 dark:bg-white/[0.05]">
                                    <p className="cursor-pointer text-sm" onClick={() => {
                                        localStorage.setItem('isRemainHomework', String(!isRemainHomework));
                                        setRemainHomework(!isRemainHomework);
                                    }}>주간 숙제를 완료한 캐릭터 숨기기</p>
                                    <Switch
                                        size="sm"
                                        isSelected={isRemainHomework}
                                        onValueChange={(isSelected) => {
                                            localStorage.setItem('isRemainHomework', String(isSelected));
                                            setRemainHomework(isSelected);
                                        }}/>
                                    </div>
                                    <div className="flex items-center justify-between gap-4 rounded-lg bg-gray-100/70 px-3 py-2.5 dark:bg-white/[0.05]">
                                    <p className="cursor-pointer text-sm" onClick={() => {
                                        localStorage.setItem('isShowGoldCharacter', String(!isShowGoldCharacter));
                                        setShowGoldCharacter(!isShowGoldCharacter);
                                    }}>골드 지정 캐릭터만 표시하기</p>
                                    <Switch
                                        size="sm"
                                        isSelected={isShowGoldCharacter}
                                        onValueChange={(isSelected) => {
                                            localStorage.setItem('isShowGoldCharacter', String(isSelected));
                                            setShowGoldCharacter(isSelected);
                                        }}/>
                                    </div>
                                    <div className="flex items-center justify-between gap-4 rounded-lg bg-gray-100/70 px-3 py-2.5 dark:bg-white/[0.05]">
                                    <p className="cursor-pointer text-sm" onClick={() => {
                                        localStorage.setItem('isHideCompleteContent', String(!isHideCompleteContent));
                                        setHideCompleteContent(!isHideCompleteContent);
                                    }}>숙제 완료한 콘텐츠 숨기기</p>
                                    <Switch
                                        size="sm"
                                        isSelected={isHideCompleteContent}
                                        onValueChange={(isSelected) => {
                                            localStorage.setItem('isHideCompleteContent', String(isSelected));
                                            setHideCompleteContent(isSelected);
                                        }}/>
                                    </div>
                                </div>
                                <Divider className="mt-3"/>
                                <p className="mt-3 text-xs fadedtext">해당 설정값은 브라우저에 저장됩니다.</p>
                            </div>
                        </PopoverContent>
                    </Popover>
                    <Button
                        radius="lg"
                        color="danger"
                        variant="bordered"
                        startContent={<span className="text-base leading-none">×</span>}
                        className="h-10 min-w-0 flex-1 whitespace-nowrap border-danger-200/90 bg-white px-3 text-xs font-semibold text-danger-600 shadow-sm transition-colors hover:border-danger-300 hover:bg-danger-50/70 dark:border-white/10 dark:bg-[#171717] dark:text-danger-300 dark:hover:border-white/20 dark:hover:bg-white/[0.06] dark:hover:text-danger-200"
                        onPress={() => {
                            setFilterAccount(new Set([]));
                            setFilterContent(new Set([]));
                            localStorage.removeItem('isRemainHomework');
                            setRemainHomework(false);
                            localStorage.removeItem('isShowGoldCharacter');
                            setShowGoldCharacter(false);
                            addToast({
                                title: "필터 해제",
                                description: `모든 필터를 제거하였습니다.`,
                                color: "success"
                            });
                        }}>
                        필터 해제
                    </Button>
                </div>
            </div>
        </div>
    )
}

// 남은 숙제 현황 컴포넌트
type RemainChecklistComponentProps = {
    checklist: CheckCharacter[],
    bosses: Boss[]
}
export function RemainChecklistComponent({ checklist, bosses }: RemainChecklistComponentProps) {
    const [datas, setDatas] = useState<ChecklistData[]>([]);
    const [results, setResults] = useState<ChecklistData[]>([]);
    const [selectedKey, setSelectedKey] = useState('');
    const isMobile = useMobileQuery();

    useEffect(() => {
        loadDatas(checklist, bosses, setDatas);
    }, [checklist]);

    useEffect(() => {
        const sortedBosses = bosses.sort((a, b) => {
            const bDiff = bosses.find(boss => boss.name === b.name);
            const aDiff = bosses.find(boss => boss.name === a.name);
            let bValue = 0, aValue = 0;
            if (bDiff){
                bValue = Math.min(...bDiff.difficulty.map(diff => diff.level));
            }
            if (aDiff) {
                aValue = Math.min(...aDiff.difficulty.map(diff => diff.level));
            }
            return bValue - aValue;
        });
        if (sortedBosses.length > 0) {
            setSelectedKey(bosses[0].id);
        }
    }, [bosses]);

    useEffect(() => {
        const findBoss = bosses.find(boss => boss.id === selectedKey);
        if (findBoss) {
            const contentName = findBoss.name;
            const list = datas.filter((item) => item.contentName === contentName);
            setResults(list);
        }
    }, [selectedKey, datas]);

    return (
        <section className="mt-4 w-full overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950/60">
            <div className="flex flex-col gap-1 border-b border-gray-200/80 px-4 py-4 sm:px-5 dark:border-gray-800">
                <div className="flex items-center justify-between gap-3">
                    <h2 className="text-lg font-semibold">남은 숙제 현황</h2>
                    <Chip size="sm" variant="flat" color={results.length > 0 ? "warning" : "success"}>{results.length}개</Chip>
                </div>
                <p className="text-sm fadedtext">콘텐츠를 선택해 아직 완료하지 않은 캐릭터를 확인하세요.</p>
            </div>
            <div className="grid w-full gap-3 p-4 sm:h-[420px] sm:grid-cols-[minmax(170px,0.8fr)_minmax(0,3fr)] sm:p-5">
                <div className="h-[200px] overflow-y-auto rounded-xl border border-gray-200/80 bg-gray-50/60 p-2 scrollbar-hide dark:border-gray-800 dark:bg-gray-900/50 sm:h-full">
                    <Tabs 
                        fullWidth 
                        isVertical={true}
                        selectedKey={selectedKey} 
                        color="primary"
                        variant="light"
                        classNames={{
                            tabList: "gap-1",
                            cursor: "rounded-lg",
                            tab: "justify-start px-3",
                        }}
                        onSelectionChange={(key) => setSelectedKey(String(key))}>
                        {bosses.sort((a, b) => {
                            const bDiff = bosses.find(boss => boss.name === b.name);
                            const aDiff = bosses.find(boss => boss.name === a.name);
                            let bValue = 0, aValue = 0;
                            if (bDiff){
                                bValue = Math.min(...bDiff.difficulty.map(diff => diff.level));
                            }
                            if (aDiff) {
                                aValue = Math.min(...aDiff.difficulty.map(diff => diff.level));
                            }
                            return bValue - aValue;
                        }).map((boss) => (
                            <Tab key={boss.id} title={boss.name}/>
                        ))}
                    </Tabs>
                </div>
                <div className="w-full max-h-[420px] overflow-y-auto scrollbar-hide">
                    <div className="mb-3 rounded-xl border border-gray-200/80 bg-gray-50/60 p-3 dark:border-gray-800 dark:bg-gray-900/50">
                            <div className="grid w-full grid-cols-[1fr_1px_1fr_1px_1fr] gap-2">
                                <div className="w-full flex items-center">
                                    <p className="grow fadedtext text-[10pt]">남은 숙제</p>
                                    <p className="text-md font-bold">{results.length}</p>
                                </div>
                                <Divider orientation="vertical"/>
                                <div className="w-full flex items-center">
                                    <p className="grow fadedtext text-[10pt]">골드 획득</p>
                                    <p className="text-md font-bold">{results.filter(data => data.isGold && data.isGoldCharacter).length}</p>
                                </div>
                                <Divider orientation="vertical"/>
                                <div className="w-full flex items-center">
                                    <p className="grow fadedtext text-[10pt]">골드X 숙제</p>
                                    <p className="text-md font-bold">{results.filter(data => !data.isGold || !data.isGoldCharacter).length}</p>
                                </div>
                            </div>
                    </div>
                    <div className="grid w-full auto-rows-max content-start gap-2 sm:grid-cols-2">
                        {results.map((data, index) => (
                            <Card
                                key={index}
                                radius="lg"
                                shadow="none"
                                className="relative h-max overflow-hidden border border-gray-200/80 bg-white/90 shadow-[0_2px_8px_rgba(15,23,42,0.04)] dark:border-white/10 dark:bg-white/[0.025] dark:shadow-none">
                                <span className={clsx(
                                    "absolute inset-y-0 left-0 w-1",
                                    data.isGold && data.isGoldCharacter ? "bg-warning" : "bg-default-300 dark:bg-default-600"
                                )}/>
                                <CardBody className="p-3 pl-4">
                                    <div className="flex w-full items-center gap-3">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-default-100 ring-1 ring-black/5 dark:bg-white/[0.06] dark:ring-white/10">
                                            <JobAvatar size="md" job={data.job}/>
                                        </div>
                                        <div className="min-w-0 grow">
                                            <p className="truncate text-sm font-semibold text-foreground">{data.nickname}</p>
                                            <p className="mt-0.5 truncate text-[11px] text-default-400">{data.job} · Lv.{data.level.toLocaleString()}</p>
                                        </div>
                                        <div className="flex shrink-0 flex-col items-end gap-1.5">
                                            {data.isGold && data.isGoldCharacter ? (
                                                <span className="inline-flex items-center gap-1 rounded-full bg-warning-50 px-2 py-0.5 text-[10px] font-semibold text-warning-700 dark:bg-warning-500/10 dark:text-warning-400">
                                                    <img src="/icons/gold.png" alt="" className="h-3 w-3"/>
                                                    골드 획득 가능
                                                </span>
                                            ) : null}
                                            <div className="flex items-center gap-1">
                                                <span className="mr-0.5 text-[10px] text-default-400">남은 관문</span>
                                                {data.difficultys.map((diff, idx) => (
                                                    <Tooltip
                                                        key={idx}
                                                        showArrow
                                                        content={diff.difficulty}>
                                                        <div className={clsx(
                                                            "flex h-5 w-5 items-center justify-center rounded-full border text-[10px] font-semibold shadow-sm",
                                                            getBackground50ByStage(diff.difficulty, false),
                                                            getBorderByStage(diff.difficulty, false)
                                                        )}>
                                                            {diff.stage}
                                                        </div>
                                                    </Tooltip>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </CardBody>
                            </Card>
                        ))}
                    </div>
                    {results.length === 0 ? (
                        <div className="flex min-h-[240px] w-full items-center justify-center rounded-xl border border-dashed border-gray-300 fadedtext dark:border-gray-700">
                            <div className="flex flex-col items-center gap-2 px-4 text-center sm:flex-row">
                                <CheckIcon size={24}/>
                                <p className="text-sm sm:text-base">남은 숙제가 없거나 데이터가 존재하지 않습니다.</p>
                            </div>
                        </div>
                    ) : <></>}
                </div>
            </div>
        </section>
    )
}
