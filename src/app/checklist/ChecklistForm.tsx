import React, { useEffect, useState } from "react";
import { Boss } from "../api/checklist/boss/route";
import { CheckCharacter, Checklist, ChecklistItem, OtherList } from "../store/checklistSlice";
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
    Avatar,
    Pagination
} from "@heroui/react";
import Image from "next/image";
import { 
    CubeStatue,
    DayValue, 
    filterChecklist, 
    getAccounts, 
    getAllBoundGold, 
    getAllContentGold, 
    getAllContentOtherGold, 
    getAllCountChecklist, 
    getAllCubeCount, 
    getAllGoldCharacter, 
    getAllGolds, 
    getBackground50ByStage, 
    getBackgroundByStage, 
    getBorderByStage, 
    getBossByContent, 
    getBossesByHaveContent, 
    getBossesById, 
    getCheckedResult, 
    getColumnsByCubeTiers, 
    getCompleteBoundGoldCharacter, 
    getCompleteChecklist, 
    getCompleteGoldCharacter, 
    getCompleteSharedGoldCharacter, 
    getCountCube, 
    getCubeCountByCharacter, 
    getCubeCountByChecklist, 
    getCubeList, 
    getCubeStatues, 
    getDayName, 
    getDiffByContent, 
    getDifficultyByStage, 
    getGemCountByCharacter, 
    getGemCountByChecklist, 
    getHaveBoundGolds, 
    getHaveGolds, 
    getHaveSharedGolds, 
    getIndexByNickname, 
    getMaxRestValue, 
    getServerList, 
    getSimpleBossName, 
    getTakeGold, 
    getTypeDayValue, 
    getWeekContents, 
    getWeekStages, 
    handleAddCharacter, 
    handleApplyPositions, 
    handleCalculateOtherGold, 
    handleCheckGold, 
    handleCheckGolds, 
    handleControlCube, 
    handleDayListCheck, 
    handleOnDragEnd, 
    handleRemoveCharacter, 
    handleRemoveDayList, 
    handleRemoveWeekList, 
    handleResetCube, 
    handleSelectAccount, 
    handleSelectCharacter, 
    handleWeekCheckStage, 
    handleWeekListCheck, 
    isBiweeklyContent, 
    isCheckBiweeklyContent, 
    isCheckHomework, 
    isHaveCharacter, 
    loadDatas, 
    SearchCharacter, 
    useChangeBlessing, 
    useClickAddAccount, 
    useClickLife, 
    useClickLoadCharacters, 
    useClickUpdatedCharacters, 
    useCloseModal, 
    useOnClickAddDayList, 
    useOnClickAddItem, 
    useOnClickAddWeekList, 
    useOnClickDayCheck, 
    useOnClickRemoveItem, 
    useOnClickSaveRestValue, 
    useOnClickWeekCheck 
} from "./checklistFeat";
import { SetStateFn, useMobileQuery } from "@/utiils/utils";
import { SettingIcon } from "../icons/SettingIcon";
import clsx from "clsx";
import { AppDispatch } from "../store/store";
import AddIcon from "../icons/AddIcon";
import DeleteIcon from "../icons/DeleteIcon";
import { Cube } from "../api/checklist/cube/route";
import { MAX_CHARACTER_COUNT } from "@/utiils/constants";
import {
  DragDropContext,
  Droppable,
  Draggable
} from '@hello-pangea/dnd';
import { getImgByJob } from "../character/expeditionFeat";
import { ChecklistData } from "../home/checklistFeat";
import CheckIcon from "@/Icons/CheckIcon";
import CharacterIcon from "@/Icons/CharacterIcon";

// state 관리
export type ModalData = {
    characterIndex: number,
    type: string
}
export function useChecklistForm() {
    const [isLoading, setLoading] = useState(true);
    const [bosses, setBosses] = useState<Boss[]>([]);
    const [server, setServer] = useState('전체');
    const {isOpen, onOpen, onOpenChange} = useDisclosure();
    const [modalData, setModalData] = useState<ModalData>({
        characterIndex: -1,
        type: 'null'
    });
    const [cubes, setCubes] = useState<Cube[]>([]);
    const [life, setLife] = useState(0);
    const [max, setMax] = useState(0);
    const [isBlessing, setBlessing] = useState(false);
    const [isShowCubeDetail, setShowCubeDetail] = useState(false);
    const [isShowList, setShowList] = useState(false);
    const [isLogined, setLogined] = useState(false);
    const [biweekly, setBiweekly] = useState(0);
    const [isHideDayContent, setHideDayContent] = useState(false);
    const [filterContent, setFilterContent] = useState<Selection>(new Set([]));
    const [isRemainHomework, setRemainHomework] = useState(false);
    const [isShowGoldCharacter, setShowGoldCharacter] = useState(false);
    const [accounts, setAccounts] = useState<string[]>(['본계정']);
    const [filterAccount, setFilterAccount] = useState<Selection>(new Set([]));

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
        filterAccount, setFilterAccount
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
            radius="sm"
            isDismissable={false}
            isOpen={isOpenModalPosition}
            onOpenChange={onOpenChangePosition}>
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader>캐릭터 순서 변경</ModalHeader>
                        <ModalBody>
                            <div className="h-[400px] sm600:h-[600px] overflow-y-auto pr-3">
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
                                                        className="p-2 mb-3 bg-gray-100 dark:bg-[#222222] rounded-md cursor-move border-gray-100 dark:border-[#222222] hover:border-blue-600 border-2"
                                                    >
                                                        <div className="flex flex-col gap-1">
                                                            <span className="fadedtext text-sm">@{char.server} · {char.job} · Lv.{char.level}</span>
                                                            <span className="text-md">{char.nickname}</span>
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
                        <ModalFooter>
                            <Button
                                fullWidth
                                color="primary"
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
    setAccounts: SetStateFn<string[]>
}
export function ChecklistStatue({ 
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
    setAccounts
 }: ChecklistStatueProps) {
    const isMobile = useMobileQuery();
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

    return (
        <>
            <Card 
                fullWidth 
                radius="sm"
                className="md960:w-[calc(100vw-40px)] lg1280:w-[1240px] md960:fixed md960:top-[80px] md960:left-1/2 md960:-translate-x-1/2 md960:z-50">
                <CardBody>
                    <div className="w-full grid grid-cols-1 md960:grid-cols-[4fr_1px_3fr_1px_3fr] gap-2">
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
                                                radius="sm"
                                                className="w-[100px] md960:w-[max-content]">
                                                수정
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="backdrop-blur-lg bg-white/70 dark:bg-[#141414]/70">
                                            <div className="w-[240px] p-2">
                                                <p className="mb-2">생명의 기운 조정</p>
                                                <NumberInput
                                                    fullWidth
                                                    radius="sm"
                                                    size="sm"
                                                    placeholder={`0 ~ ${newMax}`}
                                                    maxValue={newMax}
                                                    value={newLife}
                                                    onValueChange={setNewLife}/>
                                                <p className="mb-2 mt-2">생명의 기운 최대치</p>
                                                <NumberInput
                                                    fullWidth
                                                    radius="sm"
                                                    size="sm"
                                                    placeholder="0 ~ 99999"
                                                    maxValue={99999}
                                                    value={newMax}
                                                    onValueChange={setNewMax}/>
                                                <Button
                                                    fullWidth
                                                    radius="sm"
                                                    color="primary"
                                                    className="mt-3"
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
                <Divider/>
                <CardFooter className="p-0">
                    <div className="w-full grid grid-cols-3">
                        <Button
                            fullWidth
                            radius="none"
                            color="primary"
                            size="sm"
                            variant="flat"
                            onPress={() => onOpenChangePosition(true)}>순서 변경</Button>
                        <Button
                            fullWidth
                            radius="none"
                            color="success"
                            variant="flat"
                            size="sm"
                            onPress={onOpen}>캐릭터 추가</Button>
                        <Tooltip 
                            showArrow
                            placement="bottom"
                            content="캐릭터 정보만 수정되며, 체크리스트는 영향을 주지 않습니다.">
                            <Button
                                fullWidth
                                radius="none"
                                color="primary"
                                variant="flat"
                                size="sm"
                                isDisabled={isDisableUpdate}
                                isLoading={isLoading}
                                onPress={onClickUpdatedCharacters}>캐릭터 갱신하기</Button>
                        </Tooltip>
                    </div>
                </CardFooter>
            </Card>
            <PositionModal
                isOpenModalPosition={isOpenModalPosition}
                onOpenChangePosition={onOpenChangePosition}
                checklist={checklist}
                dispatch={dispatch}/>
            <Modal
                radius="sm"
                isDismissable={false}
                isOpen={isOpen}
                onOpenChange={onOpenChange}
                onClose={onCloseModal}>
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader>캐릭터 추가</ModalHeader>
                            <ModalBody>
                                <div className="w-full max-h-[600px] sm600:max-h-[800px] overflow-y-auto">
                                    <div className="flex gap-2 mb-4">
                                        <Input
                                            label="대표 캐릭터 이름"
                                            placeholder="2~12 글자"
                                            maxLength={12}
                                            size="sm"
                                            value={inputValue}
                                            onValueChange={setInputValue}
                                            className="grow"/>
                                        <Button
                                            size="lg"
                                            radius="sm"
                                            isLoading={isLoadingSearch}
                                            color="primary"
                                            onPress={onClickLoadCharacters}>조회</Button>
                                    </div>
                                    <div className="mb-4 max-h-[400px] overflow-y-auto overflow-x-hidden">
                                        {result.map((item, index) => (
                                            <div key={index} className="w-full min-h-[64px] mb-1">
                                                <Checkbox
                                                    aria-label={item.nickname}
                                                    isDisabled={((MAX_CHARACTER_COUNT <= checklist.length + getCheckedResult(result)) && !item.isCheck) || isHaveCharacter(checklist, item.nickname)}
                                                    classNames={{
                                                        base: cn(
                                                            "w-full max-w-full bg-content1",
                                                            "hover:bg-content2",
                                                            "cursor-pointer rounded-lg gap-2 border-2 border-transparent m-auto box-border",
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
                                        "gap-2 mb-4",
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
                                        "mb-4",
                                        result.length !== 0 ? 'block' : 'hidden'
                                    )}>
                                        <RadioGroup label="계정 선택" value={selected} onValueChange={setSelected} className="mb-8">
                                            {accounts.length > 0 ? accounts.map((account, index) => (
                                                <Radio key={index} value={account}>{account}</Radio>
                                            )) : <Radio value="본계정">본계정</Radio>}
                                        </RadioGroup>
                                        <Input
                                            label="추가할 계정 이름"
                                            radius="sm"
                                            labelPlacement="outside"
                                            placeholder="2~12글자"
                                            value={inputAccount}
                                            onValueChange={setInputAccount}/>
                                        <Button
                                            fullWidth
                                            size="sm"
                                            radius="sm"
                                            variant="flat"
                                            color="success"
                                            isDisabled={inputAccount === ''}
                                            className="mt-2"
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
                                        className={clsx(
                                            "mb-4",
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
    setServer: SetStateFn<string>
}
export function SelectServer({ checklist, server, setServer }: SelectServerProps) {
    return (
        <RadioGroup
            description="서버를 선택하면 해당 서버인 캐릭터만 조회됩니다." 
            label="서버 선택"
            orientation="horizontal"
            value={server}
            onValueChange={setServer}
            className="mt-6">
            <CustomRadio key={0} value="전체">전체</CustomRadio>
            {getServerList(checklist).map((server, index) => (
                <CustomRadio key={index+1} value={server}>{server}</CustomRadio>
            ))}
        </RadioGroup>
    )
}

// 커스텀 라디오 요소
function CustomRadio(props: RadioProps) {
    const { children, ...otherProps } = props;
    return (
        <Radio
            {...otherProps}
            classNames={{
                base: cn(
                    "inline-flex m-0 bg-content1 hover:bg-content2 items-center justify-between",
                    "flex-row-reverse max-w-[200px] cursor-pointer rounded-md gap-4 p-2 border-2 border-transparent",
                    "data-[selected=true]:border-primary",
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
    filterAccount: Selection
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
    filterAccount
}: ChecklistProps) {
    const [inputOtherGold, setInputOtherGold] = useState<{ [nickname: string]: number }>({});
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
                    <Card key={index} fullWidth radius="sm" className={clsx(
                        "w-full",
                        isHideDayContent ? isMobile ? "" : "min-[331px]:w-[330px]" : "min-[561px]:w-[560px]"
                    )}>
                        <CardHeader>
                            <div className={clsx(
                                "w-full flex items-center gap-2",
                                isHideDayContent ? "flex-col" : "flex-col md960:flex-row"
                            )}>
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
                                            <div className="flex gap-2">
                                                <Chip 
                                                    size="sm"
                                                    variant="flat"
                                                    radius="sm">
                                                    {character.account}
                                                </Chip>
                                                <Chip 
                                                    size="sm"
                                                    variant="flat"
                                                    radius="sm"
                                                    color="primary">
                                                    {character.server}
                                                </Chip>
                                            </div>
                                            <p className="fadedtext text-sm mt-1">{character.job} · Lv.{character.level}</p>
                                            <div className="flex gap-2 items-center">
                                                <span className={clsx(
                                                    isHideDayContent ? isMobile ? "text-xl" : "text-lg" : "text-xl"
                                                )}>{character.nickname}</span>
                                                <div className="hidden md960:block">
                                                    <SettingButton 
                                                        size={14} 
                                                        checklist={checklist} 
                                                        characterIndex={getIndexByNickname(checklist, character.nickname)}
                                                        dispatch={dispatch}
                                                        accounts={accounts}
                                                        setAccounts={setAccounts}/>
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
                                                setAccounts={setAccounts}/>
                                        </div>
                                    </div>
                                </div>
                                <div className={clsx(
                                    "w-full h-full md960:w-[330px] flex items-start",
                                    isHideDayContent ? 'px-0 sm:px-4' : ''
                                )}>
                                    <Popover showArrow disableAnimation radius="sm">
                                        <PopoverTrigger>
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
                                                className="w-full cursor-pointer"/>
                                        </PopoverTrigger>
                                        <PopoverContent className="backdrop-blur-lg bg-white/70 dark:bg-[#141414]/70">
                                            <div className="w-[230px] p-1">
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
                                        </PopoverContent>
                                    </Popover>
                                </div>
                            </div>
                        </CardHeader>
                        <Divider/>
                        <CardBody>
                            <div className="w-full flex flex-col md960:flex-row gap-2">
                                <div className={clsx(
                                    "grow",
                                    isHideDayContent ? 'hidden' : 'block'
                                )}>
                                    <Chip 
                                        color="success" 
                                        size="sm" 
                                        variant="flat" 
                                        radius="sm"
                                        className="min-w-full text-center">일일 콘텐츠</Chip>
                                    <RestCheckButton checklist={checklist} character={character} type="전선" dispatch={dispatch}/>
                                    <RestCheckButton checklist={checklist} character={character} type="가디언" dispatch={dispatch}/>
                                    <RestCheckButton checklist={checklist} character={character} type="에포나" dispatch={dispatch}/>
                                    <div className="w-full pl-2.5">
                                        {character.daylist.map((item, idx) => (
                                            <div key={idx}>
                                                <Checkbox
                                                    lineThrough
                                                    aria-label={`checklist-${item.name}-${idx}`}
                                                    size="sm"
                                                    color="secondary"
                                                    radius="full"
                                                    isSelected={item.isCheck}
                                                    className={clsx(
                                                        "max-w-full w-full mt-3 box-border p-1.5",
                                                        item.isCheck ? 'outline-2 outline-purple-400 dark:outline-purple-700 rounded-md bg-purple-400/20 dark:bg-purple-700/20' : ''
                                                    )}
                                                    onChange={async () => await handleDayListCheck(checklist, getIndexByNickname(checklist, character.nickname), idx, dispatch)}>
                                                    {item.name}</Checkbox>
                                            </div>
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
                                            setModalData({
                                                characterIndex: getIndexByNickname(checklist, character.nickname),
                                                type: 'day'
                                            });
                                            onOpen();
                                        }}>추가</Button>
                                </div>
                                <Divider className={clsx(
                                    isHideDayContent ? 'hidden' : "block md960:hidden"
                                )}/>
                                <Divider orientation="vertical" className={clsx(
                                    isHideDayContent ? 'hidden' : "hidden md960:block"
                                )}/>
                                <div className="grow-2">
                                    <Chip 
                                        color="secondary" 
                                        size="sm" 
                                        variant="flat" 
                                        radius="sm"
                                        className="min-w-full text-center">주간 콘텐츠</Chip>
                                    <div className="pl-2.5">
                                        {character.checklist.map((item, idx) => (
                                            <div key={idx}>
                                                <Checkbox
                                                    aria-label={`checklist-${item.name}-${idx}`}
                                                    size="sm"
                                                    radius="full"
                                                    isSelected={isCheckHomework(item)}
                                                    className={clsx(
                                                        "max-w-full w-full mt-3 box-border p-1.5 [&_span:nth-of-type(2)]:w-full",
                                                        isCheckHomework(item) ? 'outline-2 outline-blue-400 dark:outline-blue-800 rounded-md bg-blue-400/20 dark:bg-blue-800/20' : ''
                                                    )}
                                                    onChange={async () => await useOnClickWeekCheck(checklist, getIndexByNickname(checklist, character.nickname), idx, dispatch)}>
                                                    <div className="w-full flex items-center gap-1">
                                                        <span className={clsx(
                                                            isCheckHomework(item) ? 'line-through' : ''
                                                        )}>{getSimpleBossName(bosses, item.name)}</span>
                                                        {item.isGold ? <Image 
                                                            src="/icons/gold.png" 
                                                            width={14} 
                                                            height={14} 
                                                            alt="goldicon"
                                                            className="w-[14px] h-[14px]"/> : <></>}
                                                        <div className="grow"/>
                                                        <div className="flex items-center z-9">
                                                            {item.items.map((diff, ix) => (
                                                                <React.Fragment key={ix}>
                                                                    {ix > 0 && (
                                                                        <div className={clsx(
                                                                            'w-2 h-[2px]',
                                                                            getBackgroundByStage(diff.difficulty)
                                                                        )} />
                                                                    )}
                                                                    <Tooltip showArrow content={diff.difficulty}>
                                                                        <div className={clsx(
                                                                            'w-7 h-7 flex justify-center items-center p-0.5 rounded-md border-2 leading-none cursor-pointer',
                                                                            getBorderByStage(diff.difficulty),
                                                                            diff.isCheck ? getBackground50ByStage(diff.difficulty) : ''
                                                                        )} onClick={async (e) => {
                                                                            e.preventDefault();
                                                                            e.stopPropagation();
                                                                            await handleWeekCheckStage(checklist, getIndexByNickname(checklist, character.nickname), idx, dispatch, diff.stage)
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
                                        {character.weeklist.map((item, idx) => (
                                            <div key={idx}>
                                                <Checkbox
                                                    lineThrough
                                                    aria-label={`checklist-${item.name}-${idx}`}
                                                    size="sm"
                                                    color="secondary"
                                                    radius="full"
                                                    isSelected={item.isCheck}
                                                    className={clsx(
                                                        "max-w-full w-full mt-3 box-border p-1.5",
                                                        item.isCheck ? 'outline-2 outline-purple-400 dark:outline-purple-700 rounded-md bg-purple-400/20 dark:bg-purple-700/20' : ''
                                                    )}
                                                    onChange={async () => await handleWeekListCheck(checklist, getIndexByNickname(checklist, character.nickname), idx, dispatch)}>
                                                    {item.name}</Checkbox>
                                            </div>
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
                                            setModalData({
                                                characterIndex: getIndexByNickname(checklist, character.nickname),
                                                type: 'week'
                                            });
                                            onOpen();
                                        }}>추가</Button>
                                </div>
                            </div>
                        </CardBody>
                        <Divider/>
                        <CardFooter className="pt-0 pb-0">
                            <div className="w-full">
                                <div className="mt-3 mb-2 flex gap-2 items-end">
                                    <NumberInput
                                        fullWidth
                                        label="부수입 설정"
                                        labelPlacement="outside"
                                        placeholder="0 ~ 999999999"
                                        maxValue={999999999}
                                        size="sm"
                                        value={inputOtherGold[character.nickname] ?? 0}
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
                                                await handleCalculateOtherGold(checklist, getIndexByNickname(checklist, character.nickname), 'minus', inputOtherGold[character.nickname] ?? 0, dispatch);
                                            }}>-</Button>
                                    </Tooltip>
                                    <Tooltip showArrow content="부수입 더하기">
                                        <Button
                                            variant="flat"
                                            color="success"
                                            size="sm"
                                            className="w-8 h-8 min-w-8 min-h-0 p-0 text-sm"
                                            onPress={async () => {
                                                await handleCalculateOtherGold(checklist, getIndexByNickname(checklist, character.nickname), 'add', inputOtherGold[character.nickname] ?? 0, dispatch);
                                            }}>+</Button>
                                    </Tooltip>
                                </div>
                                <Divider/>
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
                                                <CubeCountComponent checklist={checklist} character={character} cubes={cubes} dispatch={dispatch}/>
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
            radius="sm"
            isDismissable={false}
            isOpen={isOpenAccount}
            onOpenChange={onOpenAccount}>
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader>계정 선택</ModalHeader>
                        <ModalBody>
                            <div className="max-h-[400px] sm600:max-h-[600px] overflow-y-auto">
                                <RadioGroup label="계정 선택" value={selected} onValueChange={setSelected} className="mb-8">
                                    {accounts.length > 0 ? accounts.map((account, index) => (
                                        <Radio key={index} value={account}>{account}</Radio>
                                    )) : <Radio value="본계정">본계정</Radio>}
                                </RadioGroup>
                                <Input
                                    label="추가할 계정 이름"
                                    radius="sm"
                                    labelPlacement="outside"
                                    placeholder="2~12글자"
                                    value={inputName}
                                    onValueChange={setInputName}/>
                                <Button
                                    fullWidth
                                    size="sm"
                                    radius="sm"
                                    variant="flat"
                                    color="success"
                                    isDisabled={inputName === ''}
                                    className="mt-2"
                                    onPress={onClickAddAccount}>
                                    계정 추가
                                </Button>
                                <p className="mt-1 text-sm fadedtext">다른 계정을 추가할려면 위 입력란에 새로운 계정 이름을 입력하세요.</p>
                                <Button
                                    fullWidth
                                    radius="sm"
                                    color="primary"
                                    isLoading={isLoadingButton}
                                    onPress={async () => {
                                        await handleSelectAccount(selected, characterIndex, dispatch, onClose, setLoadingButton, checklist);
                                    }}
                                    className="mt-6 mb-4">
                                    계정 선택
                                </Button>
                            </div>
                        </ModalBody>
                    </>
                )}
            </ModalContent>
        </Modal>
    )
}

// 설정 버튼 요소
type SettingButtonProps = {
    size: number,
    checklist: CheckCharacter[],
    characterIndex: number,
    dispatch: AppDispatch,
    accounts: string[],
    setAccounts: SetStateFn<string[]>
}
function SettingButton({ size, checklist, characterIndex, dispatch, accounts, setAccounts }: SettingButtonProps) {
    const [isOpenAccount, setOpenAccount] = useState(false);
    const onOpenChangeAccount = (isOpen: boolean) => setOpenAccount(isOpen);
    return (
        <>
            <Dropdown>
                <DropdownTrigger>
                    <Button isIconOnly variant="light" size="sm"><SettingIcon size={size} className="text-gray-500 hover:text-gray-800 cursor-pointer" /></Button>
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
                        key="reset-cube"
                        startContent={
                            <Image 
                                src="/icons/cube.png" 
                                width={16} 
                                height={16} 
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

// 숙제 추가 및 삭제 Modal
type ChecklistModalProps = {
    isOpen: boolean,
    modalData: ModalData,
    onOpenChange: () => void,
    checklist: CheckCharacter[],
    dispatch: AppDispatch,
    bosses: Boss[]
}
export function ChecklistModal({ isOpen, modalData, onOpenChange, checklist, dispatch, bosses }: ChecklistModalProps) {
    if (modalData.characterIndex !== -1) {
        return (
            <Modal
                radius="sm"
                isDismissable={false}
                isOpen={isOpen}
                onOpenChange={onOpenChange}>
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader>
                                <span>{checklist[modalData.characterIndex].nickname} 콘텐츠 관리</span>
                            </ModalHeader>
                            <ModalBody>
                                <div className="w-full max-h-[600px] min-[601px]:max-h-[800px] overflow-y-auto scroll-auto">
                                    {modalData.type === 'day' ? 
                                        <DayModalContent
                                            checklist={checklist}
                                            index={modalData.characterIndex}
                                            dispatch={dispatch}
                                            onClose={onClose}/> : 
                                        <WeekModalContent 
                                            checklist={checklist} 
                                            index={modalData.characterIndex} 
                                            dispatch={dispatch}
                                            bosses={bosses}
                                            onClose={onClose}/>}
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
    onClose: () => void
}
function DayModalContent({ checklist, index, dispatch, onClose }: DayModalContentProps) {
    return (
        <div className="w-full">
            <Tabs aria-label="day-tab" fullWidth>
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
                        onClose={onClose}/>
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
    onClose: () => void
}
function DayListComponent({ checklist, index, dispatch, onClose }: DayListComponentProps) {
    const [isLoadingAdd, setLoadingAdd] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const otherItem: OtherList = {
        name: inputValue,
        isCheck: false
    }
    const onClickAddDayList = useOnClickAddDayList(checklist, index, dispatch, otherItem, setLoadingAdd, setInputValue);
    return (
        <>
            <Input
                fullWidth
                isRequired
                label="숙제"
                placeholder="2~15자 안으로 작성하세요."
                maxLength={15}
                value={inputValue}
                onValueChange={setInputValue}/>
            <Button
                fullWidth
                isLoading={isLoadingAdd}
                isDisabled={inputValue.trim() === ''}
                color="primary"
                className="mt-4"
                onPress={onClickAddDayList}>추가</Button>
            <Divider className="mt-6"/>
            <Table aria-label="week-list-table" removeWrapper className="mt-6">
                <TableHeader>
                    <TableColumn>숙제명</TableColumn>
                    <TableColumn>삭제</TableColumn>
                </TableHeader>
                <TableBody emptyContent={"설정된 콘텐츠가 없습니다."}>
                    {checklist[index].daylist.map((item, idx) => (
                        <TableRow key={idx}>
                            <TableCell>{item.name}</TableCell>
                            <TableCell>
                                <button className="underline redbutton" onClick={async () => {
                                    if (confirm('해당 숙제를 삭제하시겠습니까? 삭제 후 되돌릴 수 없습니다.')) {
                                        await handleRemoveDayList(checklist, index, idx, dispatch);
                                    }
                                }}>삭제</button></TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </>
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
        <div className="w-full">
            <Progress
                color="success"
                radius="sm"
                value={dungeon}
                maxValue={getMaxRestValue('전선')}
                label={<RestLabel value={dungeon} maxValue={getMaxRestValue('전선')} title="쿠르잔 전선"/>}/>
            <div className="w-full gap-4 flex mt-4">
                <Button
                    color="danger"
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
                    size="sm"
                    isDisabled={dungeon >= getMaxRestValue('전선')}
                    className="grow"
                    onPress={() => {
                        const max = getMaxRestValue('전선')
                        let value = dungeon + max/10;
                        if (value > max) value = max;
                        setDungeon(value);
                    }}>증가</Button>
            </div>
            <Progress
                color="success"
                radius="sm"
                value={boss}
                maxValue={getMaxRestValue('가디언')}
                className="mt-6"
                label={<RestLabel value={boss} maxValue={getMaxRestValue('가디언')} title="가디언 토벌"/>}/>
            <div className="w-full gap-4 flex mt-4">
                <Button
                    color="danger"
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
                    size="sm"
                    isDisabled={boss >= getMaxRestValue('가디언')}
                    className="grow"
                    onPress={() => {
                        const max = getMaxRestValue('가디언')
                        let value = boss + max/10;
                        if (value > max) value = max;
                        setBoss(value);
                    }}>증가</Button>
            </div>
            <Divider className="mt-6"/>
            <div className="font-bold mb-1 mt-6">주의사항</div>
            <p>휴식 게이지를 저장할 경우 사용된 휴식 게이지는 초기화됩니다. 체크 해제 시 사용된 휴식 게이지는 초기화되어 환급을 받지 못합니다.</p>
            <Button
                fullWidth
                color="primary"
                isLoading={isLoadingSave}
                className="mt-4"
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
    onClose: () => void
}
function WeekModalContent({ checklist, index, dispatch, bosses, onClose }: WeekModalContentProps) {
    const [content, setContent] = useState<Selection>(new Set([]));
    const [difficulty, setDifficulty] = useState<Selection>(new Set([]));
    const [isGold, setGold] = useState(false);

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
            <Tabs fullWidth aria-label="week-modal">
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
                        setGold={setGold}/>
                </Tab>
                <Tab key="list" title="기타">
                    <WeekListComponent
                        checklist={checklist}
                        index={index}
                        dispatch={dispatch}
                        onClose={onClose}/>
                </Tab>
            </Tabs>
        </div>
    )
}

// 주간 숙제 관리 컴포넌트
type WeekListComponentProps = {
    checklist: CheckCharacter[],
    index: number,
    dispatch: AppDispatch,
    onClose: () => void
}
function WeekListComponent({ checklist, index, dispatch, onClose }: WeekListComponentProps) {
    const [isLoadingAdd, setLoadingAdd] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const otherItem: OtherList = {
        name: inputValue,
        isCheck: false
    }
    const onClickAddItem = useOnClickAddWeekList(checklist, index, dispatch, otherItem, setLoadingAdd, setInputValue);
    return (
        <>
            <Input
                fullWidth
                isRequired
                radius="sm"
                label="숙제"
                placeholder="2~15자 안으로 작성하세요."
                maxLength={15}
                value={inputValue}
                onValueChange={setInputValue}/>
            <Button
                fullWidth
                radius="sm"
                isLoading={isLoadingAdd}
                isDisabled={inputValue.trim() === ''}
                color="primary"
                className="mt-4"
                onPress={onClickAddItem}>추가</Button>
            <Divider className="mt-6"/>
            <Table aria-label="week-list-table" removeWrapper className="mt-6">
                <TableHeader>
                    <TableColumn>숙제명</TableColumn>
                    <TableColumn>삭제</TableColumn>
                </TableHeader>
                <TableBody emptyContent={"설정된 콘텐츠가 없습니다."}>
                    {checklist[index].weeklist.map((item, idx) => (
                        <TableRow key={idx}>
                            <TableCell>{item.name}</TableCell>
                            <TableCell>
                                <button className="underline redbutton" onClick={async () => {
                                    if (confirm('해당 숙제를 삭제하시겠습니까? 삭제 후 되돌릴 수 없습니다.')) {
                                        await handleRemoveWeekList(checklist, index, idx, dispatch);
                                    }
                                }}>삭제</button></TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </>
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
    setGold: SetStateFn<boolean>
}
export type ControlStage = {
    stage: number,
    difficulty: string
}
function WeekContentComponent({
    checklist,
    index,
    dispatch,
    bosses,
    onClose,
    content, setContent,
    difficulty, setDifficulty,
    isGold, setGold
}: WeekContentComponentProps) {
    const [isLoadingAdd, setLoadingAdd] = useState(false);
    const [stages, setStages] = useState<ControlStage[]>([]);

    useEffect(() => {
        if (!Array.from(content)[0]) setStages([]);
        else {
            const findBoss = getBossesById(bosses, Array.from(content)[0].toString());
            const newStages: ControlStage[] = [];
            if (findBoss) {
                for (const st of getWeekStages(bosses, Array.from(content)[0].toString())) {
                    const newStage: ControlStage = {
                        stage: st,
                        difficulty: '선택안함'
                    }
                    newStages.push(newStage);
                }
                setStages(newStages);
            }
        }
    }, [content]);

    return (
        <>
            <Table aria-label="checklist-table" removeWrapper>
                <TableHeader>
                    <TableColumn>콘텐츠명</TableColumn>
                    <TableColumn>골드지정</TableColumn>
                    <TableColumn>삭제</TableColumn>
                </TableHeader>
                <TableBody emptyContent={"설정된 콘텐츠가 없습니다."}>
                    {checklist[index].checklist.map((item, idx) => (
                        <TableRow key={idx}>
                            <TableCell>{item.name}</TableCell>
                            <TableCell>
                                <Switch
                                    size="sm"
                                    color="warning"
                                    isSelected={item.isGold}
                                    onValueChange={async (isSelected) => {
                                        await handleCheckGolds(checklist, index, idx, dispatch, isSelected, bosses);
                                    }}/>
                            </TableCell>
                            <TableCell>
                                <button className="underline redbutton" onClick={async () => {
                                    if (confirm('해당 콘텐츠를 삭제하시겠습니까? 삭제 후 되돌릴 수 없습니다.')) {
                                        await useOnClickRemoveItem(checklist, index, idx, dispatch);
                                    }
                                }}>삭제</button>
                            </TableCell>
                        </TableRow>
                        ))}
                </TableBody>
            </Table>
            <Divider className="mt-4"/>
            <div className="mt-4 pb-4">
                <div className="flex gap-1 items-center">
                    <span className="grow text-xl">콘텐츠 추가</span>
                    <Tooltip showArrow content="골드를 획득하는 콘텐츠는 총 3회까지만 인정됩니다. 단, 격주로 가능한 4관같은 경우에는 인정됩니다.">
                        <Image 
                            src="/icons/gold.png" 
                            width={18} 
                            height={18} 
                            alt="goldicon"
                            className="w-[18px] h-[18px]"/>
                    </Tooltip>
                    <span className="text-md">({getTakeGold(checklist[index].checklist)}/3)</span>
                </div>
                <Select
                    placeholder="주간 콘텐츠 선택"
                    label="주간 콘텐츠"
                    variant="underlined"
                    selectedKeys={content}
                    onSelectionChange={setContent}
                    className="mt-2">
                    {getWeekContents(bosses).map((item) => (
                        <SelectItem key={item.key}>{item.name}</SelectItem>
                    ))}
                </Select>
                {Array.from(content)[0] ? getWeekStages(bosses, Array.from(content)[0].toString()).map((level, idx) => (
                    <div key={idx} className="mt-2">
                        <h3 className="font-bold mb-1">{level}관문</h3>
                        <Tabs 
                            fullWidth 
                            radius="sm" 
                            color="primary"
                            selectedKey={stages.length > idx ? stages[idx].difficulty : '선택안함'}
                            onSelectionChange={(key) => {
                                const diff = key.toString();
                                if (stages.length > idx) {
                                    const cloneStages = structuredClone(stages);
                                    if (idx > 0) {
                                        if (cloneStages[idx-1].difficulty === '선택안함') {
                                            return;
                                        }
                                    }
                                    cloneStages[idx].difficulty = diff;
                                    if (diff === '선택안함') {
                                        for (let i = idx; i < cloneStages.length; i++) {
                                            cloneStages[i].difficulty = '선택안함';
                                        }
                                    }
                                    setStages(cloneStages);
                                }
                            }}>
                            {getDifficultyByStage(bosses, Array.from(content)[0].toString(), level).map((diff) => (
                                <Tab key={diff} title={diff}/>
                            ))}
                        </Tabs>
                    </div>
                )) : <></>}
                <div className={clsx(
                    "mt-3",
                    Array.from(content)[0] ? 'block' : "hidden"
                )}>
                    <Checkbox
                        color="warning"
                        isSelected={isGold}
                        onValueChange={setGold}>골드 체크</Checkbox>
                </div>
                <Button 
                    fullWidth
                    radius="sm"
                    color="primary"
                    isLoading={isLoadingAdd}
                    isDisabled={stages.length > 0 ? stages[0].difficulty === '선택안함' : true}
                    onPress={async () => {
                        if (Array.from(content)[0]) {
                            setLoadingAdd(true);
                            const name: string = getBossesById(bosses, Array.from(content)[0].toString())?.name ?? '';
                            const items: ChecklistItem[] = [];
                            for (const stage of stages) {
                                if (stage.difficulty !== '선택안함') {
                                    items.push({
                                        stage: stage.stage,
                                        difficulty: stage.difficulty,
                                        isBonus: false,
                                        isCheck: false,
                                        isDisable: false
                                    });
                                }
                            }
                            const addItem: Checklist = {
                                name: name,
                                isGold: isGold,
                                items: items
                            }
                            await useOnClickAddItem(checklist, index, addItem, dispatch, setLoadingAdd, bosses);
                        }
                        
                    }}
                    className={clsx(
                        "mt-4",
                        Array.from(content)[0] ? 'block' : "hidden"
                    )}>추가</Button>
            </div>
        </>
    )
}

// 큐브 갯수 확인 컴포넌트
type CubeCountComponentProps = {
    checklist: CheckCharacter[],
    character: CheckCharacter,
    cubes: Cube[],
    dispatch: AppDispatch
}
function CubeCountComponent({ checklist, character, cubes, dispatch }: CubeCountComponentProps) {
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
                                    onPress={async () => {
                                        await handleControlCube(checklist, getIndexByNickname(checklist, character.nickname), cube.id, dispatch, false);
                                    }}>-</Button>
                                <Button
                                    size="sm"
                                    variant="flat"
                                    color="success"
                                    isDisabled={getCountCube(character.cubelist, cube.id) >= 9999}
                                    className="w-8 h-8 min-w-0 min-h-0 p-0 text-sm"
                                    onPress={async () => {
                                        await handleControlCube(checklist, getIndexByNickname(checklist, character.nickname), cube.id, dispatch, true);
                                    }}>+</Button>
                            </div>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}

// 큐브 현황 컴포넌트
type CubeStatueComponentProps = {
    character: CheckCharacter,
    cubes: Cube[]
}
export function CubeStatueComponent({ character, cubes }: CubeStatueComponentProps) {
    const cells: any = (statue: CubeStatue) => {
        return [
            <TableCell key="level">Lv.{statue.level}</TableCell>,
            ...statue.cubeCount.map((count, idx) => (
            <TableCell key={idx}>{count.count}개</TableCell>
            )),
        ];
    }
    const columns: any = () => {
        return (
            <>
                <TableColumn>보석 레벨</TableColumn>
                {getColumnsByCubeTiers(cubes).map((tier: number, index: number) => (
                    <TableColumn key={index}>T{tier}</TableColumn>
                ))}
            </>
        )
    }
    return (
        <Table removeWrapper>
            <TableHeader>
                {columns()}
            </TableHeader>
            <TableBody>
                {getCubeStatues(character, cubes).map((statue, index) => (
                    <TableRow key={index}>
                        {cells(statue)}
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}

// 큐브 현황 컴포넌트
type CubeDetailComponentProps = {
    checklist: CheckCharacter[],
    cubes: Cube[]
}
export function CubeDetailComponent({ checklist, cubes }: CubeDetailComponentProps) {
    return (
        <div className="w-full mt-4">
            <p className="text-xl mb-2">큐브 전체 현황</p>
            <Tabs aria-label="cube-detail">
                <Tab key="setting" title="개수">
                    <div className="max-w-full w-full overflow-x-auto">
                        <CubeDetailCount checklist={checklist} cubes={cubes}/>
                    </div>
                </Tab>
                <Tab key="statue" title="보상">
                    <div className="max-w-full w-full overflow-x-auto">
                        <CubeDetailGems checklist={checklist} cubes={cubes}/>
                    </div>
                </Tab>
            </Tabs>
        </div>
    )
}

// 완성되는 보석 개수 가져오기
function CubeDetailGems({ checklist, cubes }: CubeDetailComponentProps) {
    const [tier, setTier] = useState(0);
    const [selected, setSelected] = useState('');

    useEffect(() => {
        if (getColumnsByCubeTiers(cubes).length > 0) {
            setTier(getColumnsByCubeTiers(cubes).reverse()[0]);
            setSelected(`${getColumnsByCubeTiers(cubes).reverse()[0]}`);
        }
    }, []);

    useEffect(() => {
        setTier(Number(selected));
    }, [selected])

    const columns: any = () => {
        return (
            <>
                <TableColumn>캐릭터 명</TableColumn>
                {[...Array(10)].map((_, index) => (
                    <TableColumn key={index}>{index+1}레벨 보석</TableColumn>
                ))}
            </>
        )
    }
    const cells: any = (character: CheckCharacter) => {
        return [
            <TableCell key="level">{character.nickname}</TableCell>,
            ...getGemCountByCharacter(character, cubes, tier).map((gem, idx) => (
                <TableCell key={idx}>
                    <Chip 
                        size="sm" 
                        color={gem > 0 ? 'primary' : 'default'} 
                        variant="flat" 
                        className="min-w-full text-center">
                        {gem}
                    </Chip>
                </TableCell>
            )),
        ];
    }
    const allCells: any = () => {
        return [
            <TableCell key="all">전체</TableCell>,
            ...getGemCountByChecklist(checklist, cubes, tier).map((gem, idx) => (
                <TableCell key={idx}>
                    <Chip 
                        size="sm" 
                        color={gem > 0 ? 'success' : 'default'} 
                        variant="flat" 
                        className="min-w-full text-center">
                        {gem}
                    </Chip>
                </TableCell>
            )),
        ];
    }
    return (
        <>
            <RadioGroup 
                color="primary" 
                label="보석 티어 선택" 
                defaultValue={getColumnsByCubeTiers(cubes).reverse()[0].toString()}
                orientation="horizontal"
                value={selected}
                onValueChange={setSelected}>
                {getColumnsByCubeTiers(cubes).reverse().map((t, index) => (
                    <Radio key={index} value={`${t}`}>{t}티어</Radio>
                ))}
            </RadioGroup>
            <div className="max-w-full w-full overflow-x-auto mt-4">
                <Table 
                    removeWrapper 
                    className="min-w-full w-[1120px]">
                    <TableHeader>
                        {columns()}
                    </TableHeader>
                    <TableBody>
                        <>
                            {checklist.map((character, index) => (
                                <TableRow key={index}>
                                    {cells(character)}
                                </TableRow>
                            ))}
                            <TableRow key="all" className="border-t-1 border-[#dddddd] dark:border-[#333333]">
                                {allCells()}
                            </TableRow>
                        </>
                    </TableBody>
                </Table>
            </div>
        </>
    )
}

// 전체 큐브 갯수 가져오기
function CubeDetailCount({ checklist, cubes }: CubeDetailComponentProps) {
    const columns: any = () => {
        return (
            <>
                <TableColumn>캐릭터 명</TableColumn>
                {cubes.map((cube, index) => (
                    <TableColumn key={index}>{cube.name}</TableColumn>
                ))}
            </>
        )
    }
    const cells: any = (character: CheckCharacter) => {
        return [
            <TableCell key="level">{character.nickname}</TableCell>,
            ...cubes.map((cube, idx) => (
                <TableCell key={idx}>
                    <Chip 
                        size="sm" 
                        color={getCubeCountByCharacter(character, cube) > 0 ? 'primary' : 'default'} 
                        variant="flat" 
                        className="min-w-full text-center">
                        {getCubeCountByCharacter(character, cube)}
                    </Chip>
                </TableCell>
            )),
        ];
    }
    const allCells: any = () => {
        return [
            <TableCell key="all">전체</TableCell>,
            ...cubes.map((cube, idx) => (
                <TableCell key={idx}>
                    <Chip 
                        size="sm" 
                        color={getCubeCountByChecklist(checklist, cube) > 0 ? 'success' : 'default'} 
                        variant="flat" 
                        className="min-w-full text-center">
                        {getCubeCountByChecklist(checklist, cube)}
                    </Chip>
                </TableCell>
            )),
        ];
    }
    return (
        <Table 
            removeWrapper 
            className="min-w-full"
            style={{ width: `${(cubes.length+1) * 100}px` }}>
            <TableHeader>
                {columns()}
            </TableHeader>
            <TableBody>
                <>
                    {checklist.map((character, index) => (
                        <TableRow key={index}>
                            {cells(character)}
                        </TableRow>
                    ))}
                    <TableRow key="all" className="border-t-1 border-[#dddddd] dark:border-[#333333]">
                        {allCells()}
                    </TableRow>
                </>
            </TableBody>
        </Table>
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
                                                        <Image 
                                                            src="/icons/gold.png" 
                                                            width={14} 
                                                            height={14} 
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
                                                    <Image 
                                                        src="/icons/gold.png" 
                                                        width={14} 
                                                        height={14} 
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
                                                    <Image 
                                                        src="/icons/gold.png" 
                                                        width={14} 
                                                        height={14} 
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
                                                    <Image 
                                                        src="/icons/gold.png" 
                                                        width={14} 
                                                        height={14} 
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
                                        <div key={idx}>
                                            <Checkbox
                                                lineThrough
                                                size="sm"
                                                radius="full"
                                                isSelected={item.isSelected}
                                                className={clsx(
                                                    "max-w-full w-full mt-3 box-border p-1.5",
                                                    item.isSelected ? 'outline-2 outline-blue-400 dark:outline-blue-800 rounded-md bg-blue-400/20 dark:bg-blue-800/20' : ''
                                                )}
                                                onValueChange={(isSelected) => {
                                                    const copyArray = structuredClone(samples);
                                                    copyArray[idx].isSelected = isSelected;
                                                    setSamples(copyArray);
                                                }}>
                                                <span className="flex items-center gap-1">
                                                    <span>{item.name}</span>
                                                </span>
                                            </Checkbox>
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
}
export function FilterComponent({ 
    filterContent, 
    setFilterContent, 
    bosses, 
    checklist,
    isRemainHomework,
    setRemainHomework,
    isShowGoldCharacter,
    setShowGoldCharacter,
    filterAccount,
    setFilterAccount
}: FilterComponentProps) {
    return (
        <div className="w-full mt-4">
            <h1 className="text-xl mb-1">검색 필터</h1>
            <div className="w-full flex flex-col sm:flex-row gap-3 sm:items-center">
                <Select
                    label="계정 검색"
                    placeholder="게정를 선택하세요."
                    selectedKeys={filterAccount}
                    radius="sm"
                    size="sm"
                    onSelectionChange={setFilterAccount}
                    className="w-full sm:w-[300px]">
                    {getAccounts(checklist).map((account, index) => (
                        <SelectItem key={index}>{account}</SelectItem>
                    ))}
                </Select>
                <Select
                    label="콘텐츠로 검색"
                    placeholder="콘텐츠를 선택하세요."
                    selectedKeys={filterContent}
                    radius="sm"
                    size="sm"
                    onSelectionChange={setFilterContent}
                    className="w-full sm:w-[300px]">
                    {getBossesByHaveContent(checklist, bosses).map((boss, index) => (
                        <SelectItem key={index}>{boss}</SelectItem>
                    ))}
                </Select>
                <div>
                    <div>
                        <Switch
                            size="sm"
                            isSelected={isRemainHomework}
                            onValueChange={setRemainHomework}>
                            주간 숙제를 완료한 캐릭터 숨기기
                        </Switch>
                    </div>
                    <div>
                        <Switch
                            size="sm"
                            isSelected={isShowGoldCharacter}
                            onValueChange={setShowGoldCharacter}>
                            골드 지정 캐릭터만 표시하기
                        </Switch>
                    </div>
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
    const [value, setValue] = useState<Selection>(new Set([]));
    const [page, setPage] = useState(1);
    const countByPage = 10;

    useEffect(() => {
        loadDatas(checklist, bosses, value, setDatas, setResults);
    }, [checklist]);

    useEffect(() => {
        if (datas.length > 0) {
            const valueList = Array.from(value);
            if (valueList.length === 0) {
                setResults(datas);
            } else {
                const selectedIndex = Number(valueList[0]);
                const contentName = bosses.sort((a, b) => {
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
                }).map(boss => boss.name)[selectedIndex];
                const list = datas.filter((item) => item.contentName === contentName);
                setResults(list);
            }
            setPage(1);
        }
    }, [value]);

    return (
        <div className="w-full mt-4">
            <Select
                label="콘텐츠 선택"
                placeholder="콘텐츠를 선택하세요."
                selectedKeys={value}
                radius="sm"
                size="sm"
                onSelectionChange={setValue}
                className="w-full sm:w-[300px]">
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
                }).map(boss => boss.name).map((boss, index) => (
                    <SelectItem key={index}>{boss}</SelectItem>
                ))}
            </Select>
            <div className="w-full mt-4 grid grid-cols-2 min-[617px]:grid-cols-3 min-[925px]:grid-cols-4 min-[1233px]:grid-cols-5 gap-2">
                {results.slice((page-1)*countByPage, page*countByPage).map((item, index) => (
                    <Tooltip key={index} showArrow content={<div className={clsx(
                        item.isGold ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'
                    )}>
                        {item.isGold ? '골드 획득 가능' : "골드 획득 불가"}
                    </div>}>
                        <Card shadow="sm" radius="sm" className={clsx(
                            "border-l-4",
                            item.isGold ? "border-[#F3B600]" : "border-[#cccccc] dark:border-[#333333]"
                        )}>
                            <CardBody className="py-2.5 sm:py-3 px-1.5 sm:px-2">
                                <div>
                                    <p className="text-[8pt] sm:text-[10pt] font-bold">{item.contentName} {item.difficulty}</p>
                                    <div className="w-full flex gap-1">
                                        <p className="grow text-[7pt] sm:text-[9pt]">{item.nickname}</p>
                                        <p className="fadedtext text-[7pt] sm:text-[9pt]">Lv.{item.level}</p>
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                    </Tooltip>
                ))}
            </div>
            {results.length === 0 ? (
                <div className="w-full h-[140px] fadedtext flex justify-center items-center">
                    <div className="flex gap-2 items-center">
                        <CheckIcon size={24}/>
                        <p className="text-md sm:text-xl">남은 숙제가 없거나 데이터가 존재하지 않습니다.</p>
                    </div>
                </div>
            ) : <></>}
            {results.length > 0 && Math.ceil(results.length / countByPage) > 1 ? (
                <div className="w-full flex justify-center mt-2">
                    <Pagination
                        isCompact
                        showControls
                        color="primary"
                        page={page}
                        total={Math.ceil(results.length / countByPage)}
                        onChange={setPage}
                        className="mt-2"/>
                </div>
            ) : <></>}
        </div>
    )
}