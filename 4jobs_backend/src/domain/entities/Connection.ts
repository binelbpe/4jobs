import { User } from '../../domain/entities/User';

export class Connection {
  constructor(
    public id: string,
    public requesterId: string,
    public recipientId: string,
    public status: 'pending' | 'accepted' | 'rejected',
    public createdAt: Date
  ) {}
}

export interface ConnectionRequest {
  id: string;
  requester: {
    id: string;
    name: string;
    profileImage: string;
    headline: string;
    bio: string;
  };
  status:string;
}

export interface RawConnection {
  _id: string;
  requester: {
    _id: string;
    name: string;
    profileImage?: string;
    about?: string;
    bio?: string;
  };
}