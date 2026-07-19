import { 
    Accordion,
    AccordionItem,
    Card, CardBody, CardFooter, CardHeader, 
    Chip, 
    Input, 
    Pagination, 
    Progress, 
    Select, 
    SelectItem, 
    Tab, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow, Tabs,
    Tooltip,
} from "@heroui/react"
import { Raid, RemainCharacter } from "../model/types";
import React, { Key, useEffect, useMemo, useRef, useState } from "react"
import { ChecklistContent, RaidMember } from "@/app/api/raids/members/route"
import { LoadingComponent } from "@/app/UtilsCompnents"
import { 
    getAllGoldByMember, 
    getAllGoldByMemberCharacter, 
    getCharacterByMain, 
    getCompleteBoundGoldByMember, 
    getCompleteGoldByMemberCharacter, 
    getCompleteSharedGoldByMember, 
    getHaveGoldByMember, 
    getRemainContents, 
    getRemainContentsByCharacter, 
    isCompleteContent, 
    loadPartyData 
} from "../lib/partyFeat"
import { Boss } from "@/app/api/checklist/boss/route"
import LeaderIcon from "@/Icons/LeaderIcon"
import clsx from "clsx"
import { getBackgroundByStage, getSimpleBossName } from "@/app/checklist/lib/checklistFeat"
import { PartyRaidsComponent } from "./RaidsForm"
import { AppDispatch, RootState } from "@/app/store/store"
import { useSelector } from "react-redux"
import { PartySettingComponent } from "./SettingFrom";
import { ShieldSecurityIcon } from "@/Icons/ShieldSecurityIcon";
import CheckIcon from "@/Icons/CheckIcon";
import { useMobileQuery } from "@/utiils/utils";
import JobEmblemIcon from "@/Icons/JobEmblemIcon";
import JobAvatar from "@/Icons/JobAvatar";
import dynamic from "next/dynamic";
import { CalendarComponent } from "./CalendarForm";
const FixedLineAd = dynamic(() => import("@/app/ad/FixedLineAd"), { ssr: false });

const PAGE_SIZE = 10;

const partyTabItems = [
    { key: 'home', label: '숙제', description: '멤버별 진행 현황' },
    { key: 'party', label: '파티 모집', description: '레이드 파티 관리' },
    { key: 'calendar', label: '일정표', description: '주간 일정 공유' },
    { key: 'setting', label: '설정', description: '파티 정보 관리' }
] as const;

// 홈 컴포넌트
type ChecklistComponentProps = {
    members: RaidMember[],
    bosses: Boss[],
    party: Raid
}
function ChecklistComponent({ members, bosses, party }: ChecklistComponentProps) {
    const isMobile = useMobileQuery();
    const [results, setResults] = useState<RaidMember[]>([]);
    const [search, setSearch] = useState('');

    useEffect(() => {
        const list: RaidMember[] = [];
        members.forEach(member => {
            if (member.nickname.includes(search)) {
                list.push(member);
            } else {
                for (const character of member.expeditions) {
                    if (character.nickname.includes(search)) {
                        list.push(member);
                        break;
                    }
                }
            }
        });
        setResults(list);
    }, [members, search]);

    return (
        <div className="w-full pt-5">
            {isMobile ? null : (
                <div className="w-full flex justify-center overflow-hidden mb-4">
                    <div className="mx-4 flex w-full max-w-[1240px] justify-center rounded-2xl border border-gray-200/80 bg-gray-50/80 p-4 dark:border-white/10 dark:bg-white/[0.035]">
                        <FixedLineAd isLoaded={true}/>
                    </div>
                </div>
            )}
            <div className="flex w-full flex-col items-start gap-3 rounded-2xl border border-gray-200/80 bg-white p-3 shadow-sm dark:border-white/10 dark:bg-[#171717] sm:flex-row sm:items-center sm:p-4">
                <Input
                    radius="sm"
                    label="검색"
                    placeholder="캐릭터 명 입력"
                    value={search}
                    onValueChange={setSearch}
                    maxLength={12}
                    className="w-full sm:w-[320px]"/>
                <div className="flex w-full items-center justify-between rounded-xl bg-gray-50/80 px-3 py-2 dark:bg-white/[0.04] sm:w-auto sm:min-w-[150px]">
                    <p className="text-[10pt] fadedtext">검색 결과</p>
                    <p className="text-lg font-bold tabular-nums">{results.length}</p>
                </div>
            </div>
            <div className="mt-4 flex w-full flex-col">
                {results.map((member, index) => <MemberComponent key={index} index={index} member={member} bosses={bosses} party={party}/>)}
            </div>
        </div>
    )
}

// 한 맴버 구성 컴포넌트
type MemberComponentProps = {
    index: number,
    member: RaidMember,
    bosses: Boss[],
    party: Raid
}
function MemberComponent({ index, member, bosses, party }: MemberComponentProps) {
    const [page, setPage] = useState(1);
    const [tabKey, setTabKey] = useState<Key>('homework');
    const isMobile = useMobileQuery();
    const mainCharacter = getCharacterByMain(member.expeditions, member.nickname);
    const remainContents = getRemainContents(member.checklist, bosses);
    const totalHomework = remainContents.reduce((sum, item) => sum + item.max, 0);
    const remainingHomework = remainContents.reduce((sum, item) => sum + item.remain, 0);
    const completedHomework = totalHomework - remainingHomework;
    const totalGold = getAllGoldByMember(bosses, member.checklist);
    const earnedGold = getHaveGoldByMember(bosses, member.checklist);

    const itemClasses = {
        base: "py-0 w-full",
        title: "font-normal text-medium",
        trigger: "px-3 py-0 rounded-xl min-h-14 flex items-center cursor-pointer hover:bg-gray-50 dark:hover:bg-white/[0.03]",
        indicator: "text-medium",
        content: "text-small px-0 pt-2",
    };

    return (
        <React.Fragment>
            <Card radius="lg" shadow="none" className={clsx(
                "overflow-hidden border border-gray-200/80 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.05)] dark:border-white/10 dark:bg-[#171717] dark:shadow-none",
                index !== 0 ? 'mt-5' : ''
            )}>
                <CardHeader className="p-0">
                    <div className="grid w-full grid-cols-1 gap-3 px-4 py-4 sm:px-5 md:grid-cols-[minmax(240px,1fr)_minmax(220px,0.9fr)_minmax(220px,0.9fr)] md:items-center">
                        <div className="flex min-w-0 items-center gap-3">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-gray-200/80 bg-gray-50/70 dark:border-white/10 dark:bg-white/[0.04]">
                                <JobEmblemIcon job={mainCharacter?.job ?? '-'} size={38}/>
                            </div>
                            <div className="min-w-0 grow">
                                <div className="flex min-w-0 items-center gap-2">
                                    <div className="flex min-w-0 items-center gap-2">
                                        <p className="truncate font-semibold">{mainCharacter?.nickname ?? '-'}</p>
                                        <p className="truncate text-[9pt] fadedtext">{member.id}</p>
                                    </div>
                                    <Tooltip showArrow content="파티장">
                                        <div className={clsx(
                                            "text-yellow-600 dark:text-yellow-400",
                                            party.managerId === member.id ? '' : 'hidden'
                                        )}><LeaderIcon size={12}/></div>
                                    </Tooltip>
                                </div>
                                <p className="mt-0.5 text-[10pt] fadedtext">{mainCharacter?.job ?? '-'} · Lv.{mainCharacter?.level.toLocaleString() ?? '0.00'} · 캐릭터 {member.checklist.filter(item => item.contents.length > 0).length}명</p>
                            </div>
                        </div>
                        <div className="rounded-xl border border-secondary-200/70 bg-secondary-50/40 p-3 dark:border-secondary-900/60 dark:bg-secondary-500/[0.06]">
                            <Progress
                                showValueLabel
                                label={`숙제 ${completedHomework} / ${totalHomework} 완료`}
                                size="sm"
                                color="secondary"
                                maxValue={totalHomework}
                                value={completedHomework}
                                className="w-full"/>
                            <p className="mt-2 text-[11px] fadedtext">남은 숙제 {remainingHomework}개</p>
                        </div>
                        <div className="rounded-xl border border-warning-200/70 bg-warning-50/40 p-3 dark:border-warning-900/60 dark:bg-warning-500/[0.06]">
                            <Progress
                                showValueLabel
                                label={(
                                    <div className="flex items-center">
                                        <img src="/icons/gold.png" alt="goldicon" className="h-4 w-4"/>
                                        <span className="ml-1 text-sm">{earnedGold.toLocaleString()} / {totalGold.toLocaleString()}</span>
                                    </div>
                                )}
                                size="sm"
                                color="warning"
                                maxValue={totalGold}
                                value={earnedGold}
                                className="w-full"/>
                            <p className="mt-2 text-[11px] fadedtext">획득 가능한 골드 진행률</p>
                        </div>
                    </div>
                </CardHeader>
                <CardBody className="border-t border-gray-200/80 px-3 py-2 dark:border-white/10 sm:px-4">
                    <Accordion itemClasses={itemClasses}>
                        <AccordionItem 
                            key={member.id} 
                            title="콘텐츠 별 남은 콘텐츠"
                            startContent={<ShieldSecurityIcon/>}>
                            <RemainContent bosses={bosses} member={member}/>
                        </AccordionItem>
                    </Accordion>
                </CardBody>
                <CardFooter className="border-t border-gray-200/80 p-0 dark:border-white/10">
                    <div className="w-full space-y-2 px-3 py-3 sm:px-4">
                        {member.checklist.filter(item => item.contents.length > 0).slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map((item, idx) => (
                            <React.Fragment key={idx}>
                                <div className="flex w-full flex-col items-center gap-3 rounded-xl border border-gray-200/80 bg-gray-50/50 px-3 py-3 dark:border-white/10 dark:bg-white/[0.025] sm:flex-row sm:gap-5">
                                    <div className="flex min-w-full items-center gap-3 sm:min-w-[240px]">
                                        <JobAvatar size="sm" job={item.job}/>
                                        <div className="min-w-0 grow">
                                            <div className="flex items-center gap-1">
                                                <p className="truncate text-sm font-medium">{item.nickname}</p>
                                                {item.isGold ? (
                                                    <img 
                                                        src="/icons/gold.png" 
                                                        alt="goldicon"
                                                        className="w-[12px] h-[12px]"/>
                                                ) : null}
                                            </div>
                                            <p className="text-xs fadedtext">{item.job} · Lv.{item.level.toLocaleString()}</p>
                                        </div>
                                    </div>
                                    {tabKey === 'homework' ? (
                                        <div className="flex w-full grow flex-col gap-2 sm:flex-row sm:overflow-x-auto scrollbar-hide">
                                            {item.contents.map((content, contentIndex) => <ContentChip key={contentIndex} bosses={bosses} content={content} isMemberGold={item.isGold}/>)}
                                        </div>
                                    ) : (
                                        <div className="flex w-full flex-col items-center gap-3 min-[860px]:ml-auto min-[860px]:w-fit min-[860px]:flex-row">
                                            <div className="grid w-full grid-cols-3 gap-2 min-[860px]:w-[390px]">
                                                <div className="rounded-lg border border-success-200/60 bg-success-50/50 px-2.5 py-2 dark:border-success-900/50 dark:bg-success-500/[0.06]">
                                                    <p className="text-[8pt] fadedtext">거래가능 골드</p>
                                                    <div className="flex gap-1 items-center">
                                                        <img src="/icons/gold.png" alt="goldicon" className="w-[16px] h-[16px]"/>
                                                        <p className="font-medium tabular-nums">{getCompleteSharedGoldByMember(bosses, item).toLocaleString()}</p>
                                                    </div>
                                                </div>
                                                <div className="rounded-lg border border-warning-200/60 bg-warning-50/50 px-2.5 py-2 dark:border-warning-900/50 dark:bg-warning-500/[0.06]">
                                                    <p className="text-[8pt] fadedtext">귀속 골드</p>
                                                    <div className="flex gap-1 items-center">
                                                        <img src="/icons/gold.png" alt="goldicon" className="w-[16px] h-[16px]"/>
                                                        <p className="font-medium tabular-nums">{getCompleteBoundGoldByMember(bosses, item).toLocaleString()}</p>
                                                    </div>
                                                </div>
                                                <div className="rounded-lg border border-secondary-200/60 bg-secondary-50/50 px-2.5 py-2 dark:border-secondary-900/50 dark:bg-secondary-500/[0.06]">
                                                    <p className="text-[8pt] fadedtext">부수입</p>
                                                    <div className="flex gap-1 items-center">
                                                        <img src="/icons/gold.png" alt="goldicon" className="w-[16px] h-[16px]"/>
                                                        <p className="font-medium tabular-nums">{item.otherGold.toLocaleString()}</p>
                                                    </div>
                                                </div>
                                            </div>
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
                                                        <span className="ml-1 text-md">{(getCompleteGoldByMemberCharacter(bosses, item)).toLocaleString()} / {(getAllGoldByMemberCharacter(bosses, item)+item.otherGold).toLocaleString()}</span>
                                                    </div>
                                                )}
                                                showValueLabel={getAllGoldByMemberCharacter(bosses, item)+item.otherGold > 0}
                                                radius="sm"
                                                value={getCompleteGoldByMemberCharacter(bosses, item)}
                                                maxValue={getAllGoldByMemberCharacter(bosses, item)+item.otherGold}
                                                className="w-full min-[860px]:w-[220px]"/>
                                        </div>
                                    )}
                                </div>
                            </React.Fragment>
                        ))}
                        <div className="flex w-full flex-col items-end justify-center gap-3 pt-2 sm:flex-row sm:justify-start">
                            <Pagination
                                showControls
                                color="primary"
                                page={page}
                                onChange={setPage}
                                total={Math.ceil(member.checklist.filter(item => item.contents.length > 0).length / PAGE_SIZE)}/>
                            <Tabs 
                                fullWidth={isMobile}
                                radius="lg"
                                size="sm"
                                color="primary"
                                variant="light"
                                selectedKey={tabKey.toString()}
                                onSelectionChange={setTabKey}
                                classNames={{
                                    tabList: "rounded-xl border border-gray-200/80 bg-gray-100/70 p-1 dark:border-white/10 dark:bg-white/[0.04]",
                                    cursor: "rounded-lg bg-white shadow-sm dark:bg-primary-500/15",
                                    tabContent: "font-medium group-data-[selected=true]:text-primary dark:group-data-[selected=true]:text-primary-300"
                                }}>
                                <Tab key="homework" title="숙제"/>
                                <Tab key="gold" title="골드"/>
                            </Tabs>
                            <p className="ml-auto fadedtext text-[10pt] hidden sm:block">좌우 스크롤은 Shift키를 누르며 마우스 휠로 조작하세요.</p>
                        </div>
                    </div>
                </CardFooter>
            </Card>
        </React.Fragment>
    )
}

// 숙제 현황 콘텐츠 Chip
type ContentChipProps = {
    content: ChecklistContent,
    bosses: Boss[],
    isMemberGold: boolean
}
export function ContentChip({ content, bosses, isMemberGold }: ContentChipProps) {
    const scrollRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const el = scrollRef.current;
        if (!el) return;

        el.scrollLeft = el.scrollWidth;
    }, [content.items]);

    return (
        <Chip 
            size="lg"
            radius="sm"
            variant="bordered"
            color="default"
            classNames={{
                base: clsx(
                    "h-auto min-w-full border bg-transparent px-3 pb-1 pt-1.5 sm:min-w-[180px]",
                    content.items.every(item => item.isCheck)
                        ? "border-success-400 dark:border-success-500"
                        : "border-danger-400 dark:border-danger-500"
                ),
                content: "w-full min-w-0 p-0"
            }}
>
            <div className="flex w-full flex-col gap-0">
                <div className="flex min-w-0 items-center gap-1">
                    <p className="truncate text-sm font-medium">{getSimpleBossName(bosses, content.name)}</p>
                    {content.isGold && isMemberGold ? <img
                        src="/icons/gold.png"
                        alt="goldicon"
                        className="h-[14px] w-[14px] shrink-0"/> : null}
                </div>
                <div ref={scrollRef} className="w-full min-w-0 max-w-full overflow-x-auto scrollbar-hide">
                    <div className="flex w-max flex-nowrap items-center gap-2">
                        {content.items.map((contentItem, itemIndex) => (
                            <Tooltip key={itemIndex} showArrow content={`${contentItem.difficulty} ${contentItem.stage}관문`}>
                                <div className="flex shrink-0 items-center gap-0.5 text-[11px] fadedtext">
                                    <span className={clsx(
                                        "h-2 w-2 shrink-0 rounded-full opacity-90",
                                        getBackgroundByStage(contentItem.difficulty, false)
                                    )}/>
                                    <span>{contentItem.stage}관문</span>
                                    {contentItem.isCheck ? <CheckIcon size={9} color="#16a34a"/> : null}
                                </div>
                            </Tooltip>
                        ))}
                    </div>
                </div>
            </div>
        </Chip>
    )
}

// 파티 컴포넌트 
type PartyComponentProps = {
    dispatch: AppDispatch,
    bosses: Boss[]
}
export function PartyComponent({ dispatch, bosses }: PartyComponentProps) {
    const [isLoading, setLoading] = useState(true);
    const members = useSelector((state: RootState) => state.party.members);
    const selectedParty = useSelector((state: RootState) => state.party.selectedRaid);

    useEffect(() => {
        const loadData = async () => {
            if (selectedParty) {
                await loadPartyData(selectedParty, setLoading, dispatch);
            }
        }
        loadData();
    }, [selectedParty?.id]);

    if (isLoading) {
        return <LoadingComponent heightStyle="min-h-[calc(100vh-65px)]"/>
    }
    if (selectedParty) {
        return (
            <div className="mt-4 w-full">
                <Tabs
                    fullWidth
                    radius="lg"
                    color="primary"
                    variant="light"
                    size="lg"
                    aria-label="파티 메뉴"
                    classNames={{
                        base: "w-full",
                        tabList: "grid w-full grid-cols-2 gap-2 rounded-2xl border border-gray-200/80 bg-white p-2 shadow-sm dark:border-white/10 dark:bg-[#171717] md:grid-cols-4",
                        cursor: "rounded-xl border border-primary-200/80 bg-primary-50 shadow-none dark:border-primary-700/50 dark:bg-primary-500/10",
                        tab: "h-auto min-h-14 px-3 py-2",
                        tabContent: "w-full text-gray-500 group-data-[selected=true]:text-primary dark:text-gray-400 dark:group-data-[selected=true]:text-primary-300"
                    }}>
                    <Tab key="home" title={<PartyTabTitle item={partyTabItems[0]}/> }>
                        <ChecklistComponent members={members} bosses={bosses} party={selectedParty}/>
                    </Tab>
                    <Tab key="party" title={<PartyTabTitle item={partyTabItems[1]}/> }>
                        <PartyRaidsComponent dispatch={dispatch} members={members} bosses={bosses}/>
                    </Tab>
                    <Tab key="calendar" title={<PartyTabTitle item={partyTabItems[2]}/> }>
                        <CalendarComponent dispatch={dispatch} bosses={bosses}/>
                    </Tab>
                    <Tab key="setting" title={<PartyTabTitle item={partyTabItems[3]}/> }>
                        <PartySettingComponent raid={selectedParty} members={members} dispatch={dispatch}/>
                    </Tab>
                </Tabs>
            </div>
        )
    } else {
        return <div className="w-full min-h-[calc(100vh-170px)] flex justify-center items-center">
            <p className="text-xl">해당 파티가 삭제되었거나 파티를 찾는데 오류가 발생하였습니다.</p>
        </div>
    }
}

function PartyTabTitle({ item }: { item: typeof partyTabItems[number] }) {
    return (
        <div className="flex w-full items-center gap-3 text-left">
            <span className="h-8 w-1 shrink-0 rounded-full bg-gray-300 transition-colors group-data-[selected=true]:bg-primary dark:bg-gray-700"/>
            <span className="min-w-0">
                <span className="block truncate text-sm font-semibold sm:text-base">{item.label}</span>
                <span className="hidden truncate text-[11px] font-normal opacity-70 sm:block">{item.description}</span>
            </span>
        </div>
    );
}

// 파티원의 남은 콘텐츠 관련 컴포넌트
function RemainContent({ member, bosses }: { member: RaidMember, bosses: Boss[] }) {
    const [content, setContent] = useState<string>('');

    const columns = [
        {name: "캐릭터", uid: "character"},
        {name: "골드", uid: "gold"},
        {name: "관문", uid: "stage"},
        {name: "완료 여부", uid: "complete"}
    ]

    const sortedBosses = useMemo(() => {
        return bosses.sort((a, b) => {
            const maxA = a.difficulty.reduce((prev, curr) => curr.level > prev.level ? curr : prev).level;
            const maxB = b.difficulty.reduce((prev, curr) => curr.level > prev.level ? curr : prev).level;
            return maxB - maxA;
        });
    }, [bosses]);

    useEffect(() => {
        if (bosses.length === 0) return;
        const sortedBosses = bosses.sort((a, b) => {
            const maxA = a.difficulty.reduce((prev, curr) => curr.level > prev.level ? curr : prev).level;
            const maxB = b.difficulty.reduce((prev, curr) => curr.level > prev.level ? curr : prev).level;
            return maxB - maxA;
        });
        setContent(sortedBosses[0].id);
    }, [bosses]);

    const renderRemainCell = React.useCallback((checklist: RemainCharacter, columnKey: React.Key) => {
        switch(columnKey) {
            case "character":
                return (
                    <div className="flex items-center gap-2">
                        <JobAvatar size="sm" job={checklist.job}/>
                        <div className="min-w-0">
                            <p className="truncate">{checklist.nickname}</p>
                            <p className="fadedtext truncate text-[10pt]">{`Lv.${checklist.level} · ${checklist.job} · @${checklist.server}`}</p>
                        </div>
                    </div>
                )
            case "gold":
                return (
                    <Chip size="sm" radius="sm" color={checklist.isGold ? "warning" : "default"} variant="flat">{checklist.isGold ? '획득 가능' : "획득 불가"}</Chip>
                )
            case 'stage':
                return (
                    <div className="w-full flex gap-2">
                        {checklist.items.map((content, index) => (
                            <Chip 
                                key={index}
                                size="sm"
                                radius="sm"
                                variant="flat"
                                startContent={content.isCheck ? <CheckIcon size={12}/> : null}
                                color={content.isCheck ? 'success' : 'danger'}>
                                {content.difficulty} {content.stage}관
                            </Chip>
                        ))}
                    </div>
                )
            case "complete":
                return (
                    <Chip size="sm" radius="sm" color={isCompleteContent(checklist) ? "success" : "default"} variant="flat">{isCompleteContent(checklist) ? '완료' : "미완료"}</Chip>
                )
            default:
                return (<div>nothing</div>)
        }
    }, []);

    const contents = getRemainContentsByCharacter(member.checklist, content, bosses);
    const completedContents = contents.filter(item => isCompleteContent(item)).length;
    const remainingContents = contents.length - completedContents;

    return (
        <div className="w-full rounded-xl border border-gray-200/80 bg-gray-50/40 p-3 dark:border-white/10 dark:bg-white/[0.02] sm:p-4">
            <div className="flex w-full flex-col items-stretch gap-3 sm:flex-row sm:items-end">
                <Select
                    label="콘텐츠 선택"
                    size="sm"
                    radius="sm"
                    selectedKeys={new Set([content])}
                    onSelectionChange={(keys) => {
                        const value = Array.from(keys)[0] as string;
                        setContent(value);
                    }}
                    className="w-full sm:w-[320px]">
                    {sortedBosses.map((boss) => (
                        <SelectItem key={boss.id}>{boss.name}</SelectItem>
                    ))}
                </Select>
                <div className="grow"/>
                <div className="w-full rounded-xl border border-primary-200/60 bg-primary-50/50 px-3 py-2.5 dark:border-primary-900/50 dark:bg-primary-500/[0.06] sm:w-[300px]">
                    <div className="mb-2 flex w-full items-center gap-1">
                        <p className="font-medium">총 {contents.length}개 중 {completedContents}개 완료</p>
                        <Chip size="sm" radius="sm" variant="flat" className="ml-auto">{remainingContents}개 남음</Chip>
                    </div>
                    <Progress
                        size="sm"
                        color="primary"
                        maxValue={contents.length}
                        value={completedContents}/>
                </div>
            </div>
            <div className="mt-4 w-full overflow-x-auto rounded-xl border border-gray-200/80 bg-white dark:border-white/10 dark:bg-[#171717]">
                <Table
                    removeWrapper
                    className="w-[760px] min-[760px]:w-full"
                    classNames={{
                        th: "bg-gray-100/80 text-xs font-semibold text-gray-500 dark:bg-white/[0.05] dark:text-gray-400",
                        td: "border-b border-gray-200/70 py-3 last:border-b-0 dark:border-white/10"
                    }}>
                    <TableHeader columns={columns}>
                        {(column) => (
                            <TableColumn key={column.uid}>{column.name}</TableColumn>
                        )}
                    </TableHeader>
                    <TableBody items={contents} emptyContent="조건에 맞는 캐릭터가 없습니다.">
                        {(item) => {
                            const idx = contents.findIndex(r => r.nickname === item.nickname); // key 기준으로 맞춰줘
                            const complete = isCompleteContent(item);
                            const prevComplete = idx > 0 ? isCompleteContent(contents[idx - 1]) : false;
                            const nextComplete = idx < contents.length - 1 ? isCompleteContent(contents[idx + 1]) : false;

                            // ✅ 덩어리의 위/아래만 라운드
                            const roundTop = complete && !prevComplete;
                            const roundBottom = complete && !nextComplete;
                            return (
                                <TableRow key={item.nickname} className={clsx(
                                    isCompleteContent(item) ? 'bg-success-50/70 dark:bg-success-500/[0.08]' : 'hover:bg-gray-50/70 dark:hover:bg-white/[0.025]'
                                )}>
                                    {(columnKey) => {
                                        const isFirst = columnKey === "character";
                                        const isLast = columnKey === "complete";
                                        return (
                                            <TableCell className={clsx(
                                                // ✅ 배경은 td에
                                                complete && "bg-success-50/70 dark:bg-success-500/[0.08]",

                                                // ✅ 좌/우 라운드는 첫/마지막 셀에만
                                                isFirst && roundTop && "rounded-tl-md",
                                                isLast && roundTop && "rounded-tr-md",
                                                isFirst && roundBottom && "rounded-bl-md",
                                                isLast && roundBottom && "rounded-br-md"
                                            )}>{renderRemainCell(item, columnKey)}</TableCell>
                                        )
                                    }}
                                </TableRow>
                            )
                        }}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
