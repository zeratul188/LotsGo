import { NextRequest, NextResponse } from "next/server";
import { firestore } from "@/utiils/firebase";
import { collection, addDoc, getDocs } from 'firebase/firestore';

type Difficulty = {
    difficulty: string,
    level: number,
    isBiweekly: boolean,
    gold: number
}
type Boss = {
    name: string,
    difficulty: Array<Difficulty>
}

export async function GET(req: NextRequest) {
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



