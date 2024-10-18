import { inject, injectable } from 'inversify';
import TYPES from '../../../types';
import { IUserRecruiterMessageRepository } from '../../../domain/interfaces/repositories/user/IUserRecruiterMessageRepository';
import { UserRecruiterMessage, UserRecruiterConversation } from '../../../domain/entities/UserRecruitermessage';
import { IRecruiterRepository } from '../../../domain/interfaces/repositories/recruiter/IRecruiterRepository';
import { EventEmitter } from 'events';

@injectable()
export class UserRecruiterMessageUseCase {
  constructor(
    @inject(TYPES.IUserRecruiterMessageRepository) private userRecruiterMessageRepository: IUserRecruiterMessageRepository,
    @inject(TYPES.IRecruiterRepository) private recruiterRepository: IRecruiterRepository,
    @inject(TYPES.NotificationEventEmitter) private eventEmitter: EventEmitter
  ) {}

  async getUserConversations(userId: string): Promise<UserRecruiterConversation[]> {
    return this.userRecruiterMessageRepository.getUserConversations(userId);
  }

  async markMessageAsRead(messageId: string): Promise<void> {
    await this.userRecruiterMessageRepository.markMessageAsRead(messageId);
  }

  async getMessages(conversationId: string): Promise<UserRecruiterMessage[]> {
    return this.userRecruiterMessageRepository.getMessages(conversationId);
  }

  async sendMessage(conversationId: string, content: string, userId: string): Promise<UserRecruiterMessage> {
    const conversation = await this.userRecruiterMessageRepository.getConversationById(conversationId);
    if (!conversation) {
      throw new Error('Conversation not found');
    }

    const message = new UserRecruiterMessage(
      '',
      conversationId,
      userId,
      conversation.recruiterId,
      'user',
      content,
      new Date(),
      false
    );

    const savedMessage = await this.userRecruiterMessageRepository.saveMessage(message);
    await this.userRecruiterMessageRepository.updateConversation(conversationId, content, new Date());

    // Emit an event for real-time updates
    this.eventEmitter.emit('newUserRecruiterMessage', savedMessage);

    return savedMessage;
  }

  async startConversation(userId: string, recruiterId: string): Promise<UserRecruiterConversation> {
    const existingConversation = await this.userRecruiterMessageRepository.getConversationByParticipants(userId, recruiterId);
    if (existingConversation) {
      return existingConversation;
    }

    const newConversation = new UserRecruiterConversation(
      '',
      userId,
      recruiterId,
      '',
      new Date()
    );

    return this.userRecruiterMessageRepository.saveConversation(newConversation);
  }

  async getMessageById(messageId: string): Promise<UserRecruiterMessage | null> {
    return this.userRecruiterMessageRepository.getMessageById(messageId);
  }

  async updateMessage(message: UserRecruiterMessage): Promise<UserRecruiterMessage> {
    return this.userRecruiterMessageRepository.updateMessage(message);
  }

  async updateConversationLastMessage(conversationId: string, lastMessage: string, lastMessageTimestamp: Date): Promise<UserRecruiterConversation> {
    return this.userRecruiterMessageRepository.updateConversation(conversationId, lastMessage, lastMessageTimestamp);
  }
}
