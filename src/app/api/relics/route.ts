import { NextResponse } from "next/server";
import { loadRelicBooks } from "@/app/addons/relics/relicsServer";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "default-no-store";
export const runtime = "nodejs";

export async function GET() {
    try {
        const relicsBooks = await loadRelicBooks();

        return NextResponse.json(relicsBooks, {
            headers: {
                "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
                "CDN-Cache-Control": "no-store",
                "Vercel-CDN-Cache-Control": "no-store",
                Pragma: "no-cache",
                Expires: "0",
            },
        });
    } catch (error) {
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
