"use client"

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { User } from "lucide-react"
import { useState, useEffect, ReactNode } from "react"

interface UserData {
  user: {
    id: string
    username: string
    email: string
    profilePictureURL: string
  }
  leaderboard: {
    highest_level: number
    highest_score_cumulative: number
    highest_most_achievement: number
  }
  achievements: Array<{
    id: number
    title: string
    description: string
    icon: string
    completedAt: string
  }>
}

interface UserProfileDialogProps {
  userId?: string
  userEmail?: string
  children?: ReactNode
}

export default function UserProfileDialog({ userId, userEmail, children }: UserProfileDialogProps) {
  const [userData, setUserData] = useState<UserData | null>(null)
  const [profileLoading, setProfileLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!userId || !isOpen) return

      try {
        setProfileLoading(true)
        const response = await fetch(`/api/getProfileData?userId=${userId}`)
        const data = await response.json()
        console.log("Fetched profile data:", data)
        setUserData(data.success)
      } catch (error) {
        console.error("Error fetching profile data:", error)
      } finally {
        setProfileLoading(false)
      }
    }

    fetchProfileData()
  }, [userId, isOpen])

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {/* Trigger can be anything passed as children */}
      <DialogTrigger asChild>
        {children ? (
          children
        ) : (
          <Button variant="outline" size="sm">
            <User className="w-4 h-4 mr-2" />
            View Profile
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
            <DialogTitle>User Profile</DialogTitle>
        {profileLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="flex flex-col space-y-6 py-4">
            {/* Profile Header */}
            <div className="flex flex-col items-center justify-center space-y-4">
              <Avatar className="w-24 h-24 border-[2px] border-border">
                <AvatarImage
                  src={
                    userData?.user?.profilePictureURL ||
                    "https://avatars.githubusercontent.com/u/107231772?v=4" ||
                    "/placeholder.svg"
                  }
                />
                <AvatarFallback>
                  {userData?.user?.username?.charAt(0).toUpperCase() ||
                    userEmail?.charAt(0).toUpperCase() ||
                    "U"}
                </AvatarFallback>
              </Avatar>
              <div className="text-center">
                <p className="font-semibold text-lg">
                  {userData?.user?.username ||
                    userEmail?.split("@")[0] ||
                    "User"}
                </p>
                {userData?.user?.email && (
                  <p className="text-sm text-muted-foreground">
                    {userData.user.email}
                  </p>
                )}
              </div>
            </div>

            {/* Stats Section */}
            <div className="flex flex-col space-y-4">
              <div className="flex items-center gap-3">
                <Separator className="flex-1" />
                <h2 className="font-semibold text-center">Stats</h2>
                <Separator className="flex-1" />
              </div>
              <div className="flex gap-8 items-center justify-center text-center">
                <div className="flex flex-col space-y-1">
                  <h3 className="font-semibold text-sm">Level</h3>
                  <p className="text-2xl font-bold">
                    {userData?.leaderboard?.highest_level || 0}
                  </p>
                </div>
                <div className="flex flex-col space-y-1">
                  <h3 className="font-semibold text-sm">Points</h3>
                  <p className="text-2xl font-bold">
                    {userData?.leaderboard?.highest_score_cumulative?.toLocaleString() || 0}
                  </p>
                </div>
                <div className="flex flex-col space-y-1">
                  <h3 className="font-semibold text-sm">Achievements</h3>
                  <p className="text-2xl font-bold">
                    {userData?.achievements?.length || 0}
                  </p>
                </div>
              </div>
            </div>

            {/* Achievements Section */}
            <div className="flex flex-col space-y-4">
              <div className="flex items-center gap-3">
                <Separator className="flex-1" />
                <h2 className="font-semibold text-center">Achievements</h2>
                <Separator className="flex-1" />
              </div>

              <div className="grid grid-cols-3 gap-4 place-items-center">
                {userData?.achievements && userData.achievements.length > 0 ? (
                  userData.achievements.map((achievement) => (
                    <div
                      key={achievement.id}
                      className="flex flex-col items-center text-center space-y-2"
                    >
                      <Image
                        src={
                          achievement.icon ||
                          "https://github.githubassets.com/assets/yolo-default-be0bbff04951.png" ||
                          "/placeholder.svg"
                        }
                        alt={achievement.title}
                        width={60}
                        height={60}
                        className="rounded-full border border-border shadow-sm"
                      />
                      <p className="text-xs font-medium">{achievement.title}</p>
                    </div>
                  ))
                ) : (
                  <div className="col-span-3 text-center text-muted-foreground py-6">
                    <p>No achievements earned yet</p>
                    <p className="text-xs">Complete quests to earn achievements!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
