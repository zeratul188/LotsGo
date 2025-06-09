import { useEffect, useState } from "react"
import { CharacterFile, Gem, getGemSimpleTailName } from "./characterFeat"
import { getAllDestory, getTextAttack, getTextTime, loadSkillPoint, loadSkills, Skill } from "./skillFeat"
import { Card, CardBody, CardHeader, Chip, Divider, Image, Popover, PopoverContent, PopoverTrigger, Progress, Tooltip } from "@heroui/react"
import { getBackgroundByGrade, getColorTextByGrade } from "@/utiils/utils"
import clsx from "clsx"

// 스킬 컴포넌트
type SkillComponentProps = {
    file: CharacterFile,
    gems: Gem[]
}
export function SkillComponent({ file, gems }: SkillComponentProps) {
    const [skills, setSkills] = useState<Skill[]>([]);
    const [skillPoint, setSkillPoint] = useState(0);
    const [maxPoint, setMaxPoint] = useState(0);

    useEffect(() => {
        loadSkills(file.skills, gems, setSkills);
    }, [file.skills]);

    useEffect(() => {
        loadSkillPoint(file.profile, setSkillPoint, setMaxPoint);
    }, [file.profile]);

    return (
        <div className="w-full">
            <SkillListComponent skills={skills} skillPoint={skillPoint} maxPoint={maxPoint}/>
        </div>
    )
}

// 스킬 목록 컴포넌트
type SkillListComponentProps = {
    skills: Skill[],
    skillPoint: number,
    maxPoint: number
}
function SkillListComponent({ skills, skillPoint, maxPoint }: SkillListComponentProps) {
    return (
        <Card radius="sm">
            <CardHeader>
                <div className="w-full flex gap-1 md960:gap-5 items-center flex-col md960:flex-row">
                    <div className="w-full md960:w-[max-content] md960:grow flex gap-1 items-center">
                        <p className="text-lg grow text-left">스킬</p>
                        {getAllDestory(skills) > 0 ? (
                            <Tooltip
                                showArrow
                                content={<div className="w-[200px] p-2">
                                    <div className="w-full flex gap-1 fadedtext">
                                        <p className="grow">스킬명</p>
                                        <p>파괴수치</p>
                                    </div>
                                    <Divider className="mt-2 mb-2"/>
                                    {skills.filter(skill => skill.destroy > 0).map((skill, index) => (
                                        <div key={index} className="w-full flex gap-1 mb-2">
                                            <p className="grow">{skill.name}</p>
                                            <p>{skill.destroy}</p>
                                        </div>
                                    ))}
                                    <Divider className="mb-2"/>
                                    <div className="w-full flex gap-1">
                                        <p className="grow fadedtext">총 파괴수치</p>
                                        <p className="font-bold">{getAllDestory(skills)}</p>
                                    </div>
                                </div>}>
                                <Chip color="secondary">총 파괴 {getAllDestory(skills)}</Chip>
                            </Tooltip>
                        ) : <></>}
                    </div>
                    <div className="w-full md960:w-[200px]">
                        <div className="flex w-full justify-end items-end mb-1">
                            <p className="mr-1 fadedtext text-[10pt]">스킬 포인트 :</p>
                            <p className="mr-1 font-bold text-green-500 text-2xl">{skillPoint}</p>
                            <p className="text-xl">/ {maxPoint}</p>
                        </div>
                        <Progress
                            size="sm"
                            color="success"
                            value={skillPoint}
                            maxValue={maxPoint}/>
                    </div>
                </div>
            </CardHeader>
            <Divider/>
            <CardBody className="p-0">
                {skills.map((skill, index) => (
                    <div key={index}>
                        {index !== 0 ? <Divider/> : <></>}
                        <div className="w-full flex flex-col md960:flex-row">
                            <div className="grow">
                                <div className="flex flex-col md960:flex-row gap-2 md960:gap-3 items-start md960:items-center p-3">
                                    <div className="flex gap-3 items-center">
                                        <Image 
                                            src={skill.icon} 
                                            width={40} 
                                            height={40} 
                                            radius="sm" 
                                            alt={skill.name}/>
                                        <p className="text-lg font-bold">{skill.name}</p>
                                        <p>Lv.{skill.level}</p>
                                        <Chip variant="flat" size="sm">{skill.type}</Chip>
                                    </div>
                                    <div className="w-full md960:w-[max-content] md960:grow flex gap-3 items-center">
                                        {skill.isCounter ? <Chip variant="solid" size="sm" color="success">카운터</Chip> : <></>}
                                        {skill.power !== '' ? <Chip variant="solid" size="sm" color="primary">무력 {skill.power}</Chip> : <></>}
                                        {skill.destroy > 0 ? <Chip variant="solid" size="sm" color="secondary">파괴 {skill.destroy}</Chip> : <></>}
                                        <div className="grow flex gap-2 justify-end">
                                            {skill.tripods.length > 0 ? <p className="bg-blue-500 rounded-full p-[2px] text-[10pt] w-6 h-6 text-center text-white">{skill.tripods[0].slot}</p> : <></>}
                                            {skill.tripods.length > 1 ? <p className="bg-green-700 rounded-full p-[2px] text-[10pt] w-6 h-6 text-center text-white">{skill.tripods[1].slot}</p> : <></>}
                                            {skill.tripods.length > 2 ? <p className="bg-yellow-700 rounded-full p-[2px] text-[10pt] w-6 h-6 text-center text-white">{skill.tripods[2].slot}</p> : <></>}
                                        </div>
                                    </div>
                                </div>
                                <div className="w-full p-3 bg-[#f0f0f0] dark:bg-[#222228]">
                                    <div className="w-full grid grid-cols-1 md960:grid-cols-3 gap-2 md960:gap-10">
                                        {skill.tripods.map((tripod, idx) => (
                                            <div key={idx} className="flex gap-2 items-center">
                                                <Image 
                                                    src={tripod.icon} 
                                                    width={30} 
                                                    height={30} 
                                                    radius="full" 
                                                    alt={skill.name}
                                                    className={clsx(
                                                        `border-1`,
                                                        idx === 0 ? 'border-blue-500 bg-blue-900' : idx === 1 ? 'border-green-500 bg-green-900' : 'border-yellow-500 bg-yellow-900'
                                                    )}/>
                                                <p>{tripod.name}</p>
                                                <p className="fadedtext">Lv.{tripod.level}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="w-full md960:w-[360px] min-h-full md960:border-l-1 border-[#dedede] dark:border-[#282828] p-3">
                                <div className="w-full flex gap-2 items-center">
                                    <div className={`w-[34px] h-[34px] p-[3px] aspect-square rounded-md ${getBackgroundByGrade(skill.rune ? skill.rune.grade : '')}`}>
                                        {skill.rune ? <Image
                                            src={skill.rune.icon}
                                            width={28}
                                            height={28}/> : <></>}
                                    </div>
                                    <p className={`${getColorTextByGrade(skill.rune ? skill.rune.grade : '')}`}>{skill.rune ? `${skill.rune.grade} ${skill.rune.name}` : '-'}</p>
                                </div>
                                <div className="w-full grid grid-cols-2 gap-1 mt-4">
                                    <Popover showArrow>
                                        <PopoverTrigger>
                                            <div className="w-full flex items-center gap-2 cursor-pointer">
                                                <div className={`w-[42px] h-[42px] p-[1px] aspect-square rounded-md ${getBackgroundByGrade(skill.attackGem ? skill.attackGem!.grade : "")}`}>
                                                    {skill.attackGem ? (
                                                        <Image
                                                            src={skill.attackGem!.icon}
                                                            width={36}
                                                            height={36}/>
                                                    ) : <></>}
                                                </div>
                                                {skill.attackGem ? (
                                                    <div>
                                                        <p className={`w-full text-[11pt] truncate ${getColorTextByGrade(skill.attackGem.grade)}`}>{skill.attackGem.name.replaceAll('(귀속)', '')}</p>
                                                        <p className="fadedtext text-[9pt]">{getTextAttack(skill.attackGem.skillStr)}</p>
                                                    </div>
                                                ) : <></>}
                                            </div>
                                        </PopoverTrigger>
                                        <PopoverContent>
                                            {skill.attackGem ? (
                                                <div className="max-w-[500px] p-2">
                                                    <p className={`w-full text-center text-lg ${getColorTextByGrade(skill.attackGem!.grade)}`}>{skill.attackGem!.name}</p>
                                                    <p className="mt-1 fadedtext">효과</p>
                                                    <p>{skill.attackGem?.skillStr}</p>
                                                    <p className="mt-2 fadedtext">추가 효과</p>
                                                    <p>기본 공격력 {skill.attackGem?.attack.toFixed(1)}%</p>
                                                </div>
                                            ) : <div></div>}
                                        </PopoverContent>
                                    </Popover>
                                    <Popover showArrow>
                                        <PopoverTrigger>
                                            <div className="w-full flex items-center gap-2 cursor-pointer">
                                                <div className={`w-[42px] h-[42px] p-[1px] aspect-square rounded-md ${getBackgroundByGrade(skill.timeGem ? skill.timeGem!.grade : "")}`}>
                                                    {skill.timeGem ? (
                                                        <Image
                                                            src={skill.timeGem!.icon}
                                                            width={36}
                                                            height={36}/>
                                                    ) : <></>}
                                                </div>
                                                {skill.timeGem ? (
                                                    <div>
                                                        <p className={`w-full text-[11pt] truncate ${getColorTextByGrade(skill.timeGem.grade)}`}>{skill.timeGem.name.replaceAll('(귀속)', '')}</p>
                                                        <p className="fadedtext text-[9pt]">{getTextTime(skill.timeGem.skillStr)}</p>
                                                    </div>
                                                ) : <></>}
                                            </div>
                                        </PopoverTrigger>
                                        <PopoverContent>
                                            {skill.timeGem ? (
                                                <div className="max-w-[500px] p-2">
                                                    <p className={`w-full text-center text-lg ${getColorTextByGrade(skill.timeGem!.grade)}`}>{skill.timeGem!.name}</p>
                                                    <p className="mt-1 fadedtext">효과</p>
                                                    <p>{skill.timeGem?.skillStr}</p>
                                                    <p className="mt-2 fadedtext">추가 효과</p>
                                                    <p>기본 공격력 {skill.timeGem?.attack.toFixed(1)}%</p>
                                                </div>
                                            ) : <div></div>}
                                        </PopoverContent>
                                    </Popover>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </CardBody>
        </Card>
    )
}