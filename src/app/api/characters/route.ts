import { firestore } from "@/utiils/firebase";
import { collection, collectionGroup, doc, getDoc, getDocs, limit, query, serverTimestamp, setDoc, where, writeBatch } from "firebase/firestore";
import { NextRequest, NextResponse } from "next/server";

function normalizeCharacter(character: any) {
    if (!character?.equipment?.orb) return character;

    const score = typeof character.equipment.orb.score === "number" ? character.equipment.orb.score : 0;
    return {
        ...character,
        equipment: {
            ...character.equipment,
            orb: {
                ...character.equipment.orb,
                score
            }
        }
    };
}

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const nickname = searchParams.get('nickname');
    const encodeNickname = encodeURIComponent(nickname || '');

    try {
        const indexQuery = query(
            collection(firestore, 'expeditionIndexs'),
            where('nickname', '==', nickname),
            limit(1)
        );
        const indexSnapshot = await getDocs(indexQuery);
        if (indexSnapshot.empty) throw new Error("CHAARACTER_NOT_FOUND");
        const indexData = indexSnapshot.docs[0].data();
        const expeditionId = indexData.expeditionId;
        const expeditionRef = doc(firestore, 'expeditions', expeditionId);
        const characterRef = doc(expeditionRef, 'expeditionCharacters', encodeNickname);
        if (!expeditionRef) throw new Error("CHAARACTER_NOT_FOUND");
        const expeditionSnapshot = await getDoc(expeditionRef);
        if (!expeditionSnapshot.exists()) throw new Error("CHAARACTER_NOT_FOUND");
        const characterDoc = await getDoc(characterRef);
        const expeditionData = expeditionSnapshot.data();
        if (!characterDoc.exists()) {
            return NextResponse.json({ 
                titles: expeditionData.titles ?? [], 
                expeditions: expeditionData.expeditions ?? [],
                attackPieces: expeditionData.attackPieces ?? [],
                supportorPieces: expeditionData.supportorPieces ?? []
            });
        }
        const { date, ...character } = characterDoc.data();
        const normalizedCharacter = normalizeCharacter(character);

        return NextResponse.json({ 
            date,
            character: normalizedCharacter, 
            titles: expeditionData.titles ?? [], 
            expeditions: expeditionData.expeditions ?? [],
            attackPieces: expeditionData.attackPieces ?? [],
            supportorPieces: expeditionData.supportorPieces ?? []
        });
    } catch(e: any) {
        if (e.message === "CHAARACTER_NOT_FOUND") {
            return NextResponse.json({ error: '캐릭터를 찾을 수 없습니다.' }, { status: 401 });
        }
        console.log(e);
        return NextResponse.json({ error: 'Failed load Database.' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const body = await req.json();
    const nickname = body.nickname;
    const characterInfo = body.characterInfo;
    const expeditions = body.expeditions;
    const titles = body.titles;
    const attackPieces = body.attackPieces;
    const supportorPieces = body.supportorPieces;
    const encodeNickname = encodeURIComponent(nickname);

    try {
        const indexQuery = query(
            collection(firestore, 'expeditionIndexs'),
            where('nickname', '==', nickname),
            limit(1)
        );
        const indexSnapshot = await getDocs(indexQuery);
        if (!indexSnapshot.empty) {
            const indexData = indexSnapshot.docs[0].data();
            const expeditionId = indexData.expeditionId;
            const expeditionRef = doc(firestore, 'expeditions', expeditionId);
            await setDoc(expeditionRef, { titles, expeditions, attackPieces, supportorPieces });
            const characterRef = doc(firestore, 'expeditions', expeditionId, 'expeditionCharacters', encodeNickname);
            await syncExpeditionIndexs(expeditionId, expeditions);
            await setDoc(characterRef, {
                ...characterInfo,
                date: serverTimestamp()
            });
            return NextResponse.json({ message: '데이터 저장에 성공하였습니다.' });
        }

        const batch = writeBatch(firestore);

        const expeditionRef = doc(collection(firestore, 'expeditions'));
        batch.set(expeditionRef, { titles, expeditions, attackPieces, supportorPieces });
        const characterRef = doc(expeditionRef, 'expeditionCharacters', encodeNickname);
        batch.set(characterRef, {
            ...characterInfo,
            date: serverTimestamp()
        });
        const expeditionId = expeditionRef.id;

        expeditions.forEach((character: any) => {
            const indexRef = doc(collection(firestore, 'expeditionIndexs'));
            batch.set(indexRef, {
                expeditionId, 
                nickname: character.nickname
            });
        });
        await batch.commit();

        return NextResponse.json({ message: '데이터 저장에 성공하였습니다.' });
    } catch(error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed load Database.' }, { status: 500 });
    }
}

type IndexData = {
    nickname: string,
    id: string
}

// index 데이터 최신화
async function syncExpeditionIndexs(expeditionId: string, expeditions: any[]) {
    const expeditionSet = new Set<string>(expeditions.map(character => character.nickname));

    const indexQuery = query(
        collection(firestore, 'expeditionIndexs'),
        where('expeditionId', '==', expeditionId)
    );
    const indexSnapshot = await getDocs(indexQuery);
    const indexSet = new Set<IndexData>();
    indexSnapshot.docs.forEach(doc => {
        const data = doc.data();
        indexSet.add({
            nickname: data.nickname,
            id: doc.id
        });
    });
    const indexNicknameSet = new Set([...indexSet].map(data => data.nickname));
    const toAdd: string[] = [...expeditionSet].filter(nickname => !indexNicknameSet.has(nickname));
    const toRemove: IndexData[] = [...indexSet].filter(data => !expeditionSet.has(data.nickname));

    const batch = writeBatch(firestore);

    for (const nickname of toAdd) {
        const indexRef = doc(collection(firestore, 'expeditionIndexs'));
        batch.set(indexRef, { expeditionId, nickname }, { merge: false });
    }

    for (const data of toRemove) {
        const characterQuery = query(
            collectionGroup(firestore, 'expeditionCharacters'),
            where('nickname', '==', data.nickname)
        );
        const characterSnapshot = await getDocs(characterQuery);
        if (!characterSnapshot.empty) {
            characterSnapshot.docs.forEach(snapshot => { batch.delete(snapshot.ref) });
        }
        const indexRef = doc(firestore, "expeditionIndexs", data.id);
        batch.delete(indexRef);
    }
    await batch.commit();
}
