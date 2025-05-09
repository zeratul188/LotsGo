import { NextRequest, NextResponse } from "next/server";
import jwt from 'jsonwebtoken';
import { database } from "@/utiils/firebase";
import { ref, get } from "firebase/database";
import { isMatchValue } from "@/utiils/bcrypt";
import type { Character } from "@/app/store/loginSlice";

type User = {
    id: string,
    password: string
}

export async function POST(req: NextRequest) {
    const { id, password } = await req.json();

    const userRef = ref(database, `/members/${id}`);
    const snapshot = await get(userRef);

    const administratorRef = ref(database, `/administrator`);

    const userData: User = {
        id: snapshot.child('id').val(),
        password: snapshot.child('password').val()
    }
    const expedition: Array<Character> = snapshot.exists() ? snapshot.child('expeditions').val() : [];
    const administratorSnapshot = await get(administratorRef);
    const administrator = {
        id: administratorSnapshot.child('id').val(),
        password: administratorSnapshot.child('password').val()
    }
    const result = {
        id: id,
        isAdministrator: false
    }

    if (id === administrator.id) {
        if (!(await isMatchValue(password, administrator.password))) {
            return NextResponse.json({ message: '비밀번호가 일치하지 않습니다.' }, { status: 401 });
        }
        result.isAdministrator = true;
        const isAdministrator = result.isAdministrator;
        const token = jwt.sign({ result }, process.env.NEXT_PUBLIC_LOSTARK_JWT_SECRET!, { expiresIn: '1d' });
        return NextResponse.json({ token, expedition, isAdministrator });
    }

    if (!snapshot.exists()) {
        return NextResponse.json({ message: '아이디가 존재하지 않습니다.' }, { status: 401 });
    }

    if (!(await isMatchValue(password, userData.password))) {
        return NextResponse.json({ message: '비밀번호가 일치하지 않습니다.' }, { status: 401 });
    }

    const isAdministrator = result.isAdministrator;
    const token = jwt.sign({ result }, process.env.NEXT_PUBLIC_LOSTARK_JWT_SECRET!, { expiresIn: '3d' });
    return NextResponse.json({ token, expedition, isAdministrator });
}