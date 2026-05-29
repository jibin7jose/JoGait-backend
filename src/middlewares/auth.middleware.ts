import { Request, Response, NextFunction, RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../utils/prisma';

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
    tokenVersion: number;
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
    void (async () => {
      try {
        if (err) {
          res.status(401).json({ error: 'Invalid or expired token' });
          return;
        }

        if (
          !decoded ||
          typeof decoded !== 'object' ||
          !('userId' in decoded) ||
          !('role' in decoded) ||
          !('tokenVersion' in decoded)
        ) {
          res.status(401).json({ error: 'Invalid token payload' });
          return;
        }

        const payload = decoded as {
          userId: string;
          role: string;
          tokenVersion: number;
        };

        const user = await prisma.user.findUnique({
          where: { id: payload.userId },
          select: {
            id: true,
            role: true,
            tokenVersion: true,
          },
        });

        if (!user || user.role !== payload.role || user.tokenVersion !== payload.tokenVersion) {
          res.status(401).json({ error: 'Invalid or expired token' });
          return;
        }

        authReq.user = payload;
        next();
      } catch (verificationError) {
        console.error('Auth middleware error:', verificationError);
        res.status(500).json({ error: 'Internal server error' });
      }
    })();
  });
};
