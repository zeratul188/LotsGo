import { useState } from "react"
import { CheckCharacter } from "../store/checklistSlice"
import { SetStateFn, useMobileQuery } from "@/utiils/utils"
import { Accordion, AccordionItem, addToast, Avatar, Button, ButtonGroup, Card, CardBody, CardFooter, CardHeader, Checkbox, Chip, Divider, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger, Link, NumberInput, Popover, PopoverContent, PopoverTrigger, Progress, Tab, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow, Tabs, Tooltip } from "@heroui/react"
import Image from "next/image";
import { Boss } from "../api/checklist/boss/route";
import { DayValue, getAllBoundGold, getAllContentGold, getAllContentOtherGold, getAllCountChecklist, getAllCubeCount, getAllGoldCharacter, getAllGolds, getBossByContent, getCompleteBoundGoldCharacter, getCompleteChecklist, getCompleteGoldCharacter, getCompleteSharedGoldCharacter, getCountCube, getCubeList, getDayName, getDiffByContent, getHaveBoundGolds, getHaveGolds, getHaveSharedGolds, getIndexByNickname, getMaxRestValue, getTypeDayValue } from "./checklistFeat";
import { CubeDetailComponent, CubeStatueComponent, RemainChecklistComponent, SelectServer } from "./ChecklistForm";
import clsx from "clsx";
import { Cube } from "../api/checklist/cube/route";
import { getImgByJob } from "../character/expeditionFeat";
import { SettingIcon } from "../icons/SettingIcon";
import DeleteIcon from "../icons/DeleteIcon";
import { handleControlCube, handleSetOtherGold, handleWeekContent, useOnClickCheckGold, useOnClickDayCheck } from "./testFet";
import AddIcon from "../icons/AddIcon";

// 숙제 현황
type ChecklistStatueProps = {
    checklist: CheckCharacter[],
    bosses: Boss[]
}
function ChecklistStatue({ checklist, bosses }: ChecklistStatueProps) {
    const isMobile = useMobileQuery();
    const life = 7561, max = 12000;
    return (
        <>
            <Card
                fullWidth
                radius="sm"
                className="md960:w-[calc(100vw-40px)] lg1280:w-[1240px] md960:fixed md960:top-[80px] md960:left-1/2 md960:-translate-x-1/2 md960:z-50">
                <CardHeader className="p-2 bg-blue-200 dark:bg-blue-950">
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
                <Divider/>
                <CardBody>
                    <div className="w-full grid grid-cols-1 md960:grid-cols-[4fr_1px_3fr_1px_4fr] gap-2">
                        <div className="w-full flex flex-col sm:flex-row items-center gap-2">
                            <Progress 
                                aria-label="all-gold"
                                size="md"
                                color="warning"
                                label={(
                                    <div className="flex items-center">
                                        <Image 
                                            src="/icons/gold.png" 
                                            width={19} 
                                            height={19} 
                                            alt="goldicon"
                                            className="w-[19px] h-[19px]"/>
                                        <span className="ml-1 text-md">주간 골드량 : {getHaveGolds(bosses, checklist).toLocaleString()} / {getAllGolds(bosses, checklist).toLocaleString()}</span>
                                    </div>
                                )}
                                showValueLabel={true}
                                radius="sm"
                                value={getHaveGolds(bosses, checklist)}
                                maxValue={getAllGolds(bosses, checklist)}
                                className="grow"/>
                            <Popover showArrow disableAnimation>
                                <PopoverTrigger>
                                    <Button
                                        size="sm"
                                        variant="flat"
                                        color="warning"
                                        radius="sm"
                                        className="h-[30px] sm:h-full w-full sm:w-[max-content]">
                                        자세히
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="backdrop-blur-lg bg-white/70 dark:bg-[#141414]/70">
                                    <div className="w-[calc(100vw-60px)] min-[501px]:max-w-[500px] pl-1 pr-1 pt-3 pb-2">
                                        <div className="w-full overflow-x-auto scrollbar-hide">
                                            <div className="w-[400px] min-[501px]:w-full max-h-[400px] overflow-y-auto">
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
                                        <Divider className="mt-1 mb-2"/>
                                        <div className="w-full grid grid-cols-1 min-[501px]:grid-cols-3 gap-4 p-1 items-center">
                                            <div className="w-full flex items-center gap-1">
                                                <p className="grow text-[9pt] fadedtext">총 콘텐츠</p>
                                                <Image 
                                                    src="/icons/gold.png" 
                                                    width={14} 
                                                    height={14} 
                                                    alt="goldicon"
                                                    className="w-[14px] h-[14px]"/>
                                                <p className="test-sm">{getAllContentGold(bosses, checklist).toLocaleString()}</p>
                                            </div>
                                            <div className="w-full flex items-center gap-1">
                                                <p className="grow text-[9pt] fadedtext">총 귀속 골드</p>
                                                <Image 
                                                    src="/icons/gold.png" 
                                                    width={14} 
                                                    height={14} 
                                                    alt="goldicon"
                                                    className="w-[14px] h-[14px]"/>
                                                <p className="test-sm">{getAllBoundGold(bosses, checklist).toLocaleString()}</p>
                                            </div>
                                            <div className="w-full flex items-center gap-1">
                                                <p className="grow text-[9pt] fadedtext">총 부수입</p>
                                                <Image 
                                                    src="/icons/gold.png" 
                                                    width={14} 
                                                    height={14} 
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
                                            <div className="w-full h-2 bg-gray-200 rounded-full relative overflow-hidden mt-2">
                                                <div className="absolute top-0 left-0 h-full bg-purple-600" style={{ width: '100%' }}></div>
                                                <div className="absolute top-0 left-0 h-full bg-yellow-500" style={{ width: `${getHaveGolds(bosses, checklist) !== 0 ? Math.round(getAllContentGold(bosses, checklist) / getHaveGolds(bosses, checklist) * 1000) / 10 + Math.round(getAllBoundGold(bosses, checklist) / getHaveGolds(bosses, checklist) * 1000) / 10 : 0}%` }}></div>
                                                <div className="absolute top-0 left-0 h-full bg-green-500" style={{ width: `${getHaveGolds(bosses, checklist) !== 0 ? Math.round(getAllContentGold(bosses, checklist) / getHaveGolds(bosses, checklist) * 1000) / 10 : 0}%` }}></div>
                                            </div>
                                        ) : <></>}
                                    </div>
                                </PopoverContent>
                            </Popover>
                        </div>
                        <div><Divider orientation={isMobile ? 'horizontal' : 'vertical'}/></div>
                        <div className="w-full flex items-center">
                            <Progress 
                                aria-label="all-gold"
                                size="md"
                                color="secondary"
                                label={`📃 숙제 진행 상황 : ${getCompleteChecklist(checklist)} / ${getAllCountChecklist(checklist)}`}
                                showValueLabel={true}
                                radius="sm"
                                value={getCompleteChecklist(checklist)}
                                maxValue={getAllCountChecklist(checklist)}
                                className="w-full"/>
                        </div>
                        <div><Divider orientation={isMobile ? 'horizontal' : 'vertical'}/></div>
                        <div className="w-full flex flex-col md960:flex-row gap-2 items-center flex-shrink-0">
                            <Tooltip showArrow content="생명의 기운이 인게임보다 약간의 오차가 발생할 수 있습니다.">
                                <Progress 
                                    aria-label="all-gold"
                                    size="md"
                                    color="success"
                                    label={`🍃 생명의 기운 : ${Math.floor(life).toLocaleString()} / ${max.toLocaleString()}`}
                                    radius="sm"
                                    value={life}
                                    maxValue={max}
                                    className="grow"/>
                            </Tooltip>
                            <p className="block md960:hidden fadedtext text-[9pt] w-full text-left">생명의 기운이 인게임보다 약간의 오차가 발생할 수 있습니다.</p>
                            <div className="w-full md960:w-[max-content] flex shrink-0 min-w-fit flex-row md960:flex-col gap-2 md960:gap-0 items-center">
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
                                                radius="sm"
                                                isDisabled
                                                className="w-[100px] md960:w-[max-content]">
                                                수정
                                            </Button>
                                        </div>
                                    </Tooltip>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardBody>
                <Divider/>
                <CardFooter className="p-0">
                    <div className="w-full grid grid-cols-3">
                        <Tooltip showArrow content="테스트 계정에서는 이용하실 수 없는 기능입니다.">
                            <div>
                                <Button
                                    fullWidth
                                    radius="none"
                                    color="primary"
                                    size="sm"
                                    isDisabled
                                    variant="flat">순서 변경</Button>
                            </div>
                        </Tooltip>
                        <Tooltip showArrow content="테스트 계정에서는 이용하실 수 없는 기능입니다.">
                            <div>
                                <Button
                                    fullWidth
                                    radius="none"
                                    color="success"
                                    variant="flat"
                                    isDisabled
                                    size="sm">캐릭터 추가</Button>
                            </div>
                        </Tooltip>
                        <Tooltip showArrow content="테스트 계정에서는 이용하실 수 없는 기능입니다.">
                            <div>
                                <Button
                                    fullWidth
                                    radius="none"
                                    color="primary"
                                    variant="flat"
                                    isDisabled
                                    size="sm">캐릭터 갱신하기</Button>
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
        <Dropdown>
            <DropdownTrigger>
                <Button isIconOnly variant="light"><SettingIcon size={size} className="text-gray-500 hover:text-gray-800 cursor-pointer" /></Button>
            </DropdownTrigger>
            <DropdownMenu>
                <DropdownItem 
                    key="gold"
                    startContent={
                        <Image 
                            src="/icons/gold.png" 
                            width={16} 
                            height={16} 
                            alt="goldicon"
                            className="w-[16px] h-[16px]"/>
                    }
                    onPress={onClickCheckGold}>{checklist[characterIndex].isGold ? "골드 지정 해제" : "골드 지정"}</DropdownItem>
                <DropdownItem 
                    key="reset-cube"
                    startContent={
                        <Image 
                            src="/icons/cube.png" 
                            width={18} 
                            height={18} 
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
                "max-w-full w-full mt-2 box-border p-1.5 pt-0.5",
                type === '에포나' ? dayValue.value === 3 ? 'outline-2 outline-yellow-400 dark:outline-yellow-700 rounded-md bg-yellow-400/20 dark:bg-yellow-700/20' : '' : dayValue.value === 1 ? 'outline-2 outline-yellow-400 dark:outline-yellow-700 rounded-md bg-yellow-400/20 dark:bg-yellow-700/20' : ''
            )}>
            <Checkbox
                aria-label={`${character.nickname}'s ${type}`}
                size="sm"
                color="warning"
                lineThrough
                radius="full"
                isSelected={type === '에포나' ? dayValue.value === 3 : dayValue.value === 1}
                className="p-0 pl-2"
                onChange={onClickDayCheck}>
                {getDayName(type)} ({dayValue.value}/{type === '에포나' ? 3 : 1})
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
function ChecklistComponent({ checklist, setChecklist, server, bosses, cubes }: ChecklistComponentProps) {
    const [inputOtherGold, setInputOtherGold] = useState(0);
    return (
        <div className="w-full min-[541px]:w-[max-content] mt-5 grid grid-cols-1 min-[1137px]:grid-cols-2 min-[1713px]:grid-cols-3 min-[2289px]:grid-cols-4 min-[2865px]:grid-cols-5 min-[3441px]:grid-cols-6 gap-4 mx-auto">
            {checklist
                .filter((character) => character.server === server || server === '전체')
                .map((character, index) => (
                    <Card key={index} fullWidth radius="sm" className="w-full min-[561px]:w-[560px]">
                        <CardHeader>
                            <div className="w-full flex flex-col md960:flex-row items-center gap-2">
                                <div className="w-full grow flex gap-4 items-center">
                                    <div className="flex flex-col gap-2 items-center">
                                        <Avatar isBordered size="md" color={character.isGold ? 'warning' : 'default'} src={getImgByJob(character.job)}/>
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
                                    <Tooltip showArrow content={
                                        <div className="w-[200px] p-1">
                                            <div className="w-full flex gap-1 items-center">
                                                <div className="w-[9px] h-[9px] rounded-full bg-green-500"/>
                                                <p className="grow">콘텐츠</p>
                                                <div className="flex items-center">
                                                    <Image 
                                                        src="/icons/gold.png" 
                                                        width={14} 
                                                        height={14} 
                                                        alt="goldicon"
                                                        className="w-[16px] h-[16px]"/>
                                                    <span className="ml-1 text-md">{getCompleteSharedGoldCharacter(bosses, character).toLocaleString()}</span>
                                                </div>
                                            </div>
                                            <div className="w-full flex gap-1 items-center mt-1">
                                                <div className="w-[9px] h-[9px] rounded-full bg-yellow-500"/>
                                                <p className="grow">귀속 골드</p>
                                                <div className="flex items-center">
                                                    <Image 
                                                        src="/icons/gold.png" 
                                                        width={14} 
                                                        height={14} 
                                                        alt="goldicon"
                                                        className="w-[16px] h-[16px]"/>
                                                    <span className="ml-1 text-md">{getCompleteBoundGoldCharacter(bosses, character).toLocaleString()}</span>
                                                </div>
                                            </div>
                                            <div className="w-full flex gap-1 items-center mt-1">
                                                <div className="w-[9px] h-[9px] rounded-full bg-purple-600"/>
                                                <p className="grow">부수입</p>
                                                <div className="flex items-center">
                                                    <Image 
                                                        src="/icons/gold.png" 
                                                        width={14} 
                                                        height={14} 
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
                                    }>
                                        <Progress 
                                            aria-label="all-gold"
                                            size="sm"
                                            color="warning"
                                            label={(
                                                <div className="flex items-center">
                                                    <Image 
                                                        src="/icons/gold.png" 
                                                        width={14} 
                                                        height={14} 
                                                        alt="goldicon"
                                                        className="w-[16px] h-[16px]"/>
                                                    <span className="ml-1 text-md">{(getCompleteGoldCharacter(bosses, character)+character.otherGold).toLocaleString()} / {(getAllGoldCharacter(bosses, character)+character.otherGold).toLocaleString()}</span>
                                                </div>
                                            )}
                                            showValueLabel={getAllGoldCharacter(bosses, character)+character.otherGold > 0}
                                            radius="sm"
                                            value={getCompleteGoldCharacter(bosses, character)+character.otherGold}
                                            maxValue={getAllGoldCharacter(bosses, character)+character.otherGold}
                                            className="w-full"/>
                                    </Tooltip>
                                    <Popover 
                                        showArrow
                                        disableAnimation
                                        onClose={() => {
                                            setInputOtherGold(0);
                                        }}>
                                        <PopoverTrigger>
                                            <Button
                                                fullWidth
                                                size="sm"
                                                variant="flat"
                                                radius="sm"
                                                color="warning"
                                                className="mt-2">
                                                부수입 설정 및 골드량
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="backdrop-blur-lg bg-white/70 dark:bg-[#141414]/70">
                                            <div className="w-full sm300:w-[300px] pt-2">
                                                <span className="text-sm fadedtext">콘텐츠 골드 획득량</span>
                                                <Progress 
                                                    aria-label="all-gold"
                                                    size="sm"
                                                    color="primary"
                                                    label={(
                                                        <div className="flex items-center">
                                                            <Image 
                                                                src="/icons/gold.png" 
                                                                width={14} 
                                                                height={14} 
                                                                alt="goldicon"
                                                                className="w-[16px] h-[16px]"/>
                                                            <span className="ml-1 text-md">{getCompleteSharedGoldCharacter(bosses, character).toLocaleString()} / {(getAllGoldCharacter(bosses, character)+character.otherGold).toLocaleString()}</span>
                                                        </div>
                                                    )}
                                                    showValueLabel={getAllGoldCharacter(bosses, character)+character.otherGold > 0}
                                                    radius="sm"
                                                    value={getCompleteSharedGoldCharacter(bosses, character)}
                                                    maxValue={getAllGoldCharacter(bosses, character)+character.otherGold}
                                                    className="w-full mb-2"/>
                                                <span className="text-sm fadedtext">귀속 골드 획득량</span>
                                                <Progress 
                                                    aria-label="all-gold"
                                                    size="sm"
                                                    color="warning"
                                                    label={(
                                                        <div className="flex items-center">
                                                            <Image 
                                                                src="/icons/gold.png" 
                                                                width={14} 
                                                                height={14} 
                                                                alt="goldicon"
                                                                className="w-[16px] h-[16px]"/>
                                                            <span className="ml-1 text-md">{getCompleteBoundGoldCharacter(bosses, character).toLocaleString()} / {(getAllGoldCharacter(bosses, character)+character.otherGold).toLocaleString()}</span>
                                                        </div>
                                                    )}
                                                    showValueLabel={getAllGoldCharacter(bosses, character)+character.otherGold > 0}
                                                    radius="sm"
                                                    value={getCompleteBoundGoldCharacter(bosses, character)}
                                                    maxValue={getAllGoldCharacter(bosses, character)+character.otherGold}
                                                    className="w-full mb-2"/>
                                                <span className="text-sm fadedtext">부수입</span>
                                                <Progress 
                                                    aria-label="all-gold"
                                                    size="sm"
                                                    color="secondary"
                                                    label={(
                                                        <div className="flex items-center">
                                                            <Image 
                                                                src="/icons/gold.png" 
                                                                width={14} 
                                                                height={14} 
                                                                alt="goldicon"
                                                                className="w-[16px] h-[16px]"/>
                                                            <span className="ml-1 text-md">{character.otherGold.toLocaleString()} / {(getAllGoldCharacter(bosses, character)+character.otherGold).toLocaleString()}</span>
                                                        </div>
                                                    )}
                                                    showValueLabel={getAllGoldCharacter(bosses, character)+character.otherGold > 0}
                                                    radius="sm"
                                                    value={character.otherGold}
                                                    maxValue={getAllGoldCharacter(bosses, character)+character.otherGold}
                                                    className="w-full mb-4"/>
                                                <Divider className="mb-8"/>
                                                <NumberInput
                                                    fullWidth
                                                    label={`부수입 : ${character.otherGold} 골드`}
                                                    labelPlacement="outside"
                                                    placeholder="0 ~ 999999999"
                                                    maxValue={999999999}
                                                    value={inputOtherGold}
                                                    size="sm"
                                                    onValueChange={setInputOtherGold}
                                                    className="mb-4"/>
                                                <div className="flex gap-2 mt-2 mb-2">
                                                    <Button
                                                        variant="flat"
                                                        color="primary"
                                                        size="sm"
                                                        className="grow"
                                                        onPress={async () => {
                                                            handleSetOtherGold(checklist, setChecklist, index, inputOtherGold, 'set');
                                                        }}>적용</Button>
                                                    <Button
                                                        variant="flat"
                                                        color="danger"
                                                        size="sm"
                                                        className="grow"
                                                        onPress={async () => {
                                                            handleSetOtherGold(checklist, setChecklist, index, inputOtherGold, 'minus');
                                                        }}>빼기</Button>
                                                    <Button
                                                        variant="flat"
                                                        color="success"
                                                        size="sm"
                                                        className="grow"
                                                        onPress={async () => {
                                                            handleSetOtherGold(checklist, setChecklist, index, inputOtherGold, 'add');
                                                        }}>더하기</Button>
                                                </div>
                                            </div>
                                        </PopoverContent>
                                    </Popover>
                                </div>
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
                                    <RestCheckButton checklist={checklist} setChecklist={setChecklist} character={character} index={index} type="전선"/>
                                    <RestCheckButton checklist={checklist} setChecklist={setChecklist} character={character} index={index} type="가디언"/>
                                    <RestCheckButton checklist={checklist} setChecklist={setChecklist} character={character} index={index} type="에포나"/>
                                    <Button 
                                        color="primary" 
                                        variant="light" 
                                        fullWidth 
                                        size="sm" 
                                        startContent={<AddIcon size={16}/>}
                                        className="mt-4"
                                        onPress={() => {
                                            addToast({
                                                title: "이용 불가",
                                                description: `테스트 계정에서는 이용할 수 없습니다.`,
                                                color: "warning"
                                            });
                                        }}>추가</Button>
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
                                        {character.checklist.map((item, idx) => (
                                            <Tooltip 
                                                key={idx}
                                                showArrow
                                                placement="left"
                                                delay={1000}
                                                content={
                                                    <div className="p-1 min-w-[160px]">
                                                        <p className={clsx(
                                                            "overflow-hidden text-ellipsis whitespace-nowrap font-bold",
                                                            getBossByContent(bosses, item.name) ? '' : 'fadedtext'
                                                        )}>{getBossByContent(bosses, item.name) ? `${getBossByContent(bosses, item.name)?.name}` : '삭제된 콘텐츠'}</p>
                                                        <Divider className="mt-2 mb-2"/>
                                                        <div className="w-full grid grid-cols-[max-content_1fr] gap-1">
                                                            <p className="fadedtext">난이도</p>
                                                            <p className="text-right">{getDiffByContent(bosses, item.name, item.difficulty) ? getDiffByContent(bosses, item.name, item.difficulty)?.difficulty : '-'}</p>
                                                            <p className="fadedtext">레벨</p>
                                                            <p className="text-right">{getDiffByContent(bosses, item.name, item.difficulty) ? getDiffByContent(bosses, item.name, item.difficulty)?.level : 0}</p>
                                                            <p className="fadedtext">골드</p>
                                                            <div className="flex gap-1 items-center justify-end">
                                                                <Image 
                                                                    src="/icons/gold.png" 
                                                                    width={16} 
                                                                    height={16} 
                                                                    alt="goldicon"
                                                                    className="w-[16px] h-[16px]"/>
                                                                <p className={clsx(
                                                                    item.isGold ? '' : 'fadedtext line-through'
                                                                )}>{getDiffByContent(bosses, item.name, item.difficulty) ? getDiffByContent(bosses, item.name, item.difficulty)?.gold.toLocaleString() : 0}</p>
                                                            </div>
                                                            <p className="fadedtext">귀속 골드</p>
                                                            <div className="flex gap-1 items-center justify-end">
                                                                <Image 
                                                                    src="/icons/gold.png" 
                                                                    width={16} 
                                                                    height={16} 
                                                                    alt="goldicon"
                                                                    className="w-[16px] h-[16px]"/>
                                                                <p className={clsx(
                                                                    item.isGold ? '' : 'fadedtext line-through'
                                                                )}>{getDiffByContent(bosses, item.name, item.difficulty) ? getDiffByContent(bosses, item.name, item.difficulty)?.boundGold ? getDiffByContent(bosses, item.name, item.difficulty)?.boundGold.toLocaleString() : 0 : 0}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                }>
                                                <div>
                                                    <Checkbox
                                                        lineThrough
                                                        aria-label={`checklist-${item.name}-${idx}`}
                                                        size="sm"
                                                        radius="full"
                                                        isDisabled={item.isDisable}
                                                        isSelected={item.isCheck}
                                                        className={clsx(
                                                            "max-w-full w-full mt-3 box-border p-1.5",
                                                            item.isCheck ? 'outline-2 outline-blue-400 dark:outline-blue-800 rounded-md bg-blue-400/20 dark:bg-blue-800/20' : ''
                                                        )}
                                                        onChange={() => {
                                                            handleWeekContent(checklist, setChecklist, index, idx);
                                                        }}>
                                                        <span className="flex items-center gap-1">
                                                            <span>{item.name} {item.difficulty}</span>
                                                            {item.isGold ? <Image 
                                                                src="/icons/gold.png" 
                                                                width={14} 
                                                                height={14} 
                                                                alt="goldicon"
                                                                className="w-[14px] h-[14px]"/> : <></>}
                                                        </span>
                                                    </Checkbox>
                                                </div>
                                            </Tooltip>
                                        ))}
                                    </div>
                                    <Button 
                                        color="primary" 
                                        variant="light" 
                                        fullWidth 
                                        size="sm" 
                                        startContent={<AddIcon size={16}/>}
                                        className="mt-4"
                                        onPress={() => {
                                            addToast({
                                                title: "이용 불가",
                                                description: `테스트 계정에서는 이용할 수 없습니다.`,
                                                color: "warning"
                                            });
                                        }}>추가</Button>
                                </div>
                            </div>
                        </CardBody>
                        <Divider/>
                        <CardFooter className="pt-0 pb-0">
                            <Accordion>
                                <AccordionItem key="0" title={<span className="flex gap-2 items-center cursor-pointer">
                                    <Image 
                                        src="/icons/cube.png" 
                                        width={18} 
                                        height={18} 
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
            <div className="md960:mt-[150px]">
                <div className="w-full max-w-[1280px] mx-auto">
                    <div className="w-full flex flex-col sm:flex-row gap-3 sm:items-center">
                        <div className="grow">
                            <SelectServer 
                                checklist={checklist} 
                                server={server}
                                setServer={setServer}/>
                        </div>
                        <ButtonGroup fullWidth={isMobile}>
                            <Button
                                radius="sm"
                                color={isShowList ? 'default' : 'primary'}
                                onPress={() => {
                                    setShowList(!isShowList);
                                }}>
                                남은 숙제 현황 {isShowList ? '닫기' : "보기"}
                            </Button>
                            <Button
                                radius="sm"
                                color={isShowCubeDetail ? 'default' : 'primary'}
                                onPress={() => {
                                    setShowCubeDetail(!isShowCubeDetail);
                                }}>
                                큐브 현황 {isShowCubeDetail ? '닫기' : "보기"}
                            </Button>
                        </ButtonGroup>
                    </div>
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