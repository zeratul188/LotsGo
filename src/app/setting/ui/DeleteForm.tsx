import { addToast, Button, Card, CardBody, Checkbox, Chip, Input } from "@heroui/react";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../store/store";
import { useDeleteUser } from "../lib/deleteFeat";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";

export default function DeleteComponent() {
    const [isChecked, setChecked] = useState(false);
    const [password, setPassword] = useState('');
    const [isInvalid, setInvalid] = useState(false);
    const [isLoading, setLoading] = useState(false);
    const dispatch = useDispatch<AppDispatch>();
    const searchParams = useSearchParams();
    const shownGoogleDeleteError = useRef<string | null>(null);
    const authProvider = useSelector((state: RootState) => state.login.user.authProvider);
    const isGoogleAccount = authProvider === "google";
    const onClickDeleteUser = useDeleteUser(password, setLoading, setInvalid, dispatch, isGoogleAccount);

    useEffect(() => {
        const result = searchParams.get("googleDelete");
        if (!result || shownGoogleDeleteError.current === result) return;
        shownGoogleDeleteError.current = result;
        const cancelled = result === "access_denied";
        addToast({
            title: cancelled ? "회원 탈퇴 취소" : "본인 인증 실패",
            description: cancelled
                ? "Google 본인 인증을 취소했습니다. 계정은 삭제되지 않았습니다."
                : result === "account-mismatch"
                    ? "로그인한 Google 계정이 회원 계정과 일치하지 않습니다."
                    : "Google 본인 인증을 완료하지 못했습니다. 다시 시도해 주세요.",
            color: cancelled ? "warning" : "danger"
        });
    }, [searchParams]);
    return (
        <div className="w-full">
            <div className="mb-4"><div className="flex items-center gap-2"><h1 className="text-xl font-bold">회원탈퇴</h1><Chip size="sm" radius="full" color="danger" variant="flat">위험 영역</Chip></div><p className="mt-1 text-xs text-default-500">탈퇴 전 계정 데이터와 복구 가능 여부를 확인해 주세요.</p></div>
            <Card radius="lg" shadow="none" className="max-w-[640px] border border-danger-200/80 dark:border-danger-500/20">
            <CardBody className="gap-4 p-4 sm:p-5">
                <div className="rounded-xl bg-danger-50 px-4 py-3 text-sm dark:bg-danger-500/10">
                    <p className="font-semibold text-danger-700 dark:text-danger-400">회원 탈퇴 시 유의사항</p>
                    <ul className="mt-2 list-disc space-y-1 pl-4 text-xs text-danger-700/80 dark:text-danger-300/80">
                        <li>탈퇴한 계정에 이용하던 데이터는 모두 삭제되며, 복구할 수 없습니다.</li>
                        <li>탈퇴 이후 동일한 아이디와 이메일로 로그인이 가능합니다.</li>
                    </ul>
                </div>
                <div>
                {isGoogleAccount ? <p className="rounded-xl bg-primary-50 px-4 py-3 text-sm text-primary-700 dark:bg-primary-500/10 dark:text-primary-300">Google 계정 본인 인증 후 탈퇴를 진행합니다.</p> : null}
                {!isGoogleAccount ? <>
                <Input
                    type="password"
                    label="현재 비밀번호"
                    labelPlacement="outside"
                    isInvalid={isInvalid}
                    errorMessage="비밀번호가 일치하지 않습니다."
                    radius="lg"
                    placeholder="현재 비밀번호를 입력하세요."
                    maxLength={12}
                    value={password}
                    onValueChange={setPassword}
                    className="w-full"/>
                </> : null}
                </div>
                <Checkbox
                    color="danger"
                    isSelected={isChecked}
                    onValueChange={setChecked}>
                    위 유의사항을 확인하였습니다.
                </Checkbox>
            <Button
                color="danger"
                size="lg"
                radius="lg"
                isLoading={isLoading}
                isDisabled={!isChecked}
                className="w-full font-semibold sm:w-fit"
                onPress={onClickDeleteUser}>
                탈퇴하기
            </Button>
            </CardBody>
            </Card>
        </div>
    )
}
