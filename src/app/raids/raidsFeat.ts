import { dateValueToDate, SetStateFn } from "@/utiils/utils";
import { Party, Raid } from "../api/raids/route";
import { ControlStage } from "../checklist/ChecklistForm";
import { DateValue } from "@internationalized/date";
import { addToast } from "@heroui/react";
import { WeekContent } from "../checklist/checklistFeat";

// 파티 데이터 불러오기
export function loadPartys(
    selectedParty: Raid | null, 
    setPartys: SetStateFn<Party[]>,
    setResults: SetStateFn<Party[]>
) {
    if (selectedParty) {
        const partys: Party[] = selectedParty.party;
        setPartys(partys);
        setResults(partys);
    }
}

// 난이도 선택했는지 여부 파악 함수
export function isSelectedDifficulty(stages: ControlStage[]) {
    return stages.length === 0 || stages.every(stage => stage.difficulty === '선택안함');
}

// 파티 추가 함수
export async function handleAddParty(
    userId: string | null,
    selectedParty: Raid | null,
    name: string,
    date: DateValue | null,
    content: string,
    stages: ControlStage[],
    partys: Party[],
    setPartys: SetStateFn<Party[]>,
    onClose: () => void,
    setLoadingAdd: SetStateFn<boolean>,
    weekContents: WeekContent[]
) {
    setLoadingAdd(true);
    if (selectedParty) {
        const now = new Date();
        let partyId: string = "null";
        do {
            partyId = generateRandom12DigitString();
        } while (partys.some(p => p.id === partyId));
        const contentName: string = weekContents.find(c => c.key === content)?.name ?? 'none';
        const party: Party = {
            id: partyId,
            name: name,
            date: dateValueToDate(date) ?? now,
            content: contentName,
            stages: stages,
            teams: []
        }
        const res = await fetch(`/api/raids`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: 'add-party',
                selectedParty: selectedParty,
                id: userId,
                partys: partys,
                addParty: party
            })
        });
        if (!res.ok) {
            addToast({
                title: `데이터 수정 오류`,
                description: `데이터를 수정하는데 문제가 발생하였습니다.`,
                color: "danger"
            });
            setLoadingAdd(false);
            return;
        }
        partys.push(party);
        setPartys(partys);
        addToast({
            title: `추가 완료`,
            description: `파티를 성공적으로 추가하였습니다.`,
            color: "success"
        });
        setLoadingAdd(false);
        onClose();
    } else {
        addToast({
            title: `오류 발생`,
            description: `선택된 파티가 존재하지 않습니다.`,
            color: "danger"
        });
        setLoadingAdd(false);
    }
}

// 무작위 8자리 숫자가 담긴 문자열 반환
function generateRandom12DigitString(): string {
    return Math.floor(100000000000 + Math.random() * 900000000000).toString();
}