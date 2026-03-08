import { Button, Checkbox, Divider, Input } from "@heroui/react";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../store/store";
import { useDeleteUser } from "../lib/deleteFeat";

export default function DeleteComponent() {
    const [isChecked, setChecked] = useState(false);
    const [password, setPassword] = useState('');
    const [isInvalid, setInvalid] = useState(false);
    const [isLoading, setLoading] = useState(false);
    const dispatch = useDispatch<AppDispatch>();
    const onClickDeleteUser = useDeleteUser(password, setLoading, setInvalid, dispatch);
    return (
        <div className="w-full">
            <p className="text-xl font-bold">회원 탈퇴 시 유의사항</p>
            <ul className="list-disc pl-4">
                <li>탈퇴한 계정에 이용하던 데이터는 모두 삭제되며, 복구할 수 없습니다.</li>
                <li>탈퇴 이후 동일한 아이디와 이메일로 로그인이 가능합니다.</li>
            </ul>
            <Divider className="mt-4 mb-10 w-full sm:w-[600px]"/>
            <div className="mt-8 mb-4">
                <Input
                    type="password"
                    label="현재 비밀번호"
                    labelPlacement="outside"
                    isInvalid={isInvalid}
                    errorMessage="비밀번호가 일치하지 않습니다."
                    radius="sm"
                    placeholder="현재 비밀번호를 입력하세요."
                    maxLength={12}
                    value={password}
                    onValueChange={setPassword}
                    className="w-full sm:w-[400px]"/>
            </div>
            <div className="mt-2 mb-5">
                <Checkbox
                    color="danger"
                    isSelected={isChecked}
                    onValueChange={setChecked}>
                    위 유의사항을 확인하였습니다.
                </Checkbox>
            </div>
            <Button
                color="danger"
                size="lg"
                radius="sm"
                isLoading={isLoading}
                isDisabled={!isChecked}
                className="w-full sm:w-[140px]"
                onPress={onClickDeleteUser}>
                탈퇴하기
            </Button>
        </div>
    )
}
