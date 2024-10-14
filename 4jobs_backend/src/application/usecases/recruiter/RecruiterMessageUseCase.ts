import { inject, injectable } from 'inversify';
import TYPES from '../../../types';
import { IRecruiterMessageRepository } from '../../../domain/interfaces/repositories/recruiter/IRecruiterMessageRepository';
import { RecruiterMessage, Conversation } from '../../../domain/entities/RecruiterMessage';
import { IUserRepository } from '../../../domain/interfaces/repositories/user/IUserRepository';

@injectable()
export class RecruiterMessageUseCase {
  constructor(
    @inject(TYPES.IRecruiterMessageRepository) private recruiterMessageRepository: IRecruiterMessageRepository,
    @inject(TYPES.IUserRepository) private userRepository: IUserRepository
  ) {}

  async getConversations(recruiterId: string): Promise<Conversation[]> {
    return this.recruiterMessageRepository.getConversations(recruiterId);
  }

  async getMessages(conversationId: string): Promise<RecruiterMessage[]> {
    return this.recruiterMessageRepository.getMessages(conversationId);
  }

  async sendMessage(conversationId: string, content: string): Promise<RecruiterMessage> {
    const conversation = await this.recruiterMessageRepository.getConversationById(conversationId);
    if (!conversation) {
      throw new Error('Conversation not found');
    }

    const message = new RecruiterMessage(
      '',
      conversationId,
      conversation.recruiterId, 
      conversation.applicantId,
      'recruiter',
      content,
      new Date()
    );

    const savedMessage = await this.recruiterMessageRepository.saveMessage(message);
    await this.recruiterMessageRepository.updateConversation(conversationId, content, new Date());

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
      '', // This is fine now as we've set a default value in the schema
      new Date()
    );

    return this.recruiterMessageRepository.saveConversation(newConversation);
  }
}
