/* eslint-disable @typescript-eslint/no-explicit-any */
import { questRepository } from "@/lib/db/repositories/questRepository";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(req: NextRequest, context: any) {
  try {
    const { id } = await context.params;
    const questId = Number(id);

    if (isNaN(questId)) {
      return NextResponse.json({ error: "Invalid quest ID" }, { status: 400 });
    }

    const deletedQuest = await questRepository.remove(questId);

    if (!deletedQuest) {
      return NextResponse.json({ error: "Quest not found" }, { status: 404 });
    }

    return NextResponse.json(deletedQuest);
  } catch (err: any) {
    console.error("Error deleting quest:", err);
    return NextResponse.json(
      { error: "Failed to delete quest" },
      { status: 500 }
    );
  }
}
