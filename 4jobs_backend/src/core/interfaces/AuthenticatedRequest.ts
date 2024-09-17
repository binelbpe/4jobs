// src/interfaces/AuthenticatedRequest.ts
import { Request } from 'express';
import { User } from '../../core/entities/User';

export interface AuthenticatedRequest extends Request {
  user?: User;
}
