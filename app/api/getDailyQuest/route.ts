import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { db } from "@/lib/db/connection";
import { quests, questCompletions } from "@/lib/db/schema";
import { gte, lte, and, eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    // Get userId from query params
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 },
      );
    }

    // Get start and end of today
    const today = new Date();
    const startOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    );
    const endOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      23,
      59,
      59,
    );

    // Fetch quests with completion status
    const questsWithCompletion = await db
      .select({
        // Quest fields
        id: quests.id,
        title: quests.title,
        description: quests.description,
        points_awarded: quests.points_awarded,
        available_date: quests.available_date,
        last_updated_at: quests.last_updated_at,
        expiration_date: quests.expiration_date,
        difficulty_level: quests.difficulty_level,
        // Completion status
        completed: questCompletions.completion_status,
        completed_at: questCompletions.completed_at,
      })
      .from(quests)
      .leftJoin(
        questCompletions,
        and(
          eq(questCompletions.quest_id, quests.id),
          eq(questCompletions.user_id, userId),
        ),
      )
      .where(
        and(
          gte(quests.available_date, startOfDay),
          lte(quests.available_date, endOfDay),
        ),
      );

    // Transform the data to include a boolean completed field
    const questsWithStatus = questsWithCompletion.map((quest) => ({
      id: quest.id,
      title: quest.title,
      description: quest.description,
      points_awarded: quest.points_awarded,
      available_date: quest.available_date,
      last_updated_at: quest.last_updated_at,
      expiration_date: quest.expiration_date,
      difficulty_level: quest.difficulty_level,
      completed: quest.completed === "completed",
      completed_at: quest.completed_at,
    }));

    return NextResponse.json({
      success: true,
      quests: questsWithStatus,
      count: questsWithStatus.length,
    });
  } catch (error) {
    console.error("Error fetching daily quests:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch daily quests",
      },
      { status: 500 },
    );
  }
}
