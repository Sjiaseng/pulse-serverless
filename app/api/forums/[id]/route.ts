import { NextRequest, NextResponse } from "next/server";
import { forumRepository } from "@/lib/db/repositories/forumRepository";

// GET /api/forums/[id] - Get a specific forum
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idString } = await params;
    const id = parseInt(idString);
    if (isNaN(id)) {
      return NextResponse.json(
        { error: "Invalid forum ID" },
        { status: 400 }
      );
    }

    const forum = await forumRepository.getForumById(id);
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

// PUT /api/forums/[id] - Update a forum
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idString } = await params;
    const id = parseInt(idString);
    if (isNaN(id)) {
      return NextResponse.json(
        { error: "Invalid forum ID" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const forum = await forumRepository.updateForum(id, body);
    
    if (!forum) {
      return NextResponse.json(
        { error: "Forum not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(forum);
  } catch (error) {
    console.error("Error updating forum:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// DELETE /api/forums/[id] - Delete a forum
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idString } = await params;
    const id = parseInt(idString);
    if (isNaN(id)) {
      return NextResponse.json(
        { error: "Invalid forum ID" },
        { status: 400 }
      );
    }

    const forum = await forumRepository.deleteForum(id);
    
    if (!forum) {
      return NextResponse.json(
        { error: "Forum not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Forum deleted successfully" });
  } catch (error) {
    console.error("Error deleting forum:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
