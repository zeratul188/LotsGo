import { Calendar } from "@/app/calendar/calendarFeat";
import { firestore } from "@/utiils/firebase";
import { collection, getDocs, limit, query, where } from "firebase/firestore";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    try {
        const q = query(collection(firestore, 'members'), where("id", "==", id), limit(1));
        const snapshot = await getDocs(q);
        
        if (snapshot.empty) {
            return NextResponse.json([]);
        }

        const data = snapshot.docs[0].data();
        const works: Calendar[] = data.works ? data.works : [];
        return NextResponse.json(works);
    } catch(error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed load Database.' }, { status: 500 });
    }
}