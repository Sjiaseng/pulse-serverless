import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db/connection";
import { users, oauth_accounts, pets, leaderboards } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import * as jose from "jose";
import { cookieOpts } from "@/lib/oauth";

type TokenResponse = {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  scope?: string;
  token_type: string;
  id_token?: string;
};

type GoogleUserInfo = {
  sub: string;
  name: string;
  given_name?: string;
  family_name?: string;
  picture: string;
  email?: string;
  email_verified: boolean;
  locale?: string;
  hd?: string;
};

export async function GET(request: Request) {
  const cookieStore = await cookies();
  const url = new URL(request.url);
  const provider = url.searchParams.get("provider") ?? "google";

  if (provider !== "google") {
    return NextResponse.json(
      { error: "Unsupported Provider" },
      { status: 400 },
    );
  }

  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  const stateCookie = cookieStore.get("oauth_state")?.value;
  const verifier = cookieStore.get("oauth_verifier")?.value;

  if (!code || !state || !stateCookie || !verifier || state !== stateCookie) {
    return NextResponse.json({ error: "Invalid State " }, { status: 400 });
  }

  const clientId = process.env.GOOGLE_CLIENT_ID!;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET!;
  const baseURL = process.env.OAUTH_BASE_URL!;
  const redirectURI = `${baseURL}/api/auth/oauth/callback?provider=google`;

  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    code,
    grant_type: "authorization_code",
    redirect_uri: redirectURI,
    code_verifier: verifier,
  });

  const tokenResult = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!tokenResult.ok) {
    const text = await tokenResult.text();
    return NextResponse.json(
      { error: "Token exchange failed", detail: text },
      { status: 400 },
    );
  }

  const tokens = (await tokenResult.json()) as TokenResponse;

  const profileRes = await fetch(
    "https://openidconnect.googleapis.com/v1/userinfo",
    {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    },
  );

  if (!profileRes.ok) {
    const text = await profileRes.text();
    return NextResponse.json(
      { error: "Profile fetch failed", detail: text },
      { status: 400 },
    );
  }

  const profile = (await profileRes.json()) as GoogleUserInfo;
  const providerUserId = String(profile.sub);
  const email = String(profile.email ?? "");
  const name = profile.name ?? null;
  const image = profile.picture ?? null;

  // Check whether if there is an existing oauth_accounts link
  const [acc] = await db
    .select()
    .from(oauth_accounts)
    .where(
      and(
        eq(oauth_accounts.provider, "google"),
        eq(oauth_accounts.provider_account_id, providerUserId),
      ),
    )
    .limit(1);

  let userId: string;

  if (acc) {
    userId = acc.user_id;

    await db
      .update(oauth_accounts)
      .set({
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token ?? null,
        scope: tokens.scope ?? null,
        token_type: tokens.token_type ?? null,
        expires_at: tokens.expires_in
          ? new Date(Date.now() + tokens.expires_in * 1000)
          : null,
        updated_at: new Date(),
      })
      .where(
        and(
          eq(oauth_accounts.provider, "google"),
          eq(oauth_accounts.provider_account_id, providerUserId),
        ),
      );
  } else {
    // If no link, try to find any local user using their email
    let exists: typeof users.$inferSelect | undefined;

    if (email) {
      [exists] = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);
    }

    if (exists) {
      userId = exists.id;
    } else {
      // Create a user (no password hash since using Oauth) with pet and leaderboard
      const result = await db.transaction(async (tx) => {
        const [created] = await tx
          .insert(users)
          .values({
            email,
            username: name,
            profile_picture_url: image,
            role: "user",
          })
          .returning();

        // Create a pet for the new OAuth user
        const characteristics = [
          "Whimsical",
          "Humorous",
          "Charming",
          "Tactical",
          "Diabolical",
          "Euphorical",
          "Philosophical",
          "Satanical",
          "Tropical",
        ];
        const type = ["Rock", "Triangle", "Toast"];

        const chosenCharacteristics =
          characteristics[Math.floor(Math.random() * characteristics.length)];
        const chosenType = type[Math.floor(Math.random() * type.length)];

        await tx.insert(pets).values({
          pet_name: `${chosenCharacteristics} ${chosenType}`,
          pet_type: chosenType,
          pet_level: 1,
          pet_happiness: 50,
          pet_status: "Newborn",
          user_id: created.id,
        });

        // Create initial leaderboard entry
        await tx.insert(leaderboards).values({
          highest_level: 1,
          highest_score_cumulative: 0,
          highest_most_achievement: 0,
          user_id: created.id,
        });

        return created;
      });

      userId = result.id;
    }

    await db
      .insert(oauth_accounts)
      .values({
        user_id: userId,
        provider: "google",
        provider_account_id: providerUserId,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token ?? null,
        scope: tokens.scope ?? null,
        token_type: tokens.token_type,
        expires_at: tokens.expires_in
          ? new Date(Date.now() + tokens.expires_in * 1000)
          : null,
      })
      .onConflictDoNothing();
  }

  const [u] = await db
    .select({ role: users.role })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  const userRole = u?.role ?? "user";

  // Issuing JWT to pulse app
  const secret = new TextEncoder().encode(process.env.AUTH_SECRET!);
  const jwt = await new jose.SignJWT({ sub: userId, email, role: userRole })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);

  const roleRedirectMap: Record<string, string> = {
    admin: "/admin",
    practitioner: "/practitioner",
    user: "/user",
  };

  const redirectPath = roleRedirectMap[userRole] ?? "/user";

  const res = NextResponse.redirect(new URL(redirectPath, baseURL));
  res.cookies.set({
    name: "auth_token",
    value: jwt,
    maxAge: 60 * 60 * 24 * 7,
    ...cookieOpts(),
  });
  res.cookies.set({ name: "oauth_state", value: "", path: "/", maxAge: 0 });
  res.cookies.set({ name: "oauth_verifier", value: "", path: "/", maxAge: 0 });

  return res;
}
