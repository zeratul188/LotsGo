import { dateValueToDate, SetStateFn } from "@/utiils/utils";
import { Party, Raid, TeamCharacter } from "../api/raids/route";
import { ControlStage } from "../checklist/ChecklistForm";
import { DateValue } from "@internationalized/date";
import { addToast } from "@heroui/react";
import { getWeekContents, WeekContent } from "../checklist/checklistFeat";
import { Boss } from "../api/checklist/boss/route";

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
    setLoadingAdd: SetStateFn<boolean>
) {
    setLoadingAdd(true);
    if (selectedParty) {
        const now = new Date();
        let partyId: string = "null";
        do {
            partyId = generateRandom12DigitString();
        } while (partys.some(p => p.id === partyId));
        const party: Party = {
            id: partyId,
            name: name,
            date: dateValueToDate(date) ?? now,
            content: content,
            stages: stages,
            teams: []
        }
        const res = await fetch(`/api/raids`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: 'addParty',
                partyId: selectedParty.id,
                id: userId,
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
        const clonePartys = structuredClone(partys);
        clonePartys.push(party);
        setPartys(clonePartys);
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

// 보스 이름 가져오기
export function getBossById(bosses: Boss[], contentId: string): WeekContent | null {
    return getWeekContents(bosses, [], -1).find(c => c.key === contentId) ?? null;
}

// 레이드 날짜 문자열 표기
export function toStringByRaidDate(date: Date): string {
    const year = date.getFullYear();
    const month = date.getMonth()+1;
    const day = date.getDate();
    const weekdays = ["일", "월", "화", "수", "목", "금", "토"];
    const weekDay = weekdays[date.getDay()];
    const hour24 = date.getHours();
    const min = date.getMinutes();
    const period = hour24 < 12 ? '오전' : '오후';
    const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
    return `${year}년 ${month}월 ${day}일 ${weekDay}요일 ${period} ${hour12}시 ${min !== 0 ? `${min}분` : ''}`;
}

// 이미 파티에 참여했는지 파악 여부
export function isExistPartyMember(userId: string | null, teams: TeamCharacter[]): boolean {
    if (!userId) return true;
    return teams.some(member => member.userId === userId);
}

// 체크박스 리스트
export type InvolvedCharacter = {
    nickname: string,
    level: number,
    server: string,
    job: string,
    isDisable: boolean
}
type InvolvedSource = Pick<
    InvolvedCharacter,
    "nickname" | "job" | "level" | "server"
>

// 원정대 혹은 체크리스트 데이터 리스트 -> 체크박스 리스트
export function toCheckData<T extends InvolvedSource>(list: T[], maxLevel: number): InvolvedCharacter[] {
    return list.map(({nickname, job, level, server}) => {
        const isDisable = level < maxLevel;
        return { nickname, job, level, server, isDisable: isDisable }
        
    });
}

// 컨텐츠 ID로 콘텐츠 데이터 가져오기
export function getBossDataById(bosses: Boss[], id: string): Boss | null {
    return bosses.find(b => b.id === id) ?? null;
}