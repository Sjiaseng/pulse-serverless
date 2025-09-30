/* eslint-disable @typescript-eslint/no-explicit-any */
import { questRepository } from "@/lib/db/repositories/questRepository";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest, context: any) {
  try {
    const { id } = await context.params;
    const questId = Number(id);

    const body = await req.json();

    const updatedQuest = await questRepository.update(questId, {
      title: body.title,
      description: body.description,
      points_awarded: Number(body.points),
      difficulty_level: body.difficulty,
      available_date: body.availableDate ? new Date(body.availableDate) : null,
      expiration_date: body.expirationDate ? new Date(body.expirationDate) : null,
      last_updated_at: new Date(),
    });

    if (!updatedQuest) {
      return NextResponse.json(
        { error: "Quest not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedQuest);
  } catch (err: any) {
    console.error("Error updating quest:", err);
    return NextResponse.json(
      { error: "Failed to update quest" },
      { status: 500 }
    );
  }
}
