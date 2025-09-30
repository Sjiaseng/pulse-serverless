import { NextRequest, NextResponse } from "next/server";
import { forumRepository } from "@/lib/db/repositories/forumRepository";

// GET /api/practitioner/forums/[id] - Get specific forum (authenticated practitioner)
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = req.headers.get("x-user-id");
    const userRole = req.headers.get("x-user-role");
    
    if (!userId || userRole !== "practitioner") {
      return NextResponse.json(
        { error: "Unauthorized - Practitioner access required" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const forumId = parseInt(id);
    if (isNaN(forumId)) {
      return NextResponse.json(
        { error: "Invalid forum ID" },
        { status: 400 }
      );
    }

    const forum = await forumRepository.getForumById(forumId);
    
    if (!forum) {
      return NextResponse.json(
        { error: "Forum not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(forum);
  } catch (error) {
    console.error("Error fetching forum:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}