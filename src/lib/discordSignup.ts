import "server-only";
import crypto from "crypto";
import type { NextRequest, NextResponse } from "next/server";
import { Timestamp } from "firebase-admin/firestore";
import { adminDB } from "@/utiils/firebaseAdmin";
import type { DiscordUser } from "@/lib/discord";
import { hashToken } from "@/lib/auth";

export const DISCORD_SIGNUP_COOKIE = "discordSignupToken";
export const DISCORD_SIGNUP_MAX_AGE_SECONDS = 15 * 60;

export type DiscordSignupIntent = {
    discordUserId: string,
    username: string,
    globalName: string | null,
    avatar: string | null,
    createdAt: Date | Timestamp,
    expiresAt: Date | Timestamp,
    deleteAfter: Date | Timestamp,
    used: boolean
}

function toDate(value: unknown): Date | null {
    if (value instanceof Date) return value;
    if (value && typeof value === "object" && "toDate" in value && typeof value.toDate === "function") {
        return value.toDate();
    }
    const date = new Date(value as string | number);
    return Number.isNaN(date.getTime()) ? null : date;
}

export async function createDiscordSignupIntent(discordUser: DiscordUser): Promise<string> {
    const token = crypto.randomBytes(48).toString("base64url");
    const now = new Date();
    const expiresAt = new Date(now.getTime() + DISCORD_SIGNUP_MAX_AGE_SECONDS * 1000);
    const collection = adminDB.collection("discordSignupIntents");
    const expiredSnapshot = await collection.where("expiresAt", "<=", now).limit(25).get().catch(() => null);
    if (expiredSnapshot && !expiredSnapshot.empty) {
        const batch = adminDB.batch();
        expiredSnapshot.docs.forEach(document => batch.delete(document.ref));
        await batch.commit().catch(() => undefined);
    }
    await collection.doc(hashToken(token)).set({
        discordUserId: discordUser.id,
        username: discordUser.username,
        globalName: discordUser.global_name,
        avatar: discordUser.avatar,
        createdAt: now,
        expiresAt,
        deleteAfter: Timestamp.fromDate(expiresAt),
        used: false
    });
    return token;
}

export async function getDiscordSignupIntent(req: NextRequest) {
    const token = req.cookies.get(DISCORD_SIGNUP_COOKIE)?.value;
    if (!token) return null;

    const ref = adminDB.collection("discordSignupIntents").doc(hashToken(token));
    const snapshot = await ref.get();
    if (!snapshot.exists) return null;

    const data = snapshot.data() as DiscordSignupIntent | undefined;
    const expiresAt = toDate(data?.expiresAt);
    if (!data || data.used || !expiresAt || expiresAt <= new Date()) {
        await ref.delete().catch(() => undefined);
        return null;
    }
    return { ref, data, expiresAt };
}

export function setDiscordSignupCookie(response: NextResponse, token: string) {
    response.cookies.set({
        name: DISCORD_SIGNUP_COOKIE,
        value: token,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: DISCORD_SIGNUP_MAX_AGE_SECONDS
    });
}

export function clearDiscordSignupCookie(response: NextResponse) {
    response.cookies.set({
        name: DISCORD_SIGNUP_COOKIE,
        value: "",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 0
    });
}
