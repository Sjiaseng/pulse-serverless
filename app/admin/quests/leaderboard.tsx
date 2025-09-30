"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trophy } from "lucide-react"
import type { LeaderboardUser } from "./questTypes"

interface LeaderboardTabProps {
  leaderboard: LeaderboardUser[]
}

export function LeaderboardTab({ leaderboard }: LeaderboardTabProps) {
  const [displayCount, setDisplayCount] = useState(5)

  const visibleUsers = leaderboard.slice(0, displayCount)
  const hasMore = displayCount < leaderboard.length

  const loadMore = () => {
    setDisplayCount((prev) => prev + 5)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-dela">Top Performers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {visibleUsers.map((user) => (
              <div key={user.rank} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-8 h-8 bg-[#F5BE66] text-white font-bold rounded-full">
                    {user.rank}
                  </div>
                  <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center font-bold">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={user.avatar} alt={`${user.name}'s avatar`} className="w-full h-full rounded-full" />
                  </div>
                  <span className="font-montserrat font-medium">{user.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-[#F5BE66]" />
                  <span className="font-bold">{user.points}</span>
                </div>
              </div>
            ))}

            {hasMore && (
              <div className="flex justify-center pt-4">
                <Button onClick={loadMore} variant="outline" className=" w-full rounded-xl font-montserrat bg-transparent">
                  Load More
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
