import { NextRequest, NextResponse } from "next/server";
import admin from "firebase-admin";
import { RelicBook, RelicList } from "@/app/addons/relics/relicsFeat";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "default-no-store";
export const runtime = "nodejs";

type Book = {
  name: string,
  icon: string,
  price: number
}

if (!admin.apps.length) {
    admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.NEXT_PUBLIC_FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.NEXT_PUBLIC_FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
    databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL
  });
}

export async function GET(req: NextRequest) {
    try {
        const database = admin.database();
        const ref = database.ref('/relics');
        const snapshot = await ref.once('value');
        const relics = snapshot.val(); // 실시간 유각 데이터 가져오기
        const relicsArray: Book[] = Object.values(relics);

        const db = admin.firestore();
        const relicRef = db.collection('relics');
        const snapshotRelics = await relicRef.get(); // 유각 시세 기록 데이터 가져오기

        const relicsBooks: RelicBook[] = [];
        for (const item of relicsArray) {
            let list: RelicList[] = [];
            snapshotRelics.forEach((doc) => {
                const data = doc.data();
                if (item.name === data.name) {
                    list = data.list;
                }
            })
            const newBook: RelicBook = {
                name: item.name,
                icon: item.icon,
                price: item.price,
                list: list
            }
            relicsBooks.push(newBook);
        }

        return NextResponse.json(relicsBooks, {
            headers: {
                "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
                "CDN-Cache-Control": "no-store",
                "Vercel-CDN-Cache-Control": "no-store",
                Pragma: "no-cache",
                Expires: "0",
            },
        });
    } catch(error) {
        console.error(error);
        return NextResponse.json(
            { error: "Failed load Database." },
            {
                status: 500,
                headers: {
                "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
                "CDN-Cache-Control": "no-store",
                "Vercel-CDN-Cache-Control": "no-store",
                },
            }
        );
    }
}