import { NextRequest, NextResponse } from "next/server";
import { firestore } from "@/utiils/firebase";
import { addDoc, collection, getDocs } from 'firebase/firestore';

export type Difficulty = {
    difficulty: string,
    level: number,
    isBiweekly: boolean,
    gold: number
}
export type Boss = {
    name: string,
    difficulty: Array<Difficulty>
}

export async function GET(_req: NextRequest) {
    try {
        const snapshot = await getDocs(collection(firestore, 'boss'));
        const bosses: Boss[] = snapshot.docs.map(doc => ({
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

    const boss: Boss = {
        name: body.inputName,
        difficulty: body.inputs
    }

    try {
        switch(body.type) {
            case "add":
                await addDoc(collection(firestore, 'boss'), boss);
                return NextResponse.json({ message: '데이터가 정상적으로 처리도었습니다.' }, { status: 200 });
            default:
                return NextResponse.json({ error: '처리 방식에 오류가 발생하였습니다.' }, { status: 500 });
        }
        
    } catch(error) {
        return NextResponse.json({ error: '데이터를 처리하는데 오류가 발생하였습니다.' }, { status: 500 });
    }
}