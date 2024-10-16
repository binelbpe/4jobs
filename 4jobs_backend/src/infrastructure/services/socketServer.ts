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
import { InitiateVideoCallUseCase } from '../../application/usecases/recruiter/InitiateVideoCallUseCase';
import { RespondToVideoCallUseCase } from '../../application/usecases/user/RespondToVideoCallUseCase';
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
  const initiateVideoCallUseCase = container.get<InitiateVideoCallUseCase>(TYPES.InitiateVideoCallUseCase);
  const respondToVideoCallUseCase = container.get<RespondToVideoCallUseCase>(TYPES.RespondToVideoCallUseCase);

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

    // Existing message handling code...

    socket.on('callOffer', async (data: { recipientId: string, offer: string }) => {
      try {
        if (socket.userType !== 'recruiter' || !socket.userId) {
          throw new Error('Unauthorized');
        }

        const videoCall = await initiateVideoCallUseCase.execute(socket.userId, data.recipientId);
        
        const recipientSocket = userManager.getUserSocketId(data.recipientId);
        if (recipientSocket) {
          io.to(recipientSocket).emit('incomingCall', { callerId: socket.userId, offer: data.offer });
        }
      } catch (error) {
        console.error('Error initiating video call:', error);
        socket.emit('videoCallError', { error: 'Failed to initiate video call' });
      }
    });

    socket.on('callAnswer', async (data: { callerId: string, answer: string }) => {
      try {
        if (socket.userType !== 'user' || !socket.userId) {
          throw new Error('Unauthorized');
        }

        const videoCall = await respondToVideoCallUseCase.execute(data.callerId, true);
        
        const callerSocket = userManager.getUserSocketId(data.callerId);
        if (callerSocket) {
          io.to(callerSocket).emit('callAnswer', { answer: data.answer });
        }
      } catch (error) {
        console.error('Error responding to video call:', error);
        socket.emit('videoCallError', { error: 'Failed to respond to video call' });
      }
    });

    socket.on('callRejected', async (data: { callerId: string }) => {
      try {
        if (socket.userType !== 'user' || !socket.userId) {
          throw new Error('Unauthorized');
        }

        await respondToVideoCallUseCase.execute(data.callerId, false);
        
        const callerSocket = userManager.getUserSocketId(data.callerId);
        if (callerSocket) {
          io.to(callerSocket).emit('callRejected');
        }
      } catch (error) {
        console.error('Error rejecting video call:', error);
        socket.emit('videoCallError', { error: 'Failed to reject video call' });
      }
    });

    socket.on('endCall', async (data: { recipientId: string }) => {
      const recipientSocket = userManager.getUserSocketId(data.recipientId);
      if (recipientSocket) {
        io.to(recipientSocket).emit('callEnded');
      }
    });

    // Existing disconnect handling...
  });

  // Existing event listeners...

  return { io, userManager, eventEmitter };
}
