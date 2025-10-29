import { useEffect, useState } from "react";
import { Boss } from "../api/checklist/boss/route";
import { Party, Raid } from "../api/raids/route";
import { loadPartys } from "./raidsFeat";
import { Button, DatePicker, Input, Modal, ModalBody, ModalContent, ModalHeader, Select, Selection, SelectItem, Tab, Tabs } from "@heroui/react";
import { SetStateFn, useMobileQuery } from "@/utiils/utils";
import { DateValue, getLocalTimeZone, now } from "@internationalized/date";
import CalendarIcon from "@/Icons/CalendarIcon";
import { getBossesById, getDifficultyByStage, getWeekContents, getWeekStages } from "../checklist/checklistFeat";
import { ControlStage } from "../checklist/ChecklistForm";

// 파티 내 레이드 목록 컴포넌트
type PartyRaidsComponentProps = {
    selectedParty: Raid | null,
    bosses: Boss[]
}
export function PartyRaidsComponent({selectedParty, bosses}: PartyRaidsComponentProps) {
    const [partys, setPartys] = useState<Party[]>([]);
    const [results, setResults] = useState<Party[]>([]);
    const [searchContent, setSearchContent] = useState<Selection>(new Set([]));
    const [searchValue, setSearchValue] = useState(''); 
    const isMobile = useMobileQuery();

    const [isOpenAdd, setOpenAdd] = useState(false);

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
            setResults(partys.filter(party => party.content === selectedBoss.name));
        }
    }, [searchContent]);

    return (
        <div className="w-full">
            <div className="w-full flex gap-3">
                <Select
                    label="콘텐츠 선택"
                    placeholder="콘텐츠를 선택하세요."
                    selectedKeys={searchContent}
                    radius="sm"
                    size="sm"
                    onSelectionChange={setSearchContent}
                    className="w-full sm:w-[300px]">
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
                    className="w-full sm:w-[300px]"/>
                <Button
                    fullWidth={isMobile}
                    radius="sm"
                    size="lg"
                    color="primary">
                    검색
                </Button>
                <div className="grow"/>
                <Button
                    fullWidth={isMobile}
                    radius="sm"
                    size="lg"
                    color="primary"
                    onPress={() => setOpenAdd(true)}>
                    파티 추가
                </Button>
            </div>
            <AddPartyModal 
                isOpenAdd={isOpenAdd}
                setOpenAdd={setOpenAdd}
                partys={partys}
                setPartys={setPartys}
                bosses={bosses}/>
        </div>
    )
}

// 파티 추가 Modal
type AddPartyModalProps = {
    isOpenAdd: boolean,
    setOpenAdd: SetStateFn<boolean>,
    partys: Party[],
    setPartys: SetStateFn<Party[]>,
    bosses: Boss[]
}
function AddPartyModal({ isOpenAdd, setOpenAdd, partys, setPartys, bosses }: AddPartyModalProps) {
    const [name, setName] = useState('');
    const [selectDate, setSelectDate] = useState<DateValue | null>(now(getLocalTimeZone()));
    const [content, setContent] = useState<Selection>(new Set([]));
    const [stages, setStages] = useState<ControlStage[]>([]);
    
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
                                    isDisabled={name.trim() === '' || !Array.from(content)[0] || stages.length === 0}
                                    className="mb-3 mt-4">
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