import { NextRequest, NextResponse } from "next/server";
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.LOSTARK_JWT_SECRET!;

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');

    try {
        if (!token) throw new Error("TOKEN_IS_UNDEFINED");
        const decodedToken = jwt.verify(token, JWT_SECRET) as any;
        return NextResponse.json({ isAdministrator: decodedToken.isAdministrator ?? false });
    } catch(e: any) {
        if (e.message === "TOKEN_IS_UNDEFINED") {
            return NextResponse.json({ type: 'id', error: '토큰의 데이터가 잘못되었습니다.' }, { status: 400 });
        }
        return NextResponse.json({ type: 'null', error: '데이터 처리 중 문제가 발생하였습니다.' }, { status: 500 });
    }
}