import { NextRequest, NextResponse } from "next/server";
import { forumRepository } from "@/lib/db/repositories/forumRepository";

// POST /api/posts/[id]/vote - Vote on a post
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: paramId } = await params;
    const id = parseInt(paramId);
    if (isNaN(id)) {
      return NextResponse.json(
        { error: "Invalid post ID" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { type } = body; // 'upvote' or 'downvote'

    if (!type || !['upvote', 'downvote'].includes(type)) {
      return NextResponse.json(
        { error: "Vote type must be 'upvote' or 'downvote'" },
        { status: 400 }
      );
    }

    let post;
    if (type === 'upvote') {
      post = await forumRepository.upvotePost(id);
    } else {
      post = await forumRepository.downvotePost(id);
    }

    if (!post) {
      return NextResponse.json(
        { error: "Post not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(post);
  } catch (error) {
    console.error("Error voting on post:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
