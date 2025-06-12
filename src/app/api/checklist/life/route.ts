import { firestore } from "@/utiils/firebase";
import { collection, doc, getDocs, limit, query, updateDoc, where } from "firebase/firestore";
import { NextRequest, NextResponse } from "next/server";

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

        const lifeObj = data.life;
        return NextResponse.json(lifeObj);
    } catch(error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed load Database.' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const body = await req.json();
    const id = body.id;
    const life = body.life;
    const max = body.max;
    const isNotValue = Boolean(body.isNotValue);
    const isBlessing = Boolean(body.isBlessing);
    const today = new Date();

    try {
        const q = query(collection(firestore, 'members'), where("id", "==", id), limit(1));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            return NextResponse.json({ error: 'Not found a member with a specific ID.' }, { status: 300 });
        }

        const targetDoc = snapshot.docs[0];
        const docRef = doc(firestore, "members", targetDoc.id);

        const data = targetDoc.data();
        const lifeDate = data.life ? new Date(data.life.date.seconds * 1000 + data.life.date.nanoseconds / 1_000_000) : new Date();

        const lifeObj = {
            life: life,
            date: isNotValue ? lifeDate : today,
            max: max,
            isBlessing: isBlessing
        }
        await updateDoc(docRef, {
            life: lifeObj
        });
        return NextResponse.json({ message: '데이터 수정이 정상적으로 처리도었습니다.' }, { status: 200 });
    } catch(error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed load Database.' }, { status: 500 });
    }
}