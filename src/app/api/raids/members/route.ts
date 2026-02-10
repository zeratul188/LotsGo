import { ChecklistItem } from "@/app/store/checklistSlice"
import { Character } from "@/app/store/loginSlice"
import { firestore } from "@/utiils/firebase"
import { collection, getDocs, limit, query, where } from "firebase/firestore"
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
    busGold: number,
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
                            busGold: content.busGold,
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

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const userId = body.userId;
        if (!userId) throw new Error('BODY_ERROR');
        const memberQuery = query(collection(firestore, 'members'), where('id', '==', userId), limit(1));
        const memberSnapshot = await getDocs(memberQuery);
        if (memberSnapshot.empty) throw new Error('MEMBER_NOT_FOUND');
        const memberDoc = memberSnapshot.docs[0];
        const memberData = memberDoc.data();
        const member: RaidMember = {
            id: memberData.id,
            nickname: memberData.character,
            expeditions: memberData.expeditions,
            checklist: memberData.checklist ? memberData.checklist.map((item: any) => ({
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
        return NextResponse.json({ message: '데이터 수정이 정상적으로 처리되었습니다.', member: member }, { status: 200 });
    } catch (e: any) {
        if (e.message === "BODY_ERROR") {
            return NextResponse.json({ error: '데이터 불러오는데 문제가 발생하였습니다.' }, { status: 400 });
        }
        if (e.message === "MEMBER_NOT_FOUND") {
            return NextResponse.json({ error: '해당 ID를 가진 회원의 데이터를 찾을 수 없습니다.' }, { status: 400 });
        }
        console.log(e);
        return NextResponse.json({ error: '데이터 처리 중 문제가 발생하였습니다.' }, { status: 500 });
    }
}