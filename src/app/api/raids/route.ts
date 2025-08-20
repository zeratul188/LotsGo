import { firestore } from "@/utiils/firebase"
import { addDoc, collection, doc, getDocs, limit, query, updateDoc, where } from "firebase/firestore"
import { NextRequest, NextResponse } from "next/server"

// 관문 정보
export type Stage = {
    stage: number,
    difficulty: string
}

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
    stages: Stage[],
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
            default: 
                return NextResponse.json({ message: '처리 종류를 선택하지 않았습니다.' }, { status: 400 });
        }
    } catch(error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed load Database.' }, { status: 500 });
    }
}