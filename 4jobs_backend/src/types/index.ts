import { Request } from 'express';
import { User } from '../core/entities/User';

export interface AuthenticatedRequest extends Request {
  user?: User;
}

export interface JwtPayload {
  id: string;
  email: string;
  role: string;
}