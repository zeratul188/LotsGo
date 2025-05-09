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
    user: LoginUser,
    isAdministrator: boolean
}

const initialState: LoginState = {
    user: {
        id: '',
        expedition: []
    },
    isAdministrator: false
}

const loginSlice = createSlice({
    name: 'login',
    initialState,
    reducers: {
        logined(state, action: PayloadAction<LoginUser>) {
            state.user.id = action.payload.id;
            state.user.expedition = action.payload.expedition
        },
        switchAdministrator(state, action: PayloadAction<boolean>) {
            state.isAdministrator = action.payload;
        },
        logout(state) {
            state.user.id = '';
            state.user.expedition = [];
            state.isAdministrator = false;
        }
    }
})

export const { logined, switchAdministrator, logout } = loginSlice.actions
export default loginSlice.reducer