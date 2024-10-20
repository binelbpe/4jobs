// src/interface/middlewares/authMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import { JwtAuthService } from '../../infrastructure/services/JwtAuthService';
import {UserModel} from '../../infrastructure/database/mongoose/models/UserModel'; // Adjust the path to your user model

const authService = new JwtAuthService(process.env.JWT_SECRET !);

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {

    const decoded = authService.verifyToken(token);
    console.log('Token:', token);
    console.log('Decoded:', decoded);

    const user = await UserModel.findById(decoded.id).lean();

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }else if (user.isBlocked) {
      throw new Error('User is blocked');
    }else{
      (req as any).user = user;
      next();
    }

   
  } catch (error) {
    console.error('Error authenticating user:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
};


export const authenticateadmin = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {

    const decoded = authService.verifyToken(token);

    const user = await UserModel.findById(decoded.id).lean();
   if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }else if (user.role!="admin") {
      return res.status(403).json({ error: 'User is blocked' });
    }else{
      (req as any).user = user;
      next();
    }
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

