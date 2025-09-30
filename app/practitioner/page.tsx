"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import toast from "react-hot-toast";
import Image from "next/image";

interface Pet {
  id: number;
  pet_name: string;
  pet_type: string;
  pet_level: number;
  pet_experience: number;
  pet_happiness: number;
  pet_status: string;
  pet_image_url: string;
  condition: string;
  created_at: string;
}

interface Quest {
  id: number;
  title: string;
  description: string;
  points_awarded: number;
  difficulty_level: string;
  available_date: string;
  last_updated_at: string;
  expiration_date: string | null;
  completed: boolean; // from database
  completed_at: string | null; // from database
}

// XP calculation utility functions
const getXPNeededForLevel = (level: number) => {
  return level * 100 + (level - 1) * 50; // 100, 250, 450, 700, etc.
};

const calculateXPProgress = (currentXP: number, currentLevel: number) => {
  let totalXPNeeded = 0;
  for (let i = 1; i < currentLevel; i++) {
    totalXPNeeded += getXPNeededForLevel(i);
  }

  const currentLevelXP = currentXP - totalXPNeeded;
  const xpNeededForNextLevel = getXPNeededForLevel(currentLevel);

  return {
    currentLevelXP,
    xpNeededForNextLevel,
    progressPercentage: (currentLevelXP / xpNeededForNextLevel) * 100,
  };
};

export default function UserDashboard() {
  const { user, loading: authLoading } = useAuth();
  const [pet, setPet] = useState<Pet | null>(null);
  const [quests, setQuests] = useState<Quest[]>([]);
  const [loading, setLoading] = useState(true);
  const [questsLoading, setQuestsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [questsError, setQuestsError] = useState<string | null>(null);
  const [completingQuests, setCompletingQuests] = useState<Set<number>>(
    new Set(),
  );

  // Fetch daily quests
  useEffect(() => {
    const fetchDailyQuests = async () => {
      if (!user?.id) return;

      try {
        setQuestsLoading(true);
        const response = await fetch(`/api/getDailyQuest?userId=${user.id}`);

        if (!response.ok) {
          throw new Error("Failed to fetch daily quests");
        }

        const data = await response.json();

        if (data.success) {
          // Use the completion status from database
          setQuests(data.quests);
        } else {
          throw new Error(data.error || "Failed to fetch quests");
        }
      } catch (err) {
        setQuestsError(
          err instanceof Error
            ? err.message
            : "An error occurred fetching quests",
        );
      } finally {
        setQuestsLoading(false);
      }
    };

    fetchDailyQuests();
  }, [user?.id]);

  // Quest completion handler
  const handleCompleteQuest = async (questId: number) => {
    if (!user?.id) return;

    setCompletingQuests((prev) => new Set([...prev, questId]));

    try {
      const response = await fetch("/api/user/completeQuest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questId: questId,
          userId: user.id,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Mark quest as completed in local state
        setQuests((prevQuests) =>
          prevQuests.map((quest) =>
            quest.id === questId ? { ...quest, completed: true } : quest,
          ),
        );

        // Update pet data with new XP/level
        if (pet) {
          setPet((prevPet) =>
            prevPet
              ? {
                  ...prevPet,
                  pet_experience: data.rewards.newTotalXP,
                  pet_level: data.rewards.newLevel,
                  pet_happiness: data.rewards.newHappiness,
                }
              : null,
          );
        }

        // Show success message with rewards
        const message = data.rewards.leveledUp
          ? `🎉 Quest completed! +${data.rewards.xpGained} XP! Level up to ${data.rewards.newLevel}!`
          : `✅ Quest completed! +${data.rewards.xpGained} XP gained!`;

        toast.success(message);
      } else {
        toast.error(data.error || "Failed to complete quest");
      }
    } catch (error) {
      console.error("Error completing quest:", error);
      toast.error("Failed to complete quest. Please try again.");
    } finally {
      setCompletingQuests((prev) => {
        const newSet = new Set(prev);
        newSet.delete(questId);
        return newSet;
      });
    }
  };

  useEffect(() => {
    if (!user || authLoading) return;

    const fetchPetData = async () => {
      try {
        const response = await fetch(`/api/getPetData?userId=${user.id}`);

        if (!response.ok) {
          throw new Error("Failed to fetch pet data");
        }

        const data = await response.json();
        setPet(data.pet);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchPetData();
  }, [user, authLoading]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your pet...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-red-600">
          <p>Error: {error}</p>
        </div>
      </div>
    );
  }

  if (!pet) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p>No pet found</p>
        </div>
      </div>
    );
  }

  // Calculate XP progress for current pet
  const xpProgress = calculateXPProgress(pet.pet_experience, pet.pet_level);

  return (
    <div className="h-screen bg-gradient-to-b from-sky-200 to-green-200 px-4 py-8 overflow-hidden">
      <div className="max-w-md mx-auto h-full">
        {/* Combined Pet and Quest Card */}
        <div className="bg-white rounded-3xl shadow-lg h-full flex flex-col">
          {/* Pet Display Section */}
          <div className="p-6 flex-shrink-0">
            <div className="text-center">
              <h1 className="text-2xl font-headline font-bold text-gray-800 mb-2">
                {pet.pet_name}
              </h1>
              <p className="text-gray-600 text-sm mb-4">
                Level {pet.pet_level} {pet.pet_type}
              </p>

              {/* Pet Image - Smaller */}
              <div className="relative mb-4">
                <Image
                  src={pet.pet_image_url}
                  alt={pet.pet_name}
                  width={128}
                  height={128}
                  className="mx-auto rounded-full border-4 border-gray-200"
                />
                <div className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-800 px-2 py-1 rounded-full text-xs font-semibold">
                  {pet.condition}
                </div>
              </div>

              {/* Combined Stats and Info */}
              <div className="space-y-4">
                {/* XP Bar */}
                <div>
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Experience</span>
                    <span>
                      {xpProgress.currentLevelXP}/
                      {xpProgress.xpNeededForNextLevel} XP
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.min(xpProgress.progressPercentage, 100)}%`,
                      }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 text-center">
                    {xpProgress.xpNeededForNextLevel -
                      xpProgress.currentLevelXP}{" "}
                    XP to Level {pet.pet_level + 1}
                  </p>
                </div>

                {/* Pet Info Grid */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-gray-50 rounded-lg p-2">
                    <p className="text-gray-600 text-xs">Happiness</p>
                    <p className="font-semibold text-gray-800">
                      {pet.pet_happiness}/100
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2">
                    <p className="text-gray-600 text-xs">Born</p>
                    <p className="font-semibold text-gray-800">
                      {new Date(pet.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Separator */}
          <div className="border-t border-gray-200 flex-shrink-0"></div>

          {/* Daily Quests Section - Scrollable */}
          <div className="p-4 flex-1 flex flex-col min-h-0">
            <h3 className="font-bold text-gray-800 mb-4 text-lg flex-shrink-0">
              Daily Quests
            </h3>

            {questsLoading ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Loading quests...</p>
                </div>
              </div>
            ) : questsError ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center text-red-600">
                  <p>Failed to load quests</p>
                  <p className="text-sm text-gray-500 mt-1">{questsError}</p>
                </div>
              </div>
            ) : quests.length === 0 ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <div className="text-4xl mb-4">🎯</div>
                  <p className="font-semibold mb-2">
                    No quests available today
                  </p>
                  <p className="text-sm">
                    Check back tomorrow for new challenges!
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                {quests.map((quest) => (
                  <div
                    key={quest.id}
                    className="border border-gray-200 rounded-xl p-4 flex-shrink-0"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800 mb-1">
                          {quest.title}
                        </h4>
                        <p className="text-sm text-gray-600 mb-4">
                          {quest.description}
                        </p>

                        {/* Reward and difficulty */}
                        <div className="flex justify-between items-center">
                          <div className="flex items-center space-x-2">
                            <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                              +{quest.points_awarded} pts
                            </span>
                            <span
                              className={`text-xs px-2 py-1 rounded-full ${
                                quest.difficulty_level === "easy"
                                  ? "bg-green-100 text-green-800"
                                  : quest.difficulty_level === "medium"
                                    ? "bg-orange-100 text-orange-800"
                                    : "bg-red-100 text-red-800"
                              }`}
                            >
                              {quest.difficulty_level}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Complete Quest button */}
                    <button
                      onClick={() => handleCompleteQuest(quest.id)}
                      className={`w-full py-2 px-4 rounded-lg font-semibold text-sm transition-colors ${
                        quest.completed
                          ? "bg-gray-100 text-gray-600 cursor-not-allowed"
                          : completingQuests.has(quest.id)
                            ? "bg-blue-400 text-white cursor-not-allowed"
                            : "bg-green-500 hover:bg-green-600 text-white"
                      }`}
                      disabled={
                        quest.completed || completingQuests.has(quest.id)
                      }
                    >
                      {quest.completed
                        ? "Completed"
                        : completingQuests.has(quest.id)
                          ? "Completing..."
                          : "Complete Quest"}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
