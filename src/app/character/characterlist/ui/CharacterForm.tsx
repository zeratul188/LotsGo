import { Chip, Divider, Popover, PopoverContent, PopoverTrigger, Progress } from "@heroui/react";
import { ExpeditionCharacter } from "../model/types";
import { getEnhanceLevel } from "../lib/characterInfoFeat";
import clsx from "clsx";
import { getColorTextByGrade } from "@/utiils/utils";
import { getSmallGradeByAccessory, getSmallGradeByArm, getSrcByGrade, getStatByType, getTextByGrade, getTextColorByGrade } from "../../lib/characterFeat";
import { printEffectInTooltip } from "../../lib/armPrints";
import { printDefaultInTooltip } from "../../lib/accessoryPrints";

// 장비 컴포넌트
export function EquipmentComponent({ character }: { character: ExpeditionCharacter }) {
    return (
        <div className="w-full grid grid-cols-6 gap-1">
            {character.equipment.equipments.map((equipment, index) => (
                <div key={index} className="flex flex-col items-center gap-1">
                    <Chip size="sm" radius="sm" variant="flat">{equipment.type}</Chip>
                    <p className={clsx(
                        "text-xl",
                        equipment.type === '무기' ? 'text-orange-700 dark:text-orange-300' : '',
                        getEnhanceLevel(equipment.name) === '-' ? 'fadedtext' : 'font-bold'
                    )}>{getEnhanceLevel(equipment.name)}</p>
                    <p className="fadedtext text-[9pt]">{equipment.quality} / {equipment.highUpgrade !== -1 ? equipment.highUpgrade : '-'}</p>
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
                                        getSmallGradeByAccessory(accessory.type, item).grade === 'none' ? 'fadedtext' : ''
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
                                'flex gap-1 items-center',
                                getSmallGradeByArm(item).name !== 'null' ? '' : 'hidden'
                            )}>
                                <img
                                    src={getSrcByGrade(getSmallGradeByArm(item).grade)}
                                    alt={`arm-effect-${idx}`}
                                    className="w-4 h-4"/>
                                <p className={getTextColorByGrade(getSmallGradeByArm(item).grade)}>{getTextByGrade(getSmallGradeByArm(item).grade)}</p>
                                <p className={clsx(
                                    getSmallGradeByArm(item).grade === 'none' ? 'fadedtext' : ''
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
                                idx === 2 ? 'text-red-700 dark:text-red-300' : '',
                                effect.level !== 0 ? '' : 'hidden'
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
                    <p>{getStatByType(character.stats, '공격력') ? getStatByType(character.stats, '공격력')?.value.toLocaleString() : 0}</p>
                </div>
                <div className="w-full flex gap-2 items-center">
                    <p className="fadedtext">최대 생명력</p>
                    <p>{getStatByType(character.stats, '최대 생명력') ? getStatByType(character.stats, '최대 생명력')?.value.toLocaleString() : 0}</p>
                </div>
            </div>
            <div className="w-full grid grid-cols-6 gap-1">
                {character.stats
                    .sort((a, b) => b.value - a.value)
                    .filter(item => item.type !== '최대 생명력' && item.type !== '공격력')
                    .map((item, idx) => (
                    <div key={idx} className="w-full flex items-center gap-1">
                        <p className="fadedtext text-[7pt]">{item.type}</p>
                        <p className={clsx(
                            'text-sm',
                            item.value >= 300 ? 'text-orange-700 dark:text-orange-300 font-bold' : '',
                        )}>{item.value}</p>
                    </div>
                ))}
            </div>
        </div>
    )
}