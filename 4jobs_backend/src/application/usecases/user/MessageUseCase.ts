import { inject, injectable } from 'inversify';
import { IMessageRepository } from '../../../domain/interfaces/repositories/user/IMessageRepository';
import { Message } from '../../../domain/entities/Message';
import TYPES from '../../../types';

@injectable()
export class MessageUseCase {
  constructor(
    @inject(TYPES.IMessageRepository) private messageRepository: IMessageRepository
  ) {}

  async sendMessage(senderId: string, recipientId: string, content: string): Promise<Message> {
    return this.messageRepository.create({
      sender: senderId,
      recipient: recipientId,
      content,
      createdAt: new Date(),
      isRead: false,
    });
  }

  async getConversation(userId1: string, userId2: string): Promise<Message[]> {
    return this.messageRepository.findByUsers(userId1, userId2);
  }

  async markMessageAsRead(messageId: string): Promise<void> {
    await this.messageRepository.markAsRead(messageId);
  }

  async getUnreadMessageCount(userId: string): Promise<number> {
    return this.messageRepository.getUnreadCount(userId);
  }

  async searchMessages(userId: string, query: string): Promise<Message[]> {
    return this.messageRepository.searchMessages(userId, query);
  }

}