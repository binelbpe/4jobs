import { UserRecruiterMessage, UserRecruiterConversation } from '../../../entities/UserRecruitermessage';

export interface IUserRecruiterMessageRepository {
  getUserConversations(userId: string): Promise<UserRecruiterConversation[]>;
  getMessages(conversationId: string): Promise<UserRecruiterMessage[]>;
  saveMessage(message: UserRecruiterMessage): Promise<UserRecruiterMessage>;
  getConversationById(conversationId: string): Promise<UserRecruiterConversation | null>;
  updateConversation(conversationId: string, lastMessage: string, lastMessageTimestamp: Date): Promise<UserRecruiterConversation>;
  getConversationByParticipants(userId: string, recruiterId: string): Promise<UserRecruiterConversation | null>;
  saveConversation(conversation: UserRecruiterConversation): Promise<UserRecruiterConversation>;
  markMessageAsRead(messageId: string): Promise<void>;
  getMessageById(messageId: string): Promise<UserRecruiterMessage | null>;
  updateMessage(message: UserRecruiterMessage): Promise<UserRecruiterMessage>;
}
