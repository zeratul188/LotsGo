import { addToast } from "@heroui/react";

// 관리자인지 파악하는 함수
export async function isAdministratorByToken(): Promise<boolean> {
    try {
        const token = sessionStorage.getItem('token');
        if (token) {
            const res = await fetch(`/api/auth/checkadministrator?token=${token}`);
            const data = await res.json();
            if (!res.ok) {
                addToast({
                    title: "토큰 오류",
                    description: data.error,
                    color: "danger"
                });
                return false;
            }
            return data.isAdministrator as boolean;
        }
        return false;
    } catch {
        addToast({
            title: "확인 오류",
            description: `회원의 데이터를 처리하는데 문제가 발생하였습니다.`,
            color: "danger"
        });
        return false;
    }
}