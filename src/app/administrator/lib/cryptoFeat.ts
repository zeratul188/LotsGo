import { SetStateFn } from "@/utiils/utils";
import { addToast } from "@heroui/react";

export function useCryptoEmail(setLoadingEmail: SetStateFn<boolean>, setCheckedEmail: SetStateFn<boolean>) {
    return async () => {
        if (confirm('모든 이메일을 암호화하시겠습니까? 한번 작업하면 되돌릴 수 없습니다.')) {
            setLoadingEmail(true);
            const res = await fetch(`/api/auth/cryptoemail`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            });
            if (res.ok) {
                addToast({
                    title: "암호화 완료",
                    description: `이메일을 암호화하는데 성공하였습니다.`,
                    color: "success"
                });
            } else {
                addToast({
                    title: "암호화 오류",
                    description: `이메일을 암호화하는데 실패하였습니다.`,
                    color: "danger"
                });
            }
            setLoadingEmail(false);
            setCheckedEmail(false);
        }
    }
}