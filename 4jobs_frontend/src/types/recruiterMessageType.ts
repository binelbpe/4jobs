export interface Participant {
  id: string;
  name: string;
  profileImage?: string;
}

export interface Conversation {
  id: string;
  participant: Participant;
  lastMessage: string;
  lastMessageTimestamp: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  timestamp: string;
  // Add any other properties that your API returns
}

export interface NewMessagePayload {
  conversationId: string;
  content: string;
}
