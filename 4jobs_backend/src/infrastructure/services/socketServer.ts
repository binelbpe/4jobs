import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { Container } from 'inversify';
import { EventEmitter } from 'events';
import { UserManager } from './UserManager';
import { socketAuthMiddleware } from '../../presentation/middlewares/socketAuthMiddleware';
import { NotificationModel } from '../database/mongoose/models/NotificationModel';
import { MessageUseCase } from '../../application/usecases/user/MessageUseCase';
import { UserRecruiterMessageUseCase } from '../../application/usecases/user/UserRecruiterMessageUseCase';
import { RecruiterMessageUseCase } from '../../application/usecases/recruiter/RecruiterMessageUseCase';
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
  const userRecruiterMessageUseCase = container.get<UserRecruiterMessageUseCase>(TYPES.UserRecruiterMessageUseCase);
  const recruiterMessageUseCase = container.get<RecruiterMessageUseCase>(TYPES.RecruiterMessageUseCase);

  io.use(socketAuthMiddleware(userManager));

  io.on('connection', (socket: Socket & { userId?: string, userType?: 'user' | 'recruiter' }) => {
    console.log(`A user connected, socket id: ${socket.id}, user id: ${socket.userId}, user type: ${socket.userType}`);

    if (!socket.userId || !socket.userType) {
      console.error('User not authenticated, closing connection');
      socket.disconnect(true);
      return;
    }

    userManager.addUser(socket.userId, socket.id, socket.userType);
    socket.join(socket.userId);
    io.emit('userOnlineStatus', { userId: socket.userId, online: true });

    // Handle user-recruiter messaging
    socket.on('sendUserRecruiterMessage', async (data: {
      conversationId: string,
      content: string,
      recipientId: string
    }) => {
      try {
        if (!socket.userId) {
          throw new Error('User not authenticated');
        }

        let message;
        let recipientId;
        if (socket.userType === 'user') {
          message = await userRecruiterMessageUseCase.sendMessage(data.conversationId, data.content, socket.userId);
          recipientId = message.receiverId; // Set recipientId to the receiverId from the message
        } else {
          message = await recruiterMessageUseCase.sendMessage(data.conversationId, data.content, socket.userId);
          recipientId = message.receiverId; // Set recipientId to the receiverId from the message
        }

        // Emit to sender
        socket.emit('userRecruiterMessageSent', message);

        // Emit to recipient
        const recipientSocket = userManager.getUserSocketId(recipientId);
        if (recipientSocket) {
          io.to(recipientSocket).emit('newUserRecruiterMessage', message);
        }

        // Emit notification event
        eventEmitter.emit('sendNotification', {
          type: 'NEW_USER_RECRUITER_MESSAGE',
          recipient: recipientId,
          sender: socket.userId,
          content: 'You have a new message'
        });
      } catch (error) {
        console.error('Error sending user-recruiter message:', error);
        socket.emit('userRecruiterMessageError', { error: 'Failed to send message' });
      }
    });

    socket.on('markUserRecruiterMessageAsRead', async (data: { messageId: string }) => {
      try {
        if (!socket.userId) {
          throw new Error('User not authenticated');
        }

        if (socket.userType === 'user') {
          await userRecruiterMessageUseCase.markMessageAsRead(data.messageId);
        } else {
          await recruiterMessageUseCase.markMessageAsRead(data.messageId);
        }

        // Emit to sender
        socket.emit('userRecruiterMessageMarkedAsRead', { messageId: data.messageId });

        // Emit to the other participant in the conversation
        const message = socket.userType === 'user' 
          ? await userRecruiterMessageUseCase.getMessageById(data.messageId)
          : await recruiterMessageUseCase.getMessageById(data.messageId);

        if (message) {
          const recipientId = message.senderId === socket.userId ? message.receiverId : message.senderId;
          const recipientSocket = userManager.getUserSocketId(recipientId);
          if (recipientSocket) {
            io.to(recipientSocket).emit('userRecruiterMessageMarkedAsRead', { messageId: data.messageId });
          }
        }

        console.log(`Message ${data.messageId} marked as read by ${socket.userType} ${socket.userId}`);
      } catch (error) {
        console.error('Error marking user-recruiter message as read:', error);
        socket.emit('markUserRecruiterMessageError', { error: 'Failed to mark message as read' });
      }
    });

    // Update typing events for user-recruiter messaging
    socket.on('userRecruiterTyping', (data: { conversationId: string }) => {
      console.log(`${socket.userType} ${socket.userId} is typing in conversation ${data.conversationId}`);
      userManager.setUserTyping(socket.userId!, data.conversationId);
      socket.to(data.conversationId).emit('userRecruiterTyping', { userId: socket.userId, userType: socket.userType, conversationId: data.conversationId });
    });

    socket.on('userRecruiterStoppedTyping', (data: { conversationId: string }) => {
      console.log(`${socket.userType} ${socket.userId} stopped typing in conversation ${data.conversationId}`);
      userManager.setUserStoppedTyping(socket.userId!, data.conversationId);
      socket.to(data.conversationId).emit('userRecruiterStoppedTyping', { userId: socket.userId, userType: socket.userType, conversationId: data.conversationId });
    });

    // Join user-recruiter conversation room
    socket.on('joinUserRecruiterConversation', (conversationId: string) => {
      socket.join(conversationId);
      console.log(`${socket.userType} ${socket.userId} joined conversation ${conversationId}`);
    });

    // Leave user-recruiter conversation room
    socket.on('leaveUserRecruiterConversation', (conversationId: string) => {
      socket.leave(conversationId);
      console.log(`${socket.userType} ${socket.userId} left conversation ${conversationId}`);
    });

    socket.on('disconnect', () => {
      if (socket.userId) {
        userManager.removeUser(socket.userId);
        io.emit('userOnlineStatus', { userId: socket.userId, online: false });
      }
    });

    // Handle recruiter message read status
    socket.on('markRecruiterMessageAsRead', async (data: { messageId: string }) => {
      try {
        if (socket.userType === 'recruiter') {
          await recruiterMessageUseCase.markMessageAsRead(data.messageId);
        }
      } catch (error) {
        console.error('Error marking recruiter message as read:', error);
      }
    });
  });

  // Handle notifications
  eventEmitter.on('sendNotification', (notification) => {
    try {
      if (!notification || !notification.recipient) {
        console.error('Invalid notification:', notification);
        return;
      }

      const recipientId = typeof notification.recipient === 'string' 
        ? notification.recipient 
        : notification.recipient.toString();

      const recipientSocketId = userManager.getUserSocketId(recipientId);
      if (recipientSocketId) {
        io.to(recipientSocketId).emit('newNotification', notification);
      } else {
        console.log(`User ${recipientId} is not currently connected. Notification will be shown on next login.`);
      }
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  });

  // Add these event listeners
  eventEmitter.on('recruiterMessageRead', (data) => {
    const recipientSocketId = userManager.getUserSocketId(data.senderId);
    if (recipientSocketId) {
      io.to(recipientSocketId).emit('recruiterMessageRead', data);
    }
  });

  eventEmitter.on('recruiterMessagesRead', (data) => {
    const recipientSocketId = userManager.getUserSocketId(data.messages[0].senderId);
    if (recipientSocketId) {
      io.to(recipientSocketId).emit('recruiterMessagesRead', data);
    }
  });

  return { io, userManager, eventEmitter };
}
