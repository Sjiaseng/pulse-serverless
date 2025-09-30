
import { NextResponse } from "next/server";
import { achievementRepository } from "@/lib/db/repositories/achievementRepository";

export async function GET() {
  try {
    const achievements = await achievementRepository.listWithQuestAndCompletions();

    return NextResponse.json({ achievements });
  } catch (err) {
    console.error("Failed to fetch achievements:", err);
    return NextResponse.json(
      { error: "Failed to fetch achievements" },
      { status: 500 }
    );
  }
}
