import { NextRequest, NextResponse } from "next/server";
import { forumRepository } from "@/lib/db/repositories/forumRepository";

// GET /api/practitioner/posts - Get all posts or posts by forum (authenticated practitioner)
export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    const userRole = req.headers.get("x-user-role");
    
    if (!userId || userRole !== "practitioner") {
      return NextResponse.json(
        { error: "Unauthorized - Practitioner access required" },
        { status: 401 }
      );
    }

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

// POST /api/practitioner/posts - Create a new post (authenticated practitioner)
export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    const userRole = req.headers.get("x-user-role");
    
    if (!userId || userRole !== "practitioner") {
      return NextResponse.json(
        { error: "Unauthorized - Practitioner access required" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { title, description, forum_id } = body;

    if (!title || !description || !forum_id) {
      return NextResponse.json(
        { error: "Title, description, and forum_id are required" },
        { status: 400 }
      );
    }

    const post = await forumRepository.createPost({
      title,
      description,
      forum_id: parseInt(forum_id),
      user_id: userId, // Use authenticated practitioner ID from middleware
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