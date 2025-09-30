import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/connection";
import { eq } from "drizzle-orm";
import { users } from "@/lib/db/schema";
import { z } from "zod";

const UpdateProfileSchema = z.object({
  userId: z.string().uuid(),
  username: z.string().min(3).max(256),
});

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, username } = UpdateProfileSchema.parse(body);

    // Check if username is already taken by another user
    const existingUser = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.username, username))
      .limit(1);

    if (existingUser.length > 0 && existingUser[0].id !== userId) {
      return NextResponse.json(
        { error: "Username is already taken" },
        { status: 400 },
      );
    }

    // Update the user's username
    const [updatedUser] = await db
      .update(users)
      .set({
        username: username,
        updated_at: new Date(),
      })
      .where(eq(users.id, userId))
      .returning({
        id: users.id,
        username: users.username,
        email: users.email,
        profile_picture_url: users.profile_picture_url,
        updated_at: users.updated_at,
      });

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    console.error("Update profile error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input data", details: error },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

