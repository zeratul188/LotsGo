import { hashToken } from "@/lib/auth";
import { adminAuth, adminDB } from "@/utiils/firebaseAdmin";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const refreshToken = req.cookies.get("refreshToken")?.value;
        if (!refreshToken) {
            return NextResponse.json({ code: "MISSING_REFRESH_TOKEN" }, { status: 401 });
        }

        const sessionSnapshot = await adminDB
            .collection("sessions")
            .where("refreshTokenHash", "==", hashToken(refreshToken))
            .where("revoked", "==", false)
            .limit(1)
            .get();

        if (sessionSnapshot.empty) {
            return NextResponse.json({ code: "INVALID_REFRESH_TOKEN" }, { status: 401 });
        }

        const session = sessionSnapshot.docs[0].data();
        const expiresAt = typeof session.expiresAt?.toDate === "function"
            ? session.expiresAt.toDate()
            : new Date(session.expiresAt);

        if (Number.isNaN(expiresAt.getTime()) || expiresAt <= new Date()) {
            return NextResponse.json({ code: "EXPIRED_REFRESH_TOKEN" }, { status: 401 });
        }

        const memberSnapshot = await adminDB
            .collection("members")
            .where("id", "==", session.userId)
            .limit(1)
            .get();

        if (memberSnapshot.empty) {
            return NextResponse.json({ code: "MEMBER_NOT_FOUND" }, { status: 404 });
        }

        const uid = memberSnapshot.docs[0].data().uid;
        if (typeof uid !== "string" || !uid) {
            return NextResponse.json({ code: "FIREBASE_UID_NOT_FOUND" }, { status: 409 });
        }

        const firebaseToken = await adminAuth.createCustomToken(uid);
        return NextResponse.json({ firebaseToken });
    } catch (error) {
        console.error("Failed to create Firebase custom token", error);
        return NextResponse.json({ code: "FIREBASE_TOKEN_FAILED" }, { status: 500 });
    }
}
