import { NextRequest, NextResponse } from "next/server";
import { usersRepository } from "@/lib/db/repositories/userRepository";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const updatedUser = await usersRepository.downgrade(id);

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "User downgraded to user", user: updatedUser });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

