
export enum Operator {
  ADD = '+',
  SUBTRACT = '-',
  MULTIPLY = '*',
  DIVIDE = '/',
  OTHER = '?'
}

export type ProblemType = 'arithmetic' | 'word' | 'time' | 'sequence' | 'geometry' | 'fraction' | 'logic' | 'measurement' | 'riddle';

export interface MathProblem {
  id: string;
  type: ProblemType;
  questionText: string; 
  num1?: number; 
  num2?: number; 
  operator?: Operator; 
  answer: number; 
  displayMode: 'standard' | 'text'; 
  difficultyLevel?: 'easy' | 'medium' | 'hard'; 
}

export interface HistoryItem {
  problem: MathProblem;
  userAnswer: number | null; 
  isCorrect: boolean;
  skipped: boolean;
  timestamp: number;
}

export interface UserStats {
  totalCorrect: number;
  streak: number;
  topicAccuracy: Record<ProblemType, { correct: number; total: number }>;
  currentLevel: number; 
}

export interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
  condition: (stats: UserStats) => boolean;
  unlocked: boolean;
  color: string;
}

export interface AppSettings {
  userName: string;
  creatorName: string;
  difficulty: 'easy' | 'medium' | 'hard';
  soundEnabled: boolean;
  musicEnabled?: boolean;
  topicDifficulty?: Partial<Record<ProblemType, 'easy' | 'medium' | 'hard'>>;
  selectedTopics?: ProblemType[];
  focusMode?: boolean;
}

export interface DailyStreak {
  currentStreak: number;
  longestStreak: number;
  lastPlayDate: string; // YYYY-MM-DD format
  streakBrokenDate?: string;
}

export interface TimeChallenge {
  id: string;
  targetCount: number; // e.g., 5 problems
  timeLimit: number; // seconds
  currentCount: number;
  startTime: number;
  isActive: boolean;
  completed: boolean;
  completedTime?: number; // milliseconds taken
  score: number; // problems solved correctly
}

export interface Reward {
  id: string;
  name: string;
  type: 'avatar' | 'theme' | 'title';
  icon: string;
  description: string;
  unlockedAt?: number;
  condition: (stats: UserStats, dailyStreak: DailyStreak) => boolean;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface LeaderboardEntry {
  playerName: string;
  totalCorrect: number;
  longestStreak: number;
  currentStreak: number;
  level: number;
  timestamp: number;
}

export interface Notification {
  id: string;
  type: 'achievement' | 'challenge' | 'reminder' | 'reward';
  title: string;
  message: string;
  icon: string;
  read: boolean;
  createdAt: number;
  action?: () => void;
}

export interface UserProfile {
  userId: string;
  dailyStreak: DailyStreak;
  selectedAvatar?: string;
  selectedTheme?: 'light' | 'dark' | 'custom';
  selectedTitle?: string;
  selectedReward?: string;
  unlockedRewards: string[];
}
