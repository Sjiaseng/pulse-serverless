import { practitionersRepository } from "@/lib/db/repositories/practitionerRepository";
import { NextResponse } from "next/server";

export interface PractitionerInfo {
  id: number;
  license_url: string | null;
  submitted_at: string;
  status: string | null;
  user_id: string;
}

export interface UserInfo {
  id: string;
  username: string;
  email: string;
  profile_picture_url: string | null;
  gender: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface PractitionerWithUser {
  practitioner: PractitionerInfo;
  user: UserInfo;
}

export async function GET() {
  try {
    const rawData = await practitionersRepository.listPractitionerInfo();

    const data: PractitionerWithUser[] = rawData.map((row) => ({
      practitioner: {
        id: row.practitioner.id,
        license_url: row.practitioner.license_url ?? null, 
        submitted_at: row.practitioner.submitted_at
          ? row.practitioner.submitted_at.toISOString()
          : new Date().toISOString(),
        status: row.practitioner.status,
        user_id: row.practitioner.user_id,
      },
      user: {
        id: row.user.id,
        username: row.user.username,
        email: row.user.email,
        profile_picture_url: row.user.profile_picture_url ?? null,
        gender: row.user.gender ?? null, 
        created_at: row.user.created_at
          ? row.user.created_at.toISOString()
          : null,
        updated_at: row.user.updated_at
          ? row.user.updated_at.toISOString()
          : null,
      },
    }));

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Error fetching practitioners with users:", error);
    return NextResponse.json(
      { error: "Failed to fetch practitioners with users" },
      { status: 500 }
    );
  }
}
