import clsx from "clsx";
import { CharacterInfo } from "./characterFeat"
import { getBgColorByLevels, getBorderColorByLevel, getCountByLevel, getServerNames, handleSelectCharacter } from "./expeditionFeat"
import data from "@/data/characters/data.json";
import { Chip, Divider } from "@heroui/react";

type ExpeditionComponentProps = {
    expeditions: CharacterInfo[]
}
export function ExpeditionsComponent({ expeditions }: ExpeditionComponentProps) {
    return (
        <div className="w-full">
            {getServerNames(expeditions).map((server, index) => (
                <div key={index} className="mb-10">
                    <p className="text-2xl">{server}</p>
                    <div className="max-w-full overflow-x-auto scrollbar-hide flex gap-3 mt-2">
                        {data.levels.map((item, idx) => (
                            <Chip key={idx} variant="flat" radius="sm" className={clsx(
                                `${getBgColorByLevels(item.level)} text-white items-center`,
                                getCountByLevel(item.level, idx === 0 ? 9999 : data.levels[idx-1].level, expeditions.filter(character => character.server === server)) > 0 ? 'flex' : 'hidden'
                            )}><span className="text-[#f0f0f0] mr-1">{item.level}+ : </span>{getCountByLevel(item.level, idx === 0 ? 9999 : data.levels[idx-1].level, expeditions.filter(character => character.server === server))}</Chip>
                        ))}
                    </div>
                    <Divider className="mt-2 mb-2"/>
                    <div className="w-full grid grid-cols-2 sm:grid-cols-3 md960:grid-cols-6">
                        {expeditions.filter(character => character.server === server).map((character, idx) => (
                            <div 
                                key={idx} 
                                className={`cursor-pointer hover:bg-gray-100 dark:hover:bg-[#222222] dark:border-[#444444] border-1 border-l-4 pl-2 pr-2 pt-1 pb-1 ${getBorderColorByLevel(character.level)}`}
                                onClick={() => handleSelectCharacter(character.nickname)}>
                                <p className="truncate overflow-hidden whitespace-nowrap">{character.nickname}</p>
                                <p className="fadedtext truncate overflow-hidden whitespace-nowrap text-[10pt]">Lv.{character.level} · {character.job}</p>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    )
}