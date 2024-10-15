export interface URMessage {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  timestamp: string;
  isRead: boolean;
  senderType: string;
  locallyRead: boolean; // New field to track if the message has been read locally
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
