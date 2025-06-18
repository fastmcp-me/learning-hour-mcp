import winston from 'winston';

/**
 * Logger configuration for MCP servers
 * All logs go to stderr to avoid interfering with MCP protocol on stdout
 */

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  transports: [
    // Write all logs to stderr
    new winston.transports.Console({
      stderrLevels: ['error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly']
    })
  ]
});

// If we're not in production, add a more readable format
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    ),
    stderrLevels: ['error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly']
  }));
}