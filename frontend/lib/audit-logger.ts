import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

interface AuditLogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error';
  action: string;
  userId?: string;
  ip: string;
  userAgent: string;
  resource: string;
  method: string;
  statusCode: number;
  duration: number;
  metadata?: Record<string, any>;
}

class AuditLogger {
  private log(action: string, level: AuditLogEntry['level'], req: NextRequest, res: NextResponse, metadata?: Record<string, any>) {
    const auditLog: AuditLogEntry = {
      timestamp: new Date().toISOString(),
      level,
      action,
      userId: req.headers.get('x-user-id') || undefined,
      ip: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown',
      userAgent: req.headers.get('user-agent') || 'unknown',
      resource: req.url,
      method: req.method,
      statusCode: res.status,
      duration: Date.now() - parseInt(req.headers.get('x-request-start') || '0'),
      metadata,
    };

    logger.info(`AUDIT: ${action}`, auditLog);
  }

  logLogin(req: NextRequest, res: NextResponse, success: boolean, userId?: string) {
    this.log('LOGIN_ATTEMPT', success ? 'info' : 'warn', req, res, {
      success,
      userId,
      loginMethod: 'password',
    });
  }

  logLogout(req: NextRequest, res: NextResponse, userId: string) {
    this.log('LOGOUT', 'info', req, res, { userId });
  }

  logDataAccess(req: NextRequest, res: NextResponse, resource: string, action: string, userId?: string) {
    this.log('DATA_ACCESS', 'info', req, res, {
      resource,
      action,
      userId,
    });
  }

  logDataModification(req: NextRequest, res: NextResponse, resource: string, action: string, userId?: string) {
    this.log('DATA_MODIFICATION', 'info', req, res, {
      resource,
      action,
      userId,
    });
  }

  logSecurityEvent(req: NextRequest, res: NextResponse, event: string, severity: 'low' | 'medium' | 'high', metadata?: Record<string, any>) {
    const level = severity === 'high' ? 'error' : severity === 'medium' ? 'warn' : 'info';
    this.log('SECURITY_EVENT', level, req, res, {
      event,
      severity,
      ...metadata,
    });
  }

  logAdminAction(req: NextRequest, res: NextResponse, action: string, userId: string, metadata?: Record<string, any>) {
    this.log('ADMIN_ACTION', 'info', req, res, {
      action,
      userId,
      ...metadata,
    });
  }

  logApiAccess(req: NextRequest, res: NextResponse, endpoint: string, userId?: string) {
    this.log('API_ACCESS', 'info', req, res, {
      endpoint,
      userId,
    });
  }

  logError(req: NextRequest, res: NextResponse, error: Error, userId?: string) {
    this.log('ERROR', 'error', req, res, {
      error: error.message,
      stack: error.stack,
      userId,
    });
  }
}

export const auditLogger = new AuditLogger();

// Middleware para audit logs automáticos
export function auditMiddleware(req: NextRequest, res: NextResponse) {
  const startTime = Date.now();

  // Log automático baseado na rota
  if (req.url.includes('/admin')) {
    auditLogger.logAdminAction(req, res, 'ADMIN_ACCESS', req.headers.get('x-user-id') || 'unknown');
  } else if (req.url.includes('/api')) {
    auditLogger.logApiAccess(req, res, req.url, req.headers.get('x-user-id') || undefined);
  } else if (req.method !== 'GET') {
    auditLogger.logDataModification(req, res, req.url, req.method, req.headers.get('x-user-id') || undefined);
  } else {
    auditLogger.logDataAccess(req, res, req.url, req.method, req.headers.get('x-user-id') || undefined);
  }

  return res;
}

export default AuditLogger;
