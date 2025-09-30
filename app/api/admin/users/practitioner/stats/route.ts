import { practitionersRepository } from "@/lib/db/repositories/practitionerRepository";
import { NextResponse } from "next/server";


export async function GET() {
  try {
    const stats = await practitionersRepository.getPractitionerStats();
    return NextResponse.json(stats, { status: 200 });
  } catch (error) {
    console.error("Error fetching practitioner stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch practitioner stats" },
      { status: 500 }
    );
  }
}
