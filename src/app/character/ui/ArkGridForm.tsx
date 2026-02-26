import { useEffect, useState } from "react"
import { CharacterFile } from "../lib/characterFeat"
import { ArkGridOption, Core, getColorByType, getCore, getGem, getOtherOptions, getPoint, getPower, loadArkGrid } from "../lib/arkGridPrints"
import { Card, CardBody, CardHeader, Chip, Divider, Tooltip } from "@heroui/react"
import { getBackgroundByGrade, getColorTextByGrade } from "@/utiils/utils"

// 아크그리드 컴포넌트
type ArkGridComponentProps = {
    file: CharacterFile
}
export function ArkGridComponent( { file }: ArkGridComponentProps ) {
    const [cores, setCores] = useState<Core[]>([]);
    const [options, setOptions] = useState<ArkGridOption[]>([]);

    useEffect(() => {
        loadArkGrid(file.arkGrid, setCores, setOptions);
    }, [file.arkGrid]);

    return (
        <div className="w-full">
            <p className="fadedtext mb-2">장착 중인 아크 그리드 효과</p>
            <div className="w-full flex flex-wrap gap-2 mb-4">
                {options.sort((a, b) => b.level - a.level).map((item, index) => (
                    <Tooltip key={index} showArrow content={item.description}>
                        <Chip
                            radius="sm"
                            variant="flat"
                            color={getColorByType(item.name)}>
                            {item.name} Lv.{item.level}
                        </Chip>
                    </Tooltip>
                ))}
            </div>
            <div className="w-full grid min-[813px]:grid-cols-2 min-[1225px]:grid-cols-3 gap-3">
                {Array.from({ length: 6 }).map((_, index) => (
                    <Card key={index} radius="sm" shadow="sm">
                        <CardHeader>
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
                                    <h3 className={`${getColorTextByGrade(getCore(cores, index)?.grade ?? '')} text-lg`}>{getCore(cores, index)?.name ?? '-'}</h3>
                                    <p className="fadedtext text-sm">{getCore(cores, index)?.grade ?? '-'} {getCore(cores, index) ? '아크 그리드 코어' : ''}</p>
                                </div>
                                <Chip
                                    radius="sm"
                                    variant="flat"
                                    color="warning"
                                    className="min-h-[max-content] pt-0.5 pb-1.5">
                                    <div className="flex flex-col items-center leading-none">
                                        <p className="text-xl font-bold">{getCore(cores, index)?.point ?? 0}</p>
                                        <p className="text-[8pt]">Point</p>
                                    </div>
                                </Chip>
                            </div>
                        </CardHeader>
                        <Divider/>
                        <CardBody>
                            <div className="w-full flex flex-col gap-2">
                                <p className="fadedtext text-sm">아크 그리드 젬</p>
                                {Array.from({ length: 4 }).map((_, idx) => (
                                    <div key={idx} className="w-full">
                                        <div className="w-full flex gap-2 items-center">
                                            <div className={`w-[38px] h-[38px] p-[3px] aspect-square rounded-md ${getBackgroundByGrade(getGem(getCore(cores, index)?.gems ?? [], idx)?.grade ?? '')}`}>
                                                {getGem(getCore(cores, index)?.gems ?? [], idx) ? (
                                                    <img
                                                        src={getGem(getCore(cores, index)?.gems ?? [], idx)?.icon ?? ''}
                                                        alt="equip-icon"
                                                        className="w-8 h-8"/>
                                                ) : null}
                                            </div>
                                            <div className="grow">
                                                <p className={`${getColorTextByGrade(getGem(getCore(cores, index)?.gems ?? [], idx)?.grade ?? '')}`}>{getGem(getCore(cores, index)?.gems ?? [], idx)?.name ?? '-'}</p>
                                                <p className="fadedtext text-[8pt]">{getGem(getCore(cores, index)?.gems ?? [], idx)?.grade ?? '-'} {getGem(getCore(cores, index)?.gems ?? [], idx) ? '아크 그리드 젬' : ''}</p>
                                            </div>
                                            <Tooltip showArrow content="의지력 효율">
                                                <Chip
                                                    radius="full"
                                                    size="sm"
                                                    variant="flat"
                                                    color="danger">
                                                    {getPower(getGem(getCore(cores, index)?.gems ?? [], idx)?.options ?? [])}
                                                </Chip>
                                            </Tooltip>
                                            <Tooltip showArrow content="질서 혹은 혼돈 포인트">
                                                <Chip
                                                    radius="full"
                                                    size="sm"
                                                    variant="flat"
                                                    color="primary">
                                                    {getPoint(getGem(getCore(cores, index)?.gems ?? [], idx)?.options ?? [])}
                                                </Chip>
                                            </Tooltip>
                                            <Chip
                                                variant="flat"
                                                size="sm"
                                                color={getGem(getCore(cores, index)?.gems ?? [], idx)?.isActive ?? false ? 'success' : 'danger'}>
                                                {getGem(getCore(cores, index)?.gems ?? [], idx)?.isActive ?? false ? '활성화' : '비활성화'}
                                                {getGem(getCore(cores, index)?.gems ?? [], idx)?.isActive}
                                            </Chip>
                                        </div>
                                        {(getGem(getCore(cores, index)?.gems ?? [], idx)?.options ?? []).length > 0 ? (
                                            <div className="mt-2 flex gap-2">
                                                {getOtherOptions(getGem(getCore(cores, index)?.gems ?? [], idx)?.options ?? []).map((item, ix) => (
                                                    <Chip key={ix} radius="sm" size="sm" variant="flat">{item}</Chip>
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