import { AppDispatch } from "../../store/store";
import type { CheckCharacter, Checklist, ChecklistItem, CubeList, Day, OtherList } from "../../store/checklistSlice";
import { 
    calculateOtherGold,
    checkDayList, 
    checkGold, 
    checkWeek, 
    checkWeekList, 
    editCube, 
    editDay, 
    editDayList, 
    editWeekList, 
    removeCharacter, 
    removeWeek, 
    resetCube, 
    saveData, 
    saveRest, 
    updateAccount
} from "../../store/checklistSlice";
import { SetStateFn } from "@/utiils/utils";
import { addToast, Selection } from "@heroui/react";
import { Boss, Difficulty } from "../../api/checklist/boss/route";
import { Character, LoginUser } from "../../store/loginSlice";
import { Cube } from "../../api/checklist/cube/route";
import { collection, getDocs } from "firebase/firestore";
import { database, firestore } from "@/utiils/firebase";
import { decrypt } from "@/utiils/crypto";
import { ChecklistData, ChecklistDataDifficulty, getLevelByContent } from "../../home/lib/checklistFeat";
import { get, ref } from "firebase/database";
import { ControlStage } from "../model/types";

const secretKey = process.env.NEXT_PUBLIC_SECRET_KEY ? process.env.NEXT_PUBLIC_SECRET_KEY : 'null';

// 닉네임으로 index 찾기 함수
export function getIndexByNickname(checklist: CheckCharacter[], nickname: string): number {
    return checklist.findIndex(character => character.nickname === nickname);
}

// 로그인 여부 확인 함수
export function checkLogin(): boolean {
    const userStr = sessionStorage.getItem('user');
    const storedUser: LoginUser = userStr ? JSON.parse(userStr) : null;
    if (!storedUser) {
        return false;
    }
    return true;
}

// 데이터 불러오는 함수
export async function loadChecklist(
    setLoading: SetStateFn<boolean>, 
    dispatch: AppDispatch,
    expedition: Character[],
    bosses: Boss[],
    setLife: SetStateFn<number>,
    setBlessing: SetStateFn<boolean>,
    setMax: SetStateFn<number>,
    setBiweekly: SetStateFn<number>
) {
    const userStr = sessionStorage.getItem('user');
    const storedUser: LoginUser = userStr ? JSON.parse(userStr) : null;
    const id = storedUser ? storedUser.id : '';

    const dataRef = ref(database, '/checklist/biweekly'); // 원하는 경로
    const snapshot = await get(dataRef);
    if (snapshot.exists()) {
        setBiweekly(Number(snapshot.val()));
    }

    const res = await fetch(`/api/checklist/list?id=${id}`);

    if (!res.ok) {
        addToast({
            title: "데이터 로드 오류",
            description: `데이터를 가져오는데 문제가 발생하였습니다.`,
            color: "danger"
        });
        return;
    }

    const lifeRes = await fetch(`/api/checklist/life?id=${id}`);
    const lifeObj = await lifeRes.json();

    // 생기 관련 데이터
    if (lifeRes.status === 200) {
        const today = new Date();
        const lifeDate = new Date(lifeObj.date.seconds * 1000 + lifeObj.date.nanoseconds / 1_000_000);
        const diffMs = today.getTime() - lifeDate.getTime();
        const diffSeconds = Math.round(diffMs / 1000);
        const avgPlayTime = 3; // 유저들의 하루 로아 플레이 추정 시간
        const onlineRatio = avgPlayTime / 24;
        const offlineRatio = 1 - onlineRatio;
        let life = 0;
        if (lifeObj.isBlessing) {
            life = lifeObj.life + (diffSeconds * onlineRatio) * 0.055 + (diffSeconds * offlineRatio) * 0.05;
        } else {
            life = lifeObj.life + diffSeconds * 0.05;
        }
        if (life > lifeObj.max) life = lifeObj.max;
        if (diffSeconds > 0) {
            const lifeRes = await fetch(`/api/checklist/life`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: id,
                    life: life,
                    isNotValue: false,
                    max: lifeObj.max,
                    isBlessing: lifeObj.isBlessing
                })
            });
            if (!lifeRes.ok) {
                addToast({
                    title: "데이터 로드 오류",
                    description: `데이터를 가져오는데 문제가 발생하였습니다.`,
                    color: "danger"
                });
                return;
            }
        }
        setLife(life);
        setMax(lifeObj.max)
        setBlessing(lifeObj.isBlessing);
    } else {
        const initRes = await fetch(`/api/checklist/life`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id: id,
                life: 0,
                max: 10000,
                isNotValue: false,
                isBlessing: false
            })
        });
        if (!initRes.ok) {
            addToast({
                title: "데이터 로드 오류",
                description: `데이터를 가져오는데 문제가 발생하였습니다.`,
                color: "danger"
            });
            return;
        }
    }

    const checklist: CheckCharacter[] = await res.json();
    checklist.sort((a, b) => b.level - a.level);
    checklist.sort((a, b) => {
        if (a.isGold && !b.isGold) return -1;
        if (!a.isGold && b.isGold) return 1;
        return 0;
    });
    checklist.sort((a, b) => a.position - b.position);
    for (const character of checklist) {
        const sortedChecklist = character.checklist.sort((a, b) => {
            const aBoss = bosses.find(item => item.name === a.name) ? bosses.find(item => item.name === a.name) : null;
            const aMax = aBoss ? Math.max(...aBoss.difficulty.map(d => d.level)) : 0;
            const bBoss = bosses.find(item => item.name === b.name) ? bosses.find(item => item.name === b.name) : null;
            const bMax = bBoss ? Math.max(...bBoss.difficulty.map(d => d.level)) : 0;
            if (!a.isGold && b.isGold) {
                return 1;
            } else if (a.isGold && !b.isGold) {
                return -1;
            } else {
                return bMax - aMax;  
            }
        });
        character.checklist = sortedChecklist;
    }

    if (checklist.length !== 0) {
        dispatch(saveData(checklist));
        setLoading(false);
    } else {
        const top6: Character[] = expedition.slice().sort((a, b) => b.level - a.level).slice(0, 6);
        const notImportedList: string[] = [];
        for (const character of top6) {
            const checkCharacter: CheckCharacter = {
                nickname: character.nickname,
                level: character.level,
                job: character.job,
                server: character.server,
                day: {
                    dungeon: 0,
                    dungeonBouus: 0,
                    dungeonUsing: 0,
                    boss: 0,
                    bossBonus: 0,
                    bossUsing: 0,
                    quest: 0,
                    questBonus: 0,
                    questUsing: 0
                },
                checklist: initialWeekContents(character.level, bosses, notImportedList),
                cubelist: [],
                daylist: [],
                weeklist: [],
                cube: 0,
                isGold: true,
                otherGold: 0,
                position: 9999,
                account: '본계정'
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
                title: `데이터 저장 오류 (${inputRes.status})`,
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

export function useClickLife(
    newLife: number, 
    isBlessing: boolean, 
    setLife: SetStateFn<number>,
    setNewLife: SetStateFn<number>,
    newMax: number,
    setMax: SetStateFn<number>,
    setNewMax: SetStateFn<number>
) {
    const userStr = sessionStorage.getItem('user');
    const storedUser: LoginUser = userStr ? JSON.parse(userStr) : null;
    const id = storedUser ? storedUser.id : '';
    return async () => {
        const lifeRes = await fetch(`/api/checklist/life`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id: id,
                life: newLife,
                max: newMax,
                isNotValue: false,
                isBlessing: isBlessing
            })
        });
        if (!lifeRes.ok) {
            addToast({
                title: "데이터 로드 오류",
                description: `데이터를 가져오는데 문제가 발생하였습니다.`,
                color: "danger"
            });
            return;
        }
        setLife(newLife);
        setMax(newMax);
    }
}

// 베아트리스의 축복 조정
export function useChangeBlessing(life: number, max: number, setBlessing: SetStateFn<boolean>) {
    const userStr = sessionStorage.getItem('user');
    const storedUser: LoginUser = userStr ? JSON.parse(userStr) : null;
    const id = storedUser ? storedUser.id : '';
    return async (isSelected: boolean) => {
        const lifeRes = await fetch(`/api/checklist/life`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id: id,
                life: life,
                max: max,
                isNotValue: true,
                isBlessing: isSelected
            })
        });
        if (!lifeRes.ok) {
            addToast({
                title: "데이터 로드 오류",
                description: `데이터를 가져오는데 문제가 발생하였습니다.`,
                color: "danger"
            });
            return;
        }
        setBlessing(isSelected);
    }
}

// 주간 콘텐츠 초기화 함수
function initialWeekContents(level: number, bosses: Boss[], notImportedList: string[]): Checklist[] {
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
        if (!notImportedList.includes(boss.name)) {
            const minDifficulty = boss.difficulty.filter(diff => !diff.difficulty.includes('싱글')).filter(diff => diff.stage === 1).sort((a, b) => b.level - a.level);
            for (const diff of minDifficulty) {
                if (level >= diff.level) {
                    const resultDiff = boss.difficulty.filter(d => d.difficulty === diff.difficulty).sort((a, b) => a.stage - b.stage);
                    const items: ChecklistItem[] = [];
                    for (const item of resultDiff) {
                        items.push({
                            difficulty: item.difficulty,
                            isCheck: false,
                            isDisable: false,
                            isBonus: false,
                            isBiweekly: item.isBiweekly,
                            stage: item.stage
                        });
                    }
                    checklist.push({
                        name: boss.name,
                        isGold: true,
                        items: items,
                        busGold: 0
                    });
                    if (diff.isOnce) {
                        notImportedList.push(boss.name);
                    }
                    count++;
                    break;
                }
            }
            if (count === 3) break;
        }
    }
    return checklist;
}

// 콘텐츠 정보 가져오는 항수
export async function getBosses(): Promise<Boss[]> {
    const snapshot = await getDocs(collection(firestore, 'boss'));
    const bosses: Boss[] = snapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name,
        simple: doc.data().simple ? doc.data().simple : '',
        max: doc.data().max ?? 0,
        difficulty: doc.data().difficulty
    }));
    return bosses;
}

// 큐브 정보 가져오는 함수
export async function getCubes(): Promise<Cube[]> {
    const snapshot = await getDocs(collection(firestore, 'cube'));
    const cubes: Cube[] = snapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name,
        level: Number(doc.data().level),
        tier: doc.data().tier ? Number(doc.data().tier) : 0,
        reward: doc.data().reward ? Number(doc.data().reward) : 0
    }));
    cubes.sort((a, b) => a.level - b.level);
    return cubes;
}

// 숙제 완료한 관문 수 반환 함수
export function getCompleteChecklistByStage(checklist: CheckCharacter[]): number {
    return checklist.reduce((total, character) => {
        const countFromChecklist = character.checklist
            .filter(item => item.items.some(item => item.isCheck && !item.isDisable))
            .reduce((sum, item) => sum + item.items.filter(i => i.isCheck).length, 0);
        return total + countFromChecklist;
    }, 0)
}

// 숙제 총 관문 개수 반환 함수
export function getAllCountChecklistByStage(checklist: CheckCharacter[]): number {
    return checklist.reduce((total, character) => total + character.checklist.reduce((sum, item) => sum + item.items.filter(i => !i.isDisable).length, 0), 0);
}

// 숙제 완료한 캐릭 수 반환 함수
export function getCompleteChecklist(checklist: CheckCharacter[]): number {
    return checklist.reduce((total, character) => {
        const countFromChecklist = character.checklist
            .filter(item => {
                for (const checklistItem of item.items) {
                    if (!checklistItem.isCheck && !checklistItem.isDisable) {
                        return false;
                    }
                }
                return true;
            })
            .reduce((sum) => sum+1, 0);
        return total + countFromChecklist;
    }, 0);
}

// 골드 받는 숙제 완료한 개수 반환 함수
export function getCompleteChecklistByGold(checklist: CheckCharacter[]): number {
    return checklist.filter(c => c.isGold).reduce((total, character) => {
        const countFromChecklist = character.checklist
            .filter(item => {
                if (!item.isGold) return false;
                for (const checklistItem of item.items) {
                    if (!checklistItem.isCheck && !checklistItem.isDisable) return false;
                }
                return true;
            })
            .reduce(sum => sum+1, 0);
        return total + countFromChecklist;
    }, 0);
}

// 숙제 총 개수 반환 함수
export function getAllCountChecklist(checklist: CheckCharacter[]): number {
    return checklist.reduce((total, character) => total + character.checklist.length, 0);
}

// 골드 받는 숙제 총 개수 반환 함수
export function getAllCountChecklistByGold(checklist: CheckCharacter[]): number {
    return checklist.filter(c => c.isGold).reduce((total, character) => total + character.checklist.filter(c => c.isGold).length, 0);
}

// 특정 캐릭터 골드 총 획득량 측정 함수
export function getAllGoldCharacter(
    bosses: Boss[],
    character: CheckCharacter
): number {
    let golds = character.isGold ? character.checklist
        .filter(item => item.isGold)
        .reduce((total, item) => total + getBossGold(bosses, item.name, item.items) + getBossBoundGold(bosses, item.name, item.items), 0) : 0;
    golds += character.checklist
        .filter(item => item.busGold !== 0 && item.busGold)
        .reduce((total, item) => total + (item.busGold ?? 0), 0);
    return golds;
}

// 특정 캐릭터 골드 획득량 측정 함수 (완료된 숙제만)
export function getCompleteGoldCharacter(
    bosses: Boss[],
    character: CheckCharacter
): number {
    let golds = character.isGold ? character.checklist
        .filter(item => item.isGold)
        .reduce((total, item) => total + getBossCheckedGold(bosses, item.name, item.items) + getBossBoundCheckGold(bosses, item.name, item.items), 0) : 0;
    golds += character.checklist
        .filter(item => item.busGold !== 0 && item.busGold)
        .reduce((total, item) => total + (isCheckHomework(item) ? item.busGold ?? 0 : 0), 0);
    return golds;
}

// 특정 캐릭터 골드 획득량 측정 함수 (완료된 숙제만) (귀속 골드 X)
export function getCompleteSharedGoldCharacter(
    bosses: Boss[],
    character: CheckCharacter
): number {
    let golds = character.isGold ? character.checklist
        .filter(item => item.isGold)
        .reduce((total, item) => total + getBossCheckedGold(bosses, item.name, item.items), 0) : 0;
    golds += character.checklist
        .filter(item => item.busGold !== 0 && item.busGold)
        .reduce((total, item) => total + (isCheckHomework(item) ? item.busGold ?? 0 : 0), 0);
    return golds;
}

// 특정 캐릭터 골드 획득량 측정 함수 (완료된 숙제만) (귀속 골드 O)
export function getCompleteBoundGoldCharacter(
    bosses: Boss[],
    character: CheckCharacter
): number {
    const golds = character.checklist
        .filter(item => item.isGold)
        .reduce((total, item) => total + getBossBoundCheckGold(bosses, item.name, item.items), 0);
    return character.isGold ? golds : 0;
}

// 총 주간 수익 골드량 측정 함수
export function getAllGolds(
    bosses: Boss[],
    checklist: CheckCharacter[]
): number {
    let sum = 0;
    sum = checklist
        .filter(character => character.isGold)
        .reduce((total, character) => {
        const goldFromChecklist = character.checklist
            .filter(item => item.isGold)
            .reduce((sum, item) => sum + getBossGold(bosses, item.name, item.items) + getBossBoundGold(bosses, item.name, item.items), 0);
        return total + goldFromChecklist;
    }, 0);
    sum += checklist
        .reduce((total, character) => {
        const goldFromChecklist = character.checklist
            .filter(item => item.busGold !== 0 && item.busGold)
            .reduce((total, item) => total + (item.busGold ?? 0), 0);
        return total + goldFromChecklist;
    }, 0);
    for (const character of checklist) {
        sum += character.otherGold;
    }
    return sum;
}

// 주간 완료된 수익 골드량 측정 함수
export function getHaveGolds(
    bosses: Boss[],
    checklist: CheckCharacter[]
): number {
    let sum = 0;
    sum = checklist
        .filter(character => character.isGold)
        .reduce((total, character) => {
        const goldFromChecklist = character.checklist
            .filter(item => item.isGold)
            .reduce((sum, item) => sum + getBossCheckedGold(bosses, item.name, item.items) + getBossBoundCheckGold(bosses, item.name, item.items), 0);
        return total + goldFromChecklist;
    }, 0);
    sum += checklist
        .reduce((total, character) => {
        const goldFromChecklist = character.checklist
            .filter(item => item.busGold !== 0 && item.busGold)
            .reduce((total, item) => total + (isCheckHomework(item) ? item.busGold ?? 0 : 0), 0);
        return total + goldFromChecklist;
    }, 0);
    for (const character of checklist) {
        sum += character.otherGold;
    }
    return sum;
}

// 주간 완료된 수익 골드량 측정 함수 (귀속 골드 X)
export function getHaveSharedGolds(
    bosses: Boss[],
    checklist: CheckCharacter[]
): number {
    let sum = 0;
    sum = checklist
        .filter(character => character.isGold)
        .reduce((total, character) => {
        let goldFromChecklist = character.checklist
            .filter(item => item.isGold)
            .reduce((sum, item) => sum + getBossCheckedGold(bosses, item.name, item.items), 0);
        goldFromChecklist += character.checklist
            .filter(item => item.busGold !== 0 && item.busGold)
            .reduce((total, item) => total + (isCheckHomework(item) ? item.busGold ?? 0 : 0), 0);
        return total + goldFromChecklist;
    }, 0);
    for (const character of checklist) {
        sum += character.otherGold;
    }
    return sum;
}

// 주간 완료된 수익 골드량 측정 함수 (귀속 골드 O)
export function getHaveBoundGolds(
    bosses: Boss[],
    checklist: CheckCharacter[]
): number {
    let sum = 0;
    sum = checklist
        .filter(character => character.isGold)
        .reduce((total, character) => {
        const goldFromChecklist = character.checklist
            .filter(item => item.isGold)
            .reduce((sum, item) => sum + getBossBoundCheckGold(bosses, item.name, item.items), 0);
        return total + goldFromChecklist;
    }, 0);
    for (const character of checklist) {
        sum += character.otherGold;
    }
    return sum;
}

// 특정 콘텐츠 귀속 골드 획득가능량 가져오는 함수
export function getBossBoundGold(
    bosses: Boss[],
    name: string,
    items: ChecklistItem[]
): number {
    let gold = 0;
    for (const boss of bosses) {
        if (boss.name === name) {
            for (const item of items) {
                const diff = boss.difficulty.find(b => b.difficulty === item.difficulty && b.stage === item.stage);
                if (!item.isDisable) {
                    gold += diff ? diff.boundGold : 0;
                }
            }
            break;
        }
    }
    return gold;
}

// 특정 콘텐츠 귀속 골드 획득량 가져오는 함수
export function getBossBoundCheckGold(
    bosses: Boss[],
    name: string,
    items: ChecklistItem[]
): number {
    let gold = 0;
    for (const boss of bosses) {
        if (boss.name === name) {
            for (const item of items) {
                const diff = boss.difficulty.find(b => b.difficulty === item.difficulty && b.stage === item.stage);
                if (item.isCheck) {
                    gold += diff ? diff.boundGold : 0;
                }
            }
            break;
        }
    }
    return gold;
}

// 특정 콘텐츠 골드 획득 가능량 가져오는 함수
export function getBossGold(
    bosses: Boss[],
    name: string,
    items: ChecklistItem[]
): number {
    let gold = 0;
    for (const boss of bosses) {
        if (boss.name === name) {
            for (const item of items) {
                const diff = boss.difficulty.find(b => b.difficulty === item.difficulty && b.stage === item.stage);
                if (!item.isDisable) {
                    gold += diff ? diff.gold : 0;
                    if (item.isBonus) {
                        gold -= diff ? diff.bonus : 0;
                    }
                }
            }
            break;
        }
    }
    return gold;
}

// 특정 콘텐츠 골드 획득량 가져오는 함수
export function getBossCheckedGold(
    bosses: Boss[],
    name: string,
    items: ChecklistItem[]
): number {
    let gold = 0;
    for (const boss of bosses) {
        if (boss.name === name) {
            for (const item of items) {
                const diff = boss.difficulty.find(b => b.difficulty === item.difficulty && b.stage === item.stage);
                if (item.isCheck) {
                    gold += diff ? diff.gold : 0;
                    if (item.isBonus) {
                        gold -= diff ? diff.bonus : 0;
                    }
                }
            }
            break;
        }
    }
    return gold;
}

// 가지고 있는 서버 목록 반환 함수
export function getServerList(checklist: CheckCharacter[]): string[] {
    const list: string[] = Array.from(new Set(checklist.map((item) => item.server)));
    return list;
}

// 일일콘텐츠 타입별 문자열 반환 함수
export function getDayName(type: string, level: number): string {
    switch(type) {
        case '전선': 
            return level >= 1730 ? '혼돈의 균열' : '쿠르잔 전선';
        case '가디언': return '가디언 토벌';
        case '에포나': return '에포나 의뢰';
        default: return 'unknown';
    }
}

// 일일콘텐츠 타입별 값 반환 함수
export type DayValue = {
    value: number,
    restValue: number
}
export function getTypeDayValue(character: CheckCharacter, type: string): DayValue {
    const result: DayValue = {
        value: 0,
        restValue: 0
    }
    switch(type) {
        case '전선': 
            result.value = character.day.dungeon;
            result.restValue = character.day.dungeonBouus;
            break;
        case '가디언': 
            result.value = character.day.boss;
            result.restValue = character.day.bossBonus;
            break;
        case '에포나': 
            result.value = character.day.quest;
            result.restValue = character.day.questBonus;
            break;
    }
    return result;
}

// 알알 콘텐츠 휴식 게이지 최대치 반환 함수
export function getMaxRestValue(type: string): number {
    switch(type) {
        case '전선': return 200;
        case '가디언': case '에포나': return 100;
        default: return 0;
    }
}

// 일일 콘텐츠 체크 함수
export function useOnClickDayCheck(
    checklist: CheckCharacter[],
    nickname: string,
    type: string,
    day: Day,
    dispatch: AppDispatch
) {
    const max = type === '에포나' ? 3 : 1;
    const onceRest = getMaxRestValue(type)/5;
    const userStr = sessionStorage.getItem('user');
    const storedUser: LoginUser = userStr ? JSON.parse(userStr) : null;
    const id = storedUser ? storedUser.id : '';
    return async () => {
        const updatedDay = { ...day };
        const prevDay = {...day};
        switch(type) {
            case "전선":
                if (updatedDay.dungeon === max) {
                    updatedDay.dungeon = 0;
                    updatedDay.dungeonBouus += updatedDay.dungeonUsing;
                    updatedDay.dungeonUsing = 0;
                } else {
                    updatedDay.dungeon++;
                    if (updatedDay.dungeonBouus >= onceRest) {
                        updatedDay.dungeonBouus -= onceRest;
                        updatedDay.dungeonUsing += onceRest;
                    }
                }
                break;
            case "가디언":
                if (updatedDay.boss === max) {
                    updatedDay.boss = 0;
                    updatedDay.bossBonus += updatedDay.bossUsing;
                    updatedDay.bossUsing = 0;
                } else {
                    updatedDay.boss++;
                    if (updatedDay.bossBonus >= onceRest) {
                        updatedDay.bossBonus -= onceRest;
                        updatedDay.bossUsing += onceRest;
                    }
                }
                break;
            case "에포나":
                if (updatedDay.quest === max) {
                    updatedDay.quest = 0;
                    updatedDay.questBonus += updatedDay.questUsing;
                    updatedDay.questUsing = 0;
                } else {
                    updatedDay.quest++;
                    if (updatedDay.questBonus >= onceRest) {
                        updatedDay.questBonus -= onceRest;
                        updatedDay.questUsing += onceRest;
                    }
                }
                break;
        }
        dispatch(editDay({
            nickname: nickname,
            day: updatedDay
        }));
        const editRes = await fetch(`/api/checklist/list`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id: id,
                checklist: checklist,
                type: 'edit-day',
                day: updatedDay,
                nickname: nickname
            })
        });
        if (!editRes.ok) {
            addToast({
                title: "데이터 로드 오류 (콘텐츠)",
                description: `데이터를 가져오는데 문제가 발생하였습니다.`,
                color: "danger"
            });
            dispatch(editDay({
                nickname: nickname,
                day: prevDay
            }));
            return;
        }
    }
}

// 주간 콘텐츠 관문 더보기 체크 이벤트 함수
export async function handleWeekBonusCheckStage(
    checklist: CheckCharacter[],
    characterIndex: number,
    checklistIndex: number,
    dispatch: AppDispatch,
    stage: number
) {
    const userStr = sessionStorage.getItem('user');
    const storedUser: LoginUser = userStr ? JSON.parse(userStr) : null;
    const id = storedUser ? storedUser.id : '';
    const updatedChecklist = structuredClone(checklist[characterIndex].checklist[checklistIndex]);
    const prevChecklist = structuredClone(updatedChecklist);
    for (const item of updatedChecklist.items) {
        if (item.stage === stage) {
            item.isBonus = !item.isBonus;
        }
    }
    dispatch(checkWeek({
        characterIndex: characterIndex,
        checklistIndex: checklistIndex,
        checklist: updatedChecklist
    }));
    const editRes = await fetch(`/api/checklist/list`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            id: id,
            checklist: checklist,
            type: 'check-week',
            characterIndex: characterIndex,
            checklistIndex: checklistIndex,
            checklistItem: updatedChecklist
        })
    });
    if (!editRes.ok) {
        addToast({
            title: "데이터 로드 오류 (콘텐츠)",
            description: `데이터를 가져오는데 문제가 발생하였습니다.`,
            color: "danger"
        });
        dispatch(checkWeek({
            characterIndex: characterIndex,
            checklistIndex: checklistIndex,
            checklist: prevChecklist
        }));
        return;
    }
}

// 주간 콘텐츠 관문 체크 이벤트 함수
export async function handleWeekCheckStage(
    checklist: CheckCharacter[],
    characterIndex: number,
    checklistIndex: number,
    dispatch: AppDispatch,
    stage: number,
    isDisable: boolean
) {
    if (isDisable) return;
    const userStr = sessionStorage.getItem('user');
    const storedUser: LoginUser = userStr ? JSON.parse(userStr) : null;
    const id = storedUser ? storedUser.id : '';
    const updatedChecklist = structuredClone(checklist[characterIndex].checklist[checklistIndex]);
    const prevChecklist = structuredClone(updatedChecklist);
    for (const item of updatedChecklist.items) {
        if (item.stage < stage) {
            item.isCheck = true;
        } else if (item.stage === stage) {
            item.isCheck = !item.isCheck;
        } else {
            item.isCheck = false;
        }
    }
    dispatch(checkWeek({
        characterIndex: characterIndex,
        checklistIndex: checklistIndex,
        checklist: updatedChecklist
    }));
    const editRes = await fetch(`/api/checklist/list`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            id: id,
            checklist: checklist,
            type: 'check-week',
            characterIndex: characterIndex,
            checklistIndex: checklistIndex,
            checklistItem: updatedChecklist
        })
    });
    if (!editRes.ok) {
        addToast({
            title: "데이터 로드 오류 (콘텐츠)",
            description: `데이터를 가져오는데 문제가 발생하였습니다.`,
            color: "danger"
        });
        dispatch(checkWeek({
            characterIndex: characterIndex,
            checklistIndex: checklistIndex,
            checklist: prevChecklist
        }));
        return;
    }
}

// 주간 콘텐츠 체크 이벤트 함수
export async function useOnClickWeekCheck(
    checklist: CheckCharacter[],
    characterIndex: number,
    checklistIndex: number,
    dispatch: AppDispatch
) {
    console.log('checklist');
    const userStr = sessionStorage.getItem('user');
    const storedUser: LoginUser = userStr ? JSON.parse(userStr) : null;
    const id = storedUser ? storedUser.id : '';
    const updatedChecklist = structuredClone(checklist[characterIndex].checklist[checklistIndex]);
    const prevChecklist = structuredClone(updatedChecklist);
    const isNothingChecked = updatedChecklist.items.some(item => !item.isCheck && !item.isDisable);
    for (const item of updatedChecklist.items) {
        if (isNothingChecked && !item.isDisable) {
            item.isCheck = true;
        } else {
            item.isCheck = false;
        }
    }
    dispatch(checkWeek({
        characterIndex: characterIndex,
        checklistIndex: checklistIndex,
        checklist: updatedChecklist
    }));
    const editRes = await fetch(`/api/checklist/list`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            id: id,
            checklist: checklist,
            type: 'check-week',
            characterIndex: characterIndex,
            checklistIndex: checklistIndex,
            checklistItem: updatedChecklist
        })
    });
    if (!editRes.ok) {
        addToast({
            title: "데이터 로드 오류 (콘텐츠)",
            description: `데이터를 가져오는데 문제가 발생하였습니다.`,
            color: "danger"
        });
        dispatch(checkWeek({
            characterIndex: characterIndex,
            checklistIndex: checklistIndex,
            checklist: prevChecklist
        }));
        return;
    }
}

// 일일 숙제 체크 이벤트 함수
export async function handleDayListCheck(
    checklist: CheckCharacter[],
    characterIndex: number,
    listIndex: number,
    dispatch: AppDispatch
) {
    const userStr = sessionStorage.getItem('user');
    const storedUser: LoginUser = userStr ? JSON.parse(userStr) : null;
    const id = storedUser ? storedUser.id : '';
    const updatedList = {...checklist[characterIndex].daylist[listIndex]};
    const prevList = {...updatedList};
    updatedList.isCheck = !updatedList.isCheck;
    dispatch(checkDayList({
        characterIndex: characterIndex,
        listIndex: listIndex,
        daylist: updatedList
    }));
    const editRes = await fetch(`/api/checklist/list`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            id: id,
            checklist: checklist,
            type: 'check-day-list',
            characterIndex: characterIndex,
            listIndex: listIndex,
            listItem: updatedList
        })
    });
    if (!editRes.ok) {
        addToast({
            title: "데이터 로드 오류 (콘텐츠)",
            description: `데이터를 가져오는데 문제가 발생하였습니다.`,
            color: "danger"
        });
        dispatch(checkDayList({
            characterIndex: characterIndex,
            listIndex: listIndex,
            daylist: prevList
        }));
        return;
    }
}

// 주간 숙제 체크 이벤트 함수
export async function handleWeekListCheck(
    checklist: CheckCharacter[],
    characterIndex: number,
    listIndex: number,
    dispatch: AppDispatch
) {
    const userStr = sessionStorage.getItem('user');
    const storedUser: LoginUser = userStr ? JSON.parse(userStr) : null;
    const id = storedUser ? storedUser.id : '';
    const updatedList = {...checklist[characterIndex].weeklist[listIndex]};
    const prevList = {...updatedList};
    updatedList.isCheck = !updatedList.isCheck;
    dispatch(checkWeekList({
        characterIndex: characterIndex,
        listIndex: listIndex,
        weeklist: updatedList
    }));
    const editRes = await fetch(`/api/checklist/list`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            id: id,
            checklist: checklist,
            type: 'check-week-list',
            characterIndex: characterIndex,
            listIndex: listIndex,
            listItem: updatedList
        })
    });
    if (!editRes.ok) {
        addToast({
            title: "데이터 로드 오류 (콘텐츠)",
            description: `데이터를 가져오는데 문제가 발생하였습니다.`,
            color: "danger"
        });
        dispatch(checkWeekList({
            characterIndex: characterIndex,
            listIndex: listIndex,
            weeklist: prevList
        }));
        return;
    }
}

// 일일 숙제 목록 추가 이벤트 함수
export function useOnClickAddDayList(
    checklist: CheckCharacter[],
    characterIndex: number,
    dispatch: AppDispatch,
    addListItem: OtherList,
    setLoadingAdd: SetStateFn<boolean>,
    setInputValue: SetStateFn<string>
) {
    const userStr = sessionStorage.getItem('user');
    const storedUser: LoginUser = userStr ? JSON.parse(userStr) : null;
    const id = storedUser ? storedUser.id : '';
    const prevList = checklist[characterIndex].daylist;
    const newList = [...checklist[characterIndex].daylist];
    return async () => {
        setLoadingAdd(true);
        newList.push(addListItem);
        dispatch(editDayList({
            characterIndex: characterIndex,
            daylist: newList
        }));
        const addRes = await fetch(`/api/checklist/list`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id: id,
                checklist: checklist,
                type: 'edit-day-list-item',
                characterIndex: characterIndex,
                daylist: newList
            })
        });
        if (!addRes.ok) {
            addToast({
                title: "데이터 로드 오류 (콘텐츠)",
                description: `데이터를 가져오는데 문제가 발생하였습니다.`,
                color: "danger"
            });
            dispatch(editDayList({
                characterIndex: characterIndex,
                daylist: prevList
            }));
        }
        setLoadingAdd(false);
        setInputValue('');
    }
}

// 주간 숙제 목록 추가 이벤트 함수
export function useOnClickAddWeekList(
    checklist: CheckCharacter[],
    characterIndex: number,
    dispatch: AppDispatch,
    addListItem: OtherList,
    setLoadingAdd: SetStateFn<boolean>,
    setInputValue: SetStateFn<string>
) {
    const userStr = sessionStorage.getItem('user');
    const storedUser: LoginUser = userStr ? JSON.parse(userStr) : null;
    const id = storedUser ? storedUser.id : '';
    const prevList = checklist[characterIndex].weeklist;
    const newList = [...checklist[characterIndex].weeklist];
    return (
        async () => {
            setLoadingAdd(true);
            newList.push(addListItem);
            dispatch(editWeekList({
                characterIndex: characterIndex,
                weeklist: newList
            }));
            const addRes = await fetch(`/api/checklist/list`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: id,
                    checklist: checklist,
                    type: 'edit-week-list-item',
                    characterIndex: characterIndex,
                    weekList: newList
                })
            });
            if (!addRes.ok) {
                addToast({
                    title: "데이터 로드 오류 (콘텐츠)",
                    description: `데이터를 가져오는데 문제가 발생하였습니다.`,
                    color: "danger"
                });
                dispatch(editWeekList({
                    characterIndex: characterIndex,
                    weeklist: prevList
                }));
            }
            setLoadingAdd(false);
            setInputValue('');
        }
    )
}

// 휴식 게이지 관리 이벤트 함수
export function useOnClickSaveRestValue(
    checklist: CheckCharacter[],
    characterIndex: number,
    dispatch: AppDispatch,
    setLoadingSave: SetStateFn<boolean>,
    dungeon: number,
    boss: number,
    onClose: () => void
) {
    const userStr = sessionStorage.getItem('user');
    const storedUser: LoginUser = userStr ? JSON.parse(userStr) : null;
    const id = storedUser ? storedUser.id : '';
    const prevDay = {...checklist[characterIndex].day};
    const newDay: Day = {
        ...checklist[characterIndex].day,
        dungeonBouus: dungeon,
        dungeonUsing: 0,
        bossBonus: boss,
        bossUsing: 0,
        questBonus: 0,
        questUsing: 0
    }
    return async () => {
        setLoadingSave(true);
        dispatch(saveRest({
            characterIndex: characterIndex,
            day: newDay
        }));
        const saveRes = await fetch(`/api/checklist/list`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id: id,
                checklist: checklist,
                type: 'save-rest',
                characterIndex: characterIndex,
                day: newDay
            })
        });
        if (!saveRes.ok) {
            addToast({
                title: "데이터 로드 오류 (콘텐츠)",
                description: `데이터를 가져오는데 문제가 발생하였습니다.`,
                color: "danger"
            });
            dispatch(saveRest({
                characterIndex: characterIndex,
                day: prevDay
            }));
        } else {
            addToast({
                title: "수정 완료",
                description: `휴식 게이지가 정상적으로 저장되었습니다.`,
                color: "success"
            });
        }
        setLoadingSave(false);
        onClose();
    }
}

// 주간 숙제 목록 삭제 이벤트 함수
export async function handleRemoveWeekList(
    checklist: CheckCharacter[],
    characterIndex: number,
    listIndex: number,
    dispatch: AppDispatch
) {
    const userStr = sessionStorage.getItem('user');
    const storedUser: LoginUser = userStr ? JSON.parse(userStr) : null;
    const id = storedUser ? storedUser.id : '';
    const prevList = checklist[characterIndex].weeklist;
    const newList = prevList.filter((_, i) => i !== listIndex);
    dispatch(editWeekList({
        characterIndex: characterIndex,
        weeklist: newList
    }));
    const addRes = await fetch(`/api/checklist/list`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            id: id,
            checklist: checklist,
            type: 'edit-week-list-item',
            characterIndex: characterIndex,
            weekList: newList
        })
    });
    if (!addRes.ok) {
        addToast({
            title: "데이터 로드 오류 (콘텐츠)",
            description: `데이터를 가져오는데 문제가 발생하였습니다.`,
            color: "danger"
        });
        dispatch(editWeekList({
            characterIndex: characterIndex,
            weeklist: prevList
        }));
    }
}

// 일일 숙제 목록 삭제 이벤트 함수
export async function handleRemoveDayList(
    checklist: CheckCharacter[],
    characterIndex: number,
    listIndex: number,
    dispatch: AppDispatch,
) {
    const userStr = sessionStorage.getItem('user');
    const storedUser: LoginUser = userStr ? JSON.parse(userStr) : null;
    const id = storedUser ? storedUser.id : '';
    const prevList = checklist[characterIndex].daylist;
    const newList = prevList.filter((_, i) => i !== listIndex);
    dispatch(editDayList({
        characterIndex: characterIndex,
        daylist: newList
    }));
    const removeRes = await fetch(`/api/checklist/list`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            id: id,
            checklist: checklist,
            type: 'edit-day-list-item',
            characterIndex: characterIndex,
            daylist: newList
        })
    });
    if (!removeRes.ok) {
        addToast({
            title: "데이터 로드 오류 (콘텐츠)",
            description: `데이터를 가져오는데 문제가 발생하였습니다.`,
            color: "danger"
        });
        dispatch(editDayList({
            characterIndex: characterIndex,
            daylist: prevList
        }));
    }
}

// 주간 콘텐츠 골드 지정 이벤트 함수
export async function handleCheckGolds(
    checklist: CheckCharacter[],
    characterIndex: number,
    checklistIndex: number,
    dispatch: AppDispatch,
    isSelected: boolean,
    bosses: Boss[]
) {
    const userStr = sessionStorage.getItem('user');
    const storedUser: LoginUser = userStr ? JSON.parse(userStr) : null;
    const id = storedUser ? storedUser.id : '';
    let updatedChecklist = {
        ...checklist[characterIndex],
        checklist: checklist[characterIndex].checklist.map(item => ({ ...item }))
    };
    const prevChecklist = {...updatedChecklist};
    updatedChecklist.checklist[checklistIndex].isGold = isSelected;
    const copyChecklist = structuredClone(updatedChecklist.checklist[checklistIndex]);

    dispatch(checkWeek({
        characterIndex: characterIndex,
        checklistIndex: checklistIndex,
        checklist: updatedChecklist.checklist[checklistIndex]
    }));
    updatedChecklist.checklist = updatedChecklist.checklist.sort((a, b) => {
        const aBoss = bosses.find(item => item.name === a.name) ? bosses.find(item => item.name === a.name) : null;
        const aMax = aBoss ? Math.max(...aBoss.difficulty.map(d => d.level)) : 0;
        const bBoss = bosses.find(item => item.name === b.name) ? bosses.find(item => item.name === b.name) : null;
        const bMax = bBoss ? Math.max(...bBoss.difficulty.map(d => d.level)) : 0;
        if (!a.isGold && b.isGold) {
            return 1;
        } else if (a.isGold && !b.isGold) {
            return -1;
        } else {
            return bMax - aMax;  
        }
    });
    dispatch(removeWeek({
        characterIndex: characterIndex,
        checklist: updatedChecklist.checklist
    }))
    const editRes = await fetch(`/api/checklist/list`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            id: id,
            checklist: checklist,
            type: 'check-week',
            characterIndex: characterIndex,
            checklistIndex: checklistIndex,
            checklistItem: copyChecklist
        })
    });
    if (!editRes.ok) {
        addToast({
            title: "데이터 로드 오류 (콘텐츠)",
            description: `데이터를 가져오는데 문제가 발생하였습니다.`,
            color: "danger"
        });
        dispatch(checkWeek({
            characterIndex: characterIndex,
            checklistIndex: checklistIndex,
            checklist: prevChecklist.checklist[checklistIndex]
        }));
        return;
    }
}

// 주간 콘텐츠 항목 제거 이벤트 함수
export async function useOnClickRemoveItem(
    checklist: CheckCharacter[],
    characterIndex: number,
    checklistIndex: number,
    dispatch: AppDispatch
) {
    const userStr = sessionStorage.getItem('user');
    const storedUser: LoginUser = userStr ? JSON.parse(userStr) : null;
    const id = storedUser ? storedUser.id : '';
    const prevChecklist = checklist[characterIndex].checklist;
    const newChecklist = prevChecklist.filter((_, i) => i !== checklistIndex);
    dispatch(removeWeek({
        characterIndex: characterIndex,
        checklist: newChecklist
    }));
    const removeRes = await fetch(`/api/checklist/list`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            id: id,
            checklist: checklist,
            type: 'remove-week-item',
            characterIndex: characterIndex,
            weekChecklist: newChecklist
        })
    });
    if (!removeRes.ok) {
        addToast({
            title: "데이터 로드 오류 (콘텐츠)",
            description: `데이터를 가져오는데 문제가 발생하였습니다.`,
            color: "danger"
        });
        dispatch(removeWeek({
            characterIndex: characterIndex,
            checklist: prevChecklist
        }));
        return;
    }
}

// 주간 콘텐츠 추가 이벤트 함수
export async function useOnClickAddItem(
    checklist: CheckCharacter[],
    characterIndex: number,
    addChecklist: Checklist,
    dispatch: AppDispatch,
    setLoadingAdd: SetStateFn<boolean>,
    bosses: Boss[]
) {
    const userStr = sessionStorage.getItem('user');
    const storedUser: LoginUser = userStr ? JSON.parse(userStr) : null;
    const id = storedUser ? storedUser.id : '';
    const prevChecklist = checklist[characterIndex].checklist;
    let newChecklist = [...checklist[characterIndex].checklist];
    newChecklist.push(addChecklist);
    const copyChecklist = structuredClone(newChecklist);
    newChecklist = newChecklist.sort((a, b) => {
        const aBoss = bosses.find(item => item.name === a.name) ? bosses.find(item => item.name === a.name) : null;
        const aMax = aBoss ? Math.max(...aBoss.difficulty.map(d => d.level)) : 0;
        const bBoss = bosses.find(item => item.name === b.name) ? bosses.find(item => item.name === b.name) : null;
        const bMax = bBoss ? Math.max(...bBoss.difficulty.map(d => d.level)) : 0;
        if (!a.isGold && b.isGold) {
            return 1;
        } else if (a.isGold && !b.isGold) {
            return -1;
        } else {
            return bMax - aMax;  
        }
    });
    dispatch(removeWeek({
        characterIndex: characterIndex,
        checklist: newChecklist
    }));

    const addRes = await fetch(`/api/checklist/list`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            id: id,
            checklist: checklist,
            type: 'remove-week-item',
            characterIndex: characterIndex,
            weekChecklist: copyChecklist
        })
    });
    if (!addRes.ok) {
        addToast({
            title: "데이터 로드 오류 (콘텐츠)",
            description: `데이터를 가져오는데 문제가 발생하였습니다.`,
            color: "danger"
        });
        dispatch(removeWeek({
            characterIndex: characterIndex, 
            checklist: prevChecklist
        }));
    }
    setLoadingAdd(false); 
}

// 주간 콘텐츠 수정 이벤트 함수
export async function useOnClickEditItem(
    checklist: CheckCharacter[],
    characterIndex: number,
    checklistIndex: number,
    editChecklist: Checklist,
    dispatch: AppDispatch
) {
    const userStr = sessionStorage.getItem('user');
    const storedUser: LoginUser = userStr ? JSON.parse(userStr) : null;
    const id = storedUser ? storedUser.id : '';
    const prevChecklist = structuredClone(checklist[characterIndex].checklist[checklistIndex]);

    dispatch(checkWeek({
        characterIndex: characterIndex,
        checklistIndex: checklistIndex,
        checklist: editChecklist
    }));

    const editRes = await fetch(`/api/checklist/list`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            id: id,
            checklist: checklist,
            type: 'check-week',
            characterIndex: characterIndex,
            checklistIndex: checklistIndex,
            checklistItem: editChecklist
        })
    });

    if (!editRes.ok) {
        addToast({
            title: "데이터 로드 오류 (콘텐츠)",
            description: `데이터를 가져오는데 문제가 발생하였습니다.`,
            color: "danger"
        });
        dispatch(checkWeek({
            characterIndex: characterIndex,
            checklistIndex: checklistIndex,
            checklist: prevChecklist
        }));
        return false;
    }

    return true;
}

// 골드 받는 콘텐츠 개수 반환 함수
export function getTakeGold(checklist: Checklist[]): number {
    return checklist.filter(item => item.isGold).length;
}

// 콘텐츠 목록 가져오는 함수
export type WeekContent = {
    key: string,
    name: string
}
export function getWeekContents(bosses: Boss[], checklist: CheckCharacter[], index: number): WeekContent[] {
    const contents: WeekContent[] = [];
    for (const boss of bosses) {
        contents.push({
            key: boss.id,
            name: boss.name
        });
    }
    const results = contents.sort((a, b) => {
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
    }).filter((content) => index > -1 ? !checklist[index].checklist.some((item) => item.name === content.name) : true);
    return results;
}

// 콘텐츠의 난이도 목록을 가져오는 함수
export function getWeekStages(bosses: Boss[], id: string): number[] {
    const findBoss = getBossesById(bosses, id);
    const diffs = findBoss ? findBoss.difficulty.map(diff => diff.stage) : [];
    const results = [...new Set(diffs)];
    return results;
}

// 주간 콘텐츠 관문 선택에서 사용하는 기본 난이도 값을 반환합니다.
export const EMPTY_STAGE_DIFFICULTY = '선택안함';

// 콘텐츠 id 기준으로 관문 목록을 만들고 모든 관문의 난이도를 기본값으로 초기화합니다.
export function createDefaultWeekStages(bosses: Boss[], contentKey: string): ControlStage[] {
    return getWeekStages(bosses, contentKey).map((stage) => ({
        stage,
        difficulty: EMPTY_STAGE_DIFFICULTY
    }));
}

// 저장된 체크리스트 항목을 기준으로 관문별 선택 난이도를 복원합니다.
export function createWeekStagesFromChecklist(bosses: Boss[], contentKey: string, items: ChecklistItem[]): ControlStage[] {
    return createDefaultWeekStages(bosses, contentKey).map((stage) => {
        const selectedItem = items.find((item) => item.stage === stage.stage);
        return {
            ...stage,
            difficulty: selectedItem?.difficulty ?? EMPTY_STAGE_DIFFICULTY
        };
    });
}

// 관문 선택 상태를 실제 저장용 ChecklistItem 배열로 변환합니다.
// 이전과 같은 stage + difficulty 조합은 체크 상태를 유지하고, 변경된 조합은 새 항목으로 취급합니다.
export function buildWeekChecklistItems(
    boss: Boss | undefined,
    stages: ControlStage[],
    prevItems: ChecklistItem[] = []
): ChecklistItem[] {
    return stages
        .filter((stage) => stage.difficulty !== EMPTY_STAGE_DIFFICULTY)
        .map((stage) => {
            const prevItem = prevItems.find((item) => item.stage === stage.stage && item.difficulty === stage.difficulty);
            const diff = boss?.difficulty.find((item) => item.stage === stage.stage && item.difficulty === stage.difficulty);
            return {
                stage: stage.stage,
                difficulty: stage.difficulty,
                isBonus: prevItem?.isBonus ?? false,
                isCheck: prevItem?.isCheck ?? false,
                isDisable: prevItem?.isDisable ?? false,
                isBiweekly: diff?.isBiweekly ?? false
            };
        });
}

// 관문의 난이도 가져오는 함수
export function getDifficultyByStage(bosses: Boss[], id: string, stage: number): string[] {
    const results: string[] = ['선택안함'];
    const findBoss = getBossesById(bosses, id);
    const diffs = findBoss ? findBoss.difficulty.filter(diff => diff.stage === stage) : null;
    if (diffs) {
        for (const diff of diffs) {
            results.push(diff.difficulty);
        }
    }
    return results;
}

// id로 콘텐츠 Boss 반환하는 함수
export function getBossesById(bosses: Boss[], id: string): Boss | undefined {
    return bosses.find(item => item.id === id);
}

// index로 Boss의 난이도를 반환하는 함수
export function getDifficultyByIndex(boss: Boss, index: number): Difficulty {
    return boss.difficulty[index];
}

// 격주 관련 골드 체크 포함 여부 확인 함수
export function isBiweeklyContent(
    checklist: Checklist[], 
    contentKey: string, 
    difficultyIndex: number,
    bosses: Boss[]
): boolean {
    let isIncludes = false;
    const findBoss = getBossesById(bosses, contentKey);
    if (findBoss) {
        const isIncludeBoss = checklist.some(item => item.name === findBoss.name);
        if (isIncludeBoss && findBoss.difficulty[difficultyIndex].isBiweekly) {
            isIncludes = true;
        }
    }
    return isIncludes;
}

// 격주 관련 격주가 아닌 콘텐츠에서 격주 콘텐츠 추가할 경우 확인 함수
export function isCheckBiweeklyContent(
    checklist: Checklist[], 
    contentKey: string, 
    difficultyIndex: number,
    bosses: Boss[]
): boolean {
    let isIncludes = false;
    const findBoss = getBossesById(bosses, contentKey);
    if (findBoss) {
        const isIncludeBoss = checklist.some(item => item.name === findBoss.name);
        if (!isIncludeBoss && findBoss.difficulty[difficultyIndex].isBiweekly) {
            isIncludes = true;
        }
    }
    return isIncludes;
}

// 큐브 총합 반환 함수
export function getAllCubeCount(
    character: CheckCharacter
): number {
    let sum = 0;
    for (const cube of character.cubelist) {
        sum += cube.count;
    }
    return sum;
}

// 캐릭터 레벨에 맞는 큐브 리스트 반환 함수
export function getCubeList(level: number, cubes: Cube[]): Cube[] {
    const returnCubes: Cube[] = [];
    for (const cube of cubes) {
        if (cube.level <= level) {
            returnCubes.push(cube);
        }
    }
    return returnCubes;
}

// 해당 큐브의 보유 중인 큐브 개수 반환 함수
export function getCountCube(cubelist: CubeList[], cubeID: string): number {
    const item: CubeList | undefined = cubelist.find(item => item.id === cubeID);
    if (item) {
        return item.count;
    } else {
        return 0;
    }
}

// 큐브 개수 조절
export async function handleControlCube(
    checklist: CheckCharacter[],
    characterIndex: number,
    cubeID: string,
    dispatch: AppDispatch,
    isAdd: boolean,
    count: number
) {
    const userStr = sessionStorage.getItem('user');
    const storedUser: LoginUser = userStr ? JSON.parse(userStr) : null;
    const id = storedUser ? storedUser.id : '';
    const cubelist = checklist[characterIndex].cubelist.map(item => ({ ...item }));
    const prevCubelist = checklist[characterIndex].cubelist.map(item => ({ ...item }));
    const findIndex = cubelist.findIndex(item => item.id === cubeID);
    const value = isNaN(count) ? 1 : count;
    if (findIndex !== -1) {
        cubelist[findIndex].count += isAdd ? value : cubelist[findIndex].count <= 0 ? 0 : (value * -1);
        if (cubelist[findIndex].count < 0) {
            cubelist[findIndex].count = 0;
        }
    } else {
        cubelist.push({
            id: cubeID,
            count: isAdd ? value : 0
        });
    }
    dispatch(editCube({
        characterIndex: characterIndex,
        cublist: cubelist
    }));
    const editRes = await fetch(`/api/checklist/list`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            id: id,
            checklist: checklist,
            type: 'edit-cube',
            characterIndex: characterIndex,
            cubelist: cubelist
        })
    });
    if (!editRes.ok) {
        addToast({
            title: "데이터 로드 오류 (콘텐츠)",
            description: `데이터를 가져오는데 문제가 발생하였습니다.`,
            color: "danger"
        });
        dispatch(editCube({
            characterIndex: characterIndex,
            cublist: prevCubelist
        }));
        return;
    }
}

// 골드 획득 지정 여부 함수
export async function handleCheckGold(
    checklist: CheckCharacter[],
    characterIndex: number,
    isGold: boolean,
    dispatch: AppDispatch
) {
    const userStr = sessionStorage.getItem('user');
    const storedUser: LoginUser = userStr ? JSON.parse(userStr) : null;
    const id = storedUser ? storedUser.id : '';
    const prevIsGold = checklist[characterIndex].isGold;
    dispatch(checkGold({
        characterIndex: characterIndex,
        isGold: isGold
    }));
    const editRes = await fetch(`/api/checklist/list`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            id: id,
            checklist: checklist,
            type: 'check-gold',
            characterIndex: characterIndex,
            isGold: isGold
        })
    });
    if (!editRes.ok) {
        addToast({
            title: "데이터 로드 오류 (콘텐츠)",
            description: `데이터를 가져오는데 문제가 발생하였습니다.`,
            color: "danger"
        });
        dispatch(checkGold({
            characterIndex: characterIndex,
            isGold: prevIsGold
        }));
        return;
    }
}

// 캐릭터 삭제 함수
export async function handleRemoveCharacter(
    checklist: CheckCharacter[],
    characterIndex: number,
    dispatch: AppDispatch
) {
    const userStr = sessionStorage.getItem('user');
    const storedUser: LoginUser = userStr ? JSON.parse(userStr) : null;
    const id = storedUser ? storedUser.id : '';
    const removedCharacterName = checklist[characterIndex].nickname;
    const removedList = checklist.filter((_, index) => index !== characterIndex);
    const prevList = checklist.map(item => ({ ...item }));
    dispatch(removeCharacter(removedList));
    const removeRes = await fetch(`/api/checklist/list`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            id: id,
            checklist: checklist,
            type: 'remove-character',
            characterIndex: characterIndex
        })
    });
    if (!removeRes.ok) {
        addToast({
            title: "데이터 로드 오류 (콘텐츠)",
            description: `데이터를 가져오는데 문제가 발생하였습니다.`,
            color: "danger"
        });
        dispatch(removeCharacter(prevList));
        return;
    } else {
        addToast({
            title: "캐릭터 삭제 완료",
            description: `\"${removedCharacterName}\"의 캐릭터를 삭제하였습니다`,
            color: "success"
        });
    }
}

// 캐릭터 갱신하기
export function useClickUpdatedCharacters(
    checklist: CheckCharacter[],
    dispatch: AppDispatch,
    setLoading: SetStateFn<boolean>,
    setDisableUpdate: SetStateFn<boolean>
) {
    const userStr = sessionStorage.getItem('user');
    const storedUser: LoginUser = userStr ? JSON.parse(userStr) : null;
    const id = storedUser ? storedUser.id : '';
    const decryptedApiKey = storedUser?.apiKey ? decrypt(storedUser.apiKey, secretKey) : null;
    const newChecklist = checklist.map(item => ({ ...item }));
    const prevChecklist = checklist.map(item => ({ ...item }));
    return async () => {
        setLoading(true);
        for (const character of newChecklist) {
            const lostarkRes = await fetch(`/api/lostark?value=${character.nickname}&code=1&key=${decryptedApiKey}`);
            if (lostarkRes.ok) {
                const data = await lostarkRes.json();
                if (data !== null && data !== undefined) {
                    character.server = data.ServerName;
                    character.job = data.CharacterClassName;
                    character.level = Number(data.ItemAvgLevel.replaceAll(',', ''));
                }
            } else {
                if (lostarkRes.status === 503) {
                    addToast({
                        title: "서버 점검",
                        description: `로스트아크가 점검중입니다. 점검 이후 시도해주세요.`,
                        color: "danger"
                    });
                    setLoading(false);
                    return;
                } else {
                    console.log(`Unable to load ${character.nickname}'s character data. (Error Status : ${lostarkRes.status})`);
                }
            }
        }
        dispatch(removeCharacter(newChecklist));
        const updatedRes = await fetch(`/api/checklist/list`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id: id,
                checklist: checklist,
                type: 'updated-checklist',
                newChecklist: newChecklist
            })
        });
        if (!updatedRes.ok) {
            addToast({
                title: "데이터 로드 오류 (콘텐츠)",
                description: `데이터를 가져오는데 문제가 발생하였습니다.`,
                color: "danger"
            });
            dispatch(removeCharacter(prevChecklist));
            return;
        } else {
            addToast({
                title: "갱신 완료",
                description: `캐릭터들의 상태를 최신 상태로 갱신하였습니다.`,
                color: "success"
            });
        }
        const now = Date.now();
        localStorage.setItem("button_unlock_time", now.toString());
        setDisableUpdate(true);
        setLoading(false);
    }
}

// 캐릭터 추가에서 캐릭터 조회 기능 함수
export type SearchCharacter = {
    nickname: string,
    server: string,
    level: number,
    job: string,
    isCheck: boolean
}
export function useClickLoadCharacters(
    value: string,
    setResult: SetStateFn<SearchCharacter[]>,
    setLoadingSearch: SetStateFn<boolean>
) {
    const userStr = sessionStorage.getItem('user');
    const storedUser: LoginUser = userStr ? JSON.parse(userStr) : null;
    const decryptedApiKey = storedUser?.apiKey ? decrypt(storedUser.apiKey, secretKey) : null;
    return async () => {
        if (value.trim().length < 2) {
            addToast({
                title: "입력 오류",
                description: '입력한 값이 2글자 미만입니다.',
                color: "danger"
            });
            return;
        }
        value = value.trim();
        setLoadingSearch(true);
        const lostarkRes = await fetch(`/api/lostark?value=${value}&code=0&key=${decryptedApiKey}`);
        if (!lostarkRes.ok) {
            if (lostarkRes.status === 503) {
                addToast({
                    title: "서버 점검",
                    description: `로스트아크가 점검중입니다. 점검 이후 시도해주세요.`,
                    color: "danger"
                });
            } else {
                console.log(`Unable to load ${value}'s character data. (Error Status : ${lostarkRes.status})`);    
            }
            return;
        }
        const data: Array<any> = await lostarkRes.json();
        if (data.length === 0) {
            addToast({
                title: "결과 없음",
                description: '해당 캐릭터 이름으로 검색된 결과가 없습니다.',
                color: "danger"
            });
            setResult([]);
        } else {
            const characters: SearchCharacter[] = [];
            for (const item of data) {
                characters.push({
                    nickname: item.CharacterName,
                    server: item.ServerName,
                    level: Number(item.ItemAvgLevel.replaceAll(',', '')),
                    job: item.CharacterClassName,
                    isCheck: false
                });
            }
            characters.sort((a, b) => b.level - a.level);
            addToast({
                title: "조회 완료",
                description: '캐릭터 조회를 완료하였습니다.',
                color: "success"
            });
            setResult(characters);
        }
        setLoadingSearch(false);
    }
}

// 조회된 캐릭터 선택 이벤트 함수
export function handleSelectCharacter(
    isSelected: boolean,
    index: number,
    result: SearchCharacter[],
    setResult: SetStateFn<SearchCharacter[]>
) {
    const newResult = result.map(item => ({ ...item }));
    newResult[index].isCheck = isSelected;
    setResult(newResult);
}

// 조회된 캐릭터의 체크 갯수
export function getCheckedResult(result: SearchCharacter[]): number {
    let sum = 0;
    for (const item of result) {
        if (item.isCheck) {
            sum++;
        }
    }
    return sum;
}

// 조회 Modal에서 닫을 경우 이벤트 함수
export function useCloseModal(
    setResult: SetStateFn<SearchCharacter[]>,
    setInputValue: SetStateFn<string>
) {
    return () => {
        setResult([]);
        setInputValue('');
    }
}

// 캐릭터 추가 함수
export async function handleAddCharacter(
    checklist: CheckCharacter[],
    result: SearchCharacter[],
    dispatch: AppDispatch,
    onClose: () => void,
    setLoadingAdd: SetStateFn<boolean>,
    isGold: boolean,
    bosses: Boss[],
    selected: string
) {
    const userStr = sessionStorage.getItem('user');
    const storedUser: LoginUser = userStr ? JSON.parse(userStr) : null;
    const id = storedUser ? storedUser.id : '';
    const newChecklist = checklist.map(item => ({ ...item }));
    let notImportedList: string[] = [];
    for (const character of checklist) {
        for (const content of character.checklist) {
            for (const item of content.items) {
                const findBoss = bosses.find(boss => {
                    let isFindedOnce = false;
                    for (const diff of boss.difficulty) {
                        if (item.difficulty === diff.difficulty && item.stage === diff.stage) {
                            if (diff.isOnce) {
                                isFindedOnce = true;
                            }
                        }
                    }
                    return boss.name === content.name && isFindedOnce;
                });
                if (findBoss) {
                    notImportedList.push(findBoss.name);
                }
            }
        }
    }
    setLoadingAdd(true);
    for (const item of result) {
        if (item.isCheck) {
            const checkCharacter: CheckCharacter = {
                nickname: item.nickname,
                level: item.level,
                job: item.job,
                server: item.server,
                day: {
                    dungeon: 0,
                    dungeonBouus: 0,
                    dungeonUsing: 0,
                    boss: 0,
                    bossBonus: 0,
                    bossUsing: 0,
                    quest: 0,
                    questBonus: 0,
                    questUsing: 0
                },
                checklist: initialWeekContents(item.level, bosses, notImportedList),
                cubelist: [],
                daylist: [],
                weeklist: [],
                cube: 0,
                isGold: isGold,
                otherGold: 0,
                position: 9999,
                account: selected
            }
            newChecklist.push(checkCharacter);
        }
    }
    const inputRes = await fetch(`/api/checklist/list`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            id: id,
            checklist: newChecklist,
            type: 'init'
        })
    });
    if (!inputRes.ok) {
        addToast({
            title: `데이터 저장 오류 (${inputRes.status})`,
            description: `데이터를 저장하는데 문제가 발생하였습니다.`,
            color: "danger"
        });
    } else {
        addToast({
            title: "캐릭터 추가",
            description: `캐랙터 추가가 완료되었습니다.`,
            color: "success"
        });
        dispatch(saveData(newChecklist));
    }  
    setLoadingAdd(false);
    onClose();
}

// 부수입 계산
export async function handleCalculateOtherGold(
    checklist: CheckCharacter[],
    characterIndex: number,
    type: string,
    otherGold: number,
    dispatch: AppDispatch
) {
    const userStr = sessionStorage.getItem('user');
    const storedUser: LoginUser = userStr ? JSON.parse(userStr) : null;
    const id = storedUser ? storedUser.id : '';
    const prevOtherGold = checklist[characterIndex].otherGold;
    let resultOtherGold = prevOtherGold;
    switch (type) {
        case 'apply':
            resultOtherGold = otherGold;
            break;
        case 'add':
            resultOtherGold += otherGold;
            break;
        case 'minus':
            resultOtherGold -= otherGold;
            break;
    }
    dispatch(calculateOtherGold({
        characterIndex: characterIndex,
        otherGold: resultOtherGold
    }));
    const editRes = await fetch(`/api/checklist/list`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            id: id,
            checklist: checklist,
            type: 'caculate-other-gold',
            characterIndex: characterIndex,
            otherGold: resultOtherGold
        })
    });
    if (!editRes.ok) {
        addToast({
            title: "데이터 로드 오류 (콘텐츠)",
            description: `데이터를 가져오는데 문제가 발생하였습니다.`,
            color: "danger"
        });
        dispatch(calculateOtherGold({
            characterIndex: characterIndex,
            otherGold: prevOtherGold
        }));
        return;
    }
}

// 순서 변경 드래그 이벤트 함수
export function handleOnDragEnd(
    positions: CheckCharacter[],
    setPositions: SetStateFn<CheckCharacter[]>
) {
    return (result: any) => {
        if (!result.destination) return;

        const items = Array.from(positions);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        const updatedPositions = items.map((char, index) => ({
            ...char,
            position: index
        }));

        setPositions(updatedPositions);
    }
}

// 캐릭터 순서 적용
export async function handleApplyPositions(
    positions: CheckCharacter[],
    onClose: () => void,
    setLoading: SetStateFn<boolean>,
    dispatch: AppDispatch
) {
    setLoading(true);
    const userStr = sessionStorage.getItem('user');
    const storedUser: LoginUser = userStr ? JSON.parse(userStr) : null;
    const id = storedUser ? storedUser.id : '';
    const inputRes = await fetch(`/api/checklist/list`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            id: id,
            checklist: positions,
            type: 'init'
        })
    });
    if (!inputRes.ok) {
        addToast({
            title: `데이터 저장 오류 (${inputRes.status})`,
            description: `데이터를 저장하는데 문제가 발생하였습니다.`,
            color: "danger"
        });
    } else {
        addToast({
            title: "순서 변경 완료",
            description: `캐릭터들의 순서를 변경하였습니다.`,
            color: "success"
        });
        dispatch(saveData(positions));
        setLoading(false);
        onClose();
    }
}

// 이미 추가된 캐릭터인지 확인 여부
export function isHaveCharacter(checklist: CheckCharacter[], nickname: string) {
    return checklist.findIndex(item => item.nickname === nickname) !== -1;
}

// 주간 콘텐츠 골드량 가져오기
export function getDiffByContent(bosses: Boss[], name: string, diff: string): Difficulty | undefined {
    const boss: Boss | undefined = bosses.find(item => item.name === name);
    const difficulty: Difficulty | undefined = boss ? boss.difficulty.find(item => item.difficulty === diff) : undefined;
    return difficulty;
}

// 주간 콘텐츠 보스 정보 가져오기
export function getBossByContent(bosses: Boss[], name: String): Boss | undefined {
    const boss: Boss | undefined = bosses.find(item => item.name === name);
    return boss;
}

// 모든 캐릭터 총 콘텐츠 골드량 가져오기
export function getAllContentGold(bosses: Boss[], checklist: CheckCharacter[]): number {
    let sumGold = 0;
    for (const character of checklist) {
        sumGold += getCompleteSharedGoldCharacter(bosses, character);
    }
    return sumGold
}

// 모든 캐릭터 총 콘텐츠 골드량 가져오기
export function getAllBoundGold(bosses: Boss[], checklist: CheckCharacter[]): number {
    let sumGold = 0;
    for (const character of checklist) {
        sumGold += getCompleteBoundGoldCharacter(bosses, character);
    }
    return sumGold
}

// 모든 캐릭터 총 부수입 가져오기
export function getAllContentOtherGold(bosses: Boss[], checklist: CheckCharacter[]): number {
    let sumGold = 0;
    for (const character of checklist) {
        sumGold += character.otherGold;
    }
    return sumGold
}

// 티어 칼럼의 배열을 반환하는 함수
export function getColumnsByCubeTiers(cubes: Cube[]): number[] {
    const results: number[] = [];
    for (const cube of cubes) {
        if (!results.includes(cube.tier)) {
            results.push(cube.tier);
        }
    }
    return results;
}

// 큐브 현황 가져오기
export type CubeStatue = {
    level: number,
    cubeCount: CubeCount[]
}
type CubeCount = {
    tier: number,
    count: number
}
export function getCubeStatues(character: CheckCharacter, cubes: Cube[]): CubeStatue[] {
    const tiers: number[] = getColumnsByCubeTiers(cubes);
    const allCounts: CubeCount[] = [];
    for (const tier of tiers) {
        const newCount: CubeCount = {
            tier: tier,
            count: 0
        }
        allCounts.push(newCount);
    }
    for (const data of character.cubelist) {
        if (data.count > 0) {
            const item = getCubeCountByID(cubes, data.id);
            if (item) {
                const index = allCounts.findIndex(c => c.tier === item.tier);
                if (index !== -1) {
                    const all = item.count * data.count;
                    allCounts[index].count += all;
                }
            }
        }
    }
    const statues: CubeStatue[] = [];
    for (let i = 1; i <= 10; i++) {
        const cubeCount: CubeCount[] = [];
        for (const count of allCounts) {
            const newCount: CubeCount = {
                tier: count.tier,
                count: 0
            }
            if (count.count > 0) {
                const remainGems = count.count % 3;
                newCount.count = remainGems;
                count.count = Math.floor(count.count / 3);
            }
            cubeCount.push(newCount);
        }
        if (!isNotRemainGems(cubeCount)) {
            const newStatue: CubeStatue = {
                level: i,
                cubeCount: cubeCount
            }
            statues.push(newStatue);
        }
    }
    return statues;
}

// 보석 개수가 모든 티어가 0일 경우
function isNotRemainGems(counts: CubeCount[]): boolean {
    for (const count of counts) {
        if (count.count > 0) {
            return false;
        }
    }
    return true;
}

// 큐브 ID로 보석 티어와 개수 가져오기
function getCubeCountByID(cubes: Cube[], id: string): CubeCount | null {
    const cube = cubes.find(item => item.id === id);
    if (cube) {
        const cubeCount: CubeCount = {
            tier: cube.tier,
            count: cube.reward
        }
        return cubeCount;
    }
    return null;
}

// 큐브 초기화
export async function handleResetCube(
    checklist: CheckCharacter[],
    characterIndex: number,
    dispatch: AppDispatch
) {
    const userStr = sessionStorage.getItem('user');
    const storedUser: LoginUser = userStr ? JSON.parse(userStr) : null;
    const id = storedUser ? storedUser.id : '';
    dispatch(resetCube(characterIndex));
    const editRes = await fetch(`/api/checklist/list`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            id: id,
            checklist: checklist,
            type: 'reset-cube',
            characterIndex: characterIndex
        })
    });
    if (!editRes.ok) {
        addToast({
            title: "데이터 로드 오류 (콘텐츠)",
            description: `데이터를 가져오는데 문제가 발생하였습니다.`,
            color: "danger"
        });
    }
}

// 특정 캐릭터의 특정 큐브 갯수 반환 함수
export function getCubeCountByCharacter(character: CheckCharacter, cube: Cube): number {
    const cubeItem = character.cubelist.find(item => item.id === cube.id);
    if (cubeItem) {
        return cubeItem.count;
    }
    return 0;
}

// 특정 큐브의 전체 캐릭터의 큐브 개수를 반환하는 함수
export function getCubeCountByChecklist(checklist: CheckCharacter[], cube: Cube): number {
    let sum = 0;
    for (const character of checklist) {
        const cubeItem = character.cubelist.find(item => item.id === cube.id);
        if (cubeItem) {
            sum += cubeItem.count;
        }
    }
    return sum;
}

// 보석 레벨 별 보석 개수 반환 함수
export function getGemCountByCharacter(character: CheckCharacter, cubes: Cube[], tier: number): number[] {
    let sum = 0;
    for (const data of character.cubelist) {
        if (data.count > 0) {
            const item = getCubeCountByID(cubes, data.id);
            if (item) {
                if (item.tier === tier) {
                    const all = item.count * data.count;
                    sum += all;
                }
            }
        }
    }
    const gems: number[] = [];
    for (let i = 1; i <= 10; i++) {
        gems.push(i === 10 ? sum : sum % 3);
        sum = Math.floor(sum / 3);
    }
    return gems;
}

// 보석 레벨 별 전체 캐릭터의 보석 개수 반환 함수
export function getGemCountByChecklist(checklist: CheckCharacter[], cubes: Cube[], tier: number): number[] {
    let sum = 0;
    for (const character of checklist) {
        for (const data of character.cubelist) {
            if (data.count > 0) {
                const item = getCubeCountByID(cubes, data.id);
                if (item) {
                    if (item.tier === tier) {
                        const all = item.count * data.count;
                        sum += all;
                    }
                }
            }
        }
    }
    const gems: number[] = [];
    for (let i = 1; i <= 10; i++) {
        gems.push(i === 10 ? sum : sum % 3);
        sum = Math.floor(sum / 3);
    }
    return gems;
}

// 남은 숙제 데이터 불러오기
export function loadDatas(
    checklist: CheckCharacter[], 
    bosses: Boss[], 
    setDatas: SetStateFn<ChecklistData[]>
) {
    const datas: ChecklistData[] = [];
    for (const character of checklist) {
        for (const content of character.checklist) {
            let isAdded = false;
            const diffs: ChecklistDataDifficulty[] = [];
            for (const item of content.items) {
                if (!item.isCheck && !item.isDisable) {
                    const newDiff: ChecklistDataDifficulty = {
                        stage: item.stage,
                        difficulty: item.difficulty,
                        isComplete: item.isCheck
                    }
                    diffs.push(newDiff);
                    isAdded = true;
                }
            }
            if (isAdded) {
                diffs.sort((a, b) => a.stage - b.stage);
                const newData: ChecklistData = {
                    nickname: character.nickname,
                    level: character.level,
                    job: character.job,
                    contentName: content.name,
                    difficultys: diffs,
                    isGold: content.isGold,
                    isGoldCharacter: character.isGold
                }
                datas.push(newData);
            }
        }
    }
    datas.sort((a, b) => getLevelByContent(bosses, b.contentName, b.difficultys) - getLevelByContent(bosses, a.contentName, a.difficultys));
    setDatas(datas);
}

// 수동 초기화 함수
export async function handleResetChecklist(
    checklist: CheckCharacter[], 
    biweekly: number, 
    dispatch: AppDispatch,
    setLoadingReset: SetStateFn<boolean>
) {
    if (confirm('정말로 수동으로 초기화를 하시겠습니까? 한번 초기화한 작업은 되돌릴 수 없습니다.')) {
        setLoadingReset(true);
        const userStr = sessionStorage.getItem('user');
        const storedUser: LoginUser = userStr ? JSON.parse(userStr) : null;
        const id = storedUser ? storedUser.id : '';
        const prevChecklist = checklist.map(item => ({ ...item }));
        const updatedChecklist = checklist.map(section => {
            const day = section.day || {};
            const daylist = Array.isArray(section.daylist) ? section.daylist : [];

            const currentDungeonBonus = day.dungeonBouus ?? 0;
            const currentBossBonus = day.bossBonus ?? 0;
            const currentQuestBonus = day.questBonus ?? 0;

            const dungeon = day.dungeon ?? 0;
            const boss = day.boss ?? 0;
            const quest = day.quest ?? 0;

            let newDungeonBonus = currentDungeonBonus + (1 - dungeon) * 20;
            newDungeonBonus = Math.min(newDungeonBonus, 200);

            let newBossBonus = currentBossBonus + (1 - boss) * 10;
            newBossBonus = Math.min(newBossBonus, 100);

            let newQuestBonus = currentQuestBonus + (3 - quest) * 10;
            newQuestBonus = Math.min(newQuestBonus, 100);
            const checklistSection = Array.isArray(section.checklist) ? section.checklist : [];
            const weeklist = Array.isArray(section.weeklist) ? section.weeklist : [];
            const updatedSection = {
                ...section,
                day: {
                    dungeon: 0,
                    dungeonBouus: newDungeonBonus,
                    dungeonUsing: 0,
                    boss: 0,
                    bossBonus: newBossBonus,
                    bossUsing: 0,
                    quest: 0,
                    questBonus: newQuestBonus,
                    questUsing: 0
                },
                daylist: daylist.map((item: any) => ({
                    ...item,
                    isCheck: false
                })),
                checklist: checklistSection.map((item: any) => {
                    const itemsSection = Array.isArray(item.items) ? item.items : [];
                    return {
                        ...item,
                        items: itemsSection.map((it: any) => {
                            let isDisable = it.isDisable;
                            let isBiweekly = it.isBiweekly ?? false;
                            if (!isDisable) {
                                if (it.isCheck && isBiweekly && biweekly%2 === 1) {
                                    isDisable = true;
                                }
                            }
                            if (biweekly%2 === 0) {
                                isDisable = false;
                            }
                            return {
                                ...it,
                                isCheck: false,
                                isDisable: isDisable
                            }
                        })
                    }
                }),
                otherGold: 0,
                weeklist: weeklist.map((list: any) => ({
                    ...list,
                    isCheck: false
                }))
            }
            return updatedSection;
        });
        dispatch(removeCharacter(updatedChecklist));
        const updatedRes = await fetch(`/api/checklist/list`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id: id,
                checklist: checklist,
                type: 'updated-checklist',
                newChecklist: updatedChecklist
            })
        });
        if (!updatedRes.ok) {
            addToast({
                title: "데이터 로드 오류 (콘텐츠)",
                description: `데이터를 가져오는데 문제가 발생하였습니다.`,
                color: "danger"
            });
            dispatch(removeCharacter(prevChecklist));
        } else {
            addToast({
                title: "초기화 완료",
                description: `숙제 내용을 수동으로 초기화하였습니다.`,
                color: "success"
            });
        }
        setLoadingReset(false);
    }
}

// 캐릭터 검색 필터
export function filterChecklist(
    character: CheckCharacter,
    filterContent: Selection,
    bosses: Boss[],
    checklist: CheckCharacter[],
    isRemainHomework: boolean,
    isShowGoldCharacter: boolean,
    filterAccount: Selection
): boolean {
    // 콘텐츠 필터
    let isFinded = false;
    const valueList = Array.from(filterContent);
    if (valueList.length !== 0) {
        const sortedBosses = getBossesByHaveContent(checklist, bosses);
        const selectedIndex = Number(valueList[0]);
        character.checklist.forEach((content) => {
            if (content.name === sortedBosses[selectedIndex]) {
                isFinded = true;
            }
        });
    } else {
        isFinded = true;
    }

    // 남은 숙제 여부 필터
    let isFindedRemainHomework = false;
    if (isRemainHomework) {
        character.checklist.forEach((content) => {
            for (const item of content.items) {
                if (!item.isCheck) {
                    isFindedRemainHomework = true;
                }
            }
        });
        character.weeklist.forEach((content) => {
            if (!content.isCheck) {
                isFindedRemainHomework = true;
            }
        });
    } else {
        isFindedRemainHomework = true;
    }

    // 골드 지정 캐릭터 필터
    let isFindedGoldCharacter = false;
    if (isShowGoldCharacter) {
        isFindedGoldCharacter = character.isGold;
    } else {
        isFindedGoldCharacter = true;
    }

    // 계정 구분 필터
    let isFindedAccount = false;
    const accountList = Array.from(filterAccount);
    if (accountList.length !== 0) {
        if (character.account === getAccounts(checklist)[Number(accountList[0])]) {
            isFindedAccount = true;
        }
    } else {
        isFindedAccount = true;
    }

    return isFinded && isFindedRemainHomework && isFindedGoldCharacter && isFindedAccount;
}

// 숙제로 등록된 콘텐츠 목록
export function getBossesByHaveContent(checklist: CheckCharacter[], bosses: Boss[]): string[] {
    const filteredBosses: Boss[] = [];
    checklist.forEach((character) => {
        character.checklist.forEach((content) => {
            const findObj = bosses.find(boss => boss.name === content.name);
            if (findObj) {
                const findIndex = filteredBosses.findIndex(boss => boss.name === findObj.name);
                if (findIndex === -1) {
                    filteredBosses.push(findObj);
                }
            }
        });
    });
    const sortedBosses = filteredBosses.sort((a, b) => {
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
    });
    return sortedBosses.map(boss => boss.name);
}

// 계정 추가 버튼 이벤트
export function useClickAddAccount(
    value: string, 
    setValue: SetStateFn<string>,
    accounts: string[], 
    setAccounts: SetStateFn<string[]>
) {
    return () => {
        if (value.length < 2) {
            addToast({
                title: "글자 수 미달",
                description: `글자 수가 2글자 이상만 입력이 가능합니다.`,
                color: "danger"
            });
            return;
        }
        const cloneAccounts = structuredClone(accounts);
        cloneAccounts.push(value);
        setAccounts(cloneAccounts);
        setValue('');
    }
}

// 계정 변경 버튼 이벤트
export async function handleSelectAccount(
    selected: string,
    characterIndex: number,
    dispatch: AppDispatch,
    onClose: () => void,
    setLoadingButton: SetStateFn<boolean>,
    checklist: CheckCharacter[]
) {
    const userStr = sessionStorage.getItem('user');
    const storedUser: LoginUser = userStr ? JSON.parse(userStr) : null;
    if (storedUser) {
        setLoadingButton(true);
        const id = storedUser ? storedUser.id : '';
        const prevAccount = checklist[characterIndex].account;
        dispatch(updateAccount({
            characterIndex: characterIndex,
            account: selected
        }));
        const res = await fetch(`/api/checklist/list`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id: id,
                checklist: checklist,
                type: 'update-account',
                characterIndex: characterIndex,
                account: selected
            })
        });
        if (!res.ok) {
            addToast({
                title: "저장 오류",
                description: `데이터를 저장하는데 문제가 발생하였습니다.`,
                color: "danger"
            });
            dispatch(updateAccount({
                characterIndex: characterIndex,
                account: prevAccount
            }));
        }
        setLoadingButton(false);
        onClose();
    }
}

// 계정 목록 반환 함수
export function getAccounts(checklist: CheckCharacter[]): string[] {
    const accounts: string[] = [];
    checklist.forEach((character) => {
        if (!accounts.includes(character.account)) {
            accounts.push(character.account);
        }
    });
    return accounts;
}

// 주간 콘텐츠 체크박스의 체크 여부
export function isCheckHomework(content: Checklist): boolean {
    let isChecked = true;
    if (content.items.length === 0) return false;
    for (const item of content.items) {
        if (!item.isCheck && !item.isDisable) {
            isChecked = false;
            break;
        }
    }
    return isChecked;
}

// 보스 간단 이름 가져오기
export function getSimpleBossName(bosses: Boss[], name: string): string {
    const findBoss = bosses.find(boss => boss.name === name);
    return findBoss ? findBoss.simple : '알 수 없는 콘텐츠';
}

// 관문 별 체크 버튼 테두리 반환
export function getBorderByStage(diff: string, isDisable: boolean): string {
    if (isDisable) return 'border-gray-400 dark:border-gray-600';
    if (diff.includes('싱글')) return 'border-blue-400 dark:border-blue-600';
    else if (diff.includes('노말') || diff.includes('1단계')) return 'border-green-600 dark:border-green-400';
    else if (diff.includes('하드') || diff.includes('2단계')) return 'border-red-600 dark:border-red-400';
    else if (diff.includes('더퍼스트') || diff.includes('나이트메어') || diff.includes('3단계')) return 'border-purple-600 dark:border-purple-400';
    return 'border-yellow-600 dark:border-yellow-400';
}

// 관문 별 체크 버튼 배경색 반환
export function getBackgroundByStage(diff: string, isDisable: boolean): string {
    if (isDisable) return 'bg-gray-400 dark:bg-gray-600';
    if (diff.includes('싱글')) return 'bg-blue-400 dark:bg-blue-600';
    else if (diff.includes('노말') || diff.includes('1단계')) return 'bg-green-600 dark:bg-green-400';
    else if (diff.includes('하드') || diff.includes('2단계')) return 'bg-red-600 dark:bg-red-400';
    else if (diff.includes('더퍼스트') || diff.includes('나이트메어') || diff.includes('3단계')) return 'bg-purple-600 dark:bg-purple-400';
    return 'bg-gray-600 dark:bg-gray-400';
}

// 관문 별 체크 버튼 배경색 반환
export function getBackground50ByStage(diff: string, isDisable: boolean): string {
    if (isDisable) return 'bg-gray-400/50 dark:bg-gray-600/50 fadedtext';
    if (diff.includes('싱글')) return 'bg-blue-400/50 dark:bg-blue-600/50 text-white';
    else if (diff.includes('노말') || diff.includes('1단계')) return 'bg-green-600/50 dark:bg-green-400/50 text-white';
    else if (diff.includes('하드') || diff.includes('2단계')) return 'bg-red-600/50 dark:bg-red-400/50 text-white';
    else if (diff.includes('더퍼스트') || diff.includes('나이트메어') || diff.includes('3단계')) return 'bg-purple-600/50 dark:bg-purple-400/50 text-white';
    return 'bg-gray-600/50 dark:bg-gray-400/50 text-white';
}

// 난이도 관련 색상 반환
export function getTextColorByDifficulty(diff: string): 'primary' | 'danger' | 'success' | 'secondary' | 'default' {
    if (diff.includes('싱글')) return 'primary';
    else if (diff.includes('노말') || diff.includes('1단계')) return 'success';
    else if (diff.includes('하드') || diff.includes('2단계')) return 'danger';
    else if (diff.includes('더퍼스트') || diff.includes('나이트메어') || diff.includes('3단계')) return 'secondary';
    return 'default';
}

// 난이도와 관문에 대한 내용 반환 함수
export type BossGold = {
    gold: number,
    boundGold: number,
    bonus: number
}
export function getBossGoldByContent(bosses: Boss[], name: string, stage: number, diff: string): BossGold {
    const boss = getBossByContent(bosses, name);
    const item = boss ? boss.difficulty.find(it => it.stage === stage && it.difficulty === diff) : null;
    const bossGold: BossGold = {
        gold: 0,
        boundGold: 0,
        bonus: 0
    }
    if (item) {
        bossGold.gold = item.gold;
        bossGold.boundGold = item.boundGold;
        bossGold.bonus = item.bonus;
    }
    return bossGold;
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

// 보스 난이도 리스트 출력
export function getDifficultyByBosses(boss: Boss): string[] {
    const results: string[] = [];
    for (const diff of boss.difficulty) {
        if (!results.includes(diff.difficulty)) {
            results.push(diff.difficulty);
        }
    }
    return results;
}

// 특정 난이도의 총 골드량 반환
export function getSumGoldByDifficulty(boss: Boss, difficulty: string): number {
    let sumGold = 0;
    for (const diff of boss.difficulty.filter(diff => diff.difficulty === difficulty)) {
        sumGold += diff.gold + diff.boundGold;
    }
    return sumGold;
}

// 특정 난이도의 골드량 반환
export function getGoldByDifficulty(boss: Boss, difficulty: string): number {
    let sumGold = 0;
    for (const diff of boss.difficulty.filter(diff => diff.difficulty === difficulty)) {
        sumGold += diff.gold;
    }
    return sumGold;
}

// 특정 난이도의 총 골드량 반환
export function getBoundGoldByDifficulty(boss: Boss, difficulty: string): number {
    let sumGold = 0;
    for (const diff of boss.difficulty.filter(diff => diff.difficulty === difficulty)) {
        sumGold += diff.boundGold;
    }
    return sumGold;
}

// 필터 설정값 가져오기
export function settingFilter(
    setRemainHomework: SetStateFn<boolean>,
    setShowGoldCharacter: SetStateFn<boolean>,
    setHideCompleteContent: SetStateFn<boolean>
) {
    const savedRemainHomework = localStorage.getItem('isRemainHomework');
    if (savedRemainHomework) {
        setRemainHomework(savedRemainHomework === 'true');
    }
    const savedShowGoldCharacter = localStorage.getItem('isShowGoldCharacter');
    if (savedShowGoldCharacter) {
        setShowGoldCharacter(savedShowGoldCharacter === 'true');
    }
    const savedHideCompleteContent = localStorage.getItem('isHideCompleteContent');
    if (savedHideCompleteContent) {
        setHideCompleteContent(savedHideCompleteContent === 'true');
    }
}

// 버스비 수정하기
export async function handleEditBusGold(
    checklist: CheckCharacter[],
    characterIndex: number,
    checklistIndex: number,
    dispatch: AppDispatch,
    value: number
) {
    const userStr = sessionStorage.getItem('user');
    const storedUser: LoginUser = userStr ? JSON.parse(userStr) : null;
    const id = storedUser ? storedUser.id : '';
    const updatedChecklist = structuredClone(checklist[characterIndex].checklist[checklistIndex]);
    const prevChecklist = structuredClone(updatedChecklist);
    updatedChecklist.busGold = value;
    dispatch(checkWeek({
        characterIndex: characterIndex,
        checklistIndex: checklistIndex,
        checklist: updatedChecklist
    }));
    const editRes = await fetch(`/api/checklist/list`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            id: id,
            checklist: checklist,
            type: 'check-week',
            characterIndex: characterIndex,
            checklistIndex: checklistIndex,
            checklistItem: updatedChecklist
        })
    });
    if (!editRes.ok) {
        addToast({
            title: "데이터 로드 오류 (콘텐츠)",
            description: `데이터를 가져오는데 문제가 발생하였습니다.`,
            color: "danger"
        });
        dispatch(checkWeek({
            characterIndex: characterIndex,
            checklistIndex: checklistIndex,
            checklist: prevChecklist
        }));
        return;
    }
}
