export interface Participant {
  id: string;
  name: string;
  profileImage?: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  timestamp: string;
  isRead: boolean;
  locallyRead: boolean; // Add this line
  senderType: string;
}

export interface Conversation {
  id: string;
  participant: {
    id: string;
    name: string;
    profileImage?: string;
  };
  lastMessage: string;
  lastMessageTimestamp: string;
  lastMessageRead: boolean;
  unreadCount: number;
}

export interface NewMessagePayload {
  conversationId: string;
  content: string;
}
