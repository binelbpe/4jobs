export interface User {
  id: string;
  name: string;
  profileImage?: string;
}

export interface Message {
  id: string;
  senderId: string;
  recipientId: string;
  content: string;
  createdAt: string;
  isRead: boolean;
  sender: User;
  recipient: User;
  status: 'sent' | 'delivered' | 'read';
}