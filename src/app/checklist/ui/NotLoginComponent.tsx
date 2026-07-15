import { useState } from "react"
import { CheckCharacter } from "../../store/checklistSlice"
import { SetStateFn, useMobileQuery } from "@/utiils/utils"
import { 
    Accordion, AccordionItem, 
    addToast, 
    Button,
    Card, CardBody, CardFooter, CardHeader, 
    Checkbox, 
    Chip, 
    Divider, 
    Dropdown, DropdownItem, DropdownMenu, DropdownTrigger, 
    Link, 
    NumberInput, 
    Popover, PopoverContent, PopoverTrigger, 
    Progress, 
    Tab, 
    Table, TableBody, TableCell, TableColumn, TableHeader, TableRow, 
    Tabs, 
    Tooltip 
} from "@heroui/react"
import { Boss } from "../../api/checklist/boss/route";
import { DayValue, getAllBoundGold, getAllContentGold, getAllContentOtherGold, getAllCountChecklist, getAllCubeCount, getAllGoldCharacter, getAllGolds, getBackground50ByStage, getBackgroundByStage, getBorderByStage, getCompleteBoundGoldCharacter, getCompleteChecklist, getCompleteGoldCharacter, getCompleteSharedGoldCharacter, getCountCube, getCubeList, getDayName, getDiffByContent, getHaveBoundGolds, getHaveGolds, getHaveSharedGolds, getIndexByNickname, getMaxRestValue, getSimpleBossName, getTypeDayValue, isCheckHomework, printDifficulty } from "../lib/checklistFeat";
import { CubeDetailComponent, CubeStatueComponent, RemainChecklistComponent, SelectServer } from "./ChecklistForm";
import clsx from "clsx";
import { Cube } from "../../api/checklist/cube/route";
import { SettingIcon } from "../../icons/SettingIcon";
import DeleteIcon from "../../icons/DeleteIcon";
import { handleControlCube, handleSetOtherGold, handleWeekContent, handleWeekStage, useOnClickCheckGold, useOnClickDayCheck } from "../lib/testFeat";
import AddIcon from "../../icons/AddIcon";
import React from "react";
import JobAvatar from "@/Icons/JobAvatar";

// 숙제 현황
type ChecklistStatueProps = {
    checklist: CheckCharacter[],
    bosses: Boss[]
}
function ChecklistStatue({ checklist, bosses }: ChecklistStatueProps) {
    const life = 7561, max = 12000;
    return (
        <>
            <Card
                fullWidth
                radius="lg"
                shadow="none"
                className="overflow-hidden border border-gray-200/80 bg-white/95 shadow-[0_10px_35px_rgba(15,23,42,0.08)] md960:fixed md960:left-1/2 md960:top-[80px] md960:z-50 md960:w-[calc(100vw-40px)] md960:-translate-x-1/2 lg1280:w-[1240px] dark:border-white/10 dark:bg-[#171717]/95 dark:shadow-none">
                <CardHeader className="border-b border-primary/15 bg-primary/[0.07] p-2 dark:bg-primary/[0.09]">
                    <div className="w-full flex gap-2 items-center px-2">
                        <p className="grow text-sm sm:text-md text-blue-600 dark:text-blue-400">현재 테스트 계정을 이용하고 계십니다.</p>
                        <Button
                            size="sm"
                            variant="flat"
                            color="primary"
                            radius="sm"
                            as={Link}
                            href="/login">
                            로그인 하기
                        </Button>
                    </div>
                </CardHeader>
                <CardBody className="p-3">
                    <div className="grid w-full grid-cols-1 gap-2 md960:grid-cols-[1.2fr_1fr_1fr]">
                        <div className="flex w-full flex-col gap-2 rounded-xl border border-warning/20 bg-warning/[0.045] p-3 dark:bg-warning/[0.06]">
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
                                        <span className="ml-1 text-md">주간 골드량 : {getHaveGolds(bosses, checklist).toLocaleString()} / {getAllGolds(bosses, checklist).toLocaleString()}</span>
                                    </div>
                                )}
                                showValueLabel={true}
                                radius="sm"
                                value={getHaveGolds(bosses, checklist)}
                                maxValue={getAllGolds(bosses, checklist)}
                                className="min-w-0 grow"/>
                            <div className="flex w-full items-center gap-2">
                                <p className="min-w-0 grow text-[10pt] leading-5 fadedtext">
                                    이번 주에 <img src="/icons/gold.png" alt="goldicon" className="mx-0.5 inline-block h-[14px] w-[14px]"/>
                                    <strong className="text-black dark:text-white">{(getAllGolds(bosses, checklist) - getHaveGolds(bosses, checklist)).toLocaleString()}</strong>를 더 획득할 수 있습니다.
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
                                    <div className="w-[calc(100vw-40px)] p-4 min-[501px]:max-w-[520px]">
                                        <div className="mb-3 flex items-start justify-between gap-3 border-b border-gray-200/80 pb-3 dark:border-white/10">
                                            <div>
                                                <p className="font-semibold">주간 골드 상세</p>
                                                <p className="mt-1 text-xs fadedtext">캐릭터별 획득 골드와 부수입을 확인하세요.</p>
                                            </div>
                                            <Chip size="sm" radius="sm" color="warning" variant="flat">{checklist.length}명</Chip>
                                        </div>
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
                                                        {checklist.map((character, index) => (
                                                            <TableRow key={index}>
                                                                <TableCell>{character.nickname}</TableCell>
                                                                <TableCell>{getCompleteSharedGoldCharacter(bosses, character).toLocaleString()}</TableCell>
                                                                <TableCell>{getCompleteBoundGoldCharacter(bosses, character).toLocaleString()}</TableCell>
                                                                <TableCell>{character.otherGold.toLocaleString()}</TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </div>
                                        </div>
                                        <div className="mt-3 grid w-full grid-cols-1 items-center gap-x-3 gap-y-2 rounded-xl bg-gray-50/80 p-3 min-[501px]:grid-cols-3 dark:bg-white/[0.04]">
                                            <div className="w-full flex items-center gap-1">
                                                <p className="grow text-[9pt] fadedtext">총 콘텐츠</p>
                                                <img 
                                                    src="/icons/gold.png" 
                                                    alt="goldicon"
                                                    className="w-[14px] h-[14px]"/>
                                                <p className="test-sm">{getAllContentGold(bosses, checklist).toLocaleString()}</p>
                                            </div>
                                            <div className="w-full flex items-center gap-1">
                                                <p className="grow text-[9pt] fadedtext">총 귀속 골드</p>
                                                <img
                                                    src="/icons/gold.png" 
                                                    alt="goldicon"
                                                    className="w-[14px] h-[14px]"/>
                                                <p className="test-sm">{getAllBoundGold(bosses, checklist).toLocaleString()}</p>
                                            </div>
                                            <div className="w-full flex items-center gap-1">
                                                <p className="grow text-[9pt] fadedtext">총 부수입</p>
                                                <img
                                                    src="/icons/gold.png" 
                                                    alt="goldicon"
                                                    className="w-[14px] h-[14px]"/>
                                                <p className="test-sm">{getAllContentOtherGold(bosses, checklist).toLocaleString()}</p>
                                            </div>
                                            <div className="w-full flex items-center gap-1.5">
                                                <p className="grow text-[9pt] fadedtext">콘텐츠 비율</p>
                                                <div className="w-[9px] h-[9px] rounded-full bg-green-500"/>
                                                <p className="test-sm">{getHaveSharedGolds(bosses, checklist) !== 0 ? Math.round(getAllContentGold(bosses, checklist) / getHaveGolds(bosses, checklist) * 1000) / 10 : 0}%</p>
                                            </div>
                                            <div className="w-full flex items-center gap-1.5">
                                                <p className="grow text-[9pt] fadedtext">귀속 골드 비율</p>
                                                <div className="w-[9px] h-[9px] rounded-full bg-yellow-500"/>
                                                <p className="test-sm">{getHaveBoundGolds(bosses, checklist) !== 0 ? Math.round(getAllBoundGold(bosses, checklist) / getHaveGolds(bosses, checklist) * 1000) / 10 : 0}%</p>
                                            </div>
                                            <div className="w-full flex items-center gap-1.5">
                                                <p className="grow text-[9pt] fadedtext">부수입 비율</p>
                                                <div className="w-[9px] h-[9px] rounded-full bg-purple-600"/>
                                                <p className="test-sm">{getHaveGolds(bosses, checklist) !== 0 ? Math.round(getAllContentOtherGold(bosses, checklist) / getHaveGolds(bosses, checklist) * 1000) / 10 : 0}%</p>
                                            </div>
                                        </div>
                                        {bosses.length && checklist.length ? (
                                            <div className="relative mt-3 h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-white/10">
                                                <div className="absolute top-0 left-0 h-full bg-purple-600" style={{ width: '100%' }}></div>
                                                <div className="absolute top-0 left-0 h-full bg-yellow-500" style={{ width: `${getHaveGolds(bosses, checklist) !== 0 ? Math.round(getAllContentGold(bosses, checklist) / getHaveGolds(bosses, checklist) * 1000) / 10 + Math.round(getAllBoundGold(bosses, checklist) / getHaveGolds(bosses, checklist) * 1000) / 10 : 0}%` }}></div>
                                                <div className="absolute top-0 left-0 h-full bg-green-500" style={{ width: `${getHaveGolds(bosses, checklist) !== 0 ? Math.round(getAllContentGold(bosses, checklist) / getHaveGolds(bosses, checklist) * 1000) / 10 : 0}%` }}></div>
                                            </div>
                                        ) : <></>}
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
                                label={`📃 숙제 진행 상황 : ${getCompleteChecklist(checklist)} / ${getAllCountChecklist(checklist)}`}
                                showValueLabel={true}
                                radius="sm"
                                value={getCompleteChecklist(checklist)}
                                maxValue={getAllCountChecklist(checklist)}
                                className="w-full"/>
                        </div>
                        <div className="flex w-full flex-shrink-0 flex-col items-stretch gap-2 rounded-xl border border-success/20 bg-success/[0.04] p-3 md960:flex-row md960:items-start dark:bg-success/[0.06]">
                            <Tooltip showArrow content="생명의 기운이 인게임보다 약간의 오차가 발생할 수 있습니다.">
                                <Progress 
                                    aria-label="all-gold"
                                    size="sm"
                                    color="success"
                                    label={`🍃 생명의 기운 : ${Math.floor(life).toLocaleString()} / ${max.toLocaleString()}`}
                                    radius="sm"
                                    value={life}
                                    maxValue={max}
                                    className="grow"/>
                            </Tooltip>
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
                                        className="mb-0">축복</Checkbox>
                                </Tooltip>
                                <div className="grow flex justify-end">
                                    <Tooltip showArrow content="테스트 계정에서는 이용하실 수 없는 기능입니다.">
                                        <div>
                                            <Button
                                                size="sm"
                                                color="primary"
                                                variant="flat"
                                                radius="sm"
                                                isDisabled
                                                className="w-[100px] font-medium md960:w-auto">
                                                수정
                                            </Button>
                                        </div>
                                    </Tooltip>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardBody>
                <CardFooter className="border-t border-gray-200/80 bg-gray-50/70 p-2.5 dark:border-white/10 dark:bg-white/[0.025]">
                    <div className="grid w-full grid-cols-3 gap-2">
                        <Tooltip showArrow content="테스트 계정에서는 이용하실 수 없는 기능입니다.">
                            <div>
                                <Button
                                    fullWidth
                                    radius="sm"
                                    color="default"
                                    size="sm"
                                    isDisabled
                                    variant="flat"
                                    className="h-9 border border-gray-200/80 bg-white px-2 text-xs font-medium sm:text-sm dark:border-white/10 dark:bg-white/[0.04]">순서 변경</Button>
                            </div>
                        </Tooltip>
                        <Tooltip showArrow content="테스트 계정에서는 이용하실 수 없는 기능입니다.">
                            <div>
                                <Button
                                    fullWidth
                                    radius="sm"
                                    color="default"
                                    variant="flat"
                                    isDisabled
                                    size="sm"
                                    className="h-9 border border-gray-200/80 bg-white px-2 text-xs font-medium text-success sm:text-sm dark:border-white/10 dark:bg-white/[0.04]">캐릭터 추가</Button>
                            </div>
                        </Tooltip>
                        <Tooltip showArrow content="테스트 계정에서는 이용하실 수 없는 기능입니다.">
                            <div>
                                <Button
                                    fullWidth
                                    radius="sm"
                                    color="default"
                                    variant="flat"
                                    isDisabled
                                    size="sm"
                                    className="h-9 border border-gray-200/80 bg-white px-2 text-xs font-medium text-primary sm:text-sm dark:border-white/10 dark:bg-white/[0.04]">캐릭터 갱신하기</Button>
                            </div>
                        </Tooltip>
                    </div>
                </CardFooter>
            </Card>
        </>
    )
}

// 설정 버튼 요소
type SettingButtonProps = {
    size: number,
    checklist: CheckCharacter[],
    setChecklist: SetStateFn<CheckCharacter[]>,
    characterIndex: number,
}
function SettingButton({ size, checklist, setChecklist, characterIndex}: SettingButtonProps) {
    const onClickCheckGold = useOnClickCheckGold(characterIndex, checklist, setChecklist);
    return (
        <Dropdown placement="bottom-end">
            <DropdownTrigger>
                <Button isIconOnly variant="light" size="sm" radius="full" aria-label="캐릭터 설정"><SettingIcon size={size} className="cursor-pointer text-gray-500" /></Button>
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
                    onPress={onClickCheckGold}>{checklist[characterIndex].isGold ? "골드 지정 해제" : "골드 지정"}</DropdownItem>
                <DropdownItem 
                    key="reset-cube"
                    startContent={
                        <img
                            src="/icons/cube.png" 
                            alt="cubeicon"
                            className="w-[18px] h-[18px]"/>
                    }
                    onPress={async () => {
                        addToast({
                            title: "이용 불가",
                            description: `테스트 계정에서는 이용할 수 없습니다.`,
                            color: "warning"
                        });
                    }}>큐브 초기화</DropdownItem>
                <DropdownItem 
                    key="delete"
                    color="danger"
                    className="text-danger"
                    startContent={
                        <DeleteIcon/>
                    }
                    onPress={async () => {
                        addToast({
                            title: "이용 불가",
                            description: `테스트 계정에서는 이용할 수 없습니다.`,
                            color: "warning"
                        });
                    }}>캐릭터 삭제</DropdownItem>
            </DropdownMenu>
        </Dropdown>
    );
}

// 휴식 전용 체크 버튼 요소 (쿠르잔 전선, 가디언 토벌, 에포나 의뢰)
type RestCheckButtonProps = {
    checklist: CheckCharacter[],
    character: CheckCharacter,
    setChecklist: SetStateFn<CheckCharacter[]>,
    index: number,
    type: string
}
function RestCheckButton({ checklist, character, setChecklist, index, type }: RestCheckButtonProps) {
    const dayValue: DayValue = getTypeDayValue(character, type);
    const onClickDayCheck = useOnClickDayCheck(checklist, setChecklist, index, type, character.day);
    return (
        <div 
            className={clsx(
                "mt-2 box-border w-full max-w-full rounded-lg border border-transparent px-2 py-1.5",
                type === '에포나' ? dayValue.value === 3 ? 'border-warning-200 bg-warning-50/70 dark:border-warning-900 dark:bg-warning-950/20' : 'hover:bg-gray-100/70 dark:hover:bg-gray-900/70' : dayValue.value === 1 ? 'border-warning-200 bg-warning-50/70 dark:border-warning-900 dark:bg-warning-950/20' : 'hover:bg-gray-100/70 dark:hover:bg-gray-900/70'
            )}>
            <Checkbox
                aria-label={`${character.nickname}'s ${type}`}
                size="sm"
                color="warning"
                lineThrough
                radius="full"
                isSelected={type === '에포나' ? dayValue.value === 3 : dayValue.value === 1}
                className="p-0"
                onChange={onClickDayCheck}>
                {getDayName(type, character.level)} ({dayValue.value}/{type === '에포나' ? 3 : 1})
            </Checkbox>
            <div className={clsx(
                "w-full h-[18px] relative mt-1",
                type === '에포나' ? 'hidden' : 'block'
            )}>
                <span className="w-full text-center text-[#444444] dark:text-[#aaaaaa] text-sm absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">휴식 게이지 {dayValue.restValue}</span>
                <RestComponent restValue={dayValue.restValue} type={type}/>
            </div>
        </div>
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
                        index === 0 ? 'rounded-l-full' : '',
                        countBlocks >= (2*index + 1) ? 'bg-green-300 dark:bg-green-700' : "bg-[#111111]/15 dark:bg-[#111111]/30"
                    )}/>
                    <div className={clsx(
                        "grow border-1 border-l-0 border-gray-300 dark:border-gray-700",
                        index === 4 ? 'rounded-r-full' : '',
                        countBlocks >= (2*index + 2) ? 'bg-green-300 dark:bg-green-700' : "bg-[#111111]/15 dark:bg-[#111111]/30"
                    )}/>
                </div>
            ))}
        </div>
    )
}

// 큐브 관리 컴포넌트
type CubeCountComponentProps = {
    character: CheckCharacter,
    checklist: CheckCharacter[],
    setChecklist: SetStateFn<CheckCharacter[]>,
    index: number,
    cubes: Cube[]
}
function CubeCountComponent({ character, checklist, setChecklist, index, cubes }: CubeCountComponentProps) {
    return (
        <Table removeWrapper>
            <TableHeader>
                <TableColumn>큐브명</TableColumn>
                <TableColumn>개수</TableColumn>
                <TableColumn className="w-[10px]">관리</TableColumn>
            </TableHeader>
            <TableBody>
                {getCubeList(character.level, cubes).map((cube, idx) => (
                    <TableRow key={idx}>
                        <TableCell>{cube.name}</TableCell>
                        <TableCell>{getCountCube(character.cubelist, cube.id).toLocaleString()}장</TableCell>
                        <TableCell>
                            <div className="flex gap-2">
                                <Button
                                    size="sm"
                                    variant="flat"
                                    color="danger"
                                    isDisabled={getCountCube(character.cubelist, cube.id) <= 0}
                                    className="w-8 h-8 min-w-0 min-h-0 p-0 text-sm"
                                    onPress={() => {
                                        handleControlCube(checklist, setChecklist, index, cube.id, false);
                                    }}>-</Button>
                                <Button
                                    size="sm"
                                    variant="flat"
                                    color="success"
                                    isDisabled={getCountCube(character.cubelist, cube.id) >= 9999}
                                    className="w-8 h-8 min-w-0 min-h-0 p-0 text-sm"
                                    onPress={() => {
                                        handleControlCube(checklist, setChecklist, index, cube.id, true);
                                    }}>+</Button>
                            </div>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}

// 숙제 컴포넌트
type ChecklistComponentProps = {
    checklist: CheckCharacter[],
    setChecklist: SetStateFn<CheckCharacter[]>,
    server: string,
    bosses: Boss[],
    cubes: Cube[]
}

function CharacterMemoPreview({ memo }: { memo?: string }) {
    const value = memo?.trim() ?? '';
    return (
        <div className="w-full border-t border-gray-200/70 pt-2 dark:border-white/10">
            <div className="flex min-w-0 items-start">
                <span aria-hidden="true" className="mr-2 shrink-0 text-sm">📝</span>
                <p className={clsx(
                "max-h-[4.5rem] overflow-hidden whitespace-pre-wrap break-words leading-6 line-clamp-3",
                value ? "text-sm text-foreground" : "text-xs fadedtext"
            )}>
                {value || "메모를 입력해주세요."}
                </p>
            </div>
        </div>
    );
}

function ChecklistComponent({ checklist, setChecklist, server, bosses, cubes }: ChecklistComponentProps) {
    const [inputOtherGold, setInputOtherGold] = useState<{ [nickname: string]: number }>({});
    return (
        <div className="w-full min-[541px]:w-[max-content] mt-5 grid grid-cols-1 min-[1137px]:grid-cols-2 min-[1713px]:grid-cols-3 min-[2289px]:grid-cols-4 min-[2865px]:grid-cols-5 min-[3441px]:grid-cols-6 gap-4 mx-auto">
            {checklist
                .filter((character) => character.server === server || server === '전체')
                .map((character, index) => (
                    <Card key={index} fullWidth radius="lg" shadow="none" className="w-full min-[561px]:w-[560px] overflow-hidden border border-gray-200/80 bg-white shadow-sm dark:border-white/10 dark:bg-[#171717]">
                        <CardHeader className="flex-col items-stretch p-4 pb-3">
                            <div className="w-full flex flex-col md960:flex-row items-center gap-2">
                                <div className="w-full grow flex gap-4 items-center">
                                    <div className="flex flex-col gap-2 items-center">
                                        <JobAvatar size="md" job={character.job}/>
                                        <Chip size="sm" variant="flat" radius="sm" color="warning" className={clsx(
                                            "text-[8pt] p-0.5",
                                            character.isGold ? 'hidden sm:flex' : 'hidden'
                                        )}>
                                            골드 지정
                                        </Chip>
                                    </div>
                                    <div className="flex grow flex-row md960:flex-col items-center">
                                        <div className="grow-1 w-full">
                                            <span className="fadedtext text-sm">@{character.server} · {character.job} · Lv.{character.level}</span>
                                            <div className="flex gap-2 items-center">
                                                <span className="text-xl">{character.nickname}</span>
                                                <div className="hidden md960:block">
                                                    <SettingButton 
                                                        size={16} 
                                                        checklist={checklist} 
                                                        setChecklist={setChecklist}
                                                        characterIndex={getIndexByNickname(checklist, character.nickname)}/>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="block md960:hidden">
                                            <SettingButton 
                                                size={24} 
                                                checklist={checklist} 
                                                setChecklist={setChecklist}
                                                characterIndex={getIndexByNickname(checklist, character.nickname)}/>
                                        </div>
                                    </div>
                                </div>
                                <div className="w-full md960:w-[330px]">
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
                                                        <span className="ml-1 text-md">{(getCompleteGoldCharacter(bosses, character)+character.otherGold).toLocaleString()} / {(getAllGoldCharacter(bosses, character)+character.otherGold).toLocaleString()}</span>
                                                    </div>
                                                )}
                                                showValueLabel={getAllGoldCharacter(bosses, character)+character.otherGold > 0}
                                                radius="md"
                                                value={getCompleteGoldCharacter(bosses, character)+character.otherGold}
                                                maxValue={getAllGoldCharacter(bosses, character)+character.otherGold}
                                                className="w-full cursor-pointer"/>
                                        </PopoverTrigger>
                                        <PopoverContent className="border border-gray-200/80 bg-white/95 p-0 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-[#171717]/95">
                                            <div className="w-[250px] p-4">
                                                <div className="mb-3"><p className="font-semibold">골드 획득 상세</p><p className="mt-0.5 text-xs fadedtext">완료한 콘텐츠 기준 획득량입니다.</p></div>
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
                                                        <span className="ml-1 text-md">{character.otherGold.toLocaleString()}</span>
                                                    </div>
                                                </div>
                                                <div className="w-full h-2 bg-gray-200 rounded-full relative overflow-hidden mt-2">
                                                    <div className="absolute top-0 left-0 h-full bg-[#dddddd] dark:bg-[#444444]" style={{ width: '100%' }}></div>
                                                    <div className="absolute top-0 left-0 h-full bg-purple-600" style={{ width: `${getAllGoldCharacter(bosses, character)+character.otherGold !== 0 ? Math.round(getCompleteSharedGoldCharacter(bosses, character) / (getAllGoldCharacter(bosses, character)+character.otherGold) * 1000) / 10 + Math.round(getCompleteBoundGoldCharacter(bosses, character) / (getAllGoldCharacter(bosses, character)+character.otherGold) * 1000) / 10 + Math.round(character.otherGold / (getAllGoldCharacter(bosses, character)+character.otherGold) * 1000) / 10 : 0}%` }}></div>
                                                    <div className="absolute top-0 left-0 h-full bg-yellow-500" style={{ width: `${getAllGoldCharacter(bosses, character)+character.otherGold !== 0 ? Math.round(getCompleteSharedGoldCharacter(bosses, character) / (getAllGoldCharacter(bosses, character)+character.otherGold) * 1000) / 10 + Math.round(getCompleteBoundGoldCharacter(bosses, character) / (getAllGoldCharacter(bosses, character)+character.otherGold) * 1000) / 10 : 0}%` }}></div>
                                                    <div className="absolute top-0 left-0 h-full bg-green-500" style={{ width: `${getAllGoldCharacter(bosses, character)+character.otherGold !== 0 ? Math.round(getCompleteSharedGoldCharacter(bosses, character) / (getAllGoldCharacter(bosses, character)+character.otherGold) * 1000) / 10 : 0}%` }}></div>
                                                </div>
                                            </div>
                                        </PopoverContent>
                                    </Popover>
                                </div>
                            </div>
                            <CharacterMemoPreview memo={character.memo}/>
                        </CardHeader>
                        <Divider/>
                        <CardBody className="p-4 pt-3">
                            <div className="flex w-full flex-col gap-3 md960:flex-row">
                                <div className="min-w-0 grow">
                                    <div className="mb-2 flex items-center justify-between gap-2 border-b border-success-200/70 pb-2 dark:border-success-900/50"><div><p className="text-sm font-semibold text-success-700 dark:text-success-400">일일 콘텐츠</p><p className="text-[11px] fadedtext">매일 초기화되는 숙제</p></div><Chip color="success" size="sm" variant="flat" radius="md">3개</Chip></div>
                                    <RestCheckButton checklist={checklist} setChecklist={setChecklist} character={character} index={index} type="전선"/>
                                    <RestCheckButton checklist={checklist} setChecklist={setChecklist} character={character} index={index} type="가디언"/>
                                    <RestCheckButton checklist={checklist} setChecklist={setChecklist} character={character} index={index} type="에포나"/>
                                    <Button 
                                        color="success"
                                        variant="flat"
                                        fullWidth 
                                        size="sm" 
                                        startContent={<AddIcon size={16}/>}
                                        radius="md"
                                        className="mt-3 font-medium"
                                        onPress={() => {
                                            addToast({
                                                title: "이용 불가",
                                                description: `테스트 계정에서는 이용할 수 없습니다.`,
                                                color: "warning"
                                            });
                                        }}>일일 콘텐츠 관리</Button>
                                </div>
                                <div className="min-w-0 grow-2 border-t border-gray-200/80 pt-3 dark:border-white/10 md960:border-l md960:border-t-0 md960:pl-4 md960:pt-0">
                                    <div className="mb-1 border-b border-secondary-200/70 pb-2 dark:border-secondary-700/70"><p className="text-sm font-semibold text-secondary-700 dark:text-secondary-700">주간 콘텐츠</p><p className="text-[11px] text-gray-500 dark:text-gray-400">주간 초기화되는 숙제</p></div>
                                    <div className="px-1.5 sm:px-2">
                                        {character.checklist.map((item, idx) => (
                                            <div key={idx} className={clsx(
                                                "mt-2 w-full rounded-lg border",
                                                isCheckHomework(item) ? 'border-primary-200 bg-primary-50/70 dark:border-primary-700/60 dark:bg-primary-500/10' : 'border-transparent hover:bg-gray-100/70 dark:hover:bg-white/[0.04]'
                                            )}>
                                                <Checkbox
                                                    aria-label={`checklist-${item.name}-${idx}`}
                                                    size="sm"
                                                    radius="full"
                                                    isSelected={isCheckHomework(item)}
                                                    classNames={{base: "w-full max-w-none", label: "w-full"}}
                                                    className="box-border w-full max-w-none px-2.5 py-1.5"
                                                    onChange={() => handleWeekContent(checklist, setChecklist, index, idx)}>
                                                    <div className="w-full flex items-center gap-1">
                                                        <div>
                                                            <div className="flex gap-1 items-center">
                                                                <p className={clsx(
                                                                    isCheckHomework(item) ? 'line-through fadedtext' : ''
                                                                )}>{getSimpleBossName(bosses, item.name)}</p>
                                                                {item.isGold ? <img 
                                                                    src="/icons/gold.png" 
                                                                    alt="goldicon"
                                                                    className="w-[14px] h-[14px]"/> : <></>}
                                                            </div>
                                                            <p className={clsx(
                                                                "fadedtext text-[9pt]",
                                                                isCheckHomework(item) ? 'line-through' : ''
                                                            )}>{printDifficulty(item.items)}</p>
                                                        </div>
                                                        <div className="grow"/>
                                                        <div className="flex items-center z-9">
                                                            {item.items.map((diff, ix) => (
                                                                <React.Fragment key={ix}>
                                                                    {ix > 0 && (
                                                                        <div className={clsx(
                                                                            'w-2 h-[2px]',
                                                                            getBackgroundByStage(diff.difficulty, diff.isDisable)
                                                                        )} />
                                                                    )}
                                                                    <Tooltip showArrow content={diff.difficulty}>
                                                                        <div className={clsx(
                                                                            'w-7 h-7 flex justify-center items-center p-0.5 rounded-md border-2 leading-none cursor-pointer',
                                                                            getBorderByStage(diff.difficulty, diff.isDisable),
                                                                            diff.isCheck ? getBackground50ByStage(diff.difficulty, diff.isDisable) : ''
                                                                        )} onClick={async (e) => {
                                                                            e.preventDefault();
                                                                            e.stopPropagation();
                                                                            handleWeekStage(checklist, setChecklist, index, idx, diff.stage);
                                                                        }}>
                                                                            {diff.stage}
                                                                        </div>
                                                                    </Tooltip>
                                                                </React.Fragment>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </Checkbox>
                                            </div>
                                        ))}
                                    </div>
                                    <Button 
                                        color="secondary"
                                        variant="flat"
                                        fullWidth 
                                        size="sm" 
                                        startContent={<AddIcon size={16}/>}
                                        radius="md"
                                        className="mt-3 font-medium"
                                        onPress={() => {
                                            addToast({
                                                title: "이용 불가",
                                                description: `테스트 계정에서는 이용할 수 없습니다.`,
                                                color: "warning"
                                            });
                                        }}>주간 콘텐츠 관리</Button>
                                </div>
                            </div>
                        </CardBody>
                        <Divider/>
                        <CardFooter className="pt-0 pb-0">
                            <div className="w-full">
                                <div className="mt-3 mb-2 flex gap-2 items-end">
                                    <NumberInput
                                        fullWidth
                                        label={`부수입 : ${character.otherGold} 골드`}
                                        labelPlacement="outside"
                                        placeholder="0 ~ 999999999"
                                        maxValue={999999999}
                                        value={inputOtherGold[character.nickname] ?? 0}
                                        size="sm"
                                        onValueChange={(value: number) => {
                                            setInputOtherGold(prev => ({...prev, [character.nickname]: value}));
                                        }}/>
                                    <Tooltip showArrow content="부수입 빼기">
                                        <Button
                                            variant="flat"
                                            color="danger"
                                            size="sm"
                                            className="w-8 h-8 min-w-8 min-h-0 p-0 text-sm"
                                            onPress={async () => {
                                                handleSetOtherGold(checklist, setChecklist, index, inputOtherGold[character.nickname] ?? 0, 'minus');
                                            }}>-</Button>
                                    </Tooltip>
                                    <Tooltip showArrow content="부수입 더하기">
                                        <Button
                                            variant="flat"
                                            color="success"
                                            size="sm"
                                            className="w-8 h-8 min-w-8 min-h-0 p-0 text-sm"
                                            onPress={async () => {
                                                handleSetOtherGold(checklist, setChecklist, index, inputOtherGold[character.nickname] ?? 0, 'add');
                                            }}>+</Button>
                                    </Tooltip>
                                </div>
                                <div className="mb-2 flex min-h-7 items-center gap-2 px-1 text-sm" aria-label="낙원력">
                                    <span aria-hidden="true" className="shrink-0 text-sm">⚔️</span>
                                    <span className="shrink-0 font-medium">낙원력</span>
                                    <span className={(character.paradisePower ?? 0) > 0 ? "font-semibold text-foreground" : "fadedtext"}>
                                        {(character.paradisePower ?? 0) > 0 ? (character.paradisePower ?? 0).toLocaleString() : '미설정'}
                                    </span>
                                </div>
                                <Divider/>
                                <Accordion>
                                    <AccordionItem key="0" title={<span className="flex gap-2 items-center cursor-pointer">
                                        <img 
                                            src="/icons/cube.png" 
                                            alt="cubeicon"
                                            className="w-[18px] h-[18px]"/>
                                        <span>큐브 - 총합 {getAllCubeCount(character)}장</span>
                                    </span>}>
                                    <div>
                                        <Tabs fullWidth aria-label="cube-tabs">
                                            <Tab key="setting" title="개수">
                                                <CubeCountComponent checklist={checklist} character={character} cubes={cubes} setChecklist={setChecklist} index={index}/>
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
                ))
            }
        </div>
    )
}

// 비로그인 컴포넌트 (테스트 계정)
type NotLoginedComponentProps = {
    initialChecklist: CheckCharacter[],
    initialBosses: Boss[],
    initialCubes: Cube[]
}
export default function NotLoginedComponent({ initialChecklist, initialBosses, initialCubes }: NotLoginedComponentProps) {
    const isMobile = useMobileQuery();
    const [checklist, setChecklist] = useState<CheckCharacter[]>(initialChecklist);
    const [server, setServer] = useState('전체');
    const [isShowList, setShowList] = useState(false);
    const [isShowCubeDetail, setShowCubeDetail] = useState(false);
    return (
        <div className="min-h-[calc(100vh-65px)] p-5 w-full relative">
            <div className="w-full max-w-[1280px] mx-auto">
                <ChecklistStatue checklist={checklist} bosses={initialBosses}/>
            </div>
            <div className="md960:mt-[220px]">
                <div className="w-full max-w-[1280px] mx-auto">
                    <section className="mt-5 overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm dark:border-white/10 dark:bg-[#171717]">
                        <div className="flex flex-col gap-1 border-b border-gray-200/80 px-4 py-4 sm:px-5 dark:border-white/10">
                            <h2 className="text-lg font-semibold">숙제 조회 설정</h2>
                            <p className="text-sm fadedtext">테스트 데이터의 서버와 큐브 현황을 확인하세요.</p>
                        </div>
                        <div className="p-4 sm:p-5">
                            <SelectServer 
                                checklist={checklist} 
                                server={server}
                                setServer={setServer}/>
                        </div>
                        <div className="flex flex-col gap-3 border-t border-gray-200/80 bg-gray-50/50 px-4 py-3 dark:border-white/10 dark:bg-white/[0.025] sm:flex-row sm:items-center sm:justify-between sm:px-5">
                            <div>
                                <p className="text-sm font-semibold">정보 및 현황</p>
                                <p className="text-xs fadedtext">테스트 계정에서 제공되는 현황을 확인합니다.</p>
                            </div>
                                <Button
                                size="sm"
                                radius="md"
                                color="primary"
                                variant={isShowCubeDetail ? 'flat' : 'bordered'}
                                className="w-full font-medium sm:w-auto"
                                onPress={() => {
                                    setShowCubeDetail(!isShowCubeDetail);
                                }}>
                                큐브 현황 {isShowCubeDetail ? '닫기' : "보기"}
                            </Button>
                        </div>
                    </section>
                    <div className={clsx(
                        isShowList ? 'block' : 'hidden'
                    )}>
                        <RemainChecklistComponent checklist={checklist} bosses={initialBosses}/>
                    </div>
                    <div className={clsx(
                        isShowCubeDetail ? 'block' : 'hidden'
                    )}>
                        <CubeDetailComponent checklist={checklist} cubes={initialCubes}/>
                    </div>
                </div>
                <ChecklistComponent
                    bosses={initialBosses}
                    checklist={checklist}
                    setChecklist={setChecklist}
                    cubes={initialCubes}
                    server={server}/>
            </div>
        </div>
    )
}
