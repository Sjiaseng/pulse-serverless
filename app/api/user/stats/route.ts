import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

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

    const userId = payload.sub;
    const userRole = payload.role;

    // Mock dashboard stats - replace with database queries
    const baseStats = {
      userId,
      lastUpdated: new Date(),
    };

    if (userRole === 'user') {
      return NextResponse.json({
        ...baseStats,
        petData: {
          name: "Pulse Buddy",
          level: 12,
          experience: 750,
          maxExperience: 1000,
          mood: "happy",
          evolutionStage: 1
        },
        gameStats: {
          totalPoints: 2450,
          currentStreak: 7,
          longestStreak: 14,
          level: 12,
          rank: 42,
          totalUsers: 1000
        },
        healthMetrics: {
          stepsToday: 6420,
          stepsGoal: 8000,
          heartRateChecks: 2,
          heartRateGoal: 3,
          workoutsThisWeek: 3,
          workoutGoal: 5,
          averageHeartRate: 72,
          caloriesBurned: 245
        },
        achievements: {
          totalUnlocked: 4,
          totalAvailable: 12,
          recentlyUnlocked: ["First Steps", "Heart Hero"]
        }
      });
    }

    if (userRole === 'practitioner') {
      return NextResponse.json({
        ...baseStats,
        professionalStats: {
          totalPatients: 127,
          activePatients: 89,
          appointmentsToday: 8,
          appointmentsThisWeek: 32,
          averageRating: 4.8,
          totalReviews: 156,
          consultationsCompleted: 1240,
          specializations: ["Cardiology", "Internal Medicine", "Preventive Care"]
        },
        verification: {
          status: "verified",
          verifiedDate: new Date('2024-01-20'),
          certificationsCount: 3
        }
      });
    }

    if (userRole === 'admin') {
      return NextResponse.json({
        ...baseStats,
        systemStats: {
          totalUsers: 1247,
          activeUsers: 892,
          newUsersToday: 23,
          newUsersThisWeek: 156,
          totalPractitioners: 89,
          verifiedPractitioners: 72,
          systemUptime: 99.9,
          averageResponseTime: 245
        },
        contentStats: {
          totalQuests: 45,
          activeQuests: 38,
          totalAchievements: 24,
          forumPosts: 1890,
          totalReports: 12
        }
      });
    }

    return NextResponse.json(baseStats);

  } catch (err) {
    console.error("Error in /api/user/stats:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}