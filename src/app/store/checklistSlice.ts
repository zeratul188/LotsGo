import { createSlice, PayloadAction } from "@reduxjs/toolkit"

export type Day = {
    dungeon: number,
    dungeonBouus: number,
    boss: number,
    bossBonus: number,
    quest: number,
    questBonus: number
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
    weeklist: OtherList[]
}
type ChecklistState = {
    checklist: CheckCharacter[]
}

const initialState: ChecklistState = {
    checklist: []
}

const checklistSlice = createSlice({
    name: 'checklist',
    initialState,
    reducers: {
        saveData(state, action: PayloadAction<CheckCharacter[]>) {
            state.checklist = action.payload;
        }
    }
})

export const { saveData } = checklistSlice.actions;
export default checklistSlice.reducer;