import { NextRequest, NextResponse } from "next/server";
import { forumRepository } from "@/lib/db/repositories/forumRepository";

// GET /api/forums - Get all forums
export async function GET() {
  try {
    const forums = await forumRepository.getAllForums();
    return NextResponse.json(forums);
  } catch (error) {
    console.error("Error fetching forums:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// POST /api/forums - Create a new forum
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { topic, description, user_id } = body;

    if (!topic || !user_id) {
      return NextResponse.json(
        { error: "Topic and user_id are required" },
        { status: 400 }
      );
    }

    const forum = await forumRepository.createForum({
      topic,
      description,
      user_id,
      popular_rank: 0,
    });

    return NextResponse.json(forum, { status: 201 });
  } catch (error) {
    console.error("Error creating forum:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
