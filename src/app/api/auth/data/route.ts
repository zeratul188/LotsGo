import { Character } from "@/app/store/loginSlice";
import { firestore } from "@/utiils/firebase";
import { collection, doc, getDocs, limit, query, updateDoc, where } from "firebase/firestore";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const body = await req.json();
    const id = body.id;
    const type = body.type;

    try {
        const q = query(collection(firestore, 'members'), where("id", "==", id), limit(1));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            return NextResponse.json({ error: 'Not found a member with a specific ID.' }, { status: 300 });
        }

        const targetDoc = snapshot.docs[0];
        const docRef = doc(firestore, "members", targetDoc.id);
        let nickname = '';
        let expedition: Character[] = [];

        switch(type) {
            case 'change-character':
                nickname = body.nickname;
                await updateDoc(docRef, {
                    character: nickname
                });
                break;
            case 'update-expedition':
                nickname = body.nickname;
                expedition = body.expedition;
                await updateDoc(docRef, {
                    character: nickname,
                    expeditions: expedition
                });
                break;
        }
        return NextResponse.json({ message: '데이터 처리가 정상적으로 처리도었습니다.' }, { status: 200 });
    } catch(error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed load Database.' }, { status: 500 });
    }
}