import { configureStore } from "@reduxjs/toolkit";
import { useMemo } from "react";
import { Action } from "redux";

export type User = {
    id: string,
    password: string
}
export type loginState = {
    user: User,
    isLoading: boolean,
    isIdDuplicated: boolean,
    isPasswordNotMatch: boolean
}

type AppAction<T extends string, P = undefined> = P extends undefined ? Action<T> : Action<T> & P;

export type stateActions = 
    | AppAction<"input-data", { user: User }>
    | AppAction<"loading", { isLoading: boolean }>
    | AppAction<"id-duplicate"> | AppAction<"password-match"> | AppAction<"no-problem">

const initialLoginState: loginState = {
    user: {
        id: '',
        password: ''
    },
    isLoading: false,
    isIdDuplicated: false,
    isPasswordNotMatch: false
}

function reducer(state: loginState = initialLoginState, action: stateActions) {
    switch(action.type) {
        case "input-data":
            // 아이디 혹은 비밀번호 입력
            return { ...state, user: action.user };
        case "loading":
            // 로그인 버튼의 로딩 상태 관리
            return { ...state, isLoading: action.isLoading };
        case "id-duplicate":
            // 아이디 중복 체크 여부
            return { ...state, isIdDuplicated: true, isPasswordNotMatch: false };
        case "password-match":
            // 비밀번호 미일치 여부
            return { ...state, isIdDuplicated: false, isPasswordNotMatch: true };
        case "no-problem":
            // 아이디, 비밀번호 모두 이상없을 경우
            return { ...state, isIdDuplicated: false, isPasswordNotMatch: false };
        default:
            return state;
    }
}

export function getStore() {
    const store = useMemo(() => configureStore({ reducer: reducer }), []);
    return store;
}