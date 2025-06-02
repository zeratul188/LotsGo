import { Image, Button, Input } from "@heroui/react";
import { useState } from "react";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Checkbox } from "@heroui/react";
import { useClickDuplicateEmailCheck, useOnClickDuplicateCheck, useOnClickExpeditionCheck, useOnClickSignup, useOnValueChangePrivacy } from "./signupFeat";
import { useSignupHandlers } from "./signupFeat";
import type { Character, Member, DuplicateChecked, ExpeditionChecked, DuplicateEmail } from "./signupFeat";
import clsx from 'clsx';

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
export function LogoComponent() {
    return (
        <div className="w-full flex justify-center mt-5 sm:mt-20">
            <Image 
                src="title(L).png" 
                width={340} 
                className="dark:hidden cursor-pointer"
                onClick={() => location.href = '/'}/>
            <Image 
                src="title(D).png" 
                width={340} 
                className="hidden dark:block cursor-pointer"
                onClick={() => location.href = '/'}/>
        </div>
    )
}

// 원정대 목록 요소
function ExpeditionComponent({ expedition }: {expedition: Character[]}) {
    return (
        <Table
            aria-label="lostark characters infomations"
            className={clsx(
                "mt-5 mb-5",
                expedition.length !== 0 ? 'block' : 'hidden'
            )}>
            <TableHeader>
                <TableColumn>이름</TableColumn>
                <TableColumn>레벨</TableColumn>
                <TableColumn>클래스</TableColumn>
                <TableColumn>서버</TableColumn>
            </TableHeader>
            <TableBody>
                {expedition.map((character, index) => (
                    <TableRow key={index}>
                        <TableCell>{character.nickname}</TableCell>
                        <TableCell>{character.level}</TableCell>
                        <TableCell>{character.job}</TableCell>
                        <TableCell>{character.server}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
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
        <div>
            <h3 className="text-lg">아이디</h3>
            <div className="flex mt-1 gap-4">
                <Input
                    size="lg"
                    placeholder="4~20글자 내로 아이디를 입력하세요."
                    className="grow"
                    maxLength={20}
                    isInvalid={duplicateChecked.isError}
                    errorMessage="이미 중복된 아이디가 있습니다."
                    isDisabled={duplicateChecked.isDuplicateChecked}
                    value={member.id}
                    onValueChange={onValueChangeID}/>
                <Button
                    onPress={onClickDuplicateCheck}
                    isLoading={duplicateChecked.isChecking}
                    isDisabled={duplicateChecked.isDuplicateChecked}
                    color="primary"
                    size="lg">{duplicateChecked.isDuplicateChecked ? "사용 가능" : "중복 확인"}</Button>
            </div>
            <h3 className="mt-7 text-lg">대표 캐릭터 이름</h3>
            <div className="flex mt-1 gap-4">
                <Input
                    size="lg" 
                    value={member.character}
                    isInvalid={expeditionChecked.isError}
                    errorMessage="로스트아크 API로부터 데이터를 받아올 수 없습니다."
                    isDisabled={expeditionChecked.isExpeditionChecked}
                    onValueChange={onValueChangeCharacter}
                    placeholder="2~12글자 내로 대표 캐릭터 이름을 입력하세요."
                    className="grow"/>
                <Button
                    onPress={onClickExpeditionCheck}
                    isLoading={expeditionChecked.isChecking}
                    isDisabled={expeditionChecked.isExpeditionChecked}
                    color="primary"
                    size="lg">{expeditionChecked.isExpeditionChecked ? "확인 완료" : "원정대 확인"}</Button>
            </div>
            <ExpeditionComponent expedition={expedition}/>
            <h3 className="mt-7 text-lg">이메일</h3>
            <div className="flex mt-1 gap-4">
                <Input
                    size="lg" 
                    value={member.email}
                    isDisabled={emailChecked.isCheck}
                    onValueChange={onValueChangeEmail}
                    placeholder="ex) test1234@whitetusk.com"
                    className="grow"/>
                <Button
                    onPress={onClickDuplicateEmailCheck}
                    isLoading={emailChecked.isLoading}
                    isDisabled={emailChecked.isCheck}
                    color="primary"
                    size="lg">{emailChecked.isCheck ? "확인 완료" : "중복 확인"}</Button>
            </div>
            <h3 className="mt-7 text-lg">비밀번호</h3>
            <Input
                size="lg" 
                type="password"
                className="mt-1"
                value={member.password}
                onValueChange={onValueChangePassword}
                placeholder="6~18글자 내로 비밀번호를 입력하세요."/>
            <h3 className="mt-7 text-lg">비밀번호 확인</h3>
            <Input
                size="lg" 
                type="password"
                className="mt-1"
                isInvalid={member.password !== member.passwordCheck}
                errorMessage="입력한 비밀번호와 일치해야 합니다."
                value={member.passwordCheck}
                onValueChange={onValueChangePasswordCheck}
                placeholder="6~18글자 내로 비밀번호를 입력하세요."/>
            <Checkbox
                size="lg"
                isSelected={isPrivacyPolicyAgreed}
                onValueChange={onValueChangePrivacy}
                className="mt-2">개인정보 수집 및 이용에 동의합니다.</Checkbox>
            <Button
                onPress={onClickSignup}
                fullWidth
                isLoading={isLoading}
                color="primary"
                size="lg"
                className="mt-10 mb-15">회원가입</Button>
        </div>
    )
}
 