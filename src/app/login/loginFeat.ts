import { useCallback } from "react";
import { useRouter } from "next/navigation";
import type { SetStateFn } from "@/utiils/utils";
import type { User } from "./LoginForm";
import { addToast } from "@heroui/react";
import { logined, LoginUser } from "../store/loginSlice";
import type { AppDispatch } from "../store/store";
import { useDispatch } from "react-redux";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, firestore } from "@/utiils/firebase";
import { collection, getDocs, limit, query, where } from "firebase/firestore";
import { decrypt } from "@/utiils/crypto";
import Cookies from "js-cookie";

const secretKey = process.env.NEXT_PUBLIC_SECRET_KEY ? process.env.NEXT_PUBLIC_SECRET_KEY : "null";

export function useLoginHandlers(setUser: SetStateFn<User>) {
    const updateUserData = useCallback((updated: Partial<User>) => {
        setUser(prev => ({
            ...prev,
            ...updated
        }));
    }, [setUser]);

    return {
        onValueChangeID: (value: string) => updateUserData({ id: value.trim() }),
        onValueChangePassword: (value: string) => updateUserData({ password: value.trim() })
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

    if (user.id.trim() === "") {
        addToast({ title: "아이디 입력 필요", description: "아이디를 입력해주세요.", color: "danger" });
        setLoading(false);
        return;
    }
    if (user.password.trim() === "") {
        addToast({ title: "비밀번호 입력 필요", description: "비밀번호를 입력해주세요.", color: "danger" });
        setLoading(false);
        return;
    }

    try {
        const identityRes = await fetch("/api/login/identity", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: user.id })
        });

        if (!identityRes.ok) {
            setIdDuplicated(true);
            setPasswordNotMatch(false);
            return;
        }

        const identityData = await identityRes.json();
        const firebaseCredential = await signInWithEmailAndPassword(auth, identityData.email, user.password.trim());
        const idToken = await firebaseCredential.user.getIdToken();
        const res = await fetch("/api/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: user.id, idToken })
        });
        const data = await res.json();

        if (!res.ok) throw new Error(data.error || "FIREBASE_LOGIN_FAILED");

        const loginUser: LoginUser = {
            id: user.id,
            expedition: data.expedition,
            character: data.userData?.nickname ?? "",
            apiKey: data.userData?.apiKey ?? null,
            isSupporter: data.userData?.isSupporter === true
        };
        dispatch(logined(loginUser));
        sessionStorage.setItem("token", data.accessToken);
        sessionStorage.setItem("user", JSON.stringify(loginUser));
        localStorage.setItem("sessionExpiresAt", data.sessionExpiresAt);
        Cookies.set("userApiKey", loginUser.apiKey ?? "", {
            path: "/",
            secure: true,
            sameSite: "lax"
        });

        setIdDuplicated(false);
        setPasswordNotMatch(false);
        addToast({ title: "로그인 성공", description: "로그인되었습니다.", color: "success" });
        router.push("/");
    } catch {
        setIdDuplicated(false);
        setPasswordNotMatch(true);
    } finally {
        setLoading(false);
    }
}

export function useLoginHandler(
    user: User,
    setLoading: SetStateFn<boolean>,
    setIdDuplicated: SetStateFn<boolean>,
    setPasswordNotMatch: SetStateFn<boolean>
) {
    const router = useRouter();
    const dispatch = useDispatch<AppDispatch>();

    return async () => {
        await login(user, setLoading, setIdDuplicated, setPasswordNotMatch, router, dispatch);
    };
}

export async function handleSendPasswordReset(
    id: string,
    email: string,
    setIdDuplicated: SetStateFn<boolean>,
    onClose: () => void,
    setLoading: SetStateFn<boolean>
) {
    setLoading(true);
    setIdDuplicated(false);

    try {
        const q = query(collection(firestore, "members"), where("id", "==", id), limit(1));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            setIdDuplicated(true);
            return;
        }

        const encryptedEmail = snapshot.docs[0].data().email;
        if (typeof encryptedEmail !== "string" || decrypt(encryptedEmail, secretKey) !== email) {
            addToast({
                title: "이메일 불일치",
                description: "입력한 이메일이 해당 ID의 이메일과 일치하지 않습니다.",
                color: "danger"
            });
            return;
        }

        const res = await fetch("/api/auth/resetpassword", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email })
        });
        const data = await res.json();

        if (!res.ok) throw new Error(data.error || "PASSWORD_RESET_EMAIL_FAILED");

        addToast({
            title: "전송 완료",
            description: "비밀번호 재설정 메일을 확인해주세요.",
            color: "success"
        });
        onClose();
    } catch (error) {
        console.error("Password reset email failed", error);
        addToast({
            title: "전송 실패",
            description: "비밀번호 재설정 메일을 보내지 못했습니다.",
            color: "danger"
        });
    } finally {
        setLoading(false);
    }
}
