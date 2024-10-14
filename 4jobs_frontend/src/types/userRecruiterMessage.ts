export interface URMessage {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  timestamp: string;
  isRead: boolean;
  senderType: string;
}

export interface URConversation {
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
