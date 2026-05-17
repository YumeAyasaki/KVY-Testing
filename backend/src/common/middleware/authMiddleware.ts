import { Request, Response, NextFunction } from 'express';
import { verifyToken, type Payload } from '@src/common/utils/auth';
import HttpStatusCodes from '@src/common/constants/HttpStatusCodes';

type Role = 'ADMIN' | 'SELLER';

export default function requireRole(required?: Role) {
  return function (req: Request, res: Response, next: NextFunction) {
    const header = req.headers['authorization'] || req.headers['Authorization'];
    if (!header || typeof header !== 'string' || !header.startsWith('Bearer ')) {
      return res.status(HttpStatusCodes.UNAUTHORIZED).json({ error: 'Missing authorization' });
    }
    const token = header.split(' ')[1];
    const payload = verifyToken(token);
    if (!payload) {
      return res.status(HttpStatusCodes.UNAUTHORIZED).json({ error: 'Invalid token' });
    }
    if (required && payload.role !== required) {
      return res.status(HttpStatusCodes.FORBIDDEN).json({ error: 'Forbidden' });
    }
    // attach user info
    (req as any).user = payload as Payload;
    next();
  };
}
