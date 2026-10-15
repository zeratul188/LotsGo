import type { Checklist } from "@/app/api/raids/members/route";
import type { Boss } from "@/app/api/checklist/boss/route";
import { Tooltip } from "@heroui/react";
import CheckIcon from "@/Icons/CheckIcon";
import { getBackgroundByStage, getSimpleBossName } from "@/app/checklist/lib/checklistFeat";
import JobAvatar from "@/Icons/JobAvatar";
import clsx from "clsx";
import {
    getAllGoldByMemberCharacter,
    getCompleteBoundGoldByMember,
    getCompleteGoldByMemberCharacter,
    getCompleteSharedGoldByMember
} from "../lib/partyFeat";

type MemberProgressTablesProps = {
    characters: Checklist[];
    bosses: Boss[];
};

const headingClass = "border-b border-r border-gray-200/80 bg-gray-50 px-3 py-3 text-left text-xs font-semibold text-gray-600 last:border-r-0 dark:border-white/10 dark:bg-[#222227] dark:text-gray-300";
const cellClass = "border-b border-r border-gray-200/80 px-3 py-2.5 last:border-r-0 dark:border-white/10";

function CharacterCell({ character }: { character: Checklist }) {
    return (
        <div className="flex min-w-0 items-center gap-2.5">
            <JobAvatar size="sm" job={character.job}/>
            <div className="min-w-0">
                <div className="flex items-center gap-1">
                    <span className="truncate text-sm font-semibold">{character.nickname}</span>
                    {character.isGold ? <span title="골드 캐릭터" className="shrink-0"><img src="/icons/gold.png" alt="골드 캐릭터" className="h-3.5 w-3.5"/></span> : null}
                </div>
                <p className="truncate text-[11px] text-default-500">{character.job} · Lv.{character.level.toLocaleString()}</p>
            </div>
        </div>
    );
}

export function MemberHomeworkTable({ characters, bosses }: MemberProgressTablesProps) {
    const contentNames = [...new Set(characters.flatMap(character => character.contents.map(content => content.name)))];

    return (
        <div className="w-full overflow-x-auto rounded-xl border border-gray-200/80 dark:border-white/10">
            <table className="w-full min-w-max border-separate border-spacing-0 text-foreground">
                <thead>
                    <tr>
                        <th scope="col" className={clsx(headingClass, "sticky left-0 z-20 min-w-[210px] w-[210px]")}>캐릭터</th>
                        {contentNames.map(name => (
                            <th key={name} scope="col" title={name} className={clsx(headingClass, "min-w-[160px]")}>{getSimpleBossName(bosses, name)}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {characters.map(character => (
                        <tr key={`${character.server}-${character.nickname}`} className="group">
                            <th scope="row" className={clsx(cellClass, "sticky left-0 z-10 w-[210px] min-w-[210px] bg-white text-left group-hover:bg-gray-50 dark:bg-[#171717] dark:group-hover:bg-[#202025]")}>
                                <CharacterCell character={character}/>
                            </th>
                            {contentNames.map(name => {
                                const content = character.contents.find(item => item.name === name);
                                const isComplete = content && content.items.length > 0 && content.items.every(item => item.isCheck || item.isDisable);
                                return (
                                    <td key={name} className={clsx(cellClass, "min-w-[160px] align-middle", isComplete ? "bg-success-50/60 dark:bg-success-500/[0.07]" : "bg-white group-hover:bg-gray-50/70 dark:bg-[#171717] dark:group-hover:bg-white/[0.025]")}>
                                        {content ? (
                                            <div className="flex flex-col gap-1.5">
                                                {content.isGold && character.isGold ? <span className="flex items-center gap-1 text-[10px] font-semibold text-warning-700 dark:text-warning-400"><img src="/icons/gold.png" alt="" className="h-3 w-3"/>골드 지정</span> : null}
                                                <div className="flex flex-wrap gap-1">
                                                    {content.items.map((item, index) => (
                                                        <Tooltip key={`${item.difficulty}-${item.stage}-${index}`} showArrow content={item.difficulty}>
                                                            <span className={clsx("inline-flex items-center gap-1 rounded-md border px-1.5 py-1 text-[10px] font-medium", item.isDisable ? "border-default-200 bg-default-100 text-default-400 dark:border-white/10 dark:bg-white/[0.04]" : item.isCheck ? "border-success-200 bg-success-100/70 text-success-800 dark:border-success-800 dark:bg-success-900/30 dark:text-success-300" : "border-default-200 bg-white text-default-700 dark:border-white/10 dark:bg-[#222227] dark:text-default-300")}>
                                                                <span className={clsx("h-1.5 w-1.5 rounded-full", getBackgroundByStage(item.difficulty, item.isDisable))}/>
                                                                {item.stage}관
                                                                {item.isDisable ? <span>제외</span> : item.isCheck ? <CheckIcon size={10}/> : null}
                                                            </span>
                                                        </Tooltip>
                                                    ))}
                                                </div>
                                            </div>
                                        ) : <span className="text-xs text-default-400">—</span>}
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export function MemberGoldTable({ characters, bosses }: MemberProgressTablesProps) {
    return (
        <div className="w-full overflow-x-auto rounded-xl border border-gray-200/80 dark:border-white/10">
            <table className="w-full min-w-[820px] border-separate border-spacing-0 text-foreground">
                <thead>
                    <tr>
                        <th scope="col" className={clsx(headingClass, "sticky left-0 z-20 w-[210px] min-w-[210px]")}>캐릭터</th>
                        <th scope="col" className={headingClass}>거래 가능 골드</th>
                        <th scope="col" className={headingClass}>귀속 골드</th>
                        <th scope="col" className={headingClass}>부수입</th>
                        <th scope="col" className={clsx(headingClass, "min-w-[215px]")}>획득 골드 / 전체 골드</th>
                    </tr>
                </thead>
                <tbody>
                    {characters.map(character => {
                        const earned = getCompleteGoldByMemberCharacter(bosses, character);
                        const total = getAllGoldByMemberCharacter(bosses, character) + character.otherGold;
                        return (
                            <tr key={`${character.server}-${character.nickname}`} className="group">
                                <th scope="row" className={clsx(cellClass, "sticky left-0 z-10 w-[210px] min-w-[210px] bg-white text-left group-hover:bg-gray-50 dark:bg-[#171717] dark:group-hover:bg-[#202025]")}><CharacterCell character={character}/></th>
                                {[getCompleteSharedGoldByMember(bosses, character), getCompleteBoundGoldByMember(bosses, character), character.otherGold].map((value, index) => (
                                    <td key={index} className={clsx(cellClass, "bg-white text-sm tabular-nums group-hover:bg-gray-50/70 dark:bg-[#171717] dark:group-hover:bg-white/[0.025]")}>
                                        <span className="flex items-center gap-1.5"><img src="/icons/gold.png" alt="" className="h-3.5 w-3.5"/>{value.toLocaleString()}</span>
                                    </td>
                                ))}
                                <td className={clsx(cellClass, "bg-warning-50/40 dark:bg-warning-500/[0.05]")}>
                                    <div className="flex items-center justify-between gap-2 text-xs tabular-nums"><span className="font-semibold">{earned.toLocaleString()} / {total.toLocaleString()}</span><span className="text-default-500">{total > 0 ? Math.round(earned / total * 100) : 0}%</span></div>
                                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-default-100 dark:bg-white/10"><div className="h-full rounded-full bg-warning" style={{ width: `${total > 0 ? Math.min(100, earned / total * 100) : 0}%` }}/></div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
