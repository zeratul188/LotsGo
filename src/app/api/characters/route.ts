import { CharacterFile } from "@/app/character/characterFeat";
import { firestore } from "@/utiils/firebase";
import { addDoc, collection, doc, getDocs, limit, query, updateDoc, where } from "firebase/firestore";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const nickname = searchParams.get('nickname');

    try {
        const q = query(collection(firestore, 'characters'), where('nickname', '==', nickname), limit(1));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            return NextResponse.json({ error: 'Not found a member with a specific Nickname.' }, { status: 401 });
        }

        const targetDoc = snapshot.docs[0];
        const data = targetDoc.data();

        const file: CharacterFile = data.file;
        const date: Date = data.date;
        return NextResponse.json({ file, date });
    } catch(error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed load Database.' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const body = await req.json();
    const nickname = body.nickname;
    const file: CharacterFile = body.file;
    const today = new Date();

    try {
        const q = query(collection(firestore, 'characters'), where('nickname', '==', nickname), limit(1));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            const data = {
                nickname: nickname,
                date: today,
                file: file
            }
            await addDoc(collection(firestore, 'characters'), data);
            return NextResponse.json({ error: '데이터를 추가하는데 정상적으로 처리되었습니다.' });
        }

        const targetDoc = snapshot.docs[0];
        const docRef = doc(firestore, 'characters', targetDoc.id);

        await updateDoc(docRef, {
            date: today,
            file: file
        });
        return NextResponse.json({ message: '데이터 저장이 정상적으로 처리되었습니다.' }, { status: 200 });
    } catch(error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed load Database.' }, { status: 500 });
    }
}