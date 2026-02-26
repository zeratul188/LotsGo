import { useEffect, useState } from "react"
import { CharacterFile } from "../lib/characterFeat"
import { getColorByProgress, getCompleteMaxPoint, getCompletePoint, getProgressData, loadCollects, loadHobbys, loadItems } from "../lib/pointFeat"
import { Card, CardBody, CardFooter, CardHeader, Divider, Popover, PopoverContent, PopoverTrigger, Progress, Switch } from "@heroui/react"
import CheckIcon from "@/Icons/CheckIcon"
import clsx from "clsx"
import { getBackgroundByGrade, getColorTextByGrade, useMobileQuery } from "@/utiils/utils"
import { getTextAttack } from "../lib/skillFeat"
import { Collect, CollectEquipment, Hobby } from "../model/types"

// 수집품 컴포넌트
type PointComponentProps = {
    file: CharacterFile
}
export function PointComponent({ file }: PointComponentProps) {
    const [collects, setCollects] = useState<Collect[]>([]);
    const [hobbys, setHobbys] = useState<Hobby[]>([]);
    const [collectEquipments, setCollectEquipments] = useState<CollectEquipment[]>([]);
    const [isSelected, setSelected] = useState(false);
    const isMobile = useMobileQuery();

    useEffect(() => {
        loadCollects(file.collects, setCollects);
    }, [file.collects]);
    useEffect(() => {
        loadHobbys(file.profile, setHobbys);
    }, [file.profile]);
    useEffect(() => {
        loadItems(file.equipment, setCollectEquipments);
    }, [file.equipment]);

    return (
        <div className="w-full">
            <Card fullWidth radius="sm" className="mb-8">
                <CardBody>
                    <div className="w-full flex flex-col md960:flex-row gap-3 md960:gap-5 items-center">
                        <div className="w-full md960:w-[280px]">
                            <Progress
                                label="전체 진행도"
                                showValueLabel
                                radius="sm"
                                value={getProgressData(collects)}
                                maxValue={collects.length*100}
                                color={getColorByProgress(getProgressData(collects), collects.length*100)}/>
                            <Switch 
                                isSelected={isSelected}
                                onValueChange={setSelected}
                                size="sm" 
                                className="min-w-full mt-4 md960:mt-2">미달성 항목만 보기</Switch>
                        </div>
                        <Divider orientation={isMobile ? 'horizontal' : "vertical"} className="md960:h-[65px]"/>
                        <div className="w-full md960:w-[max-content] grow grid grid-cols-2 gap-3">
                            {hobbys.map((hobby, index) => (
                                <div key={index}>
                                    <div className="w-full flex gap-1 mb-1 text-sm">
                                        <p className="grow">{hobby.type}</p>
                                        <p>{hobby.point}</p>
                                    </div>
                                    <Progress
                                        size="sm"
                                        color="warning"
                                        value={hobby.point}
                                        maxValue={hobby.maxPoint}/>
                                </div>
                            ))}
                        </div>
                        <Divider orientation={isMobile ? 'horizontal' : "vertical"} className="md960:h-[65px]"/>
                        <div className="w-full md960:w-[200px]">
                            <Popover showArrow disableAnimation>
                                <PopoverTrigger>
                                    <div className="w-full flex items-center gap-2 cursor-pointer">
                                        <div className={`w-[32px] h-[32px] p-[1px] aspect-square rounded-md ${getBackgroundByGrade(collectEquipments.length > 0 ? collectEquipments[0].grade : "")}`}>
                                            {collectEquipments.length > 0 ? (
                                                <img
                                                    src={collectEquipments[0].icon}
                                                    alt="수집형 아이템 1"
                                                    className="w-[26px] h-[26px]"/>
                                            ) : <></>}
                                        </div>
                                        <div>
                                            <p className={`w-full text-[11pt] truncate ${getColorTextByGrade(collectEquipments.length > 0 ? collectEquipments[0].grade : "")}`}>{collectEquipments.length > 0 ? `${collectEquipments[0].grade} ${collectEquipments[0].type}` : '-'}</p>
                                            <p className="fadedtext text-[9pt]">{getTextAttack(collectEquipments.length > 0 ? collectEquipments[0].grade : "")}</p>
                                        </div>
                                    </div>
                                </PopoverTrigger>
                                <PopoverContent className="backdrop-blur-lg bg-white/70 dark:bg-[#141414]/70">
                                    <div className="max-w-[240px] pt-2 pl-1 pr-1 pb-2">
                                        <ul className="list-disc pl-4">
                                            {collectEquipments.length > 0 ? collectEquipments[0].descriptions.map((line, idx) => (
                                                <li key={idx}>{line}</li>
                                            )) : ''}
                                        </ul>
                                    </div>
                                </PopoverContent>
                            </Popover>
                            <Popover showArrow disableAnimation>
                                <PopoverTrigger>
                                    <div className="w-full flex items-center gap-2 cursor-pointer mt-1">
                                        <div className={`w-[32px] h-[32px] p-[1px] aspect-square rounded-md ${getBackgroundByGrade(collectEquipments.length > 1 ? collectEquipments[1].grade : "-")}`}>
                                            {collectEquipments.length > 1 ? (
                                                <img
                                                    src={collectEquipments[1].icon}
                                                    alt="수집형 아이템 2"
                                                    className="w-[26px] h-[26px]"/>
                                            ) : <></>}
                                        </div>
                                        <div>
                                            <p className={`w-full text-[11pt] truncate ${getColorTextByGrade(collectEquipments.length > 1 ? collectEquipments[1].grade : "")}`}>{collectEquipments.length > 1 ? `${collectEquipments[1].grade} ${collectEquipments[1].type}` : '-'}</p>
                                            <p className="fadedtext text-[9pt]">{getTextAttack(collectEquipments.length > 1 ? collectEquipments[1].grade : "-")}</p>
                                        </div>
                                    </div>
                                </PopoverTrigger>
                                <PopoverContent className="backdrop-blur-lg bg-white/70 dark:bg-[#141414]/70">
                                    <div className="max-w-[240px] pt-2 pl-1 pr-1 pb-2">
                                        <ul className="list-disc pl-4">
                                            {collectEquipments.length > 1 ? collectEquipments[1].descriptions.map((line, idx) => (
                                                <li key={idx}>{line}</li>
                                            )) : ''}
                                        </ul>
                                    </div>
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>
                </CardBody>
            </Card>
            <DetailComponent collects={collects} isSelected={isSelected}/>
        </div>
    )
}

// 수집품 상세 컴포넌트
type DetailComponentProps = {
    collects: Collect[],
    isSelected: boolean
}
export function DetailComponent({ collects, isSelected }: DetailComponentProps) {
    return (
        <div className="w-full grid grid-cols-1 sm:grid-cols-3 md960:grid-cols-5 gap-4">
            {collects.map((collect, index) => (
                <Card radius="sm" key={index} className={clsx(
                    isSelected && getCompletePoint(collect) === getCompleteMaxPoint(collect) ? 'hidden' : 'flex'
                )}>
                    <CardHeader>
                        <div className="w-full">
                            <div className="w-full flex gap-2 items-center">
                                <img src={collect.icon} alt={collect.type} className="w-6 h-6"/>
                                <p className="grow text-md">{collect.type}</p>
                                <p className="fadedtext text-sm">{getCompletePoint(collect)} / {getCompleteMaxPoint(collect)}</p>
                            </div>
                            <Progress
                                size="sm"
                                color={getColorByProgress(getCompletePoint(collect), getCompleteMaxPoint(collect))}
                                value={getCompletePoint(collect)}
                                maxValue={getCompleteMaxPoint(collect)}
                                className="mt-2"/>
                        </div>
                    </CardHeader>
                    <Divider/>
                    <CardBody>
                        <div className="w-full max-h-[500px] overflow-y-auto scrollbar-hide">
                            {collect.items.map((item, idx) => (
                                <div key={idx} className={clsx(
                                    "w-full flex gap-2 mb-2",
                                    isSelected && item.point >= item.maxPoint ? 'hidden' : 'block'
                                )}>
                                    <p className={clsx(
                                        "grow text-sm",
                                        item.point >= item.maxPoint ? 'fadedtext' : ''
                                    )}>{item.name}</p>
                                    {item.maxPoint === 1 ? <></> : (
                                        <p className={clsx(
                                            "text-sm",
                                            item.point >= item.maxPoint ? 'fadedtext' : ''
                                        )}>{item.point} / {item.maxPoint}</p>
                                    )}
                                    {item.point >= item.maxPoint ? <div className="w-4 h-4"><CheckIcon/></div> : <></>}
                                </div>
                            ))}
                        </div>
                    </CardBody>
                    <Divider/>
                    <CardFooter>
                        {getCompletePoint(collect) === getCompleteMaxPoint(collect) ? (
                            <p className="text-sm text-green-600 dark:text-green-400">모든 수집품을 획득하였습니다.</p>
                        ) : <p className="text-sm fadedtext">{getCompleteMaxPoint(collect) - getCompletePoint(collect)}개 남음</p>}
                    </CardFooter>
                </Card>
            ))}
        </div>
    )
}