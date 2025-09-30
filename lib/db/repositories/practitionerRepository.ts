import { db } from "@/lib/db/connection";
import { practitioners, users } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";

type PractitionerInsert = typeof practitioners.$inferInsert;
type PractitionerRow = typeof practitioners.$inferSelect;

export const practitionersRepository = {
  // Create new practitioner record
  async create(data: PractitionerInsert): Promise<PractitionerRow> {
    const [row] = await db.insert(practitioners).values(data).returning();
    return row;
  },

  // Get practitioner by id
  async getById(id: number): Promise<PractitionerRow | null> {
    const [row] = await db
      .select()
      .from(practitioners)
      .where(eq(practitioners.id, id))
      .limit(1);
    return row ?? null;
  },

  // List all practitioners
  async list(): Promise<PractitionerRow[]> {
    return db.select().from(practitioners);
  },

  // Update practitioner by id
  async update(id: number, data: Partial<PractitionerInsert>): Promise<PractitionerRow | null> {
    const [row] = await db
      .update(practitioners)
      .set(data)
      .where(eq(practitioners.id, id))
      .returning();
    return row ?? null;
  },

  // Remove practitioner by id
  async remove(id: number): Promise<PractitionerRow | null> {
    const [row] = await db
      .delete(practitioners)
      .where(eq(practitioners.id, id))
      .returning();
    return row ?? null;
  },

  // Get all practitioners by user_id
  async getByUserId(userId: string): Promise<PractitionerRow[]> {
    return db
      .select()
      .from(practitioners)
      .where(eq(practitioners.user_id, userId));
  },

  async getPractitionerStats(): Promise<{
    total: number;
    pending: number;
    verified: number;
    rejected: number;
  }> {
    const [result] = await db
      .select({
        total: sql<number>`count(*)`,
        pending: sql<number>`count(*) filter (where ${practitioners.status} = 'pending')`,
        verified: sql<number>`count(*) filter (where ${practitioners.status} = 'verified')`,
        rejected: sql<number>`count(*) filter (where ${practitioners.status} = 'rejected')`,
      })
      .from(practitioners);

    return {
      total: Number(result.total),
      pending: Number(result.pending),
      verified: Number(result.verified),
      rejected: Number(result.rejected),
    };
  },

  async listPractitionerInfo(): Promise<
    {
      practitioner: typeof practitioners.$inferSelect;
      user: typeof users.$inferSelect;
    }[]
  > {
    const rows = await db
      .select({
        practitioner: practitioners,
        user: users,
      })
      .from(practitioners)
      .innerJoin(users, eq(practitioners.user_id, users.id));

    return rows;
  },

  async getPractitionerInfoById(practitionerId: number): Promise<{
    practitioner: typeof practitioners.$inferSelect;
    user: typeof users.$inferSelect;
  } | null> {
    const [row] = await db
      .select({
        practitioner: practitioners,
        user: users,
      })
      .from(practitioners)
      .innerJoin(users, eq(practitioners.user_id, users.id))
      .where(eq(practitioners.id, practitionerId))
      .limit(1);

    return row ?? null;
  }

};
