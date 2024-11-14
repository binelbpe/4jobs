// src/interface/middlewares/authMiddleware.ts
import { inject, injectable } from 'inversify';
import { Request, Response, NextFunction } from 'express';
import { IAuthMiddlewareService } from '../../domain/interfaces/services/IAuthMiddlewareService';
import TYPES from '../../types';
import { Container } from 'inversify';

@injectable()
export class AuthMiddleware {
  constructor(
    @inject(TYPES.AuthMiddlewareService) 
    private authService: IAuthMiddlewareService
  ) {}

  public authenticate = async (req: Request, res: Response, next: NextFunction) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    try {
      const decoded = this.authService.verifyToken(token);
      const user = await this.authService.findUserById(decoded.id);

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      } else if (user.isBlocked) {
        throw new Error('User is blocked');
      }

      (req as any).user = user;
      next();
    } catch (error) {
      console.error('Error authenticating user:', error);
      res.status(401).json({ error: 'Invalid token' });
    }
  };

  public authenticateadmin = async (req: Request, res: Response, next: NextFunction) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    try {
      const decoded = this.authService.verifyToken(token);
      const user = await this.authService.findUserById(decoded.id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      } else if (!user.isAdmin || user.role !== "admin") {
        return res.status(403).json({ error: 'User is not an admin' });
      }
      (req as any).user = user;
      next();
    } catch (error) {
      res.status(401).json({ error: 'Invalid token' });
    }
  };

  public refreshToken = async (req: Request, res: Response, next: NextFunction) => {
    const refreshToken = req.body.refreshToken;

    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token is required' });
    }

    try {
      const decoded = this.authService.verifyToken(refreshToken);
      const user = await this.authService.findUserById(decoded.id);

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const newToken = this.authService.generateToken(user);
      res.json({ token: newToken, user });
    } catch (error) {
      console.error('Error refreshing token:', error);
      res.status(401).json({ error: 'Invalid refresh token' });
    }
  };
}

// Create factory functions for middleware
export const createAuthMiddleware = (container: Container) => {
  const authMiddleware = container.get<AuthMiddleware>(AuthMiddleware);
  return {
    authenticate: authMiddleware.authenticate,
    authenticateadmin: authMiddleware.authenticateadmin,
    refreshTokenMiddleware: authMiddleware.refreshToken
  };
};

