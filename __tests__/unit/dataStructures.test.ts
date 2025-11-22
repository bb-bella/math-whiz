import { Operator, DailyStreak, TimeChallenge, Badge, UserStats } from '../../types';

describe('Data Structure Tests', () => {
  describe('DailyStreak', () => {
    it('should initialize with zero streaks', () => {
      const streak: DailyStreak = {
        currentStreak: 0,
        longestStreak: 0,
        lastPlayDate: '',
      };

      expect(streak.currentStreak).toBe(0);
      expect(streak.longestStreak).toBe(0);
      expect(streak.lastPlayDate).toBe('');
    });

    it('should track consecutive days', () => {
      const today = new Date().toISOString().split('T')[0];
      const streak: DailyStreak = {
        currentStreak: 5,
        longestStreak: 7,
        lastPlayDate: today,
      };

      expect(streak.currentStreak).toBe(5);
      expect(streak.longestStreak).toBe(7);
    });
  });

  describe('TimeChallenge', () => {
    it('should initialize a time challenge', () => {
      const challenge: TimeChallenge = {
        id: 'tc_123',
        targetCount: 5,
        timeLimit: 60,
        currentCount: 0,
        startTime: 0,
        isActive: false,
        completed: false,
        score: 0,
      };

      expect(challenge.id).toBe('tc_123');
      expect(challenge.targetCount).toBe(5);
      expect(challenge.timeLimit).toBe(60);
      expect(challenge.completed).toBe(false);
    });

    it('should track progress during challenge', () => {
      const challenge: TimeChallenge = {
        id: 'tc_123',
        targetCount: 5,
        timeLimit: 60,
        currentCount: 3,
        startTime: Date.now(),
        isActive: true,
        completed: false,
        score: 3,
      };

      expect(challenge.currentCount).toBe(3);
      expect(challenge.score).toBe(3);
      expect(challenge.isActive).toBe(true);
    });
  });

  describe('Reward', () => {
    it('should define unlock conditions', () => {
      const mockStats: UserStats = {
        totalCorrect: 10,
        streak: 5,
        topicAccuracy: {} as any,
        currentLevel: 2,
      };

      const mockStreak: DailyStreak = {
        currentStreak: 5,
        longestStreak: 10,
        lastPlayDate: new Date().toISOString().split('T')[0],
      };

      // Test condition function
      const unlockCondition = (stats: UserStats, streak: DailyStreak) => stats.totalCorrect >= 5;
      expect(unlockCondition(mockStats, mockStreak)).toBe(true);
    });
  });
});
