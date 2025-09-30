import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/connection";
import { pets } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 },
      );
    }

    const [pet] = await db
      .select()
      .from(pets)
      .where(eq(pets.user_id, userId))
      .limit(1);

    if (!pet) {
      return NextResponse.json(
        { error: "Pet not found for this user" },
        { status: 404 },
      );
    }

    // Calculate pet condition based on happiness
    const getConditionFromHappiness = (happiness: number): string => {
      if (happiness >= 80) return "happy";
      if (happiness <= 30) return "sad";
      return "neutral";
    };

    const condition = getConditionFromHappiness(pet.pet_happiness);
    const petImageUrl = `https://pulse-app-files.s3.us-east-1.amazonaws.com/pets/${pet.pet_type.toLowerCase()}/${condition}.png`;

    return NextResponse.json({
      pet: {
        ...pet,
        pet_image_url: petImageUrl,
        condition: condition,
      },
    });
  } catch (error) {
    console.error("Get pet data error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
