import { firestore } from "@/utiils/firebase";
import { addDoc, collection, deleteDoc, doc, getDocs } from "firebase/firestore";
import { NextRequest, NextResponse } from "next/server";

export type Cube = {
    id: string,
    name: string,
    level: number
}

export async function GET(_req: NextRequest) {
    try {
        const snapshot = await getDocs(collection(firestore, 'cube'));
        const cubes: Cube[] = snapshot.docs.map(doc => ({
            id: doc.id,
            name: doc.data().name,
            level: Number(doc.data().level)
        }));
        return NextResponse.json(cubes);
    } catch(error) {
        return NextResponse.json({ error: 'Failed load Database.' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const body = await req.json();
    const type: string = body.type;
    try {
        switch(type) {
            case "add":
                const level = Number(body.level);
                const cube = {
                    name: body.name,
                    level: Number.isNaN(level) ? 0 : level
                }
                const addRef = await addDoc(collection(firestore, 'cube'), cube);
                return NextResponse.json({ message: '데이터 추가가 정상적으로 처리도었습니다.', id: addRef.id }, { status: 200 });
            case 'remove':
                const id = body.id;
                if (!id) {
                    return NextResponse.json({ error: "문서 ID가 존재하지 않습니다." }, { status: 400 });
                }
                const removeRef = doc(firestore, 'cube', id);
                await deleteDoc(removeRef);
                return NextResponse.json({ message: '데이터 삭제가 정상적으로 처리도었습니다.' }, { status: 200 });
            default:
                return NextResponse.json({ error: '처리 방식에 오류가 발생하였습니다.' }, { status: 500 });
        }
    } catch(error) {
        return NextResponse.json({ error: '데이터를 처리하는데 오류가 발생하였습니다.' }, { status: 500 });
    }
}