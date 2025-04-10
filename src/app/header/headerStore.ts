import { configureStore } from "@reduxjs/toolkit";
import { useMemo } from "react";
import { Action } from "redux";

export type headerState = {
    isMenuOpen: boolean
}

type toggleAction = Action<"toggle-menu"> & {
    isMenuOpen: boolean
}

export type stateActions = toggleAction;

const initialHeaderState = {
    isMenuOpen: false
}

function headerReducer(state: headerState = initialHeaderState, action: stateActions) {
    switch(action.type) {
        case "toggle-menu":
            return {...state, isMenuOpen: action.isMenuOpen};
        default: 
            return state;
    }
}

export function getStore() {
    const store = useMemo(() => configureStore({ reducer: headerReducer }), []);
    return store;
}