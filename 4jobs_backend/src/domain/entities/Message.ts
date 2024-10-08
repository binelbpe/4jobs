import { User } from './User';

export interface Message {
  id: string;
  sender: User | string;
  recipient: User | string;
  content: string;
  createdAt: Date;
  isRead: boolean;
  status: 'sent' | 'delivered' | 'read';
}