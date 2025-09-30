import { NextRequest, NextResponse } from "next/server";
import { forumRepository } from "@/lib/db/repositories/forumRepository";

// GET /api/posts - Get all posts or posts by forum
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const forumId = searchParams.get('forumId');

    let posts;
    if (forumId) {
      const id = parseInt(forumId);
      if (isNaN(id)) {
        return NextResponse.json(
          { error: "Invalid forum ID" },
          { status: 400 }
        );
      }
      posts = await forumRepository.getPostsWithUserAndForumByForumId(id);
    } else {
      posts = await forumRepository.getPostsWithUserAndForum();
    }

    return NextResponse.json(posts);
  } catch (error) {
    console.error("Error fetching posts:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// POST /api/posts - Create a new post
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, description, forum_id, user_id } = body;

    if (!title || !description || !forum_id || !user_id) {
      return NextResponse.json(
        { error: "Title, description, forum_id, and user_id are required" },
        { status: 400 }
      );
    }

    const post = await forumRepository.createPost({
      title,
      description,
      forum_id: parseInt(forum_id),
      user_id,
      upvotes: 0,
      downvotes: 0,
    });

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    console.error("Error creating post:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
