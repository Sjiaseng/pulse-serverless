/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Target, Trophy, Medal } from "lucide-react"
import { QuestsTab } from "./quest"
import { AchievementsTab } from "./achievement"
import { LeaderboardTab } from "./leaderboard"
import type { Quest, LeaderboardUser, Achievement } from "./questTypes"
import { useEffect, useState } from "react"

export default function QuestsPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [quests, setQuests] = useState<Quest[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);

  const fetchQuests = async () => {
    try {
      const res = await fetch("/api/admin/quest/fetch");
      const data = await res.json();
      setQuests(data.quest);
    } catch (error) {
      console.error("Failed to fetch quests:", error);
    }
  };

  useEffect(() => {
    fetchQuests();
    fetchAchievements();
  }, []);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await fetch("/api/admin/leaderboard");
        const data = await res.json();

        const sortedLeaderboard = (data.leaderboard ?? [])
          .map((user: any, index: number) => ({
            rank: index + 1,
            name: user.username || "Unknown",
            points: user.highestScore ?? 0,
            avatar: user.profile_picture_url || "",
          }));

        setLeaderboard(sortedLeaderboard);
      } catch (err) {
        console.error("Error fetching leaderboard:", err);
      } 
    };
    fetchLeaderboard();
  }, []);


    const fetchAchievements = async () => {
      try {
        const res = await fetch("/api/admin/achievement/fetch");
        if (!res.ok) throw new Error("Failed to fetch achievements");

        const data = await res.json();

        // Transform API data to match mock shape
        const mappedAchievements: Achievement[] = (data.achievements || []).map((a: any) => ({
          id: a.id,
          name: a.achievement_title,
          description: a.achievement_description,
          achievementQuest: a.quest_id,
          image: a.achievement_icon || "", // fallback
          count: a.completions || 0, // assuming your API returns completions
        }));

        setAchievements(mappedAchievements);

      } catch (err) {
        console.error(err);
      } 
    };



  return (
    <div className="p-6 max-w-7xl mx-auto pb-25 md:pb-0 mb-0 md:mb-12">
      <div className="flex items-center gap-4 mb-6">
        <div>
          <h1 className="font-montserrat font-bold text-3xl text-gray-900">Quest Management</h1>
        </div>
      </div>

      <Tabs defaultValue="quests" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger
            value="quests"
            className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-[0_3px_0_0_#000] transition-all"
          >
            <Target className="w-4 h-4" />
            Quests
          </TabsTrigger>
          <TabsTrigger
            value="achievements"
            className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-[0_3px_0_0_#000] transition-all"
          >
            <Trophy className="w-4 h-4" />
            Achievements
          </TabsTrigger>
          <TabsTrigger
            value="leaderboard"
            className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-[0_3px_0_0_#000] transition-all"
          >
            <Medal className="w-4 h-4" />
            Leaderboard
          </TabsTrigger>
        </TabsList>

        <TabsContent value="quests">
          <QuestsTab quests={quests} achievements={achievements} onRefresh={fetchQuests}/>
        </TabsContent>

        <TabsContent value="achievements">
          <AchievementsTab   achievements={achievements} onRefresh={fetchAchievements} setAchievements={setAchievements} />
        </TabsContent>

        <TabsContent value="leaderboard">
          <LeaderboardTab leaderboard={leaderboard} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
