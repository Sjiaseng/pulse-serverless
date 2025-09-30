import { questRepository } from "@/lib/db/repositories/questRepository";
import { NextResponse } from "next/server";


export async function GET() {
  try {
    const quests = await questRepository.listQuestsAsSelection();
    return NextResponse.json({ quests });
  } catch (error) {
    console.error("Failed to fetch quests:", error);
    return NextResponse.json({ error: "Failed to fetch quests" }, { status: 500 });
  }
}


