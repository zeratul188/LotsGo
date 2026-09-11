import "server-only";
import crypto from "crypto";

const GOOGLE_OAUTH_STATE_MAX_AGE_MS = 10 * 60 * 1000;

type GoogleOAuthState = {
    nonce: string,
    returnTo: string,
    createdAt: number,
    purpose: "login" | "delete",
    userId?: string,
    uid?: string
};

type GoogleOAuthStateOptions = {
    purpose?: "login" | "delete",
    userId?: string,
    uid?: string
};

function getStateSecret(): string {
    const secret = process.env.LOSTARK_JWT_SECRET;
    if (!secret) throw new Error("GOOGLE_OAUTH_STATE_SECRET_MISSING");
    return secret;
}

function signPayload(payload: string): string {
    return crypto.createHmac("sha256", getStateSecret()).update(payload).digest("base64url");
}

export function getSafeReturnTo(value: unknown): string {
    return typeof value === "string" && value.startsWith("/") && !value.startsWith("//") ? value : "/";
}

export function createGoogleOAuthState(returnTo: unknown, options: GoogleOAuthStateOptions = {}) {
    const state: GoogleOAuthState = {
        nonce: crypto.randomBytes(32).toString("base64url"),
        returnTo: getSafeReturnTo(returnTo),
        createdAt: Date.now(),
        purpose: options.purpose ?? "login",
        userId: options.userId,
        uid: options.uid
    };
    const payload = Buffer.from(JSON.stringify(state)).toString("base64url");
    return { value: `${payload}.${signPayload(payload)}`, nonce: state.nonce };
}

export function verifyGoogleOAuthState(value: string): GoogleOAuthState | null {
    const [payload, signature, ...rest] = value.split(".");
    if (!payload || !signature || rest.length > 0) return null;
    const expected = signPayload(payload);
    const actualBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expected);
    if (actualBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(actualBuffer, expectedBuffer)) return null;
    try {
        const state = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as Partial<GoogleOAuthState>;
        if (typeof state.nonce !== "string" || typeof state.createdAt !== "number" || typeof state.returnTo !== "string") return null;
        if (state.purpose !== "login" && state.purpose !== "delete") return null;
        if (state.purpose === "delete" && (typeof state.userId !== "string" || typeof state.uid !== "string")) return null;
        if (Date.now() - state.createdAt > GOOGLE_OAUTH_STATE_MAX_AGE_MS || state.createdAt > Date.now() + 60_000) return null;
        return {
            nonce: state.nonce,
            createdAt: state.createdAt,
            returnTo: getSafeReturnTo(state.returnTo),
            purpose: state.purpose,
            userId: state.userId,
            uid: state.uid
        };
    } catch {
        return null;
    }
}

export function decodeJwtPayload(token: string): Record<string, unknown> | null {
    try {
        const payload = token.split(".")[1];
        if (!payload) return null;
        return JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as Record<string, unknown>;
    } catch {
        return null;
    }
}
