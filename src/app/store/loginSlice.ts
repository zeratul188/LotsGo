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
    character: string,
    apiKey: string | null
}
type LoginState = {
    user: LoginUser,
    isCheckedToken: boolean
}

const initialState: LoginState = {
    user: {
        id: '',
        expedition: [],
        character: '',
        apiKey: null
    },
    isCheckedToken: false
}

const loginSlice = createSlice({
    name: 'login',
    initialState,
    reducers: {
        setCheckToken(state, action: PayloadAction<boolean>) {
            state.isCheckedToken = action.payload;
        },
        logined(state, action: PayloadAction<LoginUser>) {
            state.user.id = action.payload.id;
            state.user.expedition = action.payload.expedition
            state.user.character = action.payload.character
            state.user.apiKey = action.payload.apiKey ? action.payload.apiKey : null
        },
        logout(state) {
            state.user.id = '';
            state.user.expedition = [];
            state.user.character = '';
        },
        changeChracter(state, action: PayloadAction<string>) {
            state.user.character = action.payload;
        },
        saveExpedition(state, action: PayloadAction<Character[]>) {
            state.user.expedition = action.payload;
        },
        editApiKey(state, action: PayloadAction<string | null>) {
            state.user.apiKey = action.payload;
        }
    }
})

export const { setCheckToken, logined, logout, changeChracter, saveExpedition, editApiKey } = loginSlice.actions
export default loginSlice.reducer