import { SetStateFn } from "@/utiils/utils";
import { Checklist, RaidMember } from "../../api/raids/members/route";
import { addToast } from "@heroui/react";
import { Boss } from "../../api/checklist/boss/route";
import { collection, getDocs } from "firebase/firestore";
import { firestore } from "@/utiils/firebase";
import { Character } from "../../signup/signupFeat";
import type { AppDispatch } from "../../store/store";
import { changeSelectedRaid, initialMembers } from "../../store/partySlice";
import { Raid } from "../model/types";
import { getBossBoundCheckGold, getBossBoundGold, getBossCheckedGold, getBossGold } from "@/app/checklist/checklistFeat";
import { ChecklistItem } from "@/app/store/checklistSlice";

// 선택한 파티 적용 함수
export function applyChangeParty(
    selectedKey: string,
    raids: Raid[],
    dispatch: AppDispatch
) {
    const findRaid = raids.find(raid => raid.id === selectedKey);
    if (findRaid) {
        dispatch(changeSelectedRaid(findRaid));
    } else {
        dispatch(changeSelectedRaid(null));
    }
}

// 해당 파티 인원 데이터 가져오기
export async function loadPartyData(
    party: Raid,
    setLoading: SetStateFn<boolean>,
    dispatch: AppDispatch
) {
    setLoading(true);
    const sp = new URLSearchParams();
    party.members.forEach(member => sp.append('list', member));
    const res = await fetch(`/api/raids/members?${sp.toString()}`);
    if (!res.ok) {
        addToast({
            title: "요청 오류",
            description: `데이터를 불러오는데 문제가 발생하였습니다.`,
            color: "danger"
        });
        return;
    }
    const members: RaidMember[] = await res.json();
    dispatch(initialMembers(members));
    setLoading(false);
}

// 콘텐츠 정보 가져오기
export async function loadBosses(setBosses: SetStateFn<Boss[]>) {
    const snapshot = await getDocs(collection(firestore, 'boss'));
    const bosses: Boss[] = snapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name,
        simple: doc.data().simple ? doc.data().simple : '',
        max: doc.data().max,
        difficulty: doc.data().difficulty
    }));
    setBosses(bosses);
}

// 대표 캐릭터 정보 가져오기
export function getCharacterByMain(expeditions: Character[], mainName: string): Character | null {
    const character = expeditions.find(ch => ch.nickname === mainName);
    if (character) return character;
    return null;
}

// 남은 레이드 상황 객체 타입
export type RemainContent = {
    name: string,
    remain: number,
    max: number
}

// 남은 레이드 현황 데이터 반환
export function getRemainContents(checklist: Checklist[], bosses: Boss[]): RemainContent[] {
    const list: RemainContent[] = [];
    bosses.sort((a, b) => {
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
    }).forEach(boss => {
        let remain = 0, max = 0;
        checklist.forEach(character => {
            const findContent = character.contents.find(content => content.name === boss.name);
            if (findContent) {
                max++;
                if (!findContent.items.every(item => item.isCheck)) {
                    remain++;
                }
            }
        })
        if (max > 0) {
            list.push({
                name: boss.name,
                remain: remain,
                max: max
            });
        }
    });
    return list;
}

// 체크리스트 난이도 출력 함수
type PrintDifficulty = {
    difficulty: string,
    result: string
}
export function printDifficulty(items: ChecklistItem[]): string {
    const prints: PrintDifficulty[] = [];
    for (const item of items) {
        if (prints.length > 0) {
            if (prints[prints.length-1].difficulty === item.difficulty) {
                prints[prints.length-1].result += item.stage;
            } else {
                prints.push({
                    difficulty: item.difficulty,
                    result: item.stage.toString()
                });
            }
        } else {
            prints.push({
                difficulty: item.difficulty,
                result: item.stage.toString()
            });
        }
    }
    let result = '';
    for (let i = 0; i < prints.length; i++) {
        if (i > 0) {
            result += ' ';
        }
        result += `${prints[i].difficulty}${prints[i].result}`;
    }
    return result;
}


// 해당 맴버의 총 골드량 체크
export function getAllGoldByMember(bosses: Boss[], checklist: Checklist[]): number {
    let sum = 0;
    sum = checklist
        .filter(character => character.isGold)
        .reduce((total, character) => {
            const goldFromChecklist = character.contents
                .filter(content => content.isGold)
                .reduce((sum, item) => sum + getBossGold(bosses, item.name, item.items) + getBossBoundGold(bosses, item.name, item.items), 0);
            return total + goldFromChecklist;
        }, 0);
    for (const character of checklist) sum += character.otherGold;
    return sum;
}

// 해당 맴버의 완료한 총 골드량 체크
export function getHaveGoldByMember(bosses: Boss[], checklist: Checklist[]): number {
    let sum = 0;
    sum = checklist
        .filter(character => character.isGold)
        .reduce((total, character) => {
            const goldFromChecklist = character.contents
                .filter(item => item.isGold)
                .reduce((sum, item) => sum + getBossCheckedGold(bosses, item.name, item.items) + getBossBoundCheckGold(bosses, item.name, item.items), 0);
            return total + goldFromChecklist;
        }, 0);
    for (const character of checklist) sum += character.otherGold;
    return sum;
}