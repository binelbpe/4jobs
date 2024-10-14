export interface URMessage {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  createdAt: string;
  // Add any other necessary fields
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
}