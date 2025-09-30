import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/connection";
import { eq, desc, sql } from "drizzle-orm";
import { users, leaderboards } from "@/lib/db/schema";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const type = searchParams.get("type") || "allTime"; // "weekly" or "allTime"

    // Get leaderboard data with user details
    const leaderboardData = await db
      .select({
        userId: users.id,
        username: users.username,
        profilePictureURL: users.profile_picture_url,
        level: leaderboards.highest_level,
        points: leaderboards.highest_score_cumulative,
        achievements: leaderboards.highest_most_achievement,
      })
      .from(leaderboards)
      .innerJoin(users, eq(leaderboards.user_id, users.id))
      .orderBy(desc(leaderboards.highest_score_cumulative))
      .limit(20); // Top 20 players

    // Add rank to each player
    const rankedLeaderboard = leaderboardData.map((player, index) => ({
      ...player,
      rank: index + 1,
    }));

    // Find current user's position if userId provided
    let userPosition = null;
    if (userId) {
      const userIndex = rankedLeaderboard.findIndex(player => player.userId === userId);
      if (userIndex !== -1) {
        userPosition = {
          ...rankedLeaderboard[userIndex],
          percentile: Math.round((1 - (userIndex / rankedLeaderboard.length)) * 100),
        };
      } else {
        // If user not in top 20, get their actual position
        const [userStats] = await db
          .select({
            userId: users.id,
            username: users.username,
            profilePictureURL: users.profile_picture_url,
            level: leaderboards.highest_level,
            points: leaderboards.highest_score_cumulative,
            achievements: leaderboards.highest_most_achievement,
          })
          .from(leaderboards)
          .innerJoin(users, eq(leaderboards.user_id, users.id))
          .where(eq(users.id, userId))
          .limit(1);

        if (userStats) {
          // Count how many users have higher scores
          const [higherScores] = await db
            .select({ count: sql<number>`cast(count(*) as int)` })
            .from(leaderboards)
            .where(sql`${leaderboards.highest_score_cumulative} > ${userStats.points}`);

          const totalUsers = await db
            .select({ count: sql<number>`cast(count(*) as int)` })
            .from(leaderboards);

          userPosition = {
            ...userStats,
            rank: (higherScores?.count || 0) + 1,
            percentile: Math.round((1 - ((higherScores?.count || 0) / (totalUsers[0]?.count || 1))) * 100),
          };
        }
      }
    }

    return NextResponse.json({
      success: {
        leaderboard: rankedLeaderboard,
        userPosition: userPosition,
        type: type,
      }
    });

  } catch (error) {
    console.error("Leaderboard error:", error);
    return NextResponse.json(
      { error: "Error fetching leaderboard data" },
      { status: 500 }
    );
  }
}