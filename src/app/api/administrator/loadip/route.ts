import { firestore } from "@/utiils/firebase";
import { doc, getDoc } from "firebase/firestore";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {{
    try {
        const authHeader = req.headers.get("authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) throw new Error("AUTH_NOT_TYPES");
        const sessionId = authHeader.split(' ')[1];

        const sessionRef = doc(firestore, 'sessions', sessionId);
        const sessionSnapshot = await getDoc(sessionRef);
        if (!sessionSnapshot.exists()) throw new Error("SESSION_NOT_FOUND");

        const sessionData = sessionSnapshot.data();
        return NextResponse.json({ ip: sessionData.ipAddress ?? '-' });
    } catch(e: any) {
        if (e.message === "SESSION_NOT_FOUND") {
            return NextResponse.json({ error: 'API 요청이 잘못되었습니다.' }, { status: 400 });
        }
        return NextResponse.json({ error: '데이터 처리 중 문제가 발생하였습니다.' }, { status: 500 });
    }
}}