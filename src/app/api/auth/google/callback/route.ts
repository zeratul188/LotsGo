import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDB } from "@/utiils/firebaseAdmin";
import { createGoogleSignupIntent, setGoogleSignupCookie } from "@/lib/googleSignup";
import { decodeJwtPayload, verifyGoogleOAuthState } from "@/lib/googleOAuth";
import { generateRefreshToken, getLotsGoCookieDomain, hashToken } from "@/lib/auth";
import { getClientIp } from "@/app/api/login/loginFeat";

const FIREBASE_API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "AIzaSyDsOUNZqnytpWkyicRx5WDb8GmPOEiiUy4";

type FirebaseIdpResponse = {
    idToken?: string,
    displayName?: string,
    photoUrl?: string,
    error?: { message?: string }
};

function errorRedirect(req: NextRequest, code: string) {
    return NextResponse.redirect(new URL(`/login?google=${encodeURIComponent(code)}`, req.url));
}

function deleteErrorRedirect(req: NextRequest, code: string) {
    return NextResponse.redirect(new URL(`/setting?tab=exit-site&googleDelete=${encodeURIComponent(code)}`, req.url));
}

async function exchangeGoogleToken(req: NextRequest, googleIdToken: string): Promise<FirebaseIdpResponse> {
    const callbackUrl = new URL("/api/auth/google/callback", req.url).toString();
    const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithIdp?key=${encodeURIComponent(FIREBASE_API_KEY)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            requestUri: callbackUrl,
            postBody: `id_token=${encodeURIComponent(googleIdToken)}&providerId=google.com`,
            returnIdpCredential: true,
            returnSecureToken: true
        }),
        cache: "no-store"
    });
    const data = await response.json().catch(() => ({})) as FirebaseIdpResponse;
    if (!response.ok || !data.idToken) throw new Error(data.error?.message ?? "FIREBASE_GOOGLE_EXCHANGE_FAILED");
    return data;
}

async function createSession(req: NextRequest, member: FirebaseFirestore.DocumentData, returnTo: string) {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const deleteAfter = new Date(now.getTime() + 45 * 24 * 60 * 60 * 1000);
    const refreshToken = generateRefreshToken();
    const sessionRef = adminDB.collection("sessions").doc();
    await sessionRef.set({
        userId: member.id,
        refreshTokenHash: hashToken(refreshToken),
        createdAt: now,
        lastUsedAt: now,
        expiresAt,
        revoked: false,
        ipAddress: getClientIp(req),
        deleteAfter: Timestamp.fromDate(deleteAfter),
        authProvider: "google"
    });
    const completionUrl = new URL("/auth/google/complete", req.url);
    completionUrl.searchParams.set("returnTo", returnTo);
    const response = NextResponse.redirect(completionUrl);
    response.cookies.set({
        name: "refreshToken",
        value: refreshToken,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        domain: getLotsGoCookieDomain(req.nextUrl.hostname),
        maxAge: 60 * 60 * 24 * 30
    });
    return response;
}

async function deleteGoogleMember(req: NextRequest, userId: string, uid: string) {
    const memberSnapshot = await adminDB.collection("members").where("id", "==", userId).limit(1).get();
    if (memberSnapshot.empty || memberSnapshot.docs[0].data().uid !== uid) throw new Error("DELETE_ACCOUNT_MISMATCH");
    const memberRef = memberSnapshot.docs[0].ref;
    const memberData = memberSnapshot.docs[0].data();
    const discordUserId = typeof memberData.discord?.userId === "string" ? memberData.discord.userId : "";

    await adminDB.runTransaction(async transaction => {
        const [currentMember, raidSnapshot, sessionSnapshot, linkedConnectionSnapshot, guildAuthorizationSnapshot] = await Promise.all([
            transaction.get(memberRef),
            transaction.get(adminDB.collection("raids").where("members", "array-contains", userId)),
            transaction.get(adminDB.collection("sessions").where("userId", "==", userId)),
            transaction.get(adminDB.collection("discordConnections").where("lotsgoUserId", "==", userId)),
            transaction.get(adminDB.collection("discordGuildAuthorizations").where("lotsgoUserId", "==", userId))
        ]);
        if (!currentMember.exists || currentMember.data()?.uid !== uid) throw new Error("DELETE_ACCOUNT_MISMATCH");
        raidSnapshot.docs.forEach(raidDoc => transaction.update(raidDoc.ref, { members: FieldValue.arrayRemove(userId) }));
        sessionSnapshot.docs.forEach(sessionDoc => transaction.delete(sessionDoc.ref));
        linkedConnectionSnapshot.docs.forEach(connectionDoc => transaction.delete(connectionDoc.ref));
        guildAuthorizationSnapshot.docs.forEach(authorizationDoc => transaction.delete(authorizationDoc.ref));
        if (discordUserId && !linkedConnectionSnapshot.docs.some(connectionDoc => connectionDoc.id === discordUserId)) {
            transaction.delete(adminDB.collection("discordConnections").doc(discordUserId));
        }
        transaction.delete(memberRef);
    });

    await adminAuth.deleteUser(uid);
    const response = NextResponse.redirect(new URL("/auth/google/delete/complete", req.url));
    response.cookies.set({
        name: "refreshToken",
        value: "",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        domain: getLotsGoCookieDomain(req.nextUrl.hostname),
        maxAge: 0
    });
    return response;
}

export async function POST(req: NextRequest) {
    let purpose: "login" | "delete" = "login";
    try {
        const form = await req.formData();
        const stateValue = form.get("state");
        const googleIdToken = form.get("id_token");
        const oauthError = form.get("error");
        if (typeof stateValue !== "string") return errorRedirect(req, "invalid-response");
        const state = verifyGoogleOAuthState(stateValue);
        if (!state) return errorRedirect(req, "invalid-state");
        purpose = state.purpose;
        if (typeof oauthError === "string") {
            return state.purpose === "delete" ? deleteErrorRedirect(req, oauthError) : errorRedirect(req, oauthError);
        }
        if (typeof googleIdToken !== "string") {
            return state.purpose === "delete" ? deleteErrorRedirect(req, "invalid-response") : errorRedirect(req, "invalid-response");
        }

        const googlePayload = decodeJwtPayload(googleIdToken);
        if (googlePayload?.nonce !== state.nonce) {
            return state.purpose === "delete" ? deleteErrorRedirect(req, "invalid-nonce") : errorRedirect(req, "invalid-nonce");
        }
        const exchange = await exchangeGoogleToken(req, googleIdToken);
        const decoded = await adminAuth.verifyIdToken(exchange.idToken!);
        if (decoded.firebase?.sign_in_provider !== "google.com" || decoded.email_verified !== true || typeof decoded.email !== "string") {
            return state.purpose === "delete" ? deleteErrorRedirect(req, "account-not-verified") : errorRedirect(req, "account-not-verified");
        }
        if (state.purpose === "delete") {
            if (decoded.uid !== state.uid || !state.userId) return deleteErrorRedirect(req, "account-mismatch");
            return deleteGoogleMember(req, state.userId, decoded.uid);
        }

        const memberSnapshot = await adminDB.collection("members").where("uid", "==", decoded.uid).limit(1).get();
        if (!memberSnapshot.empty) {
            const member = memberSnapshot.docs[0].data();
            if (!member.accountAuthProvider) {
                const firebaseUser = await adminAuth.getUser(decoded.uid);
                const hasPassword = firebaseUser.providerData.some(provider => provider.providerId === "password");
                await memberSnapshot.docs[0].ref.update({ accountAuthProvider: hasPassword ? "password" : "google" });
            }
            return createSession(req, member, state.returnTo);
        }

        const token = await createGoogleSignupIntent({
            googleUserId: decoded.uid,
            email: decoded.email.toLowerCase(),
            displayName: typeof decoded.name === "string" ? decoded.name : exchange.displayName ?? null,
            photoURL: typeof decoded.picture === "string" ? decoded.picture : exchange.photoUrl ?? null
        });
        const signupUrl = new URL("/signup/google", req.url);
        signupUrl.searchParams.set("returnTo", state.returnTo);
        const response = NextResponse.redirect(signupUrl);
        setGoogleSignupCookie(response, token);
        return response;
    } catch (error) {
        console.error("Failed to complete Google login", error);
        return purpose === "delete" ? deleteErrorRedirect(req, "complete-error") : errorRedirect(req, "complete-error");
    }
}
