import { useEffect, useState } from "react";
import { Boss } from "../api/checklist/boss/route";
import { Calendar, formatDatetoString, formatHours, formatKoreanDate, getCalendarByWeek, Guild, handleEditMemo, handleSubmitCalendar, initialWeekData } from "./calendarFeat";
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
    Textarea,
    Popover,
    PopoverTrigger,
    PopoverContent
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
    const [resetWorks, setResetWorks] = useState(false);
    const [resetGuild, setResetGuild] = useState(false);

    return {
        guild, setGuild,
        bosses, setBosses,
        isLoading, setLoading,
        works, setWorks,
        resetWorks, setResetWorks,
        resetGuild, setResetGuild
    }
}

// 주간 일정 컴포넌트
export type WeekBox = {
    date: Date,
    calendar: Calendar[]
}
export type ShowWeek = {
    type: string,
    calendar: Calendar
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
    const [editMemo, setEditMemo] = useState('');
    const [isLoadingMemo, setLoadingMemo] = useState(false);

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
                <div className="h-full hidden lg1200:grid grid-cols-7 gap-2">
                    {weeks.map((week, index) => (
                        <div key={index} className={clsx(
                            index > 0 ? 'border-l-1 border-gray-200 dark:border-[#2a2a2a] pl-3' : ''
                        )}>
                            <Chip
                                size="sm"
                                variant="flat"
                                radius="sm"
                                color="primary"
                                className="min-w-full text-center">
                                {formatKoreanDate(week.date)}
                            </Chip>
                            <div className="w-full max-h-[260px] h-[260px] overflow-y-scroll scrollbar-hide mt-2">
                                {getCalendarByWeek(week, works, guild).map((box, idx) => (
                                    <Popover 
                                        key={idx} 
                                        radius="sm" 
                                        showArrow
                                        onOpenChange={() => {
                                            setEditMemo(box.calendar.memo);
                                        }}>
                                        <PopoverTrigger>
                                            <div className={clsx(
                                                "rounded-md border-2 pl-2 pr-2 pt-1 pb-1 mb-2 cursor-pointer",
                                                box.type === 'work' ? 'border-[#75a0d1] dark:border-[#298cfd] hover:bg-[#f0f1f3] hover:dark:bg-[#242f3b]' : 'border-[#b575c2] dark:border-[#c129fd] hover:bg-[#ece7ec] hover:dark:bg-[#301f36]'
                                            )}>
                                                <div className="w-full flex gap-2 items-center mb-1">
                                                    <div className={clsx(
                                                        "w-[12px] h-[12px] rounded-full",
                                                        box.type === 'work' ? 'bg-[#0055b6] dark:bg-[#298cfd]' : 'bg-[#9800b6] dark:bg-[#c129fd]'
                                                    )}/>
                                                    <p className="text-[9pt] fadedtext grow">{box.type === 'work' ? '개인 일정' : '길드 일정'}</p>
                                                    <p className="truncate text-[9pt] fadedtext">{formatHours(box.calendar.date)}</p>
                                                </div>
                                                <p className="w-full truncate text-sm">{box.calendar.name}</p>
                                            </div>
                                        </PopoverTrigger>
                                        <PopoverContent>
                                            <div className="w-[300px]">
                                                <div className="w-full flex gap-2 items-center mb-2 mt-2">
                                                    <div className={clsx(
                                                        "w-[16px] h-[16px] rounded-full",
                                                        box.type === 'work' ? 'bg-[#0055b6] dark:bg-[#298cfd]' : 'bg-[#9800b6] dark:bg-[#c129fd]'
                                                    )}/>
                                                    <p className="text-[12pt] fadedtext">{box.type === 'work' ? '개인 일정' : '길드 일정'}</p>
                                                </div>
                                                <Divider className="mb-1"/>
                                                <p className="text-sm fadedtext">제목</p>
                                                <p className="truncate mb-2">{box.calendar.name}</p>
                                                <div className={clsx(
                                                    box.calendar.raidname !== '' && box.calendar.difficulty !== '' ? 'block' : 'hidden'
                                                )}>
                                                    <p className="text-sm fadedtext">콘텐츠</p>
                                                    <p className="truncate mb-2">{box.calendar.raidname} {box.calendar.difficulty}</p>
                                                </div>
                                                <p className="text-sm fadedtext">날짜 및 시간</p>
                                                <p className="truncate mb-2">{formatDatetoString(box.calendar.date)}</p>
                                                <Textarea
                                                    label="메모"
                                                    radius="sm"
                                                    minRows={3}
                                                    value={editMemo}
                                                    placeholder="메모를 입력하세요."
                                                    onValueChange={setEditMemo}/>
                                                <Divider className="mb-4 mt-4"/>
                                                <div className="w-full grid grid-cols-2 gap-2 mb-2">
                                                    <Button
                                                        color="success"
                                                        size="sm"
                                                        isLoading={isLoadingMemo}
                                                        onPress={async () => {
                                                            await handleEditMemo(editMemo, idx, box.type !== 'work', setLoadingMemo, guild, works, box.calendar, setWorks, setGuild);
                                                        }}>
                                                        메모 수정
                                                    </Button>
                                                    <Button
                                                        color="danger"
                                                        size="sm">
                                                        삭제
                                                    </Button>
                                                </div>
                                            </div>
                                        </PopoverContent>
                                    </Popover>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
                <div className="w-full h-full flex lg1200:hidden gap-2 overflow-x-scroll scrollbar-hide">
                    {weeks.map((week, index) => (
                        <div key={index} className={clsx(
                            "min-w-[180px]",
                            index > 0 ? 'border-l-1 border-gray-200 dark:border-[#2a2a2a] pl-3' : ''
                        )}>
                            <Chip
                                size="sm"
                                variant="flat"
                                radius="sm"
                                color="primary"
                                className="min-w-full text-center">
                                {formatKoreanDate(week.date)}
                            </Chip>
                            <div className="w-full max-h-[260px] h-[260px] overflow-y-scroll scrollbar-hide mt-2">
                                {getCalendarByWeek(week, works, guild).map((box, idx) => (
                                    <Popover 
                                        key={idx} 
                                        radius="sm" 
                                        showArrow
                                        onOpenChange={() => {
                                            setEditMemo(box.calendar.memo);
                                        }}>
                                        <PopoverTrigger>
                                            <div className={clsx(
                                                "rounded-md border-2 pl-2 pr-2 pt-1 pb-1 mb-2 cursor-pointer",
                                                box.type === 'work' ? 'border-[#75a0d1] dark:border-[#298cfd] hover:bg-[#f0f1f3] hover:dark:bg-[#242f3b]' : 'border-[#b575c2] dark:border-[#c129fd] hover:bg-[#ece7ec] hover:dark:bg-[#301f36]'
                                            )}>
                                                <div className="w-full flex gap-2 items-center mb-1">
                                                    <div className={clsx(
                                                        "w-[12px] h-[12px] rounded-full",
                                                        box.type === 'work' ? 'bg-[#0055b6] dark:bg-[#298cfd]' : 'bg-[#9800b6] dark:bg-[#c129fd]'
                                                    )}/>
                                                    <p className="text-[9pt] fadedtext grow">{box.type === 'work' ? '개인 일정' : '길드 일정'}</p>
                                                    <p className="truncate text-[9pt] fadedtext">{formatHours(box.calendar.date)}</p>
                                                </div>
                                                <p className="w-full truncate text-sm">{box.calendar.name}</p>
                                            </div>
                                        </PopoverTrigger>
                                        <PopoverContent>
                                            <div className="w-[300px]">
                                                <div className="w-full flex gap-2 items-center mb-2 mt-2">
                                                    <div className={clsx(
                                                        "w-[16px] h-[16px] rounded-full",
                                                        box.type === 'work' ? 'bg-[#0055b6] dark:bg-[#298cfd]' : 'bg-[#9800b6] dark:bg-[#c129fd]'
                                                    )}/>
                                                    <p className="text-[12pt] fadedtext">{box.type === 'work' ? '개인 일정' : '길드 일정'}</p>
                                                </div>
                                                <Divider className="mb-1"/>
                                                <p className="text-sm fadedtext">제목</p>
                                                <p className="truncate mb-2">{box.calendar.name}</p>
                                                <div className={clsx(
                                                    box.calendar.raidname !== '' && box.calendar.difficulty !== '' ? 'block' : 'hidden'
                                                )}>
                                                    <p className="text-sm fadedtext">콘텐츠</p>
                                                    <p className="truncate mb-2">{box.calendar.raidname} {box.calendar.difficulty}</p>
                                                </div>
                                                <p className="text-sm fadedtext">날짜 및 시간</p>
                                                <p className="truncate mb-2">{formatDatetoString(box.calendar.date)}</p>
                                                <Textarea
                                                    label="메모"
                                                    radius="sm"
                                                    minRows={3}
                                                    value={editMemo}
                                                    placeholder="메모를 입력하세요."
                                                    onValueChange={setEditMemo}/>
                                                <Divider className="mb-4 mt-4"/>
                                                <div className="w-full grid grid-cols-2 gap-2 mb-2">
                                                    <Button
                                                        color="success"
                                                        size="sm">
                                                        메모 수정
                                                    </Button>
                                                    <Button
                                                        color="danger"
                                                        size="sm">
                                                        삭제
                                                    </Button>
                                                </div>
                                            </div>
                                        </PopoverContent>
                                    </Popover>
                                ))}
                            </div>
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