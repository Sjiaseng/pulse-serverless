import { NextResponse } from "next/server"
import { db } from "@/lib/db/connection"
import { questCompletions } from "@/lib/db/schema" 
import { sql, and, gte, lte } from "drizzle-orm"
import { eachDayOfInterval, startOfDay, endOfDay, format } from "date-fns"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const startDate = new Date(searchParams.get("startDate") || "2024-01-01")
  const endDate = new Date(searchParams.get("endDate") || "2024-12-31")

  const days = eachDayOfInterval({ start: startDate, end: endDate })

  const results = await Promise.all(
    days.map(async (day) => {
      const start = startOfDay(day)
      const end = endOfDay(day)

      // group by completion_status
      const rows = await db
        .select({
          status: questCompletions.completion_status,
          count: sql<number>`count(*)`,
        })
        .from(questCompletions)
        .where(
          and(
            gte(questCompletions.completed_at, start),
            lte(questCompletions.completed_at, end)
          )
        )
        .groupBy(questCompletions.completion_status)

      return {
        date: format(day, "yyyy-MM-dd"),
        statuses: rows.map((r) => ({
          status: r.status,
          count: Number(r.count),
        })),
      }
    })
  )

  return NextResponse.json(results)
}
