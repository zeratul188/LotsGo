import { useEffect, useState } from "react";
import { loadCompareCharacterInfo } from "../lib/compareFeat";
import { getColorTextByGrade, SetStateFn, useMobileQuery } from "@/utiils/utils";
import { Button, Card, CardBody, Input, Spinner } from "@heroui/react";
import data from "@/data/characters/data.json";
import { CharacterInfo } from "../../model/types";
import SearchEmptyIcon from "@/Icons/SearchEmptyIcon";
import clsx from "clsx";
import { getParsedText, getTitleData } from "../../lib/characterFeat";
import SupportorIcon from "@/Icons/SupportorIcon";
import AttackIcon from "@/Icons/AttackIcon";

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

// 검색되지 않았을 때 표시할 내용
function NotSearchComponent() {
    return (
        <div className="w-full h-full p-4 flex flex-col items-center justify-center">
            <SearchEmptyIcon size={64} className="mb-2 text-default-400" />
            <p className="text-base text-foreground">검색한 캐릭터가 없습니다</p>
            <p className="text-xs mt-1 fadedtext mb-3">
                아직 캐릭터를 조회하지 않았거나 표시할 내용이 비어 있습니다.
            </p>
        </div>
    )
}

// 캐릭터 정보 출력 컴포넌트
type CharactersComponentProps = {
    leftInfo: CharacterInfo | null,
    rightInfo: CharacterInfo | null
}
export function CharactersComponent({ leftInfo, rightInfo }: CharactersComponentProps) {
    const isMobile = useMobileQuery();
    return (
        <div className="w-full flex gap-4 flex-col mt-8">
            <ProfileComponent 
                leftInfo={leftInfo} 
                rightInfo={rightInfo}/>
        </div>
    )
}

type CharacterProps = {
    leftInfo: CharacterInfo | null,
    rightInfo: CharacterInfo | null,
    isMobile: boolean
}

// 프로필 영역
function ProfileComponent({ leftInfo, rightInfo }: CharactersComponentProps) {
    return (
        <div className="w-full grid min-[1257px]:grid-cols-[420px_1fr_420px] gap-2">
            <CharacterProfile info={leftInfo}/>
            <div/>
            <CharacterProfile info={rightInfo}/>
        </div>
    )
}

const upperClass = ['도화가', '기상술사', '환수사'];
function CharacterProfile({ info }: { info: CharacterInfo | null }) {
    return (
        <Card radius="sm" shadow="sm" className={info ? "bg-[#15181d] text-white" : ''}>
            <CardBody className="p-0">
                {info ? (
                    <div className="relative min-h-[204px] w-full overflow-hidden">
                        <div className="absolute top-0 right-0 z-0 h-[204px] w-[320px] overflow-hidden bg-[#15181d] sm:bg-transparent [mask-image:linear-gradient(to_right,transparent,black,black,black)]">
                            <img
                                src={info.profile.characterImageUrl}
                                alt="character-image"
                                className={clsx(
                                    "h-[400px] w-[100vw] origin-top scale-130 object-cover translate-x-[20%]",
                                    upperClass.includes(info.profile.className) ? "translate-y-[-28%]" : "translate-y-[-13%]"
                                )}
                            />
                        </div>
                        <div className="relative z-10 flex h-full flex-1 flex-col p-4">
                            <p className="fadedtext text-xs">
                                @{info.profile.server} · {info.profile.className} [{info.profile.arkpassiveTitle}]
                            </p>
                            <p className={clsx(
                                "mt-1 text-xs",
                                getColorTextByGrade(getTitleData(getParsedText(info.profile.title))?.grade ?? 'default')
                            )}>{getParsedText(info.profile.title)}</p>
                            <h3 className="font-semibold text-lg">{info.nickname}</h3>
                            <div className="grid grid-cols-[56px_1fr] gap-1 text-xs mt-1">
                                <p className="fadedtext text-right">아이템 레벨</p>
                                <p>{info.profile.itemLevel}</p>
                                <p className="fadedtext text-right">전투 레벨</p>
                                <p>{info.profile.characterLevel}</p>
                                <p className="fadedtext text-right">원정대 레벨</p>
                                <p>{info.profile.expeditionLevel}</p>
                                <p className="fadedtext text-right">명예</p>
                                <p>{info.profile.honorPoint.toLocaleString()}</p>
                            </div>
                            <div className="w-full flex gap-1 items-center mt-auto">
                                <div className="flex items-center">
                                    {info.profile.characterType === 'supportor' ? <SupportorIcon size={18}/> : <AttackIcon size={16}/>}
                                    <p className={clsx(
                                        "font-bold",
                                        info.profile.characterType === 'supportor' ? 'text-green-300' : 'text-red-300 ml-0.5'
                                    )}>{info.profile.combatPower}</p>
                                </div>
                                <div className="flex gap-1 ml-auto">
                                    {info.profile.emblems.map((emblem, idx) => (
                                        <img key={idx} src={emblem} alt={`emblem-${idx}`} className="w-[24px] h-[24px]"/>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                ) : <NotSearchComponent/>}
            </CardBody>
        </Card>
    )
}
