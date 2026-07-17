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
            <section className="rounded-2xl border border-default-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#171717]">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Expedition</p>
                        <h2 className="mt-1 text-xl font-bold">원정대 캐릭터</h2>
                        <p className="mt-1 text-sm text-default-500">서버별 캐릭터의 아이템 레벨과 전투력을 확인하세요.</p>
                    </div>
                    <div className="grid gap-2 sm:grid-cols-2">
                        <div className="min-w-[220px] rounded-xl bg-default-50 px-4 py-3 dark:bg-white/[0.04]">
                            <p className="text-xs font-semibold text-default-500">캐릭터 평균 레벨</p>
                            <div className="mt-2 grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-[11px] text-default-400">전체 {expeditions.length}개</p>
                                    <p className="mt-0.5 text-lg font-bold tabular-nums">{averageLevel.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                                </div>
                                <div>
                                    <p className="text-[11px] text-primary/70">{topCharacterLabel}</p>
                                    <p className="mt-0.5 text-lg font-bold tabular-nums text-primary">{topAverageLevel.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                                </div>
                            </div>
                        </div>
                        <div className="min-w-[220px] rounded-xl bg-default-50 px-4 py-3 dark:bg-white/[0.04]">
                            <p className="text-xs font-semibold text-default-500">캐릭터 평균 전투력</p>
                            <div className="mt-2 grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-[11px] text-default-400">전체 {expeditions.length}개</p>
                                    <p className="mt-0.5 text-lg font-bold tabular-nums">{averageCombatPower.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                                </div>
                                <div>
                                    <p className="text-[11px] text-primary/70">{topCharacterLabel}</p>
                                    <p className="mt-0.5 text-lg font-bold tabular-nums text-primary">{topAverageCombatPower.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            {serverNames.map((server) => {
                const serverCharacters = expeditions.filter((character) => character.server === server);

                return (
                <section key={server} className="overflow-hidden rounded-2xl border border-default-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#171717]">
                    <div className="border-b border-default-200 px-4 py-4 dark:border-white/10 sm:px-5">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h3 className="text-lg font-bold">{server}</h3>
                                <p className="text-xs text-default-500">등록 캐릭터 {serverCharacters.length}명</p>
                            </div>
                            <div className="flex max-w-full gap-2 overflow-x-auto pb-1 scrollbar-hide sm:justify-end">
                                {data.levels.map((item, idx) => {
                                    const count = getCountByLevel(item.level, idx === 0 ? 9999 : data.levels[idx-1].level, serverCharacters);
                                    return (
                                        <Chip key={item.level} variant="flat" radius="full" className={clsx(
                                            "shrink-0 items-center px-1 font-semibold",
                                            getBgColorByLevels(item.level),
                                            count > 0 ? 'flex' : 'hidden'
                                        )}>
                                            <span>{item.level}+</span>
                                            <span className="ml-1 opacity-80">· {count}</span>
                                        </Chip>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                    <div className="grid w-full grid-cols-1 gap-3 p-4 sm:grid-cols-2 sm:p-5 md960:grid-cols-3">
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
