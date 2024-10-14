import { injectable } from 'inversify';
import { IUserRecruiterMessageRepository } from '../../../../domain/interfaces/repositories/user/IUserRecruiterMessageRepository';
import { UserRecruiterMessage, UserRecruiterConversation } from '../../../../domain/entities/UserRecruitermessage';
import { RecruiterMessageModel, ConversationModel, IRecruiterMessageDocument, IConversationDocument } from '../models/RecruiterMessageModel';

@injectable()
export class MongoUserRecruiterMessageRepository implements IUserRecruiterMessageRepository {
  async getUserConversations(userId: string): Promise<UserRecruiterConversation[]> {
    const conversations = await ConversationModel.find({ applicantId: userId }).sort({ lastMessageTimestamp: -1 });
    return conversations.map(this.convertToUserRecruiterConversation);
  }

  async getMessages(conversationId: string): Promise<UserRecruiterMessage[]> {
    const messages = await RecruiterMessageModel.find({ conversationId }).sort({ timestamp: 1 });
    return messages.map(this.convertToUserRecruiterMessage);
  }

  async saveMessage(message: UserRecruiterMessage): Promise<UserRecruiterMessage> {
    const newMessage = new RecruiterMessageModel(message);
    const savedMessage = await newMessage.save();
    return this.convertToUserRecruiterMessage(savedMessage);
  }

  async getConversationById(conversationId: string): Promise<UserRecruiterConversation | null> {
    const conversation = await ConversationModel.findById(conversationId);
    return conversation ? this.convertToUserRecruiterConversation(conversation) : null;
  }

  async updateConversation(conversationId: string, lastMessage: string, lastMessageTimestamp: Date): Promise<void> {
    await ConversationModel.findByIdAndUpdate(conversationId, { lastMessage, lastMessageTimestamp });
  }

  async getConversationByParticipants(userId: string, recruiterId: string): Promise<UserRecruiterConversation | null> {
    const conversation = await ConversationModel.findOne({ applicantId: userId, recruiterId });
    return conversation ? this.convertToUserRecruiterConversation(conversation) : null;
  }

  async saveConversation(conversation: UserRecruiterConversation): Promise<UserRecruiterConversation> {
    const newConversation = new ConversationModel({
      recruiterId: conversation.recruiterId,
      applicantId: conversation.userId,
      lastMessage: conversation.lastMessage,
      lastMessageTimestamp: conversation.lastMessageTimestamp
    });
    const savedConversation = await newConversation.save();
    return this.convertToUserRecruiterConversation(savedConversation);
  }

  private convertToUserRecruiterConversation(doc: IConversationDocument): UserRecruiterConversation {
    return new UserRecruiterConversation(
      doc.id.toString(),
      doc.applicantId,
      doc.recruiterId,
      doc.lastMessage,
      doc.lastMessageTimestamp
    );
  }

  private convertToUserRecruiterMessage(doc: IRecruiterMessageDocument): UserRecruiterMessage {
    return new UserRecruiterMessage(
      doc.id.toString(),
      doc.conversationId,
      doc.senderId,
      doc.receiverId,
      doc.senderType,
      doc.content,
      doc.timestamp
    );
  }
}
