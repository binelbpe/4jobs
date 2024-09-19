// src/interface/middlewares/authMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import { JwtAuthService } from '../../infrastructure/services/JwtAuthService';

const authService = new JwtAuthService(process.env.JWT_SECRET || 'secret_1');

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const decoded = authService.verifyToken(token);
    console.log('Token:', token);
console.log('Decoded:', decoded);

    (req as any).user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

export const authorizeAdmin = (req: Request, res: Response, next: NextFunction) => {
  if ((req as any).user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};
