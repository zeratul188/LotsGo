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
import AddIcon from "@/app/icons/AddIcon";
import dynamic from "next/dynamic";
const FixedLineAd = dynamic(() => import("@/app/ad/FixedLineAd"), { ssr: false });

const raidModalClassNames = {
    backdrop: "bg-black/60 backdrop-blur-sm",
    base: "border border-default-200 bg-white shadow-2xl dark:border-white/10 dark:bg-[#171717]",
    header: "border-b border-default-200 px-5 py-4 dark:border-white/10",
    body: "gap-4 px-5 py-5",
    footer: "border-t border-default-200 px-5 py-4 dark:border-white/10"
};

const modalFieldClassNames = {
    inputWrapper: "border-default-200 bg-default-50/70 shadow-none hover:border-default-300 dark:border-white/10 dark:bg-white/[0.04]"
};

const modalSelectClassNames = {
    trigger: "border-default-200 bg-default-50/70 shadow-none hover:border-default-300 dark:border-white/10 dark:bg-white/[0.04]"
};

function ModalHeaderBlock({ title, description }: { title: string, description: string }) {
    return (
        <div className="space-y-1">
            <h2 className="text-lg font-bold text-foreground">{title}</h2>
            <p className="text-sm font-normal text-default-500">{description}</p>
        </div>
    )
}

function SearchIcon({ className = "h-5 w-5" }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="7"/>
            <path d="m20 20-3.5-3.5"/>
        </svg>
    )
}

function RefreshIcon({ className = "h-5 w-5" }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 11a8 8 0 1 0-2.3 5.7"/>
            <path d="M20 4v7h-7"/>
        </svg>
    )
}

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
    const [isOpenDelete, setOpenDelete] = useState(false);

    const selectedParty = useSelector((state: RootState) => state.party.selectedRaid);
    const userId = useSelector((state: RootState) => state.party.userId);
    const filteredParties = useMemo(() => {
        const keyword = searchValue.trim().toLowerCase();
        return (selectedParty?.party ?? [])
            .filter(filterPartys(bosses, searchContent))
            .filter(party => {
                if (!keyword) return true;
                return party.name.toLowerCase().includes(keyword)
                    || party.teams.some(character => character.nickname.toLowerCase().includes(keyword) || character.userId.toLowerCase().includes(keyword));
            });
    }, [bosses, searchContent, searchValue, selectedParty?.party]);

    if (!selectedParty) {
        return (
            <div className="w-full min-h-[800px] flex justify-center items-center">
                <p>선택된 파티가 존재하지 않습니다.</p>
            </div>
        )
    }

    return (
        <div className="w-full pt-2">
            <section className="rounded-2xl border border-default-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-[#171717] sm:p-5">
                <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <h2 className="text-lg font-bold text-foreground">레이드 파티 모집</h2>
                        <p className="mt-1 text-sm text-default-500">콘텐츠와 파티원을 검색하고 새로운 공격대를 구성할 수 있습니다.</p>
                    </div>
                    <Chip size="sm" radius="lg" variant="flat" color="primary" className="w-fit font-semibold">
                        검색 결과 {filteredParties.length}개
                    </Chip>
                </div>
                <div className="grid gap-3 lg:grid-cols-[minmax(0,240px)_minmax(0,1fr)_auto_auto_auto] lg:items-end">
                    <Select
                        label="콘텐츠"
                        placeholder="전체 콘텐츠"
                        selectedKeys={searchContent}
                        radius="lg"
                        variant="bordered"
                        onSelectionChange={setSearchContent}
                        classNames={modalSelectClassNames}>
                        {[...bosses].sort((a, b) => {
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
                        label="파티 검색"
                        placeholder="파티명 또는 파티원 닉네임"
                        value={searchValue}
                        radius="lg"
                        variant="bordered"
                        startContent={<SearchIcon className="h-4 w-4 text-default-400"/>}
                        onValueChange={setSearchValue}
                        classNames={modalFieldClassNames}/>
                    <Button
                        fullWidth={isMobile}
                        radius="lg"
                        size="lg"
                        variant="flat"
                        color="primary"
                        startContent={<SearchIcon/>}
                        className="font-semibold">
                        검색
                    </Button>
                    <Tooltip showArrow content="새로고침은 5초에 한 번씩 가능합니다.">
                        <Button
                            fullWidth={isMobile}
                            radius="lg"
                            size="lg"
                            variant="bordered"
                            isLoading={isLoadingRefresh}
                            isDisabled={isRefreshCooldown}
                            startContent={isLoadingRefresh ? null : <RefreshIcon/>}
                            className="border-default-200 font-semibold dark:border-white/10"
                            onPress={async () => await handleRefreshPartys(setLoadingRefresh, isRefreshCooldown, setRefreshCooldown, selectedParty?.id, dispatch)}>
                            새로고침
                        </Button>
                    </Tooltip>
                    <Button
                        fullWidth={isMobile}
                        radius="lg"
                        size="lg"
                        color="primary"
                        startContent={<AddIcon size={20}/>}
                        className="font-semibold shadow-lg shadow-primary/20"
                        onPress={() => setOpenAdd(true)}>
                        파티 추가
                    </Button>
                </div>
            </section>
            {isMobile ? null : (
                <div className="w-full flex justify-center overflow-hidden mt-8 mb-4">
                    <div className="w-full max-w-[1240px] flex justify-center rounded-2xl border border-default-200 bg-default-50 p-4 mx-4 dark:border-white/10 dark:bg-white/[0.03]">
                        <FixedLineAd isLoaded={true}/>
                    </div>
                </div>
            )}
            <div className={clsx(
                `mt-5 grid gap-5 min-[816px]:grid-cols-2 min-[1232px]:grid-cols-3`,
                filteredParties.length > 0 ? '' : 'hidden'
            )}>
                {filteredParties.map((party) => (
                    <Card
                        key={party.id}
                        radius="lg"
                        shadow="none"
                        className="overflow-hidden border border-default-200 bg-white transition-shadow hover:shadow-lg dark:border-white/10 dark:bg-[#171717]">
                        <CardHeader className="border-b border-default-200 px-5 pb-4 pt-5 dark:border-white/10">
                            <div className="w-full">
                                <div className="w-full flex gap-2 items-center">
                                    <div className="grow">
                                        <div className="mb-1 flex items-center gap-2">
                                            <span className="h-2 w-2 rounded-full bg-primary shadow-[0_0_8px_rgba(0,111,238,0.7)]"/>
                                            <p className="text-lg font-bold text-foreground">{party.name}</p>
                                        </div>
                                        <p className="text-sm font-medium text-default-600">{toStringByRaidDate(new Date(party.date))}</p>
                                    </div>
                                    <Dropdown>
                                        <DropdownTrigger>
                                            <Button isIconOnly radius="lg" variant="flat" size="sm" aria-label={`${party.name} 설정`}><SettingIcon size={20} className="text-default-500" /></Button>
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
                                                    setPartyId(party.id);
                                                    setOpenDelete(true);
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
                                <p className="mt-2 text-sm text-default-500">{getBossById(bosses, party.content)?.name}</p>
                                <div className="mt-3 flex flex-wrap gap-2">
                                    {party.stages.map((stage, index) => {
                                        if (stage.difficulty === '선택안함') return null;
                                        return (
                                            <Chip
                                                key={index}
                                                color={getTextColorByDifficulty(stage.difficulty)}
                                                radius="lg"
                                                variant="flat"
                                                size="sm"
                                                className="font-semibold">
                                                {stage.difficulty} {stage.stage}관
                                            </Chip>
                                        )
                                    })}
                                </div>
                            </div>
                        </CardHeader>
                        <CardBody className="gap-4 px-4 py-4">
                            <Tabs
                                fullWidth
                                radius="lg"
                                size="sm"
                                classNames={{
                                    tabList: "bg-default-100 p-1 dark:bg-white/[0.06]",
                                    cursor: "bg-white shadow-sm dark:bg-white/10",
                                    tabContent: "font-semibold group-data-[selected=true]:text-primary"
                                }}>
                                {Array.from({ length: Math.ceil(getMaxLengthByContent(bosses, party.content)/4) }, (_, i) => i + 1).map((index) => (
                                    <Tab key={index} title={`${index}파티`}>
                                        <div className="w-full flex flex-col gap-2">
                                            {[1, 2, 3, 4].map((position) => {
                                                const teamCharacter = party.teams.find(t => t.partyIndex === index && t.position === position);
                                                return teamCharacter ? (
                                                    <Button
                                                        key={position}
                                                        variant="bordered"
                                                        radius="lg"
                                                        className={clsx(
                                                            "h-16 border bg-transparent px-3 transition-colors",
                                                            teamCharacter.type === 'supporter'
                                                                ? "border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50 dark:border-emerald-500/30 dark:bg-emerald-500/[0.06]"
                                                                : "border-rose-200 bg-rose-50/50 hover:bg-rose-50 dark:border-rose-500/30 dark:bg-rose-500/[0.06]"
                                                        )}>
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
                                                        radius="lg"
                                                        className="h-16 border-dashed border-default-300 bg-default-50/60 hover:border-primary/50 hover:bg-primary-50/40 dark:border-white/15 dark:bg-white/[0.02] dark:hover:bg-primary-500/[0.08]"
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
                                                            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-default-200 text-sm font-bold text-default-600 dark:bg-white/10">{position}</span>
                                                            <div className="text-left">
                                                                <p className="text-sm font-semibold text-default-600">모집 중</p>
                                                                <p className="text-xs text-default-400">클릭하여 캐릭터 선택</p>
                                                            </div>
                                                        </div>
                                                    </Button>
                                                )
                                            })}
                                        </div>
                                        <div className="mt-3 rounded-xl border border-default-200 bg-default-50/60 p-3 dark:border-white/10 dark:bg-white/[0.03]">
                                        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-default-500">파티 시너지</p>
                                        <div className="w-full flex min-h-6 flex-wrap gap-2">
                                            {getEffectsByPartyMembers(members, party.teams, index).map((effect, index) => (
                                                <Chip key={index} variant="flat" size="sm" radius="lg" color="secondary">{effect}</Chip>
                                            ))}
                                        </div>
                                        </div>
                                    </Tab>
                                ))}
                            </Tabs>
                            <div className="flex w-full items-center gap-3 rounded-xl bg-default-50 px-3 py-2 dark:bg-white/[0.03]">
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
                                <p className="text-sm font-bold text-foreground">{party.teams.length}<span className="font-normal text-default-400">/{getMaxLengthByContent(bosses, party.content)}</span></p>
                            </div>
                        </CardBody>
                        <CardFooter className="px-4 pb-4 pt-0">
                            <Button
                                fullWidth
                                color='danger'
                                radius="lg"
                                variant="flat"
                                className="font-semibold"
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
                filteredParties.length === 0 ? '' : 'hidden'
            )}>
                <div className="flex items-center justify-center">
                    <SearchEmptyIcon size={82} className="text-default-400" />
                </div>
                <div className="space-y-1">
                    <p className="text-lg text-foreground">{selectedParty.party.length === 0 ? '추가된 파티가 없습니다.' : '조건에 맞는 파티가 없습니다.'}</p>
                    <p className="text-sm fadedtext">{selectedParty.party.length === 0 ? '새 파티를 추가하면 이곳에 표시됩니다.' : '검색어나 콘텐츠 필터를 변경해보세요.'}</p>
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
            <DeletePartyModal
                dispatch={dispatch}
                selectedParty={selectedParty}
                partyId={partyId}
                isOpenDelete={isOpenDelete}
                setOpenDelete={setOpenDelete}/>
        </div>
    )
}

type DeletePartyModalProps = {
    dispatch: AppDispatch,
    selectedParty: Raid,
    partyId: string | null,
    isOpenDelete: boolean,
    setOpenDelete: SetStateFn<boolean>
}
function DeletePartyModal({ dispatch, selectedParty, partyId, isOpenDelete, setOpenDelete }: DeletePartyModalProps) {
    const [isLoadingDelete, setLoadingDelete] = useState(false);
    const party = selectedParty.party.find(item => item.id === partyId);

    return (
        <Modal
            radius="lg"
            classNames={raidModalClassNames}
            isOpen={isOpenDelete}
            onOpenChange={setOpenDelete}>
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader>
                            <ModalHeaderBlock title="파티 삭제" description="삭제한 파티와 참여 정보는 복구할 수 없습니다."/>
                        </ModalHeader>
                        <ModalBody>
                            <div className="rounded-xl border border-danger-200 bg-danger-50/70 p-4 dark:border-danger-500/30 dark:bg-danger-500/10">
                                <p className="text-sm text-default-500">삭제할 파티</p>
                                <p className="mt-1 font-bold text-foreground">{party?.name ?? '선택된 파티'}</p>
                                <p className="mt-2 text-sm text-danger">정말 이 파티를 삭제하시겠습니까?</p>
                            </div>
                        </ModalBody>
                        <ModalFooter>
                            <Button radius="lg" variant="light" onPress={onClose}>취소</Button>
                            <Button
                                radius="lg"
                                color="danger"
                                className="min-w-32 font-semibold"
                                isLoading={isLoadingDelete}
                                isDisabled={!partyId}
                                onPress={async () => {
                                    if (!partyId) return;
                                    setLoadingDelete(true);
                                    try {
                                        await deleteParty(dispatch, selectedParty, partyId);
                                        onClose();
                                    } finally {
                                        setLoadingDelete(false);
                                    }
                                }}>
                                삭제하기
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
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
                radius="lg"
                classNames={raidModalClassNames}
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
            radius="lg"
            size="lg"
            classNames={raidModalClassNames}
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
                            <ModalHeaderBlock title={party.name} description={`${partyNumber}파티 ${position}번 자리에 참여할 캐릭터를 선택하세요.`}/>
                        </ModalHeader>
                        <ModalBody>
                            <Tabs
                                fullWidth
                                radius="lg"
                                color="primary"
                                aria-label="characters-type"
                                selectedKey={tab}
                                classNames={{
                                    tabList: "bg-default-100 p-1 dark:bg-white/[0.06]",
                                    cursor: "bg-white shadow-sm dark:bg-white/10",
                                    tabContent: "font-semibold group-data-[selected=true]:text-primary"
                                }}
                                onSelectionChange={(key: Key) => {
                                    setTab(String(key));
                                    setSelectedCharacter(null);
                                }}>
                                <Tab key="expeditions" title="원정대"/>
                                <Tab key="checklist" title="숙제"/>
                            </Tabs>
                            <div className="max-h-[400px] w-full space-y-2 overflow-y-auto overflow-x-hidden pr-1">
                                {characters.map((character, index) => (
                                    <div key={index} className="w-full min-h-[64px]">
                                        <Checkbox
                                            aria-label={character.nickname}
                                            isDisabled={character.isDisable}
                                            classNames={{
                                                base: cn(
                                                    "m-auto box-border w-full max-w-full gap-3 rounded-xl border border-default-200 bg-default-50/60 px-3 py-2",
                                                    "cursor-pointer hover:border-primary/40 hover:bg-primary-50/30 dark:border-white/10 dark:bg-white/[0.03]",
                                                    "data-[selected=true]:border-primary data-[selected=true]:bg-primary-50 dark:data-[selected=true]:bg-primary-500/10"
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
                                radius="lg"
                                color="primary"
                                aria-label="characters-type"
                                selectedKey={tabType}
                                classNames={{
                                    tabList: "bg-default-100 p-1 dark:bg-white/[0.06]",
                                    cursor: "bg-white shadow-sm dark:bg-white/10",
                                    tabContent: "font-semibold group-data-[selected=true]:text-primary"
                                }}
                                onSelectionChange={(key: Key) => setTabType(String(key))}
                                className={clsx(
                                    selectedCharacter ? data.classSupporters.includes(selectedCharacter.job) ? '' : 'hidden' : 'hidden'
                                )}>
                                <Tab key="supporter" title="서폿"/>
                                <Tab key="attack" title="딜러"/>
                            </Tabs>
                            <p className={clsx(
                                'rounded-lg bg-danger-50 px-3 py-2 text-xs text-danger dark:bg-danger-500/10',
                                isHaveManager ? '' : 'hidden'
                            )}>해당 파티에 이미 공대장이 존재합니다.</p>
                            <div className="rounded-xl border border-default-200 bg-default-50/60 p-3 dark:border-white/10 dark:bg-white/[0.03]">
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
                                <p className="mt-2 text-sm text-default-500">현재 {party.teams.length}명 참여 · 정원 {maxLength ?? 0}명</p>
                            </div>
                        </ModalBody>
                        <ModalFooter>
                            <Button radius="lg" variant="light" onPress={onClose}>취소</Button>
                            <Button
                                radius="lg"
                                color="primary"
                                className="min-w-32 font-semibold"
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
            radius="lg"
            size="lg"
            scrollBehavior="inside"
            classNames={raidModalClassNames}
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
                        <ModalHeader>
                            <ModalHeaderBlock title="새 파티 만들기" description="레이드 일정과 관문 난이도를 설정해 모집을 시작합니다."/>
                        </ModalHeader>
                        <ModalBody>
                            <div className="w-full space-y-4">
                                 <Input
                                    fullWidth
                                    isRequired
                                    label="파티명"
                                    placeholder="최대 20글자"
                                    value={name}
                                    radius="lg"
                                    variant="bordered"
                                    maxLength={20} 
                                    onValueChange={setName}
                                    classNames={modalFieldClassNames}/>
                                <DatePicker
                                    isRequired
                                    label="일정 날짜"
                                    radius="lg"
                                    variant="bordered"
                                    showMonthAndYearPickers
                                    defaultValue={selectDate}
                                    startContent={<CalendarIcon/>}
                                    onChange={setSelectDate}
                                    classNames={modalFieldClassNames}/>
                                <Select
                                    isRequired
                                    label="콘텐츠"
                                    placeholder="콘텐츠 선택"
                                    radius="lg"
                                    variant="bordered"
                                    selectedKeys={content}
                                    onSelectionChange={setContent}
                                    classNames={modalSelectClassNames}>
                                    {getWeekContents(bosses, [], -1).map((boss) => (
                                        <SelectItem key={boss.key}>{boss.name}</SelectItem>
                                    ))}
                                </Select>
                                {Array.from(content)[0] ? getWeekStages(bosses, Array.from(content)[0].toString()).map((level, idx) => (
                                    <div key={idx} className="rounded-xl border border-default-200 bg-default-50/60 p-3 dark:border-white/10 dark:bg-white/[0.03]">
                                        <h3 className="mb-2 text-sm font-bold">{level}관문 난이도</h3>
                                        <Tabs 
                                            fullWidth 
                                            radius="lg"
                                            color="primary"
                                            classNames={{ tabList: "bg-default-100 p-1 dark:bg-white/[0.06]", tabContent: "font-semibold" }}
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
                            </div>
                        </ModalBody>
                        <ModalFooter>
                            <Button radius="lg" variant="light" onPress={onClose}>취소</Button>
                            <Button
                                radius="lg"
                                color="primary"
                                className="min-w-32 font-semibold"
                                isLoading={isLoadingAdd}
                                isDisabled={name.trim() === '' || !Array.from(content)[0] || stages.length === 0 || isSelectedDifficulty(stages)}
                                onPress={async () => await handleAddParty(userId, selectedParty, name, selectDate, Array.from(content)[0].toString(), stages, selectedParty?.party ?? [], onClose, setLoadingAdd, dispatch)}>
                                파티 만들기
                            </Button>
                        </ModalFooter>
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
            radius="lg"
            classNames={raidModalClassNames}
            isOpen={ui.isOpenChangePosition}
            onOpenChange={(isOpen) => ui.setOpenChangePosition(isOpen)}>
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader>
                            <ModalHeaderBlock title="파티원 순서 변경" description="캐릭터 카드를 끌어 원하는 파티와 자리로 이동하세요."/>
                        </ModalHeader>
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
                            <Button radius="lg" variant="light" onPress={onClose}>취소</Button>
                            <Button
                                radius="lg"
                                color="primary"
                                className="min-w-32 font-semibold"
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
        <div className="flex w-full flex-col gap-2 rounded-xl border border-default-200 bg-default-50/60 p-3 dark:border-white/10 dark:bg-white/[0.03]">
            <h3 className="flex items-center gap-2 text-sm font-bold"><span className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary/10 text-xs text-primary">{partyIndex}</span>{partyIndex}파티</h3>
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
                'flex h-16 touch-none items-center gap-2 rounded-xl border px-3 py-2 transition-colors',
                member ? member.type === 'attack' ? 'border-rose-300 bg-rose-50/50 dark:border-rose-500/30 dark:bg-rose-500/[0.06]' : 'border-emerald-300 bg-emerald-50/50 dark:border-emerald-500/30 dark:bg-emerald-500/[0.06]' : 'border-dashed border-default-300 bg-white dark:border-white/15 dark:bg-white/[0.02]',
                isOver ? 'border-primary bg-primary-50 dark:bg-primary-500/10' : ''
            )}>
            {member ? (
                <div
                    ref={setDraggableRef}
                    {...listeners}
                    {...attributes}
                    style={style}
                    className="flex w-full cursor-grab items-center gap-3 rounded-lg bg-transparent">
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
                radius="lg"
                classNames={raidModalClassNames}
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
            radius="lg"
            size="lg"
            classNames={raidModalClassNames}
            scrollBehavior="inside"
            isOpen={isOpenChangeManager}
            onOpenChange={(isOpen) => setOpenChangeManager(isOpen)}
            onClose={() => {
                setSelectedCharacter(null);
            }}>
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader>
                            <ModalHeaderBlock title="공대장 변경" description="공대장 권한을 위임할 캐릭터를 선택하세요."/>
                        </ModalHeader>
                        <ModalBody>
                            <div className="max-h-[400px] w-full space-y-2 overflow-y-auto overflow-x-hidden pr-1">
                                {characters.map((character, index) => {
                                    const characterInfo = getCharacterInfoById(members, character.userId, character.nickname);
                                    return (
                                        <div key={index} className="w-full min-h-[64px]">
                                            <Checkbox
                                                aria-label={character.nickname}
                                                classNames={{
                                                    base: cn(
                                                        "m-auto box-border w-full max-w-full gap-3 rounded-xl border border-default-200 bg-default-50/60 px-3 py-2",
                                                        "cursor-pointer hover:border-primary/40 hover:bg-primary-50/30 dark:border-white/10 dark:bg-white/[0.03]",
                                                        "data-[selected=true]:border-primary data-[selected=true]:bg-primary-50 dark:data-[selected=true]:bg-primary-500/10"
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
                            <Button radius="lg" variant="light" onPress={onClose}>취소</Button>
                            <Button
                                radius="lg"
                                color="primary"
                                className="min-w-32 font-semibold"
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
                radius="lg"
                classNames={raidModalClassNames}
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
            radius="lg"
            size="lg"
            classNames={raidModalClassNames}
            scrollBehavior="inside"
            isOpen={isOpenEdit}
            onOpenChange={(isOpen) => setOpenEdit(isOpen)}>
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader>
                            <ModalHeaderBlock title="파티 정보 수정" description="일정, 콘텐츠와 관문 난이도를 다시 설정합니다."/>
                        </ModalHeader>
                        <ModalBody>
                            <Input
                                fullWidth
                                isRequired
                                label="파티명"
                                placeholder="최대 20글자"
                                value={box.name}
                                radius="lg"
                                variant="bordered"
                                maxLength={20} 
                                onValueChange={(value) => setBox(prev => ({ ...prev, name: value }))}
                                classNames={modalFieldClassNames}/>
                            <DatePicker
                                isRequired
                                label="일정 날짜"
                                radius="lg"
                                variant="bordered"
                                showMonthAndYearPickers
                                value={box.date}
                                startContent={<CalendarIcon/>}
                                onChange={(value) => setBox(prev => ({ ...prev, date: value }))}
                                classNames={modalFieldClassNames}/>
                            <Select
                                isRequired
                                label="콘텐츠"
                                placeholder="콘텐츠 선택"
                                radius="lg"
                                variant="bordered"
                                selectedKeys={box.content}
                                onSelectionChange={onSelectionChangeContent(bosses, box, setBox)}
                                classNames={modalSelectClassNames}>
                                {getWeekContents(bosses, [], -1).map((boss) => (
                                    <SelectItem key={boss.key}>{boss.name}</SelectItem>
                                ))}
                            </Select>
                            {Array.from(box.content)[0] ? getWeekStages(bosses, Array.from(box.content)[0].toString()).map((level, idx) => (
                                <div key={idx} className="rounded-xl border border-default-200 bg-default-50/60 p-3 dark:border-white/10 dark:bg-white/[0.03]">
                                    <h3 className="mb-2 text-sm font-bold">{level}관문 난이도</h3>
                                    <Tabs 
                                        fullWidth 
                                        radius="lg"
                                        color="primary"
                                        classNames={{ tabList: "bg-default-100 p-1 dark:bg-white/[0.06]", tabContent: "font-semibold" }}
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
                            <Button radius="lg" variant="light" onPress={onClose}>취소</Button>
                            <Button
                                radius="lg"
                                color="primary"
                                className="min-w-32 font-semibold"
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
