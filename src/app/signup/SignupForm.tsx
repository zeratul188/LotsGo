import { Image, Button, Input } from "@heroui/react";
import {Table, TableHeader, TableColumn, TableBody, TableRow, TableCell} from "@heroui/react";
import { useSelector } from "react-redux";
import { signupState, duplicateChecked, expeditionChecked, character } from "./signupStore";
import { useOnClickDuplicateCheck, useOnClickExpeditionCheck, useOnClickSignup } from "./signupFeat";
import { useSignupHandlers } from "./signupFeat";
import clsx from 'clsx';

//상단 로고 이미지
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

//원정대 목록 요소
function ExpeditionComponent() {
    const expedition = useSelector<signupState, Array<character>>((state) => state.characters);

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

//회원가입 시 필요한 데이터 입력하는 요소
export function InputsComponent() {
    const duplicateChecked = useSelector<signupState, duplicateChecked>((state) => state.duplicateChecked);
    const expeditionChecked = useSelector<signupState, expeditionChecked>((state) => state.expeditionChecked);
    const {
        mData,
        onValueChangeID,
        onValueChangeCharacter,
        onValueChangePassword,
        onValueChangePasswordCheck
    } = useSignupHandlers();
    const onClickDuplicateCheck = useOnClickDuplicateCheck();
    const onClickExpeditionCheck = useOnClickExpeditionCheck();
    const onClickSignup = useOnClickSignup();

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
                    value={mData.id}
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
                    value={mData.character}
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
            <ExpeditionComponent/>
            <h3 className="mt-7 text-lg">비밀번호</h3>
            <Input
                size="lg" 
                type="password"
                className="mt-1"
                value={mData.password}
                onValueChange={onValueChangePassword}
                placeholder="6~18글자 내로 비밀번호를 입력하세요."/>
            <h3 className="mt-7 text-lg">비밀번호 확인</h3>
            <Input
                size="lg" 
                type="password"
                className="mt-1"
                isInvalid={mData.password !== mData.passwordCheck}
                errorMessage="입력한 비밀번호와 일치해야 합니다."
                value={mData.passwordCheck}
                onValueChange={onValueChangePasswordCheck}
                placeholder="6~18글자 내로 비밀번호를 입력하세요."/>
            <Button
                onPress={onClickSignup}
                fullWidth
                color="primary"
                size="lg"
                className="mt-10 mb-15">회원가입</Button>
        </div>
    )
}
