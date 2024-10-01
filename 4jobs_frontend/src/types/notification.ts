export interface Notification {
  _id: string;
  type: string;
  message: string;
  isRead: boolean;
  notificationData:{
    createdAt: string,
id: string,
isRead:boolean, 
message:string;
  }
  createdAt: string;
  requester?: {
    id: string;
    name: string;
  };
}