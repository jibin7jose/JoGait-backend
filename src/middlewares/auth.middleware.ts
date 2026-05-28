import { Request, Response, NextFunction, RequestHandler } from 'express';
import jwt from 'jsonwebtoken';

function getJwtSecret() {
  const secret = process.env.JWT_SECRET || process.env.JWT_ACCESS_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error('JWT_SECRET or JWT_ACCESS_SECRET must be set to at least 32 characters');
  }

  return secret;
}

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    role: string;
  };
}

export const authenticateToken: RequestHandler = (req: Request, res: Response, next: NextFunction): void => {
  const authReq = req as AuthRequest;
  const authHeader = req.headers['authorization'];
  const [scheme, token] = authHeader?.split(' ') || [];

  if (scheme !== 'Bearer' || !token) {
    res.status(401).json({ error: 'Access token is missing' });
    return;
  }

  jwt.verify(token, getJwtSecret(), { issuer: 'jogait-api' }, (err, decoded) => {
    if (err) {
      res.status(401).json({ error: 'Invalid or expired token' });
      return;
    }

    if (!decoded || typeof decoded !== 'object' || !('userId' in decoded) || !('role' in decoded)) {
      res.status(401).json({ error: 'Invalid token payload' });
      return;
    }
    
    authReq.user = decoded as { userId: string; role: string };
    next();
  });
};
