import { hashToken } from "@/lib/auth";
import { firestore } from "@/utiils/firebase";
import { collection, deleteDoc, getDocs, limit, query, updateDoc, where } from "firebase/firestore";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const refreshToken = req.cookies.get('refreshToken')?.value;
        if (refreshToken) {
            const refreshHash = hashToken(refreshToken);
            const sessionQuery = query(collection(firestore, 'sessions'), where('refreshTokenHash', '==', refreshHash), limit(1));
            const sessionSnapshot = await getDocs(sessionQuery);
            if (sessionSnapshot.empty) throw new Error('TOKEN_NOT_FOUND');
            await deleteDoc(sessionSnapshot.docs[0].ref);
        }

        const res = NextResponse.json({ message: 'logout'});
        res.cookies.set({
            name: "refreshToken",
            value: "",
            maxAge: 0
        });
        return res;
    } catch(e: any) {
        if (e.message === 'TOKEN_NOT_FOUND') {
            return NextResponse.json({ message: '토큰을 찾을 수 없습니다.' }, { status: 401 });
        }
        return NextResponse.json({ error: '데이터 처리 중 문제가 발생하였습니다.' }, { status: 500 });
    }
}