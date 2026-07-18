import { Card, CardBody, Tooltip } from "@heroui/react"
import clsx from "clsx"
import { getBackgroundByGrade, getColorTextByGrade } from "@/utiils/utils"
import { getColorByType, getCore, getGem, getOtherOptions, getPoint, getPower } from "../lib/arkGridPrints"
import { ArkGridGem, CharacterInfo, Core } from "../model/types"

function ArkGridGemSlot({ gem }: { gem: ArkGridGem | undefined }) {
    if (!gem) {
        return (
            <div className="flex min-h-[76px] items-center gap-3 rounded-xl border border-dashed border-default-300/80 bg-default-50/40 px-3 py-2.5 dark:border-white/15 dark:bg-white/[0.015]">
                <div className="h-10 w-10 shrink-0 rounded-lg border border-dashed border-default-300 bg-default-100/70 dark:border-white/15 dark:bg-white/[0.04]" />
                <div>
                    <p className="text-sm font-medium text-default-400">빈 젬 슬롯</p>
                    <p className="mt-0.5 text-[11px] text-default-400">장착된 아크 그리드 젬이 없습니다.</p>
                </div>
            </div>
        );
    }

    const otherOptions = getOtherOptions(gem.options);

    return (
        <div className="min-h-[76px] rounded-xl border border-default-200/80 bg-default-50/70 px-3 py-2.5 dark:border-white/10 dark:bg-white/[0.025]">
            <div className="flex items-center gap-2.5">
                <div className={clsx("h-10 w-10 shrink-0 rounded-lg p-[3px]", getBackgroundByGrade(gem.grade))}>
                    <img src={gem.icon} alt={gem.name} className="h-full w-full rounded-md object-cover" />
                </div>
                <div className="min-w-0 grow">
                    <p className={clsx("truncate text-sm font-semibold", getColorTextByGrade(gem.grade))}>{gem.name}</p>
                    <p className="mt-0.5 text-[11px] text-default-500">{gem.grade} 아크 그리드 젬</p>
                </div>
                <Tooltip showArrow content={gem.isActive ? '활성화' : '비활성화'}>
                    <span
                        aria-label={gem.isActive ? '활성화' : '비활성화'}
                        className={gem.isActive ? 'h-2.5 w-2.5 shrink-0 rounded-full bg-success' : 'h-2.5 w-2.5 shrink-0 rounded-full bg-danger'}
                    />
                </Tooltip>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-1.5 pl-[50px]">
                <Tooltip showArrow content="의지력 효율">
                    <span className="cursor-help rounded-md bg-danger-50 px-2 py-1 text-[11px] font-medium text-danger dark:bg-danger-500/10">
                        의지력 {getPower(gem.options)}
                    </span>
                </Tooltip>
                <Tooltip showArrow content="질서 혹은 혼돈 포인트">
                    <span className="cursor-help rounded-md bg-primary-50 px-2 py-1 text-[11px] font-medium text-primary dark:bg-primary-500/10">
                        포인트 {getPoint(gem.options)}
                    </span>
                </Tooltip>
                {otherOptions.map((option, index) => (
                    <span key={index} className="rounded-md bg-default-100 px-2 py-1 text-[11px] text-default-600 dark:bg-white/[0.06] dark:text-default-300">
                        {option}
                    </span>
                ))}
            </div>
        </div>
    );
}

function ArkGridCoreCard({ core, slotIndex }: { core: Core | undefined; slotIndex: number }) {
    const effects = core?.effects ?? [];

    return (
        <Card radius="lg" shadow="sm" className="border border-default-200/80 bg-content1/95 dark:border-white/10 dark:bg-[#18181b]">
            <CardBody className="p-4 sm:p-5">
                <div className="grid min-w-0 grid-cols-1 gap-4 md960:grid-cols-[minmax(0,1fr)_minmax(360px,0.8fr)] md960:gap-5">
                    <section className="min-w-0">
                        <div className="flex min-w-0 items-center gap-3">
                            <div className={clsx(
                                "h-14 w-14 shrink-0 rounded-xl p-1",
                                core ? getBackgroundByGrade(core.grade) : "border border-dashed border-default-300 bg-default-100 dark:border-white/15 dark:bg-white/[0.04]"
                            )}>
                                {core ? <img src={core.icon} alt={core.name} className="h-full w-full rounded-lg object-cover" /> : null}
                            </div>
                            <div className="min-w-0 grow">
                                <p className="text-[11px] font-medium text-default-400">코어 슬롯 {slotIndex + 1}</p>
                                <h3 className={clsx("mt-0.5 truncate text-base font-semibold", getColorTextByGrade(core?.grade ?? ''))}>{core?.name ?? '장착된 코어 없음'}</h3>
                                <p className="mt-0.5 text-xs text-default-500">{core ? `${core.grade} 아크 그리드 코어` : '비어 있는 코어 슬롯'}</p>
                            </div>
                            <div className="shrink-0 rounded-xl bg-warning-50 px-3 py-2 text-center text-warning-700 dark:bg-warning-500/10 dark:text-warning-300">
                                <p className="text-[10px] font-medium">포인트 합산</p>
                                <p className="mt-0.5 text-xl font-bold leading-none tabular-nums">{core?.point ?? 0}<span className="ml-0.5 text-xs font-semibold">P</span></p>
                            </div>
                        </div>

                        <div className="mt-4 rounded-xl border border-default-200/70 bg-default-50/50 p-3 dark:border-white/10 dark:bg-white/[0.02] sm:p-4">
                            <div className="mb-3 flex items-center justify-between gap-2">
                                <p className="text-sm font-semibold">코어 단계 효과</p>
                                <p className="text-[11px] text-default-400">필요 포인트 기준</p>
                            </div>
                            {effects.length > 0 ? (
                                <div className="flex flex-col gap-2.5">
                                    {effects.map((effect) => {
                                        const isUnlocked = (core?.point ?? 0) >= effect.point;

                                        return (
                                            <div
                                                key={effect.point}
                                                className={clsx(
                                                    "grid grid-cols-[44px_minmax(0,1fr)] items-start gap-2.5 rounded-lg px-2.5 py-2 transition-colors",
                                                    isUnlocked ? "bg-content1/80 dark:bg-white/[0.035]" : "bg-default-100/50 opacity-60 grayscale dark:bg-white/[0.02]"
                                                )}
                                            >
                                                <span className={clsx(
                                                    "rounded-md px-1.5 py-1 text-center text-[11px] font-bold tabular-nums",
                                                    isUnlocked ? "bg-warning-100 text-warning-700 dark:bg-warning-500/15 dark:text-warning-300" : "bg-default-200 text-default-400 dark:bg-white/10"
                                                )}>
                                                    {effect.point}P
                                                </span>
                                                <p className={clsx(
                                                    "whitespace-pre-line text-xs leading-5",
                                                    isUnlocked ? "text-default-700 dark:text-white" : "text-default-400"
                                                )}>
                                                    {effect.description}
                                                </p>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="rounded-lg border border-dashed border-default-300/70 px-3 py-8 text-center dark:border-white/15">
                                    <p className="text-sm text-default-400">표시할 코어 단계 효과가 없습니다.</p>
                                    {core ? <p className="mt-1 text-[11px] text-default-400">정보를 갱신하면 단계 효과를 불러옵니다.</p> : null}
                                </div>
                            )}
                        </div>
                    </section>

                    <section className="min-w-0 border-t border-default-200/70 pt-4 dark:border-white/10 md960:border-l md960:border-t-0 md960:pl-5 md960:pt-0">
                        <div className="mb-3 flex items-center justify-between gap-2">
                            <div>
                                <p className="text-sm font-semibold">아크 그리드 젬</p>
                                <p className="mt-0.5 text-[11px] text-default-500">슬롯 순서대로 최대 4개까지 표시됩니다.</p>
                            </div>
                            <span className="rounded-full bg-default-100 px-2.5 py-1 text-[11px] font-semibold tabular-nums text-default-500 dark:bg-white/[0.06]">
                                {core?.gems?.length ?? 0} / 4
                            </span>
                        </div>
                        <div className="flex flex-col gap-2">
                            {Array.from({ length: 4 }).map((_, gemIndex) => (
                                <ArkGridGemSlot key={gemIndex} gem={getGem(core?.gems ?? [], gemIndex)} />
                            ))}
                        </div>
                    </section>
                </div>
            </CardBody>
        </Card>
    );
}

// 아크그리드 컴포넌트
export function ArkGridComponent({ info }: { info: CharacterInfo }) {
    const cores = info.arkgrid.cores;
    const options = [...info.arkgrid.options].sort((a, b) => b.level - a.level);

    return (
        <div className="w-full">
            <div className="mb-5 rounded-2xl border border-default-200/80 bg-content1/95 p-4 shadow-sm dark:border-white/10 dark:bg-[#18181b]">
                <div className="mb-3">
                    <p className="font-semibold">장착 중인 아크 그리드 효과</p>
                    <p className="text-xs text-default-500">현재 적용 중인 효과를 확인할 수 있습니다.</p>
                </div>
                <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2 min-[1225px]:grid-cols-3">
                    {options.map((item, index) => (
                        <div key={index} className="flex min-w-0 items-start gap-2 rounded-xl bg-default-50 px-3 py-2.5 transition-colors hover:bg-default-100 dark:bg-white/[0.04] dark:hover:bg-white/[0.08]">
                            <span className={getColorByType(item.name) === 'danger' ? 'mt-0.5 h-10 w-1 shrink-0 rounded-full bg-danger' : 'mt-0.5 h-10 w-1 shrink-0 rounded-full bg-success'} />
                            <div className="min-w-0 grow">
                                <div className="flex items-center gap-2">
                                    <p className="grow truncate text-sm font-medium">{item.name}</p>
                                    <span className="shrink-0 text-sm font-semibold tabular-nums text-default-500">Lv.{item.level}</span>
                                </div>
                                <p className="mt-1 whitespace-pre-line text-[11px] leading-4 text-default-500">{item.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div className="flex w-full flex-col gap-4">
                {Array.from({ length: 6 }).map((_, index) => (
                    <ArkGridCoreCard key={index} core={getCore(cores, index)} slotIndex={index} />
                ))}
            </div>
        </div>
    );
}
