import { createSlice } from "@reduxjs/toolkit"

export type DayList = {
    dungeon: number,
    dungeonBouus: number,
    boss: number,
    bossBonus: number,
    quest: number,
    questBonus: number
}
export type Checklist = {
    name: string,
    difficulty: string,
    isCheck: boolean,
    isDisable: boolean
}
export type CheckCharacter = {
    nickname: string,
    level: number,
    job: string,
    server: string,
    checklist: Checklist[]
}
type ChecklistState = {
    checklist: Checklist[]
}

const initialState: ChecklistState = {
    checklist: []
}

const checklistSlice = createSlice({
    name: 'checklist',
    initialState,
    reducers: {

    }
})

export const {  } = checklistSlice.actions;
export default checklistSlice.reducer;