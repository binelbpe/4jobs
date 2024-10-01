import { Socket } from 'socket.io';
import { UserManager } from '../../infrastructure/services/UserManager';

export const socketAuthMiddleware = (userManager: UserManager) => (socket: Socket & { userId?: string }, next: (err?: Error) => void) => {
  const userId = socket.handshake.auth.userId;
  if (!userId) {
    return next(new Error("Invalid user ID"));
  }
  socket.userId = userId;
  userManager.addUser(userId, socket.id);
  next();
};