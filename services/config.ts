/**
 * Centralized configuration loader with validation
 * Handles environment variables and provides defaults
 */

interface AppConfig {
  apiKey: string | null;
  environment: 'development' | 'production';
  enableAI: boolean;
  enableDebug: boolean;
}

/**
 * Validate that a setting is a valid value
 */
const validateEnv = (value: string | undefined, validValues: string[]): string => {
  if (!value || !validValues.includes(value)) {
    return validValues[0];
  }
  return value;
};

/**
 * Load and validate application configuration
 */
export const loadConfig = (): AppConfig => {
  // Access environment variables - use as any for flexibility
  const env = (import.meta as any).env || {};
  const apiKey = env.VITE_API_KEY || process.env.API_KEY || null;
  const environment = validateEnv(
    env.VITE_APP_ENV || process.env.VITE_APP_ENV,
    ['development', 'production']
  ) as 'development' | 'production';

  const config: AppConfig = {
    apiKey: apiKey && apiKey.trim() ? apiKey.trim() : null,
    environment,
    enableAI: !!apiKey && apiKey.trim().length > 0,
    enableDebug: environment === 'development'
  };

  // Log config status in development
  if (config.enableDebug) {
    console.info('[Config] Environment:', config.environment);
    console.info('[Config] AI Enabled:', config.enableAI);
  }

  return config;
};

// Export singleton instance
export const config = loadConfig();
