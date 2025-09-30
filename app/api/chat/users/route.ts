import { NextResponse } from "next/server";
import { usersRepository } from "@/lib/db/repositories/userRepository";

export async function GET() {
  const users = await usersRepository.listUser();
  return NextResponse.json(users);
}