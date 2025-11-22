/**
 * Input validation utilities for safety
 * Prevents invalid data from breaking the app
 */

/**
 * Validate user input string
 */
export const validateString = (input: unknown, maxLength: number = 100): string => {
  if (typeof input !== 'string') {
    return '';
  }
  return input.trim().slice(0, maxLength);
};

/**
 * Validate numeric answer
 */
export const validateAnswer = (input: unknown): number | null => {
  if (input === null || input === undefined || input === '') {
    return null;
  }
  
  const num = Number(input);
  if (isNaN(num) || !isFinite(num)) {
    return null;
  }
  
  return num;
};

/**
 * Validate difficulty setting
 */
export const validateDifficulty = (input: unknown): 'easy' | 'medium' | 'hard' => {
  const validDifficulties = ['easy', 'medium', 'hard'];
  if (typeof input !== 'string' || !validDifficulties.includes(input)) {
    return 'easy';
  }
  return input as 'easy' | 'medium' | 'hard';
};

/**
 * Validate array of topics
 */
export const validateTopics = (input: unknown): string[] => {
  if (!Array.isArray(input)) {
    return [];
  }
  
  return input
    .filter(item => typeof item === 'string' && item.trim().length > 0)
    .map(item => item.trim())
    .slice(0, 10); // Max 10 topics
};

/**
 * Validate user name
 */
export const validateUserName = (input: unknown): string => {
  const validated = validateString(input, 50);
  return validated || 'Math Star';
};

/**
 * Validate boolean setting
 */
export const validateBoolean = (input: unknown): boolean => {
  return typeof input === 'boolean' ? input : false;
};

/**
 * Safe JSON parse with fallback
 */
export const safeJsonParse = <T>(json: string, fallback: T): T => {
  try {
    return JSON.parse(json) as T;
  } catch (error) {
    console.warn('[Validation] JSON parse failed, using fallback:', error);
    return fallback;
  }
};
