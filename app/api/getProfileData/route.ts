import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/connection";
import { eq, and, desc } from "drizzle-orm";
import {
  users,
  leaderboards,
  achievements,
  questCompletions,
} from "@/lib/db/schema";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 },
      );
    }

    const result = await db.transaction(async (tx) => {
      const [userData] = await tx
        .select({
          username: users.username,
          profilePictureURL: users.profile_picture_url,
        })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      const [leaderboardData] = await tx
        .select({
          highest_level: leaderboards.highest_level,
          highest_score_cumulative: leaderboards.highest_score_cumulative,
          highest_most_achievement: leaderboards.highest_most_achievement,
        })
        .from(leaderboards)
        .where(eq(leaderboards.user_id, userId))
        .limit(1);

      const userAchievements = await tx
        .select({
          id: achievements.id,
          title: achievements.achievement_title,
          description: achievements.achievement_description,
          icon: achievements.achievement_icon,
          completedAt: questCompletions.completed_at,
        })
        .from(achievements)
        .innerJoin(
          questCompletions,
          eq(achievements.quest_id, questCompletions.quest_id),
        )
        .where(
          and(
            eq(questCompletions.user_id, userId),
            eq(questCompletions.completion_status, "completed"),
          ),
        )
        .orderBy(desc(questCompletions.completed_at));

      return {
        userData,
        leaderboardData,
        userAchievements,
      };
    });

    return NextResponse.json(
      {
        success: {
          user: result.userData,
          leaderboard: result.leaderboardData,
          achievements: result.userAchievements,
        },
      },
      { status: 200 },
    );
  } catch (error: unknown) {
    return NextResponse.json(
      { message: "Error fetching user profile", error },
      { status: 500 },
    );
  }
}
