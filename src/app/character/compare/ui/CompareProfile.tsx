'use client'

import { Card, CardBody } from "@heroui/react";
import clsx from "clsx";
import { getColorTextByGrade } from "@/utiils/utils";
import SearchEmptyIcon from "@/Icons/SearchEmptyIcon";
import SupportorIcon from "@/Icons/SupportorIcon";
import AttackIcon from "@/Icons/AttackIcon";
import type { CharacterInfo } from "../../model/types";
import { getParsedText, getTitleData } from "../../lib/characterFeat";

const upperClass = ["환수사", "기상술사", "도화가"];

export function CompareProfile({ leftInfo, rightInfo }: { leftInfo: CharacterInfo | null, rightInfo: CharacterInfo | null }) {
    return (
        <div className="w-full grid min-[1257px]:grid-cols-[420px_1fr_420px] gap-2">
            <CharacterProfile info={leftInfo} />
            <div />
            <CharacterProfile info={rightInfo} />
        </div>
    );
}

function CharacterProfile({ info }: { info: CharacterInfo | null }) {
    return (
        <Card
            radius="lg"
            shadow="sm"
            className={clsx(
                "overflow-hidden border border-gray-200/80 shadow-sm dark:border-white/10",
                info ? "bg-[#15181d] text-white" : "bg-white dark:bg-[#171717]"
            )}>
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
                            <p
                                className={clsx(
                                    "mt-1 text-xs",
                                    getColorTextByGrade(getTitleData(getParsedText(info.profile.title))?.grade ?? "default")
                                )}
                            >
                                {getParsedText(info.profile.title)}
                            </p>
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
                                    {info.profile.characterType === "supportor" ? <SupportorIcon size={18} /> : <AttackIcon size={16} />}
                                    <p
                                        className={clsx(
                                            "font-bold",
                                            info.profile.characterType === "supportor" ? "text-green-300" : "text-red-300 ml-0.5"
                                        )}
                                    >
                                        {info.profile.combatPower}
                                    </p>
                                </div>
                                <div className="flex gap-1 ml-auto">
                                    {info.profile.emblems.map((emblem, idx) => (
                                        <img key={idx} src={emblem} alt={`emblem-${idx}`} className="w-[24px] h-[24px]" />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="w-full h-full p-4 flex flex-col items-center justify-center">
                        <SearchEmptyIcon size={64} className="mb-2 text-default-400" />
                        <p className="text-base text-foreground">검색한 캐릭터가 없습니다</p>
                        <p className="text-xs mt-1 fadedtext mb-3">
                            아직 캐릭터를 조회하지 않았거나 표시할 내용이 비어 있습니다.
                        </p>
                    </div>
                )}
            </CardBody>
        </Card>
    );
}
