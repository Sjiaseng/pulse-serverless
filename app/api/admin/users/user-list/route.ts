import { usersRepository } from "@/lib/db/repositories/userRepository";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const stats = await usersRepository.list();
    return NextResponse.json(stats);
  } catch (err) {
    console.error("Error fetching user stats:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}