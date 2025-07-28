import { firestore } from "@/utiils/firebase";
import { collection, doc, getDocs, query, updateDoc, where } from "firebase/firestore";
import { NextRequest, NextResponse } from "next/server";

export type Settings = {
    isHideDayContent: boolean
}
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    try {
        const q = query(collection(firestore, 'members'), where("id", "==", id));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            return NextResponse.json({ error: 'Not found a member with a specific ID.' }, { status: 400 });
        }

        const targetDoc = snapshot.docs[0];
        const data = targetDoc.data();

        const defaultSettings: Settings = {
            isHideDayContent: false
        }
        const settings: Settings = {
            ...defaultSettings,
            ...data.settings
        }
        return NextResponse.json(settings);
    } catch(error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed load Database.' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const body = await req.json();
    const id = body.id;
    const settings: Settings = body.settings;
    try {
        const q = query(collection(firestore, 'members'), where("id", "==", id));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            return NextResponse.json({ error: 'Not found a member with a specific ID.' }, { status: 300 });
        }

        const targetDoc = snapshot.docs[0];
        const docRef = doc(firestore, "members", targetDoc.id);

        await updateDoc(docRef, {
            settings: settings
        });
        return NextResponse.json({ message: '데이터 수정이 정상적으로 처리도었습니다.' }, { status: 200 });
    } catch(error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed load Database.' }, { status: 500 });
    }
}