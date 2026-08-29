import { NextRequest, NextResponse } from "next/server";
import { Timestamp } from "firebase-admin/firestore";
import { adminAuth, adminDatabase, adminDB } from "@/utiils/firebaseAdmin";
import { encrypt } from "@/utiils/crypto";
import { generateRefreshToken, hashToken } from "@/lib/auth";
import { clearDiscordSignupCookie, getDiscordSignupIntent } from "@/lib/discordSignup";
import { getClientIp } from "@/app/api/login/loginFeat";

type SignupCharacter = {
    nickname: string,
    level: number,
    server: string,
    job: string
}

type DiscordSignupBody = {
    id?: unknown,
    character?: unknown,
    email?: unknown,
    password?: unknown,
    passwordCheck?: unknown,
    expedition?: unknown,
    privacyAccepted?: unknown
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeCharacters(value: unknown): SignupCharacter[] | null {
    if (!Array.isArray(value) || value.length === 0 || value.length > 100) return null;
    const characters: SignupCharacter[] = [];
    for (const item of value) {
        if (!item || typeof item !== "object") return null;
        const candidate = item as Partial<SignupCharacter>;
        if (
            typeof candidate.nickname !== "string"
            || typeof candidate.level !== "number"
            || !Number.isFinite(candidate.level)
            || typeof candidate.server !== "string"
            || typeof candidate.job !== "string"
        ) return null;
        characters.push({
            nickname: candidate.nickname.trim(),
            level: candidate.level,
            server: candidate.server.trim(),
            job: candidate.job.trim()
        });
    }
    return characters;
}

async function isIdDuplicate(id: string): Promise<boolean> {
    const [memberSnapshot, administratorSnapshot] = await Promise.all([
        adminDB.collection("members").where("id", "==", id).limit(1).get(),
        adminDatabase.ref("/administrator/id").get()
    ]);
    return !memberSnapshot.empty || administratorSnapshot.val() === id;
}

async function isEmailDuplicate(email: string): Promise<boolean> {
    return adminAuth.getUserByEmail(email).then(() => true).catch(error => {
        if (error?.code === "auth/user-not-found") return false;
        throw error;
    });
}

async function getDuplicateFields(id: string, email: string): Promise<Array<"id" | "email">> {
    const [idExists, emailExists] = await Promise.all([isIdDuplicate(id), isEmailDuplicate(email)]);
    const fields: Array<"id" | "email"> = [];
    if (idExists) fields.push("id");
    if (emailExists) fields.push("email");
    return fields;
}

function validateAccountFields(id: string, email: string) {
    if (!/^[a-zA-Z0-9]{4,20}$/.test(id)) return "INVALID_ID";
    if (!EMAIL_PATTERN.test(email)) return "INVALID_EMAIL";
    return null;
}

export async function GET(req: NextRequest) {
    try {
        const intent = await getDiscordSignupIntent(req);
        if (!intent) {
            const response = NextResponse.json({ code: "SIGNUP_INTENT_EXPIRED" }, { status: 401 });
            clearDiscordSignupCookie(response);
            return response;
        }
        return NextResponse.json({
            user: {
                id: intent.data.discordUserId,
                username: intent.data.username,
                globalName: intent.data.globalName,
                avatar: intent.data.avatar
            },
            expiresAt: intent.expiresAt.toISOString()
        });
    } catch (error) {
        console.error("Failed to load Discord signup intent", error);
        return NextResponse.json({ code: "SIGNUP_INTENT_LOAD_FAILED" }, { status: 500 });
    }
}

export async function PUT(req: NextRequest) {
    try {
        const intent = await getDiscordSignupIntent(req);
        if (!intent) return NextResponse.json({ code: "SIGNUP_INTENT_EXPIRED" }, { status: 401 });

        const body = await req.json() as { field?: unknown, value?: unknown };
        const field = body.field;
        const value = typeof body.value === "string" ? body.value.trim() : "";
        if (field === "id") {
            if (!/^[a-zA-Z0-9]{4,20}$/.test(value)) {
                return NextResponse.json({ code: "INVALID_ID" }, { status: 400 });
            }
            const duplicate = await isIdDuplicate(value);
            return NextResponse.json({ available: !duplicate, duplicateFields: duplicate ? ["id"] : [] });
        }
        if (field === "email") {
            const email = value.toLowerCase();
            if (!EMAIL_PATTERN.test(email)) {
                return NextResponse.json({ code: "INVALID_EMAIL" }, { status: 400 });
            }
            const duplicate = await isEmailDuplicate(email);
            return NextResponse.json({ available: !duplicate, duplicateFields: duplicate ? ["email"] : [] });
        }
        return NextResponse.json({ code: "INVALID_CHECK_FIELD" }, { status: 400 });
    } catch (error) {
        console.error("Failed to check Discord signup fields", error);
        return NextResponse.json({ code: "SIGNUP_CHECK_FAILED" }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const intent = await getDiscordSignupIntent(req);
        if (intent) await intent.ref.delete();
        const response = NextResponse.json({ success: true });
        clearDiscordSignupCookie(response);
        return response;
    } catch (error) {
        console.error("Failed to cancel Discord signup", error);
        const response = NextResponse.json({ success: false }, { status: 500 });
        clearDiscordSignupCookie(response);
        return response;
    }
}

export async function POST(req: NextRequest) {
    let firebaseUid = "";
    try {
        const intent = await getDiscordSignupIntent(req);
        if (!intent) return NextResponse.json({ code: "SIGNUP_INTENT_EXPIRED" }, { status: 401 });

        const body = await req.json() as DiscordSignupBody;
        const id = typeof body.id === "string" ? body.id.trim() : "";
        const character = typeof body.character === "string" ? body.character.trim() : "";
        const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
        const password = typeof body.password === "string" ? body.password.trim() : "";
        const passwordCheck = typeof body.passwordCheck === "string" ? body.passwordCheck.trim() : "";
        const expedition = normalizeCharacters(body.expedition);

        const validationError = validateAccountFields(id, email);
        if (validationError) return NextResponse.json({ code: validationError }, { status: 400 });
        if (character.length < 2 || character.length > 12) {
            return NextResponse.json({ code: "INVALID_CHARACTER" }, { status: 400 });
        }
        if (password.length < 6 || password.length > 18 || password !== passwordCheck) {
            return NextResponse.json({ code: "INVALID_PASSWORD" }, { status: 400 });
        }
        if (!expedition || !expedition.some(item => item.nickname === character)) {
            return NextResponse.json({ code: "INVALID_EXPEDITION" }, { status: 400 });
        }
        if (body.privacyAccepted !== true) {
            return NextResponse.json({ code: "PRIVACY_REQUIRED" }, { status: 400 });
        }

        const duplicateFields = await getDuplicateFields(id, email);
        if (duplicateFields.length > 0) {
            return NextResponse.json({ code: "ACCOUNT_EXISTS", duplicateFields }, { status: 409 });
        }

        const secretKey = process.env.NEXT_PUBLIC_SECRET_KEY;
        if (!secretKey) throw new Error("EMAIL_ENCRYPTION_KEY_MISSING");

        const firebaseUser = await adminAuth.createUser({ email, password });
        firebaseUid = firebaseUser.uid;

        const now = new Date();
        const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        const deleteAfter = new Date(now.getTime() + 45 * 24 * 60 * 60 * 1000);
        const refreshToken = generateRefreshToken();
        const memberRef = adminDB.collection("members").doc();
        const connectionRef = adminDB.collection("discordConnections").doc(intent.data.discordUserId);
        const sessionRef = adminDB.collection("sessions").doc();

        await adminDB.runTransaction(async transaction => {
            const [intentSnapshot, connectionSnapshot, memberSnapshot] = await Promise.all([
                transaction.get(intent.ref),
                transaction.get(connectionRef),
                transaction.get(adminDB.collection("members").where("id", "==", id).limit(1))
            ]);
            if (!intentSnapshot.exists || intentSnapshot.data()?.used === true) throw new Error("SIGNUP_INTENT_EXPIRED");
            if (connectionSnapshot.exists) throw new Error("DISCORD_ALREADY_LINKED");
            if (!memberSnapshot.empty) throw new Error("ACCOUNT_EXISTS");

            const discord = {
                userId: intent.data.discordUserId,
                username: intent.data.username,
                globalName: intent.data.globalName,
                avatar: intent.data.avatar,
                connectedAt: now,
                updatedAt: now
            };
            transaction.set(memberRef, {
                uid: firebaseUid,
                id,
                email: encrypt(email, secretKey),
                character,
                expeditions: expedition,
                discord
            });
            transaction.set(connectionRef, {
                lotsgoUserId: id,
                memberDocumentId: memberRef.id,
                provider: "discord",
                schemaVersion: 1,
                ...discord
            });
            transaction.set(sessionRef, {
                userId: id,
                refreshTokenHash: hashToken(refreshToken),
                createdAt: now,
                lastUsedAt: now,
                expiresAt,
                revoked: false,
                ipAddress: getClientIp(req),
                deleteAfter: Timestamp.fromDate(deleteAfter),
                authProvider: "discord",
                discordUserId: intent.data.discordUserId
            });
            transaction.delete(intent.ref);
        });

        firebaseUid = "";
        const response = NextResponse.json({ success: true, completionUrl: "/auth/discord/complete?returnTo=%2F" });
        response.cookies.set({
            name: "refreshToken",
            value: refreshToken,
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 60 * 24 * 30
        });
        clearDiscordSignupCookie(response);
        return response;
    } catch (error) {
        if (firebaseUid) await adminAuth.deleteUser(firebaseUid).catch(() => undefined);
        const code = error instanceof Error ? error.message : "DISCORD_SIGNUP_FAILED";
        if (code === "ACCOUNT_EXISTS" || code === "DISCORD_ALREADY_LINKED") {
            return NextResponse.json({ code }, { status: 409 });
        }
        if (code === "SIGNUP_INTENT_EXPIRED") {
            const response = NextResponse.json({ code }, { status: 401 });
            clearDiscordSignupCookie(response);
            return response;
        }
        if ((error as { code?: string })?.code === "auth/email-already-exists") {
            return NextResponse.json({ code: "ACCOUNT_EXISTS", duplicateFields: ["email"] }, { status: 409 });
        }
        console.error("Failed to create Discord signup account", error);
        return NextResponse.json({ code: "DISCORD_SIGNUP_FAILED" }, { status: 500 });
    }
}
