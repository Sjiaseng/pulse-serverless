import { questRepository } from "@/lib/db/repositories/questRepository";
import { NextRequest, NextResponse } from "next/server";


export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, description, points, availableDate, expirationDate, difficulty } = body;

    if (!title || !description || !points || !availableDate || !expirationDate || !difficulty) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const newQuest = await questRepository.create({
      title: title,
      description: description,
      points_awarded: Number(points),
      available_date: new Date(availableDate),
      last_updated_at: new Date(),
      expiration_date: new Date(expirationDate),
      difficulty_level: difficulty,
    });
    return NextResponse.json({ quest: newQuest });
  } catch (err) {
    console.error("Failed to create quest:", err);
    return NextResponse.json({ error: "Failed to create quest" }, { status: 500 });
  }
}
