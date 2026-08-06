import { unstable_cache } from "next/cache";
import { adminDB, adminStorage } from "@/utiils/firebaseAdmin";
import type { MajorUpdate } from "../model/types";

const getCachedMajorUpdates = unstable_cache(async (): Promise<MajorUpdate[]> => {
    const snapshot = await adminDB.collection("siteContent").doc("homeUpdates").get();
    const items = snapshot.data()?.items;
    if (!Array.isArray(items)) return [];

    const normalizedItems = items.flatMap((item): Array<MajorUpdate & { storagePath: string }> => {
        if (!item || typeof item !== "object") return [];
        const value = item as Record<string, unknown>;
        if (typeof value.id !== "string" || typeof value.storagePath !== "string" || typeof value.title !== "string" || typeof value.sub !== "string" || typeof value.color !== "string") {
            return [];
        }
        return [{
            id: value.id,
            url: "",
            title: value.title,
            sub: value.sub,
            color: value.color,
            isBlack: value.isBlack === true,
            storagePath: value.storagePath
        }];
    });

    return Promise.all(normalizedItems.map(async (item): Promise<MajorUpdate> => {
        const [url] = await adminStorage.bucket().file(item.storagePath).getSignedUrl({
            version: "v4",
            action: "read",
            expires: Date.now() + 6 * 24 * 60 * 60 * 1000
        });
        return {
            id: item.id,
            url,
            title: item.title,
            sub: item.sub,
            color: item.color,
            isBlack: item.isBlack
        };
    }));
}, ["home-updates"], { revalidate: 3600, tags: ["home-updates"] });

export async function loadMajorUpdates(): Promise<MajorUpdate[]> {
    try {
        return await getCachedMajorUpdates();
    } catch (error) {
        console.error("Failed to load major updates", error);
        return [];
    }
}
