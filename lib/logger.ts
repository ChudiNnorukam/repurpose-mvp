/**
 * Structured logging utility with Sentry integration
 *
 * Provides consistent logging across the application with support for different log levels.
 * In production, logs are output as JSON for easier parsing by log aggregators.
 * In development, logs are pretty-printed for easier reading.
 * Errors and warnings are automatically sent to Sentry when configured.
 */

import * as Sentry from '@sentry/nextjs'

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogEntry {
  level: LogLevel
  message: string
  timestamp: string
  context?: Record<string, any>
}

/**
 * Formats a log entry based on environment
 */
function formatLog(entry: LogEntry): string {
  if (process.env.NODE_ENV === 'production') {
    return JSON.stringify(entry)
  }

  const emoji = {
    debug: '🔍',
    info: 'ℹ️',
    warn: '⚠️',
    error: '❌',
  }[entry.level]

  const contextStr = entry.context ? ` ${JSON.stringify(entry.context)}` : ''
  return `${emoji} [${entry.level.toUpperCase()}] ${entry.message}${contextStr}`
}

/**
 * Logger class for structured logging with Sentry integration
 */
class Logger {
  private log(level: LogLevel, message: string, context?: Record<string, any>) {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      ...(context && { context }),
    }

    const formatted = formatLog(entry)

    switch (level) {
      case 'debug':
        console.debug(formatted)
        break
      case 'info':
        console.log(formatted)
        break
      case 'warn':
        console.warn(formatted)
        break
      case 'error':
        console.error(formatted)
        break
    }
  }

  /**
   * Logs debug information (only in development)
   */
  debug(message: string, context?: Record<string, any>) {
    if (process.env.NODE_ENV !== 'production') {
      this.log('debug', message, context)
    }
  }

  /**
   * Logs general information
   */
  info(message: string, context?: Record<string, any>) {
    this.log('info', message, context)
    
    // Send breadcrumb to Sentry
    Sentry.addBreadcrumb({
      message,
      level: 'info',
      data: context,
    })
  }

  /**
   * Logs warnings and sends to Sentry
   */
  warn(message: string, context?: Record<string, any>) {
    this.log('warn', message, context)
    
    // Send warning to Sentry
    Sentry.captureMessage(message, {
      level: 'warning',
      contexts: {
        context: context || {},
      },
    })
  }

  /**
   * Logs errors and sends to Sentry with optional error object
   */
  error(message: string, error?: Error | any, context?: Record<string, any>) {
    const errorContext = error
      ? {
          ...context,
          error: {
            message: error.message,
            ...(error.stack && { stack: error.stack }),
            ...(error.code && { code: error.code }),
            ...(error.status && { status: error.status }),
          },
        }
      : context

    this.log('error', message, errorContext)
    
    // Send error to Sentry
    if (error instanceof Error) {
      Sentry.captureException(error, {
        contexts: {
          context: context || {},
        },
        tags: {
          logMessage: message,
        },
      })
    } else {
      Sentry.captureMessage(message, {
        level: 'error',
        contexts: {
          context: errorContext || {},
        },
      })
    }
  }
}

/**
 * Singleton logger instance
 */
export const logger = new Logger()
