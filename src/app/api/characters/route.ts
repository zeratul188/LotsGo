import { CharacterFile, CharacterInfo } from "@/app/character/characterFeat";
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
        const expeditions: CharacterInfo[] = data.expeditions;
        const combatPower = data.combatPower ?? 0;
        return NextResponse.json({ file, date, expeditions, combatPower });
    } catch(error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed load Database.' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const body = await req.json();
    const nickname = body.nickname;
    const file: CharacterFile = body.file;
    const expeditions: CharacterInfo[] = body.expeditions;
    const today = new Date();
    const combatPower: number = Number(body.combatPower);

    try {
        const q = query(collection(firestore, 'characters'), where('nickname', '==', nickname), limit(1));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            const data = {
                nickname: nickname,
                date: today,
                expeditions: expeditions,
                file: file,
                combatPower: combatPower
            }
            await addDoc(collection(firestore, 'characters'), data);
            return NextResponse.json({ error: '데이터를 추가하는데 정상적으로 처리되었습니다.' });
        }

        const targetDoc = snapshot.docs[0];
        const docRef = doc(firestore, 'characters', targetDoc.id);

        const nowCombatPower: number = targetDoc.data().combatPower ?? 0;
        let maxCombatPower: number = nowCombatPower;

        if (nowCombatPower < combatPower) {
            maxCombatPower = combatPower;
        }

        await updateDoc(docRef, {
            date: today,
            expeditions: expeditions,
            file: file,
            combatPower: maxCombatPower
        });
        return NextResponse.json({ message: '데이터 저장이 정상적으로 처리되었습니다.' }, { status: 200 });
    } catch(error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed load Database.' }, { status: 500 });
    }
}