import { Raid } from "@/app/raids/model/types";
import { firestore } from "@/utiils/firebase";
import { collection, documentId, getDocs, limit, query, where } from "firebase/firestore";
import { NextRequest, NextResponse } from "next/server";


export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    try {
        const queryUser = query(collection(firestore, 'members'), where("id", "==", userId), limit(1));
        const snapUser = await getDocs(queryUser);
        if (snapUser.docs.length === 0) throw new Error('MEMBER_NOT_FOUND');
        const userData = snapUser.docs[0];
        const partyData: string[] = userData.data().joined;
        const queryRaids = query(collection(firestore, "raids"), where(documentId(), 'in', partyData), limit(5));
        const snapRaid = await getDocs(queryRaids);
        const raids: Raid[] = snapRaid.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as Raid[];
        const works: any[] = [];
        raids.forEach(raid => {
            raid.party.forEach(party => {
                if (party.teams.some(t => t.userId === userId)) {
                    works.push({
                        raidName: raid.name,
                        name: party.name,
                        date: party.date,
                        content: party.content,
                        stages: party.stages
                    });
                }
            });
        });
        return NextResponse.json(works);
    } catch (e: any) {
        if (e.message === "MEMBER_NOT_FOUND") {
            return NextResponse.json({ error: '해당 ID를 가진 데이터를 찾을 수 없습니다.' }, { status: 400 });
        }
        console.log(e);
        return NextResponse.json({ error: '데이터 처리 중 문제가 발생하였습니다.' }, { status: 500 });
    }
}