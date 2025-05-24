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
    isGold: boolean
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

const checklistSlice = createSlice({
    name: 'checklist',
    initialState,
    reducers: {
        // 데이터 저장
        saveData(state, action: PayloadAction<CheckCharacter[]>) {
            state.checklist = action.payload;
        },
        // 일일 콘텐츠 수정
        editDay(state, action: PayloadAction<EditDay>) {
            state.checklist[findIndexByNickname(state.checklist, action.payload.nickname)].day = action.payload.day;
        },
        // 주간 콘텐츠 체크
        checkWeek(state, action: PayloadAction<CheckWeek>) {
            state.checklist[action.payload.characterIndex].checklist[action.payload.checklistIndex] = action.payload.checklist;
        }
    }
})

export const { saveData, editDay, checkWeek } = checklistSlice.actions;
export default checklistSlice.reducer;