import { SetStateFn } from "@/utiils/utils";
import { LoginUser } from "../../store/loginSlice";
import { addToast } from "@heroui/react";
import { hashValue } from "@/utiils/bcrypt";
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from "firebase/auth";
import { auth } from "@/utiils/firebase";

const secretKey = process.env.NEXT_PUBLIC_SECRET_KEY ? process.env.NEXT_PUBLIC_SECRET_KEY : 'null';

// 비밀번호 변경 활성화 여부
export function isDisableButton(
    nowPassword: string,
    newPassword: string,
    confirmPassword: string
): boolean {
    const isNotEmpty = nowPassword !== '' && newPassword !== '' && confirmPassword !== '';
    const isLimitLength = newPassword.length >= 6;
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
    const storedUser: LoginUser = userStr ? JSON.parse(userStr) : null;
    const id = storedUser.id;
    return async () => {
        setLoading(true);
        setInvalid(false);
        const res = await fetch(`/api/auth/changepassword?id=${id}&password=${nowPassword}`);
        if (!res.ok) {
            addToast({
                title: "로딩 오류",
                description: `데이터를 불러오는데 문제가 발생하였습니다.`,
                color: "danger"
            });
        } else {
            const data = await res.json();
            if (data.isSamePassword) {
                const heshedPassword: string = await hashValue(newPassword);
                const editRes = await fetch(`/api/auth/changepassword`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        id: id,
                        password: heshedPassword
                    })
                });
                if (editRes.ok) {
                    const user = auth.currentUser;
                    if (user && data.decryptEmail) {
                        const credenital = EmailAuthProvider.credential(data.decryptEmail, nowPassword);
                        reauthenticateWithCredential(user, credenital)
                            .then(() => updatePassword(user, newPassword))
                            .then(() => {
                                addToast({
                                    title: "변경 완료",
                                    description: `비밀번호를 변경하였습니다.`,
                                    color: "success"
                                });
                                setNowPassword('');
                                setNewPassword('');
                                setConfirmPassword('');
                            })
                            .catch((err) => console.error("에러 발생", err));
                    } else {
                        addToast({
                            title: "알 수 없는 오류",
                            description: `알 수 없는 오류가 발생하였습니다.`,
                            color: "danger"
                        });
                    }
                } else {
                    addToast({
                        title: "변경 오류",
                        description: `데이터를 저장하는데 문제가 발생하였습니다.`,
                        color: "danger"
                    });
                }
            } else {
                setInvalid(true);
            }
        }
        setLoading(false);
    }
}
