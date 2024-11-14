import { Request, Response, NextFunction } from 'express';

export const adminMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const user = (req as any).user; 
  if (user && user.isAdmin) {
    next();
  } else {
    res.status(403).json({ error: 'Forbidden' });
  }
};

