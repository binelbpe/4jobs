import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { Container } from 'inversify';
import { EventEmitter } from 'events';
import { UserManager } from './UserManager';
import { socketAuthMiddleware } from '../../presentation/middlewares/socketAuthMiddleware';
import { NotificationModel } from '../database/mongoose/models/NotificationModel';
import TYPES from "../../types";

export function setupSocketServer(server: HTTPServer, container: Container) {
  const io = new SocketIOServer(server, {
    cors: {
      origin: "http://localhost:3000",
      methods: ["GET", "POST"]
    }
  });

  const userManager = container.get<UserManager>(TYPES.UserManager);
  const eventEmitter = container.get<EventEmitter>(TYPES.NotificationEventEmitter);

  io.use(socketAuthMiddleware(userManager));

  io.on('connection', (socket: Socket & { userId?: string }) => {
    console.log(`A user connected, socket id: ${socket.id}, user id: ${socket.userId}`);

    if (socket.userId) {
      socket.emit('authenticated', socket.userId);
    }

    socket.on('disconnect', () => {
      if (socket.userId) {
        userManager.removeUser(socket.userId);
      }
    });

    socket.on('markNotificationAsRead', async (notificationId: string) => {
      console.log("Marking notification as read:", notificationId);
await NotificationModel.findByIdAndUpdate(notificationId,{status:"read"})
      io.to(socket.id).emit('notificationMarkedAsRead', notificationId);
    });
  });

  eventEmitter.on('sendNotification', (notification) => {
    console.log("object",notification)
    console.log(" id-----",notification.recipient.toString())
    const recipientSocketId = userManager.getUserSocketId(notification.recipient.toString());
    console.log("recipientSocketId",recipientSocketId)
    if (recipientSocketId) {
      io.to(recipientSocketId).emit('newNotification', notification);
      console.log(`Notification sent to user ${notification.recipient}`);
    } else {
      console.log(`User ${notification.recipientId} is not currently connected. Notification will be shown on next login.`);
    }
  });
 
  container.unbind(TYPES.SocketIOServer);
  container.bind<SocketIOServer>(TYPES.SocketIOServer).toConstantValue(io);

  return { io, userManager, eventEmitter };
}