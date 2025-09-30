import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const secret = new TextEncoder().encode(process.env.AUTH_SECRET);
    const { payload } = await jwtVerify(token, secret);
    
    if (!payload) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    console.log(payload);

    return NextResponse.json({
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    });
  } catch (err) {
    console.error("Error in /api/auth/me:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
