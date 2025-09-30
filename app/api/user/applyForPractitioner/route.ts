import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { db } from "@/lib/db/connection";
import { eq } from "drizzle-orm";
import { practitioners } from "@/lib/db/schema";

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

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    // Validate file type (only PDF)
    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "Only PDF files are allowed" },
        { status: 400 },
      );
    }

    // Validate file size (max 10MB for certificates)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size must be less than 10MB" },
        { status: 400 },
      );
    }

    // Check if user already has a pending or approved application
    const existingApplication = await db
      .select()
      .from(practitioners)
      .where(eq(practitioners.user_id, userId))
      .limit(1);

    if (existingApplication.length > 0) {
      const status = existingApplication[0].status;
      if (status === "pending") {
        return NextResponse.json(
          { error: "You already have a pending application" },
          { status: 400 },
        );
      } else if (status === "approved") {
        return NextResponse.json(
          { error: "You are already an approved practitioner" },
          { status: 400 },
        );
      }
    }

    // Generate unique filename
    const timestamp = Date.now();
    const fileName = `certificate_${userId}_${timestamp}.pdf`;

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to S3 in certificates folder
    const bucketName = process.env.S3_BUCKET_NAME || "pulse-app-files";
    const key = `certificates/${fileName}`;

    const uploadCommand = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: buffer,
      ContentType: file.type,
      ACL: "public-read", // Make certificates publicly accessible for admin viewing
    });

    try {
      await s3Client.send(uploadCommand);
    } catch (s3Error) {
      console.error("S3 Upload Error:", s3Error);
      return NextResponse.json(
        { error: "Failed to upload certificate to S3" },
        { status: 500 },
      );
    }

    // Generate the public URL
    const certificateUrl = `https://${bucketName}.s3.us-east-1.amazonaws.com/${key}`;

    // Create practitioner record in database
    try {
      const [newPractitioner] = await db
        .insert(practitioners)
        .values({
          user_id: userId,
          license_url: certificateUrl,
          status: "pending",
          submitted_at: new Date(),
        })
        .returning({
          id: practitioners.id,
          user_id: practitioners.user_id,
          license_url: practitioners.license_url,
          status: practitioners.status,
          submitted_at: practitioners.submitted_at,
        });

      return NextResponse.json({
        success: true,
        message: "Practitioner application submitted successfully",
        application: newPractitioner,
        certificateUrl: certificateUrl,
        fileName: fileName,
      });
    } catch (dbError) {
      console.error("Database error:", dbError);
      
      // File was uploaded successfully, but DB insert failed
      // In a production environment, you might want to delete the uploaded file
      return NextResponse.json(
        { error: "Failed to create practitioner application record" },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error("Practitioner application error:", error);
    return NextResponse.json(
      { error: "Failed to process practitioner application" },
      { status: 500 },
    );
  }
}