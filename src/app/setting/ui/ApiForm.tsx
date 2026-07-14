import { Button, Card, CardBody, Checkbox, Chip, Input, Link } from "@heroui/react";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store/store";
import clsx from "clsx";
import { decrypt } from "@/utiils/crypto";
import { handleInsertKey, handleRemoveKey } from "../lib/apiFeat";

const secretKey = process.env.NEXT_PUBLIC_SECRET_KEY ? process.env.NEXT_PUBLIC_SECRET_KEY : 'null';

// 로스트아크 API 키 입력 페이지
export default function APIComponent() {
    const [apiKey, setApiKey] = useState('');
    const [isShowKey, setShowKey] = useState(false);
    const [isLoadingButton, setLoadingButton] = useState(false);
    const userApiKey: string | null = useSelector((state: RootState) => state.login.user.apiKey);
    const dispatch = useDispatch<AppDispatch>();
    return (
        <div className="w-full space-y-4">
            <div className="flex items-center gap-2"><div><h1 className="text-xl font-bold">로스트아크 API 키</h1><p className="mt-1 text-xs text-default-500">게임 데이터 조회와 일부 기능을 활성화하는 키를 관리합니다.</p></div><Chip size="sm" radius="full" variant="flat" color={userApiKey ? 'success' : 'default'}>{userApiKey ? '등록됨' : '미등록'}</Chip></div>
            <Card radius="lg" shadow="none" className="border border-default-200/80 dark:border-white/10">
                <CardBody className="gap-4 p-4">
                    <div><p className="text-sm font-semibold">API 키 관리</p><p className="mt-1 text-xs text-default-500">키는 외부에 공유하지 말고 안전하게 관리해 주세요.</p></div>
                    <Input
                        radius="lg"
                        label="로스트아크 API 키"
                        labelPlacement="outside"
                        placeholder="API KEY를 입력하세요"
                        isDisabled={userApiKey !== null}
                        value={apiKey}
                        onValueChange={setApiKey}/>
                    <Checkbox isSelected={isShowKey} onValueChange={setShowKey} className={clsx(userApiKey ? 'flex' : 'hidden')}>내 API 키 보기</Checkbox>
                    <p className={clsx("rounded-xl bg-default-50 p-3 text-sm break-words dark:bg-white/[0.04]", isShowKey && userApiKey ? 'block' : 'hidden')}>
                        {userApiKey ? decrypt(userApiKey, secretKey) : '-'}
                    </p>
                    <Button radius="lg" isLoading={isLoadingButton} isDisabled={apiKey.trim() === '' && !userApiKey} color={userApiKey ? 'danger' : 'primary'} className="w-full font-semibold sm:w-fit" onPress={async () => { if (userApiKey) { await handleRemoveKey(dispatch, setLoadingButton, setShowKey) } else { await handleInsertKey(apiKey, dispatch, setLoadingButton, setApiKey); } }}>
                        {userApiKey ? 'API 키 제거하기' : 'API 키 등록'}
                    </Button>
                </CardBody>
            </Card>
            <Card radius="lg" shadow="none" className="border border-default-200/80 dark:border-white/10">
                <CardBody className="gap-3 p-4">
                    <div className="flex items-center justify-between gap-2"><div><p className="text-sm font-semibold">API 키 발급 방법</p><p className="mt-1 text-xs text-default-500">발급 사이트에서 키를 생성한 뒤 위 입력창에 등록합니다.</p></div><Button as={Link} showAnchorIcon radius="lg" color="secondary" variant="flat" size="sm" href="https://developer-lostark.game.onstove.com/" target="_blank">발급 사이트</Button></div>
                    <ol className="list-decimal space-y-1 pl-5 text-xs leading-5 text-default-600 dark:text-default-300">
                        <li>위 발급 사이트 버튼을 통해 로스트아크 Open API 페이지로 이동합니다.</li>
                        <li>로스트아크 사이트에 로그인합니다.</li>
                        <li>GET ACCESS TO LOSTARK API 버튼 또는 우측 상단 버튼을 누릅니다.</li>
                        <li>MY CLIENTS에서 CREATE A NEW CLIENT를 누릅니다.</li>
                        <li>CLIENT NAME을 입력하고 하단 3개 체크 박스를 모두 체크한 뒤 CREATE 버튼을 누릅니다.</li>
                        <li>생성된 API KEY에서 COPY를 눌러 복사한 후 로츠고에 등록합니다.</li>
                    </ol>
                    <p className="rounded-xl bg-warning-50 px-3 py-2 text-xs text-warning-700 dark:bg-warning-500/10 dark:text-warning-400">로스트아크 점검 시간에는 API 키를 발급할 수 없습니다.</p>
                </CardBody>
            </Card>
        </div>
    )
}
