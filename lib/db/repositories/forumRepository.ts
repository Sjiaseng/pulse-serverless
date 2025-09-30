import { db } from "@/lib/db/connection";
import { forums, forumPosts, forumComments, users } from "@/lib/db/schema";
import { eq, desc, sql  } from "drizzle-orm";

type ForumInsert = typeof forums.$inferInsert;
type ForumRow = typeof forums.$inferSelect;
type ForumPostInsert = typeof forumPosts.$inferInsert;
type ForumPostRow = typeof forumPosts.$inferSelect;
type ForumCommentInsert = typeof forumComments.$inferInsert;
type ForumCommentRow = typeof forumComments.$inferSelect;

export const forumRepository = {
  // Forum CRUD operations
  async createForum(data: ForumInsert): Promise<ForumRow> {
    const [row] = await db.insert(forums).values(data).returning();
    return row;
  },

  async getForumById(id: number): Promise<ForumRow | null> {
    const [row] = await db
      .select()
      .from(forums)
      .where(eq(forums.id, id))
      .limit(1);
    return row ?? null;
  },

  async getAllForums(): Promise<ForumRow[]> {
    return db.select().from(forums).orderBy(desc(forums.popular_rank));
  },

  async updateForum(id: number, data: Partial<ForumInsert>): Promise<ForumRow | null> {
    const [row] = await db
      .update(forums)
      .set(data)
      .where(eq(forums.id, id))
      .returning();
    return row ?? null;
  },

  async deleteForum(id: number): Promise<ForumRow | null> {
    const [row] = await db
      .delete(forums)
      .where(eq(forums.id, id))
      .returning();
    return row ?? null;
  },

  // Forum Post CRUD operations
  async createPost(data: ForumPostInsert): Promise<ForumPostRow> {
    const [row] = await db.insert(forumPosts).values(data).returning();
    return row;
  },

  async getPostById(id: number): Promise<ForumPostRow | null> {
    const [row] = await db
      .select()
      .from(forumPosts)
      .where(eq(forumPosts.id, id))
      .limit(1);
    return row ?? null;
  },

  async getPostWithUserAndForumById(id: number) {
    const [row] = await db
      .select({
        id: forumPosts.id,
        title: forumPosts.title,
        description: forumPosts.description,
        date_posted: forumPosts.date_posted,
        upvotes: forumPosts.upvotes,
        downvotes: forumPosts.downvotes,
        forum_id: forumPosts.forum_id,
        user_id: forumPosts.user_id,
        username: users.username,
        user_profile_picture: users.profile_picture_url,
        user_role: users.role,
        forum_topic: forums.topic,
        comment_count: sql<number>`(
          SELECT COUNT(*) 
          FROM ${forumComments} 
          WHERE ${forumComments.forum_post_id} = ${forumPosts.id}
        )`.as('comment_count')
      })
      .from(forumPosts)
      .leftJoin(users, eq(forumPosts.user_id, users.id))
      .innerJoin(forums, eq(forumPosts.forum_id, forums.id))
      .where(eq(forumPosts.id, id))
      .limit(1);
    return row ?? null;
  },

  async getPostsByForumId(forumId: number): Promise<ForumPostRow[]> {
    return db
      .select()
      .from(forumPosts)
      .where(eq(forumPosts.forum_id, forumId))
      .orderBy(desc(forumPosts.date_posted));
  },

  async getAllPosts(): Promise<ForumPostRow[]> {
    return db
      .select()
      .from(forumPosts)
      .orderBy(desc(forumPosts.date_posted));
  },

  async getPostsWithUserAndForum() {
    return db
      .select({
        id: forumPosts.id,
        title: forumPosts.title,
        description: forumPosts.description,
        date_posted: forumPosts.date_posted,
        upvotes: forumPosts.upvotes,
        downvotes: forumPosts.downvotes,
        forum_id: forumPosts.forum_id,
        user_id: forumPosts.user_id,
        username: users.username,
        user_profile_picture: users.profile_picture_url,
        user_role: users.role,
        forum_topic: forums.topic,
        // Calculate comment count
        comment_count: sql<number>`(
          SELECT COUNT(*) 
          FROM ${forumComments} 
          WHERE ${forumComments.forum_post_id} = ${forumPosts.id}
        )`.as('comment_count')
      })
      .from(forumPosts)
      .leftJoin(users, eq(forumPosts.user_id, users.id))
      .innerJoin(forums, eq(forumPosts.forum_id, forums.id))
      .orderBy(desc(forumPosts.date_posted));
  },

  async getPostsWithUserAndForumByForumId(forumId: number) {
    return db
      .select({
        id: forumPosts.id,
        title: forumPosts.title,
        description: forumPosts.description,
        date_posted: forumPosts.date_posted,
        upvotes: forumPosts.upvotes,
        downvotes: forumPosts.downvotes,
        forum_id: forumPosts.forum_id,
        user_id: forumPosts.user_id,
        username: users.username,
        user_profile_picture: users.profile_picture_url,
        user_role: users.role,
        forum_topic: forums.topic,
        comment_count: sql<number>`(
          SELECT COUNT(*) 
          FROM ${forumComments} 
          WHERE ${forumComments.forum_post_id} = ${forumPosts.id}
        )`.as('comment_count')
      })
      .from(forumPosts)
      .leftJoin(users, eq(forumPosts.user_id, users.id))
      .innerJoin(forums, eq(forumPosts.forum_id, forums.id))
      .where(eq(forumPosts.forum_id, forumId))
      .orderBy(desc(forumPosts.date_posted));
  },
  async updatePost(id: number, data: Partial<ForumPostInsert>): Promise<ForumPostRow | null> {
    const [row] = await db
      .update(forumPosts)
      .set(data)
      .where(eq(forumPosts.id, id))
      .returning();
    return row ?? null;
  },

  async deletePost(id: number): Promise<ForumPostRow | null> {
    const [row] = await db
      .delete(forumPosts)
      .where(eq(forumPosts.id, id))
      .returning();
    return row ?? null;
  },

  // Forum Comment CRUD operations
  async createComment(data: ForumCommentInsert): Promise<ForumCommentRow> {
    const [row] = await db.insert(forumComments).values(data).returning();
    return row;
  },

  async getCommentById(id: number): Promise<ForumCommentRow | null> {
    const [row] = await db
      .select()
      .from(forumComments)
      .where(eq(forumComments.id, id))
      .limit(1);
    return row ?? null;
  },

  async getCommentsByPostId(postId: number): Promise<ForumCommentRow[]> {
    return db
      .select()
      .from(forumComments)
      .where(eq(forumComments.forum_post_id, postId))
      .orderBy(desc(forumComments.date_created));
  },

  async getCommentsWithUserByPostId(postId: number) {
    return db
      .select({
        id: forumComments.id,
        content: forumComments.content,
        date_created: forumComments.date_created,
        upvotes: forumComments.upvotes,
        downvotes: forumComments.downvotes,
        forum_post_id: forumComments.forum_post_id,
        user_id: forumComments.user_id,
        username: users.username,
        user_profile_picture: users.profile_picture_url,
        user_role: users.role,
      })
      .from(forumComments)
      .leftJoin(users, eq(forumComments.user_id, users.id))
      .where(eq(forumComments.forum_post_id, postId))
      .orderBy(desc(forumComments.date_created));
  },

  async updateComment(id: number, data: Partial<ForumCommentInsert>): Promise<ForumCommentRow | null> {
    const [row] = await db
      .update(forumComments)
      .set(data)
      .where(eq(forumComments.id, id))
      .returning();
    return row ?? null;
  },

  async deleteComment(id: number): Promise<ForumCommentRow | null> {
    const [row] = await db
      .delete(forumComments)
      .where(eq(forumComments.id, id))
      .returning();
    return row ?? null;
  },

  // Voting operations
  async upvotePost(postId: number): Promise<ForumPostRow | null> {
    const [row] = await db
      .update(forumPosts)
      .set({ upvotes: sql`${forumPosts.upvotes} + 1` })
      .where(eq(forumPosts.id, postId))
      .returning();
    return row ?? null;
  },

  async downvotePost(postId: number): Promise<ForumPostRow | null> {
    const [row] = await db
      .update(forumPosts)
      .set({ downvotes: sql`${forumPosts.downvotes} + 1` })
      .where(eq(forumPosts.id, postId))
      .returning();
    return row ?? null;
  },

  async upvoteComment(commentId: number): Promise<ForumCommentRow | null> {
    const [row] = await db
      .update(forumComments)
      .set({ upvotes: sql`${forumComments.upvotes} + 1` })
      .where(eq(forumComments.id, commentId))
      .returning();
    return row ?? null;
  },

  async downvoteComment(commentId: number): Promise<ForumCommentRow | null> {
    const [row] = await db
      .update(forumComments)
      .set({ downvotes: sql`${forumComments.downvotes} + 1` })
      .where(eq(forumComments.id, commentId))
      .returning();
    return row ?? null;
  },
};
