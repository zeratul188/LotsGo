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
type LogoComponentProps = {
    className?: string
}
export function LogoComponent({ className = "w-[220px]" }: LogoComponentProps) {
    return (
        <>
            <img
                src="/title(L).png"
                className={`${className} dark:hidden`}
                alt="로츠고 로고 이미지"/>
            <img
                src="/title(D).png"
                className={`${className} hidden dark:block`}
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
            <div className="flex flex-col gap-6">
                <Input
                    fullWidth
                    label="아이디"
                    labelPlacement="outside"
                    placeholder="아이디를 입력해 주세요"
                    size="lg"
                    radius="sm"
                    value={user.id}
                    onValueChange={onValueChangeID}
                    isInvalid={isIdDuplicated}
                    errorMessage="해당 아이디를 가진 회원정보를 찾을 수 없습니다."
                    variant="bordered"
                    classNames={{
                        label: "mb-1.5 font-medium",
                        inputWrapper: "border-gray-200 bg-gray-50/50 transition-colors hover:border-primary/50 dark:border-white/10 dark:bg-white/[0.03]"
                    }}/>
                <Input
                    fullWidth
                    type="password"
                    label="비밀번호"
                    labelPlacement="outside"
                    placeholder="비밀번호를 입력해 주세요"
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
                    variant="bordered"
                    classNames={{
                        label: "mb-1.5 font-medium",
                        inputWrapper: "border-gray-200 bg-gray-50/50 transition-colors hover:border-primary/50 dark:border-white/10 dark:bg-white/[0.03]"
                    }}/>
            </div>
            <Button
                fullWidth
                isLoading={isLoading}
                color="primary"
                size="lg"
                radius="sm"
                className="mt-8 font-semibold shadow-sm"
                onPress={onClickLogin}>
                로그인
            </Button>
            <div className="my-6 flex items-center gap-3">
                <Divider className="w-auto flex-1"/>
                <span className="shrink-0 text-xs fadedtext">아직 계정이 없으신가요?</span>
                <Divider className="w-auto flex-1"/>
            </div>
            <Button
                fullWidth
                size="lg"
                as={Link}
                href="/signup"
                radius="sm"
                variant="bordered"
                className="border-gray-200 font-semibold dark:border-white/10">
                회원가입
            </Button>
            <Link
                color="primary"
                className="mx-auto mt-5 flex w-max cursor-pointer text-sm font-medium"
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
            size="md"
            radius="lg"
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            onClose={() => {
                setEmail('');
                setID('');
            }}>
            <ModalContent className="border border-gray-200/80 dark:border-white/10">
                {(onClose) => (
                    <>
                        <ModalHeader className="flex flex-col gap-1 border-b border-gray-200/80 px-6 py-5 dark:border-white/10">
                            <div className="flex items-center gap-2">
                                <span className="h-5 w-1 rounded-full bg-primary"/>
                                <p className="text-xl font-semibold">비밀번호 재설정</p>
                            </div>
                            <p className="pl-3 text-sm font-normal fadedtext">가입 시 등록한 계정 정보를 입력해 주세요.</p>
                        </ModalHeader>
                        <ModalBody className="gap-5 px-6 py-6">
                            <Input
                                fullWidth
                                label="아이디"
                                value={id}
                                radius="sm"
                                onValueChange={setID}
                                isInvalid={isIdDuplicated}
                                errorMessage="해당 아이디를 가진 회원정보를 찾을 수 없습니다."
                                variant="bordered"
                                classNames={{ label: "mb-1.5 font-medium" }}/>
                            <Input
                                fullWidth
                                label="이메일"
                                value={email}
                                radius="sm"
                                onValueChange={setEmail}
                                variant="bordered"
                                classNames={{ label: "mb-1.5 font-medium" }}/>
                            <div className="rounded-xl bg-warning/10 p-4 text-sm">
                                <p className="font-semibold text-warning-700 dark:text-warning">비밀번호 재설정 안내</p>
                                <ul className="ml-5 mt-2 list-disc space-y-1 leading-5 fadedtext">
                                <li>메일의 링크에서 변경을 완료하기 전까지 기존 비밀번호를 사용할 수 있습니다.</li>
                                <li>변경을 완료한 이후에는 새 비밀번호로 로그인해주세요.</li>
                                </ul>
                            </div>
                        </ModalBody>
                        <ModalFooter className="px-6 pb-6 pt-0">
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
