import { NextRequest, NextResponse } from "next/server";
import { forumRepository } from "@/lib/db/repositories/forumRepository";

// POST /api/comments/[id]/vote - Vote on a comment
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: paramId } = await params;
    const id = parseInt(paramId);
    if (isNaN(id)) {
      return NextResponse.json(
        { error: "Invalid comment ID" },
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

    let comment;
    if (type === 'upvote') {
      comment = await forumRepository.upvoteComment(id);
    } else {
      comment = await forumRepository.downvoteComment(id);
    }

    if (!comment) {
      return NextResponse.json(
        { error: "Comment not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(comment);
  } catch (error) {
    console.error("Error voting on comment:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
