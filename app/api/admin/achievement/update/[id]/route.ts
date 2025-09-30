import { NextRequest, NextResponse } from "next/server";
import { achievements } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

import {
  S3Client,
  DeleteObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { db } from "@/lib/db/connection";

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    sessionToken: process.env.AWS_SESSION_TOKEN,
  },
});

const BUCKET = process.env.S3_BUCKET_NAME || "";

export async function POST(req: NextRequest) {
  const url = new URL(req.url);
  const segments = url.pathname.split("/"); // .../update/[id]/route
  const idStr = segments[segments.length - 2]; // grab the [id]
  const achievementId = Number(idStr);

  if (isNaN(achievementId)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  try {
    const formData = await req.formData();
    const title = formData.get("title")?.toString() || "";
    const description = formData.get("description")?.toString() || "";
    const achievementQuest = parseInt(
      formData.get("achievementQuest")?.toString() || "0",
    );
    const imageFile = formData.get("image") as File | null;

    // Fetch current achievement from DB
    const current = await db
      .select()
      .from(achievements)
      .where(eq(achievements.id, achievementId))
      .limit(1)
      .then((res) => res[0]);

    if (!current)
      return NextResponse.json(
        { error: "Achievement not found" },
        { status: 404 },
      );

    let imageUrl = current.achievement_icon;

    // If new image uploaded, remove old S3 file and upload new
    if (imageFile && imageFile.size > 0) {
      if (current.achievement_icon) {
        const key = current.achievement_icon.split("/").slice(-3).join("/"); // adjust if needed
        await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
      }

      const arrayBuffer = await imageFile.arrayBuffer();
      const s3Key = `achievement/${achievementId}/${imageFile.name}`;

      await s3.send(
        new PutObjectCommand({
          Bucket: BUCKET,
          Key: s3Key,
          Body: Buffer.from(arrayBuffer),
          ContentType: imageFile.type || undefined,
          ACL: "public-read",
        }),
      );

      imageUrl = `https://${BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Key}`;
    }

    // Update achievement in DB
    const updated = await db
      .update(achievements)
      .set({
        achievement_title: title,
        achievement_description: description,
        quest_id: achievementQuest,
        achievement_icon: imageUrl,
      })
      .where(eq(achievements.id, achievementId))
      .returning();

    return NextResponse.json({ achievement: updated[0] });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to update achievement" },
      { status: 500 },
    );
  }
}
