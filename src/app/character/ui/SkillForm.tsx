import { AvgSkillPowers, getAllDestory } from "../lib/skillFeat"
import { Card, CardBody, CardHeader, Chip, Divider, Popover, PopoverContent, PopoverTrigger, Progress } from "@heroui/react"
import { getBackgroundByGrade, getColorTextByGrade } from "@/utiils/utils"
import clsx from "clsx"
import { CharacterInfo, Gem, Skill } from "../model/types"

// 스킬 컴포넌트
export function SkillComponent({ info }: { info: CharacterInfo }) {
    const skills = info.skill.skills;
    const skillPoint = info.skill.skillPoint;
    const maxPoint = info.skill.maxPoint;

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
        <Card radius="lg" className="border border-default-200/80 bg-content1/95 shadow-sm dark:border-white/10 dark:bg-[#18181b]">
            <CardHeader className="relative px-5 py-4">
                <div className="w-full flex flex-col gap-4 md960:flex-row md960:items-center md960:gap-6">
                    <div className="w-full min-w-0 md960:contents">
                        <div className="mb-3 shrink-0 md960:order-1 md960:mb-0">
                            <p className="text-lg font-semibold text-left">스킬</p>
                        </div>
                        <div className="flex flex-wrap gap-2 md960:absolute md960:right-[260px] md960:top-1/2 md960:-translate-y-1/2">
                        {AvgSkillPowers(skills) !== '' ? (
                            <Popover showArrow disableAnimation>
                                <PopoverTrigger>
                                    <Chip radius="md" color="primary" variant="flat" className="cursor-pointer font-medium">무력 평균 · {AvgSkillPowers(skills)} <span className="ml-1 opacity-60">›</span></Chip>
                                </PopoverTrigger>
                                <PopoverContent className="border border-default-200 bg-white/95 shadow-xl dark:border-white/10 dark:bg-[#18181b]/95">
                                    <div className="w-[300px] max-w-[calc(100vw-32px)] p-4">
                                        <div className="mb-1">
                                            <p className="font-semibold">무력화 구성</p>
                                            <p className="text-xs text-default-500">장착한 스킬의 기본 무력화 수치입니다.</p>
                                        </div>
                                        <div className="mt-3 flex gap-1 text-xs text-default-500">
                                            <p className="grow">스킬명</p>
                                            <p>무력</p>
                                        </div>
                                        <Divider className="my-2"/>
                                        {skills.map((skill, index) => (
                                            <div key={index} className="mb-1.5 flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-default-100 dark:hover:bg-white/[0.05]">
                                                <p className="grow truncate">{skill.name}</p>
                                                <Chip size="sm" radius="sm" variant="flat">{skill.power !== "" ? skill.power : '-'}</Chip>
                                            </div>
                                        ))}
                                        <Divider className="my-2"/>
                                        <div className="flex w-full items-center gap-1 rounded-lg bg-success-50 px-2.5 py-2 dark:bg-success-500/10">
                                            <p className="grow text-sm text-default-500">무력 평균</p>
                                            <Chip size="sm" radius="sm" color="success" variant="flat">{AvgSkillPowers(skills)}</Chip>
                                        </div>
                                        <p className="mt-3 rounded-lg bg-default-100 px-2.5 py-2 text-[11px] leading-5 text-default-500 dark:bg-white/[0.05]">ⓘ 트라이포드와 룬 효과는 계산에 포함되지 않습니다.</p>
                                    </div>
                                </PopoverContent>
                            </Popover>
                        ) : <></>}
                        {getAllDestory(skills) > 0 ? (
                            <Popover showArrow disableAnimation>
                                <PopoverTrigger>
                                    <Chip radius="md" color="secondary" variant="flat" className="cursor-pointer font-medium">총 파괴 · Lv.{getAllDestory(skills)} <span className="ml-1 opacity-60">›</span></Chip>
                                </PopoverTrigger>
                                <PopoverContent className="border border-default-200 bg-white/95 shadow-xl dark:border-white/10 dark:bg-[#18181b]/95">
                                    <div className="w-[300px] max-w-[calc(100vw-32px)] p-4">
                                        <div className="mb-1">
                                            <p className="font-semibold">부위 파괴 구성</p>
                                            <p className="text-xs text-default-500">파괴 수치가 있는 스킬만 표시됩니다.</p>
                                        </div>
                                        <div className="mt-3 flex gap-1 text-xs text-default-500">
                                            <p className="grow">스킬명</p>
                                            <p>파괴수치</p>
                                        </div>
                                        <Divider className="my-2"/>
                                        {skills.filter(skill => skill.destroy > 0).map((skill, index) => (
                                            <div key={index} className="mb-1.5 flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-default-100 dark:hover:bg-white/[0.05]">
                                                <p className="grow truncate">{skill.name}</p>
                                                <Chip size="sm" radius="sm" variant="flat">Lv.{skill.destroy}</Chip>
                                            </div>
                                        ))}
                                        <Divider className="my-2"/>
                                        <div className="flex w-full items-center gap-1 rounded-lg bg-secondary-50 px-2.5 py-2 dark:bg-secondary-500/10">
                                            <p className="grow text-sm text-default-500">총 파괴수치</p>
                                            <Chip size="sm" radius="sm" color="secondary" variant="flat">Lv.{getAllDestory(skills)}</Chip>
                                        </div>
                                        <p className="mt-3 rounded-lg bg-default-100 px-2.5 py-2 text-[11px] leading-5 text-default-500 dark:bg-white/[0.05]">ⓘ 트라이포드와 룬 효과는 계산에 포함되지 않습니다.</p>
                                    </div>
                                </PopoverContent>
                            </Popover>
                        ) : <></>}
                        </div>
                    </div>
                    <div className="w-full md960:order-3 md960:ml-auto md960:w-[220px] md960:shrink-0">
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
                        <div className="flex w-full flex-col bg-white transition-colors hover:bg-default-50/70 dark:bg-[#191919] dark:hover:bg-[#202020] md960:flex-row md960:items-start">
                            <div className="grow">
                                <div className="flex flex-col gap-3 border-b border-default-200/70 px-4 py-3 md960:flex-row md960:items-center md960:justify-between dark:border-white/10">
                                    <div className="flex min-w-0 flex-wrap items-center gap-2.5">
                                        <img
                                            src={skill.icon} 
                                            alt={skill.name}
                                            className="h-12 w-12 self-start rounded-lg border border-default-200/80 object-cover dark:border-white/10"/>
                                        <div className="min-w-0">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <p className="max-w-full truncate text-base font-bold">{skill.name}</p>
                                                <span className="rounded-md bg-default-200 px-1.5 py-0.5 text-xs font-semibold tabular-nums text-default-700 dark:bg-white/15 dark:!text-white">Lv.{skill.level}</span>
                                                <span className="text-xs text-default-500">{skill.type}</span>
                                            </div>
                                            {skill.tripods.length > 0 ? (
                                                <div className="mt-1 flex min-w-0 flex-wrap items-center gap-x-2 text-[11px] text-default-500">
                                                    {skill.tripods.map((tripod, idx) => (
                                                        <div key={idx} className="flex min-w-0 items-center gap-1">
                                                            {idx > 0 ? <span className="text-default-400">·</span> : null}
                                                            <img
                                                                src={tripod.icon}
                                                                alt={tripod.name}
                                                                className={clsx(
                                                                    "h-5 w-5 rounded-full border",
                                                                    idx === 0 ? 'border-blue-500 bg-blue-900' : idx === 1 ? 'border-green-500 bg-green-900' : 'border-yellow-500 bg-yellow-900'
                                                                )}/>
                                                            <span className={clsx(
                                                                "truncate font-medium",
                                                                idx === 0 ? 'text-blue-600 dark:text-blue-400' : idx === 1 ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'
                                                            )}>{tripod.name}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : null}
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-2 md960:justify-end">
                                        {skill.isCounter ? <Chip variant="flat" radius="sm" size="sm" color="success">카운터</Chip> : <></>}
                                        {skill.power !== '' ? <Chip variant="flat" radius="sm" size="sm" color="primary">무력 {skill.power}</Chip> : <></>}
                                        {skill.destroy > 0 ? <Chip variant="flat" radius="sm" size="sm" color="secondary">파괴 {skill.destroy}</Chip> : <></>}
                                        <div className="flex gap-1.5">
                                            {skill.tripods.length > 0 ? <p className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 text-[10pt] text-white">{skill.tripods[0].slot}</p> : <></>}
                                            {skill.tripods.length > 1 ? <p className="flex h-6 w-6 items-center justify-center rounded-full bg-green-700 text-[10pt] text-white">{skill.tripods[1].slot}</p> : <></>}
                                            {skill.tripods.length > 2 ? <p className="flex h-6 w-6 items-center justify-center rounded-full bg-yellow-700 text-[10pt] text-white">{skill.tripods[2].slot}</p> : <></>}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="w-full border-t border-default-200/70 p-1.5 md960:w-[330px] md960:border-l md960:border-t-0 dark:border-white/10">
                                <div className="grid w-full grid-cols-3 gap-2">
                                    <div className="flex min-w-0 flex-col justify-center rounded-lg bg-default-50 px-1.5 py-1 dark:bg-white/[0.03]">
                                        <p className="mb-0.5 text-[10px] font-medium text-default-500">장착된 룬</p>
                                        <div className="flex items-center gap-2">
                                            <div className={`h-[34px] w-[34px] shrink-0 rounded-md p-[3px] ${getBackgroundByGrade(skill.rune ? skill.rune.grade : '')}`}>
                                                {skill.rune ? <img
                                                    src={skill.rune.icon}
                                                    alt="스킬에 장착된 룬 이미지"
                                                    className="h-7 w-7"/> : <></>}
                                            </div>
                                            <p className={`${getColorTextByGrade(skill.rune ? skill.rune.grade : '')} truncate text-xs`}>{skill.rune ? skill.rune.name : '룬 없음'}</p>
                                        </div>
                                    </div>
                                    <Popover showArrow disableAnimation>
                                        <PopoverTrigger>
                                            <div className="flex min-h-[50px] w-full cursor-pointer flex-col items-start justify-center gap-0.5 rounded-lg bg-default-50 px-1.5 py-1 transition-colors hover:bg-default-100 dark:bg-white/[0.03] dark:hover:bg-white/[0.07]">
                                                <p className="text-[10px] font-medium text-default-500">피해·지원</p>
                                                <div className="flex w-full items-center gap-2">
                                                <div className={`h-[34px] w-[34px] shrink-0 rounded-md p-[1px] ${getBackgroundByGrade(skill.attackGem ? skill.attackGem!.grade : "")}`}>
                                                    {skill.attackGem ? (
                                                        <img
                                                            src={skill.attackGem!.icon}
                                                            alt="스킬에 장착된 겁화/멸화 이미지"
                                                            className="h-8 w-8"/>
                                                    ) : <></>}
                                                </div>
                                                {skill.attackGem ? (
                                                    <div className="min-w-0">
                                                        <p className="text-xs font-semibold tabular-nums">Lv.{skill.attackGem.level}</p>
                                                    </div>
                                                ) : <span className="text-xs text-default-400">-</span>}
                                                </div>
                                            </div>
                                        </PopoverTrigger>
                                        <PopoverContent className="border border-default-200 bg-white/95 shadow-xl dark:border-white/10 dark:bg-[#18181b]/95">
                                            {skill.attackGem ? (
                                                <div className="w-[280px] max-w-[calc(100vw-32px)] p-4">
                                                    <p className={`w-full text-lg font-semibold ${getColorTextByGrade(skill.attackGem!.grade)}`}>{skill.attackGem!.name}</p>
                                                    <p className="mt-3 text-xs text-default-500">효과</p>
                                                    <p className="mt-1 text-sm leading-5">{skill.attackGem?.skillStr}</p>
                                                    <p className="mt-3 text-xs text-default-500">추가 효과</p>
                                                    <p className="mt-1 text-sm">기본 공격력 <span className="font-semibold">{skill.attackGem?.attack.toFixed(1)}%</span></p>
                                                </div>
                                            ) : <div></div>}
                                        </PopoverContent>
                                    </Popover>
                                    <Popover showArrow disableAnimation>
                                        <PopoverTrigger>
                                            <div className="flex min-h-[50px] w-full cursor-pointer flex-col items-start justify-center gap-0.5 rounded-lg bg-default-50 px-1.5 py-1 transition-colors hover:bg-default-100 dark:bg-white/[0.03] dark:hover:bg-white/[0.07]">
                                                <p className="text-[10px] font-medium text-default-500">쿨타임 감소</p>
                                                <div className="flex w-full items-center gap-2">
                                                <div className={`h-[34px] w-[34px] shrink-0 rounded-md p-[1px] ${getBackgroundByGrade(skill.timeGem ? skill.timeGem!.grade : "")}`}>
                                                    {skill.timeGem ? (
                                                        <img
                                                            src={skill.timeGem!.icon}
                                                            alt="스킬에 장착된 작열/홍염 이미지"
                                                            className="h-8 w-8"/>
                                                    ) : <></>}
                                                </div>
                                                {skill.timeGem ? (
                                                    <div className="min-w-0">
                                                        <p className="text-xs font-semibold tabular-nums">Lv.{skill.timeGem.level}</p>
                                                    </div>
                                                ) : <span className="text-xs text-default-400">-</span>}
                                                </div>
                                            </div>
                                        </PopoverTrigger>
                                        <PopoverContent className="border border-default-200 bg-white/95 shadow-xl dark:border-white/10 dark:bg-[#18181b]/95">
                                            {skill.timeGem ? (
                                                <div className="w-[280px] max-w-[calc(100vw-32px)] p-4">
                                                    <p className={`w-full text-lg font-semibold ${getColorTextByGrade(skill.timeGem!.grade)}`}>{skill.timeGem!.name}</p>
                                                    <p className="mt-3 text-xs text-default-500">효과</p>
                                                    <p className="mt-1 text-sm leading-5">{skill.timeGem?.skillStr}</p>
                                                    <p className="mt-3 text-xs text-default-500">추가 효과</p>
                                                    <p className="mt-1 text-sm">기본 공격력 <span className="font-semibold">{skill.timeGem?.attack.toFixed(1)}%</span></p>
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
