export interface User {
  id: string;
  name: string;
  profileImage?: string;
}

export interface Message {
  id: string;
  sender: {
    id: string;
    email: string;
    name: string;
    profileImage: string;
  };
  recipient: {
    id: string;
    email: string;
    name: string;
    profileImage: string;
  };
  content: string;
  createdAt: string;
  isRead: boolean;
  status: 'sent' | 'delivered' | 'read';
}
