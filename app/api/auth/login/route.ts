import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/connection";
import { users } from "@/lib/db/schema";
import { z } from "zod";
import bcrypt from "bcrypt";
import * as jose from "jose";
import { cookieOpts } from "@/lib/oauth";

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = LoginSchema.parse(body);

    // 1. Get the user record
    const result = await db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase().trim()))
      .limit(1);

    const user = result[0];

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 400 },
      );
    }

    // 2. Check if user has a password (OAuth users don't have passwords)
    if (!user.passwordHash) {
      return NextResponse.json(
        { error: "Please sign in with Google" },
        { status: 400 },
      );
    }

    // 3. Verify password
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);

    if (!isValidPassword) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 400 },
      );
    }

    // 4. Create JWT token
    const secret = new TextEncoder().encode(process.env.AUTH_SECRET!);
    const jwt = await new jose.SignJWT({
      sub: user.id,
      email: user.email,
      role: user.role || "user",
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("7d")
      .sign(secret);

    // 5. Set cookie and return success
    const response = NextResponse.json(
      {
        message: "Login successful",
        user: {
          username: user.username,
          role: user.role,
        },
      },
      { status: 200 },
    );

    response.cookies.set({
      name: "auth_token",
      value: jwt,
      maxAge: 60 * 60 * 24 * 7, // 7 days
      ...cookieOpts(),
    });

    return response;
  } catch (error: unknown) {
    console.error("Login error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
