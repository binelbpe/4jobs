import { Request, Response } from 'express';
import { injectable, inject } from 'inversify';
import mongoose from 'mongoose';
import TYPES from '../../../types';
import { MessageUseCase } from '../../../application/usecases/user/MessageUseCase';
import { Server as SocketIOServer } from 'socket.io';
import { UserManager } from '../../../infrastructure/services/UserManager';
import { EventEmitter } from 'events';
import { MUser } from '../../../domain/entities/User';
import { Message } from '../../../domain/entities/Message';

@injectable()
export class MessageController {
  constructor(
    @inject(TYPES.MessageUseCase) private messageUseCase: MessageUseCase,
    @inject(TYPES.SocketIOServer) private io: SocketIOServer,
    @inject(TYPES.UserManager) private userManager: UserManager,
    @inject(TYPES.NotificationEventEmitter) private eventEmitter: EventEmitter,
  ) {}

  async sendMessage(req: Request, res: Response): Promise<void> {
    try {
      console.log("ivide vrunnund send message")
      const { senderId, recipientId, content } = req.body;
      
      if (!this.isValidObjectId(senderId) || !this.isValidObjectId(recipientId)) {
        res.status(400).json({ error: "Invalid sender or recipient ID" });
        return;
      }

      const message = await this.messageUseCase.sendMessage(senderId, recipientId, content);
      
      const senderNotified = this.emitSocketEvent(senderId, 'messageSent', message);
      const recipientNotified = this.emitSocketEvent(recipientId, 'newMessage', message);
      
      console.log(`Message sent. Sender notified: ${senderNotified}, Recipient notified: ${recipientNotified}`);

      if (!senderNotified || !recipientNotified) {
        console.warn(`Failed to notify ${!senderNotified ? 'sender' : 'recipient'} via socket for message ${message.id}`);
      }

      this.eventEmitter.emit('sendNotification', {
        type: 'NEW_MESSAGE',
        recipient: recipientId,
        sender: senderId,
        content: 'You have a new message'
      });
      
      res.status(201).json(message);
    } catch (error) {
      this.handleError(res, error, "Error sending message");
    }
  }

  async getConversation(req: Request, res: Response): Promise<void> {
    try {
      const { userId1, userId2 } = req.params;

     
      console.log(`Fetching conversation for users: ${userId1}, ${userId2}`)

      if (userId1 === 'unread') {
        const unreadCount = await this.messageUseCase.getUnreadMessageCount(userId2);
        res.status(200).json({ unreadCount });
        return;
      }

      if (!this.isValidObjectId(userId1) || !this.isValidObjectId(userId2)) {
        res.status(400).json({ error: "Invalid user ID provided" });
        return;
      }

      const messages = await this.messageUseCase.getConversation(userId1, userId2);
      console.log("messages between two userssssssssss",messages)
      res.status(200).json(messages);
    } catch (error) {
      this.handleError(res, error, "Error fetching conversation");
    }
  }

  async markMessageAsRead(req: Request, res: Response): Promise<void> {
    try {
      const { messageId } = req.params;
      
      if (!this.isValidObjectId(messageId)) {
        res.status(400).json({ error: "Invalid message ID" });
        return;
      }

      await this.messageUseCase.markMessageAsRead(messageId);
      
      const message = await this.messageUseCase.getMessage(messageId);
      if (message && message.sender) {
        const senderId = this.getSenderId(message.sender);
        this.emitSocketEvent(senderId, 'messageRead', { messageId });
      }
      
      res.status(200).json({ message: "Message marked as read" });
    } catch (error) {
      this.handleError(res, error, "Error marking message as read");
    }
  }

  async getUnreadMessageCount(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      
      if (!this.isValidObjectId(userId)) {
        res.status(400).json({ error: "Invalid user ID" });
        return;
      }

      const count = await this.messageUseCase.getUnreadMessageCount(userId);
      res.status(200).json({ count });
    } catch (error) {
      this.handleError(res, error, "Error getting unread message count");
    }
  }

  async searchMessages(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const { query } = req.query;
      
      if (!this.isValidObjectId(userId)) {
        res.status(400).json({ error: "Invalid user ID" });
        return;
      }

      if (typeof query !== 'string') {
        res.status(400).json({ error: "Invalid query parameter" });
        return;
      }

      const messages = await this.messageUseCase.searchMessages(userId, query);
      res.status(200).json(messages);
    } catch (error) {
      this.handleError(res, error, "Error searching messages");
    }
  }

  async getMessageConnections(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      
      if (!this.isValidObjectId(userId)) {
        res.status(400).json({ error: "Invalid user ID" });
        return;
      }
console.log("ivideeee kerunnnundddddddddddddddddddddddddddddddddddddd")
      const connections = await this.messageUseCase.getMessageConnections(userId);
      res.status(200).json(connections);
    } catch (error) {
      this.handleError(res, error, "Error fetching message connections");
    }
  }

  private isValidObjectId(id: string): boolean {
    return mongoose.Types.ObjectId.isValid(id);
  }

  private emitSocketEvent(userId: string, event: string, data: any): boolean {
    const socketId = this.userManager.getUserSocketId(userId);
    if (socketId) {
      try {
        this.io.to(socketId).emit(event, data);
        console.log(`${event} emitted to user ${userId}`);
        return true;
      } catch (error) {
        console.error(`Failed to emit ${event} to user ${userId}:`, error);
        return false;
      }
    } else {
      console.log(`User ${userId} is not connected. Event ${event} not emitted.`);
      return false;
    }
  }

  private getSenderId(sender: MUser | string): string {
    return typeof sender === 'string' ? sender : sender.id;
  }

  private handleError(res: Response, error: any, message: string): void {
    console.error(`${message}:`, error);
    res.status(500).json({ error: `${message}. Please try again later.` });
  }
}