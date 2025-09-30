import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic"; // ensure no static caching

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  if (!token) {
    return NextResponse.json({ message: "No token found" }, { status: 401 });
  }

  return NextResponse.json({ token });
}
