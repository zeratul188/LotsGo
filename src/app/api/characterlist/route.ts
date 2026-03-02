import { firestore } from "@/utiils/firebase";
import { collection, doc, getDoc, getDocs, limit, query, where } from "firebase/firestore";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const characterName = searchParams.get("characterName");

    if (!characterName) {
        return NextResponse.json({ error: "characterName is required." }, { status: 400 });
    }

    try {
        const indexQuery = query(
            collection(firestore, "expeditionIndexs"),
            where("nickname", "==", characterName),
            limit(1)
        );
        const indexSnapshot = await getDocs(indexQuery);
        if (indexSnapshot.empty) {
            return NextResponse.json({ error: "Character not found." }, { status: 404 });
        }

        const expeditionId = indexSnapshot.docs[0].data().expeditionId as string;
        if (!expeditionId) {
            return NextResponse.json({ error: "expeditionId not found." }, { status: 404 });
        }

        const expeditionRef = doc(firestore, "expeditions", expeditionId);
        const expeditionSnapshot = await getDoc(expeditionRef);
        if (!expeditionSnapshot.exists()) {
            return NextResponse.json({ error: "Expedition not found." }, { status: 404 });
        }

        const expeditionCharactersSnapshot = await getDocs(collection(expeditionRef, "expeditionCharacters"));
        const expeditionCharacters = expeditionCharactersSnapshot.docs.map((snapshot) => ({
            id: snapshot.id,
            ...snapshot.data()
        }));

        return NextResponse.json({ expeditionCharacters });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed load Database." }, { status: 500 });
    }
}
