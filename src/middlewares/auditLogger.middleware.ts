import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware';

export const accessAuditLogger = (req: AuthRequest, res: Response, next: NextFunction): void => {
  // We attach a listener to log the access AFTER the request finishes to capture the response status
  res.on('finish', () => {
    // For HIPAA compliance, we must strictly log whenever a clinician or admin accesses PHI (Protected Health Information)
    if (req.user && (req.user.role === 'clinician' || req.user.role === 'admin')) {
      const auditEntry = {
        timestamp: new Date().toISOString(),
        actorId: req.user.userId,
        actorRole: req.user.role,
        action: req.method,
        resourcePath: req.originalUrl,
        responseStatus: res.statusCode,
        ipAddress: req.ip,
        userAgent: req.get('user-agent') || 'Unknown'
      };

      // In a production environment, this should be written to a secure, append-only log stream like AWS CloudWatch or DataDog
      console.log('[HIPAA AUDIT LOG] - PHI Access Event:', JSON.stringify(auditEntry));
    }
  });

  next();
};
