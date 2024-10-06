import { Request, Response } from 'express';
import { injectable, inject } from 'inversify';
import TYPES from "../../../types";
import { MessageUseCase } from '../../../application/usecases/user/MessageUseCase';

@injectable()
export class MessageController {
  constructor(
    @inject(TYPES.MessageUseCase) private messageUseCase: MessageUseCase
  ) {}

  async sendMessage(req: Request, res: Response): Promise<void> {
    try {
      const { senderId, recipientId, content } = req.body;
      const message = await this.messageUseCase.sendMessage(senderId, recipientId, content);
      res.status(201).json(message);
    } catch (error) {
      console.error("Error sending message:", error);
      res.status(500).json({ error: "An error occurred while sending the message" });
    }
  }

  async getConversation(req: Request, res: Response): Promise<void> {
    try {
      const { userId1, userId2 } = req.params;
      const messages = await this.messageUseCase.getConversation(userId1, userId2);
      res.status(200).json(messages);
    } catch (error) {
      console.error("Error fetching conversation:", error);
      res.status(500).json({ error: "An error occurred while fetching the conversation" });
    }
  }

  async markMessageAsRead(req: Request, res: Response): Promise<void> {
    try {
      const { messageId } = req.params;
      await this.messageUseCase.markMessageAsRead(messageId);
      res.status(200).json({ message: "Message marked as read" });
    } catch (error) {
      console.error("Error marking message as read:", error);
      res.status(500).json({ error: "An error occurred while marking the message as read" });
    }
  }

  async getUnreadMessageCount(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const count = await this.messageUseCase.getUnreadMessageCount(userId);
      res.status(200).json({ count });
    } catch (error) {
      console.error("Error getting unread message count:", error);
      res.status(500).json({ error: "An error occurred while getting the unread message count" });
    }
  }

  async searchMessages(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const { query } = req.query;
      if (typeof query !== 'string') {
        throw new Error('Invalid query parameter');
      }
      const messages = await this.messageUseCase.searchMessages(userId, query);
      res.status(200).json(messages);
    } catch (error) {
      console.error("Error searching messages:", error);
      res.status(500).json({ error: "An error occurred while searching messages" });
    }
  }

  async getMessageConnections(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const connections = await this.messageUseCase.getMessageConnections(userId);
      console.log("connection messagessss",connections)
      res.status(200).json(connections);
    } catch (error) {
      console.error("Error fetching message connections:", error);
      res.status(500).json({ error: "An error occurred while fetching message connections" });
    }
  }
}
