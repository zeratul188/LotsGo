import admin from "firebase-admin";
import { NextRequest, NextResponse } from "next/server";

if (!admin.apps.length) {
    admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.NEXT_PUBLIC_FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.NEXT_PUBLIC_FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
    databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL
  });
}

export type Badge = {
    uid: string,
    nickname: string,
    id: string
}

export async function GET(_req: NextRequest) {
    const db = admin.firestore();
    try {
        const donateRef = db.collection('badge');
        const snapshot = await donateRef.get();

        const badges: Badge[] = [];
        snapshot.forEach((doc) => {
            const newBadge: Badge = {
                uid: doc.id,
                nickname: doc.data().nickname,
                id: doc.data().id
            }
            badges.push(newBadge);
        });

        return NextResponse.json(badges);
    } catch(error) {
        console.error(error);
        return NextResponse.json({ error: '데이터를 처리하는데 오류가 발생하였습니다.' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const body = await req.json();
    const badges = body.badges;
    const db = admin.firestore();
    try {
        const deleteBatch = db.batch();
        const badgeRef = db.collection('badge');
        const snapshot = await badgeRef.get();
        snapshot.forEach(doc => deleteBatch.delete(doc.ref));
        await deleteBatch.commit();
        const inputBatch = db.batch();
        badges.forEach((item: Badge) => {
            const ref = db.collection('badge').doc();
            const autoID = ref.id;
            item.uid = autoID;
            inputBatch.set(ref, item);
        });
        await inputBatch.commit();
        return NextResponse.json({ message: '데이터 작업이 정상적으로 처리되었습니다.', badges: badges }, { status: 200 });
    } catch(error) {
        console.error(error);
        return NextResponse.json({ error: '데이터를 처리하는데 오류가 발생하였습니다.' }, { status: 500 });
    }
}