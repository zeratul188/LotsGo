import { SetStateFn } from "@/utiils/utils";
import { LoginUser, logout } from "../../store/loginSlice";
import { addToast } from "@heroui/react";
import { auth } from "@/utiils/firebase";
import { deleteUser, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import { AppDispatch } from "../../store/store";

// 회원탈퇴 이벤트 함수
export function useDeleteUser(
    password: string,
    setLoading: SetStateFn<boolean>,
    setInvalid: SetStateFn<boolean>,
    dispatch: AppDispatch
) {
    const userStr = sessionStorage.getItem('user');
    const storedUser: LoginUser = userStr ? JSON.parse(userStr) : null;
    const id = storedUser.id;
    return async () => {
        if (confirm('탈퇴 후 데이터는 완전히 삭제됩니다. 그래도 탈퇴하시겠습니까?')) {
            setLoading(true);
            setInvalid(false);
            const res = await fetch(`/api/auth/changepassword?id=${id}&password=${password}`);
            if (res.ok) {
                const data = await res.json();
                if (data.isSamePassword) {
                    const deleteRes = await fetch(`/api/auth/delete`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            id: id
                        })
                    });
                    if (deleteRes.ok) {
                        const user = auth.currentUser;
                        if (user && data.decryptEmail) {
                            const credenital = EmailAuthProvider.credential(data.decryptEmail, password);
                            reauthenticateWithCredential(user, credenital)
                                .then(() => deleteUser(user))
                                .then(() => {
                                    addToast({
                                        title: "삭제 완료",
                                        description: `회원 탈퇴에 성공하였습니다.`,
                                        color: "success"
                                    });
                                    sessionStorage.removeItem('token');
                                    sessionStorage.removeItem('user');
                                    dispatch(logout());
                                    location.href = '/';
                                })
                                .catch((err) => console.error("에러 발생", err));
                        }
                    } else {
                        addToast({
                            title: "삭제 오류",
                            description: `데이터를 삭제하는데 문제가 발생하였습니다.`,
                            color: "danger"
                        });
                    }
                } else {
                    setInvalid(true);
                }
            } else {
                addToast({
                    title: "로딩 오류",
                    description: `데이터를 불러오는데 문제가 발생하였습니다.`,
                    color: "danger"
                });
            }

            setLoading(false);
        }
    }
}
