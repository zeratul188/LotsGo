import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type Character = {
    nickname: string,
    level: number,
    server: string,
    job: string
}
export type LoginUser = {
    id: string,
    expedition: Array<Character>
}
type LoginState = {
    user: LoginUser
}

const initialState: LoginState = {
    user: {
        id: '',
        expedition: []
    }
}

const loginSlice = createSlice({
    name: 'login',
    initialState,
    reducers: {
        logined(state, action: PayloadAction<LoginUser>) {
            state.user.id = action.payload.id;
            state.user.expedition = action.payload.expedition
        }
    }
})

export const { logined } = loginSlice.actions
export default loginSlice.reducer