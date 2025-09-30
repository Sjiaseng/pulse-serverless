import { db } from "@/lib/db/connection";
import { practitioners, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { practitionerId, userId, status } = await req.json();

    if (!["verified", "rejected"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    // update practitioner status
    await db
      .update(practitioners)
      .set({ status })
      .where(eq(practitioners.id, practitionerId));

    // update user role based on status
    const newRole = status === "verified" ? "practitioner" : "user";

    await db
      .update(users)
      .set({ role: newRole })
      .where(eq(users.id, userId));

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
