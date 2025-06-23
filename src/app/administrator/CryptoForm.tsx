import { Button, Checkbox } from "@heroui/react";
import { useState } from "react"
import { useCryptoEmail } from "./cryptoFeat";

export default function CryptoComponent() {
    const [isCheckedEmail, setCheckedEmail] = useState(false);
    const [isLoadingEmail, setLoadingEmail] = useState(false);

    const onClickCryptoEmail = useCryptoEmail(setLoadingEmail, setCheckedEmail);

    return (
        <div className="w-full">
            <h2 className="text-2xl">모든 회원의 이메일 암호화</h2>
            <p className="mt-2">모든 회원들의 이메일을 암호화합니다. 단, 한번 암호화된 이메일은 절대로 다시 암호화해서 안됩니다. 암호화 여부를 확인하시고 진행하시기 바랍니다.</p>
            <Checkbox
                color="danger"
                isSelected={isCheckedEmail}
                onValueChange={setCheckedEmail}
                className="mt-1">
                위 내용을 확인하였습니다.
            </Checkbox>
            <div className="mt-2">
                <Button
                    color="danger"
                    size="lg"
                    isDisabled={!isCheckedEmail}
                    isLoading={isLoadingEmail}
                    radius="sm"
                    onPress={onClickCryptoEmail}>
                    데이터 암호화
                </Button>
            </div>
        </div>
    )
}