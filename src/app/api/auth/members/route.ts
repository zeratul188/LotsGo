import { Character } from "@/app/store/loginSlice";
import { firestore } from "@/utiils/firebase";
import { collection, deleteDoc, doc, getDocs, limit, query, where } from "firebase/firestore";
import { NextRequest, NextResponse } from "next/server";
import admin from "firebase-admin";
import { decrypt } from "@/utiils/crypto";

if (!admin.apps.length) {
    admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.NEXT_PUBLIC_FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.NEXT_PUBLIC_FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}
const secretKey = process.env.NEXT_PUBLIC_SECRET_KEY ? process.env.NEXT_PUBLIC_SECRET_KEY : 'null';

export type Member = {
    docID: string,
    uid: string,
    id: string,
    character: string,
    email: string,
    expeditions: Character[],
    loginDate: Date | undefined
}

export async function GET(_req: NextRequest) {
    try {
        const snapshot = await getDocs(collection(firestore, 'members'));
        const members: Member[] = snapshot.docs.map(doc => ({
            docID: doc.id,
            uid: doc.data().uid,
            id: doc.data().id,
            character: doc.data().character,
            email: decrypt(doc.data().email, secretKey),
            expeditions: doc.data().expeditions,
            loginDate: doc.data().loginDate
        }));
        return NextResponse.json(members);
    } catch(error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed load Database.' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const body = await req.json();
    const uid = body.uid;
    const id = body.id;

    try {
        const q = query(collection(firestore, 'members'), where("id", "==", id), limit(1));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            return NextResponse.json({ error: 'Not found a member with a specific ID.' }, { status: 300 });
        }

        const targetDoc = snapshot.docs[0];
        const docRef = doc(firestore, "members", targetDoc.id);

        await deleteDoc(docRef);
        if (uid) await admin.auth().deleteUser(uid);
        return NextResponse.json({ message: '데이터 삭제가 정상적으로 처리되었습니다.' }, { status: 200 });
    } catch(error) {
        return NextResponse.json({ error: '데이터를 처리하는데 오류가 발생하였습니다.' }, { status: 500 });
    }
}