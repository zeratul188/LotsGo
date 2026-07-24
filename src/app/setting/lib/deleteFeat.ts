import { SetStateFn } from "@/utiils/utils";
import { LoginUser, logout } from "../../store/loginSlice";
import { addToast } from "@heroui/react";
import { EmailAuthProvider, reauthenticateWithCredential, deleteUser } from "firebase/auth";
import { auth } from "@/utiils/firebase";
import { AppDispatch } from "../../store/store";

export function useDeleteUser(
    password: string,
    setLoading: SetStateFn<boolean>,
    setInvalid: SetStateFn<boolean>,
    dispatch: AppDispatch
) {
    const userStr = sessionStorage.getItem("user");
    const storedUser: LoginUser | null = userStr ? JSON.parse(userStr) : null;
    const id = storedUser?.id;

    return async () => {
        if (!confirm("탈퇴하면 계정 데이터가 완전히 삭제됩니다. 그래도 탈퇴하시겠습니까?")) return;

        setLoading(true);
        setInvalid(false);

        try {
            const user = auth.currentUser;
            if (!id || !user?.email) throw new Error("AUTH_REQUIRED");

            const credential = EmailAuthProvider.credential(user.email, password);
            await reauthenticateWithCredential(user, credential);

            const deleteRes = await fetch("/api/auth/delete", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id })
            });
            if (!deleteRes.ok) throw new Error("DELETE_MEMBER_FAILED");

            await deleteUser(user);
            sessionStorage.removeItem("token");
            sessionStorage.removeItem("user");
            dispatch(logout());
            addToast({ title: "탈퇴 완료", description: "회원 탈퇴가 완료되었습니다.", color: "success" });
            location.href = "/";
        } catch (error) {
            const errorCode = typeof error === "object" && error !== null && "code" in error
                ? String(error.code)
                : "";

            if (errorCode !== "auth/invalid-credential" && errorCode !== "auth/wrong-password") {
                console.error("Failed to delete account", error);
            }
            setInvalid(true);
        } finally {
            setLoading(false);
        }
    };
}
