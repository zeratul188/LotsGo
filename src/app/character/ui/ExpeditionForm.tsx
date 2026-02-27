import clsx from "clsx";
import { getBgColorByLevels, getBorderColorByLevel, getCountByLevel, getImgByJob, getServerNames, handleSelectCharacter } from "../lib/expeditionFeat"
import data from "@/data/characters/data.json";
import { Avatar, Card, CardBody, Chip, Divider } from "@heroui/react";
import { ExpeditionCharacterInfo } from "../model/types";
import SupportorIcon from "@/Icons/SupportorIcon";
import AttackIcon from "@/Icons/AttackIcon";

type ExpeditionComponentProps = {
    expeditions: ExpeditionCharacterInfo[]
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
                                `${getBgColorByLevels(item.level)} items-center`,
                                getCountByLevel(item.level, idx === 0 ? 9999 : data.levels[idx-1].level, expeditions.filter(character => character.server === server)) > 0 ? 'flex' : 'hidden'
                            )}><span className="mr-1">{item.level}+ : </span>{getCountByLevel(item.level, idx === 0 ? 9999 : data.levels[idx-1].level, expeditions.filter(character => character.server === server))}</Chip>
                        ))}
                    </div>
                    <Divider className="mt-2 mb-2"/>
                    <div className="w-full grid grid-cols-1 sm:grid-cols-2 md960:grid-cols-3 gap-3">
                        {expeditions.filter(character => character.server === server).map((character, idx) => (
                            <Card 
                                key={idx}
                                radius="sm" 
                                isPressable 
                                fullWidth
                                className={`border-2 ${getBorderColorByLevel(character.level)}`}
                                onPress={() => handleSelectCharacter(character.nickname)}>
                                <CardBody>
                                    <div className="w-full flex gap-4 items-center">
                                        <Avatar isBordered size="md" src={getImgByJob(character.job)} className="border-[#ff968a]"/>
                                        <div className="w-full">
                                            <p className="truncate overflow-hidden whitespace-nowrap">{character.nickname}</p>
                                            <div className="w-full flex gap-1 items-center">
                                                <p className="fadedtext truncate overflow-hidden whitespace-nowrap text-[10pt]">Lv.{character.level} · {character.job}</p>
                                                <div className={clsx(
                                                    "flex items-center ml-auto",
                                                    character.combatPower > 0 ? '' : 'hidden'
                                                )}>
                                                    {character.type === 'supportor' ? <SupportorIcon size={14}/> : <AttackIcon size={12}/>}
                                                    <p className={clsx(
                                                        "text-[10pt] font-bold",
                                                        character.type === 'supportor' ? 'text-green-800 dark:text-green-300' : 'text-red-800 dark:text-red-300 ml-0.5'
                                                    )}>{character.combatPower}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardBody>
                            </Card>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    )
}