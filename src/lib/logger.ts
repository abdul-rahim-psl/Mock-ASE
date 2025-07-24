// src/lib/logger.ts - Centralized logging utility for the Mock-ASE application

/**
 * Logger utility for the Mock-ASE application
 * Provides consistent log formatting and the ability to toggle verbosity
 */

// Configuration
const config = {
  // Set to false in production to reduce console logs
  verbose: true,
  // Show timestamps in logs
  showTimestamp: true,
  // Log levels that are currently enabled
  enabledLevels: ['info', 'warn', 'error', 'debug', 'api']
};

// Log level emojis for visual distinction
const emojis = {
  info: 'ℹ️',
  warn: '⚠️',
  error: '❌',
  debug: '🔍',
  api: '📡',
  success: '✅',
  user: '👤',
  wallet: '💰',
  transfer: '↔️',
};

// Add colors to console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

/**
 * Format the log message with timestamp, level and color
 */
const formatLog = (level: string, message: string): string => {
  const emoji = emojis[level as keyof typeof emojis] || '';
  const timestamp = config.showTimestamp ? `${new Date().toISOString()} ` : '';
  
  let color = colors.reset;
  switch (level) {
    case 'error': color = colors.red; break;
    case 'warn': color = colors.yellow; break;
    case 'info': color = colors.cyan; break;
    case 'debug': color = colors.dim; break;
    case 'api': color = colors.magenta; break;
    case 'success': color = colors.green; break;
    default: color = colors.reset;
  }
  
  return `${color}${emoji} ${timestamp}[${level.toUpperCase()}]${colors.reset} ${message}`;
};

/**
 * Log a message with the specified level
 */
const log = (level: string, message: string, ...args: any[]) => {
  if (!config.verbose || !config.enabledLevels.includes(level)) return;
  
  const formattedMessage = formatLog(level, message);
  
  switch (level) {
    case 'error':
      console.error(formattedMessage, ...args);
      break;
    case 'warn':
      console.warn(formattedMessage, ...args);
      break;
    default:
      console.log(formattedMessage, ...args);
  }
};

// Export the logger functions
export const logger = {
  info: (message: string, ...args: any[]) => log('info', message, ...args),
  warn: (message: string, ...args: any[]) => log('warn', message, ...args),
  error: (message: string, ...args: any[]) => log('error', message, ...args),
  debug: (message: string, ...args: any[]) => log('debug', message, ...args),
  api: (message: string, ...args: any[]) => log('api', message, ...args),
  success: (message: string, ...args: any[]) => log('success', message, ...args),
  
  // Specific domain loggers
  user: (message: string, ...args: any[]) => log('user', `${emojis.user} ${message}`, ...args),
  wallet: (message: string, ...args: any[]) => log('wallet', `${emojis.wallet} ${message}`, ...args),
  transfer: (message: string, ...args: any[]) => log('transfer', `${emojis.transfer} ${message}`, ...args),
  
  // Set configuration
  configure: (newConfig: Partial<typeof config>) => {
    Object.assign(config, newConfig);
  }
};
