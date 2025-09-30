import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

export const dynamic = "force-dynamic";

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // Public routes that don't require authentication
  const publicRoutes = [
    "/api/auth/register",
    "/api/auth/login",
    "/api/auth/user-exists",
  ];

  if (publicRoutes.some((route) => path.startsWith(route))) {
    return NextResponse.next();
  }

  const token = req.cookies.get("auth_token")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }

  try {
    const secret = new TextEncoder().encode(process.env.AUTH_SECRET);
    const { payload } = await jwtVerify(token, secret);

    const decoded = payload as {
      sub: string;
      email: string;
      role: "admin" | "user" | "practitioner";
    };

    // Role-based access
    const roleAccess: Record<string, string[]> = {
      admin: [
        "/admin",
        "/api/admin",
        "/api/system",
        "/api/auth/oauth/get-cookie",
        "/api/ws",
        "/api/auth",
      ],
      user: [
        "/user",
        "/api/user",
        "/api/auth/get-cookie",
        "/api/ws",
        "/api/auth",
      ],
      practitioner: [
        "/practitioner",
        "/api/practitioner",
        "/api/auth/get-cookie",
        "/api/ws",
        "/api/auth/",
      ],
    };

    const allowedPaths = roleAccess[decoded.role] || [];
    const normalizedPath = path.replace(/\/$/, ""); // remove trailing slash
    const hasAccess = allowedPaths.some(
      (p) => normalizedPath === p || normalizedPath.startsWith(p + "/"),
    );

    if (!hasAccess) {
      console.log("[Middleware] Access denied. Redirecting to /sign-in");
      return NextResponse.redirect(new URL("/sign-in", req.url));
    }

    // Redirect logged-in users away from /sign-in
    if (path === "/sign-in") {
      if (decoded.role === "admin")
        return NextResponse.redirect(new URL("/admin", req.url));
      if (decoded.role === "practitioner")
        return NextResponse.redirect(new URL("/practitioner", req.url));
      if (decoded.role === "user")
        return NextResponse.redirect(new URL("/user", req.url));
    }

    // Forward user info to APIs
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set("x-user-id", decoded.sub);
    requestHeaders.set("x-user-email", decoded.email);
    requestHeaders.set("x-user-role", decoded.role);

    return NextResponse.next({ request: { headers: requestHeaders } });
  } catch (err) {
    console.error("[Middleware] JWT verification failed:", err);
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }
}

export const config = {
  matcher: [
    "/user/:path*",
    "/admin/:path*",
    "/practitioner/:path*",
    "/api/admin/:path*",
    "/api/user/:path*",
    "/api/practitioner/:path*",
    "/api/system/:path*",
    "/admin",
    "/user",
    "/practitioner",
  ],
};
