import { NextResponse } from "next/server";
import { db } from "@/lib/db/connection";
import { forums, forumPosts, forumComments } from "@/lib/db/schema";
import { sql, and, gte, lte } from "drizzle-orm";
import { eachDayOfInterval, startOfDay, endOfDay, format } from "date-fns";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const startDate = new Date(searchParams.get("startDate") || "2024-01-01");
  const endDate = new Date(searchParams.get("endDate") || "2024-12-31");

  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const results = await Promise.all(
    days.map(async (day) => {
      const start = startOfDay(day);
      const end = endOfDay(day);

      const [{ count: forumsCount }] = await db
        .select({ count: sql<number>`count(*)` })
        .from(forums)
        .where(and(gte(forums.created_at, start), lte(forums.created_at, end)));

      const [{ count: postsCount }] = await db
        .select({ count: sql<number>`count(*)` })
        .from(forumPosts)
        .where(and(gte(forumPosts.date_posted, start), lte(forumPosts.date_posted, end)));

      const [{ count: commentsCount }] = await db
        .select({ count: sql<number>`count(*)` })
        .from(forumComments)
        .where(and(gte(forumComments.date_created, start), lte(forumComments.date_created, end)));

      return {
        date: format(day, "yyyy-MM-dd"),
        forumActivity: Number(forumsCount) + Number(postsCount) + Number(commentsCount),
      };
    })
  );

  return NextResponse.json(results);
}
