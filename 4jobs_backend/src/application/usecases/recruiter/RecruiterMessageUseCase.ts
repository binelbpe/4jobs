import { inject, injectable } from 'inversify';
import TYPES from '../../../types';
import { IRecruiterMessageRepository } from '../../../domain/interfaces/repositories/recruiter/IRecruiterMessageRepository';
import { RecruiterMessage, Conversation } from '../../../domain/entities/RecruiterMessage';
import { IUserRepository } from '../../../domain/interfaces/repositories/user/IUserRepository';
import { EventEmitter } from 'events';

@injectable()
export class RecruiterMessageUseCase {
  constructor(
    @inject(TYPES.IRecruiterMessageRepository) private recruiterMessageRepository: IRecruiterMessageRepository,
    @inject(TYPES.IUserRepository) private userRepository: IUserRepository,
    @inject(TYPES.NotificationEventEmitter) private eventEmitter: EventEmitter
  ) {}

  async getConversations(recruiterId: string): Promise<Conversation[]> {
    return this.recruiterMessageRepository.getConversations(recruiterId);
  }

  async getMessages(conversationId: string): Promise<RecruiterMessage[]> {
    return this.recruiterMessageRepository.getMessages(conversationId);
  }

  async sendMessage(conversationId: string, content: string, recruiterId: string): Promise<RecruiterMessage> {
    const conversation = await this.recruiterMessageRepository.getConversationById(conversationId);
    if (!conversation) {
      throw new Error('Conversation not found');
    }

    const message = new RecruiterMessage(
      '',
      conversationId,
      recruiterId,
      conversation.applicantId,
      'recruiter',
      content,
      new Date(),
      false
    );

    const savedMessage = await this.recruiterMessageRepository.saveMessage(message);
    await this.recruiterMessageRepository.updateConversation(conversationId, content, new Date());

    // Emit an event for real-time updates
    this.eventEmitter.emit('newRecruiterMessage', savedMessage);

    return savedMessage;
  }

  async startConversation(recruiterId: string, applicantId: string): Promise<Conversation> {
    const existingConversation = await this.recruiterMessageRepository.getConversationByParticipants(recruiterId, applicantId);
    if (existingConversation) {
      return existingConversation;
    }

    const newConversation = new Conversation(
      '',
      recruiterId,
      applicantId,
      '',
      new Date()
    );

    const savedConversation = await this.recruiterMessageRepository.saveConversation(newConversation);

    // Emit an event for real-time updates
    this.eventEmitter.emit('newRecruiterConversation', savedConversation);

    return savedConversation;
  }

  async markMessageAsRead(messageId: string): Promise<void> {
    const message = await this.recruiterMessageRepository.getMessageById(messageId);
    if (message && !message.isRead) {
      message.isRead = true;
      await this.recruiterMessageRepository.updateMessage(message);
      this.eventEmitter.emit('recruiterMessageRead', { messageId, conversationId: message.conversationId });
    }
  }

  async getMessageById(messageId: string): Promise<RecruiterMessage | null> {
    return this.recruiterMessageRepository.getMessageById(messageId);
  }

  async updateMessage(message: RecruiterMessage): Promise<RecruiterMessage> {
    const updatedMessage = await this.recruiterMessageRepository.updateMessage(message);
    if (updatedMessage.isRead) {
      this.eventEmitter.emit('recruiterMessageRead', { messageId: updatedMessage.id, conversationId: updatedMessage.conversationId });
    }
    return updatedMessage;
  }
}
