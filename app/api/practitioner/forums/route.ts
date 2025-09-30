import { NextRequest, NextResponse } from "next/server";
import { forumRepository } from "@/lib/db/repositories/forumRepository";

// GET /api/practitioner/forums - Get all forums (authenticated practitioner)
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

// POST /api/practitioner/forums - Create a new forum (authenticated practitioner)
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
    const { topic, description } = body;

    if (!topic) {
      return NextResponse.json(
        { error: "Topic is required" },
        { status: 400 }
      );
    }

    const forum = await forumRepository.createForum({
      topic,
      description: description || null,
      user_id: userId,
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