import { NextRequest, NextResponse } from "next/server";
import { forumRepository } from "@/lib/db/repositories/forumRepository";

// GET /api/user/forums/[id] - Get specific forum by ID (authenticated)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const userId = req.headers.get("x-user-id");

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const forumId = parseInt(id);
    if (isNaN(forumId)) {
      return NextResponse.json({ error: "Invalid forum ID" }, { status: 400 });
    }

    const forum = await forumRepository.getForumById(forumId);

    if (!forum) {
      return NextResponse.json({ error: "Forum not found" }, { status: 404 });
    }

    return NextResponse.json(forum);
  } catch (error) {
    console.error("Error fetching forum:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
