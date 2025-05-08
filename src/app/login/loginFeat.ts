import { useCallback } from "react";
import { useRouter } from "next/navigation";
import type { SetStateFn } from "@/utiils/utils";
import type { User } from "./LoginForm";
import { addToast } from "@heroui/react";

// 값 수정 이벤트 핸들링
export function useLoginHandlers(
    user: User,
    setUser: SetStateFn<User>
) {
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

    return async () => {
        setLoading(true);
        const res = await fetch('/api/login', {
            method: 'POST',
            body: JSON.stringify({ id: user.id, password: user.password })
        });

        // 아이디 없음 또는 비밀번호 일치하지 않을 경우
        if (!res.ok) {
            const { message } = await res.json();
            if (message === '아이디가 존재하지 않습니다.') {
                setIdDuplicated(true);
                setPasswordNotMatch(false);
            } else if (message === '비밀번호가 일치하지 않습니다.') {
                setIdDuplicated(false);
                setPasswordNotMatch(true);
            }
            setLoading(false);
            return;
        }

        // 로그인 성공 시시
        const { token } = await res.json();
        localStorage.setItem('token', token);

        setLoading(false);
        setIdDuplicated(false);
        setPasswordNotMatch(false);

        addToast({
            title: "로그인 성공",
            description: `로그인에 성공하였습니다. 3일 후에 자동으로 로그아웃됩니다.`,
            color: "success"
        });
        router.push('/');
    }
}