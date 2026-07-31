'use client'

import { Card, CardBody, CardHeader, Chip } from "@heroui/react";
import clsx from "clsx";
import type { ExpeditionCharacter } from "../characterlist/model/types";

const expeditionCardClass = "overflow-hidden border border-default-200/80 bg-content1/95 shadow-sm dark:border-white/10 dark:bg-[#18181b]";
const expeditionCardHeaderClass = "border-b border-default-200/70 px-5 py-4 dark:border-white/10";

export function ExpeditionCharacterAvatars({ expeditionCharacters }: { expeditionCharacters: ExpeditionCharacter[] }) {
    const visibleCharacters = expeditionCharacters.filter((character) => character.profile.characterImageUrl !== '-');

    return (
        <Card fullWidth radius="lg" className={clsx(expeditionCardClass, "mt-4")}>
            <CardHeader className={expeditionCardHeaderClass}>
                <div className="flex w-full items-center justify-between gap-3">
                    <div>
                        <p className="font-semibold">캐릭터 아바타</p>
                        <p className="mt-0.5 text-xs text-default-500">원정대 캐릭터의 현재 모습을 모아봅니다.</p>
                    </div>
                    <Chip size="sm" radius="full" variant="flat" color="primary">{visibleCharacters.length}명</Chip>
                </div>
            </CardHeader>
            <CardBody className="p-4 sm:p-5">
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md960:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7">
                    {visibleCharacters.map((character) => (
                        <div
                            key={character.nickname}
                            className="group relative w-full overflow-hidden rounded-2xl border border-default-200/80 bg-[#11151b] shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary-300 hover:shadow-lg dark:border-white/10 dark:hover:border-primary-500/40">
                            <div className="relative aspect-[3/5] w-full overflow-hidden">
                                <img
                                    src={character.profile.characterImageUrl}
                                    alt={character.nickname}
                                    loading="lazy"
                                    className="h-full w-full object-cover object-top transition-transform duration-300 group-hover:scale-[1.025]"/>
                                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/90 via-black/55 to-transparent"/>
                                <div className="absolute inset-x-0 bottom-0 p-2.5 text-white">
                                    <p className="truncate text-xs font-semibold">{character.nickname}</p>
                                    <div className="mt-1 flex items-center justify-between gap-1 text-[10px] text-white/65">
                                        <span className="truncate">{character.profile.className}</span>
                                        <span className="shrink-0 font-medium text-white/85">Lv.{character.profile.itemLevel.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </CardBody>
        </Card>
    )
}
