import { Message } from '../../../entities/Message';

export interface IMessageRepository {
  create(message: Partial<Message>): Promise<Message>;
  findById(messageId: string): Promise<Message | null>;
  findByUsers(userId1: string, userId2: string): Promise<Message[]>;
  markAsRead(messageId: string): Promise<void>;
  getUnreadCount(userId: string): Promise<number>;
  searchMessages(userId: string, query: string): Promise<Message[]>;
  getMessageConnections(userId: string): Promise<{ user: string, lastMessage: Message }[]>;
  updateStatus(messageId: string, status: 'sent' | 'delivered' | 'read'): Promise<void>;
}