import { AppDispatch } from "../store/store";
import type { CheckCharacter, Checklist, Day, OtherList } from "../store/checklistSlice";
import { checkDayList, checkWeek, checkWeekList, editDay, editDayList, editWeekList, removeWeek, saveData, saveRest } from "../store/checklistSlice";
import { SetStateFn } from "@/utiils/utils";
import { addToast } from "@heroui/react";
import { Boss, Difficulty } from "../api/checklist/boss/route";
import { Character, LoginUser } from "../store/loginSlice";

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
                    dungeonUsing: 0,
                    boss: 0,
                    bossBonus: 0,
                    bossUsing: 0,
                    quest: 0,
                    questBonus: 0,
                    questUsing: 0
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
            if (!isImport && level >= difficulty.level && !difficulty.isBiweekly) {
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
            if (isImport && level >= difficulty.level && difficulty.isBiweekly) {
                checklist.push({
                    name: boss.name,
                    difficulty: difficulty.difficulty,
                    isCheck: false,
                    isDisable: false,
                    isGold: true
                });
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
    return checklist.reduce((total, character) => {
        const goldFromChecklist = character.checklist
            .filter(item => item.isGold)
            .reduce((sum, item) => sum + getBossGold(bosses, item.name, item.difficulty), 0);
        return total + character.otherGold + goldFromChecklist;
    }, 0);
}

// 주간 완료된 수익 골드량 측정 함수
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
    onClose: () => void
) {
    const userStr = localStorage.getItem('user');
    const storedUser: LoginUser = userStr ? JSON.parse(userStr) : null;
    const id = storedUser.id;
    const prevChecklist = checklist[characterIndex].checklist;
    const newChecklist = [...checklist[characterIndex].checklist];
    newChecklist.push(addChecklist);
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
            weekChecklist: newChecklist
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