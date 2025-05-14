import { useRouter } from "next/navigation"
import { addToast } from "@heroui/react";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../store/store";
import { logout } from "../store/loginSlice";

type Key = string | number;

export function useOnActionProfile() {
    const router = useRouter();
    const dispatch = useDispatch<AppDispatch>();

    return (key: Key) => {
        switch(key) {
            case "profile":
                // router.puth('/profile');
                break;
            case "setting":
                // router.puth('/setting');
                break;
            case "logout":
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                dispatch(logout());
                addToast({
                    title: "로그아웃 완료",
                    description: `로그아웃되었습니다.`,
                    color: "success"
                });
                router.push('/');
                break;
            case "administrator":
                router.push('/administrator');
                break;
        }
    }
}