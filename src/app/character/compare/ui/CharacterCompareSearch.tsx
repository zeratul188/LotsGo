'use client'

import { useEffect, useState } from "react";
import { Button, Input, Spinner } from "@heroui/react";
import data from "@/data/characters/data.json";
import type { SetStateFn } from "@/utiils/utils";
import type { CharacterInfo } from "../../model/types";
import { loadCompareCharacterInfo } from "../lib/compareFeat";

export type CharacterInputState = {
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
        <div className="mt-5 grid w-full grid-cols-2 gap-2 sm:gap-3">
            <div className="rounded-xl border border-primary-100 bg-primary-50/40 p-2.5 dark:border-primary/20 dark:bg-primary/5 sm:p-3">
                <div className="mb-2 flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-primary"/>
                    <p className="whitespace-nowrap text-[11px] font-semibold text-primary">왼쪽 캐릭터</p>
                </div>
                <form
                    className="flex w-full flex-col items-start gap-2 sm:flex-row sm:items-end"
                    onSubmit={(event) => {
                        event.preventDefault();
                        void handleSubmit(leftInput, leftCooldown, setLeftCooldown);
                    }}
                >
                    <Input
                        radius="md"
                        variant="bordered"
                        placeholder="왼쪽 캐릭터 이름"
                        maxLength={data.maxCharacterNameLength}
                        value={leftInput.value}
                        onValueChange={leftInput.setValue}
                        isDisabled={leftInput.isLoading || leftCooldown > 0}
                        className="w-full sm:min-w-0 sm:flex-1"
                        classNames={{ inputWrapper: "bg-white shadow-sm dark:bg-white/[0.04]" }}
                    />
                    <Button
                        type="submit"
                        radius="md"
                        color="primary"
                        isDisabled={leftInput.isLoading || leftCooldown > 0}
                        className="w-full shrink-0 font-semibold sm:w-fit"
                    >
                        조회
                    </Button>
                    {leftInput.isLoading ? (
                        <div className="flex items-center gap-2 sm:ml-1">
                            <Spinner size="sm" color="primary" />
                            <p className="fadedtext text-xs">캐릭터를 조회 중입니다...</p>
                        </div>
                    ) : null}
                    {!leftInput.isLoading && leftCooldown > 0 ? (
                        <p className="fadedtext text-xs sm:ml-1">{leftCooldown}초 후 다시 조회할 수 있습니다.</p>
                    ) : null}
                </form>
            </div>
            <div className="rounded-xl border border-orange-100 bg-orange-50/40 p-2.5 dark:border-orange-400/20 dark:bg-orange-400/5 sm:p-3">
                <div className="mb-2 flex items-center justify-end gap-1.5">
                    <p className="whitespace-nowrap text-[11px] font-semibold text-orange-600 dark:text-orange-300">오른쪽 캐릭터</p>
                    <span className="h-2 w-2 rounded-full bg-orange-500"/>
                </div>
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
                            <p className="fadedtext text-xs">캐릭터를 조회 중입니다...</p>
                        </div>
                    ) : null}
                    {!rightInput.isLoading && rightCooldown > 0 ? (
                        <p className="fadedtext text-xs sm:ml-1">{rightCooldown}초 후 다시 조회할 수 있습니다.</p>
                    ) : null}
                    <Input
                        radius="md"
                        variant="bordered"
                        placeholder="오른쪽 캐릭터 이름"
                        maxLength={data.maxCharacterNameLength}
                        value={rightInput.value}
                        onValueChange={rightInput.setValue}
                        isDisabled={rightInput.isLoading || rightCooldown > 0}
                        className="w-full sm:min-w-0 sm:flex-1"
                        classNames={{ inputWrapper: "bg-white shadow-sm dark:bg-white/[0.04]" }}
                    />
                    <Button
                        type="submit"
                        radius="md"
                        color="primary"
                        isDisabled={rightInput.isLoading || rightCooldown > 0}
                        className="w-full shrink-0 font-semibold sm:w-fit"
                    >
                        조회
                    </Button>
                </form>
            </div>
        </div>
    );
}
