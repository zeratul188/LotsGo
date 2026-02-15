import { collection, getDocs, limit, query, updateDoc, orderBy, startAfter } from "firebase/firestore";
import { firestore } from "@/utiils/firebase";
import { NextResponse } from "next/server";

export async function POST() {
    const DAYS_60_MS = 60 * 24 * 60 * 60 * 1000;
    const sessionsRef = collection(firestore, "sessions");

    let q = query(sessionsRef, orderBy("createdAt"), limit(400));
    let totalUpdated = 0;

    while (true) {
        const snapshot = await getDocs(q);
        if (snapshot.empty) break;

        for (const docSnap of snapshot.docs) {
            const data = docSnap.data();

            if (data.deleteAfter) continue;

            const createdAt = data.createdAt?.toDate
                ? data.createdAt.toDate()
                : new Date();

            const deleteAfter = new Date(createdAt.getTime() + DAYS_60_MS);

            await updateDoc(docSnap.ref, { deleteAfter });
            totalUpdated++;
        }

        const lastDoc = snapshot.docs[snapshot.docs.length - 1];
        q = query(
            sessionsRef,
            orderBy("createdAt"),
            startAfter(lastDoc),
            limit(400)
        );
    }

    return NextResponse.json({ updated: totalUpdated });
}
