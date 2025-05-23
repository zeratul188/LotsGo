import { AppDispatch } from "../store/store";
import type { CheckCharacter, Checklist } from "../store/checklistSlice";
import { saveData } from "../store/checklistSlice";
import { SetStateFn } from "@/utiils/utils";
import { addToast } from "@heroui/react";
import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { Boss } from "../api/checklist/boss/route";
import { Character, LoginUser } from "../store/loginSlice";

// 로그인 여부 확인 함수
export function checkLogin(router: AppRouterInstance): boolean {
    const userStr = localStorage.getItem('user');
    const storedUser: LoginUser = userStr ? JSON.parse(userStr) : null;
    const isAdministrator = localStorage.getItem('isAdministrator');
    if (!storedUser) {
        addToast({
            title: isAdministrator ? "관리자 이용 불가" : "이용 불가",
            description: isAdministrator ? "관리자 계정은 해당 기능을 이용하실 수 없습니다." : `로그인을 해야만 이용 가능합니다.`,
            color: "danger"
        });
        router.push('/login');
        return false;
    }
    return true;
}

// 데이터 불러오는 함수
export async function loadChecklist(
    setLoading: SetStateFn<boolean>, 
    dispatch: AppDispatch,
    expedition: Character[],
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

    if (checklist.length !== 0) {
        dispatch(saveData(checklist));
        setLoading(false);
    } else {
        const top6: Character[] = expedition.slice().sort((a, b) => b.level - a.level).slice(0, 6);
        for (const character of top6) {
            const checkCharacter: CheckCharacter = {
                nickname: character.nickname,
                level: character.level,
                job: character.job,
                server: character.server,
                day: {
                    dungeon: 0,
                    dungeonBouus: 0,
                    boss: 0,
                    bossBonus: 0,
                    quest: 0,
                    questBonus: 0
                },
                checklist: initialWeekContents(character.level, bosses),
                daylist: [],
                weeklist: [],
                cube: 0,
                isGold: true,
                otherGold: 0
            }
            checklist.push(checkCharacter);
        }
        const inputRes = await fetch(`/api/checklist/list`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id: id,
                checklist: checklist,
                type: 'init'
            })
        });
        if (!inputRes.ok) {
            addToast({
                title: `데이터 저장 오류 (${res.status})`,
                description: `데이터를 저장하는데 문제가 발생하였습니다.`,
                color: "danger"
            });
        } else {
            addToast({
                title: "데이터 저장 완료",
                description: `초기 캐릭터 설정이 완료되었습니다.`,
                color: "success"
            });
            dispatch(saveData(checklist));
            setLoading(false);
        }
    }
}

// 주간 콘텐츠 초기화 함수
function initialWeekContents(level: number, bosses: Boss[]): Checklist[] {
    const checklist: Checklist[] = [];
    let count = 0;
    const sortedBosses = bosses
        .slice()
        .sort((a, b) => {
            const maxLevelA = Math.max(...a.difficulty.map(d => d.level));
            const maxLevelB = Math.max(...b.difficulty.map(d => d.level));
            return maxLevelB - maxLevelA;
        });
    for (const boss of sortedBosses) {
        let isImport = false;
        boss.difficulty.sort((a, b) => b.level - a.level);
        for (const difficulty of boss.difficulty) {
            if (!isImport && level >= difficulty.level) {
                checklist.push({
                    name: boss.name,
                    difficulty: difficulty.difficulty,
                    isCheck: false,
                    isDisable: false,
                    isGold: true
                });
                isImport = true;
                count++;
            }
        }
        if (count === 3) break;
    }
    return checklist;
}

// 콘텐츠 정보 가져오는 항수
export async function getBosses(): Promise<Boss[]> {
    const bossRes = await fetch('/api/checklist/boss');

    if (!bossRes.ok) {
        addToast({
            title: "데이터 로드 오류 (콘텐츠)",
            description: `데이터를 가져오는데 문제가 발생하였습니다.`,
            color: "danger"
        });
        return [];
    }

    const bosses: Boss[] = await bossRes.json();
    return bosses;
}

// 숙제 완료한 캐릭 수 반환 함수
export function getCompleteChecklist(checklist: CheckCharacter[]): number {
    return checklist.reduce((total, character) => {
        const countFromChecklist = character.checklist
            .filter(item => item.isCheck)
            .reduce((sum) => sum++, 0);
        return total + countFromChecklist;
    }, 0);
}

// 숙제 총 개수 반환 함수
export function getAllCountChecklist(checklist: CheckCharacter[]): number {
    return checklist.reduce((total, character) => total + character.checklist.length, 0);
}

// 총 주간 수익 골드량 측정 함수
export function getAllGolds(
    bosses: Boss[],
    checklist: CheckCharacter[]
): number {
    return checklist.reduce((total, character) => {
        const goldFromChecklist = character.checklist
            .filter(item => item.isGold)
            .reduce((sum, item) => sum + getBossGold(bosses, item.name, item.difficulty), 0);
        return total + character.otherGold + goldFromChecklist;
    }, 0);
}

// 주간 완료된 수익 골드량 측정 함수수
export function getHaveGolds(
    bosses: Boss[],
    checklist: CheckCharacter[]
): number {
    return checklist.reduce((total, character) => {
        const goldFromChecklist = character.checklist
            .filter(item => item.isGold && item.isCheck)
            .reduce((sum, item) => sum + getBossGold(bosses, item.name, item.difficulty), 0);
        return total + character.otherGold + goldFromChecklist;
    }, 0);
}

// 특정 콘텐츠 골드 획득량 가져오는 함수수
export function getBossGold(
    bosses: Boss[],
    name: string,
    difficulty: string
): number {
    let gold: number = 0;
    for (const boss of bosses) {
        if (boss.name === name) {
            for (const diff of boss.difficulty) {
                if (diff.difficulty === difficulty) {
                    gold = diff.gold;
                    break;
                }
            }
        }
    }
    return gold;
}