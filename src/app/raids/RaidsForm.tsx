import { useEffect, useState } from "react";
import { Boss } from "../api/checklist/boss/route";
import { Party, Raid } from "../api/raids/route";
import { loadPartys } from "./raidsFeat";
import { Button, Input, Modal, ModalBody, ModalContent, ModalHeader, Select, Selection, SelectItem } from "@heroui/react";
import { SetStateFn, useMobileQuery } from "@/utiils/utils";

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
                    color="primary">
                    파티 추가
                </Button>
            </div>
        </div>
    )
}

// 파티 추가 Modal
type AddPartyModalProps = {
    isOpenAdd: boolean,
    setOpenAdd: SetStateFn<boolean>,
    partys: Party[],
    setPartys: SetStateFn<Party[]>
}
function AddPartyModal({ isOpenAdd, setOpenAdd, partys, setPartys }: AddPartyModalProps) {
    return (
        <Modal 
            radius="sm"
            isOpen={isOpenAdd}>
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader>파티 추가</ModalHeader>
                        <ModalBody>
                            <div className="w-full max-h-[500px] sm:max-h-[800px] overflow-y-auto scroll-auto">
                                 
                            </div>
                        </ModalBody>
                    </>
                )}
            </ModalContent>
        </Modal>
    )
}