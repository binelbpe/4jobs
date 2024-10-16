import { UserVideoCall } from '../../../entities/UserVideoCall';

export interface IUserVideoCallRepository {
  create(callerId: string, recipientId: string): Promise<UserVideoCall>;
  updateStatus(callId: string, status: 'accepted' | 'rejected' | 'ended'): Promise<UserVideoCall>;
  getActiveCall(userId: string): Promise<UserVideoCall | null>;
}
