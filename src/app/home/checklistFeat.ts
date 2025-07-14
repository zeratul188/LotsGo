import { SetStateFn } from "@/utiils/utils";
import { LoginUser } from "../store/loginSlice";
import { addToast } from "@heroui/react";
import { CheckCharacter } from "../store/checklistSlice";
import { Boss } from "../api/checklist/boss/route";

export type ChecklistData = {
    nickname: string,
    level: number,
    isGold: boolean,
    contentName: string,
    difficulty: string
}

// 로그인 여부 확인 함수
export function isLogin(): boolean {
    const userStr = localStorage.getItem('user');
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
    setDatas: SetStateFn<ChecklistData[]>,
    bosses: Boss[]
) {
    const userStr = localStorage.getItem('user');
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
    const datas: ChecklistData[] = [];

    for (const character of checklist) {
        for (const content of character.checklist) {
            if (!content.isCheck && !content.isDisable) {
                const newData: ChecklistData = {
                    nickname: character.nickname,
                    level: character.level,
                    contentName: content.name,
                    difficulty: content.difficulty,
                    isGold: content.isGold
                }
                datas.push(newData);
            }
        }
    }

    datas.sort((a, b) => getLevelByContent(bosses, b.contentName, b.difficulty) - getLevelByContent(bosses, a.contentName, a.difficulty));
    checklist.sort((a, b) => b.level - a.level);
    checklist.sort((a, b) => {
        if (a.isGold && !b.isGold) return -1;
        if (!a.isGold && b.isGold) return 1;
        return 0;
    });
    checklist.sort((a, b) => a.position - b.position);
    setDatas(datas);
    setChecklist(checklist);
    setLoading(false);
}

export function getLevelByContent(bosses: Boss[], contentName: string, difficulty: string): number {
    for (const boss of bosses) {
        if (boss.name === contentName) {
            for (const diff of boss.difficulty) {
                if (diff.difficulty === difficulty) {
                    return diff.level;
                }
            }
        }
    }
    return 0;
}