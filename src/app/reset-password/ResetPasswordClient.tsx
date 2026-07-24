'use client'

import { useEffect, useState } from "react";
import { Button, Input, Link, Spinner } from "@heroui/react";
import { confirmPasswordReset, signOut, verifyPasswordResetCode } from "firebase/auth";
import { auth } from "@/utiils/firebase";

type ResetPasswordClientProps = {
    mode?: string,
    oobCode?: string,
}

type ResetStatus = 'checking' | 'ready' | 'success' | 'invalid';

function LogoComponent({ className }: { className: string }) {
    return (
        <>
            <img src="/title(L).png" className={`${className} dark:hidden`} alt="로츠고 로고"/>
            <img src="/title(D).png" className={`${className} hidden dark:block`} alt="로츠고 로고"/>
        </>
    )
}

export default function ResetPasswordClient({ mode, oobCode }: ResetPasswordClientProps) {
    const [status, setStatus] = useState<ResetStatus>('checking');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const isPasswordLengthValid = password.length >= 6 && password.length <= 18;
    const isPasswordSame = password === confirmPassword;
    const isSubmitDisabled = !isPasswordLengthValid || !confirmPassword || !isPasswordSame || isLoading;

    useEffect(() => {
        if (mode !== 'resetPassword' || !oobCode) {
            setStatus('invalid');
            return;
        }

        verifyPasswordResetCode(auth, oobCode)
            .then((verifiedEmail) => {
                setEmail(verifiedEmail);
                setStatus('ready');
            })
            .catch(() => setStatus('invalid'));
    }, [mode, oobCode]);

    async function handleResetPassword() {
        if (!oobCode || isSubmitDisabled) return;

        setLoading(true);
        setErrorMessage('');

        try {
            await confirmPasswordReset(auth, oobCode, password);
            await signOut(auth).catch(() => undefined);
            setStatus('success');
            setPassword('');
            setConfirmPassword('');
        } catch (error: any) {
            if (error?.code === 'auth/expired-action-code' || error?.code === 'auth/invalid-action-code') {
                setStatus('invalid');
            } else if (error?.code === 'auth/weak-password') {
                setErrorMessage('비밀번호는 6글자 이상으로 설정해주세요.');
            } else {
                setErrorMessage('비밀번호를 변경하는 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.');
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="relative flex min-h-[calc(100vh-65px)] items-center justify-center overflow-hidden bg-gray-50/70 px-4 py-8 sm:px-6 lg:py-12 dark:bg-[#111111]">
            <div className="pointer-events-none absolute -left-32 -top-32 h-80 w-80 rounded-full bg-primary/10 blur-3xl"/>
            <div className="pointer-events-none absolute -bottom-40 -right-24 h-96 w-96 rounded-full bg-secondary/10 blur-3xl"/>

            <div className="relative grid w-full max-w-5xl overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.08)] lg:grid-cols-[0.9fr_1.1fr] dark:border-white/10 dark:bg-[#171717] dark:shadow-none">
                <section className="relative hidden flex-col justify-between overflow-hidden border-r border-gray-200/80 bg-primary/[0.04] p-10 lg:flex dark:border-white/10 dark:bg-primary/[0.07]">
                    <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full border-[32px] border-primary/[0.06]"/>
                    <div className="relative">
                        <LogoComponent className="w-[220px]"/>
                        <p className="mt-8 max-w-sm text-3xl font-bold leading-tight tracking-tight">
                            새로운 비밀번호로<br/>계정을 안전하게 지켜주세요.
                        </p>
                        <p className="mt-4 max-w-sm text-sm leading-6 fadedtext">
                            변경이 완료되면 기존 비밀번호는 사용할 수 없으며, 새 비밀번호로 다시 로그인할 수 있습니다.
                        </p>
                    </div>
                    <div className="relative mt-12 space-y-3">
                        {['6~18글자의 새로운 비밀번호', '이메일로 확인된 안전한 변경', '변경 완료 후 로그인으로 복귀'].map((item) => (
                            <div key={item} className="flex items-center gap-3 text-sm font-medium">
                                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">✓</span>
                                {item}
                            </div>
                        ))}
                    </div>
                </section>

                <section className="flex min-h-[520px] items-center justify-center px-5 py-8 sm:px-10 sm:py-12 lg:px-14">
                    <div className="w-full max-w-[420px]">
                        <div className="mb-8 lg:hidden">
                            <LogoComponent className="w-[190px]"/>
                        </div>

                        {status === 'checking' && (
                            <div className="flex min-h-64 flex-col items-center justify-center text-center">
                                <Spinner size="lg" label="재설정 링크를 확인하고 있습니다..." variant="wave" classNames={{ label: "mt-4 fadedtext" }}/>
                            </div>
                        )}

                        {status === 'invalid' && (
                            <div className="text-center">
                                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-danger/10 text-2xl font-bold text-danger">!</div>
                                <h1 className="mt-6 text-2xl font-semibold tracking-tight">재설정 링크를 사용할 수 없습니다</h1>
                                <p className="mt-3 text-sm leading-6 fadedtext">
                                    링크가 만료되었거나 이미 사용되었습니다.<br/>로그인 화면에서 비밀번호 찾기를 다시 진행해주세요.
                                </p>
                                <Button as={Link} href="/login" fullWidth color="primary" size="lg" radius="sm" className="mt-8 font-semibold">
                                    로그인 화면으로 이동
                                </Button>
                            </div>
                        )}

                        {status === 'success' && (
                            <div className="text-center">
                                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success/10 text-2xl font-bold text-success">✓</div>
                                <h1 className="mt-6 text-2xl font-semibold tracking-tight">비밀번호 변경 완료</h1>
                                <p className="mt-3 text-sm leading-6 fadedtext">
                                    새로운 비밀번호가 안전하게 설정되었습니다.<br/>변경한 비밀번호로 로그인해주세요.
                                </p>
                                <Button as={Link} href="/login" fullWidth color="primary" size="lg" radius="sm" className="mt-8 font-semibold">
                                    로그인하기
                                </Button>
                            </div>
                        )}

                        {status === 'ready' && (
                            <>
                                <div className="mb-8">
                                    <div className="flex items-center gap-2">
                                        <span className="h-5 w-1 rounded-full bg-primary"/>
                                        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">비밀번호 재설정</h1>
                                    </div>
                                    <p className="mt-2 pl-3 text-sm fadedtext">새로운 비밀번호를 입력해주세요.</p>
                                </div>

                                <div className="mb-6 rounded-xl border border-primary/15 bg-primary/[0.04] p-4">
                                    <p className="text-xs font-medium text-default-500">비밀번호를 변경할 계정</p>
                                    <p className="mt-1 break-all text-sm font-semibold">{email}</p>
                                </div>

                                <div className="flex flex-col gap-6">
                                    <Input
                                        fullWidth
                                        type="password"
                                        label="새 비밀번호"
                                        labelPlacement="outside"
                                        placeholder="6~18글자로 입력해주세요"
                                        size="lg"
                                        radius="sm"
                                        minLength={6}
                                        maxLength={18}
                                        value={password}
                                        onValueChange={(value) => {
                                            setPassword(value);
                                            setErrorMessage('');
                                        }}
                                        isInvalid={Boolean(password) && !isPasswordLengthValid}
                                        errorMessage="비밀번호는 6~18글자로 입력해주세요."
                                        variant="bordered"
                                        classNames={{
                                            label: "mb-1.5 font-medium",
                                            inputWrapper: "border-gray-200 bg-gray-50/50 transition-colors hover:border-primary/50 dark:border-white/10 dark:bg-white/[0.03]"
                                        }}/>
                                    <Input
                                        fullWidth
                                        type="password"
                                        label="새 비밀번호 확인"
                                        labelPlacement="outside"
                                        placeholder="새 비밀번호를 다시 입력해주세요"
                                        size="lg"
                                        radius="sm"
                                        maxLength={18}
                                        value={confirmPassword}
                                        onValueChange={(value) => {
                                            setConfirmPassword(value);
                                            setErrorMessage('');
                                        }}
                                        isInvalid={Boolean(confirmPassword) && !isPasswordSame}
                                        errorMessage="새 비밀번호와 일치하지 않습니다."
                                        onKeyDown={(event) => {
                                            if (event.key === 'Enter') void handleResetPassword();
                                        }}
                                        variant="bordered"
                                        classNames={{
                                            label: "mb-1.5 font-medium",
                                            inputWrapper: "border-gray-200 bg-gray-50/50 transition-colors hover:border-primary/50 dark:border-white/10 dark:bg-white/[0.03]"
                                        }}/>
                                </div>

                                {errorMessage && (
                                    <p className="mt-4 rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{errorMessage}</p>
                                )}

                                <Button
                                    fullWidth
                                    color="primary"
                                    size="lg"
                                    radius="sm"
                                    isLoading={isLoading}
                                    isDisabled={isSubmitDisabled}
                                    className="mt-8 font-semibold shadow-sm"
                                    onPress={handleResetPassword}>
                                    비밀번호 변경
                                </Button>

                                <div className="mt-5 rounded-xl bg-warning/10 p-4 text-xs leading-5 fadedtext">
                                    변경을 완료하면 기존 비밀번호는 더 이상 사용할 수 없습니다.
                                </div>
                            </>
                        )}
                    </div>
                </section>
            </div>
        </main>
    )
}
