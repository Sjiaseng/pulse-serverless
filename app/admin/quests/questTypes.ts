export interface Quest {
  id: number;
  title: string;
  description: string;
  points: number;
  difficulty: string;
  status: string;
  availableDate: string;
  expirationDate: string;
  completions: number;
}

export interface EditQuest {
  id: number;
  title: string;
  description: string;
  points: number;
  difficulty: string;
  availableDate: string;
  expirationDate: string;
  achievement: {
    achievementId: number;
    achievementName: string;
  };
}

export interface Achievement {
  id: number;
  title?: string;
  name?: string;
  description: string;
  achievementQuest: number;
  image: string;
  count?: number;
}

export interface LeaderboardUser {
  rank: number;
  name: string;
  points: number;
  avatar: string;
}

export interface NewQuest {
  title: string;
  description: string;
  points: string;
  difficulty: string;
  availableDate: string;
  expirationDate: string;
}
