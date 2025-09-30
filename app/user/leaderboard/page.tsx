"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

interface LeaderboardPlayer {
  userId: string;
  username: string;
  points: number;
  rank: number;
}

interface UserPosition {
  rank: number;
  percentile: number;
}

export default function UserLeaderboardPage() {
  const { user } = useAuth();
  const [leaderboardState, setLeaderboardState] = useState<
    "Weekly" | "All Time"
  >("All Time");
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardPlayer[]>(
    [],
  );
  const [userPosition, setUserPosition] = useState<UserPosition | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);
        const type = leaderboardState === "All Time" ? "allTime" : "weekly";
        const response = await fetch(
          `/api/getLeaderboard?userId=${user.id}&type=${type}`,
        );
        const data = await response.json();

        if (data.success) {
          setLeaderboardData(data.success.leaderboard);
          setUserPosition(data.success.userPosition);
        }
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [user?.id, leaderboardState]);

  return (
    <div className="bg-primary flex flex-col min-h-screen max-w-md mx-auto py-10 px-6 space-y-5">
      <h1 className="text-center font-headline text-xl">Leaderboard</h1>

      {/* Toggle Button */}
      <div className="bg-white rounded-full p-1 w-full mx-auto flex">
        {["Weekly", "All Time"].map((option) => (
          <button
            key={option}
            onClick={() => setLeaderboardState(option as "Weekly" | "All Time")}
            className={`flex-1 px-4 py-2 text-sm rounded-full transition-all duration-200 font-main font-semibold hover:cursor-pointer
              ${
                leaderboardState === option
                  ? "bg-primary text-black shadow"
                  : "text-gray-600"
              }`}
          >
            {option}
          </button>
        ))}
      </div>

      {/* User Position Banner */}
      {userPosition && (
        <div className="flex gap-6 text-white rounded-xl p-6 bg-[#AD66F5]">
          <div className="text-lg font-headline p-3 rounded-2xl bg-[#851AF0]">
            #{userPosition.rank}
          </div>
          <p className="font-main font-semibold">
            You are doing better than {userPosition.percentile}% of other
            players!
          </p>
        </div>
      )}

      {/* Leaderboard Section */}
      <div className="flex flex-col gap-3">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
            <p className="text-white mt-4">Loading leaderboard...</p>
          </div>
        ) : leaderboardData.length > 0 ? (
          leaderboardData.map((player, index) => (
            <div
              key={player.userId}
              className={`flex items-center justify-between p-3 py-5 rounded-xl shadow-sm ${
                player.userId === user?.id
                  ? "bg-yellow-100 border-2 border-yellow-400"
                  : "bg-white"
              }`}
            >
              {/* Rank with colors */}
              <span
                className={`w-6 text-center font-bold ${
                  index === 0
                    ? "text-yellow-500"
                    : index === 1
                      ? "text-gray-400"
                      : index === 2
                        ? "text-orange-500"
                        : "text-gray-700"
                }`}
              >
                #{player.rank}
              </span>

              {/* Name */}
              <span className="flex-1 ml-3 font-main text-sm font-semibold truncate">
                {player.username}
                {player.userId === user?.id && (
                  <span className="ml-2 text-xs text-blue-600 font-normal">
                    (You)
                  </span>
                )}
              </span>

              {/* Score */}
              <span className="font-bold text-sm text-gray-800">
                {player.points?.toLocaleString() || 0}
              </span>
            </div>
          ))
        ) : (
          <div className="text-center text-white py-8">
            <p>No leaderboard data available</p>
          </div>
        )}
      </div>
    </div>
  );
}
