export interface Message {
  id: string;
  content: string;
  sender: {
    id: string;
    name: string;
  };
  recipient: {
    id: string;
    name: string;
  };
  createdAt: string;
  isRead: boolean;
}

export interface UserConnection {
  id: string;
  name: string;
  email: string;
  profileImage?: string;
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

export interface ConversationListItem {
  user: UserConnection;
  lastMessage: Message;
}