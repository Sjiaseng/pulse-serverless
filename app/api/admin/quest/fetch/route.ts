import { questRepository } from "@/lib/db/repositories/questRepository";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const questsFromDb = await questRepository.listQuestsWithCompletions();

    const sortedQuests = questsFromDb.sort((a, b) => {
      const dateA = a.expiration_date ? new Date(a.expiration_date).getTime() : 0;
      const dateB = b.expiration_date ? new Date(b.expiration_date).getTime() : 0;
      return dateB - dateA; // descending
    });


    const quest = sortedQuests.map((q) => {
      const now = new Date();

      let status: "active" | "upcoming" | "expired" = "active";

      if (q.expiration_date && now > q.expiration_date) {
        status = "expired";
      } else if (q.available_date && now < q.available_date) {
        status = "upcoming";
      }

      return {
        id: q.id,
        title: q.quest_title,
        description: q.quest_description,
        points: q.points,
        difficulty: q.difficulty,
        status,
        availableDate: q.available_date?.toISOString() ?? "",
        expirationDate: q.expiration_date?.toISOString() ?? "",
        completions: q.completions ?? 0,
      };
    });

    return NextResponse.json({ quest });
  } catch (error) {
    console.error("Failed to fetch quest:", error);
    return NextResponse.json({ error: "Failed to fetch quest" }, { status: 500 });
  }
}
