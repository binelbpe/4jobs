import { User } from "./auth";

export interface Message {
  id: string;
  content: string;
  sender: User;
  recipient: User;
  createdAt: string;
  isRead: boolean;
}

export interface ConversationProps {
  messages: Message[];
  currentUserId: string;
  recipientId: string;
  onBackToList: () => void;  
}

export interface ConversationListProps {
  conversations: Record<string, Message[]>;
  onSelectUser: (userId: string) => void;
  selectedUserId: string | null;
}

export interface SendMessagePayload {
  senderId: string;
  recipientId: string;
  content: string;
}

export interface GetConversationPayload {
  userId1: string;
  userId2: string;
}