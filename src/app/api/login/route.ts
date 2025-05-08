import { NextRequest, NextResponse } from "next/server";
import jwt from 'jsonwebtoken';
import { database } from "@/utiils/firebase";
import { ref, get } from "firebase/database";
import { isMatchValue } from "@/utiils/bcrypt";

type User = {
    id: string,
    password: string
}

export async function POST(req: NextRequest) {
    const { id, password } = await req.json();

    const userRef = ref(database, `/members/${id}`);
    const snapshot = await get(userRef);

    if (!snapshot.exists()) {
        return NextResponse.json({ message: '아이디가 존재하지 않습니다.' }, { status: 401 });
    }

    const userData: User = {
        id: snapshot.child('id').val(),
        password: snapshot.child('password').val()
    }

    if (!(await isMatchValue(password, userData.password))) {
        return NextResponse.json({ message: '비밀번호가 일치하지 않습니다.' }, { status: 401 });
    }

    const token = jwt.sign({ id }, process.env.NEXT_PUBLIC_LOSTARK_JWT_SECRET!, { expiresIn: '3d' });
    return NextResponse.json({ token });
}