import { db } from "@/lib/db/connection";
import { achievements, quests, questCompletions } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";

type AchievementInsert = typeof achievements.$inferInsert;
type AchievementRow = typeof achievements.$inferSelect;

export const achievementRepository = {
  // Create a new achievement
  async create(data: AchievementInsert): Promise<AchievementRow> {
    const [row] = await db.insert(achievements).values(data).returning();
    return row;
  },

  // Get an achievement by ID
  async getById(id: number): Promise<AchievementRow | null> {
    const [row] = await db
      .select()
      .from(achievements)
      .where(eq(achievements.id, id))
      .limit(1);
    return row ?? null;
  },

  // Update an achievement by ID
  async update(id: number, data: Partial<AchievementInsert>): Promise<AchievementRow | null> {
    const [row] = await db
      .update(achievements)
      .set(data)
      .where(eq(achievements.id, id))
      .returning();
    return row ?? null;
  },

  // Delete an achievement by ID
  async remove(id: number): Promise<AchievementRow | null> {
    const [row] = await db
      .delete(achievements)
      .where(eq(achievements.id, id))
      .returning();
    return row ?? null;
  },

  // List all achievements
  async listAll(): Promise<AchievementRow[]> {
    return db.select().from(achievements);
  },

  async listWithQuestAndCompletions(): Promise<
    {
      id: number;
      achievement_title: string;
      achievement_description: string | null;
      achievement_icon: string | null;
      quest_id: number | null;
      quest_title: string | null;
      points_awarded: number | null;
      completions: number;
    }[]
  > {
    const results = await db
      .select({
        id: achievements.id,
        achievement_title: achievements.achievement_title,
        achievement_description: achievements.achievement_description,
        achievement_icon: achievements.achievement_icon,
        quest_id: achievements.quest_id,
        quest_title: quests.title,
        points_awarded: quests.points_awarded,
        completions: sql<number>`COUNT(${questCompletions.id})`,
      })
      .from(achievements)
      .leftJoin(quests, eq(quests.id, achievements.quest_id))
      .leftJoin(questCompletions, eq(questCompletions.quest_id, achievements.quest_id))
      .groupBy(
        achievements.id,
        achievements.achievement_title,
        achievements.achievement_description,
        achievements.achievement_icon,
        achievements.quest_id,
        quests.title,
        quests.points_awarded
      );

    return results;
  },
};
