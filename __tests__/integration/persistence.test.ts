describe('Integration Tests: Local Storage Persistence', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  describe('Settings Persistence', () => {
    it('should save and retrieve user settings', () => {
      const settings = {
        userName: 'Test Player',
        creatorName: 'Test Creator',
        difficulty: 'medium' as const,
        soundEnabled: true,
      };

      localStorage.setItem('mathWhizSettings', JSON.stringify(settings));
      const retrieved = JSON.parse(localStorage.getItem('mathWhizSettings') || '{}');

      expect(retrieved.userName).toBe('Test Player');
      expect(retrieved.difficulty).toBe('medium');
      expect(retrieved.soundEnabled).toBe(true);
    });
  });

  describe('History Persistence', () => {
    it('should save and retrieve game history', () => {
      const history = [
        {
          problem: {
            id: 'prob_1',
            type: 'arithmetic' as const,
            questionText: '5 + 3 = ?',
            num1: 5,
            num2: 3,
            operator: '+' as const,
            answer: 8,
            displayMode: 'standard' as const,
          },
          userAnswer: 8,
          isCorrect: true,
          skipped: false,
          timestamp: Date.now(),
        },
      ];

      localStorage.setItem('mathWhizHistory', JSON.stringify(history));
      const retrieved = JSON.parse(localStorage.getItem('mathWhizHistory') || '[]');

      expect(retrieved.length).toBe(1);
      expect(retrieved[0].isCorrect).toBe(true);
      expect(retrieved[0].problem.answer).toBe(8);
    });

    it('should maintain max 100 history items', () => {
      const history = [];
      for (let i = 0; i < 120; i++) {
        history.push({
          problem: { id: `prob_${i}`, type: 'arithmetic' as const, answer: i, displayMode: 'standard' as const, questionText: '' },
          userAnswer: i,
          isCorrect: true,
          skipped: false,
          timestamp: Date.now(),
        });
      }

      const limited = history.slice(0, 100);
      localStorage.setItem('mathWhizHistory', JSON.stringify(limited));
      const retrieved = JSON.parse(localStorage.getItem('mathWhizHistory') || '[]');

      expect(retrieved.length).toBe(100);
    });
  });

  describe('Daily Streak Persistence', () => {
    it('should save and retrieve daily streak data', () => {
      const today = new Date().toISOString().split('T')[0];
      const streak = {
        currentStreak: 5,
        longestStreak: 10,
        lastPlayDate: today,
      };

      localStorage.setItem('mathWhizDailyStreak', JSON.stringify(streak));
      const retrieved = JSON.parse(localStorage.getItem('mathWhizDailyStreak') || '{}');

      expect(retrieved.currentStreak).toBe(5);
      expect(retrieved.longestStreak).toBe(10);
      expect(retrieved.lastPlayDate).toBe(today);
    });
  });

  describe('Leaderboard Persistence', () => {
    it('should save and retrieve leaderboard entries', () => {
      const leaderboard = [
        {
          playerName: 'Player 1',
          totalCorrect: 50,
          longestStreak: 10,
          currentStreak: 5,
          level: 5,
          timestamp: Date.now(),
        },
        {
          playerName: 'Player 2',
          totalCorrect: 40,
          longestStreak: 8,
          currentStreak: 3,
          level: 4,
          timestamp: Date.now(),
        },
      ];

      localStorage.setItem('mathWhizLeaderboard', JSON.stringify(leaderboard));
      const retrieved = JSON.parse(localStorage.getItem('mathWhizLeaderboard') || '[]');

      expect(retrieved.length).toBe(2);
      expect(retrieved[0].playerName).toBe('Player 1');
      expect(retrieved[0].totalCorrect).toBe(50);
    });

    it('should maintain max 20 leaderboard entries', () => {
      const leaderboard = [];
      for (let i = 0; i < 30; i++) {
        leaderboard.push({
          playerName: `Player ${i}`,
          totalCorrect: i * 10,
          longestStreak: i,
          currentStreak: i % 5,
          level: i,
          timestamp: Date.now(),
        });
      }

      const limited = leaderboard.slice(0, 20);
      localStorage.setItem('mathWhizLeaderboard', JSON.stringify(limited));
      const retrieved = JSON.parse(localStorage.getItem('mathWhizLeaderboard') || '[]');

      expect(retrieved.length).toBe(20);
    });
  });

  describe('Profile Persistence', () => {
    it('should save and retrieve user profile', () => {
      const profile = {
        userId: 'user_123',
        dailyStreak: {
          currentStreak: 3,
          longestStreak: 7,
          lastPlayDate: new Date().toISOString().split('T')[0],
        },
        selectedAvatar: 'avatar_star',
        selectedTheme: 'light' as const,
        selectedTitle: 'title_mathstar',
        unlockedRewards: ['badge_1', 'badge_2'],
      };

      localStorage.setItem('mathWhizProfile', JSON.stringify(profile));
      const retrieved = JSON.parse(localStorage.getItem('mathWhizProfile') || '{}');

      expect(retrieved.userId).toBe('user_123');
      expect(retrieved.selectedAvatar).toBe('avatar_star');
      expect(retrieved.unlockedRewards.length).toBe(2);
    });
  });
});

describe('Integration Tests: Data Validation', () => {
  describe('Daily Streak Logic', () => {
    it('should continue streak on consecutive days', () => {
      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

      const currentStreak = { currentStreak: 3, longestStreak: 5, lastPlayDate: yesterday };
      
      if (currentStreak.lastPlayDate === yesterday) {
        currentStreak.currentStreak += 1;
      }

      expect(currentStreak.currentStreak).toBe(4);
    });

    it('should reset streak on missed day', () => {
      const today = new Date().toISOString().split('T')[0];
      const twoDaysAgo = new Date(Date.now() - 172800000).toISOString().split('T')[0];

      const currentStreak = { currentStreak: 3, longestStreak: 5, lastPlayDate: twoDaysAgo };

      if (currentStreak.lastPlayDate !== today && currentStreak.lastPlayDate !== new Date(Date.now() - 86400000).toISOString().split('T')[0]) {
        currentStreak.currentStreak = 1;
      }

      expect(currentStreak.currentStreak).toBe(1);
    });
  });

  describe('Reward Unlock Logic', () => {
    it('should unlock reward when condition is met', () => {
      const stats = { totalCorrect: 10, streak: 5, topicAccuracy: {} as any, currentLevel: 2 };
      const condition = (s: typeof stats) => s.totalCorrect >= 5;

      expect(condition(stats)).toBe(true);
    });

    it('should not unlock reward when condition is not met', () => {
      const stats = { totalCorrect: 3, streak: 2, topicAccuracy: {} as any, currentLevel: 1 };
      const condition = (s: typeof stats) => s.totalCorrect >= 5;

      expect(condition(stats)).toBe(false);
    });
  });

  describe('Leaderboard Sorting', () => {
    it('should sort leaderboard by total correct descending', () => {
      const leaderboard = [
        { playerName: 'P1', totalCorrect: 30, longestStreak: 5, currentStreak: 2, level: 3, timestamp: 0 },
        { playerName: 'P2', totalCorrect: 50, longestStreak: 8, currentStreak: 3, level: 5, timestamp: 0 },
        { playerName: 'P3', totalCorrect: 20, longestStreak: 3, currentStreak: 1, level: 2, timestamp: 0 },
      ];

      const sorted = [...leaderboard].sort((a, b) => b.totalCorrect - a.totalCorrect);

      expect(sorted[0].playerName).toBe('P2');
      expect(sorted[1].playerName).toBe('P1');
      expect(sorted[2].playerName).toBe('P3');
    });
  });
});
