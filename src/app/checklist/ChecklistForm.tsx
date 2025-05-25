import { useState } from "react";
import { Boss } from "../api/checklist/boss/route";
import { CheckCharacter } from "../store/checklistSlice";
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
    Table, TableHeader, TableColumn, TableBody, TableRow, TableCell
} from "@heroui/react";
import Image from "next/image";
import { DayValue, getAllCountChecklist, getAllGoldCharacter, getAllGolds, getCompleteChecklist, getCompleteGoldCharacter, getDayName, getHaveGolds, getMaxRestValue, getServerList, getTypeDayValue, useOnClickDayCheck, useOnClickRemoveItem, useOnClickWeekCheck } from "./checklistFeat";
import { SetStateFn, useMobileQuery } from "@/utiils/utils";
import { SettingIcon } from "../icons/SettingIcon";
import clsx from "clsx";
import { AppDispatch } from "../store/store";
import AddIcon from "../icons/AddIcon";

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
    dispatch: AppDispatch
}
export function ChecklistModal({ isOpen, modalData, onOpenChange, checklist, dispatch }: ChecklistModalProps) {
    if (modalData.characterIndex !== -1) {
        return (
            <Modal
                isDismissable={false}
                isOpen={isOpen}
                onOpenChange={onOpenChange}>
                <ModalContent>
                    {(onCLose) => (
                        <>
                            <ModalHeader>
                                <span>{checklist[modalData.characterIndex].nickname} 콘텐츠 관리</span>
                            </ModalHeader>
                            <ModalBody>
                                {modalData.type === 'day' ? <DayModalContent/> : <WeekModalContent checklist={checklist} index={modalData.characterIndex} dispatch={dispatch}/>}
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
function DayModalContent() {
    return <div>day</div>
}

// 주간 콘텐츠 추가 및 삭제 컴포넌트
type WeekModalContentProps = {
    checklist: CheckCharacter[],
    index: number,
    dispatch: AppDispatch
}
function WeekModalContent({ checklist, index, dispatch }: WeekModalContentProps) {
    return (
        <div className="w-full">
            <Table aria-label="checklist-table" removeWrapper>
                <TableHeader>
                    <TableColumn>콘텐츠명</TableColumn>
                    <TableColumn>난이도</TableColumn>
                    <TableColumn>삭제</TableColumn>
                </TableHeader>
                <TableBody>
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
        </div>
    )
}