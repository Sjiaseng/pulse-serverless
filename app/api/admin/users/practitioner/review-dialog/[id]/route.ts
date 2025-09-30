/* eslint-disable @typescript-eslint/no-explicit-any */
import { practitionersRepository } from "@/lib/db/repositories/practitionerRepository";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, context: any) {
  try {
    // Await the dynamic params
    const { id } = await context.params;
    const practitionerId = Number(id);

    if (isNaN(practitionerId)) {
      return NextResponse.json(
        { error: "Invalid practitioner ID" },
        { status: 400 }
      );
    }

    const info = await practitionersRepository.getPractitionerInfoById(
      practitionerId
    );

    if (!info) {
      return NextResponse.json(
        { error: "Practitioner not found" },
        { status: 404 }
      );
    }

    const application = {
      id: info.practitioner.id,
      userId: info.user.id,
      username: info.user.username,
      email: info.user.email,
      gender: info.user.gender,
      joined_date: info.user.created_at,
      submission_date: info.practitioner.submitted_at,
      license_url: info.practitioner.license_url,
      status: info.practitioner.status,
      updated_at: info.user.updated_at,
      profile_url: info.user.profile_picture_url,
    };

    return NextResponse.json(application);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch practitioner info" },
      { status: 500 }
    );
  }
}
