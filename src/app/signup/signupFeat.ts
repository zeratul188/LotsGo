import { useDispatch, useSelector } from "react-redux";
import { signupState } from "./signupStore";
import type { memberData } from "./signupStore";
import { useCallback } from "react";
import { ref, onValue, set } from "firebase/database";
import type { DataSnapshot } from "firebase/database";
import { database } from "@/utiils/firebase";
import { addToast } from "@heroui/react";

// 중복 확인 버튼 이벤트
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
            if (mData.id.includes(' ')) {
                dispatch({
                    type: 'checked-duplicate',
                    isDuplicateChecked: false,
                    isError: false
                });
                addToast({
                    title: "아이디 입력 문제",
                    description: '입력값에 공백이 있으면 안됩니다. 공백을 제거하고 다시 시도해주세요.',
                    color: "danger"
                });
            } else if (mData.id.length < 4) {
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

// 원정대 확인 버튼 이벤트
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

// 개인정보 수집 동의 여부 체크 이벤트
export function useOnValueChangePrivacy() {
    const dispatch = useDispatch();
    const isPrivacyPolicyAgreed = useSelector<signupState, boolean>((state) => state.isPrivacyPolicyAgreed);

    return () => {
        dispatch({
            type: "agreed-privacy",
            isPrivacyPolicyAgreed: !isPrivacyPolicyAgreed
        });
    }
}

// 값 수정 이벤트 핸들링 (회원 정보 수정)
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
        onValueChangePasswordCheck: (value: string) => updateMemberData({ passwordCheck : value })
    }
}

// 최종 회원가입 버튼 이벤트
export function useOnClickSignup() {
    const mData = useSelector<signupState, memberData>((state) => state.memberData);
    const isDuplicateChecked = useSelector<signupState, boolean>((state) => state.duplicateChecked.isDuplicateChecked);
    const isExpeditionChecked = useSelector<signupState, boolean>((state) => state.expeditionChecked.isExpeditionChecked);
    const isPrivacyPolicyAgreed = useSelector<signupState, boolean>((state) => state.isPrivacyPolicyAgreed);

    // 회원가입 클릭 시 입력 조건 여부 반환
    // true = 실패, false = 통과
    const isInputValid = (): boolean => {
        if (!mData.id.trim()) {
            addToast({
                title: "입력값이 비어있음",
                description: `\"아이디\"의 입력란이 비어있습니다. 입력하시고 중복 확인하시고 진행해주세요.`,
                color: "danger"
            });
            return true;
        } 
        if (!isDuplicateChecked) {
            addToast({
                title: "아이디 중복 확인 불가",
                description: `아이디의 중복 확인을 하지 않았습니다. 확인 후 다시 시도해주세요.`,
                color: "danger"
            });
            return true;
        } 
        if (!isExpeditionChecked) {
            addToast({
                title: "원정대 확인 불가",
                description: `원정대 정보를 확인할 수 없습니다. 확인 체크를 하거나 로스트아크 점검 시간인지 확인해주시기 바랍니다.`,
                color: "danger"
            });
            return true;
        } 
        if (!mData.password.trim() || !mData.passwordCheck.trim()) {
            addToast({
                title: "입력값이 비어있음",
                description: `\"비밀번호\" 혹은 \"비밀번호 확인\"의 입력란이 비어있습니다.`,
                color: "danger"
            });
            return true;
        } 
        if (mData.password !== mData.passwordCheck) {
            addToast({
                title: "비밀번호 입력 문제",
                description: `비밀번호와 비밀번호 확인 입력값이 서로 다릅니다.`,
                color: "danger"
            });
            return true;
        }
        if (!isPrivacyPolicyAgreed) {
            addToast({
                title: "개인정보 수집 미동의",
                description: `개인정보 수집 및 여부를 동의 체크해주십시오. 동의하지 않을 경우 회원가입이 불가능합니다.`,
                color: "danger"
            });
            return true;
        }
        return false;
    }

    return () => {
        if (isInputValid()) { return; }

        
    }   
}