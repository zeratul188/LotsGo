import { ChecklistItem } from "@/app/store/checklistSlice"
import { Character } from "@/app/store/loginSlice"
import { firestore } from "@/utiils/firebase"
import { collection, getDocs, query, where } from "firebase/firestore"
import { NextRequest, NextResponse } from "next/server"

export type RaidMember = {
    id: string,
    nickname: string,
    expeditions: Character[],
    checklist: Checklist[]
}

export type Checklist = {
    server: string,
    nickname: string,
    level: number,
    job: string,
    isGold: boolean,
    otherGold: number,
    contents: ChecklistContent[]
}

export type ChecklistContent = {
    name: string,
    isGold: boolean,
    items: ChecklistItem[]
}

export async function GET(req: NextRequest) {
    const sp = req.nextUrl.searchParams;
    
    try {
        const memberList = sp.getAll('list');
        const chunks = [];

        for (let i = 0; i < memberList.length; i += 10) {
            chunks.push(memberList.slice(i, i+10));
        }

        const members: RaidMember[] = [];
        for (const group of chunks) {
            const q = query(collection(firestore, 'members'), where('id', 'in', group));
            const snapshot = await getDocs(q);

            if (snapshot.empty) {
                return NextResponse.json({ error: 'Not found a member with a specific ID.' }, { status: 400 });
            }

            snapshot.forEach(doc => {
                const data = doc.data();
                const member: RaidMember = {
                    id: data.id,
                    nickname: data.character,
                    expeditions: data.expeditions,
                    checklist: data.checklist ? data.checklist.map((item: any) => ({
                        server: item.server,
                        nickname: item.nickname,
                        level: Number(item.level),
                        job: item.job,
                        isGold: item.isGold,
                        otherGold: item.otherGold,
                        contents: item.checklist.map((content: any) => ({
                            name: content.name,
                            isGold: content.isGold,
                            items: content.items.map((stage: any) => ({
                                difficulty: stage.difficulty,
                                stage: stage.stage,
                                isCheck: stage.isCheck,
                                isDisable: stage.isDisable,
                                isBonus: stage.isBonus,
                                isBiweekly: stage.isBiweekly ?? false
                            }))
                        }))
                    })) : []
                }
                members.push(member);
            });
        }
        return NextResponse.json(members);
    } catch(error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed load Database.' }, { status: 500 });
    }
}