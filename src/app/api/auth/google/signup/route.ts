import { Timestamp } from "firebase-admin/firestore";
import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDatabase, adminDB } from "@/utiils/firebaseAdmin";
import { clearGoogleSignupCookie, getGoogleSignupIntent } from "@/lib/googleSignup";
import { encrypt } from "@/utiils/crypto";
import { generateRefreshToken, getLotsGoCookieDomain, hashToken, signAccessToken } from "@/lib/auth";
import { getClientIp } from "@/app/api/login/loginFeat";

type Character = { nickname: string, level: number, server: string, job: string };
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeCharacters(value: unknown): Character[] | null {
    if (!Array.isArray(value) || value.length === 0 || value.length > 100) return null;
    const result: Character[] = [];
    for (const item of value) {
        if (!item || typeof item !== "object") return null;
        const candidate = item as Partial<Character>;
        if (typeof candidate.nickname !== "string" || typeof candidate.level !== "number" || !Number.isFinite(candidate.level) || typeof candidate.server !== "string" || typeof candidate.job !== "string") return null;
        result.push({ nickname: candidate.nickname.trim(), level: candidate.level, server: candidate.server.trim(), job: candidate.job.trim() });
    }
    return result;
}

function clearAndJson(code: string, status: number) {
    const response = NextResponse.json({ code }, { status });
    clearGoogleSignupCookie(response);
    return response;
}

export async function GET(req: NextRequest) {
    const intent = await getGoogleSignupIntent(req);
    if (!intent) return clearAndJson("SIGNUP_INTENT_EXPIRED", 401);
    return NextResponse.json({
        user: { uid: intent.data.googleUserId, email: intent.data.email, displayName: intent.data.displayName, photoURL: intent.data.photoURL },
        expiresAt: intent.expiresAt.toISOString()
    });
}

export async function DELETE(req: NextRequest) {
    const intent = await getGoogleSignupIntent(req);
    if (intent) await intent.ref.delete().catch(() => undefined);
    const response = NextResponse.json({ success: true });
    clearGoogleSignupCookie(response);
    return response;
}

export async function PUT(req: NextRequest) {
    try {
        const intent = await getGoogleSignupIntent(req);
        if (!intent) return clearAndJson("SIGNUP_INTENT_EXPIRED", 401);
        const body = await req.json().catch(() => ({})) as { field?: unknown, value?: unknown };
        const field = body.field;
        const value = typeof body.value === "string" ? body.value.trim() : "";
        if (field !== "id") return NextResponse.json({ code: "INVALID_CHECK_FIELD" }, { status: 400 });
        if (!/^[a-zA-Z0-9]{4,20}$/.test(value)) return NextResponse.json({ code: "INVALID_ID" }, { status: 400 });
        const [member, administrator] = await Promise.all([
            adminDB.collection("members").where("id", "==", value).limit(1).get(),
            adminDatabase.ref("/administrator/id").get()
        ]);
        const administratorId = administrator.val();
        const available = member.empty && administratorId !== value;
        return NextResponse.json({ available, duplicateFields: available ? [] : ["id"] });
    } catch (error) {
        console.error("Failed to check Google signup field", error);
        return NextResponse.json({ code: "SIGNUP_CHECK_FAILED" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const intent = await getGoogleSignupIntent(req);
        if (!intent) return clearAndJson("SIGNUP_INTENT_EXPIRED", 401);
        const body = await req.json().catch(() => ({})) as { id?: unknown, character?: unknown, expedition?: unknown, privacyAccepted?: unknown, returnTo?: unknown };
        const id = typeof body.id === "string" ? body.id.trim() : "";
        const character = typeof body.character === "string" ? body.character.trim() : "";
        const expedition = normalizeCharacters(body.expedition);
        if (!/^[a-zA-Z0-9]{4,20}$/.test(id)) return NextResponse.json({ code: "INVALID_ID" }, { status: 400 });
        if (!EMAIL_PATTERN.test(intent.data.email)) return NextResponse.json({ code: "INVALID_EMAIL" }, { status: 400 });
        if (character.length < 2 || character.length > 12 || !expedition || !expedition.some(item => item.nickname === character)) return NextResponse.json({ code: "INVALID_EXPEDITION" }, { status: 400 });
        if (body.privacyAccepted !== true) return NextResponse.json({ code: "PRIVACY_REQUIRED" }, { status: 400 });
        const firebaseUser = await adminAuth.getUser(intent.data.googleUserId);
        const hasGoogleProvider = firebaseUser.providerData.some(provider => provider.providerId === "google.com");
        if (!hasGoogleProvider || firebaseUser.email?.toLowerCase() !== intent.data.email || firebaseUser.emailVerified !== true) return clearAndJson("SIGNUP_INTENT_EXPIRED", 401);
        const administratorId = (await adminDatabase.ref("/administrator/id").get()).val();
        if (administratorId === id) return NextResponse.json({ code: "ACCOUNT_EXISTS" }, { status: 409 });
        const memberRef = adminDB.collection("members").doc();
        const sessionRef = adminDB.collection("sessions").doc();
        const now = new Date();
        const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        const deleteAfter = new Date(now.getTime() + 45 * 24 * 60 * 60 * 1000);
        const refreshToken = generateRefreshToken();
        const secretKey = process.env.NEXT_PUBLIC_SECRET_KEY;
        if (!secretKey) throw new Error("EMAIL_ENCRYPTION_KEY_MISSING");

        await adminDB.runTransaction(async transaction => {
            const [intentSnapshot, idSnapshot, uidSnapshot] = await Promise.all([
                transaction.get(intent.ref),
                transaction.get(adminDB.collection("members").where("id", "==", id).limit(1)),
                transaction.get(adminDB.collection("members").where("uid", "==", intent.data.googleUserId).limit(1))
            ]);
            if (!intentSnapshot.exists || intentSnapshot.data()?.used === true) throw new Error("SIGNUP_INTENT_EXPIRED");
            if (!idSnapshot.empty || !uidSnapshot.empty) throw new Error("ACCOUNT_EXISTS");
            transaction.set(memberRef, { uid: intent.data.googleUserId, id, email: encrypt(intent.data.email, secretKey), character, expeditions: expedition, accountAuthProvider: "google", authProvider: "google", google: { email: intent.data.email, displayName: intent.data.displayName, photoURL: intent.data.photoURL, connectedAt: now, updatedAt: now } });
            transaction.set(sessionRef, { userId: id, refreshTokenHash: hashToken(refreshToken), createdAt: now, lastUsedAt: now, expiresAt, revoked: false, ipAddress: getClientIp(req), deleteAfter: Timestamp.fromDate(deleteAfter), authProvider: "google" });
            transaction.delete(intent.ref);
        });
        const accessToken = signAccessToken({ id, sessionId: sessionRef.id, isAdministrator: false });
        const response = NextResponse.json({ success: true, accessToken, userData: { id, email: encrypt(intent.data.email, secretKey), expeditions: expedition, nickname: character, apiKey: null, isSupporter: false, authProvider: "google" }, expedition, sessionExpiresAt: expiresAt.toISOString() });
        response.cookies.set({ name: "refreshToken", value: refreshToken, httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", domain: getLotsGoCookieDomain(req.nextUrl.hostname), maxAge: 60 * 60 * 24 * 30 });
        clearGoogleSignupCookie(response);
        return response;
    } catch (error) {
        if (error instanceof Error && error.message === "SIGNUP_INTENT_EXPIRED") return clearAndJson(error.message, 401);
        if (error instanceof Error && error.message === "ACCOUNT_EXISTS") return NextResponse.json({ code: error.message }, { status: 409 });
        console.error("Failed to create Google signup account", error);
        return NextResponse.json({ code: "GOOGLE_SIGNUP_FAILED" }, { status: 500 });
    }
}
