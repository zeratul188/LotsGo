import { Chip } from "@heroui/react";
import { ExpeditionCharacter } from "../model/types";
import { getEnhanceLevel } from "../lib/characterInfoFeat";
import clsx from "clsx";
import { getColorTextByGrade } from "@/utiils/utils";
import { getSmallGradeByAccessory, getSrcByGrade, getTextByGrade, getTextColorByGrade } from "../../lib/characterFeat";

// 장비 컴포넌트
export function EquipmentComponent({ character }: { character: ExpeditionCharacter }) {
    return (
        <div className="w-full grid grid-cols-6 gap-1">
            {character.equipment.equipments.map((equipment, index) => (
                <div key={index} className="flex flex-col items-center gap-1">
                    <Chip size="sm" radius="sm" variant="flat">{equipment.type}</Chip>
                    <p className={clsx(
                        "text-xl",
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
            {character.equipment.accessories.map((accessory, index) => (
                <div key={index} className="w-full flex gap-1 items-center">
                    <p className={`w-[50px] text-[9pt] ${getColorTextByGrade(accessory.grade)}`}>{accessory.type}</p>
                    <div className="grow grid grid-cols-3 gap-1">
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
            ))}
        </div>
    )
}