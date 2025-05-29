import { createSlice, PayloadAction } from "@reduxjs/toolkit"

export type Day = {
    dungeon: number,
    dungeonBouus: number,
    dungeonUsing: number,
    boss: number,
    bossBonus: number,
    bossUsing: number,
    quest: number,
    questBonus: number,
    questUsing: number
}
export type OtherList = {
    name: string,
    isCheck: boolean
}
export type Checklist = {
    name: string,
    difficulty: string,
    isCheck: boolean,
    isDisable: boolean,
    isGold: boolean,
    isBiweekly: boolean
}
export type CubeList = {
    id: string,
    count: number
}
export type CheckCharacter = {
    nickname: string,
    level: number,
    job: string,
    server: string,
    day: Day
    daylist: OtherList[],
    checklist: Checklist[],
    weeklist: OtherList[],
    cube: number,
    cubelist: CubeList[],
    isGold: boolean,
    otherGold: number
}
type ChecklistState = {
    checklist: CheckCharacter[]
}

const initialState: ChecklistState = {
    checklist: []
}

function findIndexByNickname(
    characters: CheckCharacter[], 
    nickname: string
): number {
    return characters.findIndex((item) => item.nickname === nickname);
}

export type EditDay = {
    nickname: string,
    day: Day
}
export type CheckWeek = {
    characterIndex: number,
    checklistIndex: number,
    checklist: Checklist
}
export type RemoveWeek = {
    characterIndex: number,
    checklist: Checklist[]
}
export type EditWeekList = {
    characterIndex: number,
    weeklist: OtherList[]
}
export type CheckWeekList = {
    characterIndex: number,
    listIndex: number,
    weeklist: OtherList
}
export type CheckDayList = {
    characterIndex: number,
    listIndex: number,
    daylist: OtherList
}
export type RestStatue = {
    characterIndex: number,
    day: Day
}
export type EditDayList = {
    characterIndex: number,
    daylist: OtherList[]
}
export type EditCube = {
    characterIndex: number,
    cublist: CubeList[]
}
export type CheckGold = {
    characterIndex: number,
    isGold: boolean
}

const checklistSlice = createSlice({
    name: 'checklist',
    initialState,
    reducers: {
        // 데이터 저장
        saveData(state, action: PayloadAction<CheckCharacter[]>) {
            const newChecklist = (action.payload ?? []).map((charaacter: any) => ({
                ...charaacter,
                cubelist: charaacter.cubelist ?? []
            }));
            state.checklist = newChecklist;
        },
        // 일일 콘텐츠 수정
        editDay(state, action: PayloadAction<EditDay>) {
            state.checklist[findIndexByNickname(state.checklist, action.payload.nickname)].day = action.payload.day;
        },
        // 주간 콘텐츠 체크
        checkWeek(state, action: PayloadAction<CheckWeek>) {
            const characterIndex = action.payload.characterIndex;
            const checklistIndex = action.payload.checklistIndex;
            state.checklist[characterIndex].checklist[checklistIndex] = action.payload.checklist;
        },
        // 주간 콘텐츠 삭제 (+추가)
        removeWeek(state, action: PayloadAction<RemoveWeek>) {
            const characterIndex = action.payload.characterIndex;
            state.checklist[characterIndex].checklist = action.payload.checklist;
        },
        // 주간 목록 추가 및 삭제
        editWeekList(state, action:PayloadAction<EditWeekList>) {
            const characterIndex = action.payload.characterIndex;
            state.checklist[characterIndex].weeklist = action.payload.weeklist;
        },
        // 주간 목록 체크
        checkWeekList(state, action:PayloadAction<CheckWeekList>) {
            const characterIndex = action.payload.characterIndex;
            const listIndex = action.payload.listIndex;
            state.checklist[characterIndex].weeklist[listIndex] = action.payload.weeklist;
        },
        // 휴식 게이지 저장
        saveRest(state, action:PayloadAction<RestStatue>) {
            const characterIndex = action.payload.characterIndex;
            state.checklist[characterIndex].day = action.payload.day;
        },
        // 일일 목록 추가 및 삭제
        editDayList(state, action: PayloadAction<EditDayList>) {
            const characterIndex = action.payload.characterIndex;
            state.checklist[characterIndex].daylist = action.payload.daylist;
        },
        // 일일 목록 체크
        checkDayList(state, action: PayloadAction<CheckDayList>) {
            const characterIndex = action.payload.characterIndex;
            const listIndex = action.payload.listIndex;
            state.checklist[characterIndex].daylist[listIndex] = action.payload.daylist;
        },
        // 큐브 항목 수정
        editCube(state, action: PayloadAction<EditCube>) {
            const characterIndex = action.payload.characterIndex;
            state.checklist[characterIndex].cubelist = action.payload.cublist;
        },
        // 골드 지정
        checkGold(state, action: PayloadAction<CheckGold>) {
            const characterIndex = action.payload.characterIndex;
            state.checklist[characterIndex].isGold = action.payload.isGold;
        },
        // 캐릭터 삭제
        removeCharacter(state, action: PayloadAction<CheckCharacter[]>) {
            const removedChecklist = action.payload;
            state.checklist = removedChecklist;
        }
    }
})

export const { 
    saveData, 
    editDay, 
    checkWeek, 
    removeWeek,
    editWeekList,
    checkWeekList,
    saveRest,
    editDayList,
    checkDayList,
    editCube,
    checkGold,
    removeCharacter
} = checklistSlice.actions;
export default checklistSlice.reducer;