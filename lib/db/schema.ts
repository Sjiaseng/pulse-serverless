import {
  pgTable,
  boolean,
  varchar,
  uuid,
  text,
  integer,
  timestamp,
  primaryKey,
  serial,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  username: varchar("username", { length: 256 }).notNull(),
  email: varchar("email", { length: 256 }).notNull().unique(),
  passwordHash: varchar("password", { length: 256 }),
  profile_picture_url: text("profile_picture_url"),
  role: varchar("role", { length: 20 }).notNull().default("user"),
  gender: varchar("gender", { length: 10 }),
  online_status: boolean("online_status").default(false),
  suspension_status: boolean("suspension_status").default(false),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const oauth_accounts = pgTable(
  "oauth_accounts",
  {
    user_id: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    provider: varchar("provider", { length: 50 }).notNull(),
    provider_account_id: varchar("provider_account_id", {
      length: 255,
    }).notNull(),
    access_token: varchar("access_token", { length: 1024 }),
    refresh_token: varchar("refresh_token", { length: 1024 }),
    scope: varchar("scope", { length: 512 }),
    token_type: varchar("token_type", { length: 50 }),
    expires_at: timestamp("expires_at", { withTimezone: true }),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.provider, t.provider_account_id] }),
  }),
);

export const pets = pgTable("pets", {
  id: serial("id").primaryKey(), // Changed to serial for auto-increment
  pet_name: varchar("pet_name", { length: 256 }).notNull(),
  pet_type: varchar("pet_type", { length: 256 }).notNull(),
  pet_experience: integer("pet_experience").notNull().default(0),
  pet_level: integer("pet_level").notNull().default(1),
  pet_happiness: integer("pet_happiness").notNull().default(50),
  pet_status: varchar("pet_status", { length: 256 })
    .notNull()
    .default("healthy"),
  user_id: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const forums = pgTable("forums", {
  id: serial("id").primaryKey(),
  topic: varchar("topic", { length: 256 }).notNull(),
  description: text("description"),
  popular_rank: integer("popular_rank").default(0),
  user_id: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const forumPosts = pgTable("forum_posts", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 256 }).notNull(),
  description: text("description").notNull(),
  date_posted: timestamp("date_posted", { withTimezone: true }).defaultNow(),
  upvotes: integer("upvotes").default(0),
  downvotes: integer("downvotes").default(0),
  user_id: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  forum_id: integer("forum_id")
    .notNull()
    .references(() => forums.id, { onDelete: "cascade" }),
});

export const forumComments = pgTable("forum_comments", {
  // Changed table name
  id: serial("id").primaryKey(), // Changed to serial
  content: text("content").notNull(), // Changed from title/description to content
  date_created: timestamp("date_created", { withTimezone: true }).defaultNow(),
  upvotes: integer("upvotes").default(0),
  downvotes: integer("downvotes").default(0),
  forum_post_id: integer("forum_post_id") // Changed to integer
    .notNull()
    .references(() => forumPosts.id, { onDelete: "cascade" }),
  user_id: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
});

export const leaderboards = pgTable("leaderboards", {
  id: serial("id").primaryKey(),
  highest_level: integer("highest_level").default(0),
  highest_score_cumulative: integer("highest_score_cumulative").default(0),
  highest_most_achievement: integer("hightest_most_achievement").default(0),
  user_id: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
});

export const quests = pgTable("quests", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 256 }).notNull(),
  description: text("description"),
  points_awarded: integer("points_awarded").default(0),
  available_date: timestamp("available_date", { withTimezone: true }),
  last_updated_at: timestamp("last_updated_at", {
    withTimezone: true,
  }).defaultNow(),
  expiration_date: timestamp("expiration_date", { withTimezone: true }),
  difficulty_level: varchar("difficulty_level", { length: 50 }),
});

export const questCompletions = pgTable("quest_completions", {
  id: serial("id").primaryKey(),
  completed_at: timestamp("completed_at", { withTimezone: true }).defaultNow(),
  completion_status: varchar("completion_status", { length: 50 }),
  quest_id: serial("quest_id")
    .notNull()
    .references(() => quests.id, { onDelete: "cascade" }),
  user_id: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
});

export const achievements = pgTable("achievements", {
  id: serial("id").primaryKey(),
  achievement_title: varchar("achievement_title", { length: 256 }).notNull(),
  achievement_description: text("achievement_description"),
  achievement_icon: text("achievement_icon"),
  quest_id: serial("quest_id")
    .notNull()
    .references(() => quests.id, { onDelete: "cascade" }),
});

export const practitioners = pgTable("practitioners", {
  id: serial("id").primaryKey(),
  license_url: text("license_url").notNull(),
  submitted_at: timestamp("submitted_at", { withTimezone: true }).defaultNow(),
  status: varchar("status", { length: 50 }).default("pending"),
  user_id: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
});
