import { signInWithCustomToken, User } from "firebase/auth";
import { auth } from "./firebase";

let authSyncPromise: Promise<User> | null = null;

async function syncFirebaseAuth(forceRefresh: boolean): Promise<User> {
    await auth.authStateReady();

    if (!forceRefresh && auth.currentUser) {
        try {
            await auth.currentUser.getIdToken();
            return auth.currentUser;
        } catch {
            // Firebase refresh token 복구가 실패하면 사이트 세션으로 다시 인증합니다.
        }
    }

    const response = await fetch("/api/auth/firebase-token", {
        method: "POST",
        credentials: "include"
    });

    if (!response.ok) {
        throw new Error("FIREBASE_AUTH_SYNC_FAILED");
    }

    const data = await response.json() as { firebaseToken?: string };
    if (!data.firebaseToken) {
        throw new Error("FIREBASE_AUTH_TOKEN_MISSING");
    }

    const credential = await signInWithCustomToken(auth, data.firebaseToken);
    await credential.user.getIdToken();
    return credential.user;
}

export function ensureFirebaseAuth(forceRefresh = false): Promise<User> {
    if (!authSyncPromise) {
        authSyncPromise = syncFirebaseAuth(forceRefresh).finally(() => {
            authSyncPromise = null;
        });
    }

    return authSyncPromise;
}
