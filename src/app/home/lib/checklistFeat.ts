import { SetStateFn } from "@/utiils/utils";
import { LoginUser } from "../../store/loginSlice";
import { addToast } from "@heroui/react";
import { CheckCharacter } from "../../store/checklistSlice";
import { Boss } from "../../api/checklist/boss/route";
import data from "@/data/home/data.json";
import { ContentLevels } from "../model/types";

export type ChecklistData = {
    nickname: string,
    level: number,
    job: string,
    isGold: boolean,
    isGoldCharacter: boolean,
    contentName: string,
    difficultys: ChecklistDataDifficulty[]
}

export type ChecklistDataDifficulty = {
    stage: number,
    difficulty: string,
    isComplete: boolean
}

// 로그인 여부 확인 함수
export function isLogin(): boolean {
    const userStr = sessionStorage.getItem('user');
    const storedUser: LoginUser = userStr ? JSON.parse(userStr) : null;
    if (!storedUser) {
        return false;
    }
    return true;
}

// 숙제 데이터 불러오는 함수
export async function loadChecklist(
    setChecklist: SetStateFn<CheckCharacter[]>,
    setLoading: SetStateFn<boolean>,
    bosses: Boss[]
) {
    const userStr = sessionStorage.getItem('user');
    const storedUser: LoginUser = userStr ? JSON.parse(userStr) : null;
    const id = storedUser.id;

    const res = await fetch(`/api/checklist/list?id=${id}`);

    if (!res.ok) {
        addToast({
            title: "데이터 로드 오류",
            description: `데이터를 가져오는데 문제가 발생하였습니다.`,
            color: "danger"
        });
        return;
    }

    const checklist: CheckCharacter[] = await res.json();
    checklist.sort((a, b) => b.level - a.level);
    checklist.sort((a, b) => {
        if (a.isGold && !b.isGold) return -1;
        if (!a.isGold && b.isGold) return 1;
        return 0;
    });
    checklist.sort((a, b) => a.position - b.position);
    setChecklist(checklist);
    setLoading(false);
}

export function getLevelByContent(bosses: Boss[], contentName: string, difficultys: ChecklistDataDifficulty[]): number {
    for (const boss of bosses) {
        if (boss.name === contentName) {
            for (const diff of difficultys) {
                const findDiff = boss.difficulty.find(d => d.stage === diff.stage && d.difficulty === diff.difficulty);
                if (findDiff) {
                    return findDiff.level;
                }
            }
        }
    }
    return 0;
}

// 레벨 별 숙제 현황 관련 묶음 반환 함수 (4개까지만 추가)
export function groupByLevel10(characters: CheckCharacter[]): Map<ContentLevels, CheckCharacter[]> {
    const map = new Map<ContentLevels, CheckCharacter[]>();
    const contentLevels = data.contentLevels;
    let undoLevel = 9999;
    contentLevels.map(level => {
        const list = characters.filter(character => character.level < undoLevel && character.level >= level);
        const levels: ContentLevels = { startLevel: level, endLevel: undoLevel };
        if (list.length > 0 && map.size < 4) map.set(levels, list);
        undoLevel = level;
    });
    return map;
}

// 레벨 별 숙제 현황에서 가장 높은 레벨 반환 함수
export function getHighestBucket(
  grouped: Map<ContentLevels, CheckCharacter[]>
): number {
    if (grouped.size === 0) return 0;
    const levelList = Array.from(grouped.keys()).map(e => e.startLevel);
    return Math.max(...levelList);
}

// 해당 캐릭터가 숙제를 완료했는지 확인하는 함수
export function isCompleteHomeworkByCharacter(character: CheckCharacter): boolean {
    return character.checklist.every(checkItem => checkItem.items.every(item => item.isDisable || item.isCheck));
}
