import "server-only";
import crypto from "crypto";
import type { NextRequest, NextResponse } from "next/server";
import { Timestamp } from "firebase-admin/firestore";
import { adminDB } from "@/utiils/firebaseAdmin";
import { hashToken } from "@/lib/auth";

export const GOOGLE_SIGNUP_COOKIE = "googleSignupToken";
export const GOOGLE_SIGNUP_MAX_AGE_SECONDS = 15 * 60;

export type GoogleSignupIntent = {
    googleUserId: string,
    email: string,
    displayName: string | null,
    photoURL: string | null,
    createdAt: Date | Timestamp,
    expiresAt: Date | Timestamp,
    deleteAfter: Date | Timestamp,
    used: boolean
};

function toDate(value: unknown): Date | null {
    if (value instanceof Date) return value;
    if (value && typeof value === "object" && "toDate" in value && typeof value.toDate === "function") return value.toDate();
    const date = new Date(value as string | number);
    return Number.isNaN(date.getTime()) ? null : date;
}

export async function createGoogleSignupIntent(data: Omit<GoogleSignupIntent, "createdAt" | "expiresAt" | "deleteAfter" | "used">): Promise<string> {
    const token = crypto.randomBytes(48).toString("base64url");
    const now = new Date();
    const expiresAt = new Date(now.getTime() + GOOGLE_SIGNUP_MAX_AGE_SECONDS * 1000);
    await adminDB.collection("googleSignupIntents").doc(hashToken(token)).set({
        ...data,
        createdAt: now,
        expiresAt,
        deleteAfter: Timestamp.fromDate(expiresAt),
        used: false
    });
    return token;
}

export async function getGoogleSignupIntent(req: NextRequest) {
    const token = req.cookies.get(GOOGLE_SIGNUP_COOKIE)?.value;
    if (!token) return null;
    const ref = adminDB.collection("googleSignupIntents").doc(hashToken(token));
    const snapshot = await ref.get();
    if (!snapshot.exists) return null;
    const data = snapshot.data() as GoogleSignupIntent | undefined;
    const expiresAt = toDate(data?.expiresAt);
    if (!data || data.used || !expiresAt || expiresAt <= new Date()) {
        await ref.delete().catch(() => undefined);
        return null;
    }
    return { ref, data, expiresAt };
}

export function setGoogleSignupCookie(response: NextResponse, token: string) {
    response.cookies.set({ name: GOOGLE_SIGNUP_COOKIE, value: token, httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: GOOGLE_SIGNUP_MAX_AGE_SECONDS });
}

export function clearGoogleSignupCookie(response: NextResponse) {
    response.cookies.set({ name: GOOGLE_SIGNUP_COOKIE, value: "", httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 0 });
}
