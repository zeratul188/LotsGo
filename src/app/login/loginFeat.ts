import { useCallback } from "react";
import { useRouter } from "next/navigation";
import type { SetStateFn } from "@/utiils/utils";
import type { User } from "./LoginForm";
import { addToast } from "@heroui/react";
import { logined, LoginUser, switchAdministrator } from "../store/loginSlice";
import type { AppDispatch } from "../store/store";
import { useDispatch } from "react-redux";
import { createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword } from "firebase/auth";
import { auth, firestore } from "@/utiils/firebase";
import { collection, doc, getDocs, query, updateDoc, where } from "firebase/firestore";

// 값 수정 이벤트 핸들링
export function useLoginHandlers(setUser: SetStateFn<User>) {
    const updateUserData = useCallback((updated: Partial<User>) => {
        setUser(prev => ({
            ...prev,
            ...updated
        }));
    }, [setUser]);

    return {
        onValueChangeID: (value: string) => updateUserData({ id: value }),
        onValueChangePassword: (value: string) => updateUserData({ password: value })
    };
}

// 로그인 이벤트
export function useLoginHandler(
    user: User,
    setLoading: SetStateFn<boolean>,
    setIdDuplicated: SetStateFn<boolean>,
    setPasswordNotMatch: SetStateFn<boolean>
) {
    const router = useRouter();
    const dispatch = useDispatch<AppDispatch>();

    return async () => {
        setLoading(true);

        if (user.id.trim() === '') {
            addToast({
                title: "아이디 비어있음",
                description: `아이디 입력란이 비어있습니다.`,
                color: "danger"
            });
            setLoading(false);
            return;
        }
        if (user.password.trim() === '') {
            addToast({
                title: "비밀번호 비어있음",
                description: `비밀번호 입력란이 비어있습니다.`,
                color: "danger"
            });
            setLoading(false);
            return;
        }

        const res = await fetch('/api/login', {
            method: 'POST',
            body: JSON.stringify({ id: user.id, password: user.password })
        });
        const data = await res.json();

        // 아이디 없음 또는 비밀번호 일치하지 않을 경우
        if (!res.ok) {
            try {
                const msg = data.message;
                console.log(msg);
                if (msg === '아이디가 존재하지 않습니다.') {
                    setIdDuplicated(true);
                    setPasswordNotMatch(false);
                } else if (msg === '비밀번호가 일치하지 않습니다.') {
                    setIdDuplicated(false);
                    setPasswordNotMatch(true);
                }
                setLoading(false);
                return;
            } catch (e) {
                console.warn("JSON 파싱 실패", e);
                setLoading(false);
                return;
            }
        }

        // 로그인 성공 시
        let resultEmail = '';
        if (data.isAdministrator) {
            resultEmail = `${user.id.trim()}@whitetusk.com`;
        } else {
            resultEmail = data.userData.email
        }

        await signInWithEmailAndPassword(auth, resultEmail, user.password.trim())
            .then(() => {
                onAuthStateChanged(auth, (userState) => {
                    if (userState) {
                        const loginUser: LoginUser = {
                            id: user.id,
                            expedition: data.expedition
                        }
                        dispatch(logined(loginUser));
                        dispatch(switchAdministrator(data.isAdministrator));
                        localStorage.setItem('token', data.token);
                        localStorage.setItem('user', JSON.stringify(loginUser));
                        localStorage.setItem('isAdministrator', data.isAdministrator);

                        setLoading(false);
                        setIdDuplicated(false);
                        setPasswordNotMatch(false);

                        addToast({
                            title: "로그인 성공",
                            description: `로그인에 성공하였습니다. 7일 후에 자동으로 로그아웃됩니다.`,
                            color: "success"
                        });
                        router.push('/');
                    } else {
                        addToast({
                            title: "인증 오류",
                            description: `인증하는데 문제가 발생하였습니다.`,
                            color: "danger"
                        });
                    }
                })
            })
            .catch((error) => {
                addToast({
                    title: "재인증",
                    description: `인증된 사용자 데이터가 없어 재인증을 진행합니다.`,
                    color: "warning"
                });
                createUserWithEmailAndPassword(auth, resultEmail, user.password.trim())
                    .then(async (userCredential) => {
                        const uid = userCredential.user.uid;
                        const q = query(collection(firestore, 'members'), where("id", "==", user.id));
                        const snapshot = await getDocs(q);
                        const targetDoc = snapshot.docs[0];
                        const docRef = doc(firestore, "members", targetDoc.id);
                        await updateDoc(docRef, {
                            uid: uid
                        });
                        addToast({
                            title: "인증 완료",
                            description: `인증 데이터 생성에 성공하였습니다. 다시 로그인해주시기 바랍니다.`,
                            color: "success"
                        });
                    })
                setLoading(false);
            })
    }
}