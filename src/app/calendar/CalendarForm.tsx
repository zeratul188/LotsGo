import { useEffect, useMemo, useState } from "react";
import {
    Calendar,
    formatDatetoString,
    formatHours,
    formatKoreanDate,
    getCalendarByDay,
    getCalendarByPartyDay,
    getCalendarByPartyWorks,
    getCalendarDates,
    getCalendarByWeek as getWeekCalendars,
    Guild,
    handleEditMemo,
    handleRemoveCalendar,
    handleSubmitCalendar,
    initialWeekData,
    isTodayDate,
} from "./calendarFeat";
import { Boss } from "../api/checklist/boss/route";
import { RaidWork } from "../raids/model/types";
import { getBossesById, getTextColorByDifficulty, getWeekContents } from "../checklist/lib/checklistFeat";
import { SetStateFn } from "@/utiils/utils";
import CalendarIcon from "@/Icons/CalendarIcon";
import {
    Button,
    Chip,
    Checkbox,
    DatePicker,
    Divider,
    Input,
    Link,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    Popover,
    PopoverContent,
    PopoverTrigger,
    Select,
    SelectItem,
    Selection,
    Textarea,
    Tooltip,
    useDisclosure,
} from "@heroui/react";
import { DateValue, getLocalTimeZone, now } from "@internationalized/date";
import clsx from "clsx";

export function useCalendarForm() {
    const [guild, setGuild] = useState<Guild | null>(null);
    const [works, setWorks] = useState<Calendar[]>([]);
    const [partyWorks, setPartyWorks] = useState<RaidWork[]>([]);
    const [bosses, setBosses] = useState<Boss[]>([]);
    const [isLoading, setLoading] = useState(true);
    const [resetWorks, setResetWorks] = useState(false);
    const [resetGuild, setResetGuild] = useState(false);
    const [isLogined, setLogined] = useState(false);

    return {
        guild, setGuild,
        bosses, setBosses,
        isLoading, setLoading,
        works, setWorks,
        partyWorks, setPartyWorks,
        resetWorks, setResetWorks,
        resetGuild, setResetGuild,
        isLogined, setLogined,
    };
}

export type WeekBox = {
    date: Date;
    calendar: Calendar[];
};

export type ShowWeek = {
    type: string;
    calendar: Calendar;
};

type ScheduleItem =
    | { type: "work" | "guild"; calendar: Calendar }
    | { type: "party"; work: RaidWork };

const TYPE_META = {
    work: { label: "개인", color: "primary", dot: "bg-primary", border: "border-primary/40", surface: "bg-primary/5" },
    guild: { label: "길드", color: "secondary", dot: "bg-secondary", border: "border-secondary/40", surface: "bg-secondary/5" },
    party: { label: "파티", color: "warning", dot: "bg-warning", border: "border-warning/40", surface: "bg-warning/5" },
} as const;

function toScheduleItem(item: ShowWeek): ScheduleItem {
    return { type: item.type === "guild" ? "guild" : "work", calendar: item.calendar };
}

function scheduleTitle(item: ScheduleItem) {
    return item.type === "party" ? item.work.name : item.calendar.name;
}

function scheduleDate(item: ScheduleItem) {
    return item.type === "party" ? item.work.date : item.calendar.date;
}

function ScheduleDetails({
    item,
    bosses,
    guild,
    works,
    setWorks,
    setGuild,
}: {
    item: ScheduleItem;
    bosses: Boss[];
    guild: Guild | null;
    works: Calendar[];
    setWorks: SetStateFn<Calendar[]>;
    setGuild: SetStateFn<Guild | null>;
}) {
    const [editMemo, setEditMemo] = useState(item.type === "party" ? "" : item.calendar.memo);
    const [isLoadingMemo, setLoadingMemo] = useState(false);
    const [isLoadingDelete, setLoadingDelete] = useState(false);
    const meta = TYPE_META[item.type];

    useEffect(() => {
        setEditMemo(item.type === "party" ? "" : item.calendar.memo);
    }, [item]);

    return (
        <div className="w-[min(360px,calc(100vw-2rem))] p-1 sm:p-2">
            <div className="flex items-center gap-2 pb-3">
                <span className={clsx("h-3 w-3 rounded-full", meta.dot)} />
                <Chip size="sm" variant="flat" color={meta.color}>{meta.label} 일정</Chip>
            </div>
            <Divider />
            <dl className="space-y-3 py-3 text-sm">
                <div>
                    <dt className="text-xs text-default-500">제목</dt>
                    <dd className="mt-1 truncate font-medium">{scheduleTitle(item)}</dd>
                </div>
                {item.type === "party" && (
                    <>
                        <div>
                            <dt className="text-xs text-default-500">파티명</dt>
                            <dd className="mt-1 truncate">{item.work.raidName}</dd>
                        </div>
                        <div>
                            <dt className="text-xs text-default-500">콘텐츠</dt>
                            <dd className="mt-2 flex flex-wrap gap-1">
                                {item.work.stages.map((stage, index) => stage.difficulty === "선택안함" ? null : (
                                    <Chip key={index} size="sm" radius="sm" variant="flat" color={getTextColorByDifficulty(stage.difficulty)}>
                                        {stage.difficulty} {stage.stage}관
                                    </Chip>
                                ))}
                            </dd>
                        </div>
                    </>
                )}
                {item.type !== "party" && item.calendar.raidname && (
                    <div>
                        <dt className="text-xs text-default-500">콘텐츠</dt>
                        <dd className="mt-1 truncate">{item.calendar.raidname}</dd>
                    </div>
                )}
                <div>
                    <dt className="text-xs text-default-500">날짜 및 시간</dt>
                    <dd className="mt-1">{formatDatetoString(scheduleDate(item))}</dd>
                </div>
            </dl>
            {item.type !== "party" && (
                <>
                    <Textarea
                        label="메모"
                        radius="sm"
                        minRows={3}
                        value={editMemo}
                        placeholder="메모를 입력하세요."
                        onValueChange={setEditMemo}
                    />
                    <div className="mt-4 grid grid-cols-2 gap-2">
                        <Button
                            color="primary"
                            size="sm"
                            isLoading={isLoadingMemo}
                            onPress={async () => handleEditMemo(editMemo, item.type === "guild", setLoadingMemo, guild, works, item.calendar, setWorks, setGuild)}
                        >메모 수정</Button>
                        <Button
                            color="danger"
                            variant="flat"
                            size="sm"
                            isLoading={isLoadingDelete}
                            onPress={async () => handleRemoveCalendar(item.type === "guild", setLoadingDelete, guild, works, item.calendar, setWorks, setGuild)}
                        >삭제</Button>
                    </div>
                </>
            )}
        </div>
    );
}

function ScheduleRow({
    item,
    bosses,
    guild,
    works,
    setWorks,
    setGuild,
    compact = false,
}: {
    item: ScheduleItem;
    bosses: Boss[];
    guild: Guild | null;
    works: Calendar[];
    setWorks: SetStateFn<Calendar[]>;
    setGuild: SetStateFn<Guild | null>;
    compact?: boolean;
}) {
    const meta = TYPE_META[item.type];
    const title = scheduleTitle(item);
    return (
        <Popover placement="bottom-start" radius="lg" showArrow>
            <PopoverTrigger>
                <button
                    type="button"
                    className={clsx(
                        "group flex w-full min-w-0 cursor-pointer items-center gap-2 rounded-lg border px-3 text-left transition hover:-translate-y-px hover:shadow-sm",
                        compact ? "h-8 py-1" : "min-h-12 py-2",
                        meta.border,
                        meta.surface,
                    )}
                >
                    <span className={clsx("h-2.5 w-2.5 shrink-0 rounded-full", meta.dot)} />
                    <span className="min-w-0 flex-1 truncate text-sm font-medium">{title}</span>
                    {!compact && item.type === "party" && <span className="hidden truncate text-xs text-default-500 sm:block">{getBossesById(bosses, item.work.content)?.name}</span>}
                    <span className={clsx("shrink-0 text-xs text-default-500", compact && "hidden")}>{formatHours(scheduleDate(item))}</span>
                </button>
            </PopoverTrigger>
            <PopoverContent>
                <ScheduleDetails item={item} bosses={bosses} guild={guild} works={works} setWorks={setWorks} setGuild={setGuild} />
            </PopoverContent>
        </Popover>
    );
}

type WeekComponentProps = {
    works: Calendar[];
    partyWorks: RaidWork[];
    guild: Guild | null;
    bosses: Boss[];
    setWorks: SetStateFn<Calendar[]>;
    setGuild: SetStateFn<Guild | null>;
    isLogined: boolean;
};

export function WeekComponent({ works, partyWorks, guild, bosses, setWorks, setGuild, isLogined }: WeekComponentProps) {
    const [weeks, setWeeks] = useState<WeekBox[]>([]);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [visibleTypes, setVisibleTypes] = useState<Record<"work" | "guild" | "party", boolean>>({ work: true, guild: true, party: true });
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const [title, setTitle] = useState("");
    const [raid, setRaid] = useState<Selection>(new Set([]));
    const [selectDate, setSelectDate] = useState<DateValue | null>(now(getLocalTimeZone()));
    const [isTypeGuild, setTypeGuild] = useState(false);
    const [isEtc, setEtc] = useState(false);
    const [memo, setMemo] = useState("");
    const [isLoadingButton, setLoadingButton] = useState(false);

    useEffect(() => {
        initialWeekData(works, guild, setWeeks);
    }, [works, guild]);

    useEffect(() => {
        if (!weeks.length) return;
        const today = weeks.find((week) => isTodayDate(week.date));
        setSelectedDate((current) => current ?? today?.date ?? weeks[0].date);
    }, [weeks]);

    const selectedWeek = weeks.find((week) => selectedDate && week.date.toDateString() === selectedDate.toDateString());
    const selectedItems = useMemo(() => {
        if (!selectedWeek) return [];
        const calendarItems = getWeekCalendars(selectedWeek, works, guild).map(toScheduleItem);
        const partyItems = getCalendarByPartyWorks(selectedWeek, partyWorks).map((work) => ({ type: "party" as const, work }));
        return [...calendarItems, ...partyItems]
            .filter((item) => visibleTypes[item.type])
            .sort((a, b) => scheduleDate(a).getTime() - scheduleDate(b).getTime());
    }, [selectedWeek, works, guild, partyWorks, visibleTypes]);

    const toggleType = (type: "work" | "guild" | "party") => setVisibleTypes((current) => ({ ...current, [type]: !current[type] }));

    return (
        <section className="space-y-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Schedule</p>
                    <h1 className="mt-1 text-2xl font-bold sm:text-3xl">일정 관리</h1>
                    <p className="mt-1 text-sm text-default-500">개인·길드·파티 일정을 한곳에서 확인하세요.</p>
                </div>
                <Tooltip showArrow content={isLogined ? "새 일정을 추가합니다." : "로그인 후 일정 추가가 가능합니다."}>
                    <span className="w-full sm:w-auto">
                        <Button color="primary" radius="lg" className="w-full px-6 sm:w-auto" isDisabled={!isLogined} onPress={onOpen}>일정 추가</Button>
                    </span>
                </Tooltip>
            </div>

            <div className="flex flex-col gap-3 rounded-2xl border border-divider bg-content1 p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4">
                <div className="flex flex-wrap gap-2" aria-label="일정 유형 필터">
                    {(Object.keys(TYPE_META) as Array<"work" | "guild" | "party">).map((type) => {
                        const count = type === "party"
                            ? partyWorks.length
                            : (type === "work" ? works.length : guild?.calendars.length ?? 0);
                        return (
                            <Button
                                key={type}
                                size="sm"
                                radius="full"
                                variant={visibleTypes[type] ? "flat" : "light"}
                                color={TYPE_META[type].color}
                                onPress={() => toggleType(type)}
                                className={clsx(!visibleTypes[type] && "opacity-50")}
                            >{TYPE_META[type].label} 일정 <span className="ml-1 text-xs opacity-70">{count}</span></Button>
                        );
                    })}
                </div>
                <Button size="sm" radius="full" variant="flat" onPress={() => setSelectedDate(weeks.find((week) => isTodayDate(week.date))?.date ?? weeks[0]?.date)}>오늘</Button>
            </div>

            <div className="rounded-2xl border border-divider bg-content1 p-4 sm:p-5">
                <div className="flex items-center justify-between gap-3">
                    <div>
                        <h2 className="text-lg font-semibold">이번 주 일정</h2>
                        <p className="mt-1 text-xs text-default-500">날짜를 선택하면 해당 날짜의 일정이 표시됩니다.</p>
                    </div>
                    <Chip size="sm" variant="flat" color="primary">{selectedItems.length}개 표시</Chip>
                </div>
                <div className="mt-4 grid grid-cols-7 gap-1.5 sm:gap-2">
                    {weeks.map((week) => {
                        const isSelected = selectedDate?.toDateString() === week.date.toDateString();
                        const count = getWeekCalendars(week, works, guild).filter((item) => visibleTypes[item.type === "guild" ? "guild" : "work"]).length + (visibleTypes.party ? getCalendarByPartyWorks(week, partyWorks).length : 0);
                        return (
                            <button
                                type="button"
                                key={week.date.toISOString()}
                                onClick={() => setSelectedDate(week.date)}
                                className={clsx(
                                    "min-w-0 rounded-xl border px-1 py-2 text-center transition sm:px-2",
                                    isSelected ? "border-primary bg-primary text-primary-foreground shadow-sm" : "border-divider bg-content2 hover:border-primary/50",
                                    isTodayDate(week.date) && !isSelected && "ring-1 ring-success/60",
                                )}
                            >
                                <span className="block text-[11px] font-semibold sm:text-xs">{["일", "월", "화", "수", "목", "금", "토"][week.date.getDay()]}</span>
                                <span className="mt-0.5 block text-sm font-bold sm:text-base">{week.date.getDate()}</span>
                                <span className={clsx("mx-auto mt-1 block w-fit rounded-full px-1.5 text-[10px]", isSelected ? "bg-white/20" : "bg-default-200")}>{count}</span>
                            </button>
                        );
                    })}
                </div>
                <Divider className="my-4" />
                {selectedDate && <p className="mb-3 text-sm font-semibold">{formatKoreanDate(selectedDate)}</p>}
                {selectedItems.length ? (
                    <div className="space-y-2">
                        {selectedItems.map((item, index) => <ScheduleRow key={`${scheduleTitle(item)}-${index}`} item={item} bosses={bosses} guild={guild} works={works} setWorks={setWorks} setGuild={setGuild} />)}
                    </div>
                ) : (
                    <div className="rounded-xl border border-dashed border-divider px-4 py-8 text-center text-sm text-default-500">등록된 일정이 없습니다.</div>
                )}
            </div>

            <AddCalendarModal
                isOpen={isOpen}
                onOpenChange={onOpenChange}
                title={title}
                setTitle={setTitle}
                raid={raid}
                setRaid={setRaid}
                selectDate={selectDate}
                setSelectDate={setSelectDate}
                isTypeGuild={isTypeGuild}
                setTypeGuild={setTypeGuild}
                isEtc={isEtc}
                setEtc={setEtc}
                memo={memo}
                setMemo={setMemo}
                isLoadingButton={isLoadingButton}
                setLoadingButton={setLoadingButton}
                bosses={bosses}
                works={works}
                guild={guild}
                setWorks={setWorks}
                setGuild={setGuild}
            />
        </section>
    );
}

function AddCalendarModal({
    isOpen, onOpenChange, title, setTitle, raid, setRaid, selectDate, setSelectDate, isTypeGuild, setTypeGuild, isEtc, setEtc, memo, setMemo, isLoadingButton, setLoadingButton, bosses, works, guild, setWorks, setGuild,
}: {
    isOpen: boolean;
    onOpenChange: () => void;
    title: string;
    setTitle: SetStateFn<string>;
    raid: Selection;
    setRaid: SetStateFn<Selection>;
    selectDate: DateValue | null;
    setSelectDate: SetStateFn<DateValue | null>;
    isTypeGuild: boolean;
    setTypeGuild: SetStateFn<boolean>;
    isEtc: boolean;
    setEtc: SetStateFn<boolean>;
    memo: string;
    setMemo: SetStateFn<string>;
    isLoadingButton: boolean;
    setLoadingButton: SetStateFn<boolean>;
    bosses: Boss[];
    works: Calendar[];
    guild: Guild | null;
    setWorks: SetStateFn<Calendar[]>;
    setGuild: SetStateFn<Guild | null>;
}) {
    return (
        <Modal
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            placement="center"
            size="lg"
            scrollBehavior="inside"
            backdrop="blur"
            classNames={{
                base: "rounded-2xl border border-divider bg-content1 shadow-2xl",
                header: "border-b border-divider px-5 py-4",
                body: "gap-5 px-5 py-5",
                footer: "border-t border-divider px-5 py-4",
            }}
            onClose={() => {
            setTitle(""); setRaid(new Set([])); setSelectDate(now(getLocalTimeZone())); setTypeGuild(false); setEtc(false); setMemo("");
        }}>
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader className="flex flex-col gap-1">일정 추가<span className="text-sm font-normal text-default-500">새 일정의 유형과 시간을 설정하세요.</span></ModalHeader>
                        <ModalBody className="gap-4">
                            <Input isRequired label="제목" radius="lg" placeholder="일정 제목을 2~20글자 내로 입력하세요." value={title} onValueChange={setTitle} />
                            <div className="grid grid-cols-2 gap-2">
                                <Checkbox isSelected={!isTypeGuild} onValueChange={() => setTypeGuild(false)} classNames={{ base: "m-0 max-w-none rounded-xl border border-divider p-3 data-[selected=true]:border-primary", label: "w-full" }}>개인 일정</Checkbox>
                                <Checkbox isSelected={isTypeGuild} onValueChange={() => setTypeGuild(true)} classNames={{ base: "m-0 max-w-none rounded-xl border border-divider p-3 data-[selected=true]:border-secondary", label: "w-full" }}>길드 일정</Checkbox>
                            </div>
                            <Checkbox isSelected={isEtc} onValueChange={setEtc}>콘텐츠 없이 등록</Checkbox>
                            {!isEtc && (
                                <Select isRequired label="콘텐츠" placeholder="콘텐츠 선택" radius="lg" selectedKeys={raid} onSelectionChange={setRaid}>
                                    {getWeekContents(bosses, [], -1).map((boss) => <SelectItem key={boss.key}>{boss.name}</SelectItem>)}
                                </Select>
                            )}
                            <DatePicker isRequired label="일정 날짜" radius="lg" showMonthAndYearPickers value={selectDate} startContent={<CalendarIcon />} onChange={setSelectDate} />
                            <Textarea label="메모" radius="lg" minRows={3} value={memo} placeholder="메모를 입력하세요." onValueChange={setMemo} />
                        </ModalBody>
                        <ModalFooter>
                            <Button fullWidth color="primary" size="lg" radius="lg" isLoading={isLoadingButton} onPress={async () => handleSubmitCalendar(title, raid, selectDate, isTypeGuild, isEtc, memo, onClose, bosses, setLoadingButton, works, setWorks, guild, setGuild)}>일정 추가</Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
}

type BigComponentProps = {
    works: Calendar[];
    partyWorks: RaidWork[];
    bosses: Boss[];
    guild: Guild | null;
    setWorks: SetStateFn<Calendar[]>;
    setGuild: SetStateFn<Guild | null>;
};

export default function BigComponent({ works, partyWorks, bosses, guild, setWorks, setGuild }: BigComponentProps) {
    const today = new Date();
    const [year, setYear] = useState(today.getFullYear());
    const [month, setMonth] = useState(today.getMonth());
    const [selectedDate, setSelectedDate] = useState<Date | null>(today);
    const dates = useMemo(() => getCalendarDates(year, month), [year, month]);
    const shiftMonth = (amount: number) => {
        const next = new Date(year, month + amount, 1);
        setYear(next.getFullYear());
        setMonth(next.getMonth());
    };
    const selectedItems = selectedDate
        ? [...getCalendarByDay(selectedDate, works, guild).map(toScheduleItem), ...getCalendarByPartyDay(selectedDate, partyWorks).map((work) => ({ type: "party" as const, work }))]
        : [];

    return (
        <section className="mt-8 space-y-4 pb-8">
            <div className="flex flex-col gap-3 rounded-2xl border border-divider bg-content1 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2">
                    <Button isIconOnly size="md" radius="full" variant="flat" aria-label="이전 달" className="text-xl font-bold" onPress={() => shiftMonth(-1)}>‹</Button>
                    <button type="button" className="min-w-[150px] text-center text-lg font-bold hover:text-primary" onClick={() => { setYear(today.getFullYear()); setMonth(today.getMonth()); }}>{year}년 {month + 1}월</button>
                    <Button isIconOnly size="md" radius="full" variant="flat" aria-label="다음 달" className="text-xl font-bold" onPress={() => shiftMonth(1)}>›</Button>
                </div>
                <Button size="sm" radius="full" variant="flat" onPress={() => { setYear(today.getFullYear()); setMonth(today.getMonth()); setSelectedDate(today); }}>오늘</Button>
            </div>
            <div className="grid grid-cols-7 gap-1.5 text-center sm:gap-2">
                {["일", "월", "화", "수", "목", "금", "토"].map((day) => <div key={day} className="py-1 text-xs font-semibold text-default-500">{day}</div>)}
                {dates.map((date, index) => {
                    const calendarItems = getCalendarByDay(date, works, guild).map(toScheduleItem);
                    const partyItems = getCalendarByPartyDay(date, partyWorks).map((work) => ({ type: "party" as const, work }));
                    const items = [...calendarItems, ...partyItems];
                    const isSelected = selectedDate?.toDateString() === date.toDateString();
                    const isCurrentMonth = date.getMonth() === month;
                    return (
                        <div
                            role="button"
                            tabIndex={0}
                            key={`${date.toISOString()}-${index}`}
                            onClick={() => setSelectedDate(date)}
                            onKeyDown={(event) => {
                                if (event.key === "Enter" || event.key === " ") setSelectedDate(date);
                            }}
                            className={clsx(
                                "min-h-[88px] min-w-0 rounded-xl border p-1.5 text-left transition sm:min-h-[132px] sm:p-2",
                                isCurrentMonth ? "bg-content1" : "bg-content2/40 text-default-400",
                                isSelected ? "border-primary ring-1 ring-primary/40" : "border-divider hover:border-primary/50",
                                isTodayDate(date) && !isSelected && "bg-success/5",
                            )}
                        >
                            <span className={clsx("inline-flex h-6 min-w-6 items-center justify-center rounded-full px-1 text-xs font-semibold", isTodayDate(date) && "bg-success text-white")}>{date.getDate()}</span>
                            <div className="mt-1 space-y-1">
                                {items.slice(0, 2).map((item, itemIndex) => <ScheduleRow key={`${scheduleTitle(item)}-${itemIndex}`} item={item} bosses={bosses} guild={guild} works={works} setWorks={setWorks} setGuild={setGuild} compact />)}
                                {items.length > 2 && <span className="block px-1 text-[11px] font-medium text-primary">+{items.length - 2}개</span>}
                            </div>
                        </div>
                    );
                })}
            </div>
            <div className="rounded-2xl border border-divider bg-content1 p-4 sm:hidden">
                <div className="mb-3 text-sm font-semibold">{selectedDate ? formatKoreanDate(selectedDate) : "날짜를 선택하세요"}</div>
                {selectedItems.length ? <div className="space-y-2">{selectedItems.map((item, index) => <ScheduleRow key={`${scheduleTitle(item)}-${index}`} item={item} bosses={bosses} guild={guild} works={works} setWorks={setWorks} setGuild={setGuild} />)}</div> : <p className="text-sm text-default-500">등록된 일정이 없습니다.</p>}
            </div>
        </section>
    );
}

export function NotLoginedComponent() {
    return (
        <div className="mx-auto min-h-[calc(100vh-65px)] w-full max-w-[720px] px-5 py-16 text-center sm:py-28">
            <Chip color="primary" variant="flat">Calendar</Chip>
            <h2 className="mt-4 text-2xl font-bold sm:text-4xl">일정 관리 기능은 로그인 이후 이용 가능합니다.</h2>
            <p className="mt-4 text-sm leading-7 text-default-500 sm:text-base">개인 일정과 길드 일정을 한눈에 확인하고, 주간 콘텐츠 일정을 효율적으로 관리할 수 있습니다.</p>
            <Button as={Link} href="/login" color="primary" radius="lg" size="lg" className="mt-8">로그인 이동</Button>
            <Divider className="my-10" />
            <div className="grid gap-3 text-left sm:grid-cols-3">
                {[["🗓", "개인 일정", "기억해야 할 일정을 기록합니다."], ["👥", "길드 일정", "길드원과 공유되는 일정을 확인합니다."], ["🧹", "자동 관리", "지난 일정은 자동으로 정리합니다."]].map(([icon, title, description]) => <div key={title} className="rounded-2xl border border-divider p-4"><span>{icon}</span><p className="mt-2 font-semibold">{title}</p><p className="mt-1 text-sm text-default-500">{description}</p></div>)}
            </div>
        </div>
    );
}
