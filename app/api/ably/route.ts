import { NextRequest, NextResponse } from "next/server";
import Ably from "ably";
import { jwtVerify } from "jose";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("auth_token")?.value;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const secret = new TextEncoder().encode(process.env.AUTH_SECRET);
    const { payload } = await jwtVerify(token, secret);

    const decoded = payload as {
      sub: string;
      email: string;
      role: "admin" | "user" | "practitioner";
    };

    const clientId = decoded.email;

    const rest = new Ably.Rest(process.env.ABLY_API_KEY!);
    const tokenRequest = await rest.auth.createTokenRequest({
      clientId,
    });

    return NextResponse.json(tokenRequest);
  } catch (err) {
    console.error("[Ably Auth] JWT verification failed:", err);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
