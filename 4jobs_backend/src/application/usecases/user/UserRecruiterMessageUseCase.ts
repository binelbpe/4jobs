import { inject, injectable } from 'inversify';
import TYPES from '../../../types';
import { IUserRecruiterMessageRepository } from '../../../domain/interfaces/repositories/user/IUserRecruiterMessageRepository';
import { UserRecruiterMessage, UserRecruiterConversation } from '../../../domain/entities/UserRecruitermessage';
import { IRecruiterRepository } from '../../../domain/interfaces/repositories/recruiter/IRecruiterRepository';

@injectable()
export class UserRecruiterMessageUseCase {
  constructor(
    @inject(TYPES.IUserRecruiterMessageRepository) private userRecruiterMessageRepository: IUserRecruiterMessageRepository,
    @inject(TYPES.IRecruiterRepository) private recruiterRepository: IRecruiterRepository
  ) {}

  async getUserConversations(userId: string): Promise<UserRecruiterConversation[]> {
    return this.userRecruiterMessageRepository.getUserConversations(userId);
  }

  async getMessages(conversationId: string): Promise<UserRecruiterMessage[]> {
    return this.userRecruiterMessageRepository.getMessages(conversationId);
  }

  async sendMessage(conversationId: string, content: string, senderId: string): Promise<UserRecruiterMessage> {
    const conversation = await this.userRecruiterMessageRepository.getConversationById(conversationId);
    if (!conversation) {
      throw new Error('Conversation not found');
    }

    const receiverId = conversation.userId === senderId ? conversation.recruiterId : conversation.userId;
    const senderType = conversation.userId === senderId ? 'user' : 'recruiter';

    const message = new UserRecruiterMessage(
      '',
      conversationId,
      senderId,
      receiverId,
      senderType,
      content,
      new Date()
    );

    const savedMessage = await this.userRecruiterMessageRepository.saveMessage(message);
    await this.userRecruiterMessageRepository.updateConversation(conversationId, content, new Date());

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
}
