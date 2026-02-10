import { 
    Accordion,
    AccordionItem,
    Avatar, 
    Card, CardBody, CardFooter, CardHeader, 
    Chip, 
    Divider, 
    Input, 
    Pagination, 
    Progress, 
    Select, 
    SelectItem, 
    Tab, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow, Tabs,
    Tooltip,
    User,
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
import { getImgByJob } from "@/app/character/expeditionFeat"
import LeaderIcon from "@/Icons/LeaderIcon"
import clsx from "clsx"
import { getSimpleBossName, getTextColorByDifficulty } from "@/app/checklist/checklistFeat"
import { PartyRaidsComponent } from "./RaidsForm"
import { AppDispatch, RootState } from "@/app/store/store"
import { useSelector } from "react-redux"
import { PartySettingComponent } from "./SettingFrom";
import { ShieldSecurityIcon } from "@/Icons/ShieldSecurityIcon";
import CheckIcon from "@/Icons/CheckIcon";
import { useMobileQuery } from "@/utiils/utils";

const PAGE_SIZE = 10;

// 홈 컴포넌트
type ChecklistComponentProps = {
    members: RaidMember[],
    bosses: Boss[],
    party: Raid
}
function ChecklistComponent({ members, bosses, party }: ChecklistComponentProps) {
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
        <div className="w-full">
            <div className="w-full flex gap-4 items-center">
                <Input
                    radius="sm"
                    label="검색"
                    placeholder="캐릭터 명 입력"
                    value={search}
                    onValueChange={setSearch}
                    maxLength={12}
                    className="w-full sm:w-[300px]"/>
                <div>
                    <p className="fadedtext text-[10pt]">검색 결과 수</p>
                    <p className="text-lg font-bold">{results.length}</p>
                </div>
            </div>
            <div className="w-full mt-4 flex flex-col">
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

    const itemClasses = {
        base: "py-0 w-full",
        title: "font-normal text-medium",
        trigger: "px-1 py-0 rounded-lg h-14 flex items-center cursor-pointer",
        indicator: "text-medium",
        content: "text-small px-0",
    };

    return (
        <React.Fragment>
            <Card radius="sm" shadow="sm" className={clsx(
                index !== 0 ? 'mt-6' : ''
            )}>
                <CardHeader>
                    <div className="w-full h-full flex flex-col sm:flex-row gap-2 sm:gap-4 items-center">
                        <div className="w-full flex gap-4 items-center">
                            <Avatar size="md" isBordered src={getImgByJob(getCharacterByMain(member.expeditions, member.nickname)?.job ?? '-')}/>
                            <div className="grow">
                                <div className="flex gap-2 items-center">
                                    <div className="flex gap-2 items-center">
                                        <p>{getCharacterByMain(member.expeditions, member.nickname)?.nickname ?? '-'}</p>
                                        <p className="fadedtext text-[9pt]">{member.id}</p>
                                    </div>
                                    <Tooltip showArrow content="파티장">
                                        <div className={clsx(
                                            "text-yellow-600 dark:text-yellow-400",
                                            party.managerId === member.id ? '' : 'hidden'
                                        )}><LeaderIcon size={12}/></div>
                                    </Tooltip>
                                </div>
                                <p className="fadedtext text-[10pt]">{getCharacterByMain(member.expeditions, member.nickname)?.job ?? '-'} · Lv.{getCharacterByMain(member.expeditions, member.nickname)?.level.toLocaleString() ?? '0.00'}</p>
                            </div>
                        </div>
                        <div className="grow"/>
                        <Progress
                            showValueLabel
                            label={`총 ${getRemainContents(member.checklist, bosses).reduce((sum, item) => sum + item.max, 0)}개 중 ${getRemainContents(member.checklist, bosses).reduce((sum, item) => sum + item.max, 0) - getRemainContents(member.checklist, bosses).reduce((sum, item) => sum + item.remain, 0)}개 완료`}
                            size="sm"
                            color="secondary"
                            maxValue={getRemainContents(member.checklist, bosses).reduce((sum, item) => sum + item.max, 0)}
                            value={getRemainContents(member.checklist, bosses).reduce((sum, item) => sum + item.max, 0) - getRemainContents(member.checklist, bosses).reduce((sum, item) => sum + item.remain, 0)}
                            className="w-full sm:w-[400px]"/>
                        <Progress
                            showValueLabel
                            label={(
                                <div className="flex items-center">
                                    <img 
                                        src="/icons/gold.png" 
                                        alt="goldicon"
                                        className="w-[16px] h-[16px]"/>
                                    <span className="ml-1 text-md">{getHaveGoldByMember(bosses, member.checklist).toLocaleString()} / {getAllGoldByMember(bosses, member.checklist).toLocaleString()}</span>
                                </div>
                            )}
                            size="sm"
                            color="warning"
                            maxValue={getAllGoldByMember(bosses, member.checklist)}
                            value={getHaveGoldByMember(bosses, member.checklist)}
                            className="w-full sm:w-[400px]"/>
                    </div>
                </CardHeader>
                <Divider/>
                <CardBody>
                    <Accordion itemClasses={itemClasses}>
                        <AccordionItem 
                            key={member.id} 
                            title="콘텐츠 별 남은 콘텐츠"
                            startContent={<ShieldSecurityIcon/>}>
                            <RemainContent bosses={bosses} member={member}/>
                        </AccordionItem>
                    </Accordion>
                </CardBody>
                <Divider/>
                <CardFooter className="p-0">
                    <div className="w-full">
                        {member.checklist.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map((item, idx) => (
                            <React.Fragment key={idx}>
                                <div className="w-full flex flex-col sm:flex-row gap-2 sm:gap-5 px-3 py-2 items-center">
                                    <div className="min-w-full sm:min-w-[240px] flex gap-3 items-center">
                                        <Avatar size="sm" isBordered color={item.isGold ? 'warning' : 'default'} src={getImgByJob(item.job)}/>
                                        <div className="grow">
                                            <div className="flex gap-1 items-center">
                                                <p className="text-[10pt]">{item.nickname}</p>
                                                {item.isGold ? (
                                                    <img 
                                                        src="/icons/gold.png" 
                                                        alt="goldicon"
                                                        className="w-[12px] h-[12px]"/>
                                                ) : null}
                                            </div>
                                            <p className="fadedtext text-[8pt]">{item.job} · Lv.{item.level.toLocaleString()}</p>
                                        </div>
                                    </div>
                                    {tabKey === 'homework' ? (
                                        <div className="grow w-full flex flex-col sm:flex-row gap-3 sm:overflow-x-auto scrollbar-hide">
                                            {item.contents.map((content, contentIndex) => <ContentChip key={contentIndex} bosses={bosses} content={content} isMemberGold={item.isGold}/>)}
                                        </div>
                                    ) : (
                                        <div className="w-full min-[860px]:w-fit min-[860px]:ml-auto flex flex-col min-[860px]:flex-row gap-2 min-[860px]:gap-5 items-center">
                                            <div className="w-full min-[860px]:w-[300px] grid grid-cols-3 gap-3 min-[860px]:gap-5">
                                                <div>
                                                    <p className="fadedtext text-[8pt]">거래가능 골드</p>
                                                    <div className="flex gap-1 items-center">
                                                        <img src="/icons/gold.png" alt="goldicon" className="w-[16px] h-[16px]"/>
                                                        <p>{getCompleteSharedGoldByMember(bosses, item).toLocaleString()}</p>
                                                    </div>
                                                </div>
                                                <div>
                                                    <p className="fadedtext text-[8pt]">귀속 골드</p>
                                                    <div className="flex gap-1 items-center">
                                                        <img src="/icons/gold.png" alt="goldicon" className="w-[16px] h-[16px]"/>
                                                        <p>{getCompleteBoundGoldByMember(bosses, item).toLocaleString()}</p>
                                                    </div>
                                                </div>
                                                <div>
                                                    <p className="fadedtext text-[8pt]">부수입</p>
                                                    <div className="flex gap-1 items-center">
                                                        <img src="/icons/gold.png" alt="goldicon" className="w-[16px] h-[16px]"/>
                                                        <p>{item.otherGold.toLocaleString()}</p>
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
                                {idx < member.checklist.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).length - 1 && <Divider/>}
                            </React.Fragment>
                        ))}
                        <div className="px-3 py-3 w-full mt-2 gap-3 flex flex-col sm:flex-row justify-center sm:justify-start items-end">
                            <Pagination
                                showControls
                                color="primary"
                                page={page}
                                onChange={setPage}
                                total={Math.ceil(member.checklist.length / PAGE_SIZE)}/>
                            <Tabs 
                                fullWidth={isMobile} 
                                radius="sm" 
                                color="primary"
                                selectedKey={tabKey.toString()}
                                onSelectionChange={setTabKey}>
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
function ContentChip({ content, bosses, isMemberGold }: ContentChipProps) {
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
            variant="flat"
            color={content.items.every(item => item.isCheck) ? "success" : 'danger'}
            startContent={content.items.every(item => item.isCheck) ? <CheckIcon size={18}/> : null}
            classNames={{
                base: "min-w-full sm:min-w-fit",
                content: "w-full min-w-0"
            }}
>
            <div className="flex gap-1 items-center">
                <p className={clsx(
                    "text-sm",
                    content.items.every(item => item.isCheck) ? 'text-green-600 dark:text-green-400' : ''
                )}>{getSimpleBossName(bosses, content.name)}</p>
                {content.isGold && isMemberGold ? <img 
                    src="/icons/gold.png" 
                    alt="goldicon"
                    className="w-[14px] h-[14px]"/> : <></>}
                <div ref={scrollRef} className="ml-auto w-fit min-w-0 sm:min-w-fit max-w-full overflow-x-auto sm:overflow-x-hidden scrollbar-hide">
                    <div className="flex flex-nowrap gap-1 w-max justify-end items-center">
                        {content.items.map((contentItem, itemIndex) => (
                            <Tooltip key={itemIndex} showArrow content={contentItem.difficulty}>
                                <Chip
                                    size="sm"
                                    radius="sm"
                                    endContent={contentItem.isCheck ? <CheckIcon size={12} /> : null}
                                    color={getTextColorByDifficulty(contentItem.difficulty)}
                                    className={contentItem.isCheck ? "bg-green-300/25 dark:bg-green-800/25" : "bg-white dark:bg-[#171717]"}
                                    variant="dot">
                                    {contentItem.stage}관문
                                </Chip>
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
            <div className="w-full mt-4">
                <Tabs radius="sm" color="primary" size="lg">
                    <Tab key="home" title="파티원 숙제">
                        <ChecklistComponent members={members} bosses={bosses} party={selectedParty}/>
                    </Tab>
                    <Tab key="party" title="레이드 목록">
                        <PartyRaidsComponent dispatch={dispatch} members={members} bosses={bosses}/>
                    </Tab>
                    <Tab key="setting" title="파티 설정">
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
                    <User
                        avatarProps={{src: getImgByJob(checklist.job)}}
                        name={checklist.nickname}
                        description={`Lv.${checklist.level} · ${checklist.job} · @${checklist.server}`}/>
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

    return (
        <div className="w-full">
            <div className="w-full flex flex-col sm:flex-row gap-3 items-end">
                <Select
                    label="콘텐츠 선택"
                    size="sm"
                    radius="sm"
                    selectedKeys={new Set([content])}
                    onSelectionChange={(keys) => {
                        const value = Array.from(keys)[0] as string;
                        setContent(value);
                    }}
                    className="w-full sm:w-[300px]">
                    {sortedBosses.map((boss) => (
                        <SelectItem key={boss.id}>{boss.name}</SelectItem>
                    ))}
                </Select>
                <div className="grow"/>
                <div className="w-full sm:w-[260px]">
                    <div className="w-full flex gap-1 items-center mb-1.5">
                        <p>총 {contents.length}개 중 {contents.filter(content => isCompleteContent(content)).length}개 완료</p>
                        <p className="ml-auto fadedtext">({contents.length - contents.filter(content => isCompleteContent(content)).length}개 남음)</p>
                    </div>
                    <Progress
                        size="sm"
                        color="primary"
                        maxValue={contents.length}
                        value={contents.filter(content => isCompleteContent(content)).length}/>
                </div>
            </div>
            <div className="mt-4 w-full overflow-x-auto">
                <Table removeWrapper className="w-[700px] min-[700px]:w-full">
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
                                    isCompleteContent(item) ? 'bg-green-100 dark:bg-green-900/25' : ''
                                )}>
                                    {(columnKey) => {
                                        const isFirst = columnKey === "character";
                                        const isLast = columnKey === "complete";
                                        return (
                                            <TableCell className={clsx(
                                                // ✅ 배경은 td에
                                                complete && "bg-green-100 dark:bg-green-900/25",

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