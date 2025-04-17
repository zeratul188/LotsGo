import { useDispatch, useSelector } from "react-redux";
import { signupState } from "./signupStore";
import type { memberData } from "./signupStore";
import { useCallback } from "react";

//중복 확인 버튼 이벤트
export function onClickDuplicateCheck() {
    alert('clicked dup.');
}

//원정대 확인 버튼 이벤트
export function onClickExpeditionCheck() {
    alert('clicked expedition.');
}

//최종 회원가입 버튼 이벤트
export function onClickSignup() {

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