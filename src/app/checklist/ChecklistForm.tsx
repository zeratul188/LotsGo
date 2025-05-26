import { useEffect, useState } from "react";
import { Boss } from "../api/checklist/boss/route";
import { CheckCharacter, Checklist, OtherList } from "../store/checklistSlice";
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
    Input
} from "@heroui/react";
import Image from "next/image";
import { 
    DayValue, 
    getAllCountChecklist, 
    getAllGoldCharacter, 
    getAllGolds, 
    getBossesById, 
    getCompleteChecklist, 
    getCompleteGoldCharacter, 
    getDayName, 
    getHaveGolds, 
    getMaxRestValue, 
    getServerList, 
    getTakeGold, 
    getTypeDayValue, 
    getWeekContents, 
    getWeekDifficultys, 
    handleRemoveWeekList, 
    handleWeekListCheck, 
    isBiweeklyContent, 
    isCheckBiweeklyContent, 
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
import { title } from "process";

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

    return {
        isLoading, setLoading,
        bosses, setBosses,
        server, setServer,
        isOpen, onOpen, onOpenChange,
        modalData, setModalData
    }
}

// 체크리스트 현황 컴포넌트
type ChecklistStatueProps = {
    checklist: CheckCharacter[],
    bosses: Boss[]
}
export function ChecklistStatue({ checklist, bosses }: ChecklistStatueProps) {
    const isMobile = useMobileQuery();
    return (
        <Card fullWidth radius="sm">
            <CardBody>
                <div className="w-full flex flex-col md960:flex-row gap-4">
                    <div className="w-full md960:w-[400px]">
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
                                    <span className="ml-1 text-md">주간 수익 골드량 : {getHaveGolds(bosses, checklist).toLocaleString()} / {getAllGolds(bosses, checklist).toLocaleString()}</span>
                                </div>
                            )}
                            showValueLabel={true}
                            radius="sm"
                            value={getHaveGolds(bosses, checklist)}
                            maxValue={getAllGolds(bosses, checklist)}
                            className="w-full"/>
                    </div>
                    <div><Divider orientation={isMobile ? 'horizontal' : 'vertical'}/></div>
                    <div className="w-full md960:w-[400px]">
                        <Progress 
                            aria-label="all-gold"
                            size="md"
                            color="success"
                            label={`📃 숙제 진행 상황 : ${getCompleteChecklist(checklist)} / ${getAllCountChecklist(checklist)}`}
                            showValueLabel={true}
                            radius="sm"
                            value={getCompleteChecklist(checklist)}
                            maxValue={getAllCountChecklist(checklist)}
                            className="w-full"/>
                    </div>
                    <div><Divider orientation={isMobile ? 'horizontal' : 'vertical'}/></div>
                    <div className="grow-1 flex flex-col md960:flex-row justify-end items-center gap-2">
                        <Tooltip 
                            showArrow
                            content="가입된 원정대 캐릭터 한에서만 선택 가능합니다.">
                            <Button
                                color="success"
                                variant="flat"
                                className="w-full md960:w-[100px]">캐릭터 추가</Button>
                        </Tooltip>
                        <Tooltip 
                            showArrow
                            placement="left"
                            content="캐릭터 정보만 수정되며, 체크리스트는 영향을 주지 않습니다.">
                            <Button
                                color="primary"
                                className="w-full md960:w-[140px]">캐릭터 갱신하기</Button>
                        </Tooltip>
                    </div>
                </div>
            </CardBody>
        </Card>
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
    dispatch: AppDispatch,
    onOpen: () => void,
    setModalData: SetStateFn<ModalData>
}
export function ChecklistComponent({ checklist, server, bosses, dispatch, onOpen, setModalData }: ChecklistProps) {
    return (
        <div className="mt-5 grid grid-cols-1 md960:grid-cols-2 gap-4">
            {checklist
                .filter((character) => character.server === server || server === '전체')
                .map((character, index) => (
                    <Card key={index} fullWidth radius="sm">
                        <CardHeader>
                            <div className="w-full flex flex-col md960:flex-row items-center gap-2">
                                <div className="w-full flex grow-1 flex-row md960:flex-col items-center">
                                    <div className="grow-1 w-full">
                                        <div className="flex gap-2 items-center">
                                            <Chip size="sm" color="warning" className={clsx(
                                                character.isGold ? 'block' : 'hidden',
                                                "h-auto pt-0.5 pb-0.5 text-white dark:text-black"
                                            )}>골드 지정</Chip>
                                            <span className="fadedtext text-sm">@{character.server} · {character.job} · Lv.{character.level}</span>
                                        </div>
                                        <div className="flex gap-2 items-center">
                                            <span className="text-xl">{character.nickname}</span>
                                            <div className="hidden md960:block"><SettingButton size={16} character={character}/></div>
                                        </div>
                                    </div>
                                    <div className="block md960:hidden"><SettingButton size={26} character={character}/></div>
                                </div>
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
                                            <span className="ml-1 text-md">{getCompleteGoldCharacter(bosses, character).toLocaleString()} / {getAllGoldCharacter(bosses, character).toLocaleString()}</span>
                                        </div>
                                    )}
                                    showValueLabel={true}
                                    radius="sm"
                                    value={getCompleteGoldCharacter(bosses, character)}
                                    maxValue={getAllGoldCharacter(bosses, character)}
                                    className="w-full md960:w-[330px]"/>
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
                                    <RestCheckButton checklist={checklist} character={character} type="전선" dispatch={dispatch}/>
                                    <RestCheckButton checklist={checklist} character={character} type="가디언" dispatch={dispatch}/>
                                    <RestCheckButton checklist={checklist} character={character} type="에포나" dispatch={dispatch}/>
                                    <Button 
                                        color="primary" 
                                        variant="light" 
                                        fullWidth 
                                        size="sm" 
                                        startContent={<AddIcon size={16}/>}
                                        className="mt-2"
                                        onPress={() => {
                                            setModalData({
                                                characterIndex: index,
                                                type: 'day'
                                            });
                                            onOpen();
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
                                    {character.checklist.map((item, idx) => (
                                        <div key={idx}>
                                            <Checkbox
                                                lineThrough
                                                aria-label={`checklist-${item.name}-${idx}`}
                                                size="sm"
                                                radius="full"
                                                isDisabled={item.isDisable}
                                                isSelected={item.isCheck}
                                                className="max-w-full mt-1"
                                                onChange={async () => await useOnClickWeekCheck(checklist, index, idx, dispatch)}>
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
                                                className="max-w-full mt-1"
                                                onChange={async () => await handleWeekListCheck(checklist, index, idx, dispatch)}>
                                                {item.name}</Checkbox>
                                        </div>
                                    ))}
                                    <Button 
                                        color="primary" 
                                        variant="light" 
                                        fullWidth 
                                        size="sm" 
                                        startContent={<AddIcon size={16}/>}
                                        className="mt-2"
                                        onPress={() => {
                                            setModalData({
                                                characterIndex: index,
                                                type: 'week'
                                            });
                                            onOpen();
                                        }}>추가</Button>
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                ))}
        </div>
    )
}

// 설정 버튼 요소
type SettingButtonProps = {
    size: number,
    character: CheckCharacter
}
function SettingButton({ size, character }: SettingButtonProps) {
    return <SettingIcon size={size} className="text-gray-500 hover:text-gray-800 cursor-pointer" />;
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
        <div className="mt-2">
            <Checkbox
                aria-label={`${character.nickname}'s ${type}`}
                size="sm"
                lineThrough
                radius="full"
                isSelected={type === '에포나' ? dayValue.value === 3 : dayValue.value === 1}
                onChange={onClickDayCheck}>
                {getDayName(type)} ({dayValue.value}/{type === '에포나' ? 3 : 1})
            </Checkbox>
            <div className="w-full h-[18px] relative mt-1">
                <span className="w-full text-center fadedtext text-sm absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">휴식 게이지 {dayValue.restValue}</span>
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
        <div className="flex w-full h-full gap-0.5">
            {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="grow h-full flex">
                    <div className={clsx(
                        "grow border-1 border-r-0 border-gray-300 dark:border-gray-700",
                        countBlocks >= (2*index + 1) ? 'bg-green-300 dark:bg-green-700' : "bg-gray-100 dark:bg-gray-900"
                    )}/>
                    <div className={clsx(
                        "grow border-1 border-l-0 border-gray-300 dark:border-gray-700",
                        countBlocks >= (2*index + 2) ? 'bg-green-300 dark:bg-green-700' : "bg-gray-100 dark:bg-gray-900"
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
                    
                </Tab>
            </Tabs>
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
    const [quest, setQeust] = useState(initialRestValue.quest);
    const [isLoadingSave, setLoadingSave] = useState(false);
    const onClickSaveRest = useOnClickSaveRestValue(checklist, index, dispatch, setLoadingSave, dungeon, boss, quest, onClose);
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
            <Progress
                color="success"
                radius="sm"
                value={quest}
                className="mt-6"
                maxValue={getMaxRestValue('에포나')}
                label={<RestLabel value={quest} maxValue={getMaxRestValue('에포나')} title="에포나 의뢰"/>}/>
            <div className="w-full gap-4 flex mt-4">
                <Button
                    color="danger"
                    size="sm"
                    isDisabled={quest <= 0}
                    className="grow"
                    onPress={() => {
                        const max = getMaxRestValue('에포나')
                        let value = quest - max/10;
                        if (value < 0) value = 0;
                        setQeust(value);
                    }}>감소</Button>
                <Button
                    color="success"
                    size="sm"
                    isDisabled={quest >= getMaxRestValue('에포나')}
                    className="grow"
                    onPress={() => {
                        const max = getMaxRestValue('에포나')
                        let value = quest + max/10;
                        if (value > max) value = max;
                        setQeust(value);
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
    const [isDisableGold, setDisableGold] = useState(false);

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
                    setDisableGold(false);
                } else {
                    setGold(false);
                    setDisableGold(true);
                }
            } else {
                setGold(false);
                setDisableGold(true);
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
                    setDisableGold(true);
                } else {
                    setGold(true);
                    setDisableGold(false);
                }
            } else {
                setGold(true);
                setDisableGold(false);
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
                        setGold={setGold}
                        isDisableGold={isDisableGold}/>
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
function WeekListComponent({
    checklist,
    index,
    dispatch,
    onClose
}: WeekListComponentProps) {
    const [isLoadingAdd, setLoadingAdd] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const otherItem: OtherList = {
        name: inputValue,
        isCheck: false
    }
    const onClickAddItem = useOnClickAddWeekList(checklist, index, dispatch, otherItem, setLoadingAdd, onClose);
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
    setGold: SetStateFn<boolean>,
    isDisableGold: boolean
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
    isDisableGold
}: WeekContentComponentProps) {
    const [isLoadingAdd, setLoadingAdd] = useState(false);
    return (
        <>
            <Table aria-label="checklist-table" removeWrapper>
                <TableHeader>
                    <TableColumn>콘텐츠명</TableColumn>
                    <TableColumn>난이도</TableColumn>
                    <TableColumn>삭제</TableColumn>
                </TableHeader>
                <TableBody emptyContent={"설정된 콘텐츠가 없습니다."}>
                    {checklist[index].checklist.map((item, idx) => (
                        <TableRow key={idx}>
                            <TableCell>{item.name}</TableCell>
                            <TableCell>{item.difficulty}</TableCell>
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
                <Select
                    placeholder="난이도 선택"
                    label="난이도"
                    variant="underlined"
                    selectedKeys={difficulty}
                    onSelectionChange={setDifficulty}
                    className={clsx(
                        "mt-2",
                        Array.from(content)[0] ? 'block' : "hidden"
                    )}>
                    {Array.from(content)[0] ? getWeekDifficultys(bosses, Array.from(content)[0].toString()).map((item) => (
                        <SelectItem key={item.key}>{item.name}</SelectItem>
                    )) : <></>}
                </Select>
                <div className={clsx(
                    "mt-3",
                    Array.from(difficulty)[0] ? 'block' : "hidden"
                )}>
                    <Checkbox
                        color="warning"
                        isDisabled={isDisableGold}
                        isSelected={isGold}
                        onValueChange={setGold}>골드 체크</Checkbox>
                </div>
                <Button 
                    fullWidth
                    color="primary"
                    isLoading={isLoadingAdd}
                    onPress={async () => {
                        if (Array.from(content)[0] && Array.from(difficulty)[0]) {
                            setLoadingAdd(true);
                            const name: string = getBossesById(bosses, Array.from(content)[0].toString())?.name ?? '';
                            const diff: string = getBossesById(bosses, Array.from(content)[0].toString())?.difficulty[Number(Array.from(difficulty)[0].toString())].difficulty ?? '';
                            const addItem: Checklist = {
                                name: name,
                                difficulty: diff,
                                isCheck: false,
                                isGold: isGold,
                                isDisable: false
                            }
                            await useOnClickAddItem(checklist, index, addItem, dispatch, setLoadingAdd, onClose);
                        }
                        
                    }}
                    className={clsx(
                        "mt-4",
                        Array.from(difficulty)[0] ? 'block' : "hidden"
                    )}>추가</Button>
            </div>
        </>
    )
}