import { NextResponse } from "next/server"
import { db } from "@/lib/db/connection"
import { practitioners } from "@/lib/db/schema"
import { sql, and, gte, lte } from "drizzle-orm"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const startDate = new Date(searchParams.get("startDate") || "2024-01-01")
  const endDate = new Date(searchParams.get("endDate") || "2024-12-31")

  const results = await db
    .select({
      status: practitioners.status,
      count: sql<number>`count(*)`,
    })
    .from(practitioners)
    .where(
      and(
        gte(practitioners.submitted_at, startDate),
        lte(practitioners.submitted_at, endDate)
      )
    )
    .groupBy(practitioners.status)

  return NextResponse.json(results)
}
