import { hashToken } from "@/lib/auth";
import { firestore } from "@/utiils/firebase";
import { collection, getDocs, limit, query, Timestamp, where, writeBatch } from "firebase/firestore";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
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
        const sessionDoc = tokenSnapshot.docs[0];
        const session = sessionDoc.data();
        const expiresAt: Date = typeof session.expiresAt?.toDate === "function"
            ? session.expiresAt.toDate()
            : new Date(session.expiresAt);
        if (expiresAt < new Date()) throw new Error("EXPIRED_TOKEN");
        const userId = session.userId;
        const allQuery = query(
            collection(firestore, 'sessions'), 
            where('userId', '==', userId),
            where('revoked', '==', false)
        );
        const allSnapshot = await getDocs(allQuery);
        const now = Timestamp.now();
        const targets = allSnapshot.docs.filter(data => data.id !== sessionDoc.id);
        for (let i = 0; i < targets.length; i += 450) {
            const chunk = targets.slice(i, i + 450);
            const batch = writeBatch(firestore);

            chunk.forEach(docSnapshot => {
                batch.update(docSnapshot.ref, { revoked: true, revokedAt: now });
            })

            await batch.commit();
        }
        return NextResponse.json({ revokedCount: targets.length });
    } catch(e: any) {
        if (e.message === "TOKEN_IS_UNDEFINED") {
            return NextResponse.json({ error: '로그인 정보가 저장되어잇지 않습니다.' }, { status: 400 });
        }
        if (e.message === "TOKEN_IS_EMPTY") {
            return NextResponse.json({ error: '로그인 정보를 찾을 수 없습니다.' }, { status: 400 });
        }
        if (e.message === "EXPIRED_TOKEN") {
            return NextResponse.json({ error: '로그인 시간이 만료되었습니다. 다시 로그인해주세요.' }, { status: 400 });
        }
        return NextResponse.json({ error: '데이터 처리 중 문제가 발생하였습니다.' }, { status: 500 });
    }
}