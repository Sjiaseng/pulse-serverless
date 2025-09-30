import { db } from "@/lib/db/connection";
import { users } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";

type UserInsert = typeof users.$inferInsert;
type UserRow = typeof users.$inferSelect;

export const usersRepository = {
  // Creating a new user
  async create(data: UserInsert): Promise<UserRow> {
    const [row] = await db.insert(users).values(data).returning();
    return row;
  },

  async getById(id: string): Promise<UserRow | null> {
    const [row] = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);
    return row ?? null;
  },

  async list(): Promise<UserRow[]> {
    return db.select().from(users);
  },

  async update(id: string, data: Partial<UserInsert>): Promise<UserRow | null> {
    const [row] = await db
      .update(users)
      .set(data)
      .where(eq(users.id, id))
      .returning();
    return row ?? null;
  },

  async remove(id: string): Promise<UserRow | null> {
    const [row] = await db.delete(users).where(eq(users.id, id)).returning();
    return row ?? null;
  },

  // selecting all user from the database to create chat session
  async listUser(): Promise<{ id: string; username: string; email: string; profile_picture_url: string | null; online_status: boolean | null }[]> {
    return db
      .select({
        id: users.id,
        username: users.username,
        email: users.email,
        profile_picture_url: users.profile_picture_url,
        online_status: users.online_status,
      })
      .from(users);
  },


  async getUserBasicById( id: string): Promise<{ username: string; profile_picture_url: string | null } | null> {
    const [row] = await db
      .select({
        username: users.username,
        profile_picture_url: users.profile_picture_url,
      })
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    return row ?? null;
  },

 async getUserStats(): Promise<{total: number; online: number; offline: number; suspended: number;}> {
    const [result] = await db
      .select({
        total: sql<number>`count(*)`,
        online: sql<number>`count(*) filter (where ${users.online_status} = true)`,
        offline: sql<number>`count(*) filter (where ${users.online_status} = false)`,
        suspended: sql<number>`count(*) filter (where ${users.suspension_status} = true)`,
      })
      .from(users);

    return {
      total: Number(result.total),
      online: Number(result.online),
      offline: Number(result.offline),
      suspended: Number(result.suspended),
    };
  },

  async updateSuspensionStatus(userId: string, suspend: boolean) {
    const [updatedUser] = await db
      .update(users)
      .set({ suspension_status: suspend })
      .where(eq(users.id, userId))
      .returning({
        id: users.id,
        suspension_status: users.suspension_status,
        online_status: users.online_status,
      });

    return updatedUser; // { id, suspension_status, online_status }
  },

  // upgrade user as admin
  async upgrade(userId: string): Promise<UserRow | null> {
    const [updatedUser] = await db
      .update(users)
      .set({ role: "admin" })
      .where(eq(users.id, userId))
      .returning();
    return updatedUser ?? null;
  },

  // downgrade admin as user
  async downgrade(userId: string): Promise<UserRow | null> {
    const [updatedUser] = await db
      .update(users)
      .set({ role: "user" })
      .where(eq(users.id, userId))
      .returning();
    return updatedUser ?? null;
  },

  // determine online status by email
  async setOnlineStatusByEmail(email: string, isOnline: boolean): Promise<UserRow | null> {
    const [row] = await db
      .update(users)
      .set({
        online_status: isOnline,
      })
      .where(eq(users.email, email))
      .returning();

    return row ?? null;
  },

  // make user status online
  async setOnline(userEmail: string): Promise<UserRow | null> {
    return this.setOnlineStatusByEmail(userEmail, true);
  },

  // make user status offline
  async setOffline(userEmail: string): Promise<UserRow | null> {
    return this.setOnlineStatusByEmail(userEmail, false);
  },

};
