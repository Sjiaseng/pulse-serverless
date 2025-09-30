import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

interface Achievement {
  id: string;
  title: string;
  description: string;
  badgeURL: string;
  category: "health" | "social" | "milestone" | "professional" | "system";
  rarity: "common" | "rare" | "epic" | "legendary";
  points: number;
  unlockedAt?: Date;
  progress?: number;
  maxProgress?: number;
  unlocked: boolean;
}

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("auth_token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const secret = new TextEncoder().encode(process.env.AUTH_SECRET);
    const { payload } = await jwtVerify(token, secret);

    if (!payload) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const userRole = payload.role;

    // Mock achievement data - replace with database queries
    let achievements: Achievement[] = [];

    if (userRole === "user") {
      achievements = [
        {
          id: "health_first_steps",
          title: "First Steps",
          description: "Completed your first health quest",
          badgeURL:
            "https://github.githubassets.com/assets/yolo-default-be0bbff04951.png",
          category: "health",
          rarity: "common",
          points: 50,
          unlocked: true,
          unlockedAt: new Date("2024-08-20"),
        },
        {
          id: "health_heart_hero",
          title: "Heart Hero",
          description: "Maintained a 7-day heart rate tracking streak",
          badgeURL:
            "https://github.githubassets.com/assets/pull-shark-default-498c279a747d.png",
          category: "health",
          rarity: "rare",
          points: 100,
          unlocked: true,
          unlockedAt: new Date("2024-08-25"),
        },
        {
          id: "health_step_master",
          title: "Step Master",
          description: "Walked 10,000 steps in a single day",
          badgeURL:
            "https://github.githubassets.com/assets/quickdraw-default--light-medium-5450fadcbe37.png",
          category: "health",
          rarity: "rare",
          points: 75,
          unlocked: true,
          unlockedAt: new Date("2024-08-22"),
        },
        {
          id: "health_wellness_warrior",
          title: "Wellness Warrior",
          description: "Maintained a 30-day activity streak",
          badgeURL:
            "https://github.githubassets.com/assets/starstruck-default--medium-2670f78c9f2f.png",
          category: "milestone",
          rarity: "epic",
          points: 250,
          unlocked: false,
          progress: 7,
          maxProgress: 30,
        },
        {
          id: "social_community_helper",
          title: "Community Helper",
          description: "Helped 10 other users in the forum",
          badgeURL:
            "https://github.githubassets.com/assets/yolo-default-be0bbff04951.png",
          category: "social",
          rarity: "rare",
          points: 150,
          unlocked: false,
          progress: 3,
          maxProgress: 10,
        },
        {
          id: "milestone_level_master",
          title: "Level Master",
          description: "Reached level 25 with your pet buddy",
          badgeURL:
            "https://github.githubassets.com/assets/pull-shark-default-498c279a747d.png",
          category: "milestone",
          rarity: "legendary",
          points: 500,
          unlocked: false,
          progress: 12,
          maxProgress: 25,
        },
      ];
    } else if (userRole === "practitioner") {
      achievements = [
        {
          id: "prof_verified_pro",
          title: "Verified Professional",
          description: "Successfully verified your medical credentials",
          badgeURL:
            "https://github.githubassets.com/assets/yolo-default-be0bbff04951.png",
          category: "professional",
          rarity: "rare",
          points: 200,
          unlocked: true,
          unlockedAt: new Date("2024-01-20"),
        },
        {
          id: "prof_patient_helper",
          title: "Patient Helper",
          description: "Successfully helped 50+ patients",
          badgeURL:
            "https://github.githubassets.com/assets/pull-shark-default-498c279a747d.png",
          category: "professional",
          rarity: "epic",
          points: 300,
          unlocked: true,
          unlockedAt: new Date("2024-07-15"),
        },
        {
          id: "prof_education_expert",
          title: "Education Expert",
          description: "Complete 40 hours of continuing education",
          badgeURL:
            "https://github.githubassets.com/assets/quickdraw-default--light-medium-5450fadcbe37.png",
          category: "professional",
          rarity: "epic",
          points: 400,
          unlocked: false,
          progress: 28,
          maxProgress: 40,
        },
        {
          id: "prof_top_rated",
          title: "Top Rated Practitioner",
          description: "Maintain a 4.8+ star rating with 100+ reviews",
          badgeURL:
            "https://github.githubassets.com/assets/starstruck-default--medium-2670f78c9f2f.png",
          category: "professional",
          rarity: "legendary",
          points: 600,
          unlocked: false,
          progress: 156,
          maxProgress: 100,
        },
      ];
    } else if (userRole === "admin") {
      achievements = [
        {
          id: "admin_system_master",
          title: "System Master",
          description: "Successfully manage the Pulse platform",
          badgeURL:
            "https://github.githubassets.com/assets/yolo-default-be0bbff04951.png",
          category: "system",
          rarity: "legendary",
          points: 1000,
          unlocked: true,
          unlockedAt: new Date("2024-01-01"),
        },
        {
          id: "admin_user_guardian",
          title: "User Guardian",
          description: "Successfully moderate and support 1000+ users",
          badgeURL:
            "https://github.githubassets.com/assets/pull-shark-default-498c279a747d.png",
          category: "system",
          rarity: "epic",
          points: 500,
          unlocked: true,
          unlockedAt: new Date("2024-06-10"),
        },
        {
          id: "admin_uptime_hero",
          title: "Uptime Hero",
          description: "Maintain 99.9%+ system uptime for 6 months",
          badgeURL:
            "https://github.githubassets.com/assets/quickdraw-default--light-medium-5450fadcbe37.png",
          category: "system",
          rarity: "legendary",
          points: 750,
          unlocked: false,
          progress: 4,
          maxProgress: 6,
        },
      ];
    }

    const summary = {
      totalAchievements: achievements.length,
      unlockedAchievements: achievements.filter((a) => a.unlocked).length,
      totalPoints: achievements
        .filter((a) => a.unlocked)
        .reduce((sum, a) => sum + a.points, 0),
      byRarity: {
        common: achievements.filter((a) => a.rarity === "common").length,
        rare: achievements.filter((a) => a.rarity === "rare").length,
        epic: achievements.filter((a) => a.rarity === "epic").length,
        legendary: achievements.filter((a) => a.rarity === "legendary").length,
      },
      byCategory: achievements.reduce(
        (acc, a) => {
          acc[a.category] = (acc[a.category] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>,
      ),
    };

    return NextResponse.json({
      achievements,
      summary,
    });
  } catch (err) {
    console.error("Error in /api/user/achievements:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

