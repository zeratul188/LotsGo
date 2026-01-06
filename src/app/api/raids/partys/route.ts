import { firestore } from "@/utiils/firebase";
import { doc, getDoc } from "firebase/firestore";
import { NextRequest, NextResponse } from "next/server";
import { Party } from "../route";

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