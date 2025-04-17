import { configureStore } from "@reduxjs/toolkit";
import { useMemo } from "react";
import { Action } from "redux";

export type duplicateChecked = {isDuplicateChecked: boolean, isChecking: boolean};
export type expeditionChecked = {isExpeditionChecked: boolean, isChecking: boolean};
export type memberData = {
    id: string,
    character: string,
    password: string,
    passwordCheck: string
}

export type signupState = {
    duplicateChecked: duplicateChecked,
    expeditionChecked: expeditionChecked,
    memberData: memberData
}

type memberDataInputAction = Action<"input-member"> & {
    memberData: memberData
}

type duplicateCheckAction = (Action<"check-duplicate"> | Action<"checked-duplicate">) & {
    duplicateChecked: duplicateChecked
}

type expeditionCheckAction = (Action<"check-expedition"> | Action<"checked-expedition">) & {
    expeditionChecked: expeditionChecked
}

export type stateActions = duplicateCheckAction | expeditionCheckAction | memberDataInputAction;

const initialHeaderState = {
    duplicateChecked: {isDuplicateChecked: false, isChecking: false},
    expeditionChecked: {isExpeditionChecked: false, isChecking: false},
    memberData: {
        id: '',
        character: '',
        password: '',
        passwordCheck: ''
    }
}

function signupReducer(state: signupState = initialHeaderState, action: stateActions) {
    switch(action.type) {
        case 'check-duplicate':
            //체크 이벤트 시 코드
            break;
        case 'checked-duplicate':
            //버튼 이벤트 처리 후 코드
            break;
        case 'check-expedition':
            //체크 이벤트 시 코드
            break;
        case 'checked-expedition':
            //버튼 이벤트 처리 후 코드
            break;
        case 'input-member':
            return {...state, memberData: action.memberData};
        default: 
            return state;
    }
}

export function getStore() {
    const store = useMemo(() => configureStore({ reducer: signupReducer }), []);
    return store;
}