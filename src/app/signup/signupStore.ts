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
    characters: Array<character>,
    isPrivacyPolicyAgreed: boolean
}

type AppAction<T extends string, P = undefined> = P extends undefined ? Action<T> : Action<T> & P;

export type stateActions = 
    | AppAction<"check-duplicate">
    | AppAction<"check-expedition">
    | AppAction<"input-member", { memberData: memberData }>
    | AppAction<"checked-duplicate", { isDuplicateChecked: boolean, isError: boolean }>
    | AppAction<"checked-expedition", { isExpeditionChecked: boolean, isError: boolean }>
    | AppAction<"save-expedition", { data: Array<any> }>
    | AppAction<"agreed-privacy", { isPrivacyPolicyAgreed: boolean }>


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
    characters: [],
    isPrivacyPolicyAgreed: false
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
        case 'agreed-privacy':
            //개인정보 수집 동의 여부 코드
            return {...state, isPrivacyPolicyAgreed: action.isPrivacyPolicyAgreed};
        default: 
            return state;
    }
}

export function getStore() {
    const store = useMemo(() => configureStore({ reducer: signupReducer }), []);
    return store;
}