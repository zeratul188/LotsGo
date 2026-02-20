import { firestore } from "@/utiils/firebase";
import { arrayRemove, collection, deleteDoc, doc, getDocs, limit, query, updateDoc, where } from "firebase/firestore";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const body = await req.json();
    const id = body.id;

    try {
        const q = query(collection(firestore, 'members'), where("id", "==", id), limit(1));
        const snapshot = await getDocs(q);

        if (snapshot.empty) throw new Error("ID_NOT_FOUND");

        const raidQuery = query(collection(firestore, 'raids'), where('members', 'array-contains', id));
        const raidSnapshot = await getDocs(raidQuery);
        if (!raidSnapshot.empty) {
            await Promise.all(
                raidSnapshot.docs.map((docSnap) =>
                    updateDoc(docSnap.ref, { members: arrayRemove(id) })
                )
            );
        }
        
        const targetDoc = snapshot.docs[0];
        const docRef = doc(firestore, "members", targetDoc.id);
        await deleteDoc(docRef);
        return NextResponse.json({ message: '데이터 처리가 정상적으로 처리되었습니다.' }, { status: 200 });
    } catch(e: any) {
        if (e.message === "ID_NOT_FOUND") {
            return NextResponse.json({ error: '해당 ID를 가진 회원정보를 찾을 수 없습니다.' }, { status: 400 });
        }
        return NextResponse.json({ error: 'Failed load Database.' }, { status: 500 });
    }
}