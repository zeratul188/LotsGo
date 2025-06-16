import { NextRequest, NextResponse } from "next/server";
import jwt from 'jsonwebtoken';
import { database, firestore } from "@/utiils/firebase";
import { ref, get } from "firebase/database";
import { isMatchValue } from "@/utiils/bcrypt";
import type { Character } from "@/app/store/loginSlice";
import { collection, getDocs, limit, query, where } from "firebase/firestore";

type User = {
    id: string,
    password: string,
    email: string,
    expeditions: Array<Character>,
    nickname: string
}

export async function POST(req: NextRequest) {
    const { id, password } = await req.json();
    
    const administratorRef = ref(database, `/administrator`);
    const administratorSnapshot = await get(administratorRef);
    const administrator = {
        id: administratorSnapshot.child('id').val(),
        password: administratorSnapshot.child('password').val()
    }

    try {
        const q = query(collection(firestore, 'members'), where("id", "==", id), limit(1));
        const snapshot = await getDocs(q);

        if (snapshot.empty && id !== administrator.id) {
            return NextResponse.json({ message: '아이디가 존재하지 않습니다.' }, { status: 404 });
        }

        const doc = snapshot.docs[0];
        const userData: User = !snapshot.empty ? {
            id: doc.data().id,
            password: doc.data().password,
            email: doc.data().email,
            expeditions: doc.data().expeditions,
            nickname: doc.data().character
        } : {
            id: "",
            password: "",
            email: '',
            expeditions: [],
            nickname: ""
        }
        const expedition: Array<Character> = !snapshot.empty ? userData.expeditions : [];
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

        if (userData.password === 'null') {
            const token = jwt.sign({ result }, process.env.NEXT_PUBLIC_LOSTARK_JWT_SECRET!, { expiresIn: '7d' });
            const isAdministrator = result.isAdministrator;
            return NextResponse.json({ token, userData, expedition, isAdministrator });
        }

        if (!(await isMatchValue(password, userData.password))) {
            return NextResponse.json({ message: '비밀번호가 일치하지 않습니다.' }, { status: 401 });
        }

        const isAdministrator = result.isAdministrator;
        const token = jwt.sign({ result }, process.env.NEXT_PUBLIC_LOSTARK_JWT_SECRET!, { expiresIn: '7d' });
        return NextResponse.json({ token, userData, expedition, isAdministrator });
    } catch(error) {
        console.error(error);
        return NextResponse.json({ message: 'Failed load Database.' }, { status: 500 });
    }
}