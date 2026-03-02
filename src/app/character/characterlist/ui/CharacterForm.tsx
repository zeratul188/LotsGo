import { Chip, Divider, Popover, PopoverContent, PopoverTrigger, Progress, Tooltip } from "@heroui/react";
import { ExpeditionCharacter } from "../model/types";
import { getEnhanceLevel } from "../lib/characterInfoFeat";
import clsx from "clsx";
import { getBackgroundByGrade, getColorTextByGrade } from "@/utiils/utils";
import { getColorByType, getCountAtkGems, getCountDekGems, getEngravingSrcByName, getSmallGradeByAccessory, getSmallGradeByArm, getSrcByGrade, getStatByType, getTextByGrade, getTextColorByGrade, printEngravingLevel } from "../../lib/characterFeat";
import { printEffectInTooltip } from "../../lib/armPrints";
import { printDefaultInTooltip } from "../../lib/accessoryPrints";
import { useEffect, useState } from "react";

// 장비 컴포넌트
export function EquipmentComponent({ character }: { character: ExpeditionCharacter }) {
    return (
        <div className="w-full grid grid-cols-6 gap-1">
            {character.equipment.equipments.map((equipment, index) => (
                <div key={index} className="flex flex-col items-center">
                    <p className="fadedtext text-[9pt]">{equipment.type}</p>
                    <p className={clsx(
                        "text-xl",
                        equipment.type === "무기" ? "text-orange-700 dark:text-orange-300" : "",
                        getEnhanceLevel(equipment.name) === "-" ? "fadedtext" : "font-bold"
                    )}>{getEnhanceLevel(equipment.name)}</p>
                    <p className="
                    text-[9pt]">{equipment.quality} / {equipment.highUpgrade !== -1 ? equipment.highUpgrade : "-"}</p>
                </div>
            ))}
        </div>
    )
}

// 악세서리 컴포넌트
export function AccessoriesComponent({ character }: { character: ExpeditionCharacter }) {
    return (
        <div className="w-full flex flex-col gap-1">
            {character.equipment.accessories.map((accessory, index) => {
                let parsedEquipment;
                try {
                    parsedEquipment = JSON.parse(accessory.tooltip);
                } catch (err) {
                    console.error("Tooltip JSON 파싱 오류:", err);
                    return null;
                }
                return (
                    <div key={index} className="w-full flex gap-1 items-center">
                        <Popover showArrow radius="sm">
                            <PopoverTrigger>
                                <p className={`w-[34px] text-[9pt] cursor-pointer ${getColorTextByGrade(accessory.grade)}`}>{accessory.type}</p>
                            </PopoverTrigger>
                            <PopoverContent>
                                <div className="min-w-[140px]">
                                    <Progress
                                        size="sm"
                                        label={`품질 ${accessory.quality}`}
                                        value={accessory.quality}
                                        maxValue={100}
                                        color="secondary"/>
                                    <Divider className="my-2"/>
                                    <div className="w-full flex gap-1">
                                        <p className="fadedtext">깨달음</p>
                                        <p className="ml-auto text-blue-700 dark:text-blue-400">+{accessory.point}</p>
                                    </div>
                                    <Divider className="my-2"/>
                                    <p className="whitespace-pre-line">{printDefaultInTooltip(parsedEquipment)}</p>
                                </div>
                            </PopoverContent>
                        </Popover>
                        <div className="grow grid grid-cols-3 gap-[1px]">
                            {accessory.items.map((item, idx) => (
                                <div key={idx} className="flex gap-1 text-[9pt] items-center">
                                    <img
                                        src={getSrcByGrade(getSmallGradeByAccessory(accessory.type, item).grade)}
                                        alt={`effect-${idx}`}
                                        className="w-4 h-4"/>
                                    <p className={getTextColorByGrade(getSmallGradeByAccessory(accessory.type, item).grade)}>{getTextByGrade(getSmallGradeByAccessory(accessory.type, item).grade)}</p>
                                    <p className={clsx(
                                        getSmallGradeByAccessory(accessory.type, item).grade === "none" ? "fadedtext" : ""
                                    )}>{getSmallGradeByAccessory(accessory.type, item).name}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )
            })}
            {character.equipment.arm || character.equipment.stone ? <Divider/> : null}
            {character.equipment.arm ? printEffectInTooltip(character.equipment.arm.tooltip).length > 0 ? (
                <div className="w-full flex gap-1 text-[9pt] items-center">
                    <p className={`w-[34px] ${getColorTextByGrade(character.equipment.arm.grade)}`}>{character.equipment.arm.type}</p>
                    <div className="grow grid grid-cols-3 gap-[1px]">
                        {printEffectInTooltip(character.equipment.arm.tooltip).map((item, idx) => (
                            <div key={idx} className={clsx(
                                "flex gap-1 items-center",
                                getSmallGradeByArm(item).name !== "null" ? "" : "hidden"
                            )}>
                                <img
                                    src={getSrcByGrade(getSmallGradeByArm(item).grade)}
                                    alt={`arm-effect-${idx}`}
                                    className="w-4 h-4"/>
                                <p className={getTextColorByGrade(getSmallGradeByArm(item).grade)}>{getTextByGrade(getSmallGradeByArm(item).grade)}</p>
                                <p className={clsx(
                                    getSmallGradeByArm(item).grade === "none" ? "fadedtext" : ""
                                )}>{getSmallGradeByArm(item).name}</p>
                            </div>
                        ))}
                    </div>
                </div>
            ) : null : null}
            {character.equipment.stone ? character.equipment.stone.effects.length > 0 ? (
                <div className="w-full flex gap-1 text-[9pt] items-center">
                    <p className={`w-[34px] ${getColorTextByGrade(character.equipment.stone.grade)}`}>스톤</p>
                    <div className="grow grid grid-cols-3 gap-[1px]">
                        {character.equipment.stone.effects.map((effect, idx) => (
                            <p key={idx} className={clsx(
                                idx === 2 ? "text-red-700 dark:text-red-300" : "",
                                effect.level !== 0 ? "" : "hidden"
                            )}>
                                <strong>Lv.{effect.level}</strong> {effect.name}
                            </p>
                        ))}
                    </div>
                </div>
            ) : null : null}
        </div>
    )
}

// 특성 컴포넌트
export function StatComponent({ character }: { character: ExpeditionCharacter }) {
    return (
        <div className="w-full text-[9pt]">
            <div className="w-full grid grid-cols-2 gap-1 mb-2">
                <div className="w-full flex gap-2 items-center">
                    <p className="fadedtext">공격력</p>
                    <p>{getStatByType(character.stats, "공격력") ? getStatByType(character.stats, "공격력")?.value.toLocaleString() : 0}</p>
                </div>
                <div className="w-full flex gap-2 items-center">
                    <p className="fadedtext">최대 생명력</p>
                    <p>{getStatByType(character.stats, "최대 생명력") ? getStatByType(character.stats, "최대 생명력")?.value.toLocaleString() : 0}</p>
                </div>
            </div>
            <div className="w-full grid grid-cols-6 gap-1">
                {character.stats
                    .sort((a, b) => b.value - a.value)
                    .filter(item => item.type !== "최대 생명력" && item.type !== "공격력")
                    .map((item, idx) => (
                    <div key={idx} className="w-full flex items-center gap-1">
                        <p className="fadedtext text-[7pt]">{item.type}</p>
                        <p className={clsx(
                            "text-sm",
                            item.value >= 300 ? "text-orange-700 dark:text-orange-300 font-bold" : "",
                        )}>{item.value}</p>
                    </div>
                ))}
            </div>
        </div>
    )
}

// 보석 컴포넌트
export function GemComponent({ character }: { character: ExpeditionCharacter }) {
    const [attack, setAttack] = useState(0);
    const gems = character.gems;
    const atkGemCount = getCountAtkGems(gems);
    const dekGemCount = getCountDekGems(gems);
    const leftSpan = Math.max(0, Math.min(11, atkGemCount));
    const rightSpan = Math.max(0, Math.min(11 - leftSpan, dekGemCount));

    useEffect(() => {
        let sum = 0;
        gems.forEach(gem => sum += gem.attack);
        setAttack(sum);
    }, [gems]);

    return (
        <div className="w-full text-[9pt]">
            <div className="w-full flex gap-1 mb-1">
                <p>보석</p>
                <div className="flex gap-2 items-center ml-auto">
                    <p className="fadedtext text-md">{atkGemCount}겁 {dekGemCount}작</p>
                    <Divider orientation="vertical" className="h-5"/>
                    <p className="fadedtext text-md">기본 공격력: {attack.toFixed(1)}%</p>
                </div>
            </div>
            <div className="w-full grid grid-cols-11 gap-1">
                {gems.map((gem, idx) => (
                    <div key={idx} className={`w-full p-[1px] aspect-square rounded-sm ${getBackgroundByGrade(gem.grade)} flex items-center justify-center`}>
                        <p className="text-md text-white/75 font-bold">{gem.level}</p>
                    </div>
                ))}
            </div>
            <div className="w-full mt-1 grid grid-cols-11 gap-1 text-[8pt] fadedtext">
                {leftSpan > 0 ? (
                    <div
                        className="flex items-center h-3 gap-1"
                        style={{ gridColumn: `span ${leftSpan} / span ${leftSpan}` }}
                    >
                        <div className="grow h-2 mb-1 border-b-1 border-l-1 border-black/25 dark:border-white/25"/>
                        <p className="fadedtext">{leftSpan}겁</p>
                        <div className="grow h-2 mb-1 border-b-1 border-r-1 border-black/25 dark:border-white/25"/>
                    </div>
                ) : null}
                {rightSpan > 0 ? (
                    <div
                        className="flex items-center h-3 gap-1"
                        style={{ gridColumn: `span ${rightSpan} / span ${rightSpan}` }}>
                        <div className="grow h-2 mb-1 border-b-1 border-l-1 border-black/25 dark:border-white/25"/>
                        <p className="fadedtext">{rightSpan}작</p>
                        <div className="grow h-2 mb-1 border-b-1 border-r-1 border-black/25 dark:border-white/25"/>
                    </div>
                ) : null}
            </div>
        </div>
    )
}

// 아크패시브
export function ArkpassiveComponent({ character }: { character: ExpeditionCharacter }) {
    return (
        <div className="w-full grid grid-cols-3 gap-1 text-[9pt]">
            {character.arkpassive.points.map((point, idx) => {
                const parsed = point.description?.match(/^(\d+)(랭크)\s+(\d+)(레벨)$/);
                return (
                    <div key={idx} className="w-full flex gap-1">
                        <p className={getColorByType(point.type)}>{point.type}</p>
                        {!point.description ? (
                            <p className="fadedtext">미개방</p>
                        ) : parsed ? (
                            <p>
                                {parsed[1]}
                                <span className="fadedtext text-[8pt]">{parsed[2]}</span>{" "}
                                {parsed[3]}
                                <span className="fadedtext text-[8pt]">{parsed[4]}</span>
                            </p>
                        ) : (
                            <p>{point.description}</p>
                        )}
                    </div>
                )
            })}
        </div>
    )
}

// 각인 컴포넌트
export function EngravingComponent({ character }: { character: ExpeditionCharacter }) {
    return (
        <div className="w-full grid grid-cols-5 gap-1 text-[9pt]">
            {character.engravings.map((engraving, idx) => (
                <div key={idx} className="w-full flex items-center gap-1">
                    <Tooltip showArrow content={engraving.name}>
                        <img
                            src={getEngravingSrcByName(engraving.name)}
                            alt={engraving.name}
                            className="w-6 h-6 rounded-md"/>
                    </Tooltip>
                    <div className="flex gap-1 items-center font-bold">
                        <p className={getColorTextByGrade(engraving.grade)}>◆ {engraving.level}</p>
                        {engraving.stoneLevel > 0 ? (
                            <div className="flex gap-0.5 items-center">
                                <img
                                    src={'/icons/stoneicon.png'}
                                    alt="stone-icon"
                                    className="w-2 h-3.5"/>
                                <p>{engraving.stoneLevel}</p>
                            </div>
                        ) : null}
                    </div>
                </div>
            ))}
        </div>
    )
}
