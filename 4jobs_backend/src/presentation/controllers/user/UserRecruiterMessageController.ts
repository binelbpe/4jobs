import { Request, Response } from 'express';
import { inject, injectable } from 'inversify';
import TYPES from '../../../types';
import { UserRecruiterMessageUseCase } from '../../../application/usecases/user/UserRecruiterMessageUseCase';
import { IRecruiterRepository } from '../../../domain/interfaces/repositories/recruiter/IRecruiterRepository';

@injectable()
export class UserRecruiterMessageController {
  constructor(
    @inject(TYPES.UserRecruiterMessageUseCase) private userRecruiterMessageUseCase: UserRecruiterMessageUseCase,
    @inject(TYPES.IRecruiterRepository) private recruiterRepository: IRecruiterRepository
  ) {}

  async getUserConversations(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.params.userId;
      const conversations = await this.userRecruiterMessageUseCase.getUserConversations(userId);

      const formattedConversations = await Promise.all(conversations.map(async (conv) => {
        const recruiter = await this.recruiterRepository.findById(conv.recruiterId);
        return {
          id: conv.id,
          participant: {
            id: recruiter?.id,
            name: recruiter?.name,
            companyName: recruiter?.companyName
          },
          lastMessage: conv.lastMessage,
          lastMessageTimestamp: conv.lastMessageTimestamp.toISOString(),
        };
      }));


      res.status(200).json(formattedConversations);
    } catch (error) {
      console.error("Error fetching user conversations:", error);
      res.status(500).json({ error: 'An error occurred while fetching conversations' });
    }
  }

  async getMessages(req: Request, res: Response): Promise<void> {
    try {
      const { conversationId } = req.params;
      const userId = (req as any).user?.id;
      let messages = await this.userRecruiterMessageUseCase.getMessages(conversationId);

      const formattedMessages = await Promise.all(messages.map(async (msg) => {
        if (msg.senderId !== userId && !msg.isRead) {
          await this.userRecruiterMessageUseCase.markMessageAsRead(msg.id);
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
    
      await Promise.all(messages.map(msg => this.userRecruiterMessageUseCase.updateMessage(msg)));
     
      res.status(200).json(formattedMessages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ error: 'An error occurred while fetching messages' });
    }
  }

  async sendMessage(req: Request, res: Response): Promise<void> {
    try {
      const { conversationId } = req.params;
      const { content, senderId } = req.body;

      const message = await this.userRecruiterMessageUseCase.sendMessage(conversationId, content, senderId);

      const formattedMessage = {
        id: message.id,
        conversationId: message.conversationId,
        senderId: message.senderId,
        senderType: message.senderType,
        content: message.content,
        timestamp: message.timestamp.toISOString(),
      };
      res.status(201).json(formattedMessage);
    } catch (error) {
      console.error("Error sending message:", error);
      res.status(500).json({ error: 'An error occurred while sending the message' });
    }
  }

  async startConversation(req: Request, res: Response): Promise<void> {
    try {
      const { userId, recruiterId } = req.body;

      const conversation = await this.userRecruiterMessageUseCase.startConversation(userId, recruiterId);
      const recruiter = await this.recruiterRepository.findById(recruiterId);

      const formattedConversation = {
        id: conversation.id,
        participant: {
          id: recruiter?.id,
          name: recruiter?.name,
        },
        lastMessage: conversation.lastMessage,
        lastMessageTimestamp: conversation.lastMessageTimestamp.toISOString(),
      };

      res.status(201).json(formattedConversation);
    } catch (error) {
      console.error("Error starting conversation:", error);
      res.status(500).json({ error: 'An error occurred while starting the conversation' });
    }
  }
}
