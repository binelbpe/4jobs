import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { Container } from 'inversify';
import { EventEmitter } from 'events';
import { UserManager } from './UserManager';
import { socketAuthMiddleware } from '../../presentation/middlewares/socketAuthMiddleware';
import { NotificationModel } from '../database/mongoose/models/NotificationModel';
import { MessageUseCase } from '../../application/usecases/user/MessageUseCase';
import TYPES from "../../types";

export function setupSocketServer(server: HTTPServer, container: Container) {
  const io = new SocketIOServer(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:3000",
      methods: ["GET", "POST"]
    }
  });

  const userManager = container.get<UserManager>(TYPES.UserManager);
  const eventEmitter = container.get<EventEmitter>(TYPES.NotificationEventEmitter);
  const messageUseCase = container.get<MessageUseCase>(TYPES.MessageUseCase);

  io.use(socketAuthMiddleware(userManager));

  io.on('connection', (socket: Socket & { userId?: string }) => {
    console.log(`A user connected, socket id: ${socket.id}, user id: ${socket.userId}`);

    if (!socket.userId) {
      console.error('User not authenticated, closing connection');
      socket.disconnect(true);
      return;
    }

    userManager.addUser(socket.userId, socket.id);
    socket.join(socket.userId);
    console.log(`User ${socket.userId} joined room`);
    socket.emit('authenticated', socket.userId);
    socket.broadcast.emit('userConnected', socket.userId);

    socket.on('sendMessage', async (data: {
      recipientId: string,
      content: string
    }) => {
      console.log(`Received sendMessage event from user ${socket.userId}:`, data);
      try {
        if (!socket.userId) throw new Error('User not authenticated');
        
        const message = await messageUseCase.sendMessage(
          socket.userId,
          data.recipientId,
          data.content
        );
    
        // Emit to sender
        io.to(socket.userId).emit('messageSent', message);
        console.log(`Message sent to sender ${socket.userId}:`, message);
    
        // Emit to recipient
        io.to(data.recipientId).emit('newMessage', message);
        console.log(`New message sent to recipient ${data.recipientId}:`, message);
    
        // Emit notification event
        eventEmitter.emit('sendNotification', {
          type: 'NEW_MESSAGE',
          recipient: data.recipientId,
          sender: socket.userId,
          content: 'You have a new message'
        });
      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('messageError', { error: 'Failed to send message' });
      }
    });

    socket.on('markMessagesAsRead', async (data: {
      messageIds: string[]
    }) => {
      console.log(`Marking messages as read for user ${socket.userId}:`, data.messageIds);
      try {
        for (const messageId of data.messageIds) {
          await messageUseCase.markMessageAsRead(messageId);
        }
        
        io.to(socket.userId!).emit('messagesMarkedAsRead', data.messageIds);
        console.log(`Messages marked as read for user ${socket.userId}:`, data.messageIds);
      } catch (error) {
        console.error('Error marking messages as read:', error);
        socket.emit('markReadError', { error: 'Failed to mark messages as read' });
      }
    });

    socket.on('typing', (data: { recipientId: string }) => {
      console.log(`User ${socket.userId} is typing to ${data.recipientId}`);
      io.to(data.recipientId).emit('userTyping', { userId: socket.userId });
    });

    socket.on('stopTyping', (data: { recipientId: string }) => {
      console.log(`User ${socket.userId} stopped typing to ${data.recipientId}`);
      io.to(data.recipientId).emit('userStoppedTyping', { userId: socket.userId });
    });

    socket.on('joinConversation', (conversationId: string) => {
      socket.join(conversationId);
      console.log(`User ${socket.userId} joined conversation ${conversationId}`);
    });

    socket.on('leaveConversation', (conversationId: string) => {
      socket.leave(conversationId);
      console.log(`User ${socket.userId} left conversation ${conversationId}`);
    });

    socket.on('markNotificationAsRead', async (notificationId: string) => {
      console.log(`Marking notification as read for user ${socket.userId}:`, notificationId);
      try {
        await NotificationModel.findByIdAndUpdate(notificationId, {status: "read"})
        io.to(socket.id).emit('notificationMarkedAsRead', notificationId);
      } catch (error) {
        console.error('Error marking notification as read:', error);
        socket.emit('markNotificationError', { error: 'Failed to mark notification as read' });
      }
    });

    socket.on('ping', () => {
      console.log(`Received ping from client, socket id: ${socket.id}, user id: ${socket.userId}`);
      socket.emit('pong');
    });

    socket.on('disconnect', () => {
      if (socket.userId) {
        userManager.removeUser(socket.userId);
        console.log(`User disconnected, user id: ${socket.userId}`);
        // Notify other users that this user is now offline
        socket.broadcast.emit('userDisconnected', socket.userId);
      }
    });
  });

  eventEmitter.on('sendNotification', (notification) => {
    console.log("Sending notification:", notification);
    const recipientSocketId = userManager.getUserSocketId(notification.recipient.toString());
    
    if (recipientSocketId) {
      io.to(recipientSocketId).emit('newNotification', notification);
      console.log(`Notification sent to user ${notification.recipient}`);
    } else {
      console.log(`User ${notification.recipient} is not currently connected. Notification will be shown on next login.`);
    }
  });
 
  container.unbind(TYPES.SocketIOServer);
  container.bind<SocketIOServer>(TYPES.SocketIOServer).toConstantValue(io);

  return { io, userManager, eventEmitter };
}