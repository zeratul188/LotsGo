import { configureStore } from "@reduxjs/toolkit";
import { useMemo } from "react";
import { Action } from "redux";

export type duplicateChecked = {
    isDuplicateChecked: boolean, 
    isChecking: boolean, 
    isError: boolean
};
export type expeditionChecked = {
    isExpeditionChecked: boolean, 
    isChecking: boolean, 
    isError: boolean
};
export type memberData = {
    id: string,
    character: string,
    password: string,
    passwordCheck: string
}
export type character = {
    nickname: string,
    level: number,
    server: string,
    job: string
}

export type signupState = {
    duplicateChecked: duplicateChecked,
    expeditionChecked: expeditionChecked,
    memberData: memberData,
    characters: Array<character>
}

type nothingAction = Action<"check-duplicate"> | Action<"check-expedition">;
type memberDataInputAction = Action<"input-member"> & {
    memberData: memberData
}
type duplicateCheckAction = Action<"checked-duplicate"> & {
    isDuplicateChecked: boolean,
    isError: boolean
}
type expeditionCheckAction = Action<"checked-expedition"> & {
    isExpeditionChecked: boolean,
    isError: boolean
}
type expeditionSaveAction = Action<"save-expedition"> & {
    data: Array<any>
}

export type stateActions = expeditionSaveAction | nothingAction | duplicateCheckAction | expeditionCheckAction | memberDataInputAction;

const initialHeaderState = {
    duplicateChecked: {
        isDuplicateChecked: false, 
        isChecking: false,
        isError: false
    },
    expeditionChecked: {
        isExpeditionChecked: false, 
        isChecking: false,
        isError: false
    },
    memberData: {
        id: '',
        character: '',
        password: '',
        passwordCheck: ''
    },
    characters: []
}

function signupReducer(state: signupState = initialHeaderState, action: stateActions) {
    switch(action.type) {
        case 'check-duplicate':
            //체크 이벤트 시 코드
            return {
                ...state, 
                duplicateChecked: {
                    ...state.duplicateChecked,
                    isChecking: true,
                    isError: false
                }
            };
        case 'checked-duplicate':
            //버튼 이벤트 처리 후 코드
            return {
                ...state,
                duplicateChecked: {
                    isDuplicateChecked: action.isDuplicateChecked,
                    isChecking: false,
                    isError: action.isError
                }
            }
        case 'check-expedition':
            //체크 이벤트 시 코드
            return {
                ...state,
                expeditionChecked: {
                    ...state.expeditionChecked,
                    isChecking: true,
                    isError: false
                }
            }
        case 'checked-expedition':
            //버튼 이벤트 처리 후 코드
            return {
                ...state,
                expeditionChecked: {
                    isExpeditionChecked: action.isExpeditionChecked,
                    isChecking: false,
                    isError: action.isError
                }
            }
        case 'input-member':
            //회원 정보 입력 이벤트 코드
            return {...state, memberData: action.memberData};
        case 'save-expedition':
            //원정대 저장 코드
            const characters: Array<character> = [];
            action.data.forEach((character) => {
                characters.push({
                    nickname: character.CharacterName,
                    level: Number(character.ItemAvgLevel.replaceAll(',', '')),
                    server: character.ServerName,
                    job: character.CharacterClassName
                });
            });
            characters.sort((a, b) => b.level - a.level);
            return {
                ...state,
                characters: characters
            }
        default: 
            return state;
    }
}

export function getStore() {
    const store = useMemo(() => configureStore({ reducer: signupReducer }), []);
    return store;
}