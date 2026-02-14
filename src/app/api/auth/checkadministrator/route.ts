import { NextRequest, NextResponse } from "next/server";
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.LOSTARK_JWT_SECRET!;

export async function GET(req: NextRequest) {
    try {
        const authHeader = req.headers.get("authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) throw new Error("AUTH_NOT_TYPES");
        const token = authHeader.split(' ')[1];

        if (!token) throw new Error("TOKEN_IS_UNDEFINED");
        const decodedToken = jwt.verify(token, JWT_SECRET) as any;
        return NextResponse.json({ isAdministrator: decodedToken.isAdministrator ?? false });
    } catch(e: any) {
        if (e.message === "AUTH_NOT_TYPES") {
            return NextResponse.json({ type: 'null', error: 'API 요청이 잘못되었습니다.' }, { status: 400 });
        }
        if (e.message === "TOKEN_IS_UNDEFINED") {
            return NextResponse.json({ type: 'null', error: '토큰의 데이터가 잘못되었습니다.' }, { status: 400 });
        }
        if (e.name === 'TokenExpiredError') {
            return NextResponse.json({ type: 'expired', error: '유효기간이 지났습니다.' }, { status: 400 });
        }
        return NextResponse.json({ type: 'null', error: '데이터 처리 중 문제가 발생하였습니다.' }, { status: 500 });
    }
}