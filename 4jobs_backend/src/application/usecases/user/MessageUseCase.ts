import { inject, injectable } from 'inversify';
import { IMessageRepository } from '../../../domain/interfaces/repositories/user/IMessageRepository';
import { IUserRepository } from '../../../domain/interfaces/repositories/user/IUserRepository';
import { Message } from '../../../domain/entities/Message';
import { User } from '../../../domain/entities/User';
import TYPES from '../../../types';
import { UserManager } from '../../../infrastructure/services/UserManager';

@injectable()
export class MessageUseCase {
  constructor(
    @inject(TYPES.IMessageRepository) private messageRepository: IMessageRepository,
    @inject(TYPES.IUserRepository) private userRepository: IUserRepository,
    @inject(TYPES.UserManager) private userManager: UserManager
  ) {}

  async sendMessage(senderId: string, recipientId: string, content: string): Promise<Message> {
    console.log('MessageUseCase: Sending message', { senderId, recipientId, content });
    const sender = await this.userRepository.findById(senderId);
    const recipient = await this.userRepository.findById(recipientId);

    if (!sender || !recipient) {
      console.error('Sender or recipient not found', { senderId, recipientId });
      throw new Error('Sender or recipient not found');
    }

    const message: Partial<Message> = {
      sender: { ...sender, id: sender.id || '' },
      recipient: { ...recipient, id: recipient.id || '' },
      content,
      createdAt: new Date(),
      isRead: false,
      status: this.userManager.isUserOnline(recipientId) ? 'delivered' : 'sent'
    };

    console.log('MessageUseCase: Creating new message', message);
    const savedMessage = await this.messageRepository.create(message);
    console.log('MessageUseCase: Message saved', savedMessage);
    return savedMessage;
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

  async getMessageConnections(userId: string): Promise<{ user: User, lastMessage: Message, isOnline: boolean }[]> {
    const connections = await this.messageRepository.getMessageConnections(userId);
    const userIds = connections.map((c: { user: string }) => c.user);
    const users = await this.userRepository.findUsersByIds(userIds);
    const resp = connections.map((conn: { user: string, lastMessage: Message }) => {
      const user = users.find((u: User) => u.id === conn.user)!;
      return {
        user,
        lastMessage: conn.lastMessage,
        isOnline: this.userManager.isUserOnline(user.id || '')
      };
    });
    return resp;
  }


  async getMessage(messageId: string): Promise<Message | null> {
    return this.messageRepository.findById(messageId);
  }
}
