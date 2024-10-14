import { Request, Response } from 'express';
import { inject, injectable } from 'inversify';
import TYPES from '../../../types';
import { RecruiterMessageUseCase } from '../../../application/usecases/recruiter/RecruiterMessageUseCase';
import { IUserRepository } from '../../../domain/interfaces/repositories/user/IUserRepository';

@injectable()
export class RecruiterMessageController {
  constructor(
    @inject(TYPES.RecruiterMessageUseCase) private recruiterMessageUseCase: RecruiterMessageUseCase,
    @inject(TYPES.IUserRepository) private userRepository: IUserRepository
  ) {}

  async getConversations(req: Request, res: Response): Promise<void> {
    try {
      const { recruiterId } = req.params;
      console.log("conversation recruiter>>>>>>>>>>>>>>", recruiterId, req.params);
      if (!recruiterId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

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
      console.log("error", error);
      res.status(500).json({ error: 'An error occurred while fetching conversations' });
    }
  }

  async getMessages(req: Request, res: Response): Promise<void> {
    try {
      const { conversationId } = req.params;
      const messages = await this.recruiterMessageUseCase.getMessages(conversationId);

      const formattedMessages = messages.map((msg) => ({
        id: msg.id,
        conversationId: msg.conversationId,
        senderId: msg.senderId,
        senderType: msg.senderType,
        content: msg.content,
        timestamp: msg.timestamp.toISOString(),
      }));

      res.status(200).json({ data: formattedMessages });
    } catch (error) {
      res.status(500).json({ error: 'An error occurred while fetching messages' });
    }
  }

  async sendMessage(req: Request, res: Response): Promise<void> {
    try {
      const { conversationId } = req.params;
      const { content } = req.body;

      if (!conversationId) {
        res.status(400).json({ error: 'Conversation ID is required' });
        return;
      }

      const message = await this.recruiterMessageUseCase.sendMessage(conversationId, content);

      const formattedMessage = {
        id: message.id,
        conversationId: message.conversationId,
        senderId: message.senderId,
        senderType: message.senderType,
        content: message.content,
        timestamp: message.timestamp.toISOString(),
      };

      res.status(201).json({ data: formattedMessage });
    } catch (error) {
      console.error("Error sending message:", error);
      res.status(500).json({ error: 'An error occurred while sending the message' });
    }
  }

  async startConversation(req: Request, res: Response): Promise<void> {
    console.log("start conversation>>>>>>>>>>>", req.body);
    try {
      const { applicantId, recruiterId } = req.body;

      const conversation = await this.recruiterMessageUseCase.startConversation(recruiterId, applicantId);
      console.log("conversation start???????????", conversation);
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

      res.status(201).json({ data: formattedConversation });
    } catch (error) {
      console.error("Error starting conversation:", error);
      res.status(500).json({ error: 'An error occurred while starting the conversation' });
    }
  }
}
