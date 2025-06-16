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
import { collection, doc, getDocs, limit, query, updateDoc, where } from "firebase/firestore";
import { hashValue } from "@/utiils/bcrypt";

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

type RouterType = ReturnType<typeof useRouter>;

export async function login(
    user: User,
    setLoading: SetStateFn<boolean>,
    setIdDuplicated: SetStateFn<boolean>,
    setPasswordNotMatch: SetStateFn<boolean>,
    router: RouterType,
    dispatch: AppDispatch
) {
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
            onAuthStateChanged(auth, async (userState) => {
                if (userState) {
                    if (!data.isAdministrator) {
                        if (data.userData.password === 'null') {
                            const q = query(collection(firestore, 'members'), where("id", "==", user.id), limit(1));
                            const snapshot = await getDocs(q);
                            const docRef = snapshot.docs[0].ref;
                            const hashedPassword = await hashValue(user.password);
                            await updateDoc(docRef, {
                                password: hashedPassword
                            });
                        }
                    }
                    const loginUser: LoginUser = {
                        id: user.id,
                        expedition: data.expedition,
                        character: data.userData ? data.userData.nickname : ''
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
        .catch((error: any) => {
            console.log(error.code);
            if (error.code === 'auth/wrong-password' && data.userData.password === 'null') {
                addToast({
                    title: "비밀번호 미일치",
                    description: `비밀번호가 일치하지 않습니다.`,
                    color: "danger"
                });
            } else if (error.code === 'auth/user-not-found' && data.userData.password === 'null') {
                addToast({
                    title: "이메일 없음",
                    description: `해당 이메일의 계정이 존재하지 않습니다.`,
                    color: "danger"
                });
            } else if (error.code === 'auth/invalid-credential' && data.userData.password === 'null') {
                addToast({
                    title: "인증 정보 없음",
                    description: `비밀번호가 일치하지 않거나 해당 이메일의 계정이 존재하지 않습니다.`,
                    color: "danger"
                });
            } else {
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
            }
            setLoading(false);
        })
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
        login(user, setLoading, setIdDuplicated, setPasswordNotMatch, router, dispatch);
    }
}

// 비밀번호 재설정 메일 전송 함수
export async function handleSendPasswordReset(
    id: string, 
    email: string, 
    setIdDuplicated: SetStateFn<boolean>,
    onClose: () => void,
    setLoading: SetStateFn<boolean>
) {
    setLoading(true);
    setIdDuplicated(false);
    const q = query(collection(firestore, 'members'), where("id", "==", id), limit(1));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
        setIdDuplicated(true);
        setLoading(false);
        return;
    }

    if (snapshot.docs[0].data().email) {
        if (email !== snapshot.docs[0].data().email) {
            addToast({
                title: "이메일 일치 오류",
                description: `해당 ID를 가진 계정의 이메일이 입력한 이메일과 일치하지 않습니다.`,
                color: "danger"
            });
            setLoading(false);
            return;
        }
    } else {
        addToast({
            title: "데이터 불러오기 실패",
            description: `데이터를 불러오는데 문제가 발생하였습니다.`,
            color: "danger"
        });
        setLoading(false);
        return;
    }

    const docRef = snapshot.docs[0].ref;
    await updateDoc(docRef, {
        password: 'null'
    });

    const res = await fetch('/api/auth/resetpassword', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
    });

    const data = await res.json();
    if (res.ok) {
        addToast({
            title: "전송 완료",
            description: `비밀번호 재설정 메일이 전송되었습니다. 메일함을 확인해주세요.`,
            color: "success"
        });
        setLoading(false);
        onClose();
    } else {
        addToast({
            title: "전송 실패",
            description: `비밀번호 재설정 메일이 전송을 실패하였습니다.`,
            color: "danger"
        });
        setLoading(false);
        console.error(data.error);
    }
}