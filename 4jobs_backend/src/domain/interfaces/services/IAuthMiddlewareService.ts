import { Request, Response, NextFunction } from 'express';

export interface IAuthMiddlewareService {
  verifyToken(token: string): any;
  findUserById(id: string): Promise<any>;
  generateToken(user: any): string;
} 