import { AppDispatch } from "../store/store";
import type { CheckCharacter, Checklist, CubeList, Day, OtherList } from "../store/checklistSlice";
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
    saveData, 
    saveRest 
} from "../store/checklistSlice";
import { SetStateFn } from "@/utiils/utils";
import { addToast } from "@heroui/react";
import { Boss, Difficulty } from "../api/checklist/boss/route";
import { Character, LoginUser } from "../store/loginSlice";
import { Cube } from "../api/checklist/cube/route";
import { collection, getDocs } from "firebase/firestore";
import { firestore } from "@/utiils/firebase";

// 닉네임으로 index 찾기 함수
export function getIndexByNickname(checklist: CheckCharacter[], nickname: string): number {
    return checklist.findIndex(character => character.nickname === nickname);
}

// 로그인 여부 확인 함수
export function checkLogin(): boolean {
    const userStr = localStorage.getItem('user');
    const storedUser: LoginUser = userStr ? JSON.parse(userStr) : null;
    const isAdministrator = localStorage.getItem('isAdministrator');
    if (!storedUser) {
        addToast({
            title: isAdministrator ? "관리자 이용 불가" : "이용 불가",
            description: isAdministrator ? "관리자 계정은 해당 기능을 이용하실 수 없습니다." : `로그인을 해야만 이용 가능합니다.`,
            color: "danger"
        });
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
    setMax: SetStateFn<number>
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

    const lifeRes = await fetch(`/api/checklist/life?id=${id}`);
    const lifeObj = await lifeRes.json();

    // 생기 관련 데이터
    if (lifeRes.status === 200) {
        const today = new Date();
        const lifeDate = new Date(lifeObj.date.seconds * 1000 + lifeObj.date.nanoseconds / 1_000_000);
        const diffMs = today.getTime() - lifeDate.getTime();
        const diffMinutes = diffMs / (1000 * 60);
        const diffCount = Math.floor(diffMinutes / 10);
        const upValue = lifeObj.isBlessing ? 33 : 30;
        let life = lifeObj.life + diffCount * upValue;
        if (life > lifeObj.max) life = lifeObj.max;
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
            const aDifficulty = bosses.find(item => item.name === a.name)?.difficulty;
            const aObj = aDifficulty ? aDifficulty.find(item => item.difficulty === a.difficulty) : null;
            const aGold = aObj ? aObj.gold : 0;
            const bDifficulty = bosses.find(item => item.name === b.name)?.difficulty;
            const bObj = bDifficulty ? bDifficulty.find(item => item.difficulty === b.difficulty) : null;
            const bGold = bObj ? bObj.gold : 0;
            if (!a.isGold && b.isGold) {
                return 1;
            } else if (a.isGold && !b.isGold) {
                return -1;
            } else {
                return bGold - aGold;  
            }
        });
        character.checklist = sortedChecklist;
    }

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
                    dungeonUsing: 0,
                    boss: 0,
                    bossBonus: 0,
                    bossUsing: 0,
                    quest: 0,
                    questBonus: 0,
                    questUsing: 0
                },
                checklist: initialWeekContents(character.level, bosses),
                cubelist: [],
                daylist: [],
                weeklist: [],
                cube: 0,
                isGold: true,
                otherGold: 0,
                position: 9999
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
    const userStr = localStorage.getItem('user');
    const storedUser: LoginUser = userStr ? JSON.parse(userStr) : null;
    const id = storedUser.id;
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
        setNewLife(0);
        setMax(newMax);
        setNewMax(0);
    }
}

// 베아트리스의 축복 조정
export function useChangeBlessing(life: number, max: number, setBlessing: SetStateFn<boolean>) {
    const userStr = localStorage.getItem('user');
    const storedUser: LoginUser = userStr ? JSON.parse(userStr) : null;
    const id = storedUser.id;
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
            if (!difficulty.difficulty.includes('싱글')) {
                if (!isImport && level >= difficulty.level && !difficulty.isBiweekly) {
                    checklist.push({
                        name: boss.name,
                        difficulty: difficulty.difficulty,
                        isCheck: false,
                        isDisable: false,
                        isGold: true,
                        isBiweekly: difficulty.isBiweekly
                    });
                    isImport = true;
                    count++;
                }
                if (isImport && level >= difficulty.level && difficulty.isBiweekly) {
                    checklist.push({
                        name: boss.name,
                        difficulty: difficulty.difficulty,
                        isCheck: false,
                        isDisable: false,
                        isGold: true,
                        isBiweekly: difficulty.isBiweekly
                    });
                }
            }
        }
        if (count === 3) break;
    }
    return checklist;
}

// 콘텐츠 정보 가져오는 항수
export async function getBosses(): Promise<Boss[]> {
    const snapshot = await getDocs(collection(firestore, 'boss'));
    const bosses: Boss[] = snapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name,
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
        level: Number(doc.data().level)
    }));
    cubes.sort((a, b) => a.level - b.level);
    return cubes;
}

// 숙제 완료한 캐릭 수 반환 함수
export function getCompleteChecklist(checklist: CheckCharacter[]): number {
    return checklist.reduce((total, character) => {
        const countFromChecklist = character.checklist
            .filter(item => item.isCheck)
            .reduce((sum) => sum+1, 0);
        return total + countFromChecklist;
    }, 0);
}

// 숙제 총 개수 반환 함수
export function getAllCountChecklist(checklist: CheckCharacter[]): number {
    return checklist.reduce((total, character) => total + character.checklist.length, 0);
}

// 특정 캐릭터 골드 총 획득량 측정 함수
export function getAllGoldCharacter(
    bosses: Boss[],
    character: CheckCharacter
): number {
    const golds = character.checklist
        .filter(item => item.isGold)
        .reduce((total, item) => total + getBossGold(bosses, item.name, item.difficulty), 0);
    return character.isGold ? golds : 0;
}

// 특정 캐릭터 골드 획득량 측정 함수 (완료된 숙제만)
export function getCompleteGoldCharacter(
    bosses: Boss[],
    character: CheckCharacter
): number {
    const golds = character.checklist
        .filter(item => item.isGold && item.isCheck)
        .reduce((total, item) => total + getBossGold(bosses, item.name, item.difficulty), 0);
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
            .reduce((sum, item) => sum + getBossGold(bosses, item.name, item.difficulty), 0);
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
            .filter(item => item.isGold && item.isCheck)
            .reduce((sum, item) => sum + getBossGold(bosses, item.name, item.difficulty), 0);
        return total + goldFromChecklist;
    }, 0);
    for (const character of checklist) {
        sum += character.otherGold;
    }
    return sum;
}

// 특정 콘텐츠 골드 획득량 가져오는 함수
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

// 가지고 있는 서버 목록 반환 함수
export function getServerList(checklist: CheckCharacter[]): string[] {
    const list: string[] = Array.from(new Set(checklist.map((item) => item.server)));
    return list;
}

// 일일콘텐츠 타입별 문자열 반환 함수
export function getDayName(type: string): string {
    switch(type) {
        case '전선': return '쿠르잔 전선';
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
    const userStr = localStorage.getItem('user');
    const storedUser: LoginUser = userStr ? JSON.parse(userStr) : null;
    const id = storedUser.id;
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

// 주간 콘텐츠 체크 이벤트 함수
export async function useOnClickWeekCheck(
    checklist: CheckCharacter[],
    characterIndex: number,
    checklistIndex: number,
    dispatch: AppDispatch
) {
    const userStr = localStorage.getItem('user');
    const storedUser: LoginUser = userStr ? JSON.parse(userStr) : null;
    const id = storedUser.id;
    const updatedChecklist = {...checklist[characterIndex].checklist[checklistIndex]};
    const prevChecklist = {...updatedChecklist};
    updatedChecklist.isCheck = !updatedChecklist.isCheck;
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
    const userStr = localStorage.getItem('user');
    const storedUser: LoginUser = userStr ? JSON.parse(userStr) : null;
    const id = storedUser.id;
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
    const userStr = localStorage.getItem('user');
    const storedUser: LoginUser = userStr ? JSON.parse(userStr) : null;
    const id = storedUser.id;
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
    const userStr = localStorage.getItem('user');
    const storedUser: LoginUser = userStr ? JSON.parse(userStr) : null;
    const id = storedUser.id;
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
    const userStr = localStorage.getItem('user');
    const storedUser: LoginUser = userStr ? JSON.parse(userStr) : null;
    const id = storedUser.id;
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
    quest: number,
    onClose: () => void
) {
    const userStr = localStorage.getItem('user');
    const storedUser: LoginUser = userStr ? JSON.parse(userStr) : null;
    const id = storedUser.id;
    const prevDay = {...checklist[characterIndex].day};
    const newDay: Day = {
        ...checklist[characterIndex].day,
        dungeonBouus: dungeon,
        dungeonUsing: 0,
        bossBonus: boss,
        bossUsing: 0,
        questBonus: quest,
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
    const userStr = localStorage.getItem('user');
    const storedUser: LoginUser = userStr ? JSON.parse(userStr) : null;
    const id = storedUser.id;
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
    const userStr = localStorage.getItem('user');
    const storedUser: LoginUser = userStr ? JSON.parse(userStr) : null;
    const id = storedUser.id;
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
    const userStr = localStorage.getItem('user');
    const storedUser: LoginUser = userStr ? JSON.parse(userStr) : null;
    const id = storedUser.id;
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
        const aDifficulty = bosses.find(item => item.name === a.name)?.difficulty;
        const aObj = aDifficulty ? aDifficulty.find(item => item.difficulty === a.difficulty) : null;
        const aGold = aObj ? aObj.gold : 0;
        const bDifficulty = bosses.find(item => item.name === b.name)?.difficulty;
        const bObj = bDifficulty ? bDifficulty.find(item => item.difficulty === b.difficulty) : null;
        const bGold = bObj ? bObj.gold : 0;
        if (!a.isGold && b.isGold) {
            return 1;
        } else if (a.isGold && !b.isGold) {
            return -1;
        } else {
            return bGold - aGold;  
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
    const userStr = localStorage.getItem('user');
    const storedUser: LoginUser = userStr ? JSON.parse(userStr) : null;
    const id = storedUser.id;
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
    onClose: () => void,
    bosses: Boss[]
) {
    const userStr = localStorage.getItem('user');
    const storedUser: LoginUser = userStr ? JSON.parse(userStr) : null;
    const id = storedUser.id;
    const prevChecklist = checklist[characterIndex].checklist;
    let newChecklist = [...checklist[characterIndex].checklist];
    newChecklist.push(addChecklist);
    const copyChecklist = structuredClone(newChecklist);
    newChecklist = newChecklist.sort((a, b) => {
        const aDifficulty = bosses.find(item => item.name === a.name)?.difficulty;
        const aObj = aDifficulty ? aDifficulty.find(item => item.difficulty === a.difficulty) : null;
        const aGold = aObj ? aObj.gold : 0;
        const bDifficulty = bosses.find(item => item.name === b.name)?.difficulty;
        const bObj = bDifficulty ? bDifficulty.find(item => item.difficulty === b.difficulty) : null;
        const bGold = bObj ? bObj.gold : 0;
        if (!a.isGold && b.isGold) {
            return 1;
        } else if (a.isGold && !b.isGold) {
            return -1;
        } else {
            return bGold - aGold;  
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
    onClose();
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
export function getWeekContents(bosses: Boss[]): WeekContent[] {
    const contents: WeekContent[] = [];
    for (const boss of bosses) {
        contents.push({
            key: boss.id,
            name: boss.name
        });
    }
    contents.sort((a, b) => a.name.localeCompare(b.name, 'ko'));
    return contents;
}

// 콘텐츠의 난이도 목록을 가져오는 함수
export function getWeekDifficultys(bosses: Boss[], key: string): WeekContent[] {
    const boss = getBossesById(bosses, key);
    const difficultys: WeekContent[] = [];
    let taskKey = 0;
    if (boss) {
        for (const difficulty of boss.difficulty) {
            difficultys.push({
                key: taskKey.toString(),
                name: difficulty.difficulty
            });
            taskKey++;
        }
        return difficultys;
    }
    return [];
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
    isAdd: boolean
) {
    const userStr = localStorage.getItem('user');
    const storedUser: LoginUser = userStr ? JSON.parse(userStr) : null;
    const id = storedUser.id;
    const cubelist = checklist[characterIndex].cubelist.map(item => ({ ...item }));
    const prevCubelist = checklist[characterIndex].cubelist.map(item => ({ ...item }));
    const findIndex = cubelist.findIndex(item => item.id === cubeID);
    if (findIndex !== -1) {
        cubelist[findIndex].count += isAdd ? 1 : cubelist[findIndex].count <= 0 ? 0 : -1;
    } else {
        cubelist.push({
            id: cubeID,
            count: isAdd ? 1 : 0
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
    const userStr = localStorage.getItem('user');
    const storedUser: LoginUser = userStr ? JSON.parse(userStr) : null;
    const id = storedUser.id;
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
    const userStr = localStorage.getItem('user');
    const storedUser: LoginUser = userStr ? JSON.parse(userStr) : null;
    const id = storedUser.id;
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
    setLoading: SetStateFn<boolean>
) {
    const userStr = localStorage.getItem('user');
    const storedUser: LoginUser = userStr ? JSON.parse(userStr) : null;
    const id = storedUser.id;
    const newChecklist = checklist.map(item => ({ ...item }));
    const prevChecklist = checklist.map(item => ({ ...item }));
    return async () => {
        setLoading(true);
        for (const character of newChecklist) {
            const lostarkRes = await fetch(`/api/lostark?value=${character.nickname}&code=1`);
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
    const userStr = localStorage.getItem('user');
    const storedUser: LoginUser = userStr ? JSON.parse(userStr) : null;
    const id = storedUser.id;
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
        const lostarkRes = await fetch(`/api/lostark?value=${value}&code=0`);
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
    bosses: Boss[]
) {
    const userStr = localStorage.getItem('user');
    const storedUser: LoginUser = userStr ? JSON.parse(userStr) : null;
    const id = storedUser.id;
    const newChecklist = checklist.map(item => ({ ...item }));
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
                checklist: initialWeekContents(item.level, bosses),
                cubelist: [],
                daylist: [],
                weeklist: [],
                cube: 0,
                isGold: isGold,
                otherGold: 0,
                position: 9999
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
    const userStr = localStorage.getItem('user');
    const storedUser: LoginUser = userStr ? JSON.parse(userStr) : null;
    const id = storedUser.id;
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
    const userStr = localStorage.getItem('user');
    const storedUser: LoginUser = userStr ? JSON.parse(userStr) : null;
    const id = storedUser.id;
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
    console.log(nickname);
    return checklist.findIndex(item => item.nickname === nickname) !== -1;
}