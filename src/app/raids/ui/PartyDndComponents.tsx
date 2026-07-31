'use client'

import { useDraggable, useDroppable } from "@dnd-kit/core";
import clsx from "clsx";
import JobEmblemIcon from "@/Icons/JobEmblemIcon";
import LeaderIcon from "@/Icons/LeaderIcon";
import data from "@/data/characters/data.json";
import type { RaidMember } from "../../api/raids/members/route";
import type { DragableParty, TeamMember } from "../model/types";
import { toSlots } from "../lib/raidsFeat";
import { getCharacterInfoById } from "../lib/raidListFeat";

export function PartyCard({ members, party, partyIndex }: { members: RaidMember[], party: DragableParty, partyIndex: number }) {
    const slots = toSlots(party);
    return (
        <div className="flex w-full flex-col gap-2 rounded-xl border border-default-200 bg-default-50/60 p-3 dark:border-white/10 dark:bg-white/[0.03]">
            <h3 className="flex items-center gap-2 text-sm font-bold"><span className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary/10 text-xs text-primary">{partyIndex}</span>{partyIndex}파티</h3>
            {slots.map((member, slotIndex) => (
                <PartySlot key={slotIndex} partyId={party.id} slotIndex={slotIndex} member={member} members={members}/>
            ))}
        </div>
    )
}

type PartySlotProps = {
    partyId: string,
    slotIndex: number,
    member: TeamMember | null,
    members: RaidMember[]
}

function PartySlot({ partyId, slotIndex, member, members }: PartySlotProps) {
    const { setNodeRef, isOver } = useDroppable({ id: `slot:${partyId}:${slotIndex}` });
    const { attributes, listeners, setNodeRef: setDraggableRef, transform } = useDraggable({
        id: `char:${partyId}:${member?.userId}`,
    });
    const style = transform ? {transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`} : undefined;
    const character = member ? getCharacterInfoById(members, member.userId, member.nickname) : null;

    return (
        <div
            ref={setNodeRef}
            className={clsx(
                'flex h-16 touch-none items-center gap-2 rounded-xl border px-3 py-2 transition-colors',
                member ? member.type === 'attack' ? 'border-rose-300 bg-rose-50/50 dark:border-rose-500/30 dark:bg-rose-500/[0.06]' : 'border-emerald-300 bg-emerald-50/50 dark:border-emerald-500/30 dark:bg-emerald-500/[0.06]' : 'border-dashed border-default-300 bg-white dark:border-white/15 dark:bg-white/[0.02]',
                isOver ? 'border-primary bg-primary-50 dark:bg-primary-500/10' : ''
            )}>
            {member && character ? (
                <div
                    ref={setDraggableRef}
                    {...listeners}
                    {...attributes}
                    style={style}
                    className="flex w-full cursor-grab items-center gap-3 rounded-lg bg-transparent">
                    <JobEmblemIcon job={character.job} size={32} className="text-black dark:text-white"/>
                    <div className="grow text-left">
                        <div className="flex gap-1">
                            <div className="flex items-center grow gap-1">
                                <p className="text-black dark:text-white">{member.nickname}</p>
                                <div className={clsx(
                                    "text-yellow-600 dark:text-yellow-400",
                                    member.isManager ? '' : 'hidden'
                                )}><LeaderIcon size={12}/></div>
                            </div>
                            <div className="flex gap-1">
                                {member.type === 'attack' ? data.classEffects.find(c => c.job === character.job)?.effects.map((effect, index) => (
                                    <div key={index} className="rounded-md px-1 py-0.2 bg-[#eeeeee] dark:bg-[#2a2a2a] text-[8pt] text-black dark:text-white flex items-center text-center">{effect}</div>
                                )) : data.classEffects.find(c => c.job === character.job)?.burf.map((effect, index) => (
                                    <div key={index} className="rounded-md px-1 py-0.2 bg-[#eeeeee] dark:bg-[#2a2a2a] text-[8pt] text-black dark:text-white flex items-center text-center">{effect}</div>
                                ))}
                            </div>
                        </div>
                        <div className="flex gap-1">
                            <p className="fadedtext text-[9pt] grow">{character.job} · Lv.{character.level} · {character.server}</p>
                            <p className="fadedtext text-[9pt]">{member.userId}</p>
                        </div>
                    </div>
                </div>
            ) : (
                <>
                    <p className="text-lg font-bold fadedtext">{slotIndex+1}</p>
                    <p className="fadedtext ml-1">파티원이 비어있습니다.</p>
                </>
            )}
        </div>
    )
}
