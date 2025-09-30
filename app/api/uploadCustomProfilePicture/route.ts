import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { db } from "@/lib/db/connection";
import { eq } from "drizzle-orm";
import { users } from "@/lib/db/schema";

const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    sessionToken: process.env.AWS_SESSION_TOKEN!,
  },
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const userId = formData.get("userId") as string;

    if (!file) {
      return NextResponse.json({ error: "File is required" }, { status: 400 });
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
    const fileName = `custom_${timestamp}.${extension}`;

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to S3
    const bucketName = process.env.S3_BUCKET_NAME || "pulse-app-files";
    const key = `profile-pictures/${fileName}`;

    const uploadCommand = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: buffer,
      ContentType: file.type,
      ACL: "public-read", // Make the file publicly accessible
    });

    try {
      await s3Client.send(uploadCommand);
    } catch (s3Error) {
      console.error("S3 Upload Error:", s3Error);
      return NextResponse.json(
        { error: "Failed to upload file to S3" },
        { status: 500 },
      );
    }

    // Generate the public URL
    const uploadedUrl = `https://${bucketName}.s3.us-east-1.amazonaws.com/${key}`;

    // Update user's profile picture in database if userId is provided
    if (userId) {
      try {
        const [updatedUser] = await db
          .update(users)
          .set({
            profile_picture_url: uploadedUrl,
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
          return NextResponse.json(
            { error: "User not found" },
            { status: 404 },
          );
        }

        return NextResponse.json({
          success: true,
          uploadedUrl: uploadedUrl,
          fileName: fileName,
          user: updatedUser,
        });
      } catch (dbError) {
        console.error("Database update error:", dbError);
        // File was uploaded successfully, but DB update failed
        // We should probably delete the uploaded file, but for now just return the URL
        return NextResponse.json({
          success: true,
          uploadedUrl: uploadedUrl,
          fileName: fileName,
          warning: "File uploaded but database update failed",
        });
      }
    }

    return NextResponse.json({
      success: true,
      uploadedUrl: uploadedUrl,
      fileName: fileName,
    });
  } catch (error) {
    console.error("Upload profile picture error:", error);
    return NextResponse.json(
      { error: "Failed to upload profile picture" },
      { status: 500 },
    );
  }
}

