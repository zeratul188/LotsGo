import { Button, Checkbox, Code, Divider, Input, Link } from "@heroui/react";
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
        <div className="w-full">
            <p>로츠고 (Lot's go) 사이트를 원활하게 이용하기 위하여 로스트아크 API 키를 발급받아 입력해주시기 바랍니다.</p>
            <p>API 키를 입력하시면 로츠고의 일부 기능이 활성화되며, 원할하게 홈페이지를 이용하실 수 있습니다.</p>
            <Button
                as={Link}
                showAnchorIcon
                radius="sm"
                color="secondary"
                href="https://developer-lostark.game.onstove.com/"
                target="_blank"
                className="mt-4">
                로스크아크 API 키 발급하기
            </Button>
            <h3 className="mt-4 text-2xl font-bold mb-2">로스트아크 API 키 발급 받는 방법</h3>
            <ul className="list-decimal pl-4">
                <li>위 "로스트아크 API 키 발급하기" 버튼을 통해 로스트아크 Open API 페이지로 이동합니다.</li>
                <li>로스트아크 사이트에 로그인합니다.</li>
                <li>"GET ACCESS TO LOSTARK API" 버튼 또는 우측 상단에 있는 버튼을 누릅니다.</li>
                <li>"MY CLIENTS"에서 "CREATE A NEW CLIENT"를 누릅니다.</li>
                <li>"CLIENT NAME"을 입력 후 하단 3개 체크 박스를 모두 체크하신 이후 "CREATE" 버튼을 누릅니다.</li>
                <li>그 이후 보이는 API KEY에서 "COPY"를 눌러 복사한 후 로츠고 사이트에 등록하시면 됩니다.</li>
            </ul>
            <p className="text-red-600 dark:text-red-400 mt-3">단, 로스트아크가 점검 시간인 동안에는 API 키를 발급하실 수 없습니다.</p>
            <Divider className="mt-4 mb-12"/>
            <Input
                radius="sm"
                label="로스트아크 API 키"
                labelPlacement="outside"
                placeholder="API KEY"
                isDisabled={userApiKey !== null}
                value={apiKey}
                onValueChange={setApiKey}
                className="w-full sm:w-[400px]"/>
            <Checkbox
                isSelected={isShowKey}
                onValueChange={setShowKey}
                className={clsx(
                    "mt-4",
                    userApiKey ? 'flex' : 'hidden'
                )}>
                내 API 키 보기
            </Checkbox>
            <p className={clsx(
                "rounded-xl bg-[#eeeeee] dark:bg-[#333333] p-3 whitespace-normal break-words mt-2",
                isShowKey && userApiKey ? 'block' : 'hidden'
            )}>
                {userApiKey ? decrypt(userApiKey, secretKey) : '-'};
            </p>
            <div className="mt-4">
                <Button
                    size="lg"
                    radius="sm"
                    isLoading={isLoadingButton}
                    isDisabled={apiKey.trim() === '' && !userApiKey}
                    color={userApiKey ? 'danger' : 'primary'}
                    className="w-full sm:w-[max-content]"
                    onPress={async () => {
                        if (userApiKey) {
                            await handleRemoveKey(dispatch, setLoadingButton, setShowKey)
                        } else {
                            await handleInsertKey(apiKey, dispatch, setLoadingButton, setApiKey);
                        }
                    }}>
                    {userApiKey ? 'API 키 제거하기' : "등록하기"}
                </Button>
            </div>
        </div>
    )
}
