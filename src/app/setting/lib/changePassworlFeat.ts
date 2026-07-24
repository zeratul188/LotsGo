import { SetStateFn } from "@/utiils/utils";
import { LoginUser } from "../../store/loginSlice";
import { addToast } from "@heroui/react";
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from "firebase/auth";
import { auth } from "@/utiils/firebase";

// 비밀번호 변경 활성화 여부
export function isDisableButton(
    nowPassword: string,
    newPassword: string,
    confirmPassword: string
): boolean {
    const isNotEmpty = nowPassword !== '' && newPassword !== '' && confirmPassword !== '';
    const isLimitLength = newPassword.length >= 6 && newPassword.length <= 18;
    const isSamePassword = newPassword === confirmPassword;
    return !(isNotEmpty && isSamePassword && isLimitLength);
}

// 비밀번호 변경 이벤트 함수
export function useChangePassword(
    nowPassword: string,
    newPassword: string,
    setLoading: SetStateFn<boolean>,
    setInvalid: SetStateFn<boolean>,
    setNowPassword: SetStateFn<string>,
    setNewPassword: SetStateFn<string>,
    setConfirmPassword: SetStateFn<string>
) {
    const userStr = sessionStorage.getItem('user');
    const storedUser: LoginUser | null = userStr ? JSON.parse(userStr) : null;
    const id = storedUser?.id;
    return async () => {
        setLoading(true);
        setInvalid(false);
        const user = auth.currentUser;

        if (!id || !user?.email) {
            addToast({
                title: "인증 오류",
                description: `로그인 정보가 없어 비밀번호를 변경할 수 없습니다. 다시 로그인해주세요.`,
                color: "danger"
            });
        } else {
            try {
                const credential = EmailAuthProvider.credential(user.email, nowPassword);
                await reauthenticateWithCredential(user, credential);
                await updatePassword(user, newPassword);

                addToast({
                    title: "변경 완료",
                    description: `비밀번호를 변경하였습니다.`,
                    color: "success"
                });

                setNowPassword('');
                setNewPassword('');
                setConfirmPassword('');
            } catch {
                setInvalid(true);
            }
        }
        setLoading(false);
    }
}
