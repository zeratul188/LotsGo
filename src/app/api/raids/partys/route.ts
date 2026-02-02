import { Party, Raid } from "@/app/raids/model/types";
import { firestore } from "@/utiils/firebase";
import { doc, getDoc, runTransaction } from "firebase/firestore";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const raidId = searchParams.get('raidId');

    try {
        if (!raidId || raidId === 'null') {
            return NextResponse.json({ error: "raidId is required." }, { status: 400 });
        }

        const ref = doc(firestore, 'raids', raidId);
        const snap = await getDoc(ref);

        if (!snap.exists()) {
            return NextResponse.json({ error: "Raid not found." }, { status: 404 });
        }

        const data = snap.data() as { party?: Party[] };
        const partys: Party[] = data.party ?? [];
        return NextResponse.json(partys, { status: 200 });
    } catch(error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed load Database.' }, { status: 500 });
    }
}

type ActionType = "changeName";
type Handler = (body: any) => Promise<NextResponse>;

const handlers: Record<ActionType, Handler> = {
    changeName: async (body) => {
        const raidId = body.raidId;
        const changeName = body.changeName;
        try {
            const raidDoc = doc(firestore, "raids", raidId);
            await runTransaction(firestore, async (tx) => {
                const raidSnapshot = await tx.get(raidDoc);
                if (!raidSnapshot.exists()) throw new Error('RAID_NOT_FOUND');

                tx.update(raidDoc, { name: changeName });
            });
            return NextResponse.json({ message: '해당 레이드의 파티명을 수정하였습니다.' }, { status: 200 });
        } catch (e: any) {
            if (e.message === "RAID_NOT_FOUND") {
                return NextResponse.json({ error: '해당 레이드의 데이터를 찾을 수 없습니다.' }, { status: 400 });
            }
            console.log(e);
            return NextResponse.json({ error: '데이터 처리 중 문제가 발생하였습니다.' }, { status: 500 });
        }
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const type = body?.type as ActionType | undefined;

        if (!type || !(type in handlers)) return NextResponse.json({ error: "처리 종류(type)가 올바르지 않습니다." }, { status: 400 });

        return await handlers[type](body);
    } catch(error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed load Database.' }, { status: 500 });
    }
}