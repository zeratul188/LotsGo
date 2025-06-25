import { Character } from "@/app/store/loginSlice"
import { firestore } from "@/utiils/firebase"
import { collection, getDocs } from "firebase/firestore"
import { NextRequest, NextResponse } from "next/server"

export type BadgeToUser = {
    id: string,
    expeditions: Character[]
}

export async function GET(_req: NextRequest) {
    try {
        const snapshot = await getDocs(collection(firestore, 'members'));
        const members: BadgeToUser[] = snapshot.docs.map(doc => ({
            id: doc.data().id,
            expeditions: doc.data().expeditions
        }));
        return NextResponse.json(members);
    } catch(error) {
        return NextResponse.json({ error: 'Failed load Database.' }, { status: 500 });
    }
}