import { db } from "@/lib/db/connection";
import { quests, questCompletions } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";

type QuestInsert = typeof quests.$inferInsert;
type QuestRow = typeof quests.$inferSelect;

export const questRepository = {
  // Add a new quest
  async create(data: QuestInsert): Promise<QuestRow> {
    const [row] = await db.insert(quests).values(data).returning();
    return row;
  },

  // Get quest by ID
  async getById(id: number): Promise<QuestRow | null> {
    const [row] = await db
      .select()
      .from(quests)
      .where(eq(quests.id, id))
      .limit(1);
    return row ?? null;
  },

  // Update a quest by ID
  async update(id: number, data: Partial<QuestInsert>): Promise<QuestRow | null> {
    const [row] = await db
      .update(quests)
      .set(data)
      .where(eq(quests.id, id))
      .returning();
    return row ?? null;
  },

  // Delete a quest by ID
  async remove(id: number): Promise<QuestRow | null> {
    const [row] = await db
      .delete(quests)
      .where(eq(quests.id, id))
      .returning();
    return row ?? null;
  },

  async listQuestsWithCompletions(): Promise<{
    id: number;
    quest_title: string;
    quest_description: string | null;
    points: number | null;
    difficulty: string | null;
    available_date: Date | null;
    expiration_date: Date | null;
    completions: number;
  }[]> {
    const results = await db
      .select({
        id: quests.id,
        quest_title: quests.title,
        quest_description: quests.description,
        points: quests.points_awarded,
        difficulty: quests.difficulty_level,
        available_date: quests.available_date,
        expiration_date: quests.expiration_date,
        completions: sql<number>`COUNT(${questCompletions.quest_id})`,
      })
      .from(quests)
      .leftJoin(questCompletions, eq(questCompletions.quest_id, quests.id))
      .groupBy(
        quests.id,
        quests.title,
        quests.description,
        quests.points_awarded,
        quests.difficulty_level,
        quests.available_date,
        quests.expiration_date
      );

    return results;
  },

  async listQuestsAsSelection(): Promise<{
    id: number;
    quest_title: string;
  }[]> {
    const results = await db
      .select({
        id: quests.id,
        quest_title: quests.title,
      })
      .from(quests);

    return results;
  },
}
