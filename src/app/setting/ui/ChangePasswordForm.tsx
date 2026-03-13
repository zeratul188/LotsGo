import { Button, Divider, Input } from "@heroui/react";
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
            <Input
                type="password"
                label="현재 비밀번호"
                labelPlacement="outside"
                isInvalid={isInvalid}
                errorMessage="비밀번호가 일치하지 않습니다."
                radius="sm"
                placeholder="현재 비밀번호를 입력하세요."
                maxLength={12}
                value={nowPassworld}
                onValueChange={setNowPassword}
                className="w-full sm:w-[400px]"/>
            <Divider className="mt-4 mb-10 w-full sm:w-[400px]"/>
            <Input
                type="password"
                label="새로운 비밀번호"
                labelPlacement="outside"
                placeholder="6 ~ 18글자 내로 입력하세요."
                radius="sm"
                maxLength={12}
                value={newPassworld}
                onValueChange={setNewPassword}
                className="w-full sm:w-[400px] mb-10"/>
            <Input
                type="password"
                label="비밀번호 확인"
                labelPlacement="outside"
                placeholder="새로운 비밀번호와 동일하게 입력하세요."
                radius="sm"
                maxLength={12}
                value={confirmPassworld}
                onValueChange={setConfirmPassword}
                className="w-full sm:w-[400px]"/>
            <Button
                radius="sm"
                color="primary"
                isLoading={isLoading}
                isDisabled={isDisable}
                className="w-full sm:w-[400px] mt-4"
                onPress={onClickChangePassword}>
                비밀번호 변경
            </Button>
        </div>
    )
}
