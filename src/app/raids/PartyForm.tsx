import { 
    Avatar, 
    Card, CardBody, CardHeader, 
    Checkbox, 
    Chip, 
    Divider, 
    Input, 
    Progress, 
    Tab, Tabs,
    Table, TableBody, TableCell, TableColumn, TableHeader, TableRow,
    Tooltip,
} from "@heroui/react"
import { Raid } from "../api/raids/route"
import React, { useEffect, useState } from "react"
import { RaidMember } from "../api/raids/members/route"
import { LoadingComponent } from "../UtilsCompnents"
import { getCharacterByMain, getRemainContents, loadPartyData, printDifficulty } from "./partyFeat"
import { Boss } from "../api/checklist/boss/route"
import { getImgByJob } from "../character/expeditionFeat"
import LeaderIcon from "@/Icons/LeaderIcon"
import clsx from "clsx"
import { getBackground50ByStage, getBackgroundByStage, getBorderByStage, getBossGoldByContent, getSimpleBossName, getTextColorByDifficulty } from "../checklist/checklistFeat"
import { PartyRaidsComponent } from "./RaidsForm"

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
                {results.map((member, index) => (
                    <React.Fragment key={index}>
                        <Card radius="sm" shadow="sm" className={clsx(
                            index !== 0 ? 'mt-6' : ''
                        )}>
                            <CardBody>
                                <div className="w-full grid min-[583px]:grid-cols-[320px_1fr] gap-3 mb-4">
                                    <div className="w-full h-full flex flex-col">
                                        <div className="w-full flex gap-4 items-center">
                                            <Avatar size="md" isBordered src={getImgByJob(getCharacterByMain(member.expeditions, member.nickname)?.job ?? '-')}/>
                                            <div className="grow">
                                                <div className="flex gap-2 items-center">
                                                    <p>{getCharacterByMain(member.expeditions, member.nickname)?.nickname ?? '-'}</p>
                                                    <div className={clsx(
                                                        "text-yellow-600 dark:text-yellow-400",
                                                        party.managerNickname === getCharacterByMain(member.expeditions, member.nickname)?.nickname ? '' : 'hidden'
                                                    )}><LeaderIcon size={12}/></div>
                                                </div>
                                                <p className="fadedtext text-[10pt]">{getCharacterByMain(member.expeditions, member.nickname)?.job ?? '-'} · Lv.{getCharacterByMain(member.expeditions, member.nickname)?.level.toLocaleString() ?? '0.00'}</p>
                                            </div>
                                        </div>
                                        <div className="grow"/>
                                        <Progress
                                            showValueLabel
                                            label={`총 ${getRemainContents(member.checklist, bosses).reduce((sum, item) => sum + item.max, 0)}개 중 ${getRemainContents(member.checklist, bosses).reduce((sum, item) => sum + item.max, 0) - getRemainContents(member.checklist, bosses).reduce((sum, item) => sum + item.remain, 0)}개 완료`}
                                            size="sm"
                                            color="warning"
                                            maxValue={getRemainContents(member.checklist, bosses).reduce((sum, item) => sum + item.max, 0)}
                                            value={getRemainContents(member.checklist, bosses).reduce((sum, item) => sum + item.max, 0) - getRemainContents(member.checklist, bosses).reduce((sum, item) => sum + item.remain, 0)}
                                            className="mt-4"/>
                                    </div>
                                    <div className="w-full grid grid-cols-1 min-[845px]:grid-cols-2 min-[1106px]:grid-cols-3 gap-3 max-h-[150px] min-[845px]:max-h-[110px] overflow-y-auto">
                                        {getRemainContents(member.checklist, bosses).map((item, idx) => (
                                            <Chip
                                                key={idx}
                                                radius="sm"
                                                size="sm"
                                                variant="flat"
                                                className="min-w-full">
                                                <div className="w-full flex gap-2 items-center p-1">
                                                    <p className="grow text-[9pt]">{item.name}</p>
                                                    <p>{item.remain} / {item.max}</p>
                                                </div>
                                            </Chip>
                                        ))}
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                        <div className="w-full grid min-[751px]:grid-cols-[400px_2fr] gap-4 mt-3">
                            <div className="max-h-[340px] overflow-y-auto pr-1">
                                <Table removeWrapper>
                                    <TableHeader>
                                        <TableColumn>캐릭터명</TableColumn>
                                        <TableColumn>클래스</TableColumn>
                                        <TableColumn>아이템 레벨</TableColumn>
                                        <TableColumn>서버</TableColumn>
                                    </TableHeader>
                                    <TableBody>
                                        {member.expeditions.map((character, idx) => (
                                            <TableRow key={idx}>
                                                <TableCell>{character.nickname}</TableCell>
                                                <TableCell>{character.job}</TableCell>
                                                <TableCell>{character.level}</TableCell>
                                                <TableCell>{character.server}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                            <div className="max-h-[340px] overflow-y-auto min-w-full overflow-x-auto flex gap-4 pb-2">
                                {member.checklist.map((item, idx) => (
                                    <Card key={idx} radius="sm" shadow="sm" className="min-w-[340px]">
                                        <CardHeader>
                                            <div className="w-full flex gap-4 items-center">
                                                <Avatar size="md" isBordered color={item.isGold ? 'warning' : 'default'} src={getImgByJob(item.job)}/>
                                                <div className="grow">
                                                    <div className="flex gap-2 items-center">
                                                        <p>{item.nickname}</p>
                                                        {item.isGold ? (
                                                            <img 
                                                                src="/icons/gold.png" 
                                                                alt="goldicon"
                                                                className="w-[16px] h-[16px]"/>
                                                        ) : null}
                                                    </div>
                                                    <p className="fadedtext text-[10pt]">{item.job} · Lv.{item.level.toLocaleString()}</p>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <Divider/>
                                        <CardBody>
                                            <div className="w-full min-h-full overflow-y-auto flex flex-col gap-3 box-border pl-2.5 pt-2.5">
                                                {item.contents.map((content, ix) => (
                                                    <Checkbox 
                                                        key={ix}
                                                        size="sm"
                                                        isReadOnly
                                                        radius="full"
                                                        isSelected={content.items.every(item => item.isCheck)}
                                                        className={clsx(
                                                            "max-w-full w-full box-border p-1.5 [&_span:nth-of-type(2)]:w-full",
                                                            ix !== 0 ? 'mt-2.5' : '',
                                                            content.items.every(item => item.isCheck) ? 'outline-2 outline-blue-400 dark:outline-blue-800 rounded-md bg-blue-400/20 dark:bg-blue-800/20' : ''
                                                        )}>
                                                        <div className="w-full flex items-center gap-1">
                                                            <div>
                                                                <div className="flex gap-1 items-center">
                                                                    <p className={clsx(
                                                                        content.items.every(item => item.isCheck) ? 'line-through fadedtext' : ''
                                                                    )}>{getSimpleBossName(bosses, content.name)}</p>
                                                                    {content.isGold ? <img 
                                                                        src="/icons/gold.png" 
                                                                        alt="goldicon"
                                                                        className="w-[14px] h-[14px]"/> : <></>}
                                                                </div>
                                                                <p className={clsx(
                                                                    "fadedtext text-[9pt]",
                                                                    content.items.every(item => item.isCheck) ? 'line-through' : ''
                                                                )}>{printDifficulty(content.items)}</p>
                                                            </div>
                                                            <div className="grow"/>
                                                            <div className="flex items-center z-9">
                                                                {content.items.map((diff, ixx) => (
                                                                    <React.Fragment key={ixx}>
                                                                        {ixx > 0 && (
                                                                            <div className={clsx(
                                                                                'w-2 h-[2px]',
                                                                                getBackgroundByStage(diff.difficulty, false)
                                                                            )} />
                                                                        )}
                                                                        <Tooltip showArrow delay={1000} content={
                                                                            <div className="w-full min-[251px]:w-[250px]">
                                                                                <h1 className="w-full text-center font-bold p-1.5">{content.name}</h1>
                                                                                <div className="w-full flex gap-2 items-center mb-1.5">
                                                                                    <Chip
                                                                                        radius="sm"
                                                                                        size="sm"
                                                                                        color={getTextColorByDifficulty(diff.difficulty)}
                                                                                        variant="flat">
                                                                                        {diff.difficulty}
                                                                                    </Chip>
                                                                                    <div className="grow"/>
                                                                                    <Chip
                                                                                        radius="sm"
                                                                                        size="sm"
                                                                                        variant="flat">
                                                                                        {diff.stage}관문
                                                                                    </Chip>
                                                                                </div>
                                                                                <Divider/>
                                                                                <div className="w-full mt-1.5 mb-1">
                                                                                    <div className="w-full flex gap-2 mb-1 items-center">
                                                                                        <p className="fadedtext">골드</p>
                                                                                        <div className="grow flex gap-1 items-center justify-end">
                                                                                            <img 
                                                                                                src="/icons/gold.png" 
                                                                                                alt="goldicon"
                                                                                                className="w-[16px] h-[16px]"/>
                                                                                            <p>{getBossGoldByContent(bosses, content.name, diff.stage, diff.difficulty).gold.toLocaleString()}</p>
                                                                                        </div>
                                                                                    </div>
                                                                                    <div className={clsx(
                                                                                        "w-full gap-2 mb-1 items-center",
                                                                                        getBossGoldByContent(bosses, content.name, diff.stage, diff.difficulty).boundGold > 0 ? 'flex' : 'hidden'
                                                                                    )}>
                                                                                        <p className="fadedtext">귀속 골드</p>
                                                                                        <div className="grow flex gap-1 items-center justify-end">
                                                                                            <img 
                                                                                                src="/icons/gold.png" 
                                                                                                alt="goldicon"
                                                                                                className="w-[16px] h-[16px]"/>
                                                                                            <p>{getBossGoldByContent(bosses, content.name, diff.stage, diff.difficulty).boundGold.toLocaleString()}</p>
                                                                                        </div>
                                                                                    </div>
                                                                                    <div className={clsx(
                                                                                        "w-full gap-2 items-center",
                                                                                        getBossGoldByContent(bosses, content.name, diff.stage, diff.difficulty).bonus > 0 ? 'flex' : 'hidden'
                                                                                    )}>
                                                                                        <p className="fadedtext">더보기 골드</p>
                                                                                        <div className="grow flex gap-1 items-center justify-end">
                                                                                            <img 
                                                                                                src="/icons/gold.png" 
                                                                                                alt="goldicon"
                                                                                                className="w-[16px] h-[16px]"/>
                                                                                            <p>{getBossGoldByContent(bosses, content.name, diff.stage, diff.difficulty).bonus.toLocaleString()}</p>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        }>
                                                                            <div className={clsx(
                                                                                'w-7 h-7 flex justify-center items-center p-0.5 rounded-md border-2 leading-none cursor-pointer',
                                                                                getBorderByStage(diff.difficulty, false),
                                                                                diff.isCheck ? getBackground50ByStage(diff.difficulty, false) : ''
                                                                            )}>
                                                                                {diff.stage}
                                                                            </div>
                                                                        </Tooltip>
                                                                    </React.Fragment>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </Checkbox>
                                                ))}
                                            </div>
                                        </CardBody>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    </React.Fragment>
                ))}
            </div>
        </div>
    )
}

// 파티 컴포넌트 
type PartyComponentProps = {
    userId: string| null,
    selectedParty: Raid | null,
    bosses: Boss[]
}
export function PartyComponent({ userId, selectedParty, bosses }: PartyComponentProps) {
    const [isLoading, setLoading] = useState(true);
    const [members, setMembers] = useState<RaidMember[]>([]);

    useEffect(() => {
        const loadData = async () => {
            if (selectedParty) {
                await loadPartyData(selectedParty, setMembers, setLoading);
            }
        }
        loadData();
    }, [selectedParty]);

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
                        <PartyRaidsComponent userId={userId} members={members} selectedParty={selectedParty} bosses={bosses}/>
                    </Tab>
                    <Tab key="setting" title="파티 설정">
                        <ChecklistComponent members={members} bosses={bosses} party={selectedParty}/>
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