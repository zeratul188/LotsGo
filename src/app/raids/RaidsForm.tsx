import { Key, useEffect, useMemo, useState } from "react";
import { Boss } from "../api/checklist/boss/route";
import { Party, Raid } from "../api/raids/route";
import { getBossById, getBossDataById, handleAddParty, InvolvedCharacter, isExistPartyMember, isSelectedDifficulty, loadPartys, toCheckData, toStringByRaidDate } from "./raidsFeat";
import { Button, Card, CardBody, CardFooter, CardHeader, Checkbox, Chip, cn, DatePicker, Divider, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Select, Selection, SelectItem, Tab, Tabs, Tooltip } from "@heroui/react";
import { SetStateFn, useMobileQuery } from "@/utiils/utils";
import { DateValue, getLocalTimeZone, now } from "@internationalized/date";
import CalendarIcon from "@/Icons/CalendarIcon";
import { getBossesById, getDifficultyByStage, getTextColorByDifficulty, getWeekContents, getWeekStages } from "../checklist/checklistFeat";
import { ControlStage } from "../checklist/ChecklistForm";
import { RaidMember } from "../api/raids/members/route";
import { SettingIcon } from "../icons/SettingIcon";
import clsx from "clsx";
import data from "@/data/characters/data.json";
import { useSelector } from "react-redux";
import { AppDispatch, RootState } from "../store/store";
import { handleRefreshPartys } from "./raidListFeat";

// 파티 내 레이드 목록 컴포넌트
type PartyRaidsComponentProps = {
    dispatch: AppDispatch,
    members: RaidMember[],
    bosses: Boss[]
}
export function PartyRaidsComponent({dispatch, members, bosses}: PartyRaidsComponentProps) {
    const [partys, setPartys] = useState<Party[]>([]);
    const [results, setResults] = useState<Party[]>([]);
    const [searchContent, setSearchContent] = useState<Selection>(new Set([]));
    const [searchValue, setSearchValue] = useState(''); 
    const isMobile = useMobileQuery();

    const [isOpenAdd, setOpenAdd] = useState(false);
    const [isOpenInvolved, setOpenInvolved] = useState(false);
    const [partyId, setPartyId] = useState<string | null>(null);
    const [isLoadingRefresh, setLoadingRefresh] = useState(false);
    const [isRefreshCooldown, setRefreshCooldown] = useState(false);

    const selectedParty = useSelector((state: RootState) => state.party.selectedRaid);
    const userId = useSelector((state: RootState) => state.party.userId);

    useEffect(() => {
        loadPartys(selectedParty, setPartys, setResults);
    }, [selectedParty]);

    useEffect(() => {
        const valueList = Array.from(searchContent);
        if (valueList.length === 0) {
            setResults(partys);
        } else {
            const selectedIndex = Number(valueList[0]);
            const selectedBoss = bosses.sort((a, b) => {
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
            })[selectedIndex];
            setResults(partys.filter(party => getBossById(bosses, party.content)?.name === selectedBoss.name));
        }
    }, [searchContent, partys]);

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
            <div className={clsx(
                `grid gap-4 min-[816px]:grid-cols-2 min-[1232px]:grid-cols-3 mt-4`,
                results.length > 0 ? '' : 'hidden'
            )}>
                {results.map((party) => (
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
                                    <Button isIconOnly variant="light" size="sm"><SettingIcon size={24} className="text-gray-500 hover:text-gray-800 cursor-pointer" /></Button>
                                </div>
                                <p className="fadedtext text-sm mt-1">{getBossById(bosses, party.content)?.name}</p>
                                <div className="grid gap-2 grid-cols-4 mt-1">
                                    {party.stages.map((stage, index) => (
                                        <Chip
                                            key={index}
                                            color={getTextColorByDifficulty(stage.difficulty)}
                                            radius="sm"
                                            variant="flat"
                                            size="sm"
                                            className="min-w-full text-center">
                                            {stage.difficulty} {stage.stage}관
                                        </Chip>
                                    ))}
                                </div>
                            </div>
                        </CardHeader>
                        <Divider/>
                        <CardBody>
                            
                        </CardBody>
                        <CardFooter>
                            <Button
                                fullWidth
                                color={isExistPartyMember(userId, party.teams) ? 'danger' : 'primary'}
                                radius="sm"
                                onPress={() => {
                                    setPartyId(party.id);
                                    setOpenInvolved(true)
                                }}>
                                {isExistPartyMember(userId, party.teams) ? '참여 취소' : '참여하기'}
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
            <div className={clsx(
                `w-full h-[500px] flex items-center justify-center flex-col`,
                results.length === 0 ? '' : 'hidden'
            )}>
                Nothing else.
            </div>
            <AddPartyModal 
                selectedParty={selectedParty}
                userId={userId}
                isOpenAdd={isOpenAdd}
                setOpenAdd={setOpenAdd}
                partys={partys}
                setPartys={setPartys}
                bosses={bosses}/>
            <InvolvedModal
                partyId={partyId}
                setPartyId={setPartyId}
                members={members}
                userId={userId}
                bosses={bosses}
                partys={partys}
                selectedParty={selectedParty}
                isOpenInvoled={isOpenInvolved}
                setOpenInvoled={setOpenInvolved}/>
        </div>
    )
}

// 파티 참여 Modal
type InvoledModalProps = {
    partyId: string | null,
    setPartyId: SetStateFn<string | null>,
    members: RaidMember[],
    userId: string | null,
    bosses: Boss[],
    partys: Party[],
    selectedParty: Raid | null,
    isOpenInvoled: boolean,
    setOpenInvoled: SetStateFn<boolean>
}
function InvolvedModal({ partyId, members, userId, bosses, partys, selectedParty, isOpenInvoled, setOpenInvoled }: InvoledModalProps) {
    const [tab, setTab] = useState('expeditions');
    const [tabType, setTabType] = useState('supporter');
    const [isManager, setManager] = useState(false);
    const [isHaveManager, setHaveManager] = useState(false);
    const [maxLength, setMaxLength] = useState(0);
    const party = useMemo(
        () => partys.find(p => p.id === partyId),
        [partys, partyId]
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
        const findBoss = getBossDataById(bosses, party?.content ?? 'null');
        if (findBoss) {
            setMaxLength(findBoss.max);
        }
    }, [party]);
    
    return (
        <Modal
            radius="sm"
            isOpen={isOpenInvoled}
            onOpenChange={(isOpen) => setOpenInvoled(isOpen)}
            onClose={() => {
                setSelectedCharacter(null);
                setHaveManager(false);
                setManager(false);
                setMaxLength(0);
                setTabType('supporter');
            }}>
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader>{party?.name}</ModalHeader>
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
                            <p>총 {maxLength ?? 0}명 중 {0}명이 참여하였습니다.</p>
                        </ModalBody>
                        <ModalFooter>
                            <Button
                                fullWidth
                                radius="sm"
                                color="primary"
                                isDisabled={selectedCharacter === null}>
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
    selectedParty: Raid | null,
    userId: string | null,
    isOpenAdd: boolean,
    setOpenAdd: SetStateFn<boolean>,
    partys: Party[],
    setPartys: SetStateFn<Party[]>,
    bosses: Boss[]
}
function AddPartyModal({ selectedParty, userId, isOpenAdd, setOpenAdd, partys, setPartys, bosses }: AddPartyModalProps) {
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
            onOpenChange={(isOpen) => setOpenAdd(isOpen)}>
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
                                    onPress={async () => await handleAddParty(userId, selectedParty, name, selectDate, Array.from(content)[0].toString(), stages, partys, setPartys, onClose, setLoadingAdd)}>
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