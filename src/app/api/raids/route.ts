import { ControlStage } from "@/app/checklist/ChecklistForm"
import { firestore } from "@/utiils/firebase"
import { addDoc, collection, doc, documentId, getDocs, limit, query, updateDoc, where } from "firebase/firestore"
import { NextRequest, NextResponse } from "next/server"

// 파티 인원
export type TeamCharacter = {
    partyIndex: number,
    position: number,
    nickname: string,
    userId: string,
    type: string,
    isManager: boolean
}

// 파티
export type Party = {
    id: string,
    name: string,
    date: Date,
    content: string,
    stages: ControlStage[],
    teams: TeamCharacter[]
}

// 레이드 파티 정보
export type Raid = {
    id: string,
    name: string,
    managerId: string,
    managerNickname: string,
    avgLevel: number,
    link: string,
    isOpen: boolean,
    isPwd: boolean,
    pwd: string,
    members: string[],
    party: Party[]
}

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const link = searchParams.get('link');

    try {
        const snapshot = await getDocs(collection(firestore, 'raids'));
        const raids: Raid[] = snapshot.docs.map((doc => ({
            id: doc.id,
            isOpen: doc.data().isOpen,
            isPwd: doc.data().isPwd,
            link: doc.data().link,
            avgLevel: doc.data().avgLevel,
            managerId: doc.data().managerId,
            managerNickname: doc.data().managerNickname,
            members: doc.data().members,
            name: doc.data().name,
            party: doc.data().party,
            pwd: doc.data().pwd
        })));

        let joinRaids: Raid[] = [];

        if (id) {
            const q = query(collection(firestore, 'members'), where("id", "==", id), limit(1));
            const memberSnapshot = await getDocs(q);
            if (!memberSnapshot.empty) {
                const targetDoc = memberSnapshot.docs[0];
                const data = targetDoc.data();
                const joined: string[] = data.joined ? data.joined : [];
                joinRaids = raids.filter(raid => joined.includes(raid.id));
            }
        } else if (link) {
            const findRaid = raids.find(raid => raid.link === link);
            if (findRaid) {
                joinRaids.push(findRaid);
            }
        }
        
        return NextResponse.json({ raids: raids, joinRaids: joinRaids });
    } catch(error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed load Database.' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const body = await req.json();
    const id = body.id;
    let selectedParty: Raid | null = null;

    try {
        switch(body.type) {
            case 'add':
                const raid: Raid = body.raid;
                const addRaid = {
                    name: raid.name,
                    managerId: raid.managerId,
                    managerNickname: raid.managerNickname,
                    link: raid.link,
                    isOpen: raid.isOpen,
                    isPwd: raid.isPwd,
                    pwd: raid.pwd,
                    members: raid.members,
                    party: raid.party,
                    avgLevel: raid.avgLevel
                }

                if (typeof id !== "string" || id.trim() === "") {
                    return NextResponse.json({ error: "id가 필요합니다." }, { status: 400 });
                }

                const addRef = await addDoc(collection(firestore, 'raids'), addRaid);
                const q = query(collection(firestore, 'members'), where("id", "==", id), limit(1));
                const snapshot = await getDocs(q);
        
                if (snapshot.empty) {
                    return NextResponse.json({ error: 'Not found a member with a specific ID.' }, { status: 300 });
                }
        
                const targetDoc = snapshot.docs[0];
                const docRef = doc(firestore, "members", targetDoc.id);
                const data = targetDoc.data();
                const joined: string[] = data.joined ? data.joined : [];
                joined.push(addRef.id);

                await updateDoc(docRef, {
                    joined: joined
                });
                return NextResponse.json({ message: '데이터 추가가 정상적으로 처리도었습니다.', id: addRef.id }, { status: 200 });       
            case 'join':
                const joinRaid: Raid = body.raid;

                if (typeof id !== "string" || id.trim() === "") {
                    return NextResponse.json({ error: "id가 필요합니다." }, { status: 400 });
                }

                const jMembers = structuredClone(joinRaid.members);
                jMembers.push(id);
                const jrq = query(collection(firestore, 'raids'), where(documentId(), '==', joinRaid.id), limit(1));
                const jss = await getDocs(jrq);
                const mq = query(collection(firestore, 'members'), where('id', '==', id), limit(1));
                const mss = await getDocs(mq);

                if (jss.empty || mss.empty) {
                    return NextResponse.json({ error: 'Not found a raid or members with a specific ID.' }, { status: 300 });
                }

                const tdj = jss.docs[0];
                const rRef = doc(firestore, 'raids', tdj.id);
                await updateDoc(rRef, {
                    members: jMembers
                });

                const mtd = mss.docs[0];
                const mRef = doc(firestore, "members", mtd.id);
                const mData = mtd.data();
                const mJoined: string[] = mData.joined ? mData.joined : [];
                mJoined.push(joinRaid.id);
                await updateDoc(mRef, {
                    joined: mJoined
                });
                return NextResponse.json({ message: '데이터 수정이 정상적으로 처리되었습니다.' }, { status: 200 });
            case 'add-party':
                selectedParty = body.selectedParty;
                const partys: Party[] = body.partys;
                const addParty: Party = body.addParty;

                if (!selectedParty) {
                    return NextResponse.json({ error: 'Not found a raid with a specific ID.' }, { status: 300 });
                } else {
                    const arq = query(collection(firestore, 'raids'), where(documentId(), '==', selectedParty.id), limit(1));
                    const ass = await getDocs(arq);

                    if (ass.empty) {
                        return NextResponse.json({ error: 'Not found a raid with a specific ID.' }, { status: 300 });
                    }

                    partys.push(addParty);
                    const atd = ass.docs[0];
                    const arRef = doc(firestore, 'raids', atd.id);
                    await updateDoc(arRef, {
                        party: partys
                    });
                    return NextResponse.json({ message: '데이터 수정이 정상적으로 처리되었습니다.' }, { status: 200 });
                }
            default: 
                return NextResponse.json({ message: '처리 종류를 선택하지 않았습니다.' }, { status: 400 });
        }
    } catch(error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed load Database.' }, { status: 500 });
    }
}