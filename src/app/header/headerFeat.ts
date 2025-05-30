import { useRouter } from "next/navigation"
import { addToast } from "@heroui/react";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../store/store";
import { logout } from "../store/loginSlice";
import { signOut } from "firebase/auth";
import { auth } from "@/utiils/firebase";

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
                localStorage.removeItem('isAdministrator');
                dispatch(logout());
                signOut(auth);
                addToast({
                    title: "로그아웃 완료",
                    description: `로그아웃되었습니다.`,
                    color: "success"
                });
                location.href = '/';
                break;
            case "administrator":
                router.push('/administrator');
                break;
        }
    }
}

export function useLogout() {
    const router = useRouter();
    const dispatch = useDispatch<AppDispatch>();
    return () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('isAdministrator');
        dispatch(logout());
        signOut(auth);
        addToast({
            title: "로그아웃 완료",
            description: `로그아웃되었습니다.`,
            color: "success"
        });
        location.href = '/';
    }
}