import { db } from "@/lib/db/connection";
import { leaderboards, users } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

type LeaderboardInsert = typeof leaderboards.$inferInsert;
type LeaderboardRow = typeof leaderboards.$inferSelect;

export const leaderboardRepository = {
  // Add a leaderboard entry
  async create(data: LeaderboardInsert): Promise<LeaderboardRow> {
    const [row] = await db.insert(leaderboards).values(data).returning();
    return row;
  },

  // Get leaderboard entry by userId
  async getByUserId(userId: string): Promise<LeaderboardRow | null> {
    const [row] = await db
      .select()
      .from(leaderboards)
      .where(eq(leaderboards.user_id, userId))
      .limit(1);
    return row ?? null;
  },

  // Update a leaderboard entry
  async update(userId: string, data: Partial<LeaderboardInsert>): Promise<LeaderboardRow | null> {
    const [row] = await db
      .update(leaderboards)
      .set(data)
      .where(eq(leaderboards.user_id, userId))
      .returning();
    return row ?? null;
  },

  // Delete leaderboard entry
  async remove(userId: string): Promise<LeaderboardRow | null> {
    const [row] = await db
      .delete(leaderboards)
      .where(eq(leaderboards.user_id, userId))
      .returning();
    return row ?? null;
  },

  // List full leaderboard with usernames, sorted by highest score
  async listLeaderboard(): Promise<{ username: string | null; profile_picture_url: string | null; highestScore: number | null }[]> {
    return db
      .select({
        username: users.username,
        profile_picture_url: users.profile_picture_url,
        highestScore: leaderboards.highest_score_cumulative,
      })
      .from(leaderboards)
      .leftJoin(users, eq(users.id, leaderboards.user_id))
      .orderBy(desc(leaderboards.highest_score_cumulative));
  },

};
