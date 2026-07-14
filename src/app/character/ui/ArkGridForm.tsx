import { getColorByType, getCore, getGem, getOtherOptions, getPoint, getPower } from "../lib/arkGridPrints"
import { Card, CardBody, CardHeader, Chip, Divider, Tooltip } from "@heroui/react"
import { getBackgroundByGrade, getColorTextByGrade } from "@/utiils/utils"
import { CharacterInfo } from "../model/types"

// 아크그리드 컴포넌트
export function ArkGridComponent( { info }: { info: CharacterInfo } ) {
    const cores = info.arkgrid.cores;
    const options = info.arkgrid.options;

    return (
        <div className="w-full">
            <div className="mb-5 rounded-2xl border border-default-200/80 bg-content1/95 p-4 shadow-sm dark:border-white/10 dark:bg-[#18181b]">
                <div className="mb-3 flex items-center justify-between gap-2">
                    <div>
                        <p className="font-semibold">장착 중인 아크 그리드 효과</p>
                        <p className="text-xs text-default-500">현재 적용 중인 효과를 확인할 수 있습니다.</p>
                    </div>
                </div>
                <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2 min-[1225px]:grid-cols-3">
                {options.sort((a, b) => b.level - a.level).map((item, index) => (
                    <Tooltip key={index} showArrow content={item.description}>
                        <div className="flex min-w-0 cursor-help items-center gap-2 rounded-xl bg-default-50 px-3 py-2.5 transition-colors hover:bg-default-100 dark:bg-white/[0.04] dark:hover:bg-white/[0.08]">
                            <span className={getColorByType(item.name) === 'danger' ? 'h-8 w-1 rounded-full bg-danger' : 'h-8 w-1 rounded-full bg-success'} />
                            <p className="grow truncate text-sm font-medium">{item.name}</p>
                            <span className="shrink-0 text-sm font-semibold tabular-nums text-default-500">Lv.{item.level}</span>
                        </div>
                    </Tooltip>
                ))}
                </div>
            </div>
            <div className="w-full grid min-[813px]:grid-cols-2 min-[1225px]:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, index) => (
                    <Card key={index} radius="lg" shadow="sm" className="border border-default-200/80 bg-content1/95 dark:border-white/10 dark:bg-[#18181b]">
                        <CardHeader className="px-4 py-4">
                            <div className="w-full flex gap-2 items-center">
                                <div className={`w-[46px] h-[46px] p-[3px] aspect-square rounded-md ${getBackgroundByGrade(getCore(cores, index)?.grade ?? '')}`}>
                                    {getCore(cores, index) ? (
                                        <img
                                            src={getCore(cores, index)?.icon ?? ''}
                                            alt="equip-icon"
                                            className="w-10 h-10"/>
                                    ) : null}
                                </div>
                                <div className="grow">
                                    <h3 className={`${getColorTextByGrade(getCore(cores, index)?.grade ?? '')} truncate text-base font-semibold`}>{getCore(cores, index)?.name ?? '-'}</h3>
                                    <p className="text-xs text-default-500">{getCore(cores, index)?.grade ?? '-'} {getCore(cores, index) ? '아크 그리드 코어' : ''}</p>
                                </div>
                                <Chip
                                    radius="sm"
                                    variant="flat"
                                    color="warning"
                                    className="min-h-[max-content] rounded-lg px-2 py-1">
                                    <div className="flex flex-col items-center leading-none">
                                        <p className="text-xl font-bold">{getCore(cores, index)?.point ?? 0}</p>
                                        <p className="text-[8pt]">Point</p>
                                    </div>
                                </Chip>
                            </div>
                        </CardHeader>
                        <Divider/>
                        <CardBody className="px-4 pb-4 pt-3">
                            <div className="w-full flex flex-col gap-2">
                                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-default-500">아크 그리드 젬</p>
                                {Array.from({ length: 4 }).map((_, idx) => (
                                    <div key={idx} className="w-full border-b border-default-200/70 pb-2 last:border-b-0 last:pb-0 dark:border-white/10">
                                        <div className="w-full flex gap-2 items-center">
                                            <div className={`w-[38px] h-[38px] p-[3px] aspect-square rounded-md ${getBackgroundByGrade(getGem(getCore(cores, index)?.gems ?? [], idx)?.grade ?? '')}`}>
                                                {getGem(getCore(cores, index)?.gems ?? [], idx) ? (
                                                    <img
                                                        src={getGem(getCore(cores, index)?.gems ?? [], idx)?.icon ?? ''}
                                                        alt="equip-icon"
                                                        className="w-8 h-8"/>
                                                ) : null}
                                            </div>
                                            <div className="min-w-0 grow">
                                                <p className={`${getColorTextByGrade(getGem(getCore(cores, index)?.gems ?? [], idx)?.grade ?? '')} truncate text-sm font-medium`}>{getGem(getCore(cores, index)?.gems ?? [], idx)?.name ?? '-'}</p>
                                                <p className="text-[11px] text-default-500">{getGem(getCore(cores, index)?.gems ?? [], idx)?.grade ?? '-'} {getGem(getCore(cores, index)?.gems ?? [], idx) ? '아크 그리드 젬' : ''}</p>
                                            </div>
                                            <div className="flex shrink-0 items-center gap-1">
                                                <Tooltip showArrow content="의지력 효율">
                                                    <span className="flex min-w-[58px] cursor-help flex-col items-center rounded-md bg-danger-50 px-1.5 py-1 text-[10px] leading-tight text-danger dark:bg-danger-500/10">
                                                        <span>의지력</span>
                                                        <strong className="text-xs tabular-nums">{getPower(getGem(getCore(cores, index)?.gems ?? [], idx)?.options ?? [])}</strong>
                                                    </span>
                                                </Tooltip>
                                                <Tooltip showArrow content="질서 혹은 혼돈 포인트">
                                                    <span className="flex min-w-[58px] cursor-help flex-col items-center rounded-md bg-primary-50 px-1.5 py-1 text-[10px] leading-tight text-primary dark:bg-primary-500/10">
                                                        <span>포인트</span>
                                                        <strong className="text-xs tabular-nums">{getPoint(getGem(getCore(cores, index)?.gems ?? [], idx)?.options ?? [])}</strong>
                                                    </span>
                                                </Tooltip>
                                            </div>
                                            <Tooltip showArrow content={getGem(getCore(cores, index)?.gems ?? [], idx)?.isActive ?? false ? '활성화' : '비활성화'}>
                                                <span
                                                    aria-label={getGem(getCore(cores, index)?.gems ?? [], idx)?.isActive ?? false ? '활성화' : '비활성화'}
                                                    className={getGem(getCore(cores, index)?.gems ?? [], idx)?.isActive ?? false ? 'h-2.5 w-2.5 rounded-full bg-success' : 'h-2.5 w-2.5 rounded-full bg-danger'}
                                                />
                                            </Tooltip>
                                        </div>
                                        {(getGem(getCore(cores, index)?.gems ?? [], idx)?.options ?? []).length > 0 ? (
                                            <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 pl-[46px] text-xs">
                                                {getOtherOptions(getGem(getCore(cores, index)?.gems ?? [], idx)?.options ?? []).map((item, ix) => (
                                                    <p key={ix} className="leading-5 text-default-600 dark:text-default-300"><span className="mr-1 text-default-400">•</span>{item}</p>
                                                ))}
                                            </div>
                                        ) : null}
                                    </div>
                                ))}
                            </div>
                        </CardBody>
                    </Card>
                ))}
            </div>
        </div>
    )
}
