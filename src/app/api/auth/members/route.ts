import { Character } from "@/app/store/loginSlice";
import { firestore } from "@/utiils/firebase";
import { arrayRemove, collection, deleteDoc, doc, getDocs, limit, query, updateDoc, where } from "firebase/firestore";
import { NextRequest, NextResponse } from "next/server";
import admin from "firebase-admin";
import { decrypt } from "@/utiils/crypto";
import { hashToken } from "@/lib/auth";

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

export async function GET(req: NextRequest) {
    try {
        const refreshToken = req.cookies.get('refreshToken')?.value;
        if (!refreshToken) throw new Error('TOKEN_IS_UNDEFINED');
        const refreshHash = hashToken(refreshToken);

        const tokenQuery = query(
            collection(firestore, 'sessions'),
            where('refreshTokenHash', '==', refreshHash),
            where('revoked', '==', false),
            limit(1)
        );
        const tokenSnapshot = await getDocs(tokenQuery);
        if (tokenSnapshot.empty) throw new Error("TOKEN_IS_EMPTY");

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
    } catch(e: any) {
        if (e.message === "TOKEN_IS_EMPTY") {
            return NextResponse.json({ error: '로그인 정보를 찾을 수 없습니다.' }, { status: 400 });
        }
        return NextResponse.json({ error: 'Failed load Database.' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const body = await req.json();
    const uid = body.uid;
    const id = body.id;

    try {
        const refreshToken = req.cookies.get('refreshToken')?.value;
        if (!refreshToken) throw new Error('TOKEN_IS_UNDEFINED');
        const refreshHash = hashToken(refreshToken);

        const tokenQuery = query(
            collection(firestore, 'sessions'),
            where('refreshTokenHash', '==', refreshHash),
            where('revoked', '==', false),
            limit(1)
        );
        const tokenSnapshot = await getDocs(tokenQuery);
        if (tokenSnapshot.empty) throw new Error("TOKEN_IS_EMPTY");

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

        const sessionQuery = query(collection(firestore, 'sessions'), where('userId', '==', id));
        const sessionSnapshot = await getDocs(sessionQuery);
        if (!sessionSnapshot.empty) {
            await Promise.all(sessionSnapshot.docs.map(snapshot => deleteDoc(snapshot.ref)));
        }

        const targetDoc = snapshot.docs[0];
        const docRef = doc(firestore, "members", targetDoc.id);

        await deleteDoc(docRef);
        if (uid) await admin.auth().deleteUser(uid);
        return NextResponse.json({ message: '데이터 삭제가 정상적으로 처리되었습니다.' }, { status: 200 });
    } catch(e: any) {
        if (e.message === "ID_NOT_FOUND") {
            return NextResponse.json({ error: '해당 ID를 가진 회원정보를 찾을 수 없습니다.' }, { status: 400 });
        }
        if (e.message === "TOKEN_IS_EMPTY") {
            return NextResponse.json({ error: '로그인 정보를 찾을 수 없습니다.' }, { status: 400 });
        }
        return NextResponse.json({ error: '데이터를 처리하는데 오류가 발생하였습니다.' }, { status: 500 });
    }
}