import { NextRequest, NextResponse } from "next/server";
import { createGoogleOAuthState, getSafeReturnTo } from "@/lib/googleOAuth";

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
    ?? "452160426051-v29picfg583fn9vsu0fsq5ulfokrkfeb.apps.googleusercontent.com";

export async function GET(req: NextRequest) {
    try {
        const { value: state, nonce } = createGoogleOAuthState(getSafeReturnTo(req.nextUrl.searchParams.get("returnTo")));
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
        console.error("Failed to start Google login", error);
        return NextResponse.redirect(new URL("/login?google=start-error", req.url));
    }
}
