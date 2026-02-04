import { configureStore } from "@reduxjs/toolkit";
import loginReducer from './loginSlice';
import checklistReducer from './checklistSlice';
import partyReducer from './partySlice';

export const store = configureStore({
    reducer: {
        login: loginReducer,
        checklist: checklistReducer,
        party: partyReducer
    }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch