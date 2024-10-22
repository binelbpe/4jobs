// src/interface/middlewares/authMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import { JwtAuthService } from '../../infrastructure/services/JwtAuthService';
import {UserModel} from '../../infrastructure/database/mongoose/models/UserModel'; // Adjust the path to your user model
import { User } from "../../domain/entities/User";

const authService = new JwtAuthService(process.env.JWT_SECRET !);

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const decoded = authService.verifyToken(token);
    const user = await UserModel.findById(decoded.id).lean();

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    } else if (user.isBlocked) {
      throw new Error('User is blocked');
    } else {
      (req as any).user = user;
      next();
    }
  } catch (error) {
    console.error('Error authenticating user:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Add a new middleware for token refresh
export const refreshTokenMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const refreshToken = req.body.refreshToken;

  if (!refreshToken) {
    return res.status(400).json({ error: 'Refresh token is required' });
  }

  try {
    const decoded = authService.verifyToken(refreshToken);
    const user = await UserModel.findById(decoded.id).lean();

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const newToken = authService.generateToken({
      id: user._id.toString(),
      email: user.email,
      password: user.password,
      name: user.name,
      role: user.role,
    } as User);
    res.json({ token: newToken, user });
  } catch (error) {
    console.error('Error refreshing token:', error);
    res.status(401).json({ error: 'Invalid refresh token' });
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
    } else if (!user.isAdmin || user.role !== "admin") {
      return res.status(403).json({ error: 'User is not an admin' });
    } else {
      (req as any).user = user;
      next();
    }
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

