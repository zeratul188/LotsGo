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

export type Donate = {
    uid: string,
    id: string,
    price: number,
    date: Date,
    memo: string
}
export async function GET(_req: NextRequest) {
    const db = admin.firestore();
    try {
        const donateRef = db.collection('donate');
        const snapshot = await donateRef.get();
        
        const donates: any[] = [];
        snapshot.forEach((doc) => {
            const data = doc.data();
            const newDonate = {
                uid: doc.id,
                id: data.id,
                price: Number(data.price),
                date: data.date,
                memo: data.memo
            }
            donates.push(newDonate);
        });

        return NextResponse.json(donates);
    } catch(error) {
        console.error(error);
        return NextResponse.json({ error: '데이터를 처리하는데 오류가 발생하였습니다.' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const body = await req.json();
    const type = body.type;
    const db = admin.firestore();
    try {
        const donateRef = db.collection('donate');
        switch(type) {
            case 'add':
                const newDonate = body.newDonate;
                const docID = await donateRef.add(newDonate);
                return NextResponse.json({ message: '데이터 작업이 정상적으로 처리되었습니다.', id: docID.id }, { status: 200 });
            case 'remove':
                const uid = body.uid;
                await db.collection('donate').doc(uid).delete();
                return NextResponse.json({ message: '데이터 작업이 정상적으로 처리되었습니다.' }, { status: 200 });
        }
    } catch(error) {
        return NextResponse.json({ error: '데이터를 처리하는데 오류가 발생하였습니다.' }, { status: 500 });
    }
}