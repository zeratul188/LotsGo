import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { Party, Raid } from "../api/raids/route"

export type ChangePartys = {
    id: string,
    partys: Party[]
}

type PartyState = {
    raids: Raid[],
    selectedRaid: Raid | null,
    userId: string | null
}

const initialState: PartyState = {
    raids: [],
    selectedRaid: null,
    userId: null
}

const partySlice = createSlice({
    name: 'party',
    initialState,
    reducers: {
        initialRaids(state, action: PayloadAction<Raid[]>) {
            state.raids = action.payload;
        },
        addRaid(state, action: PayloadAction<Raid>) {
            state.raids.push(action.payload);
        },
        updateRaid(state, action: PayloadAction<Raid>) {
            const findIndex = state.raids.findIndex(r => r.id === action.payload.id);
            if (findIndex > -1) {
                state.raids[findIndex] = action.payload;
            }
        },
        // 레이드 삭제 (id로 검색)
        removeRaid(state, action: PayloadAction<string>) {
            state.raids = state.raids.filter(r => r.id !== action.payload);
        },
        changeSelectedRaid(state, action: PayloadAction<Raid | null>) {
            state.selectedRaid = action.payload;
        },
        changeUserId(state, action: PayloadAction<string | null>) {
            state.userId = action.payload;
        },
        updatePartys(state, action: PayloadAction<ChangePartys>) {
            const findIndex = state.raids.findIndex(r => r.id === action.payload.id);
            if (findIndex > -1) {
                state.raids[findIndex].party = action.payload.partys;
            }
        }
    }
})

export const { 
    initialRaids, 
    addRaid, 
    updateRaid, 
    removeRaid, 
    changeSelectedRaid,
    changeUserId,
    updatePartys
} = partySlice.actions;
export default partySlice.reducer;