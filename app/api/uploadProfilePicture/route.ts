import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/connection";
import { eq } from "drizzle-orm";
import { users } from "@/lib/db/schema";
import { z } from "zod";

const UpdateProfilePictureSchema = z.object({
  userId: z.string(),
  profilePictureUrl: z.string(),
});

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, profilePictureUrl } =
      UpdateProfilePictureSchema.parse(body);

    // Update the user's profile picture URL
    const [updatedUser] = await db
      .update(users)
      .set({
        profile_picture_url: profilePictureUrl,
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
    console.error("Update profile picture error:", error);

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

// For file uploads (if you want to allow direct file upload later)
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const userId = formData.get("userId") as string;

    if (!file || !userId) {
      return NextResponse.json(
        { error: "File and userId are required" },
        { status: 400 },
      );
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Only JPEG, PNG, and WebP files are allowed" },
        { status: 400 },
      );
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size must be less than 5MB" },
        { status: 400 },
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const extension = file.name.split(".").pop();
    const fileName = `user_${userId}_${timestamp}.${extension}`;

    // Here you would upload to AWS S3
    // For now, we'll return a mock response
    // In real implementation, you'd use AWS SDK to upload the file

    const mockUploadedUrl = `https://pulse-app-files.s3.us-east-1.amazonaws.com/profile-pictures/${fileName}`;

    // Update user's profile picture in database
    const [updatedUser] = await db
      .update(users)
      .set({
        profile_picture_url: mockUploadedUrl,
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

    return NextResponse.json({
      success: true,
      user: updatedUser,
      uploadedUrl: mockUploadedUrl,
    });
  } catch (error) {
    console.error("Upload profile picture error:", error);
    return NextResponse.json(
      { error: "Failed to upload profile picture" },
      { status: 500 },
    );
  }
}

