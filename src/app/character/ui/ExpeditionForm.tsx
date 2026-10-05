import clsx from "clsx";
import { getBgColorByLevels, getBorderColorByLevel, getCountByLevel, getServerNames, handleSelectCharacter } from "../lib/expeditionFeat"
import data from "@/data/characters/data.json";
import { Card, CardBody, Chip } from "@heroui/react";
import { ExpeditionCharacterInfo } from "../model/types";
import SupportorIcon from "@/Icons/SupportorIcon";
import AttackIcon from "@/Icons/AttackIcon";
import JobEmblemIcon from "@/Icons/JobEmblemIcon";

type ExpeditionComponentProps = {
    expeditions: ExpeditionCharacterInfo[]
}

function ExpeditionCharacterTable({ server, characters, columnIndex }: {
    server: string;
    characters: ExpeditionCharacterInfo[];
    columnIndex?: number;
}) {
    return (
        <table className={clsx(
            "w-full table-fixed text-left",
            columnIndex !== undefined && columnIndex > 0 && "border-t border-default-200/80 xl:border-l xl:border-t-0 dark:border-white/10"
        )}>
            <caption className="sr-only">{server} 원정대 캐릭터 목록{columnIndex !== undefined ? ` ${columnIndex + 1}` : ''}</caption>
            <colgroup>
                <col className="w-1"/>
                <col className="w-[38%]"/>
                <col className="w-[19%]"/>
                <col className="w-[20%]"/>
                <col/>
            </colgroup>
            <thead className="bg-default-50/70 text-xs text-default-500 dark:bg-white/[0.03]">
                <tr>
                    <th scope="col" className="p-0"><span className="sr-only">레벨 구간</span></th>
                    <th scope="col" className="px-3 py-3 font-medium">캐릭터 닉네임</th>
                    <th scope="col" className="px-2 py-3 text-right font-medium">아이템 레벨</th>
                    <th scope="col" className="px-2 py-3 font-medium">클래스</th>
                    <th scope="col" className="px-3 py-3 text-right font-medium">전투력</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-default-100 dark:divide-white/[0.06]">
                {characters.map((character) => (
                    <tr
                        key={`${character.server}-${character.nickname}`}
                        tabIndex={0}
                        onClick={() => handleSelectCharacter(character.nickname)}
                        onKeyDown={(event) => {
                            if (event.key === 'Enter' || event.key === ' ') {
                                event.preventDefault();
                                handleSelectCharacter(character.nickname);
                            }
                        }}
                        className="cursor-pointer transition-colors hover:bg-default-50/80 focus-visible:bg-default-50/80 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary dark:hover:bg-white/[0.04] dark:focus-visible:bg-white/[0.04]"
                    >
                        <td aria-hidden="true" className={clsx("p-0", getBgColorByLevels(character.level))}/>
                        <td className="px-3 py-2.5">
                            <div className="flex min-w-0 items-center gap-2">
                                <JobEmblemIcon job={character.job} size={26}/>
                                <span className="min-w-0 truncate text-sm font-semibold">{character.nickname}</span>
                            </div>
                        </td>
                        <td className="px-2 py-2.5 text-right text-sm font-medium tabular-nums">{character.level.toLocaleString()}</td>
                        <td className="truncate px-2 py-2.5 text-sm text-default-600 dark:text-default-300">{character.job}</td>
                        <td className={clsx(
                            "px-3 py-2.5 text-right text-sm font-semibold tabular-nums",
                            character.combatPower <= 0 ? 'text-default-400' : character.type === 'supportor' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                        )}>
                            <span className="inline-flex items-center justify-end gap-1">
                                {character.type === 'supportor' ? <SupportorIcon size={14}/> : <AttackIcon size={12}/>}
                                <span>{character.combatPower > 0 ? character.combatPower.toLocaleString(undefined, { maximumFractionDigits: 2 }) : '정보 없음'}</span>
                            </span>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}

export function ExpeditionsComponent({ expeditions }: ExpeditionComponentProps) {
    const serverNames = getServerNames(expeditions);
    const topLevelCharacters = [...expeditions].sort((a, b) => b.level - a.level).slice(0, 6);
    const getAverage = (values: number[]) => values.length > 0
        ? values.reduce((sum, value) => sum + value, 0) / values.length
        : 0;
    const averageLevel = getAverage(expeditions.map((character) => character.level));
    const topAverageLevel = getAverage(topLevelCharacters.map((character) => character.level));
    const averageCombatPower = getAverage(expeditions.map((character) => character.combatPower));
    const topAverageCombatPower = getAverage(topLevelCharacters.map((character) => character.combatPower));
    const topCharacterLabel = `레벨 상위 ${topLevelCharacters.length}개`;

    return (
        <div className="w-full space-y-6">
            <section className="rounded-xl border border-default-200/80 bg-content1 shadow-sm dark:border-white/10 dark:bg-[#171717] dark:shadow-none">
                <div className="flex flex-col gap-5 px-4 py-4 sm:px-5 md960:flex-row md960:items-center md960:justify-between">
                    <div className="flex min-w-0 items-center gap-3">
                        <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 shrink-0 text-default-500" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="8" r="3"/><path d="M3.5 20v-2a5.5 5.5 0 0 1 11 0v2M17 5a3 3 0 0 1 0 6M17 14a5 5 0 0 1 3.5 5v1"/></svg>
                        <div className="min-w-0">
                            <h2 className="text-base font-semibold tracking-tight sm:text-lg">원정대 캐릭터</h2>
                            <p className="mt-0.5 text-xs text-default-500">서버별 캐릭터의 아이템 레벨과 전투력을 확인하세요.</p>
                        </div>
                    </div>
                    <div className="grid gap-4 border-t border-default-200/80 pt-4 dark:border-white/10 sm:grid-cols-2 md960:gap-0 md960:border-t-0 md960:pt-0">
                        <div className="min-w-0 md960:border-l md960:border-default-200/80 md960:px-5 dark:md960:border-white/10">
                            <p className="text-xs font-medium text-default-500">캐릭터 평균 레벨</p>
                            <div className="mt-1 space-y-0.5">
                                <div className="flex items-center justify-between gap-4">
                                    <span className="text-[10px] text-default-400">전체 {expeditions.length}개</span>
                                    <span className="text-xs font-semibold tabular-nums">{averageLevel.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                                </div>
                                <div className="flex items-center justify-between gap-4">
                                    <span className="text-[10px] text-default-400">{topCharacterLabel}</span>
                                    <span className="text-xs font-semibold tabular-nums">{topAverageLevel.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                                </div>
                            </div>
                        </div>
                        <div className="min-w-0 md960:border-l md960:border-default-200/80 md960:px-5 dark:md960:border-white/10">
                            <p className="text-xs font-medium text-default-500">캐릭터 평균 전투력</p>
                            <div className="mt-1 space-y-0.5">
                                <div className="flex items-center justify-between gap-4">
                                    <span className="text-[10px] text-default-400">전체 {expeditions.length}개</span>
                                    <span className="text-xs font-semibold tabular-nums">{averageCombatPower.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                                </div>
                                <div className="flex items-center justify-between gap-4">
                                    <span className="text-[10px] text-default-400">{topCharacterLabel}</span>
                                    <span className="text-xs font-semibold tabular-nums">{topAverageCombatPower.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            {serverNames.map((server) => {
                const serverCharacters = expeditions
                    .filter((character) => character.server === server)
                    .sort((a, b) => b.level - a.level);
                const characterColumns = [
                    serverCharacters.filter((_, index) => index % 2 === 0),
                    serverCharacters.filter((_, index) => index % 2 === 1),
                ];

                return (
                <section key={server} className="overflow-hidden rounded-2xl border border-default-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#171717]">
                    <div className="border-b border-default-200 px-4 py-4 dark:border-white/10 sm:px-5">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h3 className="text-lg font-bold">{server}</h3>
                                <p className="text-xs text-default-500">등록 캐릭터 {serverCharacters.length}명</p>
                            </div>
                            <div className="flex max-w-full min-w-0 items-center divide-x divide-default-200/80 overflow-x-auto scrollbar-hide dark:divide-white/10 sm:justify-end">
                                {data.levels.map((item, idx) => {
                                    const count = getCountByLevel(item.level, idx === 0 ? 9999 : data.levels[idx-1].level, serverCharacters);
                                    if (count === 0) return null;
                                    return (
                                        <div key={item.level} className="flex shrink-0 items-center gap-1.5 px-2.5 first:pl-0 last:pr-0">
                                            <span aria-hidden="true" className={clsx("h-2 w-2 shrink-0 rounded-full", getBgColorByLevels(item.level))}/>
                                            <span className="text-xs font-medium tabular-nums text-foreground">{item.level}+</span>
                                            <span className="text-xs tabular-nums text-default-500">{count}명</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                    <div className="hidden md960:block">
                        <div className="xl:hidden">
                            <ExpeditionCharacterTable server={server} characters={serverCharacters}/>
                        </div>
                        <div className="hidden xl:grid xl:grid-cols-2">
                            {characterColumns.map((characters, columnIndex) => (
                                <ExpeditionCharacterTable
                                    key={`${server}-character-column-${columnIndex}`}
                                    server={server}
                                    characters={characters}
                                    columnIndex={columnIndex}
                                />
                            ))}
                        </div>
                    </div>
                    <div className="grid w-full grid-cols-1 gap-3 p-4 sm:grid-cols-2 sm:p-5 md960:hidden">
                        {serverCharacters.map((character) => (
                            <Card 
                                key={`${character.server}-${character.nickname}`}
                                radius="lg"
                                isPressable
                                fullWidth
                                className={clsx(
                                    "group border-2 bg-white text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:bg-white/[0.035]",
                                    getBorderColorByLevel(character.level)
                                )}
                                onPress={() => handleSelectCharacter(character.nickname)}>
                                <CardBody className="p-3.5">
                                    <div className="flex w-full items-center gap-3">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-default-100 transition-colors group-hover:bg-primary/10 dark:bg-white/[0.06]">
                                            <JobEmblemIcon job={character.job} size={34}/>
                                        </div>
                                        <div className="min-w-0 grow">
                                            <p className="truncate text-sm font-bold">{character.nickname}</p>
                                            <div className="mt-1 flex min-w-0 items-center gap-2">
                                                <Chip size="sm" radius="full" variant="flat" className={clsx("h-5 shrink-0 font-semibold", getBgColorByLevels(character.level))}>
                                                    Lv.{character.level.toLocaleString()}
                                                </Chip>
                                                <p className="truncate text-xs text-default-500">{character.job}</p>
                                            </div>
                                        </div>
                                        <div className="ml-auto shrink-0 text-right">
                                            <div className="flex items-center justify-end gap-1 text-[11px] text-default-400">
                                            {character.type === 'supportor' ? <SupportorIcon size={14}/> : <AttackIcon size={12}/>}
                                                <span>전투력</span>
                                            </div>
                                            <p className={clsx(
                                                "mt-0.5 text-sm font-bold tabular-nums",
                                                character.combatPower <= 0 ? 'text-default-400' : character.type === 'supportor' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                                            )}>
                                                {character.combatPower > 0 ? character.combatPower.toLocaleString(undefined, { maximumFractionDigits: 2 }) : '정보 없음'}
                                            </p>
                                        </div>
                                        <span className="shrink-0 text-xs text-default-400 transition-transform group-hover:translate-x-0.5">›</span>
                                    </div>
                                </CardBody>
                            </Card>
                        ))}
                    </div>
                </section>
                );
            })}
        </div>
    )
}
