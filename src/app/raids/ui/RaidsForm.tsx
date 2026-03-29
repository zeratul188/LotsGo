import { Key, useEffect, useMemo, useState } from "react";
import { Boss } from "@/app/api/checklist/boss/route";
import { DragableParty, Raid, TeamCharacter, TeamMember } from "../model/types";
import { deleteParty, filterPartys, getBossById, getBossDataById, getEffectsByPartyMembers, getInvolvedNickname, getTeamCharactersList, handleAddParty, handleChangeManager, handleChangePosition, handleEditParty, InvolvedCharacter, isDisableEditParty, isExistPartyMember, isInvolvedPosition, isManagerOfParty, isSelectedDifficulty, moveOrSwapPartys, onSelectionChangeContent, onSelectionChangeStages, toCheckData, toSlots, toStringByRaidDate } from "../lib/raidsFeat";
import { 
    addToast, 
    Button, 
    Card, CardBody, CardFooter, CardHeader, 
    Checkbox, 
    Chip, 
    cn, 
    DatePicker, 
    Divider, 
    Dropdown, DropdownItem, DropdownMenu, DropdownTrigger, 
    Input, 
    Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, 
    Select, Selection, SelectItem, 
    Tab, Tabs, 
    Tooltip 
} from "@heroui/react";
import { SetStateFn, useMobileQuery } from "@/utiils/utils";
import { DateValue, getLocalTimeZone, now, parseAbsolute } from "@internationalized/date";
import CalendarIcon from "@/Icons/CalendarIcon";
import { getBossesById, getDifficultyByStage, getTextColorByDifficulty, getWeekContents, getWeekStages } from "@/app/checklist/lib/checklistFeat";
import { ControlStage } from "@/app/checklist/model/types";
import { RaidMember } from "@/app/api/raids/members/route";
import { SettingIcon } from "@/app/icons/SettingIcon";
import clsx from "clsx";
import data from "@/data/characters/data.json";
import { useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/app/store/store";
import { getCharacterInfoById, getMaxLengthByContent, handleCancelInvolvedParty, handleJoinRaid, handleRefreshPartys, JoinRaidPayload } from "../lib/raidListFeat";
import LeaderIcon from "@/Icons/LeaderIcon";
import { ListTurnBackIcon } from "@/Icons/ListTurnBackIcon";
import { DndContext, DragEndEvent, useDraggable, useDroppable } from "@dnd-kit/core";
import { CrownIcon } from "@/Icons/CrownIcon";
import DeleteIcon from "@/app/icons/DeleteIcon";
import { EditIcon } from "@/Icons/EditIcon";
import PersonIcon from "@/Icons/PersonIcon";
import JobEmblemIcon from "@/Icons/JobEmblemIcon";
import SearchEmptyIcon from "@/Icons/SearchEmptyIcon";
import dynamic from "next/dynamic";
const FixedLineAd = dynamic(() => import("@/app/ad/FixedLineAd"), { ssr: false });

// 파티 내 레이드 목록 컴포넌트
type PartyRaidsComponentProps = {
    dispatch: AppDispatch,
    members: RaidMember[],
    bosses: Boss[]
}
export function PartyRaidsComponent({dispatch, members, bosses}: PartyRaidsComponentProps) {
    const [searchContent, setSearchContent] = useState<Selection>(new Set([]));
    const [searchValue, setSearchValue] = useState(''); 
    const isMobile = useMobileQuery();

    const [isOpenAdd, setOpenAdd] = useState(false);
    const [isOpenInvolved, setOpenInvolved] = useState(false);
    const [partyId, setPartyId] = useState<string | null>(null);
    const [partyPosition, setPartyPosition] = useState(-1);
    const [partyNumber, setPartyNumber] = useState(-1);
    const [isLoadingRefresh, setLoadingRefresh] = useState(false);
    const [isLoadingCancel, setLoadingCancel] = useState(false);
    const [isRefreshCooldown, setRefreshCooldown] = useState(false);
    const [isOpenChangePosition, setOpenChangePosition] = useState(false);
    const [isOpenChangeManager, setOpenChangeManager] = useState(false);
    const [isOpenEdit, setOpenEdit] = useState(false);

    const selectedParty = useSelector((state: RootState) => state.party.selectedRaid);
    const userId = useSelector((state: RootState) => state.party.userId);

    if (!selectedParty) {
        return (
            <div className="w-full min-h-[800px] flex justify-center items-center">
                <p>선택된 파티가 존재하지 않습니다.</p>
            </div>
        )
    }

    return (
        <div className="w-full">
            <div className="w-full flex flex-col sm:flex-row gap-3">
                <Select
                    label="콘텐츠 선택"
                    placeholder="콘텐츠를 선택하세요."
                    selectedKeys={searchContent}
                    radius="sm"
                    size="sm"
                    onSelectionChange={setSearchContent}
                    className="w-full sm:w-[270px]">
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
                <Input
                    label="검색"
                    placeholder="파티명 또는 파티원 검색"
                    value={searchValue}
                    radius="sm"
                    size="sm"
                    onValueChange={setSearchValue}
                    className="w-full sm:w-[270px]"/>
                <Button
                    fullWidth={isMobile}
                    radius="sm"
                    size="lg"
                    color="primary">
                    검색
                </Button>
                <div className="grow"/>
                <Tooltip showArrow content="새로고침은 5초에 한 번씩 가능합니다.">
                    <Button
                        fullWidth={isMobile}
                        radius="sm"
                        size="lg"
                        color="primary"
                        isLoading={isLoadingRefresh}
                        isDisabled={isRefreshCooldown}
                        onPress={async () => await handleRefreshPartys(setLoadingRefresh, isRefreshCooldown, setRefreshCooldown, selectedParty?.id, dispatch)}>
                        새로고침
                    </Button>
                </Tooltip>
                <Button
                    fullWidth={isMobile}
                    radius="sm"
                    size="lg"
                    color="primary"
                    onPress={() => setOpenAdd(true)}>
                    파티 추가
                </Button>
            </div>
            {isMobile ? null : (
                <div className="w-full flex justify-center overflow-hidden mt-8 mb-4">
                    <div className="w-full max-w-[1240px] flex justify-center rounded-2xl bg-[#eeeeee] dark:bg-[#222222] p-4 mx-4">
                        <FixedLineAd isLoaded={true}/>
                    </div>
                </div>
            )}
            <div className={clsx(
                `grid gap-4 min-[816px]:grid-cols-2 min-[1232px]:grid-cols-3 mt-4`,
                selectedParty.party.filter(filterPartys(bosses, searchContent)).length > 0 ? '' : 'hidden'
            )}>
                {selectedParty.party.filter(filterPartys(bosses, searchContent)).map((party) => (
                    <Card
                        key={party.id}
                        radius="sm"
                        shadow="sm">
                        <CardHeader>
                            <div className="w-full">
                                <div className="w-full flex gap-2 items-center">
                                    <div className="grow">
                                        <p className="font-bold text-lg">{party.name}</p>
                                        <p className="text-sm">{toStringByRaidDate(new Date(party.date))}</p>
                                    </div>
                                    <Dropdown>
                                        <DropdownTrigger>
                                            <Button isIconOnly variant="light" size="sm"><SettingIcon size={24} className="text-gray-500 hover:text-gray-800 cursor-pointer" /></Button>
                                        </DropdownTrigger>
                                        <DropdownMenu 
                                            aria-label="raid-actions"
                                            onAction={async (key) => {
                                                if (key === 'change-position') {
                                                    if (!isManagerOfParty(userId, party)) {
                                                        addToast({
                                                            title: `권한 없음`,
                                                            description: "해당 파티의 공대장만 순서를 변경하실 수 있습니다.",
                                                            color: "danger"
                                                        });
                                                        return;
                                                    }
                                                    setPartyId(party.id);
                                                    setOpenChangePosition(true);
                                                } else if (key === 'change-manager') {
                                                    if (!isManagerOfParty(userId, party)) {
                                                        addToast({
                                                            title: `권한 없음`,
                                                            description: "해당 파티의 공대장만 공대장을 위임할 수 있습니다.",
                                                            color: "danger"
                                                        });
                                                        return;
                                                    }
                                                    setPartyId(party.id);
                                                    setOpenChangeManager(true);
                                                } else if (key === 'delete-party') {
                                                    if (confirm('해당 파티를 삭제하시겠습니까? 삭제하면 복구하실 수 없습니다.')) {
                                                        await deleteParty(dispatch, selectedParty, party.id);
                                                    }
                                                } else if (key === 'change-info') {
                                                    if (!isManagerOfParty(userId, party)) {
                                                        addToast({
                                                            title: `권한 없음`,
                                                            description: "해당 파티의 공대장만 파티를 수정할 수 있습니다.",
                                                            color: "danger"
                                                        });
                                                        return;
                                                    }
                                                    setPartyId(party.id);
                                                    setOpenEdit(true);
                                                }
                                            }}>
                                            <DropdownItem 
                                                key="change-position"
                                                startContent={<ListTurnBackIcon/>}>
                                                순서 변경하기
                                            </DropdownItem>
                                            <DropdownItem 
                                                key="change-manager"
                                                startContent={<CrownIcon className="w-5 h-5"/>}>
                                                공대장 변경하기
                                            </DropdownItem>
                                            <DropdownItem 
                                                key="change-info"
                                                startContent={<EditIcon className="w-5 h-5"/>}>
                                                파티 수정하기
                                            </DropdownItem>
                                            <DropdownItem 
                                                key="delete-party"
                                                color="danger"
                                                startContent={<DeleteIcon/>}
                                                className="text-danger">
                                                파티 삭제하기
                                            </DropdownItem>
                                        </DropdownMenu>
                                    </Dropdown>
                                </div>
                                <p className="fadedtext text-sm mt-1">{getBossById(bosses, party.content)?.name}</p>
                                <div className="grid gap-2 grid-cols-4 mt-1">
                                    {party.stages.map((stage, index) => {
                                        if (stage.difficulty === '선택안함') return null;
                                        return (
                                            <Chip
                                                key={index}
                                                color={getTextColorByDifficulty(stage.difficulty)}
                                                radius="sm"
                                                variant="flat"
                                                size="sm"
                                                className="min-w-full text-center">
                                                {stage.difficulty} {stage.stage}관
                                            </Chip>
                                        )
                                    })}
                                </div>
                            </div>
                        </CardHeader>
                        <Divider/>
                        <CardBody>
                            <Tabs
                                fullWidth
                                radius="sm"
                                size="sm">
                                {Array.from({ length: Math.ceil(getMaxLengthByContent(bosses, party.content)/4) }, (_, i) => i + 1).map((index) => (
                                    <Tab key={index} title={`${index}파티`}>
                                        <div className="w-full flex flex-col gap-2">
                                            {[1, 2, 3, 4].map((position) => {
                                                const teamCharacter = party.teams.find(t => t.partyIndex === index && t.position === position);
                                                return teamCharacter ? (
                                                    <Button
                                                        key={position}
                                                        variant="bordered"
                                                        radius="sm"
                                                        color={teamCharacter.type === 'supporter' ? 'success' : 'danger'}
                                                        className="h-14">
                                                        <div className="w-full flex gap-3 items-center">
                                                            <JobEmblemIcon job={getCharacterInfoById(members, teamCharacter.userId, teamCharacter.nickname).job} size={32} className="text-black dark:text-white"/>
                                                            <div className="grow text-left">
                                                                <div className="flex gap-1">
                                                                    <div className="flex items-center grow gap-1">
                                                                        <p className="text-black dark:text-white">{teamCharacter.nickname}</p>
                                                                        <div className={clsx(
                                                                            "text-yellow-600 dark:text-yellow-400",
                                                                            teamCharacter.isManager ? '' : 'hidden'
                                                                        )}><LeaderIcon size={12}/></div>
                                                                    </div>
                                                                    <div className="flex gap-1">
                                                                        {teamCharacter.type === 'attack' ? data.classEffects.find(c => c.job === getCharacterInfoById(members, teamCharacter.userId, teamCharacter.nickname).job)?.effects.map((effect, index) => (
                                                                            <div key={index} className="rounded-md px-1 py-0.2 bg-[#eeeeee] dark:bg-[#2a2a2a] text-[8pt] text-black dark:text-white">{effect}</div>
                                                                        )) : data.classEffects.find(c => c.job === getCharacterInfoById(members, teamCharacter.userId, teamCharacter.nickname).job)?.burf.map((effect, index) => (
                                                                            <div key={index} className="rounded-md px-1 py-0.2 bg-[#eeeeee] dark:bg-[#2a2a2a] text-[8pt] text-black dark:text-white">{effect}</div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                                <div className="flex gap-1">
                                                                    <p className="fadedtext text-[9pt] grow">{getCharacterInfoById(members, teamCharacter.userId, teamCharacter.nickname).job} · Lv.{getCharacterInfoById(members, teamCharacter.userId, teamCharacter.nickname).level} · {getCharacterInfoById(members, teamCharacter.userId, teamCharacter.nickname).server}</p>
                                                                    <p className="fadedtext text-[9pt]">{teamCharacter.userId}</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        key={position}
                                                        variant="bordered"
                                                        radius="sm"
                                                        className="h-14 hover:bg-[#f4f4f4] hover:dark:bg-[#232323]"
                                                        onPress={() => {
                                                            if (isExistPartyMember(userId, party.teams)) {
                                                                addToast({
                                                                    title: `참여 뷸가`,
                                                                    description: `이미 해당 파티에 참여하였습니다.`,
                                                                    color: "danger"
                                                                });
                                                                return;
                                                            }
                                                            setPartyId(party.id);
                                                            setPartyPosition(position);
                                                            setPartyNumber(index);
                                                            setOpenInvolved(true);
                                                        }}>
                                                        <div className="w-full flex gap-4 items-center">
                                                            <p className="text-lg font-bold fadedtext">{position}</p>
                                                            <p className="fadedtext">모집 중입니다...</p>
                                                        </div>
                                                    </Button>
                                                )
                                            })}
                                        </div>
                                        <p className="fadedtext text-sm mt-3">파티 총 시너지</p>
                                        <div className="w-full flex flex-wrap gap-2 mt-1">
                                            {getEffectsByPartyMembers(members, party.teams, index).map((effect, index) => (
                                                <Chip key={index} variant="flat" size="sm" radius="sm" color="secondary">{effect}</Chip>
                                            ))}
                                        </div>
                                    </Tab>
                                ))}
                            </Tabs>
                            <div className="w-full flex gap-1 items-center">
                                <div className="grow flex flex-wrap gap-0.5">
                                    {Array.from({ length: Math.ceil(getMaxLengthByContent(bosses, party.content)/4) }).map((_, partyIndex) => (
                                        <div key={partyIndex} className="flex gap-0.5">
                                            {Array.from({ length: 4 }).map((_, position) => (
                                                <Tooltip 
                                                    key={position} 
                                                    showArrow 
                                                    content={getInvolvedNickname(party.teams, partyIndex+1, position+1)}
                                                    isDisabled={!isInvolvedPosition(party.teams, partyIndex+1, position+1)}>
                                                    <PersonIcon className={clsx(
                                                        "w-[15px] h-[25px] fill-current",
                                                        isInvolvedPosition(party.teams, partyIndex+1, position+1) ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-gray-600'
                                                    )}/>
                                                </Tooltip>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                                <p>{party.teams.length}/{getMaxLengthByContent(bosses, party.content)}</p>
                            </div>
                        </CardBody>
                        <CardFooter>
                            <Button
                                fullWidth
                                color='danger'
                                radius="sm"
                                isDisabled={!isExistPartyMember(userId, party.teams) || isLoadingCancel}
                                onPress={async () => await handleCancelInvolvedParty({setLoadingCancel, dispatch}, {partyId: party.id, userId, raidId: selectedParty?.id})}>
                                참여 취소
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
            <div className={clsx(
                `w-full h-[500px] flex items-center justify-center flex-col gap-3 text-center`,
                selectedParty.party.filter(filterPartys(bosses, searchContent)).length === 0 ? '' : 'hidden'
            )}>
                <div className="flex items-center justify-center">
                    <SearchEmptyIcon size={82} className="text-default-400" />
                </div>
                <div className="space-y-1">
                    <p className="text-lg text-foreground">추가된 파티가 없습니다.</p>
                    <p className="text-sm fadedtext">새 파티를 추가하면 이곳에 표시됩니다.</p>
                </div>
            </div>
            <AddPartyModal 
                dispatch={dispatch}
                selectedParty={selectedParty}
                userId={userId}
                isOpenAdd={isOpenAdd}
                setOpenAdd={setOpenAdd}
                bosses={bosses}/>
            <InvolvedModal
                dispatch={dispatch}
                partyId={partyId}
                members={members}
                userId={userId}
                bosses={bosses}
                selectedParty={selectedParty}
                isOpenInvoled={isOpenInvolved}
                setOpenInvoled={setOpenInvolved}
                position={partyPosition}
                partyNumber={partyNumber}/>
            <ChangePositionModal
                ui={{
                    dispatch: dispatch,
                    isOpenChangePosition: isOpenChangePosition,
                    setOpenChangePosition: setOpenChangePosition
                }}
                payload={{
                    bosses: bosses,
                    selectedParty: selectedParty,
                    partyId: partyId ?? 'null',
                    members: members
                }}/>
            <ChangeManagerModal
                dispatch={dispatch}
                isOpenChangeManager={isOpenChangeManager}
                partyId={partyId}
                selectedParty={selectedParty}
                setOpenChangeManager={setOpenChangeManager}
                userId={userId}
                members={members}/>
            <EditPartyModal
                dispatch={dispatch}
                isOpenEdit={isOpenEdit}
                partyId={partyId}
                selectedParty={selectedParty}
                setOpenEdit={setOpenEdit}
                bosses={bosses}/>
        </div>
    )
}

// 파티 참여 Modal
type InvoledModalProps = {
    dispatch: AppDispatch,
    partyId: string | null,
    members: RaidMember[],
    userId: string | null,
    bosses: Boss[],
    selectedParty: Raid | null,
    isOpenInvoled: boolean,
    setOpenInvoled: SetStateFn<boolean>,
    position: number,
    partyNumber: number
}
function InvolvedModal({ dispatch, partyId, members, userId, bosses, selectedParty, isOpenInvoled, setOpenInvoled, position, partyNumber }: InvoledModalProps) {
    const [tab, setTab] = useState('expeditions');
    const [tabType, setTabType] = useState('supporter');
    const [isManager, setManager] = useState(false);
    const [isHaveManager, setHaveManager] = useState(false);
    const [maxLength, setMaxLength] = useState(0);
    const [isLoadingJoin, setLoadingJoin] = useState(false);
    const party = useMemo(
        () => selectedParty?.party.find(p => p.id === partyId),
        [selectedParty?.party, partyId]
    );
    const characters = useMemo(
        () => {
            const findBoss = getBossDataById(bosses, party?.content ?? 'null');
            const maxLevel = party && findBoss
                ? party.stages.reduce((max, s) => {
                    const level = findBoss.difficulty.find(d => d.stage === s.stage && d.difficulty === s.difficulty)?.level;
                    return level !== undefined ? Math.max(max, level) : max;
                }, 0) : 0;
            console.log(members);
            const findMember = members.find(m => m.id === userId);
            if (findMember) {
                switch(tab) {
                    case 'expeditions':
                        return toCheckData(findMember.expeditions, maxLevel);
                    case 'checklist':
                        return toCheckData(findMember.checklist, maxLevel);
                    default:
                        return [];
                }
            }
            else return [];
        },
        [userId, members, tab, party]
    );
    const [selectedCharacter, setSelectedCharacter] = useState<InvolvedCharacter | null>(null);

    useEffect(() => {
        if (!party) return;
        setHaveManager(party.teams.some(t => t.isManager));
        setMaxLength(getMaxLengthByContent(bosses, party?.content ?? 'null'));
    }, [party]);

    if (!selectedParty || !partyId || !userId || !party) {
        return (
            <Modal
                radius="sm"
                isOpen={isOpenInvoled}
                onOpenChange={(isOpen) => setOpenInvoled(isOpen)}>
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader>오류 발생!</ModalHeader>
                            <ModalContent>
                                <div className="min-h-[200px] flex justify-center items-center text-md">
                                    데이터를 가져오는데 문제가 발생하였습니다.
                                </div>
                            </ModalContent>
                        </>
                    )}
                </ModalContent>
            </Modal>
        )
    }

    const joinPayload: JoinRaidPayload = {
        selectedCharacter,
        isManager,
        tabType,
        raidId: selectedParty.id,
        partyId,
        userId,
        position,
        partyNumber
    }
    
    return (
        <Modal
            radius="sm"
            isOpen={isOpenInvoled}
            onOpenChange={(isOpen) => setOpenInvoled(isOpen)}
            scrollBehavior="inside"
            onClose={() => {
                setSelectedCharacter(null);
                setManager(false);
                setTabType('supporter');
            }}>
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader>
                            <div>
                                <h1>{party.name}</h1>
                                <p className="fadedtext text-sm">{partyNumber}파티 {position}번</p>
                            </div>
                        </ModalHeader>
                        <ModalBody>
                            <Tabs
                                fullWidth
                                radius="sm"
                                color="primary"
                                aria-label="characters-type"
                                selectedKey={tab}
                                onSelectionChange={(key: Key) => {
                                    setTab(String(key));
                                    setSelectedCharacter(null);
                                }}>
                                <Tab key="expeditions" title="원정대"/>
                                <Tab key="checklist" title="숙제"/>
                            </Tabs>
                            <div className="w-full max-h-[400px] overflow-y-auto overflow-x-hidden">
                                {characters.map((character, index) => (
                                    <div key={index} className="w-full min-h-[64px] mb-1">
                                        <Checkbox
                                            aria-label={character.nickname}
                                            isDisabled={character.isDisable}
                                            classNames={{
                                                base: cn(
                                                    "w-full max-w-full bg-content1",
                                                    "hover:bg-content2",
                                                    "cursor-pointer rounded-lg gap-2 border-2 border-transparent m-auto box-border",
                                                    "data-[selected=true]:border-primary"
                                                ),
                                                label: "w-full",
                                            }}
                                            isSelected={selectedCharacter ? selectedCharacter.nickname === character.nickname : false}
                                            onValueChange={(isSelected) => {
                                                if (selectedCharacter) {
                                                    if (selectedCharacter.nickname === character.nickname) {
                                                        setSelectedCharacter(null);
                                                        return;
                                                    }
                                                }
                                                setSelectedCharacter(character);
                                            }}>
                                            <div className="w-full flex flex-col">
                                                <span className="fadedtext text-sm">@{character.server} · {character.job} · Lv.{character.level}</span>
                                                <span className="text-md">{character.nickname}</span>
                                            </div>
                                        </Checkbox>
                                    </div>
                                ))}
                            </div>
                            <Tabs
                                fullWidth
                                radius="sm"
                                color="primary"
                                aria-label="characters-type"
                                selectedKey={tabType}
                                onSelectionChange={(key: Key) => setTabType(String(key))}
                                className={clsx(
                                    selectedCharacter ? data.classSupporters.includes(selectedCharacter.job) ? '' : 'hidden' : 'hidden'
                                )}>
                                <Tab key="supporter" title="서폿"/>
                                <Tab key="attack" title="딜러"/>
                            </Tabs>
                            <p className={clsx(
                                'text-red-600 dark:text-red-400 text-[10pt]',
                                isHaveManager ? '' : 'hidden'
                            )}>해당 파티에 이미 공대장이 존재합니다.</p>
                            <Tooltip
                                showArrow
                                isDisabled={!isHaveManager}
                                content="이미 해당 파티에 공대장이 존재합니다.">
                                <Checkbox
                                    size="lg"
                                    isDisabled={isHaveManager}
                                    isSelected={isManager}
                                    onValueChange={setManager}>
                                    해당 파티를 공대장으로 참여합니다.
                                </Checkbox>
                            </Tooltip>
                            <p>총 {maxLength ?? 0}명 중 {party.teams.length}명이 참여하였습니다.</p>
                        </ModalBody>
                        <ModalFooter>
                            <Button
                                fullWidth
                                radius="sm"
                                color="primary"
                                isLoading={isLoadingJoin}
                                isDisabled={selectedCharacter === null}
                                onPress={async () => await handleJoinRaid({onClose, setLoadingJoin, dispatch}, joinPayload)}>
                                참여하기
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    )
}

// 파티 추가 Modal
type AddPartyModalProps = {
    dispatch: AppDispatch,
    selectedParty: Raid | null,
    userId: string | null,
    isOpenAdd: boolean,
    setOpenAdd: SetStateFn<boolean>,
    bosses: Boss[]
}
function AddPartyModal({ dispatch, selectedParty, userId, isOpenAdd, setOpenAdd, bosses }: AddPartyModalProps) {
    const [name, setName] = useState('');
    const [selectDate, setSelectDate] = useState<DateValue | null>(now(getLocalTimeZone()));
    const [content, setContent] = useState<Selection>(new Set([]));
    const [stages, setStages] = useState<ControlStage[]>([]);
    const [isLoadingAdd, setLoadingAdd] = useState(false);
    
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
        <Modal 
            radius="sm"
            isOpen={isOpenAdd}
            onOpenChange={(isOpen) => setOpenAdd(isOpen)}
            onClose={() => {
                setName('');
                setSelectDate(now(getLocalTimeZone()));
                setContent(new Set([]));
                setStages([]);
            }}>
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader>파티 추가</ModalHeader>
                        <ModalBody>
                            <div className="w-full max-h-[500px] sm:max-h-[800px] overflow-y-auto scroll-auto">
                                 <Input
                                    fullWidth
                                    isRequired
                                    label="파티명"
                                    placeholder="최대 20글자"
                                    value={name}
                                    radius="sm"
                                    size="sm"
                                    maxLength={20} 
                                    onValueChange={setName}
                                    className="mb-4"/>
                                <DatePicker
                                    isRequired
                                    label="일정 날짜"
                                    radius="sm"
                                    showMonthAndYearPickers
                                    defaultValue={selectDate}
                                    startContent={<CalendarIcon/>}
                                    onChange={setSelectDate}
                                    className="mb-4"/>
                                <Select
                                    isRequired
                                    label="콘텐츠"
                                    placeholder="콘텐츠 선택"
                                    radius="sm" 
                                    selectedKeys={content}
                                    onSelectionChange={setContent}
                                    className="mb-4">
                                    {getWeekContents(bosses, [], -1).map((boss) => (
                                        <SelectItem key={boss.key}>{boss.name}</SelectItem>
                                    ))}
                                </Select>
                                {Array.from(content)[0] ? getWeekStages(bosses, Array.from(content)[0].toString()).map((level, idx) => (
                                    <div key={idx} className="mb-3">
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
                                )) : null}
                                <Button
                                    fullWidth
                                    radius="sm"
                                    color="primary"
                                    isLoading={isLoadingAdd}
                                    isDisabled={name.trim() === '' || !Array.from(content)[0] || stages.length === 0 || isSelectedDifficulty(stages)}
                                    className="mb-3 mt-4"
                                    onPress={async () => await handleAddParty(userId, selectedParty, name, selectDate, Array.from(content)[0].toString(), stages, selectedParty?.party ?? [], onClose, setLoadingAdd, dispatch)}>
                                    추가
                                </Button>
                            </div>
                        </ModalBody>
                    </>
                )}
            </ModalContent>
        </Modal>
    )
}

// 순서 변경 Modal
type ChangePositionModalProps = {
    ui: {
        isOpenChangePosition: boolean,
        setOpenChangePosition: SetStateFn<boolean>,
        dispatch: AppDispatch
    },
    payload: {
        partyId: string,
        selectedParty: Raid,
        bosses: Boss[],
        members: RaidMember[]
    }
}
function ChangePositionModal({ui, payload}: ChangePositionModalProps) {
    const [isLoadingApply, setLoadingApply] = useState(false);
    const [partys, setPartys] = useState<DragableParty[]>([]);

    const maxLength = useMemo(() => {
        if (payload.selectedParty) {
            const party = payload.selectedParty.party.find(p => p.id === payload.partyId);
            if (party) {
                const findBoss = getBossDataById(payload.bosses, party.content);
                if (findBoss) return findBoss.max;
            }
        }
        return 0;
    }, [ui.isOpenChangePosition]);

    useEffect(() => {
        const findParty = payload.selectedParty.party.find(p => p.id === payload.partyId);
        if (findParty) {
            const partyCount = Math.ceil(maxLength/4);
            const tempPartys: DragableParty[] = [];
            for (let i = 1; i <= partyCount; i++) {
                const partyMembers: TeamCharacter[] = findParty.teams.filter(t => t.partyIndex === i);
                const members: TeamMember[] = partyMembers.map(c => ({
                    userId: c.userId,
                    nickname: c.nickname,
                    type: c.type,
                    isManager: c.isManager,
                    partyIndex: c.position
                }))
                tempPartys.push({
                    id: `party-${i}`,
                    index: i,
                    members: members
                });
            }
            setPartys(tempPartys);
        }
    }, [ui.isOpenChangePosition]);

    const onDragEnd = (e: DragEndEvent) => {
        const activeId = String(e.active.id);
        const overId = e.over?.id ? String(e.over.id) : null;
        if (!overId) return;

        if (!overId.startsWith("slot:")) return;
        if (!activeId.startsWith('char:')) return;

        setPartys(prev => moveOrSwapPartys(prev, activeId, overId));
    }

    return (
        <Modal
            scrollBehavior="inside"
            isDismissable={false}
            size={maxLength > 4 ? "3xl" : 'md'}
            radius="sm"
            isOpen={ui.isOpenChangePosition}
            onOpenChange={(isOpen) => ui.setOpenChangePosition(isOpen)}>
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader>파티원 순서 변경</ModalHeader>
                        <ModalBody>
                            <DndContext onDragEnd={onDragEnd}>
                                <div className={clsx(
                                    "w-full grid gap-3",
                                    maxLength > 4 ? 'min-[808px]:grid-cols-2' : ''
                                )}>
                                    {partys.map((party, index) => (
                                        <PartyCard party={party} key={index} partyIndex={index+1} members={payload.members}/>
                                    ))}
                                </div>
                            </DndContext>
                        </ModalBody>
                        <ModalFooter>
                            <Button
                                fullWidth
                                radius="sm"
                                color="primary"
                                isLoading={isLoadingApply}
                                onPress={async () => await handleChangePosition({
                                    setLoadingApply, onClose, dispatch: ui.dispatch
                                }, {
                                    changePartys: partys, partyId: payload.partyId, raid: payload.selectedParty
                                })}>
                                적용하기
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    )
}

// 순서 변경 파티 영역
function PartyCard({ members, party, partyIndex }: { members: RaidMember[], party: DragableParty, partyIndex: number }) {
    const slots = toSlots(party);
    return (
        <div className="w-full flex flex-col gap-2">
            <h3 className="font-bold">{partyIndex}파티</h3>
            {slots.map((member, slotIndex) => (
                <PartySlot key={slotIndex} partyId={party.id} slotIndex={slotIndex} member={member} members={members}/>
            ))}
        </div>
    )
}

// 슬롯에 있는 캐릭터 정보 표시
type PartySlotProps = {
    partyId: string,
    slotIndex: number,
    member: TeamMember | null,
    members: RaidMember[]
}
function PartySlot({ partyId, slotIndex, member, members }: PartySlotProps) {
    const { setNodeRef, isOver } = useDroppable({ id: `slot:${partyId}:${slotIndex}` });
    const { attributes, listeners, setNodeRef: setDraggableRef, transform } = useDraggable({
        id: `char:${partyId}:${member?.userId}`,
    });
    const style = transform ? {transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`} : undefined;

    return (
        <div 
            ref={setNodeRef} 
            className={clsx(
                'h-14 py-2 px-3 rounded-[8px] border-2 flex items-center gap-2 touch-none ',
                member ? member.type === 'attack' ? 'border-red-700' : 'border-green-500' : 'border-gray-300 dark:border-gray-700',
                isOver ? 'bg-gray-300 dark:bg-gray-700' : ''
            )}>
            {member ? (
                <div
                    ref={setDraggableRef}
                    {...listeners}
                    {...attributes}
                    style={style}
                    className="w-full cursor-grab flex gap-4 items-center rounded-[8px] bg-white dark:bg-[#171717]">
                    <JobEmblemIcon job={getCharacterInfoById(members, member.userId, member.nickname).job} size={32} className="text-black dark:text-white"/>
                    <div className="grow text-left">
                        <div className="flex gap-1">
                            <div className="flex items-center grow gap-1">
                                <p className="text-black dark:text-white">{member.nickname}</p>
                                <div className={clsx(
                                    "text-yellow-600 dark:text-yellow-400",
                                    member.isManager ? '' : 'hidden'
                                )}><LeaderIcon size={12}/></div>
                            </div>
                            <div className="flex gap-1">
                                {member.type === 'attack' ? data.classEffects.find(c => c.job === getCharacterInfoById(members, member.userId, member.nickname).job)?.effects.map((effect, index) => (
                                    <div key={index} className="rounded-md px-1 py-0.2 bg-[#eeeeee] dark:bg-[#2a2a2a] text-[8pt] text-black dark:text-white flex items-center text-center">{effect}</div>
                                )) : data.classEffects.find(c => c.job === getCharacterInfoById(members, member.userId, member.nickname).job)?.burf.map((effect, index) => (
                                    <div key={index} className="rounded-md px-1 py-0.2 bg-[#eeeeee] dark:bg-[#2a2a2a] text-[8pt] text-black dark:text-white flex items-center text-center">{effect}</div>
                                ))}
                            </div>
                        </div>
                        <div className="flex gap-1">
                            <p className="fadedtext text-[9pt] grow">{getCharacterInfoById(members, member.userId, member.nickname).job} · Lv.{getCharacterInfoById(members, member.userId, member.nickname).level} · {getCharacterInfoById(members, member.userId, member.nickname).server}</p>
                            <p className="fadedtext text-[9pt]">{member.userId}</p>
                        </div>
                    </div>
                </div>
            ) : (
                <>
                    <p className="text-lg font-bold fadedtext">{slotIndex+1}</p>
                    <p className="fadedtext ml-1">파티원이 비어있습니다.</p>
                </>
            )}
        </div>
    )
}

// 공대장 변경 Modal
type ChangeManagerModalProps = {
    dispatch: AppDispatch,
    setOpenChangeManager: SetStateFn<boolean>,
    isOpenChangeManager: boolean,
    selectedParty: Raid | null,
    partyId: string | null,
    userId: string | null,
    members: RaidMember[]
}
function ChangeManagerModal({ dispatch, setOpenChangeManager, isOpenChangeManager, selectedParty, partyId, userId, members }: ChangeManagerModalProps) {
    const characters = useMemo(() => { return getTeamCharactersList(selectedParty, partyId) }, [partyId]);
    const [selectedCharacter, setSelectedCharacter] = useState<TeamCharacter | null>(null);
    const [isLoadingChange, setLoadingChange] = useState(false);

    if (!selectedParty || !partyId || !userId) {
        return (
            <Modal
                radius="sm"
                isOpen={isOpenChangeManager}
                onOpenChange={(isOpen) => setOpenChangeManager(isOpen)}>
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader>오류 발생!</ModalHeader>
                            <ModalContent>
                                <div className="min-h-[200px] flex justify-center items-center text-md">
                                    데이터를 가져오는데 문제가 발생하였습니다.
                                </div>
                            </ModalContent>
                        </>
                    )}
                </ModalContent>
            </Modal>
        )
    }

    return (
        <Modal
            radius="sm"
            scrollBehavior="inside"
            isOpen={isOpenChangeManager}
            onOpenChange={(isOpen) => setOpenChangeManager(isOpen)}
            onClose={() => {
                setSelectedCharacter(null);
            }}>
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader>공대장 변경</ModalHeader>
                        <ModalBody>
                            <p>공대장을 위임할 캐릭터를 선택하세요.</p>
                            <div className="w-full max-h-[400px] overflow-y-auto overflow-x-hidden">
                                {characters.map((character, index) => {
                                    const characterInfo = getCharacterInfoById(members, character.userId, character.nickname);
                                    return (
                                        <div key={index} className="w-full min-h-[64px] mb-1">
                                            <Checkbox
                                                aria-label={character.nickname}
                                                classNames={{
                                                    base: cn(
                                                        "w-full max-w-full bg-content1",
                                                        "hover:bg-content2",
                                                        "cursor-pointer rounded-lg gap-2 border-2 border-transparent m-auto box-border",
                                                        "data-[selected=true]:border-primary"
                                                    ),
                                                    label: "w-full",
                                                }}
                                                isSelected={selectedCharacter ? selectedCharacter.nickname === character.nickname : false}
                                                onValueChange={(isSelected) => {
                                                    if (selectedCharacter) {
                                                        if (selectedCharacter.nickname === character.nickname) {
                                                            setSelectedCharacter(null);
                                                            return;
                                                        }
                                                    }
                                                    setSelectedCharacter(character);
                                                }}>
                                                <div className="w-full flex flex-col">
                                                    <span className="fadedtext text-sm">@{characterInfo.server} · {characterInfo.job} · Lv.{characterInfo.level}</span>
                                                    <div className="w-full flex gap-1 items-center">
                                                        <span className="text-md grow">{character.nickname}</span>
                                                        <span className="fadedtext text-sm">{character.userId}</span>
                                                    </div>
                                                </div>
                                            </Checkbox>
                                        </div>
                                    )
                                })}
                                <div className={clsx(
                                    "w-full h-[100px] flex justify-center items-center fadedtext",
                                    characters.length === 0 ? '' : 'hidden'
                                )}>
                                    공대장을 위임할 인원이 존재하지 않습니다.
                                </div>
                            </div>
                        </ModalBody>
                        <ModalFooter>
                            <Button
                                fullWidth
                                radius="sm"
                                color="primary"
                                isLoading={isLoadingChange}
                                isDisabled={selectedCharacter === null}
                                onPress={async () => await handleChangeManager({
                                    setLoadingChange, onClose, dispatch
                                }, {
                                    changeCharacter: selectedCharacter,
                                    partyId: partyId,
                                    raid: selectedParty,
                                    userId: userId
                                })}>
                                위임하기
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    )
}

// 파티 수정 Modal
type EditPartyModalProps = {
    dispatch: AppDispatch,
    setOpenEdit: SetStateFn<boolean>,
    isOpenEdit: boolean,
    selectedParty: Raid | null,
    partyId: string | null,
    bosses: Boss[]
}
export type EditBox = {
    name: string,
    date: DateValue | null,
    content: Selection,
    stages: ControlStage[]
}
function EditPartyModal({ dispatch, setOpenEdit, isOpenEdit, selectedParty, partyId, bosses }: EditPartyModalProps) {
    const [isLoadingEdit, setLoadingEdit] = useState(false);
    const [box, setBox] = useState<EditBox>({
        name: '',
        date: null,
        content: new Set([]),
        stages: []
    });

    useEffect(() => {
        if (!selectedParty || !partyId) return;
        const findParty = selectedParty.party.find(p => p.id === partyId);
        if (!findParty) return;
        setBox({
            name: findParty.name,
            date: parseAbsolute(findParty.date, 'Asia/Seoul'),
            content: new Set([findParty.content]),
            stages: findParty.stages
        })
    }, [isOpenEdit]);

    if (!selectedParty || !partyId) {
        return (
            <Modal
                radius="sm"
                isOpen={isOpenEdit}
                onOpenChange={(isOpen) => setOpenEdit(isOpen)}>
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader>오류 발생!</ModalHeader>
                            <ModalContent>
                                <div className="min-h-[200px] flex justify-center items-center text-md">
                                    데이터를 가져오는데 문제가 발생하였습니다.
                                </div>
                            </ModalContent>
                        </>
                    )}
                </ModalContent>
            </Modal>
        )
    }

    return (
        <Modal
            radius="sm"
            scrollBehavior="inside"
            isOpen={isOpenEdit}
            onOpenChange={(isOpen) => setOpenEdit(isOpen)}>
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader>파티 수정</ModalHeader>
                        <ModalBody>
                            <Input
                                fullWidth
                                isRequired
                                label="파티명"
                                placeholder="최대 20글자"
                                value={box.name}
                                radius="sm"
                                size="sm"
                                maxLength={20} 
                                onValueChange={(value) => setBox(prev => ({ ...prev, name: value }))}
                                className="mb-4"/>
                            <DatePicker
                                isRequired
                                label="일정 날짜"
                                radius="sm"
                                showMonthAndYearPickers
                                value={box.date}
                                startContent={<CalendarIcon/>}
                                onChange={(value) => setBox(prev => ({ ...prev, date: value }))}
                                className="mb-4"/>
                            <Select
                                isRequired
                                label="콘텐츠"
                                placeholder="콘텐츠 선택"
                                radius="sm" 
                                selectedKeys={box.content}
                                onSelectionChange={onSelectionChangeContent(bosses, box, setBox)}
                                className="mb-4">
                                {getWeekContents(bosses, [], -1).map((boss) => (
                                    <SelectItem key={boss.key}>{boss.name}</SelectItem>
                                ))}
                            </Select>
                            {Array.from(box.content)[0] ? getWeekStages(bosses, Array.from(box.content)[0].toString()).map((level, idx) => (
                                <div key={idx} className="mb-3">
                                    <h3 className="font-bold mb-1">{level}관문</h3>
                                    <Tabs 
                                        fullWidth 
                                        radius="sm" 
                                        color="primary"
                                        selectedKey={box.stages.length > idx ? box.stages[idx].difficulty : '선택안함'}
                                        onSelectionChange={onSelectionChangeStages(idx, box, setBox)}>
                                        {getDifficultyByStage(bosses, Array.from(box.content)[0].toString(), level).map((diff) => (
                                            <Tab key={diff} title={diff}/>
                                        ))}
                                    </Tabs>
                                </div>
                            )) : null}
                        </ModalBody>
                        <ModalFooter>
                            <Button
                                fullWidth
                                radius="sm"
                                color="primary"
                                isLoading={isLoadingEdit}
                                isDisabled={isDisableEditParty(box)}
                                onPress={async () => await handleEditParty({
                                    setLoadingEdit, onClose, dispatch
                                }, {
                                    box, partyId, raid: selectedParty, bosses
                                })}>
                                수정하기
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    )
}
