import { firestore } from "@/utiils/firebase";
import { collection, doc, getDocs, limit, query, updateDoc, where } from "firebase/firestore";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const body = await req.json();
    const id = body.id;
    const apiKey = body.apiKey;
    const type = body.type;

    try {
        const q = query(collection(firestore, 'members'), where("id", "==", id), limit(1));
        const snapshot = await getDocs(q);

        const targetDoc = snapshot.docs[0];
        const docRef = doc(firestore, "members", targetDoc.id);

        switch(type) {
            case 'add':
                await updateDoc(docRef, {
                    apiKey: apiKey
                });
                return NextResponse.json({ message: '데이터 수정이 정상적으로 처리도었습니다.' }, { status: 200 });
            case 'remove':
                await updateDoc(docRef, {
                    apiKey: null
                });
                return NextResponse.json({ message: '데이터 수정이 정상적으로 처리도었습니다.' }, { status: 200 });
        }
        return NextResponse.json({ message: '처리 종류를 선택하지 않았습니다.' }, { status: 400 });
    } catch(error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed load Database.' }, { status: 500 });
    }
}