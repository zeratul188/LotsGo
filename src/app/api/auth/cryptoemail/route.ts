import { encrypt } from "@/utiils/crypto";
import admin from "firebase-admin";
import { NextRequest, NextResponse } from "next/server";

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

export async function POST(req: NextRequest) {
    const db = admin.firestore();
    try {
        const membersRef = db.collection('members');
        const snapshot = await membersRef.get();
        const batch = db.batch();

        snapshot.forEach((doc) => {
            const email = doc.data().email;
            const newEmail = encrypt(email, secretKey);
            const docRef = membersRef.doc(doc.id);
            batch.update(docRef, { email: newEmail });
        });

        await batch.commit();
        return NextResponse.json({ message: '데이터 작업이 정상적으로 처리되었습니다.' }, { status: 200 });
    } catch(error) {
        console.error(error);
        return NextResponse.json({ error: '데이터를 처리하는데 오류가 발생하였습니다.' }, { status: 500 });
    }
}