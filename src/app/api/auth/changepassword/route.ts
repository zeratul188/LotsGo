import { isMatchValue } from "@/utiils/bcrypt";
import { decrypt } from "@/utiils/crypto";
import { firestore } from "@/utiils/firebase";
import { collection, doc, getDocs, limit, query, updateDoc, where } from "firebase/firestore";
import { NextRequest, NextResponse } from "next/server";

const secretKey = process.env.NEXT_PUBLIC_SECRET_KEY ? process.env.NEXT_PUBLIC_SECRET_KEY : 'null';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const password: string = searchParams.get("password") ? searchParams.get("password")! : '';

    try {
        const q = query(collection(firestore, 'members'), where("id", '==', id), limit(1));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            return NextResponse.json({ error: 'Not found a member with a specific ID.' }, { status: 400 });
        }

        const targetDoc = snapshot.docs[0];
        const heshedPassword = targetDoc.data() ? targetDoc.data().password : 'null';
        const isSamePassword = await isMatchValue(password, heshedPassword);
        const email = targetDoc.data() ? targetDoc.data().email : '';
        const decryptEmail = decrypt(email, secretKey);

        return NextResponse.json({ isSamePassword, decryptEmail });
    } catch(error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed load Database.' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const body = await req.json();
    const id = body.id;
    const password = body.password;

    try {
        const q = query(collection(firestore, 'members'), where("id", "==", id), limit(1));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            return NextResponse.json({ error: 'Not found a member with a specific ID.' }, { status: 300 });
        }
        
        const targetDoc = snapshot.docs[0];
        const docRef = doc(firestore, "members", targetDoc.id);

        await updateDoc(docRef, {
            password: password
        });
        return NextResponse.json({ message: '데이터 처리가 정상적으로 처리도었습니다.' }, { status: 200 });
    } catch(error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed load Database.' }, { status: 500 });
    }
}