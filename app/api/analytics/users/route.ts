import { NextResponse } from "next/server"
import { users } from "@/lib/db/schema" 
import { sql, and, gte, lte } from "drizzle-orm"
import { eachDayOfInterval, startOfDay, endOfDay, format } from "date-fns"
import { db } from "@/lib/db/connection"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const startDate = new Date(searchParams.get("startDate") || "2024-01-01")
  const endDate = new Date(searchParams.get("endDate") || "2024-12-31")

  const days = eachDayOfInterval({ start: startDate, end: endDate })

  const results = await Promise.all(
    days.map(async (day) => {
      const start = startOfDay(day)
      const end = endOfDay(day)

      const res = await db
        .select({ count: sql<string>`count(*)` }) 
        .from(users)
        .where(and(gte(users.created_at, start), lte(users.created_at, end)))

      const count = res[0]?.count ? Number(res[0].count) : 0

      return {
        date: format(day, "yyyy-MM-dd"),
        userGrowth: count,
      }
    })
  )

  return NextResponse.json(results)
}
