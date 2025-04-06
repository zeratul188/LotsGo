import { configureStore } from "@reduxjs/toolkit";

type headerState = {

}

const initialHeaderState = {

}

function headerReducer(state: headerState = initialHeaderState, action: {type: string}) {
    switch(action.type) {
        //Actions
    }
    return state;
}

let store = configureStore({ reducer: headerReducer });

export function getStore() { return store; }