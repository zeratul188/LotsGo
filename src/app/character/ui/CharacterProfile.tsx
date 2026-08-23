'use client'

import { Card, CardBody, Chip, Tooltip } from "@heroui/react";
import clsx from "clsx";
import { useMobileQuery } from "@/utiils/utils";
import VegaIcon from "@/Icons/VegaIcon";
import { ItemLevelIcon } from "@/Icons/ItemLevelIcon";
import type { CharacterInfo } from "../model/types";
import { getParsedText, getTitleData } from "../lib/characterFeat";
import { TitleIcon } from "./TitleIcon";
import { getColorTextByGrade } from "@/utiils/utils";

const upperClass = ['도화가', '기상술사', '환수사'];

export function ProfileComponent({ info, isBadge }: { info: CharacterInfo, isBadge: boolean }) {
    const isMobile = useMobileQuery();
    const title = info.profile.title ? getParsedText(info.profile.title) : '';
    const titleData = getTitleData(title);
    const titleClassName = clsx(titleData && getColorTextByGrade(titleData.grade), titleData && "font-bold");
    return (
        <div className="w-full h-[max-content] sm:h-[300px] border-b-1 border-[#dddddd] dark:border-[#333333] bg-[#F6F6F6] dark:bg-[#111111]">
            <div className="w-full h-full max-w-[1280px] mx-auto flex flex-col-reverse sm:flex-row relative">
                <div className="p-5 h-full hidden sm:flex flex-col">
                    <div className="flex gap-2">
                        <Chip color="secondary" variant="solid" radius="sm">{info.profile.server}</Chip>
                        <Chip color="warning" variant="solid" radius="sm">{info.profile.className}</Chip>
                        <Chip color="primary" variant="solid" radius="sm" className={clsx(info.profile.arkpassiveTitle ? 'flex' : 'hidden')}>{info.profile.arkpassiveTitle}</Chip>
                    </div>
                    <p className="mt-2 flex items-center gap-1">
                        <TitleIcon title={title} className="mr-1 h-[1em] w-[1em] scale-[1.75]"/>
                        <span>
                            <span className={titleClassName}>{title || '-'}</span>
                            {info.profile.guildName !== '-' ? ` · ${info.profile.guildName} 길드` : ''}
                        </span>
                    </p>
                    {isBadge ? (
                        <div className="flex gap-2 items-center">
                            <div className="tag-container">
                                <div className="flex">
                                    <span className="battletag">{info.nickname}</span>
                                    <div className="empty-box"></div>
                                </div>
                                <span className="tail-wrapper">
                                    <span className="tail-box"></span>
                                </span>
                            </div>
                            <Tooltip showArrow content="후원자 뱃지">
                                <div className="supporter-badge-emblem" aria-label="후원자 뱃지">
                                    <VegaIcon className="supporter-badge-icon"/>
                                </div>
                            </Tooltip>
                        </div>
                    ) : <p className="text-2xl font-bold">{info.nickname}</p>}
                    <div className="mt-2 w-fit flex items-center rounded-full bg-white dark:bg-[#18181b] shadow-md">
                        <p className="rounded-l-full h-full flex items-center bg-gradient-to-r from-orange-500 to-red-500 py-0.5 pl-2 pr-1.5 text-xs text-white">전투 레벨</p>
                        <p className="py-0.5 pl-2.5 pr-3 text-sm">{info.profile.characterLevel.toLocaleString()}</p>
                    </div>
                    <div className="mt-2 w-fit flex items-center rounded-full bg-white dark:bg-[#18181b] shadow-md">
                        <p className="rounded-l-full h-full flex items-center bg-gradient-to-r from-pink-500 to-purple-500 py-0.5 pl-2 pr-1.5 text-xs text-white">원정대 레벨</p>
                        <p className="py-0.5 pl-2.5 pr-3 text-sm">{info.profile.expeditionLevel}</p>
                    </div>
                    <div className="mt-2 w-fit flex items-center rounded-full bg-white dark:bg-[#18181b] shadow-md">
                        <p className="rounded-l-full h-full flex items-center bg-gradient-to-r from-sky-500 to-blue-500 py-0.5 pl-2 pr-1.5 text-xs text-white">영지</p>
                        <p className="py-0.5 pl-2.5 pr-3 text-sm">Lv.{info.profile.townLevel} {info.profile.townName}</p>
                    </div>
                    <div className="grow flex flex-row items-center gap-3 mt-5">
                        <Tooltip showArrow content="아이템 레벨">
                            <Card radius="sm" shadow="sm" isBlurred>
                                <CardBody className="px-3 py-1">
                                    <div className="flex items-center gap-1">
                                        <ItemLevelIcon size={34}/>
                                        <p className="text-3xl font-bold">{info.profile.itemLevel.toFixed(2)}</p>
                                    </div>
                                </CardBody>
                            </Card>
                        </Tooltip>
                        {info.profile.emblems.map((emblem, idx) => (
                            <img key={idx} src={emblem} alt={`emblem-${idx}`} className="w-[40px] h-[40px]"/>
                        ))}
                    </div>
                </div>
                <div className="flex sm:hidden p-5 flex-col z-1 h-[300px] bg-gradient-to-r from-[#15181d] via-[#15181d]/25 to-transparent">
                    <div className="flex gap-2">
                        <Chip color="secondary" variant="solid" radius="sm">{info.profile.server}</Chip>
                        <Chip color="warning" variant="solid" radius="sm">{info.profile.className}</Chip>
                    </div>
                    <Chip
                        color="primary"
                        variant="solid"
                        radius="sm"
                        className={clsx('mt-2', info.profile.arkpassiveTitle ? 'flex' : 'hidden')}>
                        {info.profile.arkpassiveTitle}
                    </Chip>
                    <p className="text-[#dddddd] text-sm mt-4 flex items-center gap-1">
                        <TitleIcon title={title} className="mr-1 h-[1em] w-[1em] scale-[1.75]"/>
                        <span>
                            <span className={titleClassName}>{title}</span>
                            {info.profile.guildName !== '-' ? ` · ${info.profile.guildName} 길드` : ''}
                        </span>
                    </p>
                    {isBadge ? (
                        <div className="flex gap-2 items-center">
                            <div className="tag-container-mobile mt-2">
                                <div className="flex">
                                    <span className="battletag">{info.nickname}</span>
                                    <div className="empty-box-mobile"></div>
                                </div>
                                <span className="tail-wrapper">
                                    <span className="tail-box-mobile"></span>
                                </span>
                            </div>
                            <Tooltip showArrow content="후원자 뱃지">
                                <div className="supporter-badge-emblem supporter-badge-emblem-mobile" aria-label="후원자 뱃지">
                                    <VegaIcon className="supporter-badge-icon"/>
                                </div>
                            </Tooltip>
                        </div>
                    ) : <p className="text-xl font-bold text-white">{info.nickname}</p>}
                    <div className="grow w-full flex items-end mt-5">
                        <div className="grow grid grid-cols-[75px_1fr] gap-y-1.5">
                            <p className="fadedtext text-sm">아이템 레벨</p>
                            <p className="text-sm text-white">{info.profile.itemLevel.toLocaleString()}</p>
                            <p className="fadedtext text-sm">전투 레벨</p>
                            <p className="text-sm text-white">{info.profile.characterLevel.toLocaleString()}</p>
                            <p className="fadedtext text-sm">원정대 레벨</p>
                            <p className="text-sm text-white">{info.profile.expeditionLevel.toLocaleString()}</p>
                            <p className="fadedtext text-sm">영지</p>
                            <p className="text-sm text-white">Lv.{info.profile.townLevel} {info.profile.townName}</p>
                        </div>
                        <div className="flex gap-1">
                            {info.profile.emblems.map((emblem, idx) => (
                                <img key={idx} src={emblem} alt={`emblem-${idx}`} className="w-[28px] h-[28px]"/>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="grow hidden sm:block"/>
                <div className="absolute sm:static top-0 left-0 z-0 bg-[#15181d] sm:bg-transparent w-[100vw] sm:w-[440px] h-full sm:h-[300px] overflow-hidden sm:[mask-image:linear-gradient(to_right,transparent,black,black,black)] lg1280:[mask-image:linear-gradient(to_right,transparent,black,black,transparent)]">
                    <img
                        src={info.profile.characterImageUrl}
                        alt="character-image"
                        className={clsx(
                            "w-[100vw] h-[500px] object-cover scale-130 origin-top",
                            isMobile ? "translate-x-[20%]" : "",
                            upperClass.includes(info.profile.className) ? "translate-y-[-28%]" : "translate-y-[-13%]"
                        )}/>
                </div>
            </div>
        </div>
    )
}
