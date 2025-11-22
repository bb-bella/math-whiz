import { playSound } from '../../services/audioService';

describe('audioService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('playSound', () => {
    it('should play correct sound without errors', () => {
      expect(() => playSound('correct')).not.toThrow();
    });

    it('should play wrong sound without errors', () => {
      expect(() => playSound('wrong')).not.toThrow();
    });

    it('should play click sound without errors', () => {
      expect(() => playSound('click')).not.toThrow();
    });

    it('should play skip sound without errors', () => {
      expect(() => playSound('skip')).not.toThrow();
    });

    it('should handle invalid sound types gracefully', () => {
      expect(() => playSound('invalid' as any)).not.toThrow();
    });

    it('should handle errors gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      playSound('correct');
      // Verify no unhandled errors
      expect(consoleSpy).not.toHaveBeenCalledWith(expect.stringContaining('Audio play failed'));
      consoleSpy.mockRestore();
    });
  });
});
