import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type Character = {
    nickname: string,
    level: number,
    server: string,
    job: string
}
type LoginState = {
    id: string,
    expedition: Array<Character>
}

const initialState: LoginState = {
    id: '',
    expedition: []
}

const loginSlice = createSlice({
    name: 'login',
    initialState,
    reducers: {
        logined(state, action: PayloadAction<{ id: string, expedition: Array<Character> }>) {
            state.id = action.payload.id;
            state.expedition = action.payload.expedition
        }
    }
})

export const { logined } = loginSlice.actions
export default loginSlice.reducer