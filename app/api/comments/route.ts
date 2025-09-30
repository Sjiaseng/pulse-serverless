import { NextRequest, NextResponse } from "next/server";
import { forumRepository } from "@/lib/db/repositories/forumRepository";

// GET /api/comments - Get comments by post ID
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const postId = searchParams.get('postId');

    if (!postId) {
      return NextResponse.json(
        { error: "postId parameter is required" },
        { status: 400 }
      );
    }

    const id = parseInt(postId);
    if (isNaN(id)) {
      return NextResponse.json(
        { error: "Invalid post ID" },
        { status: 400 }
      );
    }

    const comments = await forumRepository.getCommentsWithUserByPostId(id);
    return NextResponse.json(comments);
  } catch (error) {
    console.error("Error fetching comments:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// POST /api/comments - Create a new comment
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { content, forum_post_id, user_id } = body;

    if (!content || !forum_post_id || !user_id) {
      return NextResponse.json(
        { error: "Content, forum_post_id, and user_id are required" },
        { status: 400 }
      );
    }

    const comment = await forumRepository.createComment({
      content,
      forum_post_id: parseInt(forum_post_id),
      user_id,
      upvotes: 0,
      downvotes: 0,
    });

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error("Error creating comment:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
