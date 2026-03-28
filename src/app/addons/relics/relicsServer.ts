import "server-only";
import admin from "firebase-admin";
import { RelicBook, RelicList } from "./relicsFeat";

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

export async function loadRelicBooks(): Promise<RelicBook[]> {
    const database = admin.database();
    const ref = database.ref('/relics');
    const snapshot = await ref.once('value');
    const relics = snapshot.val();

    if (!relics) {
        return [];
    }

    const relicsArray: Book[] = Object.values(relics);
    const db = admin.firestore();
    const relicRef = db.collection('relics');
    const snapshotRelics = await relicRef.get();

    const relicsBooks: RelicBook[] = [];
    for (const item of relicsArray) {
        let list: RelicList[] = [];
        snapshotRelics.forEach((doc) => {
            const data = doc.data();
            if (item.name === data.name) {
                list = data.list ?? [];
            }
        });

        relicsBooks.push({
            name: item.name,
            icon: item.icon,
            price: item.price,
            list,
        });
    }

    relicsBooks.sort((a, b) => b.price - a.price);
    return relicsBooks;
}
