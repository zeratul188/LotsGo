import 'server-only';

import type { NextRequest } from "next/server";
import type { DocumentData, DocumentReference } from "firebase-admin/firestore";
import { adminDB } from "@/utiils/firebaseAdmin";
import { hashToken } from "@/lib/auth";

export type AuthenticatedMemberSession = {
    userId: string,
    sessionId: string,
    memberRef: DocumentReference<DocumentData>,
    memberData: DocumentData
}

function toDate(value: unknown): Date | null {
    if (value instanceof Date) return value;
    if (value && typeof (value as { toDate?: unknown }).toDate === "function") {
        return (value as { toDate: () => Date }).toDate();
    }
    if (typeof value === "string" || typeof value === "number") {
        const date = new Date(value);
        return Number.isNaN(date.getTime()) ? null : date;
    }
    return null;
}

export async function getAuthenticatedMemberSession(
    req: NextRequest
): Promise<AuthenticatedMemberSession | null> {
    const refreshToken = req.cookies.get("refreshToken")?.value;
    if (!refreshToken) return null;

    const sessionSnapshot = await adminDB
        .collection("sessions")
        .where("refreshTokenHash", "==", hashToken(refreshToken))
        .where("revoked", "==", false)
        .limit(1)
        .get();

    if (sessionSnapshot.empty) return null;

    const sessionDoc = sessionSnapshot.docs[0];
    const sessionData = sessionDoc.data();
    const expiresAt = toDate(sessionData.expiresAt);
    const userId = typeof sessionData.userId === "string" ? sessionData.userId : "";

    if (!expiresAt || expiresAt <= new Date() || !userId) return null;

    const memberSnapshot = await adminDB
        .collection("members")
        .where("id", "==", userId)
        .limit(1)
        .get();

    if (memberSnapshot.empty) return null;

    const memberDoc = memberSnapshot.docs[0];
    return {
        userId,
        sessionId: sessionDoc.id,
        memberRef: memberDoc.ref,
        memberData: memberDoc.data()
    };
}
