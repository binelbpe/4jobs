import { injectable } from 'inversify';
import { IRecruiterMessageRepository } from '../../../../domain/interfaces/repositories/recruiter/IRecruiterMessageRepository';
import { RecruiterMessage, Conversation } from '../../../../domain/entities/RecruiterMessage';
import { RecruiterMessageModel, ConversationModel, IRecruiterMessageDocument, IConversationDocument } from '../models/RecruiterMessageModel';

@injectable()
export class MongoRecruiterMessage implements IRecruiterMessageRepository {
  async getConversations(recruiterId: string): Promise<Conversation[]> {
    const conversations = await ConversationModel.find({ recruiterId }).sort({ lastMessageTimestamp: -1 });
    return conversations.map(this.convertToConversation);
  }

  async getMessages(conversationId: string): Promise<RecruiterMessage[]> {
    const messages = await RecruiterMessageModel.find({ conversationId }).sort({ timestamp: 1 });
    return messages.map(this.convertToRecruiterMessage);
  }

  async saveMessage(message: RecruiterMessage): Promise<RecruiterMessage> {
    const newMessage = new RecruiterMessageModel(message);
    const savedMessage = await newMessage.save();
    return this.convertToRecruiterMessage(savedMessage);
  }

  async getConversationById(conversationId: string): Promise<Conversation | null> {
    const conversation = await ConversationModel.findById(conversationId);
    return conversation ? this.convertToConversation(conversation) : null;
  }

  async updateConversation(conversationId: string, lastMessage: string, lastMessageTimestamp: Date): Promise<void> {
    await ConversationModel.findByIdAndUpdate(conversationId, { lastMessage, lastMessageTimestamp });
  }

  async getConversationByParticipants(recruiterId: string, applicantId: string): Promise<Conversation | null> {
    const conversation = await ConversationModel.findOne({ recruiterId, applicantId });
    return conversation ? this.convertToConversation(conversation) : null;
  }

  async saveConversation(conversation: Conversation): Promise<Conversation> {
    const newConversation = new ConversationModel(conversation);
    const savedConversation = await newConversation.save();
    return this.convertToConversation(savedConversation);
  }

  async markMessageAsRead(messageId: string): Promise<void> {
    await RecruiterMessageModel.findByIdAndUpdate(messageId, { isRead: true });
  }

  private convertToConversation(doc: IConversationDocument): Conversation {
    return new Conversation(
      doc.id.toString(),
      doc.recruiterId,
      doc.applicantId,
      doc.lastMessage,
      doc.lastMessageTimestamp
    );
  }

  private convertToRecruiterMessage(doc: IRecruiterMessageDocument): RecruiterMessage {
    return new RecruiterMessage(
      doc.id.toString(),
      doc.conversationId,
      doc.senderId,
      doc.receiverId,
      doc.senderType,
      doc.content,
      doc.timestamp,
      doc.isRead
    );
  }

  async getMessageById(messageId: string): Promise<RecruiterMessage | null> {
    const message = await RecruiterMessageModel.findById(messageId);
    return message ? this.convertToRecruiterMessage(message) : null;
  }

  async updateMessage(message: RecruiterMessage): Promise<RecruiterMessage> {
    const updatedMessage = await RecruiterMessageModel.findByIdAndUpdate(
      message.id,
      {
        isRead: message.isRead,
      },
      { new: true }
    );
    
    if (!updatedMessage) {
      throw new Error('Message not found');
    }
    
    return this.convertToRecruiterMessage(updatedMessage);
  }
}
