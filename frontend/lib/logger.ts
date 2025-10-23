import { NextRequest, NextResponse } from 'next/server';

interface LogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  service: string;
  requestId?: string;
  userId?: string;
  method?: string;
  url?: string;
  statusCode?: number;
  duration?: number;
  userAgent?: string;
  ip?: string;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
  metadata?: Record<string, any>;
}

class Logger {
  private service: string;

  constructor(service: string) {
    this.service = service;
  }

  private formatLog(level: LogEntry['level'], message: string, metadata?: Record<string, any>): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      service: this.service,
      ...metadata,
    };
  }

  info(message: string, metadata?: Record<string, any>) {
    const log = this.formatLog('info', message, metadata);
    console.log(JSON.stringify(log));
  }

  warn(message: string, metadata?: Record<string, any>) {
    const log = this.formatLog('warn', message, metadata);
    console.warn(JSON.stringify(log));
  }

  error(message: string, error?: Error, metadata?: Record<string, any>) {
    const log = this.formatLog('error', message, {
      ...metadata,
      error: error ? {
        name: error.name,
        message: error.message,
        stack: error.stack,
      } : undefined,
    });
    console.error(JSON.stringify(log));
  }

  debug(message: string, metadata?: Record<string, any>) {
    if (process.env.NODE_ENV === 'development') {
      const log = this.formatLog('debug', message, metadata);
      console.debug(JSON.stringify(log));
    }
  }

  // HTTP request logging
  logRequest(req: NextRequest, res: NextResponse, duration: number) {
    const log = this.formatLog('info', 'HTTP Request', {
      method: req.method,
      url: req.url,
      statusCode: res.status,
      duration,
      userAgent: req.headers.get('user-agent'),
      ip: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip'),
      requestId: req.headers.get('x-request-id'),
    });
    console.log(JSON.stringify(log));
  }

  // API error logging
  logApiError(endpoint: string, error: Error, metadata?: Record<string, any>) {
    this.error(`API Error: ${endpoint}`, error, {
      endpoint,
      ...metadata,
    });
  }

  // Database error logging
  logDatabaseError(operation: string, error: Error, metadata?: Record<string, any>) {
    this.error(`Database Error: ${operation}`, error, {
      operation,
      ...metadata,
    });
  }

  // Performance logging
  logPerformance(operation: string, duration: number, metadata?: Record<string, any>) {
    this.info(`Performance: ${operation}`, {
      operation,
      duration,
      ...metadata,
    });
  }
}

// Create logger instances
export const logger = new Logger('frontend');
export const apiLogger = new Logger('api');
export const dbLogger = new Logger('database');

// Middleware for request logging
export function requestLogger(req: NextRequest, res: NextResponse, duration: number) {
  logger.logRequest(req, res, duration);
}

// Error boundary logging
export function logError(error: Error, errorInfo?: any) {
  logger.error('React Error Boundary', error, {
    componentStack: errorInfo?.componentStack,
  });
}

export default Logger;
