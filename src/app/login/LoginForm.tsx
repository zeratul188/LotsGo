import { Input, Divider, Button, Link, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/react";
import { useLoginHandlers, useLoginHandler, handleSendPasswordReset, login } from "./loginFeat";
import { useState } from "react";
import { SetStateFn } from "@/utiils/utils";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../store/store";

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
            <img 
                src="title(L).png" 
                className="w-[340px] dark:hidden cursor-pointer"
                alt="로츠고 로고 이미지"/>
            <img 
                src="title(D).png" 
                className="w-[340px] hidden dark:block cursor-pointer"
                alt="로츠고 로고 이미지"/>
        </>
    )
}

// 입력 폼 컴포넌트
type InputsComponentProps = {
    isLoading: boolean,
    setLoading: SetStateFn<boolean>,
    isIdDuplicated: boolean,
    setIdDuplicated: SetStateFn<boolean>,
    isPasswordNotMatch: boolean,
    setPasswordNotMatch: SetStateFn<boolean>,
    user: User,
    setUser: SetStateFn<User>,
    onOpen: () => void
}
export function InputsComponent({
    isLoading, setLoading,
    isIdDuplicated, setIdDuplicated,
    isPasswordNotMatch, setPasswordNotMatch,
    user, setUser,
    onOpen
}: InputsComponentProps) {
    const {
        onValueChangeID,
        onValueChangePassword
    } = useLoginHandlers(setUser);
    const onClickLogin = useLoginHandler(user, setLoading, setIdDuplicated, setPasswordNotMatch);
    
    const router = useRouter();
    const dispatch = useDispatch<AppDispatch>();

    return (
        <>
            <Input
                fullWidth
                label="아이디"
                size="lg"
                radius="sm"
                value={user.id}
                onValueChange={onValueChangeID}
                isInvalid={isIdDuplicated}
                errorMessage="해당 아이디를 가진 회원정보를 찾을 수 없습니다."
                variant="flat"/>
            <Input
                fullWidth
                className="mt-5"
                type="password"
                label="비밀번호"
                size="lg" 
                radius="sm"
                value={user.password}
                onValueChange={onValueChangePassword}
                isInvalid={isPasswordNotMatch}
                errorMessage="비밀번호가 일치하지 않습니다."
                onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                        login(user, setLoading, setIdDuplicated, setPasswordNotMatch, router, dispatch);
                    }
                }}
                variant="flat"/>
            <Divider className="mt-8 mb-8"/>
            <Button
                fullWidth
                isLoading={isLoading}
                color="primary"
                size="lg"
                radius="sm"
                onPress={onClickLogin}>
                로그인
            </Button>
            <Button
                fullWidth
                size="lg"
                as={Link}
                href="/signup"
                radius="sm"
                color="default"
                className="mt-5">
                회원가입
            </Button>
            <Link
                color="foreground"
                underline="always"
                className="mt-4 cursor-pointer"
                onPress={onOpen}>
                비밀번호 찾기
            </Link>
        </>
    )
}

// 비밀번호 재설정 Modal
type FindPasswordModalProps = {
    isOpen: boolean,
    onOpenChange: () => void
}
export function FindPasswordModal({ isOpen, onOpenChange }: FindPasswordModalProps) {
    const [email, setEmail] = useState('');
    const [id, setID] = useState('');
    const [isIdDuplicated, setIdDuplicated] = useState(false);
    const [isLoading, setLoading] = useState(false);

    return (
        <Modal
            isDismissable={false}
            isKeyboardDismissDisabled={true}
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            onClose={() => {
                setEmail('');
                setID('');
            }}>
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader>비밀번호 변경</ModalHeader>
                        <ModalBody>
                            <Input
                                fullWidth
                                label="아이디"
                                value={id}
                                radius="sm"
                                onValueChange={setID}
                                isInvalid={isIdDuplicated}
                                errorMessage="해당 아이디를 가진 회원정보를 찾을 수 없습니다."
                                variant="flat"
                                className="mb-2"/>
                            <Input
                                fullWidth
                                label="이메일"
                                value={email}
                                radius="sm"
                                onValueChange={setEmail}
                                variant="flat"/>
                            <p className="mt-4 font-bold">비밀번호 변경 시 주의사항</p>
                            <ul className="list-disc ml-5">
                                <li>이메일로 비밀번호 재설정을 보내면 기존에 존재하던 비밀번호는 사용하실 수 없습니다.</li>
                                <li>이메일로 보내진 비밀번호 재설정 이후 로그인을 마치면 정상적으로 비밀번호가 재설정됩니다.</li>
                            </ul>
                        </ModalBody>
                        <ModalFooter>
                            <Button
                                fullWidth
                                color="primary"
                                radius="sm"
                                isLoading={isLoading}
                                isDisabled={email.length <= 6 || id.length < 4}
                                size="lg"
                                onPress={async () => {
                                    await handleSendPasswordReset(id, email, setIdDuplicated, onClose, setLoading)
                                }}>
                                전송
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    )
}