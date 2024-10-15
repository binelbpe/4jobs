import { Request, Response } from 'express';
import { inject, injectable } from 'inversify';
import TYPES from '../../../types';
import { RecruiterMessageUseCase } from '../../../application/usecases/recruiter/RecruiterMessageUseCase';
import { IUserRepository } from '../../../domain/interfaces/repositories/user/IUserRepository';
import { EventEmitter } from 'events';

@injectable()
export class RecruiterMessageController {
  constructor(
    @inject(TYPES.RecruiterMessageUseCase) private recruiterMessageUseCase: RecruiterMessageUseCase,
    @inject(TYPES.IUserRepository) private userRepository: IUserRepository,
    @inject(TYPES.NotificationEventEmitter) private eventEmitter: EventEmitter
  ) {}

  async getConversations(req: Request, res: Response): Promise<void> {
    try {
      const recruiterId = req.params.recruiterId;
      const conversations = await this.recruiterMessageUseCase.getConversations(recruiterId);

      const formattedConversations = await Promise.all(conversations.map(async (conv) => {
        const user = await this.userRepository.findById(conv.applicantId);
        return {
          id: conv.id,
          participant: {
            id: user?.id,
            name: user?.name,
            profileImage: user?.profileImage,
          },
          lastMessage: conv.lastMessage,
          lastMessageTimestamp: conv.lastMessageTimestamp.toISOString(),
        };
      }));

      res.status(200).json({ data: formattedConversations });
    } catch (error) {
      console.error("Error fetching conversations:", error);
      res.status(500).json({ error: 'An error occurred while fetching conversations' });
    }
  }

  async getMessages(req: Request, res: Response): Promise<void> {
    try {
      const { conversationId } = req.params;
      const recruiterId = (req as any).user?.id;
      let messages = await this.recruiterMessageUseCase.getMessages(conversationId);

      const formattedMessages = await Promise.all(messages.map(async (msg) => {
        if (msg.senderId !== recruiterId && !msg.isRead) {
          await this.recruiterMessageUseCase.markMessageAsRead(msg.id);
          msg.isRead = true;
        }

        return {
          id: msg.id,
          conversationId: msg.conversationId,
          senderId: msg.senderId,
          senderType: msg.senderType,
          content: msg.content,
          timestamp: msg.timestamp.toISOString(),
          isRead: msg.isRead,
        };
      }));

      // Update the messages in the database
      await Promise.all(messages.map(msg => this.recruiterMessageUseCase.updateMessage(msg)));

      // Emit event for read messages
      const readMessages = formattedMessages.filter(msg => msg.isRead && msg.senderId === recruiterId);
      if (readMessages.length > 0) {
        this.eventEmitter.emit('recruiterMessagesRead', { messages: readMessages, conversationId });
      }

      res.status(200).json({ data: formattedMessages });
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ error: 'An error occurred while fetching messages' });
    }
  }

  async sendMessage(req: Request, res: Response): Promise<void> {
    try {
      const { conversationId } = req.params;
      const { content } = req.body;
      const recruiterId = (req as any).user?.id;

      if (!recruiterId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const message = await this.recruiterMessageUseCase.sendMessage(conversationId, content, recruiterId);

      const formattedMessage = {
        id: message.id,
        conversationId: message.conversationId,
        senderId: message.senderId,
        senderType: message.senderType,
        content: message.content,
        timestamp: message.timestamp.toISOString(),
        isRead: message.isRead,
      };

      // Emit real-time event
      this.eventEmitter.emit('newRecruiterMessage', formattedMessage);

      res.status(201).json({ data: formattedMessage });
    } catch (error) {
      console.error("Error sending message:", error);
      res.status(500).json({ error: 'An error occurred while sending the message' });
    }
  }

  async startConversation(req: Request, res: Response): Promise<void> {
    try {
     
      const { applicantId,recruiterId } = req.body;

      if (!recruiterId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const conversation = await this.recruiterMessageUseCase.startConversation(recruiterId, applicantId);
      const user = await this.userRepository.findById(applicantId);

      const formattedConversation = {
        id: conversation.id,
        participant: {
          id: user?.id,
          name: user?.name,
          profileImage: user?.profileImage,
        },
        lastMessage: conversation.lastMessage,
        lastMessageTimestamp: conversation.lastMessageTimestamp.toISOString(),
      };

      // Emit real-time event
      this.eventEmitter.emit('newRecruiterConversation', formattedConversation);

      res.status(201).json({ data: formattedConversation });
    } catch (error) {
      console.error("Error starting conversation:", error);
      res.status(500).json({ error: 'An error occurred while starting the conversation' });
    }
  }

  async markMessageAsRead(req: Request, res: Response): Promise<void> {
    try {
      const { messageId } = req.params;
      await this.recruiterMessageUseCase.markMessageAsRead(messageId);

      // Emit real-time event
      this.eventEmitter.emit('recruiterMessageRead', { messageId });

      res.status(200).json({ message: 'Message marked as read' });
    } catch (error) {
      console.error("Error marking message as read:", error);
      res.status(500).json({ error: 'An error occurred while marking the message as read' });
    }
  }
}
