import { Image, Input, Divider, Button, Link } from "@heroui/react";
import { useLoginHandlers, useLoginHandler } from "./loginFeat";
import { useState } from "react";

export type User = {
    id: string,
    password: string
}

// state 관리
export function useLoginForm() {
    const [isLoading, setLoading] = useState<boolean>(false);
    const [isIdDuplicated, setIdDuplicated] = useState<boolean>(false);
    const [isPasswordNotMatch, setPasswordNotMatch] = useState<boolean>(false);
    const [user, setUser] = useState<User>({
        id: '',
        password: ''
    })

    return {
        isLoading, setLoading,
        isIdDuplicated, setIdDuplicated,
        isPasswordNotMatch, setPasswordNotMatch,
        user, setUser
    };
}

// 로고 이미지 컴포넌트
export function LogoComponent() {
    return (
        <>
            <Image 
                src="title(L).png" 
                width={340} 
                className="dark:hidden cursor-pointer"/>
            <Image 
                src="title(D).png" 
                width={340} 
                className="hidden dark:block cursor-pointer"/>
        </>
    )
}

// 입력 폼 컴포넌트
export function InputsComponent({
    isLoading, setLoading,
    isIdDuplicated, setIdDuplicated,
    isPasswordNotMatch, setPasswordNotMatch,
    user, setUser
}: ReturnType<typeof useLoginForm>) {
    const {
        onValueChangeID,
        onValueChangePassword
    } = useLoginHandlers(user, setUser);
    const onClickLogin = useLoginHandler(user, setLoading, setIdDuplicated, setPasswordNotMatch);

    return (
        <>
            <Input
                fullWidth
                label="아이디"
                size="lg"
                value={user.id}
                onValueChange={onValueChangeID}
                isInvalid={isIdDuplicated}
                errorMessage="해당 아이디를 가진 회줜정보를 찾을 수 없습니다."
                variant="flat"/>
            <Input
                fullWidth
                className="mt-5"
                type="password"
                label="비밀번호"
                size="lg" 
                value={user.password}
                onValueChange={onValueChangePassword}
                isInvalid={isPasswordNotMatch}
                errorMessage="비밀번호가 일치하지 않습니다."
                variant="flat"/>
            <Divider className="mt-8 mb-8"/>
            <Button
                fullWidth
                isLoading={isLoading}
                color="primary"
                size="lg"
                onPress={onClickLogin}>
                로그인
            </Button>
            <Button
                fullWidth
                size="lg"
                as={Link}
                href="/signup"
                color="default"
                className="mt-5">
                회원가입
            </Button>
        </>
    )
}