import { NextRequest, NextResponse } from "next/server";
import { createGoogleOAuthState } from "@/lib/googleOAuth";
import { getAuthenticatedMemberSession } from "@/lib/serverSession";

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
    ?? "452160426051-v29picfg583fn9vsu0fsq5ulfokrkfeb.apps.googleusercontent.com";

export async function GET(req: NextRequest) {
    try {
        const session = await getAuthenticatedMemberSession(req);
        const uid = session?.memberData.uid;
        if (!session || typeof uid !== "string" || !uid) {
            return NextResponse.redirect(new URL("/login?returnTo=%2Fsetting%3Ftab%3Dexit-site", req.url));
        }

        const { value: state, nonce } = createGoogleOAuthState("/setting?tab=exit-site", {
            purpose: "delete",
            userId: session.userId,
            uid
        });
        const callbackUrl = new URL("/api/auth/google/callback", req.url);
        const authorizationUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
        authorizationUrl.searchParams.set("client_id", GOOGLE_CLIENT_ID);
        authorizationUrl.searchParams.set("redirect_uri", callbackUrl.toString());
        authorizationUrl.searchParams.set("response_type", "id_token");
        authorizationUrl.searchParams.set("response_mode", "form_post");
        authorizationUrl.searchParams.set("scope", "openid email profile");
        authorizationUrl.searchParams.set("prompt", "select_account");
        authorizationUrl.searchParams.set("nonce", nonce);
        authorizationUrl.searchParams.set("state", state);
        return NextResponse.redirect(authorizationUrl);
    } catch (error) {
        console.error("Failed to start Google account deletion", error);
        return NextResponse.redirect(new URL("/setting?tab=exit-site&googleDelete=start-error", req.url));
    }
}
