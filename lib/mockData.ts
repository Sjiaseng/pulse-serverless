export interface Forum {
  id: string;
  name: string;
  description: string;
  color: string;
  memberCount: number;
}

export interface User {
  id: string;
  username: string;
  avatar?: string;
  karma: number;
}

export interface ForumPost {
  id: string;
  title: string;
  description: string;
  datePost: string;
  upvotes: number;
  downvotes: number;
  forumId: string;
  userId: string;
  commentCount: number;
}

export interface ForumComment {
  id: string;
  title: string;
  description: string;
  datePost: string;
  upvotes: number;
  downvotes: number;
  forumPostId: string;
  userId: string;
  parentId?: string; // For nested comments
}

export const mockForums: Forum[] = [
  {
    id: 'meditation',
    name: 'Meditation',
    description: 'Mindfulness, meditation techniques, and mental wellness',
    color: 'bg-purple-500',
    memberCount: 15420
  },
  {
    id: 'heart-disease',
    name: 'Heart Disease',
    description: 'Heart health, cardiovascular wellness, and medical discussions',
    color: 'bg-red-500',
    memberCount: 8930
  },
  {
    id: 'lifestyle',
    name: 'Lifestyle',
    description: 'Healthy living, fitness, nutrition, and wellness tips',
    color: 'bg-green-500',
    memberCount: 22150
  }
];

export const mockUsers: User[] = [
  { id: '1', username: 'MindfulMeditator', karma: 1250 },
  { id: '2', username: 'HeartHealthGuru', karma: 890 },
  { id: '3', username: 'WellnessWarrior', karma: 2100 },
  { id: '4', username: 'ZenMaster42', karma: 750 },
  { id: '5', username: 'CardioExpert', karma: 1680 },
  { id: '6', username: 'LifestyleLover', karma: 920 },
  { id: '7', username: 'MeditationNewbie', karma: 150 },
  { id: '8', username: 'FitnessFirst', karma: 1340 },
  { id: '9', username: 'HealthyHeart', karma: 560 },
  { id: '10', username: 'MindBodySoul', karma: 1890 }
];

export const mockPosts: ForumPost[] = [
  {
    id: '1',
    title: 'Daily Meditation Practice: 30 Days Challenge Results',
    description: 'I just completed a 30-day meditation challenge and wanted to share my experience. Started with just 5 minutes daily and gradually increased to 20 minutes. The mental clarity and reduced anxiety have been incredible. Has anyone else tried a similar challenge?',
    datePost: '2024-08-17T10:30:00Z',
    upvotes: 156,
    downvotes: 8,
    forumId: 'meditation',
    userId: '1',
    commentCount: 23
  },
  {
    id: '2',
    title: 'Understanding Cholesterol Levels: What Your Numbers Mean',
    description: 'After my recent blood work, my doctor explained cholesterol levels in detail. I thought I\'d share what I learned about HDL, LDL, and total cholesterol. This information might help others understand their heart health better.',
    datePost: '2024-08-17T08:15:00Z',
    upvotes: 89,
    downvotes: 3,
    forumId: 'heart-disease',
    userId: '2',
    commentCount: 15
  },
  {
    id: '3',
    title: 'Meal Prep Sunday: Heart-Healthy Recipes for the Week',
    description: 'Sharing my weekly meal prep routine focused on heart-healthy ingredients. Includes recipes for quinoa bowls, grilled salmon, and vegetable stir-fries. All recipes are under 30 minutes prep time!',
    datePost: '2024-08-16T16:45:00Z',
    upvotes: 234,
    downvotes: 12,
    forumId: 'lifestyle',
    userId: '3',
    commentCount: 41
  },
  {
    id: '4',
    title: 'Breathing Techniques for Anxiety Relief',
    description: 'Discovered the 4-7-8 breathing technique last month and it\'s been a game-changer for managing anxiety. Inhale for 4, hold for 7, exhale for 8. Simple but incredibly effective. What breathing techniques work for you?',
    datePost: '2024-08-16T14:20:00Z',
    upvotes: 178,
    downvotes: 5,
    forumId: 'meditation',
    userId: '4',
    commentCount: 32
  },
  {
    id: '5',
    title: 'Post-Heart Attack Recovery: 6 Months Update',
    description: 'It\'s been 6 months since my heart attack, and I wanted to share my recovery journey. From cardiac rehab to lifestyle changes, here\'s what helped me get back on track. Hope this helps others in similar situations.',
    datePost: '2024-08-16T11:30:00Z',
    upvotes: 312,
    downvotes: 7,
    forumId: 'heart-disease',
    userId: '5',
    commentCount: 67
  },
  {
    id: '6',
    title: 'Morning Routine That Changed My Life',
    description: 'After years of chaotic mornings, I finally found a routine that works: 5 AM wake-up, 10 minutes meditation, 20 minutes exercise, healthy breakfast, and planning the day. Consistency is key!',
    datePost: '2024-08-15T19:10:00Z',
    upvotes: 145,
    downvotes: 18,
    forumId: 'lifestyle',
    userId: '6',
    commentCount: 28
  },
  {
    id: '7',
    title: 'Beginner\'s Guide to Mindfulness Meditation',
    description: 'New to meditation? Start here! This guide covers the basics: finding a quiet space, comfortable posture, focusing on breath, and dealing with wandering thoughts. Remember, there\'s no "perfect" meditation.',
    datePost: '2024-08-15T13:25:00Z',
    upvotes: 267,
    downvotes: 9,
    forumId: 'meditation',
    userId: '7',
    commentCount: 45
  },
  {
    id: '8',
    title: 'Exercise After Stent Placement: What\'s Safe?',
    description: 'Had a stent placed 3 months ago and cleared for exercise by my cardiologist. Starting slow with walking and light weights. Looking for others\' experiences with post-stent exercise routines.',
    datePost: '2024-08-15T09:40:00Z',
    upvotes: 76,
    downvotes: 2,
    forumId: 'heart-disease',
    userId: '8',
    commentCount: 19
  },
  {
    id: '9',
    title: 'Hydration Hacks: Making Water More Interesting',
    description: 'Struggling to drink enough water? Try these: cucumber mint water, lemon ginger infusion, or frozen fruit ice cubes. Small changes that make staying hydrated enjoyable!',
    datePost: '2024-08-14T20:15:00Z',
    upvotes: 198,
    downvotes: 14,
    forumId: 'lifestyle',
    userId: '9',
    commentCount: 36
  },
  {
    id: '10',
    title: 'Walking Meditation: Combining Movement and Mindfulness',
    description: 'For those who find sitting meditation challenging, try walking meditation. Focus on each step, the sensation of feet touching ground, and breathing rhythm. Perfect for busy schedules!',
    datePost: '2024-08-14T15:50:00Z',
    upvotes: 134,
    downvotes: 6,
    forumId: 'meditation',
    userId: '10',
    commentCount: 22
  }
];

export const mockComments: ForumComment[] = [
  {
    id: '1',
    title: 'Great progress!',
    description: 'Congratulations on completing the challenge! I\'m on day 15 of my own 30-day journey. The consistency is definitely the hardest part.',
    datePost: '2024-08-17T11:15:00Z',
    upvotes: 12,
    downvotes: 0,
    forumPostId: '1',
    userId: '4'
  },
  {
    id: '2',
    title: 'Question about timing',
    description: 'Do you meditate at the same time every day? I\'m struggling to find a consistent time that works with my schedule.',
    datePost: '2024-08-17T12:30:00Z',
    upvotes: 8,
    downvotes: 1,
    forumPostId: '1',
    userId: '7'
  },
  {
    id: '3',
    title: 'Thanks for sharing!',
    description: 'This explanation is so much clearer than what I got from my doctor. The visual breakdown really helps understand the different types.',
    datePost: '2024-08-17T09:45:00Z',
    upvotes: 15,
    downvotes: 0,
    forumPostId: '2',
    userId: '9'
  }
];
