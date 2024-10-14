import {
  RecruiterMessage,
  Conversation,
} from "../../../entities/RecruiterMessage";

export interface IRecruiterMessageRepository {
  getConversations(
    id: string
  ): Promise<Conversation[]>;
  getMessages(conversationId: string): Promise<RecruiterMessage[]>;
  saveMessage(message: RecruiterMessage): Promise<RecruiterMessage>;
  getConversationById(conversationId: string): Promise<Conversation | null>;
  updateConversation(
    conversationId: string,
    lastMessage: string,
    lastMessageTimestamp: Date
  ): Promise<void>;
  getConversationByParticipants(
    recruiterId: string,
    userId: string
  ): Promise<Conversation | null>;
  saveConversation(conversation: Conversation): Promise<Conversation>;
  markMessageAsRead(messageId: string): Promise<void>;
  getMessageById(messageId: string): Promise<RecruiterMessage | null>;
  updateMessage(message: RecruiterMessage): Promise<RecruiterMessage>;
}
