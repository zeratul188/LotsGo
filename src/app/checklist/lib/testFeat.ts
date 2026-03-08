import { SetStateFn } from "@/utiils/utils";
import { CheckCharacter, Day } from "../../store/checklistSlice";
import { getMaxRestValue } from "./checklistFeat";

// 캐릭터 골드 지정 이벤트
export function useOnClickCheckGold(
    index: number, 
    checklist:CheckCharacter[], 
    setChecklist: SetStateFn<CheckCharacter[]>
) {
    return () => {
        const updatedChecklist = structuredClone(checklist);
        updatedChecklist[index].isGold = !updatedChecklist[index].isGold;
        setChecklist(updatedChecklist);
    }
}

// 일일 콘텐츠 체크 이벤트
export function useOnClickDayCheck(
    checklist: CheckCharacter[],
    setChecklist: SetStateFn<CheckCharacter[]>,
    index: number,
    type: string,
    day: Day
) {
    const max = type === '에포나' ? 3 : 1;
    const onceRest = getMaxRestValue(type)/5;
    return () => {
        const updatedDay = structuredClone(day);
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
        const updatedChecklist = structuredClone(checklist);
        updatedChecklist[index].day = updatedDay;
        setChecklist(updatedChecklist);
    }
}

// 주간 콘텐츠 체크 이벤트
export function handleWeekContent(
    checklist: CheckCharacter[],
    setChecklist: SetStateFn<CheckCharacter[]>,
    characterIndex: number,
    contentIndex: number
) {
    const updatedChecklist = structuredClone(checklist);
    const isNothingChecked = updatedChecklist[characterIndex].checklist[contentIndex].items.some(item => !item.isCheck);
    for (const item of updatedChecklist[characterIndex].checklist[contentIndex].items) {
        if (isNothingChecked) item.isCheck = true;
        else item.isCheck = false;
    }
    setChecklist(updatedChecklist);
}

// 주간 콘텐츠 관문 체크 이벤트
export function handleWeekStage(
    checklist: CheckCharacter[],
    setChecklist: SetStateFn<CheckCharacter[]>,
    characterIndex: number,
    contentIndex: number,
    stage: number
) {
    const updatedChecklist = structuredClone(checklist);
    for (const item of updatedChecklist[characterIndex].checklist[contentIndex].items) {
        if (item.stage < stage) {
            item.isCheck = true;
        } else if (item.stage === stage) {
            item.isCheck = !item.isCheck;
        } else {
            item.isCheck = false;
        }
    }
    setChecklist(updatedChecklist);
}

// 부수입 계산
export function handleSetOtherGold(
    checklist: CheckCharacter[],
    setChecklist: SetStateFn<CheckCharacter[]>,
    index: number,
    gold: number,
    type: string
) {
    const updatedChecklist = structuredClone(checklist);
    switch(type) {
        case 'set':
            updatedChecklist[index].otherGold = gold;
            break;
        case 'minus':
            updatedChecklist[index].otherGold -= gold;
            break;
        case 'add':
            updatedChecklist[index].otherGold += gold;
            break;
    }
    setChecklist(updatedChecklist);
}

// 큐브 개수 조절
export function handleControlCube(
    checklist: CheckCharacter[],
    setChecklist: SetStateFn<CheckCharacter[]>,
    index: number,
    cubeID: string,
    isAdd: boolean
) {
    const updatedChecklist = structuredClone(checklist);
    const findIndex = updatedChecklist[index].cubelist.findIndex(item => item.id === cubeID);
    if (findIndex !== -1) {
        updatedChecklist[index].cubelist[findIndex].count += isAdd ? 1 : updatedChecklist[index].cubelist[findIndex].count <= 0 ? 0 : -1;
    } else {
        updatedChecklist[index].cubelist.push({
            id: cubeID,
            count: isAdd ? 1 : 0
        });
    }
    setChecklist(updatedChecklist);
}
