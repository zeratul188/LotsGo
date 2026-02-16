import { History } from "@/app/setting/model/types";
import { firestore } from "@/utiils/firebase";
import { collection, getDocs, limit, query, where } from "firebase/firestore";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    try {
        const authHeader = req.headers.get("authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) throw new Error("AUTH_NOT_TYPES");
        const userId = authHeader.split(' ')[1];

        const sessionQuery = query(
            collection(firestore, 'sessions'),
            where('userId', '==', userId)
        )
        const sessionSnapshot = await getDocs(sessionQuery);
        const historys: History[] = [];
        sessionSnapshot.forEach(sessionDoc => {
            const data = sessionDoc.data();
            historys.push({
                id: sessionDoc.id,
                createdAt: data.createdAt ?? null,
                expiresAt: data.expiresAt ?? null,
                ipAddress: data.ipAddress,
                lastUsedAt: data.lastUsedAt ?? null,
                revokedAt: data.revokedAt ?? null,
                revoked: data.revoked
            });
        });
        return NextResponse.json({ historys: historys });
    } catch(e: any) {
        if (e.message === "AUTH_NOT_TYPES") {
            return NextResponse.json({ error: 'API 요청이 잘못되었습니다.' }, { status: 400 });
        }
        return NextResponse.json({ error: '데이터 처리 중 문제가 발생하였습니다.' }, { status: 500 });
    }
}