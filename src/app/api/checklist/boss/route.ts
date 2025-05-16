import { NextRequest, NextResponse } from "next/server";
import { firestore } from "@/utiils/firebase";
import { addDoc, collection, deleteDoc, doc, getDocs, updateDoc } from 'firebase/firestore';

export type Difficulty = {
    difficulty: string,
    level: number,
    isBiweekly: boolean,
    gold: number
}
export type Boss = {
    id: string,
    name: string,
    difficulty: Difficulty[]
}

export async function GET(_req: NextRequest) {
    try {
        const snapshot = await getDocs(collection(firestore, 'boss'));
        const bosses: Boss[] = snapshot.docs.map(doc => ({
            id: doc.id,
            name: doc.data().name,
            difficulty: doc.data().difficulty
        }));

        return NextResponse.json(bosses);
    } catch(error) {
        return NextResponse.json({ error: 'Failed load Database.' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const body = await req.json();
    const boss = {
        name: body.inputName,
        difficulty: body.inputs
    }

    try {
        switch(body.type) {
            case "add":
                const addRef = await addDoc(collection(firestore, 'boss'), boss);
                return NextResponse.json({ message: '데이터 추가가 정상적으로 처리도었습니다.', id: addRef.id }, { status: 200 });
            case "edit":
                if (!body.id) {
                    return NextResponse.json({ error: "문서 ID가 존재하지 않습니다." }, { status: 400 });
                }
                const docRef = doc(firestore, "boss", body.id);
                await updateDoc(docRef, boss);
                return NextResponse.json({ message: '데이터 수정이 정상적으로 처리도었습니다.' }, { status: 200 });
            case 'remove':
                if (!body.id) {
                    return NextResponse.json({ error: "문서 ID가 존재하지 않습니다." }, { status: 400 });
                }
                const removeRef = doc(firestore, "boss", body.id);
                await deleteDoc(removeRef);
                return NextResponse.json({ message: '데이터 삭제가 정상적으로 처리도었습니다.' }, { status: 200 });
            default:
                return NextResponse.json({ error: '처리 방식에 오류가 발생하였습니다.' }, { status: 500 });
        }
        
    } catch(error) {
        return NextResponse.json({ error: '데이터를 처리하는데 오류가 발생하였습니다.' }, { status: 500 });
    }
}