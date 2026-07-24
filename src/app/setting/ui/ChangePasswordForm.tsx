import { Button, Card, CardBody, Input } from "@heroui/react";
import { useEffect, useState } from "react";
import { isDisableButton, useChangePassword } from "../lib/changePassworlFeat";

export default function ChangePasswordComponent() {
    const [nowPassworld, setNowPassword] = useState('');
    const [newPassworld, setNewPassword] = useState('');
    const [confirmPassworld, setConfirmPassword] = useState('');
    const [isLoading, setLoading] = useState(false);
    const [isDisable, setDisable] = useState(false);
    const [isInvalid, setInvalid] = useState(false);
    const onClickChangePassword = useChangePassword(nowPassworld, newPassworld, setLoading, setInvalid, setNowPassword, setNewPassword, setConfirmPassword);

    useEffect(() => {
        setDisable(isDisableButton(nowPassworld, newPassworld, confirmPassworld));
    }, [nowPassworld, newPassworld, confirmPassworld]);

    return (
        <div className="w-full">
            <div className="mb-4"><h1 className="text-xl font-bold">비밀번호 변경</h1><p className="mt-1 text-xs text-default-500">계정 보호를 위해 주기적으로 비밀번호를 변경해 주세요.</p></div>
            <Card radius="lg" shadow="none" className="max-w-[520px] border border-default-200/80 dark:border-white/10">
            <CardBody className="gap-4 p-4 sm:p-5">
            <Input
                type="password"
                label="현재 비밀번호"
                labelPlacement="outside"
                isInvalid={isInvalid}
                errorMessage="비밀번호가 일치하지 않습니다."
                radius="lg"
                placeholder="현재 비밀번호를 입력하세요."
                maxLength={18}
                value={nowPassworld}
                onValueChange={setNowPassword}
                className="w-full"/>
            <Input
                type="password"
                label="새로운 비밀번호"
                labelPlacement="outside"
                placeholder="6 ~ 18글자 내로 입력하세요."
                radius="lg"
                maxLength={18}
                value={newPassworld}
                onValueChange={setNewPassword}
                className="w-full"/>
            <Input
                type="password"
                label="비밀번호 확인"
                labelPlacement="outside"
                placeholder="새로운 비밀번호와 동일하게 입력하세요."
                radius="lg"
                maxLength={18}
                value={confirmPassworld}
                onValueChange={setConfirmPassword}
                className="w-full"/>
            <Button
                radius="lg"
                color="primary"
                isLoading={isLoading}
                isDisabled={isDisable}
                className="w-full font-semibold"
                onPress={onClickChangePassword}>
                비밀번호 변경
            </Button>
            </CardBody>
            </Card>
        </div>
    )
}
