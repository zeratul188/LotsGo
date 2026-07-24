import { NextRequest, NextResponse } from "next/server";
import { collection, getDocs, limit, query, where } from "firebase/firestore";
import { firestore } from "@/utiils/firebase";
import { decrypt } from "@/utiils/crypto";
import { adminAuth } from "@/utiils/firebaseAdmin";

const secretKey = process.env.NEXT_PUBLIC_SECRET_KEY ? process.env.NEXT_PUBLIC_SECRET_KEY : 'null';

export async function POST(req: NextRequest) {
    const { id } = await req.json();

    if (typeof id !== 'string' || !id.trim()) {
        return NextResponse.json({ type: 'id', error: '아이디를 입력해주세요.' }, { status: 400 });
    }

    const memberQuery = query(collection(firestore, 'members'), where('id', '==', id.trim()), limit(1));
    const memberSnapshot = await getDocs(memberQuery);

    if (memberSnapshot.empty) {
        return NextResponse.json({ type: 'id', error: '해당 아이디를 가진 회원 정보가 없습니다.' }, { status: 404 });
    }

    const email = decrypt(memberSnapshot.docs[0].data().email, secretKey);
    if (!email) {
        return NextResponse.json({ type: 'identity', error: '회원 인증 정보를 확인할 수 없습니다.' }, { status: 500 });
    }

    let hasFirebaseAuth = true;
    try {
        await adminAuth.getUserByEmail(email);
    } catch (error: any) {
        if (error?.code === 'auth/user-not-found') {
            hasFirebaseAuth = false;
        } else {
            throw error;
        }
    }

    return NextResponse.json({ email, hasFirebaseAuth });
}
