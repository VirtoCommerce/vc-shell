/**
 * Logger utility for consistent logging throughout the framework.
 * Provides conditional logging based on environment and log levels.
 */

export type LogLevel = "debug" | "info" | "warn" | "error" | "none";

interface LoggerConfig {
  level: LogLevel;
  prefix: string;
  enabled: boolean;
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  none: 4,
};

/**
 * Default configuration - can be overridden per logger instance
 */
const defaultConfig: LoggerConfig = {
  level: (import.meta.env?.DEV ? "debug" : "warn") as LogLevel,
  prefix: "@vc-shell/framework",
  enabled: true,
};

/**
 * Creates a logger instance with optional context prefix
 * @param context - Additional context prefix for log messages
 * @returns Logger instance with log methods
 */
export function createLogger(context?: string) {
  const config = { ...defaultConfig };
  const prefix = context ? `[${config.prefix}#${context}]` : `[${config.prefix}]`;

  const shouldLog = (level: LogLevel): boolean => {
    if (!config.enabled) return false;
    return LOG_LEVELS[level] >= LOG_LEVELS[config.level];
  };

  return {
    /**
     * Log debug messages (only in development)
     */
    debug: (...args: unknown[]): void => {
      if (shouldLog("debug")) {
        console.debug(prefix, ...args);
      }
    },

    /**
     * Log info messages
     */
    info: (...args: unknown[]): void => {
      if (shouldLog("info")) {
        console.info(prefix, ...args);
      }
    },

    /**
     * Log warning messages
     */
    warn: (...args: unknown[]): void => {
      if (shouldLog("warn")) {
        console.warn(prefix, ...args);
      }
    },

    /**
     * Log error messages
     */
    error: (...args: unknown[]): void => {
      if (shouldLog("error")) {
        console.error(prefix, ...args);
      }
    },

    /**
     * Create a child logger with additional context
     */
    child: (childContext: string) => {
      return createLogger(context ? `${context}:${childContext}` : childContext);
    },

    /**
     * Set the log level for this logger instance
     */
    setLevel: (level: LogLevel): void => {
      config.level = level;
    },

    /**
     * Enable or disable logging
     */
    setEnabled: (enabled: boolean): void => {
      config.enabled = enabled;
    },
  };
}

/**
 * Default logger instance for general framework logging
 */
export const logger = createLogger();

/**
 * Pre-configured loggers for common contexts
 */
export const loggers = {
  core: createLogger("core"),
  ui: createLogger("ui"),
  shared: createLogger("shared"),
  plugins: createLogger("plugins"),
  services: createLogger("services"),
  composables: createLogger("composables"),
};
