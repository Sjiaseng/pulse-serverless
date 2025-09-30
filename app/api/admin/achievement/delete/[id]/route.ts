import { NextResponse } from "next/server";
import { achievements } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/connection";
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    sessionToken: process.env.AWS_SESSION_TOKEN,
  },
});

const BUCKET = process.env.S3_BUCKET_NAME || "";

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const achievementId = parseInt(id);
    if (isNaN(achievementId)) {
      return NextResponse.json({ error: "Invalid achievement ID" }, { status: 400 });
    }

    const existing = await db
      .select()
      .from(achievements)
      .where(eq(achievements.id, achievementId))
      .limit(1)
      .then((res) => res[0]);

    if (!existing) {
      return NextResponse.json({ error: "Achievement not found" }, { status: 404 });
    }


    if (existing.achievement_icon) {
      try {
        const key = existing.achievement_icon.split("/").slice(-3).join("/"); 
        await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
        console.log("Deleted S3 image:", key);
      } catch (err) {
        console.error("Failed to delete S3 image:", err);
      }
    }


    await db.delete(achievements).where(eq(achievements.id, achievementId));

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error deleting achievement:", err);
    return NextResponse.json({ error: "Failed to delete achievement" }, { status: 500 });
  }
}
