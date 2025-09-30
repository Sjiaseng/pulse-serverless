/* eslint-disable @typescript-eslint/no-explicit-any */
import { usersRepository } from "@/lib/db/repositories/userRepository";
import { NextResponse } from "next/server";


export async function GET(req: Request, context: any) {
  try {

    const { id } = await context.params; 

    const user = await usersRepository.getUserBasicById(id);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
