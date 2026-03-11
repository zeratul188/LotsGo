import { useEffect, useState } from "react";
import { loadCompareCharacterInfo } from "../lib/compareFeat";
import { SetStateFn } from "@/utiils/utils";
import { Button, Input, Spinner } from "@heroui/react";
import data from "@/data/characters/data.json";
import { CharacterInfo } from "../../model/types";

type CharacterInputState = {
    value: string;
    setValue: SetStateFn<string>;
    isLoading: boolean;
    setLoading: SetStateFn<boolean>;
    setInfo: SetStateFn<CharacterInfo | null>;
};

type CharacterInputComponentProps = {
    leftInput: CharacterInputState;
    rightInput: CharacterInputState;
};

const COOLDOWN_SECONDS = 10;

export function CharacterInputComponent({
    leftInput,
    rightInput,
}: CharacterInputComponentProps) {
    const [leftCooldown, setLeftCooldown] = useState(0);
    const [rightCooldown, setRightCooldown] = useState(0);

    useEffect(() => {
        if (leftCooldown <= 0) {
            return;
        }

        const timer = window.setTimeout(() => {
            setLeftCooldown((prev) => Math.max(prev - 1, 0));
        }, 1000);

        return () => window.clearTimeout(timer);
    }, [leftCooldown]);

    useEffect(() => {
        if (rightCooldown <= 0) {
            return;
        }

        const timer = window.setTimeout(() => {
            setRightCooldown((prev) => Math.max(prev - 1, 0));
        }, 1000);

        return () => window.clearTimeout(timer);
    }, [rightCooldown]);

    const handleSubmit = async (
        input: CharacterInputState,
        cooldown: number,
        setCooldown: SetStateFn<number>
    ) => {
        if (cooldown > 0 || input.isLoading) {
            return;
        }

        const nickname = input.value.trim();
        if (!nickname) {
            input.setInfo(null);
            return;
        }

        input.setLoading(true);
        setCooldown(COOLDOWN_SECONDS);
        try {
            const info = await loadCompareCharacterInfo(nickname);
            input.setInfo(info);
        } finally {
            input.setLoading(false);
        }
    };

    return (
        <div className="mt-4 grid w-full grid-cols-2 gap-2">
            <div>
                <p className="mb-1 w-full text-xs">왼쪽 캐릭터</p>
                <form
                    className="flex w-full flex-col items-start gap-2 sm:flex-row sm:items-end"
                    onSubmit={(event) => {
                        event.preventDefault();
                        void handleSubmit(leftInput, leftCooldown, setLeftCooldown);
                    }}
                >
                    <Input
                        radius="sm"
                        placeholder="왼쪽 캐릭터 이름"
                        maxLength={data.maxCharacterNameLength}
                        value={leftInput.value}
                        onValueChange={leftInput.setValue}
                        isDisabled={leftInput.isLoading || leftCooldown > 0}
                        className="w-full sm:w-[200px]"
                    />
                    <Button
                        type="submit"
                        radius="sm"
                        color="primary"
                        isDisabled={leftInput.isLoading || leftCooldown > 0}
                        className="w-full sm:w-fit"
                    >
                        조회
                    </Button>
                    {leftInput.isLoading ? (
                        <div className="flex items-center gap-2 sm:ml-1">
                            <Spinner size="sm" color="primary" />
                            <p className="fadedtext text-xs">캐릭터를 조회중입니다...</p>
                        </div>
                    ) : null}
                    {!leftInput.isLoading && leftCooldown > 0 ? (
                        <p className="fadedtext text-xs sm:ml-1">{leftCooldown}초 후 다시 조회할 수 있습니다.</p>
                    ) : null}
                </form>
            </div>
            <div>
                <p className="mb-1 w-full text-right text-xs">오른쪽 캐릭터</p>
                <form
                    className="flex w-full flex-col items-end justify-end gap-2 sm:flex-row"
                    onSubmit={(event) => {
                        event.preventDefault();
                        void handleSubmit(rightInput, rightCooldown, setRightCooldown);
                    }}
                >
                    {rightInput.isLoading ? (
                        <div className="flex items-center gap-2 sm:ml-1">
                            <Spinner size="sm" color="primary" />
                            <p className="fadedtext text-xs">캐릭터를 조회중입니다...</p>
                        </div>
                    ) : null}
                    {!rightInput.isLoading && rightCooldown > 0 ? (
                        <p className="fadedtext text-xs sm:ml-1">{rightCooldown}초 후 다시 조회할 수 있습니다.</p>
                    ) : null}
                    <Input
                        radius="sm"
                        placeholder="오른쪽 캐릭터 이름"
                        maxLength={data.maxCharacterNameLength}
                        value={rightInput.value}
                        onValueChange={rightInput.setValue}
                        isDisabled={rightInput.isLoading || rightCooldown > 0}
                        className="w-full sm:w-[200px]"
                    />
                    <Button
                        type="submit"
                        radius="sm"
                        color="primary"
                        isDisabled={rightInput.isLoading || rightCooldown > 0}
                        className="w-full sm:w-fit"
                    >
                        조회
                    </Button>
                </form>
            </div>
        </div>
    );
}
