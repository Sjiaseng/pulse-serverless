import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/connection";
import { eq, and } from "drizzle-orm";
import { questCompletions, pets, quests, leaderboards } from "@/lib/db/schema";

// XP calculation utility functions
const getXPNeededForLevel = (level: number) => {
  return level * 100 + (level - 1) * 50; // 100, 250, 450, 700, etc.
};

const calculateNewLevel = (totalXP: number) => {
  let level = 1;
  let xpUsed = 0;

  while (true) {
    const xpNeededForNextLevel = getXPNeededForLevel(level);
    if (xpUsed + xpNeededForNextLevel <= totalXP) {
      xpUsed += xpNeededForNextLevel;
      level++;
    } else {
      break;
    }
  }

  return level;
};

export async function POST(request: NextRequest) {
  try {
    const { questId, userId } = await request.json();

    if (!questId || !userId) {
      return NextResponse.json(
        { error: "Quest ID and User ID are required" },
        { status: 400 },
      );
    }

    // Check if user already completed this quest
    const existingCompletion = await db
      .select()
      .from(questCompletions)
      .where(
        and(
          eq(questCompletions.quest_id, questId),
          eq(questCompletions.user_id, userId),
        ),
      )
      .limit(1);

    if (existingCompletion.length > 0) {
      return NextResponse.json(
        { error: "Quest already completed" },
        { status: 400 },
      );
    }

    // Get quest details for XP reward
    const [quest] = await db
      .select()
      .from(quests)
      .where(eq(quests.id, questId))
      .limit(1);

    if (!quest) {
      return NextResponse.json({ error: "Quest not found" }, { status: 404 });
    }

    // Get user's pet
    const [pet] = await db
      .select()
      .from(pets)
      .where(eq(pets.user_id, userId))
      .limit(1);

    if (!pet) {
      return NextResponse.json({ error: "Pet not found" }, { status: 404 });
    }

    // Get user's leaderboard entry
    const [leaderboard] = await db
      .select()
      .from(leaderboards)
      .where(eq(leaderboards.user_id, userId))
      .limit(1);

    if (!leaderboard) {
      return NextResponse.json(
        { error: "Leaderboard entry not found" },
        { status: 404 },
      );
    }

    // Calculate new XP and level
    const newTotalXP = pet.pet_experience + quest.points_awarded!;
    const newLevel = calculateNewLevel(newTotalXP);
    const leveledUp = newLevel > pet.pet_level;

    // Update pet XP and level, and add some happiness
    const newHappiness = Math.min(pet.pet_happiness + 10, 100); // Cap at 100

    // Calculate new leaderboard stats
    const newCumulativeScore =
      leaderboard.highest_score_cumulative! + quest.points_awarded!;
    const newHighestLevel = Math.max(leaderboard.highest_level!, newLevel);

    await db.transaction(async (tx) => {
      // Record quest completion
      await tx.insert(questCompletions).values({
        quest_id: questId,
        user_id: userId,
        completion_status: "completed",
        completed_at: new Date(),
      });

      // Update pet with new XP, level, and happiness
      await tx
        .update(pets)
        .set({
          pet_experience: newTotalXP,
          pet_level: newLevel,
          pet_happiness: newHappiness,
        })
        .where(eq(pets.user_id, userId));

      // Update leaderboard stats
      await tx
        .update(leaderboards)
        .set({
          highest_score_cumulative: newCumulativeScore,
          highest_level: newHighestLevel,
        })
        .where(eq(leaderboards.user_id, userId));
    });

    return NextResponse.json({
      success: true,
      message: "Quest completed successfully!",
      rewards: {
        xpGained: quest.points_awarded,
        newTotalXP: newTotalXP,
        newLevel: newLevel,
        leveledUp: leveledUp,
        happinessGained: 10,
        newHappiness: newHappiness,
        newCumulativeScore: newCumulativeScore,
        scoreGained: quest.points_awarded,
      },
      quest: {
        id: quest.id,
        title: quest.title,
        points_awarded: quest.points_awarded,
      },
    });
  } catch (error) {
    console.error("Quest completion error:", error);
    return NextResponse.json(
      { error: "Failed to complete quest" },
      { status: 500 },
    );
  }
}

