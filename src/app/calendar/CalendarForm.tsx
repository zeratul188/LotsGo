import { useEffect, useState } from "react";
import { Boss } from "../api/checklist/boss/route";
import { Calendar, formatKoreanDate, Guild, handleSubmitCalendar, initialWeekData } from "./calendarFeat";
import clsx from "clsx";
import { 
    Button, 
    Chip, 
    Divider, 
    Modal, ModalBody, ModalContent, ModalHeader, useDisclosure ,
    Selection,
    Input,
    Select,
    SelectItem,
    cn,
    Checkbox,
    DatePicker,
    ModalFooter,
    Textarea
} from "@heroui/react";
import {DateValue, getLocalTimeZone, now} from "@internationalized/date";
import { getWeekContents, getWeekDifficultys } from "../checklist/checklistFeat";
import CalendarIcon from "@/Icons/CalendarIcon";
import { SetStateFn } from "@/utiils/utils";

// state 관리
export function useCalendarForm() {
    const [guild, setGuild] = useState<Guild | null>(null);
    const [works, setWorks] = useState<Calendar[]>([]);
    const [bosses, setBosses] = useState<Boss[]>([]);
    const [isLoading, setLoading] = useState(true);

    return {
        guild, setGuild,
        bosses, setBosses,
        isLoading, setLoading,
        works, setWorks
    }
}

// 주간 일정 컴포넌트
export type WeekBox = {
    date: Date,
    calendar: Calendar[]
}
type WeekComponentProps = {
    works: Calendar[],
    guild: Guild | null,
    bosses: Boss[],
    setWorks: SetStateFn<Calendar[]>,
    setGuild: SetStateFn<Guild | null>
}
export function WeekComponent({ works, guild, bosses, setWorks, setGuild }: WeekComponentProps) {
    const [weeks, setWeeks] = useState<WeekBox[]>([]);
    const {isOpen, onOpen, onOpenChange} = useDisclosure();

    const [title, setTitle] = useState('');
    const [raid, setRaid] = useState<Selection>(new Set([]));
    const [difficulty, setDifficulty] = useState<Selection>(new Set([]));
    const [selectDate, setSelectDate] = useState<DateValue | null>(now(getLocalTimeZone()));
    const [isTypeGuild, setTypeGuild] = useState(false);
    const [isEtc, setEtc] = useState(false);
    const [memo, setMemo] = useState('');
    const [isLoadingButton, setLoadingButton] = useState(false);

    useEffect(() => {
        initialWeekData(works, guild, setWeeks);
    }, [works]);

    return (
        <>
            <div className="w-full">
                <div className="flex gap-2 mb-4 items-center flex-col sm:flex-row">
                    <p className="text-2xl grow text-left w-full sm:w-[max-content]">이번 주 일정</p>
                    <Button
                        radius="sm"
                        color="primary"
                        className="w-full sm:w-[140px]"
                        onPress={onOpen}>
                        일정 추가
                    </Button>
                </div>
                <Divider className="mb-4 block sm:hidden"/>
                <div className="h-[300px] hidden lg1200:grid grid-cols-7 gap-2">
                    {weeks.map((week, index) => (
                        <div key={index} className={clsx(
                            index > 0 ? 'border-l-1 border-gray-100 dark:border-[#222222] pl-3' : ''
                        )}>
                            <Chip
                                size="sm"
                                variant="flat"
                                radius="sm"
                                color="primary"
                                className="min-w-full text-center">
                                {formatKoreanDate(week.date)}
                            </Chip>
                        </div>
                    ))}
                </div>
            </div>
            <Modal
                isDismissable={false}
                isKeyboardDismissDisabled={true}
                isOpen={isOpen}
                onOpenChange={onOpenChange}
                onClose={() => {
                    setTitle('');
                    setRaid(new Set([]));
                    setDifficulty(new Set([]));
                    setSelectDate(now(getLocalTimeZone()));
                    setTypeGuild(false);
                    setMemo('');
                    setEtc(false);
                }}>
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader>일정 추가</ModalHeader>
                            <ModalBody>
                                <Input
                                    isRequired
                                    label="제목"
                                    radius="sm"
                                    placeholder="일정 제목을 2~20글자 내로 입력하세요."
                                    value={title}
                                    onValueChange={setTitle}
                                    className="mb-2"/>
                                <div className="w-full grid grid-cols-2 gap-2 mb-2">
                                    <Checkbox
                                        classNames={{
                                            base: cn(
                                                "flex w-full max-w-md bg-content1",
                                                "hover:bg-content2 ml-0.5",
                                                "cursor-pointer rounded-lg p-2 border-2 border-transparent",
                                                "data-[selected=true]:border-primary",
                                            ),
                                            label: "w-full",
                                        }}
                                        isSelected={isTypeGuild}
                                        onValueChange={setTypeGuild}>
                                        <p className="w-full pl-1">
                                            길드 일정
                                        </p>
                                    </Checkbox>
                                    <Checkbox
                                        classNames={{
                                            base: cn(
                                                "flex w-full max-w-md bg-content1",
                                                "hover:bg-content2 ml-0.5",
                                                "cursor-pointer rounded-lg p-2 border-2 border-transparent",
                                                "data-[selected=true]:border-primary",
                                            ),
                                            label: "w-full",
                                        }}
                                        isSelected={isEtc}
                                        onValueChange={setEtc}>
                                        <p className="w-full pl-1">
                                            콘텐츠 없음
                                        </p>
                                    </Checkbox>
                                </div>
                                <Select
                                    isRequired
                                    label="콘텐츠"
                                    placeholder="콘텐츠 선택"
                                    radius="sm"
                                    selectedKeys={raid}
                                    onSelectionChange={setRaid}
                                    className={clsx(
                                        "mb-2",
                                        isEtc ? 'hidden' : 'block'
                                    )}>
                                    {getWeekContents(bosses).map((boss) => (
                                        <SelectItem key={boss.key}>{boss.name}</SelectItem>
                                    ))}
                                </Select>
                                <Select
                                    isRequired
                                    label="난이도"
                                    placeholder="난이도 선택"
                                    radius="sm"
                                    selectedKeys={difficulty}
                                    onSelectionChange={setDifficulty}
                                    className={clsx(
                                        "mb-2",
                                        Array.from(raid)[0] && !isEtc ? 'block' : 'hidden'
                                    )}>
                                    {Array.from(raid)[0] ? getWeekDifficultys(bosses, Array.from(raid)[0].toString()).map((difficulty) => (
                                        <SelectItem key={difficulty.key}>{difficulty.name}</SelectItem>
                                    )) : <></>}
                                </Select>
                                <DatePicker
                                    isRequired
                                    label="일정 날짜"
                                    radius="sm"
                                    showMonthAndYearPickers
                                    defaultValue={selectDate}
                                    startContent={<CalendarIcon/>}
                                    onChange={setSelectDate}
                                    className="mb-2"/>
                                <Textarea
                                    label="메모"
                                    radius="sm"
                                    minRows={3}
                                    value={memo}
                                    placeholder="메모를 입력하세요."
                                    onValueChange={setMemo}/>
                            </ModalBody>
                            <ModalFooter>
                                <Button
                                    fullWidth
                                    color="primary"
                                    size="lg"
                                    isLoading={isLoadingButton}
                                    onPress={async () => {
                                        await handleSubmitCalendar(title, raid, difficulty, selectDate, isTypeGuild, isEtc, memo, onClose, bosses, setLoadingButton, works, setWorks, guild, setGuild);
                                    }}>
                                    추가
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </>
    )
}