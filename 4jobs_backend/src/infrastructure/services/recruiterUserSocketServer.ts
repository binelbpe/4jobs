import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { Container } from 'inversify';
import { EventEmitter } from 'events';
import { UserManager } from './UserManager';
import { socketAuthMiddleware } from '../../presentation/middlewares/socketAuthMiddleware';
import { UserRecruiterMessageUseCase } from '../../application/usecases/user/UserRecruiterMessageUseCase';
import { RecruiterMessageUseCase } from '../../application/usecases/recruiter/RecruiterMessageUseCase';
import TYPES from "../../types";

export function setupSocketServer(server: HTTPServer, container: Container) {
  const io = new SocketIOServer(server, {
    cors: {
      origin: process.env.CLIENT_URL !,
      methods: ["GET", "POST"]
    }
  });

  const userManager = container.get<UserManager>(TYPES.UserManager);
  const eventEmitter = container.get<EventEmitter>(TYPES.NotificationEventEmitter);
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

    socket.on('sendUserRecruiterMessage', async (message: {
      conversationId: string;
      content: string;
      senderId: string;
      senderType: 'user' | 'recruiter';
    }) => {
      console.log("rec user messaging")
      try {
        const { conversationId, content, senderId, senderType } = message;
        console.log("senderId",senderId)
        let savedMessage;
        if (senderType === 'user') {
          savedMessage = await userRecruiterMessageUseCase.sendMessage(conversationId, content, senderId);
        } else {
          savedMessage = await recruiterMessageUseCase.sendMessage(conversationId, content, senderId);
        }
console.log("conversation id:",conversationId)
        let newUserRecruiterMessage =io.emit('newUserRecruiterMessage', savedMessage);
        console.log("newUserRecruiterMessage",newUserRecruiterMessage)
        const updatedConversation = await userRecruiterMessageUseCase.updateConversationLastMessage(
          conversationId,
          content,
          new Date()
        );
   
        io.emit('conversationUpdated', updatedConversation);
      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('messageSendError', { error: 'Failed to send message' });
      }
    });

    socket.on('joinConversation', (conversationId: string) => {
      socket.join(conversationId);
      console.log(`User ${socket.userId} joined conversation ${conversationId}`);
    });

    socket.on('leaveConversation', (conversationId: string) => {
      socket.leave(conversationId);
      console.log(`User ${socket.userId} left conversation ${conversationId}`);
    });

    socket.on('userRecruiterTyping', ({ conversationId, recipientId }: { conversationId: string, recipientId: string }) => {
      // Emit typing status only to the intended recipient
      io.to(recipientId).emit('userRecruiterTyping', { senderId: socket.userId, conversationId });
      console.log(`User ${socket.userId} is typing in conversation ${conversationId} for recipient ${recipientId}`);
    });

    socket.on('userRecruiterStoppedTyping', ({ conversationId, recipientId }: { conversationId: string, recipientId: string }) => {
      // Emit stopped typing status only to the intended recipient
      io.to(recipientId).emit('userRecruiterStoppedTyping', { senderId: socket.userId, conversationId });
      console.log(`User ${socket.userId} stopped typing in conversation ${conversationId} for recipient ${recipientId}`);
    });

    socket.on('markMessageAsRead', async ({ messageId, conversationId }: { messageId: string, conversationId: string }) => {
      try {
        await userRecruiterMessageUseCase.markMessageAsRead(messageId);
        io.emit('messageMarkedAsRead', { messageId, conversationId });
      } catch (error) {
        console.error('Error marking message as read:', error);
      }
    });



    socket.on('disconnect', () => {
      if (socket.userId) {
        console.log(`User disconnected: ${socket.userId}`);
        userManager.removeUser(socket.userId);
        io.emit('userOnlineStatus', { userId: socket.userId, online: false });
      } else {
        console.log('User disconnected without userId');
      }
    });
  });

  return { io, userManager, eventEmitter };
}
