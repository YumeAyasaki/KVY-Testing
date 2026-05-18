import { Request, Response, NextFunction } from 'express';
import { verifyToken, type Payload } from '@src/common/utils/auth';
import HttpStatusCodes from '@src/common/constants/HttpStatusCodes';

type Role = 'ADMIN' | 'SELLER';

type AuthenticatedRequest = Request & { user?: Payload };

export default function requireRole(required?: Role) {
  return function (req: Request, res: Response, next: NextFunction) {
    const header = req.headers['authorization'] || req.headers['Authorization'];
    if (!header || typeof header !== 'string') {
      return res.status(HttpStatusCodes.UNAUTHORIZED).json({ error: 'Missing authorization' });
    }
    const parts = header.trim().split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(HttpStatusCodes.UNAUTHORIZED).json({ error: 'Missing authorization' });
    }
    const token = parts[1].trim();
    const payload = verifyToken(token);
    if (!payload) {
      return res.status(HttpStatusCodes.UNAUTHORIZED).json({ error: 'Invalid token' });
    }
    if (required && payload.role !== required) {
      return res.status(HttpStatusCodes.FORBIDDEN).json({ error: 'Forbidden' });
    }
    // attach user info
    (req as AuthenticatedRequest).user = payload;
    next();
  };
}
