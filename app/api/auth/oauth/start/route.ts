import { NextResponse } from "next/server";
import { cookieOpts, randUrlSafe, sha256base64url } from "@/lib/oauth";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const provider = url.searchParams.get("provider") ?? "google";

  if (provider !== "google")
    return NextResponse.json(
      { error: "Unsupported provider" },
      { status: 400 },
    );

  const clientID = process.env.GOOGLE_CLIENT_ID!;
  const baseURL = process.env.OAUTH_BASE_URL!;
  const redirectUri = `${baseURL}/api/auth/oauth/callback?provider=google`;

  const state = randUrlSafe(16);
  const verifier = randUrlSafe(64);
  const challenge = await sha256base64url(verifier);

  const auth = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  auth.searchParams.set("client_id", clientID);
  auth.searchParams.set("redirect_uri", redirectUri);
  auth.searchParams.set("response_type", "code");
  auth.searchParams.set("scope", "openid email profile");
  auth.searchParams.set("state", state);
  auth.searchParams.set("code_challenge", challenge);
  auth.searchParams.set("code_challenge_method", "S256");
  const res = NextResponse.redirect(auth.toString());
  const base = cookieOpts();
  res.cookies.set({ name: "oauth_state", value: state, maxAge: 600, ...base });
  res.cookies.set({
    name: "oauth_verifier",
    value: verifier,
    maxAge: 600,
    ...base,
  });

  return res;
}
