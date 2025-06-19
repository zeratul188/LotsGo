import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type Character = {
    nickname: string,
    level: number,
    server: string,
    job: string
}
export type LoginUser = {
    id: string,
    expedition: Array<Character>,
    character: string
}
type LoginState = {
    user: LoginUser,
    isAdministrator: boolean
}

const initialState: LoginState = {
    user: {
        id: '',
        expedition: [],
        character: ''
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
            state.user.character = action.payload.character
        },
        switchAdministrator(state, action: PayloadAction<boolean>) {
            state.isAdministrator = action.payload;
        },
        logout(state) {
            state.user.id = '';
            state.user.expedition = [];
            state.isAdministrator = false;
            state.user.character = '';
        },
        changeChracter(state, action: PayloadAction<string>) {
            state.user.character = action.payload;
        },
        saveExpedition(state, action: PayloadAction<Character[]>) {
            state.user.expedition = action.payload;
        }
    }
})

export const { logined, switchAdministrator, logout, changeChracter, saveExpedition } = loginSlice.actions
export default loginSlice.reducer