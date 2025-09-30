import { usersRepository } from "@/lib/db/repositories/userRepository";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { userId, suspend } = await req.json();

    if (!userId || typeof suspend !== "boolean") {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    const updatedUser = await usersRepository.updateSuspensionStatus(userId, suspend);

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(updatedUser);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to update suspension" }, { status: 500 });
  }
}