import { Socket } from 'socket.io';
import { UserManager } from '../../infrastructure/services/UserManager';

export const socketAuthMiddleware = (userManager: UserManager) => (socket: Socket & { userId?: string, userType?: 'user' | 'recruiter' }, next: (err?: Error) => void) => {
  const userId = socket.handshake.auth.userId;
  const userType = socket.handshake.auth.userType as 'user' | 'recruiter';
  
  if (!userId || !userType) {
    return next(new Error("Invalid user ID or user type"));
  }
  
  socket.userId = userId;
  socket.userType = userType;
  userManager.addUser(userId, socket.id, userType);
  next();
};
