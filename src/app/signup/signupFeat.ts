import { useCallback } from "react";
import { ref, get } from "firebase/database";
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { database, firestore, auth } from "@/utiils/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { addToast } from "@heroui/react";
import { hashValue } from "@/utiils/bcrypt";
import { useRouter } from "next/navigation";
import type { SetStateFn } from "@/utiils/utils";

export type Character = {
    nickname: string,
    level: number,
    server: string,
    job: string
}
export type Member = {
    id: string,
    character: string,
    email: string,
    password: string,
    passwordCheck: string
}
export type DuplicateChecked = {
    isDuplicateChecked: boolean, 
    isChecking: boolean, 
    isError: boolean
}
export type ExpeditionChecked = {
    isExpeditionChecked: boolean, 
    isChecking: boolean, 
    isError: boolean
}

// 중복 확인 버튼 이벤트
export function useOnClickDuplicateCheck(
    member: Member, 
    setDuplicationChecked: SetStateFn<DuplicateChecked>
) {
    const administratorRef = ref(database, `/administrator`);

    function containsForbiddenChars(str: string): boolean {
        return /[.#$\[\]]/.test(str);
    }

    return async () => {
        setDuplicationChecked(prev => ({
            ...prev,
            isChecking: true,
            isError: false
        }));
        const administratorSnapshot = await get(administratorRef);
        const administrator = {
            id: administratorSnapshot.child('id').val(),
            password: administratorSnapshot.child('password').val()
        }
        const snapshot = await getDocs(collection(firestore, `members`));
        const idList: string[] = snapshot.docs
            .map(doc => doc.data().id)
            .filter((id): id is string => typeof id === 'string');
        if (member.id.includes(' ')) {
            setDuplicationChecked({
                isDuplicateChecked: false,
                isChecking: false,
                isError: false
            });
            addToast({
                title: "아이디 입력 문제",
                description: '입력값에 공백이 있으면 안됩니다. 공백을 제거하고 다시 시도해주세요.',
                color: "danger"
            });
        } else if (member.id.length < 4) {
            setDuplicationChecked({
                isDuplicateChecked: false,
                isChecking: false,
                isError: false
            });
            addToast({
                title: "아이디 입력 문제",
                description: '아이디 글자 수가 최소 4글자 이상이여야 합니다.',
                color: "danger"
            });
        } else if (idList.includes(member.id)) {
            setDuplicationChecked({
                isDuplicateChecked: false,
                isChecking: false,
                isError: true
            });
        } else if (containsForbiddenChars(member.id)) {
            setDuplicationChecked({
                isDuplicateChecked: false,
                isChecking: false,
                isError: false
            });
            addToast({
                title: "아이디 사용 불가",
                description: '아이디에 사용할 수 없는 문자(\".\", \"#\", \"$\", \"[\", \"]\")가 포함되어 있습니다.',
                color: "danger"
            });
        } else if (administrator.id === member.id) {
            setDuplicationChecked({
                isDuplicateChecked: false,
                isChecking: false,
                isError: false
            });
            addToast({
                title: "아이디 사용 불가",
                description: '사용이 불가능한 아이디입니다. 다른 아이디로 시도해주세요.',
                color: "danger"
            });
        } else {
            setDuplicationChecked({
                isDuplicateChecked: true,
                isChecking: false,
                isError: false
            });
            addToast({
                title: "아이디 사용 가능",
                description: `해당 아이디는 사용이 가능합니다.`,
                color: "success"
            });
        }
    }
}

// 원정대 확인 버튼 이벤트
export function useOnClickExpeditionCheck(
    member: Member,
    setExpeditionChecked: SetStateFn<ExpeditionChecked>,
    setExpedition: SetStateFn<Character[]>
) {
    return async () => {
        setExpeditionChecked(prev => ({
            ...prev,
            isChecking: true,
            isError: false
        }));
        const lostarkRes = await fetch(`/api/lostark?value=${member.character}&code=0`);
        if (!lostarkRes.ok) {
            if (lostarkRes.status === 503) {
                addToast({
                    title: "서버 점검",
                    description: `로스트아크가 점검중입니다. 점검 이후 시도해주세요.`,
                    color: "danger"
                });
            }
            const text = await lostarkRes.text(); // ← JSON이 아닐 수도 있으니까
            setExpeditionChecked({
                isExpeditionChecked: false,
                isChecking: false,
                isError: true
            });
            return;
            //throw new Error('API 실패');
        }
        const data: Array<any> = await lostarkRes.json();
        if (data.length === 0) {
            setExpeditionChecked({
                isExpeditionChecked: false,
                isChecking: false,
                isError: false
            });
            addToast({
                title: "캐릭터 이름 입력 문제",
                description: '캐릭터 이름과 일치하는 캐릭터를 찾을 수 없습니다.',
                color: "danger"
            });
        } else {
            setExpeditionChecked({
                isExpeditionChecked: true,
                isChecking: false,
                isError: false
            });
            const characters: Array<Character> = [];
            data.forEach((character) => {
                characters.push({
                    nickname: character.CharacterName,
                    level: Number(character.ItemAvgLevel.replaceAll(',', '')),
                    server: character.ServerName,
                    job: character.CharacterClassName
                });
            });
            characters.sort((a, b) => b.level - a.level);
            setExpedition(characters);
            addToast({
                title: "원정대 저장 완료",
                description: `\"${member.character}\"의 원정대 정보를 불러오는데 성공했습니다.`,
                color: "success"
            });
        }
    }
}

// 개인정보 수집 동의 여부 체크 이벤트
export function useOnValueChangePrivacy(
    isPrivacyPolicyAgreed: boolean,
    setPrivacyPolicyAgreed: SetStateFn<boolean>
) {
    return () => {
        setPrivacyPolicyAgreed(!isPrivacyPolicyAgreed);
    }
}

// 값 수정 이벤트 핸들링 (회원 정보 수정)
export function useSignupHandlers(
    member: Member,
    setMember: SetStateFn<Member>
) {

    const updateMemberData = useCallback((updated: Partial<Member>) => {
        setMember(prev => ({
            ...prev,
            ...updated
        }));
    }, [setMember]);

    return {
        onValueChangeID: (value: string) => updateMemberData({ id: value }),
        onValueChangeCharacter: (value: string) => updateMemberData({ character: value }),
        onValueChangePassword: (value: string) => updateMemberData({ password: value }),
        onValueChangePasswordCheck: (value: string) => updateMemberData({ passwordCheck : value }),
        onValueChangeEmail: (value: string) => updateMemberData({ email: value })
    }
}

// 최종 회원가입 버튼 이벤트
export function useOnClickSignup(
    member: Member,
    isDuplicateChecked: boolean,
    isExpeditionChecked: boolean,
    isPrivacyPolicyAgreed: boolean,
    expedition: Character[],
    setLoading: SetStateFn<boolean>
) {
    const router = useRouter();

    // 회원가입 클릭 시 입력 조건 여부 반환
    // true = 실패, false = 통과
    const isInputValid = (): boolean => {
        if (!member.id.trim()) {
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
        if (!member.password.trim() || !member.passwordCheck.trim()) {
            addToast({
                title: "입력값이 비어있음",
                description: `\"비밀번호\" 혹은 \"비밀번호 확인\"의 입력란이 비어있습니다.`,
                color: "danger"
            });
            return true;
        } 
        if (!member.email.trim()) {
            addToast({
                title: "입력값이 비어있음",
                description: `\"이메일\"의 입력란이 비어있습니다.`,
                color: "danger"
            });
            return true;
        } 
        if (member.password.trim().length < 6 || member.password.trim().length > 18) {
            addToast({
                title: "입력값 조건 미충족족",
                description: `비밀번호의 글자수가 6글자 미만이거나 18글자를 초과하였습니다.`,
                color: "danger"
            });
            return true;
        }
        if (member.password !== member.passwordCheck) {
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

    return async () => {
        setLoading(true);
        // 입력 시 조건 확인 여부
        if (isInputValid()) { 
            setLoading(false);
            return;
         }

        const hashedPassword = await hashValue(member.password);
        const q = query(collection(firestore, 'members'), where("id", '==', member.id));
        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
            addToast({
                title: "중복된 회원 아이디",
                description: `이미 해당 아이디로 가입된 회원이 있습니다.`,
                color: "danger"
            });
            return;
        }

        const fakeEmail = `${member.id.trim()}@whitetusk.com`;
        createUserWithEmailAndPassword(auth, fakeEmail, member.password.trim())
            .then(async (userCredential) => {
                const user = userCredential.user;
                await addDoc(collection(firestore, 'members'), {
                    uid: user.uid,
                    id: member.id,
                    email: member.email,
                    character: member.character,
                    password: hashedPassword,
                    expeditions: expedition
                });
                addToast({
                    title: "회원가입 완료",
                    description: `회원가입하는데 성공하였습니다. 로그인을 진행하시면 됩니다.`,
                    color: "success"
                });

                setLoading(false);
                router.push('/login');
            })
            .catch((error) => {
                addToast({
                    title: "회원가입 오류",
                    description: `회원가입하는데 문제가 발생하였습니다.`,
                    color: "danger"
                });
                setLoading(false);
            })        
    }   
}