import { NextResponse } from "next/server";
import { leaderboardRepository } from "@/lib/db/repositories/leaderboardRepository";

export async function GET() {
  try {
    const leaderboard = await leaderboardRepository.listLeaderboard();
    return NextResponse.json({ leaderboard });
  } catch (error) {
    console.error("Failed to fetch leaderboard:", error);
    return NextResponse.json({ error: "Failed to fetch leaderboard" }, { status: 500 });
  }
}
