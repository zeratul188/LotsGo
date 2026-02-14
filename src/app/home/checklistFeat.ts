import { SetStateFn } from "@/utiils/utils";
import { LoginUser } from "../store/loginSlice";
import { addToast } from "@heroui/react";
import { CheckCharacter } from "../store/checklistSlice";
import { Boss } from "../api/checklist/boss/route";

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