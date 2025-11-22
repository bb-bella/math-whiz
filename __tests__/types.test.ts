import { Operator, MathProblem, ProblemType, UserStats } from '../types';

describe('Types', () => {
  describe('Operator enum', () => {
    it('should have all required operators', () => {
      expect(Operator.ADD).toBe('+');
      expect(Operator.SUBTRACT).toBe('-');
      expect(Operator.MULTIPLY).toBe('*');
      expect(Operator.DIVIDE).toBe('/');
      expect(Operator.OTHER).toBe('?');
    });
  });

  describe('MathProblem interface', () => {
    it('should create a valid arithmetic problem', () => {
      const problem: MathProblem = {
        id: 'prob_1',
        type: 'arithmetic',
        questionText: '5 + 3 = ?',
        num1: 5,
        num2: 3,
        operator: Operator.ADD,
        answer: 8,
        displayMode: 'standard',
      };

      expect(problem.id).toBe('prob_1');
      expect(problem.type).toBe('arithmetic');
      expect(problem.answer).toBe(8);
      expect(problem.displayMode).toBe('standard');
    });

    it('should create a valid word problem', () => {
      const problem: MathProblem = {
        id: 'prob_2',
        type: 'word',
        questionText: 'If you have 5 apples and get 3 more, how many do you have?',
        answer: 8,
        displayMode: 'text',
      };

      expect(problem.displayMode).toBe('text');
      expect(problem.type).toBe('word');
      expect(problem.num1).toBeUndefined();
    });

    it('should support all problem types', () => {
      const types: ProblemType[] = [
        'arithmetic',
        'word',
        'time',
        'sequence',
        'geometry',
        'fraction',
        'logic',
        'measurement',
        'riddle',
      ];

      types.forEach(type => {
        const problem: MathProblem = {
          id: `prob_${type}`,
          type,
          questionText: `Sample ${type} problem`,
          answer: 5,
          displayMode: 'text',
        };
        expect(problem.type).toBe(type);
      });
    });
  });

  describe('UserStats interface', () => {
    it('should calculate correct stats', () => {
      const stats: UserStats = {
        totalCorrect: 25,
        streak: 5,
        topicAccuracy: {
          arithmetic: { correct: 10, total: 12 },
          geometry: { correct: 5, total: 8 },
        } as any,
        currentLevel: 3,
      };

      expect(stats.totalCorrect).toBe(25);
      expect(stats.currentLevel).toBe(3);
      expect(stats.topicAccuracy.arithmetic.correct).toBe(10);
    });
  });
});
