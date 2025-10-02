import { useEffect, useState } from "react";
import { Boss } from "../api/checklist/boss/route";
import { Party, Raid } from "../api/raids/route";
import { loadPartys } from "./raidsFeat";
import { Button, Input, Select, Selection, SelectItem } from "@heroui/react";
import { useMobileQuery } from "@/utiils/utils";

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

    useEffect(() => {
        loadPartys(selectedParty, setPartys, setResults);
    }, [selectedParty]);

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