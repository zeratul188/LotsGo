import { useDispatch, useSelector } from "react-redux";
import { signupState } from "./signupStore";
import type { memberData } from "./signupStore";
import { useCallback } from "react";
import { ref, onValue, set } from "firebase/database";
import type { DataSnapshot } from "firebase/database";
import { database } from "@/utiils/firebase";

//중복 확인 버튼 이벤트
export function useOnClickDuplicateCheck() {
    const mData = useSelector<signupState, memberData>((state) => state.memberData);
    const membersRef = ref(database, '/members');
    const memberIDs: Array<string> = [];
    return () => {
        onValue(membersRef, (snapshot: DataSnapshot) => {
            snapshot.forEach((childSnapshot: DataSnapshot) => {
                memberIDs.push(childSnapshot.child('id').val());
            });
            if (memberIDs.includes(mData.id)) alert('중복된 아이디가 존재합니다.');
            else alert('중복된 아이디가 없습니다. 사용 가능합니다.');
        }, {
            onlyOnce: true
        });
    }
}

//원정대 확인 버튼 이벤트
export function useOnClickExpeditionCheck() {
    return () => {

    }
}

//최종 회원가입 버튼 이벤트
export function useOnClickSignup() {
    return () => {
        
    }
}

//값 수정 이벤트 핸들링 (회원 정보 수정)
export function useSignupHandlers() {
    const dispatch = useDispatch();
    const mData = useSelector<signupState, memberData>((state) => state.memberData);

    const updateMemberData = useCallback((updated: Partial<memberData>) => {
        dispatch({
            type: "input-member",
            memberData: {
                ...mData,
                ...updated
            }
        });
    }, [dispatch, mData]);

    return {
        mData,
        onValueChangeID: (value: string) => updateMemberData({ id: value }),
        onValueChangeCharacter: (value: string) => updateMemberData({ character: value }),
        onValueChangePassword: (value: string) => updateMemberData({ password: value }),
        onValueChangePasswordCheck: (value: string) => updateMemberData({ passwordCheck: value })
    }
}