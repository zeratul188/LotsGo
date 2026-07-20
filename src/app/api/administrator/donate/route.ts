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

export type Donate = {
    uid: string,
    id: string,
    price: number,
    date: Date,
    memo: string
}

const membersRef = () => admin.firestore().collection('members');

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
                id: String(data.id ?? '').trim(),
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
                const id = String(newDonate?.id ?? '').trim();
                if (!id) {
                    return NextResponse.json({ error: '후원자 ID가 필요합니다.' }, { status: 400 });
                }

                const newDonateRef = donateRef.doc();
                const memberSnapshot = await membersRef().where('id', '==', id).limit(1).get();
                const batch = db.batch();
                batch.set(newDonateRef, { ...newDonate, id });
                if (!memberSnapshot.empty) {
                    batch.update(memberSnapshot.docs[0].ref, { isSupporter: true });
                }
                await batch.commit();

                return NextResponse.json({ message: '데이터 작업이 정상적으로 처리되었습니다.', id: newDonateRef.id }, { status: 200 });
            case 'remove':
                const uid = body.uid;
                const deletedDonateRef = donateRef.doc(uid);
                await db.runTransaction(async (transaction) => {
                    const deletedDonateSnapshot = await transaction.get(deletedDonateRef);
                    if (!deletedDonateSnapshot.exists) {
                        throw new Error('DONATE_NOT_FOUND');
                    }

                    const deletedDonateId = String(deletedDonateSnapshot.data()?.id ?? '').trim();
                    const remainingDonatesSnapshot = deletedDonateId
                        ? await transaction.get(donateRef.where('id', '==', deletedDonateId))
                        : null;
                    const memberSnapshot = deletedDonateId
                        ? await transaction.get(membersRef().where('id', '==', deletedDonateId).limit(1))
                        : null;

                    transaction.delete(deletedDonateRef);
                    if (deletedDonateId && remainingDonatesSnapshot?.size === 1 && memberSnapshot && !memberSnapshot.empty) {
                        transaction.update(memberSnapshot.docs[0].ref, { isSupporter: false });
                    }
                });
                return NextResponse.json({ message: '데이터 작업이 정상적으로 처리되었습니다.' }, { status: 200 });
        }
    } catch(error) {
        if (error instanceof Error && error.message === 'DONATE_NOT_FOUND') {
            return NextResponse.json({ error: '후원 내역을 찾을 수 없습니다.' }, { status: 404 });
        }
        return NextResponse.json({ error: '데이터를 처리하는데 오류가 발생하였습니다.' }, { status: 500 });
    }
}
