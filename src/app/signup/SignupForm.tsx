import { Button, Chip, Input, Link } from "@heroui/react";
import { useState } from "react";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Checkbox } from "@heroui/react";
import { useClickDuplicateEmailCheck, useOnClickDuplicateCheck, useOnClickExpeditionCheck, useOnClickSignup, useOnValueChangePrivacy } from "./signupFeat";
import { useSignupHandlers } from "./signupFeat";
import type { Character, Member, DuplicateChecked, ExpeditionChecked, DuplicateEmail } from "./signupFeat";
import JobEmblemIcon from "@/Icons/JobEmblemIcon";

// state 관리
export function useSignupForm() {
    const [expedition, setExpedition] = useState<Character[]>([]);
    const [member, setMember] = useState<Member>({ id: '', character: '', email: '', password: '', passwordCheck: '' });
    const [duplicateChecked, setDuplicateChecked] = useState<DuplicateChecked>({ isDuplicateChecked: false, isChecking: false, isError: false });
    const [expeditionChecked, setExpeditionChecked] = useState<ExpeditionChecked>({ isExpeditionChecked: false, isChecking: false, isError: false });
    const [emailChecked, setEmailChecked] = useState<DuplicateEmail>({ isCheck: false, isLoading: false });
    const [isPrivacyPolicyAgreed, setPrivacyPolicyAgreed] = useState<boolean>(false);
    const [isLoading, setLoading] = useState(false);

    return {
        expedition, setExpedition,
        member, setMember,
        duplicateChecked, setDuplicateChecked,
        expeditionChecked, setExpeditionChecked,
        isPrivacyPolicyAgreed, setPrivacyPolicyAgreed,
        emailChecked, setEmailChecked,
        isLoading, setLoading
    };
}

// 상단 로고 이미지
type LogoComponentProps = {
    className?: string
}
export function LogoComponent({ className = "w-[220px]" }: LogoComponentProps) {
    return (
        <>
            <img
                src="/title(L).png"
                className={`${className} cursor-pointer dark:hidden`}
                alt="로츠고 로고 이미지"
                onClick={() => location.href = '/'}/>
            <img
                src="/title(D).png"
                className={`${className} hidden cursor-pointer dark:block`}
                alt="로츠고 로고 이미지"
                onClick={() => location.href = '/'}/>
        </>
    )
}

// 원정대 목록 요소
export function ExpeditionComponent({ expedition }: {expedition: Character[]}) {
    if (expedition.length === 0) return null;

    return (
        <section className="min-w-0 rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/[0.06] via-white to-gray-50 p-3 shadow-sm dark:border-primary/20 dark:from-primary/[0.12] dark:via-[#171717] dark:to-[#1d1d1d] sm:p-4">
            <div className="mb-3 flex items-center gap-2">
                <p className="font-semibold">확인된 원정대</p>
                <Chip size="sm" radius="sm" color="primary" variant="flat">{expedition.length}명</Chip>
                <p className="ml-auto hidden text-xs fadedtext sm:block">원정대 캐릭터 목록</p>
            </div>
            <div className="flex max-h-[360px] flex-col gap-2 overflow-y-auto sm:hidden">
                {expedition.map((character) => (
                    <article
                        key={`${character.server}-${character.nickname}`}
                        className="rounded-xl border border-gray-200/80 bg-white/80 px-3 py-2.5 dark:border-white/10 dark:bg-white/[0.04]">
                        <div className="flex min-w-0 items-center gap-2.5">
                            <JobEmblemIcon job={character.job} size={22} className="text-foreground" />
                            <div className="min-w-0 grow">
                                <p className="truncate text-sm font-semibold">{character.nickname}</p>
                                <p className="mt-0.5 truncate text-xs fadedtext">{character.job}</p>
                            </div>
                            <span className="shrink-0 rounded-full bg-primary/10 px-2 py-1 text-xs font-semibold tabular-nums text-primary dark:bg-primary/20">
                                Lv. {character.level.toLocaleString()}
                            </span>
                        </div>
                        <p className="mt-2 border-t border-gray-200/70 pt-1.5 text-[11px] fadedtext dark:border-white/10">
                            {character.server}
                        </p>
                    </article>
                ))}
            </div>
            <div className="hidden overflow-hidden rounded-xl border border-gray-200/80 bg-white/70 sm:block dark:border-white/10 dark:bg-white/[0.03]">
                <Table
                    removeWrapper
                    isHeaderSticky
                    aria-label="원정대 캐릭터 목록"
                    classNames={{
                        base: "w-full min-w-0",
                        table: "w-full table-fixed",
                        th: "h-9 bg-gray-100/95 text-xs text-default-500 dark:bg-[#242424]",
                        td: "max-w-0 truncate py-3 text-sm"
                    }}>
                    <TableHeader>
                        <TableColumn className="w-[30%]">이름</TableColumn>
                        <TableColumn className="w-[18%]">레벨</TableColumn>
                        <TableColumn className="w-[32%]">클래스</TableColumn>
                        <TableColumn className="w-[20%]">서버</TableColumn>
                    </TableHeader>
                    <TableBody>
                        {expedition.map((character) => (
                            <TableRow key={`${character.server}-${character.nickname}`}>
                                <TableCell className="font-medium">{character.nickname}</TableCell>
                                <TableCell className="tabular-nums">{character.level.toLocaleString()}</TableCell>
                                <TableCell>
                                    <span className="flex min-w-0 items-center gap-1.5">
                                        <JobEmblemIcon job={character.job} size={18} className="text-foreground" />
                                        <span className="truncate">{character.job}</span>
                                    </span>
                                </TableCell>
                                <TableCell>{character.server}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </section>
    )
}

// 회원가입 시 필요한 데이터 입력하는 요소
export function InputsComponent({
    expedition, setExpedition,
    member, setMember,
    duplicateChecked, setDuplicateChecked,
    expeditionChecked, setExpeditionChecked,
    isPrivacyPolicyAgreed, setPrivacyPolicyAgreed,
    emailChecked, setEmailChecked,
    isLoading, setLoading
}: ReturnType<typeof useSignupForm>) {
    const {
        onValueChangeID,
        onValueChangeCharacter,
        onValueChangePassword,
        onValueChangePasswordCheck,
        onValueChangeEmail
    } = useSignupHandlers(member, setMember);
    const onClickDuplicateCheck = useOnClickDuplicateCheck(member, setDuplicateChecked);
    const onClickExpeditionCheck = useOnClickExpeditionCheck(member, setExpeditionChecked, setExpedition);
    const onClickSignup = useOnClickSignup(
        member, 
        duplicateChecked.isDuplicateChecked,
        expeditionChecked.isExpeditionChecked,
        isPrivacyPolicyAgreed,
        emailChecked.isCheck,
        expedition,
        setLoading
    );
    const onValueChangePrivacy = useOnValueChangePrivacy(isPrivacyPolicyAgreed, setPrivacyPolicyAgreed);
    const onClickDuplicateEmailCheck = useClickDuplicateEmailCheck(member, setEmailChecked);

    return (
        <div className="min-w-0 space-y-7">
            <div className="space-y-2">
                <p className="font-medium">아이디</p>
                <div className="flex flex-col items-start gap-2 sm:flex-row">
                    <Input
                        size="lg"
                        placeholder="4~20글자 내로 아이디를 입력하세요."
                        className="grow"
                        maxLength={20}
                        radius="sm"
                        variant="bordered"
                        isInvalid={duplicateChecked.isError}
                        errorMessage="이미 중복된 아이디가 있습니다."
                        isDisabled={duplicateChecked.isDuplicateChecked}
                        value={member.id}
                        onValueChange={onValueChangeID}
                        classNames={{ inputWrapper: "border-gray-200 bg-gray-50/50 dark:border-white/10 dark:bg-white/[0.03]" }}/>
                    <Button
                        onPress={onClickDuplicateCheck}
                        isLoading={duplicateChecked.isChecking}
                        isDisabled={duplicateChecked.isDuplicateChecked}
                        color="primary"
                        variant="flat"
                        radius="sm"
                        size="lg"
                        className="w-full shrink-0 font-semibold sm:w-[128px]">
                        {duplicateChecked.isDuplicateChecked ? "사용 가능" : "중복 확인"}
                    </Button>
                </div>
            </div>

            <div className="space-y-2">
                <div>
                    <p className="font-medium">대표 캐릭터 이름</p>
                    <p className="mt-1 text-xs fadedtext">대표 캐릭터를 기준으로 원정대 캐릭터를 불러옵니다.</p>
                </div>
                <div className="flex flex-col items-start gap-2 sm:flex-row">
                    <Input
                        size="lg"
                        radius="sm"
                        variant="bordered"
                        value={member.character}
                        isInvalid={expeditionChecked.isError}
                        errorMessage="로스트아크 API로부터 데이터를 받아올 수 없습니다."
                        isDisabled={expeditionChecked.isExpeditionChecked}
                        onValueChange={onValueChangeCharacter}
                        placeholder="2~12글자 내로 대표 캐릭터 이름을 입력하세요."
                        className="grow"
                        classNames={{ inputWrapper: "border-gray-200 bg-gray-50/50 dark:border-white/10 dark:bg-white/[0.03]" }}/>
                    <Button
                        onPress={onClickExpeditionCheck}
                        isLoading={expeditionChecked.isChecking}
                        isDisabled={expeditionChecked.isExpeditionChecked}
                        color="primary"
                        variant="flat"
                        radius="sm"
                        size="lg"
                        className="w-full shrink-0 font-semibold sm:w-[128px]">
                        {expeditionChecked.isExpeditionChecked ? "확인 완료" : "원정대 확인"}
                    </Button>
                </div>
            </div>

            <ExpeditionComponent expedition={expedition}/>

            <div className="space-y-2">
                <p className="font-medium">이메일</p>
                <div className="flex flex-col items-start gap-2 sm:flex-row">
                    <Input
                        size="lg"
                        value={member.email}
                        isDisabled={emailChecked.isCheck}
                        onValueChange={onValueChangeEmail}
                        placeholder="ex) test1234@whitetusk.com"
                        radius="sm"
                        variant="bordered"
                        className="grow"
                        classNames={{ inputWrapper: "border-gray-200 bg-gray-50/50 dark:border-white/10 dark:bg-white/[0.03]" }}/>
                    <Button
                        onPress={onClickDuplicateEmailCheck}
                        isLoading={emailChecked.isLoading}
                        isDisabled={emailChecked.isCheck}
                        color="primary"
                        variant="flat"
                        radius="sm"
                        size="lg"
                        className="w-full shrink-0 font-semibold sm:w-[128px]">
                        {emailChecked.isCheck ? "확인 완료" : "중복 확인"}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                    <p className="font-medium">비밀번호</p>
                    <Input
                        size="lg"
                        type="password"
                        value={member.password}
                        radius="sm"
                        variant="bordered"
                        onValueChange={onValueChangePassword}
                        placeholder="6~18글자 내로 입력하세요."
                        classNames={{ inputWrapper: "border-gray-200 bg-gray-50/50 dark:border-white/10 dark:bg-white/[0.03]" }}/>
                </div>
                <div className="space-y-2">
                    <p className="font-medium">비밀번호 확인</p>
                    <Input
                        size="lg"
                        type="password"
                        radius="sm"
                        variant="bordered"
                        isInvalid={member.password !== member.passwordCheck}
                        errorMessage="입력한 비밀번호와 일치해야 합니다."
                        value={member.passwordCheck}
                        onValueChange={onValueChangePasswordCheck}
                        placeholder="비밀번호를 다시 입력하세요."
                        classNames={{ inputWrapper: "border-gray-200 bg-gray-50/50 dark:border-white/10 dark:bg-white/[0.03]" }}/>
                </div>
            </div>

            <div className="flex flex-col gap-2 rounded-xl border border-gray-200/80 bg-gray-50/60 p-4 sm:flex-row sm:items-center dark:border-white/10 dark:bg-white/[0.025]">
                <Checkbox
                    size="lg"
                    isSelected={isPrivacyPolicyAgreed}
                    onValueChange={onValueChangePrivacy}>
                    개인정보 수집 및 이용에 동의합니다.
                </Checkbox>
                <Link className="w-max text-sm sm:ml-auto" underline="hover" href="/policy">자세히 보기</Link>
            </div>

            <Button
                onPress={onClickSignup}
                fullWidth
                isLoading={isLoading}
                color="primary"
                radius="sm"
                size="lg"
                className="font-semibold shadow-sm">
                회원가입
            </Button>
            <p className="text-center text-sm fadedtext">
                이미 계정이 있으신가요? <Link href="/login" className="font-medium">로그인</Link>
            </p>
        </div>
    )
}
