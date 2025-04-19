import { useDispatch, useSelector } from "react-redux";
import { signupState } from "./signupStore";
import type { memberData } from "./signupStore";
import { useCallback } from "react";
import { ref, onValue } from "firebase/database";
import type { DataSnapshot } from "firebase/database";
import { database } from "@/utiils/firebase";
import { addToast } from "@heroui/react";

//중복 확인 버튼 이벤트
export function useOnClickDuplicateCheck() {
    const dispatch = useDispatch();
    const mData = useSelector<signupState, memberData>((state) => state.memberData);
    const membersRef = ref(database, '/members');
    const memberIDs: Array<string> = [];
    return () => {
        dispatch({ type: 'check-duplicate' });
        onValue(membersRef, (snapshot: DataSnapshot) => {
            snapshot.forEach((childSnapshot: DataSnapshot) => {
                memberIDs.push(childSnapshot.child('id').val());
            });
            if (mData.id.length < 4) {
                dispatch({
                    type: 'checked-duplicate',
                    isDuplicateChecked: false,
                    isError: false
                });
                addToast({
                    title: "아이디 입력 문제",
                    description: '아이디 글자 수가 최소 4글자 이상이여야 합니다.',
                    color: "danger"
                });
            } else if (memberIDs.includes(mData.id)) {
                dispatch({
                    type: 'checked-duplicate',
                    isDuplicateChecked: false,
                    isError: true
                });
            } else {
                dispatch({
                    type: 'checked-duplicate',
                    isDuplicateChecked: true,
                    isError: false
                });
                addToast({
                    title: "아이디 사용 가능",
                    description: `해당 아이디는 사용이 가능합니다.`,
                    color: "success"
                });
            }
        }, {
            onlyOnce: true
        });
    }
}

//원정대 확인 버튼 이벤트
export function useOnClickExpeditionCheck() {
    const mData = useSelector<signupState, memberData>((state) => state.memberData);
    const dispatch = useDispatch();
    return async () => {
        dispatch({ type: 'check-expedition' });
        const lostarkRes = await fetch(`/api/lostark?value=${mData.character}&code=0`);
        if (!lostarkRes.ok) {
            const text = await lostarkRes.text(); // ← JSON이 아닐 수도 있으니까
            dispatch({
                type: "checked-expedition",
                isExpeditionChecked: false,
                isError: true
            });
            throw new Error('API 실패');
        }
        const data = await lostarkRes.json();
        if (data.length === 0) {
            dispatch({
                type: "checked-expedition",
                isExpeditionChecked: false,
                isError: false
            });
            addToast({
                title: "캐릭터 이름 입력 문제",
                description: '캐릭터 이름과 일치하는 캐릭터를 찾을 수 없습니다.',
                color: "danger"
            });
        } else {
            dispatch({
                type: "checked-expedition",
                isExpeditionChecked: true,
                isError: false
            });
            dispatch({
                type: "save-expedition",
                data: data
            });
            addToast({
                title: "원정대 저장 완료",
                description: `\"${mData.character}\"의 원정대 정보를 불러오는데 성공했습니다.`,
                color: "success"
            });
        }
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

//최종 회원가입 버튼 이벤트
export function useOnClickSignup() {
    return () => {
        
    }
}