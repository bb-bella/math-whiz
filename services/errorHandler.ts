/**
 * Centralized error handling and logging
 * Prevents crashes and provides better debugging
 */

export type ErrorSeverity = 'info' | 'warning' | 'error' | 'critical';

export interface ErrorLog {
  timestamp: number;
  severity: ErrorSeverity;
  message: string;
  context?: string;
  error?: Error;
}

class ErrorHandler {
  private logs: ErrorLog[] = [];
  private maxLogs = 100;

  /**
   * Log an error with context
   */
  log(
    message: string,
    severity: ErrorSeverity = 'error',
    context?: string,
    error?: unknown
  ): void {
    const errorLog: ErrorLog = {
      timestamp: Date.now(),
      severity,
      message,
      context,
      error: error instanceof Error ? error : undefined
    };

    this.logs.push(errorLog);

    // Keep only recent logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Console output based on severity
    const prefix = `[${severity.toUpperCase()}]`;
    const contextStr = context ? ` (${context})` : '';
    const fullMessage = `${prefix}${contextStr} ${message}`;

    switch (severity) {
      case 'critical':
      case 'error':
        console.error(fullMessage, error);
        break;
      case 'warning':
        console.warn(fullMessage, error);
        break;
      case 'info':
        console.info(fullMessage);
        break;
    }
  }

  /**
   * Get all logged errors
   */
  getLogs(): ErrorLog[] {
    return [...this.logs];
  }

  /**
   * Get errors by severity
   */
  getByseverity(severity: ErrorSeverity): ErrorLog[] {
    return this.logs.filter(log => log.severity === severity);
  }

  /**
   * Clear logs
   */
  clear(): void {
    this.logs = [];
  }
}

// Export singleton
export const errorHandler = new ErrorHandler();

/**
 * Safe async wrapper - prevents unhandled promise rejections
 */
export const safeAsync = async <T>(
  fn: () => Promise<T>,
  fallback: T,
  context: string = 'async-operation'
): Promise<T> => {
  try {
    return await fn();
  } catch (error) {
    errorHandler.log(
      `Failed: ${context}`,
      'error',
      context,
      error
    );
    return fallback;
  }
};

/**
 * Safe sync wrapper - prevents synchronous errors
 */
export const safeSync = <T>(
  fn: () => T,
  fallback: T,
  context: string = 'sync-operation'
): T => {
  try {
    return fn();
  } catch (error) {
    errorHandler.log(
      `Failed: ${context}`,
      'error',
      context,
      error
    );
    return fallback;
  }
};
