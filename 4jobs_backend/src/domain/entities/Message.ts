import { MUser } from './User';

export interface Message {
  id: string;
  sender: MUser;
  recipient: MUser;
  content: string;
  createdAt: Date;
  isRead: boolean;
  status: 'sent' | 'delivered' | 'read';
}
