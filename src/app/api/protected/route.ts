import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.LOSTARK_JWT_SECRET!;

export async function GET(req: NextRequest) {
    try {
        const authHeader = req.headers.get('authorization');

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ message: '토큰이 존재하지 않습니다.' }, { status: 401 });
        }

        console.log(JWT_SECRET);
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET);

        return NextResponse.json({
            message: '인증된 사용자입니다.',
            result: decoded
        });
    } catch(err: any) {
        console.error(err);
        if (err.name === 'TokenExpiredError') {
            return NextResponse.json({ message: '토큰이 만료되었습니다.' }, { status: 401 });
        }
        return NextResponse.json({ message: '토큰을 검증할 수 없습니다.' }, { status: 401 });
    }
}